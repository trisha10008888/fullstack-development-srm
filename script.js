// ===== ELEMENTS =====

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");

const total = document.getElementById("totalTasks");
const completed = document.getElementById("completedTasks");
const pending = document.getElementById("pendingTasks");
const progress = document.getElementById("progressPercent");

const todayCount = document.getElementById("todayCount");
const upcomingCount = document.getElementById("upcomingCount");
const completedCount = document.getElementById("completedCount");
const trashCount = document.getElementById("trashCount");

const navItems = document.querySelectorAll(".nav-item");
const filters = document.querySelectorAll(".filter");

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const sectionTitle = document.getElementById("taskSectionTitle");
const addContainer = document.getElementById("addTaskContainer");
const filterBox = document.getElementById("taskFilters");


// ===== DATA =====

let tasks = JSON.parse(localStorage.getItem("tasklyTasks")) || [];
let currentView = "all";
let currentFilter = "all";

const today = new Date().toISOString().split("T")[0];

dateInput.value = today;
dateInput.min = today;


// ===== STORAGE =====

function save() {
    localStorage.setItem("tasklyTasks", JSON.stringify(tasks));
}


// ===== ADD TASK =====

function addTask() {

    const text = taskInput.value.trim();

    if (!text) return;

    tasks.push({
        id: Date.now(),
        text: text,
        category: categoryInput.value,
        date: dateInput.value || today,
        completed: false,
        deleted: false
    });

    save();

    taskInput.value = "";
    categoryInput.value = "Academic";
    dateInput.value = today;

    refresh();
}

addBtn.onclick = addTask;

taskInput.onkeydown = e => {
    if (e.key === "Enter") addTask();
};


// ===== GET TASKS =====

function getTasks() {

    let list = tasks.filter(t => !t.deleted);

    if (currentView === "today")
        list = list.filter(t => t.date === today);

    if (currentView === "upcoming")
        list = list.filter(t => t.date > today);

    if (currentView === "completed")
        list = list.filter(t => t.completed);

    if (currentView === "all") {

        if (currentFilter === "active")
            list = list.filter(t => !t.completed);

        if (currentFilter === "completed")
            list = list.filter(t => t.completed);
    }

    if (currentView === "trash")
        return tasks.filter(t => t.deleted);

    return list;
}


// ===== DISPLAY TASKS =====

function render() {

    taskList.innerHTML = "";

    const list = getTasks();

    emptyState.style.display =
        list.length ? "none" : "block";

    list.forEach(task => {

        const card = document.createElement("div");
        card.className = "task-item";

        if (task.completed)
            card.classList.add("completed");

        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.text;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const tag = document.createElement("span");
        tag.className = "task-tag";
        tag.textContent = task.category;

        const date = document.createElement("span");
        date.textContent = task.date;

        meta.append(tag, date);
        content.append(title, meta);

        const actions = document.createElement("div");
        actions.className = "task-actions";


        // Trash

        if (task.deleted) {

            const restore = button(
                "Restore",
                "restore-button"
            );

            restore.onclick = () => {
                task.deleted = false;
                save();
                refresh();
            };


            const remove = button(
                "Delete",
                "forever-button"
            );

            remove.onclick = () => {
                tasks = tasks.filter(
                    t => t.id !== task.id
                );
                save();
                refresh();
            };

            actions.append(restore, remove);
            card.append(content, actions);

        }


        // Normal task

        else {

            const check = document.createElement("button");
            check.className = "task-checkbox";

            check.onclick = () => {
                task.completed = !task.completed;
                save();
                refresh();
            };


            const edit = button(
                "✎ Edit",
                "edit-button"
            );

            edit.onclick = () => editTask(task);


            const remove = button(
                "×",
                "delete-button"
            );

            remove.onclick = () => {
                task.deleted = true;
                save();
                refresh();
            };

            actions.append(edit, remove);
            card.append(check, content, actions);
        }

        taskList.appendChild(card);
    });
}


// ===== BUTTON HELPER =====

function button(text, className) {

    const btn = document.createElement("button");

    btn.textContent = text;
    btn.className = className;

    return btn;
}


// ===== EDIT TASK =====

