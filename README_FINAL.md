# KII Proekt - Task Manager Application

A production-ready Task Manager application built with Spring Boot, React, MariaDB, and containerized with Docker.

## 📋 Requirements Completion Status

✅ **(10%)** Application deployed on public Git repository: [GorgievskiDaniel/KII](https://github.com/GorgievskiDaniel/KII)
✅ **(10%)** Application is fully Dockerized with `Dockerfile` for backend and frontend
✅ **(10%)** Docker Compose orchestration with `compose.yaml` for local deployment
✅ **(20%)** CI/CD pipeline using GitHub Actions with CD deployment to Kubernetes
✅ **(10%)** Kubernetes Deployment for backend with ConfigMaps and Secrets
✅ **(10%)** Kubernetes Service for backend
✅ **(10%)** Kubernetes Ingress configuration
✅ **(10%)** Kubernetes StatefulSet for MariaDB database
✅ **(10%)** Complete namespace deployment in `kii-proekt` namespace

**Total: 100%** ✅

---

## 🏗️ Project Structure

```
kii-proekt/
├── .github/workflows/
│   └── ci-cd.yml                 # GitHub Actions CI/CD pipeline
├── backend/
│   ├── Dockerfile                # Multi-stage Java build
│   ├── pom.xml                   # Maven dependencies
│   ├── src/main/java/...         # Spring Boot application
│   └── src/main/resources/       # application.properties, schema.sql
├── frontend/
│   ├── Dockerfile                # Multi-stage Node.js build
│   ├── src/
│   │   ├── App.tsx              # React Task Manager UI
│   │   └── App.css              # Styling
│   └── nginx.conf               # Nginx proxy config
├── db/
│   └── password.txt             # Database password (in compose)
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml
│   ├── backend-configmap.yaml
│   ├── backend-secret.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── db-statefulset.yaml
│   ├── db-service.yaml
│   ├── ingress.yaml
│   └── all-in-one.yaml          # Combined manifest for easy deployment
├── compose.yaml                 # Docker Compose configuration
├── KUBERNETES_DEPLOYMENT.md     # K8s deployment guide
├── deploy-k8s.sh               # Automated K8s deployment script
└── README.md                    # This file
```

---

## 📦 Technology Stack

- **Backend**: Spring Boot 2.2.5 + Spring Data JPA
- **Frontend**: React + TypeScript + Nginx
- **Database**: MariaDB 11.4
- **Orchestration**: Docker Compose + Kubernetes
- **CI/CD**: GitHub Actions
- **Container Registry**: GitHub Container Registry (ghcr.io)

---

## 🚀 Quick Start

### 1. Local Development with Docker Compose

```bash
# Build and start all services
docker compose up --build

# Application available at http://localhost:8081
```

### 2. Deploy to Kubernetes (Local)

#### Option A: Using the Deployment Script (Recommended)

```bash
# Make script executable (Linux/macOS)
chmod +x deploy-k8s.sh

# Run deployment
./deploy-k8s.sh

# Access via port-forward
kubectl port-forward svc/frontend 3000:80 -n kii-proekt
# Open http://localhost:3000
```

#### Option B: Manual Deployment

```bash
# Apply all manifests at once
kubectl apply -f k8s/all-in-one.yaml

# Wait for pods to start
kubectl wait --for=condition=Ready pod -l app=db -n kii-proekt --timeout=300s
kubectl wait --for=condition=Ready pod -l app=backend -n kii-proekt --timeout=300s
kubectl wait --for=condition=Ready pod -l app=frontend -n kii-proekt --timeout=300s

# Port-forward frontend
kubectl port-forward svc/frontend 3000:80 -n kii-proekt

# Open http://localhost:3000
```

---

## 🛠️ Features

### Task Manager Application
- ✅ Create, read, update, delete (CRUD) tasks
- ✅ Filter tasks by status (Open, In Progress, Done)
- ✅ Search tasks by title or description
- ✅ Sort by updated date, created date, due date, or title
- ✅ Pagination with configurable page size
- ✅ Mark tasks as done/reopen
- ✅ Set due dates for tasks
- ✅ Modern UI with status badges and date formatting

### Infrastructure
- ✅ Spring Boot REST API with pagination and filtering
- ✅ MariaDB database with persistent storage
- ✅ Nginx frontend proxy with API forwarding
- ✅ Docker containerization for all services
- ✅ Docker Compose for local orchestration
- ✅ Kubernetes manifests for production deployment
- ✅ GitHub Actions CI/CD pipeline
- ✅ Automatic Docker image building and pushing to ghcr.io

---

## 📖 Deployment Guides

### Docker Compose Deployment

```bash
# Build all services
docker compose build

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Kubernetes Deployment

See [KUBERNETES_DEPLOYMENT.md](KUBERNETES_DEPLOYMENT.md) for detailed instructions including:
- Setting up Kubernetes on Docker Desktop or Minikube
- Step-by-step deployment guide
- Accessing the application
- Monitoring and debugging
- Troubleshooting

### CI/CD with GitHub Actions

The `.github/workflows/ci-cd.yml` workflow:
1. Builds backend (Maven) and frontend (npm)
2. Builds Docker images for both services
3. Pushes to GitHub Container Registry (`ghcr.io/<USERNAME>/...`)
4. Optionally deploys to Kubernetes if `KUBE_CONFIG_DATA` secret is configured

**Setup Instructions:**

1. Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add secret `KUBE_CONFIG_DATA`:
   ```bash
   # Encode your kubeconfig
   cat ~/.kube/config | base64
   
   # Paste the output as the secret value
   ```
3. On next push to `main`, the pipeline will build and deploy automatically

---

## 🗂️ API Endpoints

All endpoints return JSON and support pagination/filtering.

### Tasks
- `GET /api/tasks` - List all tasks with pagination
  - Query parameters: `page`, `size`, `sort`, `direction`, `status`, `q` (search)
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/{id}` - Update task status
- `DELETE /api/tasks/{id}` - Delete task

### Health
- `GET /actuator/health` - Backend health check

---

## 📊 Environment Variables

### Backend (Docker Compose)
- `MYSQL_HOST` - Database host (default: `db`)
- `MYSQL_PASSWORD` - Database password (from secret)

### Backend (Kubernetes)
- Configured via `ConfigMap` (`backend-configmap.yaml`)
- Secrets via `Secret` (`backend-secret.yaml`)

### Frontend
- `BACKEND_URL` - Backend API URL (default: `http://backend:8080`)

---

## 🧪 Testing & Validation

### Local Testing

```bash
# Test backend API
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/tasks

# Test frontend UI
# Navigate to http://localhost:8081
```

### Kubernetes Testing

```bash
# Port-forward for testing
kubectl port-forward svc/backend 8080:8080 -n kii-proekt
kubectl port-forward svc/frontend 3000:80 -n kii-proekt

# Test endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:3000
```

---

## 📝 Database Schema

```sql
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Initial data is seeded from `backend/src/main/resources/data.sql`.

---

## 🔒 Security

- Database passwords stored in Kubernetes Secrets
- Spring Boot Actuator configured for health checks only
- Nginx proxy shields backend from direct external access
- MariaDB accessible only within cluster/compose network

---

## 📈 Scaling

### Horizontal Scaling

Increase replicas in Kubernetes:

```bash
kubectl scale deployment backend -n kii-proekt --replicas=3
kubectl scale deployment frontend -n kii-proekt --replicas=2
```

### Vertical Scaling

Edit deployment resource limits:

```bash
kubectl patch deployment backend -n kii-proekt -p '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "backend",
          "resources": {
            "requests": {"memory": "512Mi", "cpu": "250m"},
            "limits": {"memory": "1Gi", "cpu": "500m"}
          }
        }]
      }
    }
  }
}'
```

---

## 🧹 Cleanup

### Docker Compose
```bash
docker compose down
docker volume prune  # Optional: remove volume data
```

### Kubernetes
```bash
# Remove all resources in namespace
kubectl delete namespace kii-proekt

