# Kubernetes deployment guide

This folder contains Kubernetes manifests for the `kii-proekt` application.

## Manifests
- `namespace.yaml` - creates the `kii-proekt` namespace
- `backend-configmap.yaml` - backend configuration values
- `backend-secret.yaml` - database password secret
- `db-service.yaml` - headless service for the MariaDB StatefulSet
- `db-statefulset.yaml` - MariaDB database StatefulSet with persistent storage
- `backend-deployment.yaml` - backend deployment using the published Docker image
- `backend-service.yaml` - backend service exposing the Spring Boot app
- `frontend-deployment.yaml` - frontend deployment using the published Docker image
- `frontend-service.yaml` - frontend service exposing the React app
- `ingress.yaml` - ingress for the frontend

## Deploy
1. Replace `<GITHUB_USERNAME>` in `backend-deployment.yaml` and `frontend-deployment.yaml` with your GitHub username.
2. Apply the manifests:

```bash
kubectl apply -f k8s/
```

3. Verify resources:

```bash
kubectl get all -n kii-proekt
```

4. If you use the ingress host `kii-proekt.local`, add a DNS entry or `/etc/hosts` entry for your cluster ingress controller.

## Notes
- The backend uses environment variables from `ConfigMap` and `Secret`.
- The database StatefulSet stores data in a PVC named `db-data`.
- The frontend app should route API requests to the backend service.
