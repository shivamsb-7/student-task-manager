# Student Task Manager

A simple Node.js + Express web application designed as the common application for DOSSL Assignments 3-8.

## Technology Stack

- Node.js
- Express
- HTML, CSS, JavaScript
- Jest + Supertest
- Docker
- Kubernetes / Minikube
- Jenkins
- Prometheus
- Grafana

## Important Design

The application intentionally uses a simple in-memory task store. No database is required, so the same project can be used to learn Jenkins, Docker, Kubernetes, CI testing, and monitoring without introducing an unrelated database setup.

## Project Structure

```text
student-task-manager/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── scripts/
│   └── build.js
├── tests/
│   └── app.test.js
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── monitoring/
│   └── prometheus.yml
├── server.js
├── package.json
├── Dockerfile
├── .dockerignore
├── .gitignore
├── Jenkinsfile
└── README.md
```

## Local Setup

```bash
npm install
npm run build
npm test
npm start
```

Open:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/health
```

Metrics:

```text
http://localhost:3000/metrics
```

## Development Mode

```bash
npm run dev
```

## Useful API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /health | Application health |
| GET | /api/tasks | List tasks |
| GET | /api/tasks/:id | Get one task |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /metrics | Prometheus metrics |

## Build

```bash
npm run build
```

The build copies the frontend from `public/` to `dist/`.

## Test

```bash
npm test
```

## Docker

```bash
docker build -t student-task-manager:1.0 .
docker run -d --name student-task-manager -p 3000:3000 student-task-manager:1.0
```

Open:

```text
http://localhost:3000
```

## Kubernetes / Minikube

The Kubernetes files are prepared for Assignment 5.

```bash
minikube start
minikube image load student-task-manager:1.0
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get pods
kubectl get services
minikube service student-task-manager-service
```

Scale:

```bash
kubectl scale deployment student-task-manager --replicas=3
kubectl get pods
```

## Jenkins

The `Jenkinsfile` is prepared for Assignment 6. Assignment 3 uses the same application with a Jenkins Freestyle Project.

Typical Freestyle build commands:

```bash
npm ci
npm run build
```

Assignment 6 adds:

```bash
npm test -- --runInBand
```

## Prometheus

The application exposes `/metrics`.

Example:

```text
http://localhost:3000/metrics
```

The Kubernetes Prometheus configuration is in:

```text
monitoring/prometheus.yml
```

## Important Workflow

```text
Local Development
      ↓
GitHub
      ↓
Assignment 3: Jenkins Freestyle Build
      ↓
Assignment 4: Docker Image
      ↓
Assignment 5: Kubernetes Deployment + Scaling
      ↓
Assignment 6: Jenkins Pipeline + Automated Tests
      ↓
Assignment 7: Prometheus Monitoring
      ↓
Assignment 8: Grafana Visualization
```