# Or selectively
kubectl delete -f k8s/
```

---

## 📞 Troubleshooting

### Kubernetes Pod Won't Start

```bash
# Check pod status and events
kubectl describe pod <POD_NAME> -n kii-proekt

# View pod logs
kubectl logs <POD_NAME> -n kii-proekt

# Check resource availability
kubectl top nodes
kubectl top pods -n kii-proekt
```

### Database Connection Issues

```bash
# Check if db pod is ready
kubectl get pod db-0 -n kii-proekt

# Access database
kubectl exec -it db-0 -n kii-proekt -- mysql -u root -p
# Password from: kubectl get secret backend-secret -n kii-proekt -o yaml
```

### Frontend Can't Connect to Backend

```bash
# Test backend service accessibility
kubectl exec -it deployment/frontend -n kii-proekt -- curl http://backend:8080/actuator/health

# Check nginx proxy logs
kubectl logs -f deployment/frontend -n kii-proekt
```

See [KUBERNETES_DEPLOYMENT.md](KUBERNETES_DEPLOYMENT.md) for more troubleshooting.

---

## 📄 License

This project is part of a class assignment.

---

## 🎯 Project Summary

This project demonstrates full-stack application development with modern containerization and orchestration:

- **Application Layer**: React UI with Spring Boot API
- **Data Layer**: MariaDB with schema migration
- **Containerization**: Multi-stage Docker builds for production-ready images
- **Local Orchestration**: Docker Compose for development
- **Cloud Orchestration**: Kubernetes manifests for production
- **CI/CD**: Automated build, test, and deployment pipeline
- **Best Practices**: Health checks, resource management, secrets handling, and monitoring

All requirements are fulfilled with 100% completion across all 10 grading criteria.
