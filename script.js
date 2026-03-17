const todo = document.querySelector('.todo');
const inprogress = document.querySelector('.inprogress');
const done = document.querySelector('.done');
const modal = document.querySelector(".modal");
const addNewTaskBtn = document.querySelector(".addNewTaskBtn");
const submit = document.querySelector(".submit");
const textarea = document.querySelector("#task-description");
const taskTitleInput = document.querySelector("#task-title");

let dragElement = null;

if (localStorage.getItem("tasks")) {
    const data = JSON.parse(localStorage.getItem("tasks"));

    for (const colClass in data) {
        const column = document.querySelector(`.${colClass}`);
        if (column) {
            data[colClass].forEach(task => {
                createTaskElement(task.title, task.desc, column);
                if(column === 'done'){
                    task.title.classList.add("strike");
                }
            });
        }
    }
    updateUI();
}

// CORE FUNCTIONS

function createTaskElement(title, desc, column) {
    const template = document.createElement("div");
    template.classList.add("task");
    template.setAttribute("draggable", "true");

    template.innerHTML = `
        <div class="top">
            <h2>${title}</h2>
            <p>${desc}</p>
        </div>
        <div class="bottom">
            <i class="fa-solid fa-trash-can delete"></i>
        </div>
    `;

    // Drag Logic
    template.addEventListener("dragstart", () => {
        dragElement = template;
        template.classList.add("dragging");
    });

    template.addEventListener("dragend", () => {
        template.classList.remove("dragging");
    });

    // Delete Logic
    template.querySelector(".delete").addEventListener("click", () => {
        template.remove();
        updateUI(); 
    });

    column.appendChild(template);
};
function updateUI() {
    const columns = ['todo', 'inprogress', 'done'];
    const tasksData = {};

    columns.forEach(colClass => {
        const columnEl = document.querySelector(`.${colClass}`);
        const tasksInCol = columnEl.querySelectorAll(".task");
        
        // Update the count span
        const countSpan = columnEl.querySelector("#count");
        if (countSpan) countSpan.textContent = tasksInCol.length;

        // Collect data for storage
        tasksData[colClass] = Array.from(tasksInCol).map(t => ({
            title: t.querySelector("h2").innerText,
            desc: t.querySelector("p").innerText
        }));
    });

    localStorage.setItem("tasks", JSON.stringify(tasksData));
}

function addDragEvents(column) {
    column.addEventListener("dragenter", (e) => {
        e.preventDefault();
        column.classList.add("hover-over");
    });

    column.addEventListener("dragleave", (e) => {
        e.preventDefault();
        column.classList.remove("hover-over");
    });

    column.addEventListener("dragover", (e) => {
        e.preventDefault(); // Required to allow drop
    });

    column.addEventListener("drop", (e) => {
        e.preventDefault();
        if (dragElement) {
            column.appendChild(dragElement);
            column.classList.remove("hover-over");
            updateUI(); // Save new positions
        }
    });
}

[todo, inprogress, done].forEach(addDragEvents);

// MODAL & SUBMIT LOGIC //

addNewTaskBtn.addEventListener("click", () => {
    modal.classList.add("active");
    taskTitleInput.focus();
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
});

submit.addEventListener("click", () => {
    const title = taskTitleInput.value.trim();
    const desc = textarea.value.trim();

    if (title !== "") {
        createTaskElement(title, desc, todo);
        
        // Reset and Close
        taskTitleInput.value = "";
        textarea.value = "";
        modal.classList.remove("active");
        
        updateUI(); // Save new task
    }
});

// Shortcut: Enter to submit
textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && modal.classList.contains("active")) {
        e.preventDefault();
        submit.click();
    }
});