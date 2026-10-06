const request = require("supertest");
const app = require("../server");

describe("Student Task Manager API", () => {
  test("GET /health returns UP", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("DOWN");
  });

  test("GET /api/tasks returns an array", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /api/tasks creates a task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Test Jenkins",
        description: "Run Jenkins build",
        priority: "High"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Test Jenkins");
  });

  test("POST /api/tasks rejects an empty title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "" });

    expect(response.statusCode).toBe(400);
  });

  test("GET /metrics exposes Prometheus metrics", async () => {
    const response = await request(app).get("/metrics");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("task_manager_http_requests_total");
  });
});