function editTask(task) {

    const card =
        [...taskList.children].find(
            c => c.querySelector(".task-title")?.textContent === task.text
        );

    if (!card) return;

    card.innerHTML = "";

    const box = document.createElement("div");
    box.className = "edit-container";

    const input = document.createElement("input");
    input.className = "edit-title";
    input.value = task.text;

    const options = document.createElement("div");
    options.className = "edit-options";

    const category = document.createElement("select");
    category.className = "edit-category";

    ["Academic", "Personal", "Work", "Other"].forEach(c => {

        const option = document.createElement("option");

        option.value = c;
        option.textContent = c;

        if (c === task.category)
            option.selected = true;

        category.appendChild(option);
    });


    const date = document.createElement("input");

    date.type = "date";
    date.className = "edit-date";
    date.value = task.date;
    date.min = today;


    const saveBtn = button(
        "Save Changes",
        "save-edit-button"
    );

    const cancelBtn = button(
        "Cancel",
        "cancel-edit-button"
    );


    saveBtn.onclick = () => {

        if (!input.value.trim()) return;

        task.text = input.value.trim();
        task.category = category.value;
        task.date = date.value || today;

        save();
        refresh();
    };


    cancelBtn.onclick = render;


    input.onkeydown = e => {

        if (e.key === "Enter")
            saveBtn.click();

        if (e.key === "Escape")
            cancelBtn.click();
    };


    options.append(
        category,
        date,
        saveBtn,
        cancelBtn
    );

    box.append(input, options);
    card.appendChild(box);

    input.focus();
}


// ===== STATISTICS =====

function updateStats() {

    const active = tasks.filter(t => !t.deleted);

    const done =
        active.filter(t => t.completed).length;

    total.textContent = active.length;
    completed.textContent = done;
    pending.textContent = active.length - done;

    progress.textContent =
        active.length
            ? Math.round(done / active.length * 100) + "%"
            : "0%";
}


// ===== SIDEBAR COUNTS =====

function updateCounts() {

    const active = tasks.filter(t => !t.deleted);

    todayCount.textContent =
        active.filter(t => t.date === today).length;

    upcomingCount.textContent =
        active.filter(t => t.date > today).length;

    completedCount.textContent =
        active.filter(t => t.completed).length;

    trashCount.textContent =
        tasks.filter(t => t.deleted).length;
}


// ===== NAVIGATION =====

navItems.forEach(item => {

    item.onclick = () => {

        navItems.forEach(n =>
            n.classList.remove("active")
        );

        item.classList.add("active");

        currentView = item.dataset.view;
        currentFilter = "all";

        filters.forEach(f =>
            f.classList.remove("active-filter")
        );

        filters[0].classList.add("active-filter");

        updatePage();
        render();
    };
});


// ===== FILTERS =====

filters.forEach(filter => {

    filter.onclick = () => {

        if (currentView !== "all") return;

        filters.forEach(f =>
            f.classList.remove("active-filter")
        );

        filter.classList.add("active-filter");

        currentFilter = filter.dataset.filter;

        render();
    };
});


// ===== PAGE CONTENT =====

function updatePage() {

    const pages = {

        all: [
            "Good evening, Trisha.",
            "Let's make today productive.",
            "Your Tasks",
            true,
            "flex"
        ],

        today: [
            "Today's Tasks.",
            "Here's what needs your attention today.",
            "Due Today",
            true,
            "none"
        ],

        upcoming: [
            "Upcoming.",
            "Plan ahead and stay organized.",
            "Upcoming Tasks",
            true,
            "none"
        ],

        completed: [
            "Completed.",
            "A record of everything you've finished.",
            "Completed Tasks",
            false,
            "none"
        ],

        trash: [
            "Trash.",
            "Deleted tasks can be restored or removed permanently.",
            "Recently Deleted",
            false,
            "none"
        ]
    };

    const p = pages[currentView];

    pageTitle.textContent = p[0];
    pageSubtitle.textContent = p[1];
    sectionTitle.textContent = p[2];

    addContainer.style.display =
        p[3] ? "block" : "none";

    filterBox.style.display = p[4];
}


// ===== REFRESH =====

function refresh() {

    render();
    updateStats();
    updateCounts();
}


// ===== DARK MODE =====

const themeButton =
    document.querySelector(".theme-button");

if (localStorage.getItem("tasklyTheme") === "dark")
    document.body.classList.add("dark-mode");

themeButton.onclick = () => {

    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
        "tasklyTheme",
        document.body.classList.contains("dark-mode")
            ? "dark"
            : "light"
    );
};


// ===== START =====

updatePage();
refresh();