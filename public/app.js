const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const health = document.getElementById("health");
const refreshButton = document.getElementById("refreshButton");

async function loadHealth() {
  try {
    const response = await fetch("/health");
    const data = await response.json();
    health.textContent = data.status === "UP" ? "API Online" : "API Down";
  } catch {
    health.textContent = "API Offline";
  }
}

async function loadTasks() {
  const response = await fetch("/api/tasks");
  const tasks = await response.json();

  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = "<p>No tasks available.</p>";
    return;
  }

  tasks.forEach((task) => {
    const article = document.createElement("article");
    article.className = "task";

    article.innerHTML = `
      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description)}</p>
      <div class="meta">
        Status: ${escapeHtml(task.status)} |
        Priority: ${escapeHtml(task.priority)} |
        Due: ${escapeHtml(task.dueDate || "Not set")}
      </div>
      <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
    `;

    taskList.appendChild(article);
  });
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const task = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    priority: document.getElementById("priority").value,
    status: document.getElementById("status").value,
    dueDate: document.getElementById("dueDate").value
  };

  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(task)
  });

  if (response.ok) {
    form.reset();
    loadTasks();
  }
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

refreshButton.addEventListener("click", loadTasks);

loadHealth();
loadTasks();