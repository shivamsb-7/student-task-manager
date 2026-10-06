const express = require("express");
const path = require("path");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const tasks = [
  {
    id: 1,
    title: "Complete DevOps Assignment 3",
    description: "Configure Jenkins Freestyle build",
    status: "Pending",
    priority: "High",
    dueDate: "2026-10-05"
  },
  {
    id: 2,
    title: "Practice Docker commands",
    description: "Build and run the application image",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2026-10-08"
  }
];

let nextId = 3;

const register = new client.Registry();
client.collectDefaultMetrics({
  register,
  prefix: "task_manager_"
});

const httpRequests = new client.Counter({
  name: "task_manager_http_requests_total",
  help: "Total number of HTTP requests handled by the application",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

const activeTasks = new client.Gauge({
  name: "task_manager_tasks_total",
  help: "Current number of tasks stored by the application",
  registers: [register]
});

const requestTimer = new client.Histogram({
  name: "task_manager_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const route = req.route?.path || req.path;
    const status = String(res.statusCode);
    const duration = Number(process.hrtime.bigint() - start) / 1e9;

    httpRequests.inc({
      method: req.method,
      route,
      status_code: status
    });

    requestTimer.observe(
      {
        method: req.method,
        route,
        status_code: status
      },
      duration
    );

    activeTasks.set(tasks.length);
  });

  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/api/tasks/:id", (req, res) => {
  const task = tasks.find((item) => item.id === Number(req.params.id));

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const { title, description = "", status = "Pending", priority = "Medium", dueDate = "" } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    description: description.trim(),
    status,
    priority,
    dueDate
  };

  tasks.push(task);
  res.status(201).json(task);
});

app.put("/api/tasks/:id", (req, res) => {
  const task = tasks.find((item) => item.id === Number(req.params.id));

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const allowed = ["title", "description", "status", "priority", "dueDate"];

  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  }

  if (!task.title || !task.title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const index = tasks.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  const deleted = tasks.splice(index, 1)[0];
  res.json(deleted);
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const distPath = path.join(__dirname, "dist");
const publicPath = path.join(__dirname, "public");

if (process.env.NODE_ENV === "production" && require("fs").existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  app.use(express.static(publicPath));
}

app.get("*splat", (req, res) => {
  const indexPath =
    process.env.NODE_ENV === "production" && require("fs").existsSync(path.join(distPath, "index.html"))
      ? path.join(distPath, "index.html")
      : path.join(publicPath, "index.html");

  res.sendFile(indexPath);
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Student Task Manager running on port ${PORT}`);
  });
}

module.exports = app;