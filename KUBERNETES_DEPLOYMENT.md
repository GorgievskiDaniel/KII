# Kubernetes Deployment Guide

## Prerequisites
- Kubernetes cluster (local or remote)
- `kubectl` configured to access your cluster
- Docker images built and pushed to `ghcr.io` (via GitHub Actions CI/CD)

## Option 1: Enable Kubernetes on Docker Desktop (Fastest for Local Testing)

1. Open Docker Desktop
2. Go to **Settings** → **Kubernetes**
3. Check "Enable Kubernetes"
4. Wait for Kubernetes to start (may take 2-5 minutes)
5. Verify with:
   ```bash
   kubectl cluster-info
   kubectl get nodes
   ```

## Option 2: Use Minikube (Local Kubernetes)

```bash
# Install Minikube (if not already installed)
# macOS: brew install minikube
# Windows: Download from https://github.com/kubernetes/minikube/releases
# Linux: curl -Lo minikube https://github.com/kubernetes/minikube/latest/download/minikube-linux-amd64

# Start Minikube cluster
minikube start --driver=docker

# Set kubectl context
kubectl config use-context minikube

# Verify
kubectl cluster-info
```

## Option 3: Use a Remote Kubernetes Cluster
- AWS EKS, Google GKE, Azure AKS, DigitalOcean, etc.
- Configure `kubectl` with your cluster credentials

---

## Deployment Steps

### 1. Update Image Names (if using local registry)

If using Docker Desktop or Minikube **without** pushing to ghcr.io:

```bash
cd k8s/

# Edit backend-deployment.yaml and frontend-deployment.yaml
# Change:
#   image: ghcr.io/GorgievskiDaniel/kii-proekt-backend:latest
# To:
#   image: kii-proekt-backend:latest

# Then build and load into local Docker:
docker compose build backend frontend
```

For **ghcr.io images**, you may need to configure image pull secrets (optional if public registry).

### 2. Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

Verify:
```bash
kubectl get namespace kii-proekt
```

### 3. Apply Configuration and Secrets

```bash
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-secret.yaml
```

Verify:
```bash
kubectl get configmap -n kii-proekt
kubectl get secret -n kii-proekt
```

### 4. Deploy Database (StatefulSet)

```bash
kubectl apply -f k8s/db-service.yaml
kubectl apply -f k8s/db-statefulset.yaml
```

Wait for the database pod to be ready:
```bash
kubectl wait --for=condition=Ready pod -l app=db -n kii-proekt --timeout=300s
```

Verify:
```bash
kubectl get statefulset -n kii-proekt
kubectl get pods -n kii-proekt
kubectl logs db-0 -n kii-proekt  # Check database logs
```

### 5. Deploy Backend

```bash
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
```

Wait for backend to be ready:
```bash
kubectl wait --for=condition=Ready pod -l app=backend -n kii-proekt --timeout=300s
```

Verify:
```bash
kubectl get deployment -n kii-proekt
kubectl get pods -n kii-proekt
kubectl logs -l app=backend -n kii-proekt  # Check backend logs
```

Test backend health:
```bash
kubectl port-forward svc/backend 8080:8080 -n kii-proekt &
curl http://localhost:8080/actuator/health
```

### 6. Deploy Frontend

```bash
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

Wait for frontend to be ready:
```bash
kubectl wait --for=condition=Ready pod -l app=frontend -n kii-proekt --timeout=300s
```

Verify:
```bash
kubectl get pods -n kii-proekt
kubectl logs -l app=frontend -n kii-proekt  # Check frontend logs
```

### 7. Apply Ingress (Optional)

```bash
kubectl apply -f k8s/ingress.yaml
```

Verify:
```bash
kubectl get ingress -n kii-proekt
```

If using **Docker Desktop** or **Minikube**, no external IP is assigned. Use port-forward instead (see below).

---

## Accessing the Application

### Option A: Port Forward (All Platforms)

Forward frontend to local port 3000:
```bash
kubectl port-forward svc/frontend 3000:80 -n kii-proekt
```

Then open browser: **http://localhost:3000**

### Option B: Ingress (External IP Required)

Add to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
<INGRESS_IP> kii-proekt.local
```

Then access: **http://kii-proekt.local**

To find ingress IP:
```bash
kubectl get ingress -n kii-proekt
```

---

## Monitoring and Debugging

### View All Resources
```bash
kubectl get all -n kii-proekt
```

### Check Pod Logs
```bash
# Backend logs
kubectl logs -f deployment/backend -n kii-proekt

# Frontend logs
kubectl logs -f deployment/frontend -n kii-proekt

# Database logs
kubectl logs -f statefulset/db -n kii-proekt
```

### Describe Pod (for error details)
```bash
kubectl describe pod <POD_NAME> -n kii-proekt
```

### Execute Command in Pod
```bash
# Access backend shell
kubectl exec -it deployment/backend -n kii-proekt -- /bin/bash

# Access database shell
kubectl exec -it db-0 -n kii-proekt -- mysql -u root -p
# Password: check secret with: kubectl get secret backend-secret -n kii-proekt -o yaml
```

### Check Persistent Volume
```bash
kubectl get pv
kubectl get pvc -n kii-proekt
```

---

## Delete Deployment

To remove all resources:
```bash
kubectl delete namespace kii-proekt
```

Or selectively:
```bash
kubectl delete -f k8s/
```

---

## Troubleshooting

### Image Pull Errors
If using `ghcr.io` and getting "ImagePullBackOff":
```bash
# Create a pull secret if your ghcr.io image is private
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<YOUR_GITHUB_USERNAME> \
  --docker-password=<YOUR_GITHUB_PAT> \
  --docker-email=<YOUR_EMAIL> \
  -n kii-proekt

# Then add to backend-deployment.yaml and frontend-deployment.yaml:
# imagePullSecrets:
# - name: ghcr-secret
```

### Database Connection Issues
```bash
# Port forward to database
kubectl port-forward svc/db 3306:3306 -n kii-proekt

# Test connection
mysql -h 127.0.0.1 -u root -p
# Password is in: kubectl get secret backend-secret -n kii-proekt -o jsonpath='{.data.MYSQL_PASSWORD}' | base64 --decode
```

### Backend Health Check Failing
```bash
# Check if actuator is responding
kubectl port-forward svc/backend 8080:8080 -n kii-proekt
curl http://localhost:8080/actuator/health
```

---

## One-Liner Deployment (After Prerequisites)

```bash
kubectl apply -f k8s/ && \
kubectl wait --for=condition=Ready pod -l app=db -n kii-proekt --timeout=300s && \
kubectl wait --for=condition=Ready pod -l app=backend -n kii-proekt --timeout=300s && \
kubectl wait --for=condition=Ready pod -l app=frontend -n kii-proekt --timeout=300s && \
echo "✅ All pods ready! Use: kubectl port-forward svc/frontend 3000:80 -n kii-proekt"
```

---

## GitHub Actions Automated Deployment

If you set the `KUBE_CONFIG_DATA` secret in GitHub:

1. Encode your kubeconfig:
   ```bash
   cat ~/.kube/config | base64
   ```

2. Add to GitHub Secrets:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Create secret: `KUBE_CONFIG_DATA` = `<base64_encoded_kubeconfig>`

3. On next push to `main`, the CI/CD pipeline will:
   - Build Docker images
   - Push to ghcr.io
   - Automatically deploy to your cluster using `kubectl apply -f k8s/`
