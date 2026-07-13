# DevBoard Task Manager (DevOps Sandbox)

This repository contains the pure developer source code for a 3-tier task management web application. 

**Your mission is to configure all the DevOps components from scratch.**

## Architecture Overview

```
Browser (Client)  →  Frontend (React/Vite)  →  Backend (Go API)  →  Database (PostgreSQL)
```

- **Frontend (`/frontend`)**: A React SPA that communicates with the backend.
- **Backend (`/backend`)**: A Go REST API that handles logic and connects to the database.
- **Database (`/init/postgres`)**: SQL files to seed the PostgreSQL database.

---

## 🚀 The DevOps Roadmap

To make this application production-ready, you need to configure the following DevOps layers. There is no pre-built configuration here; you must build it yourself!

### Step 1: Dockerization (Containerization)
Your first goal is to containerize the application so it can run anywhere without manually installing Go or Node.

1. **Backend `Dockerfile`**: Create a `Dockerfile` in the `/backend` directory. Use a multi-stage build (`golang:alpine` to build, `alpine` to run).
2. **Frontend `Dockerfile`**: Create a `Dockerfile` in the `/frontend` directory. Use a multi-stage build (`node:alpine` to build the static assets, and `nginx:alpine` to serve them).
3. **`docker-compose.yml`**: Create a `docker-compose.yml` in the root folder to orchestrate 3 services:
   - `postgres` (using the official `postgres:16` image and mounting the `/init/postgres` folder to `/docker-entrypoint-initdb.d`).
   - `backend` (using your backend Dockerfile). It must connect to postgres.
   - `frontend` (using your frontend Dockerfile). It must be exposed on port `8080`.

### Step 2: CI/CD (GitHub Actions)
Once your Dockerfiles work locally, you need to automate the building and testing process using CI/CD pipelines (e.g., GitHub Actions in a `.github/workflows` directory).

1. **Continuous Integration**: Write a pipeline that automatically runs `npm run lint` or `go test` every time someone pushes to the repository.
2. **Continuous Deployment**: Write a pipeline that automatically builds your Docker images and pushes them to Docker Hub.

### Step 3: DevSecOps (Code Quality & Security)
Integrate security into your pipelines to ensure your code and containers are safe.

1. **SAST (SonarQube)**: Set up a SonarQube server and configure a step in your CI/CD pipeline to scan your Go and React code for bugs and vulnerabilities.
2. **Container Scanning (Trivy)**: Add a step in your CI/CD pipeline to scan your built Docker images for vulnerable dependencies before they are pushed to Docker Hub.

### Step 4: Container Orchestration (Kubernetes)
Docker Compose is only for local testing. For production, you need Kubernetes (K8s).

1. Create a `k8s/` folder.
2. Write **Deployments** for your frontend, backend, and database to ensure they are always running.
3. Write **Services** so the pods can communicate with each other.
4. Write an **Ingress** to route external HTTP traffic to your frontend.

### Step 5: Observability & Monitoring
In production, you need to know if the app is healthy.

1. Deploy **Prometheus** to collect CPU and memory metrics from your containers.
2. Deploy **Grafana** to create a visual dashboard of those metrics.
3. Use the **ELK Stack** (Elasticsearch, Logstash, Kibana) or **Loki** to centralize logs from your Go backend so you can search them easily.
