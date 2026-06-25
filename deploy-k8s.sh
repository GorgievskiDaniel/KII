#!/bin/bash
# Kubernetes Deployment Script for kii-proekt
# This script automates the deployment process

set -e

NAMESPACE="kii-proekt"
TIMEOUT=300

echo "🚀 Starting Kubernetes deployment for kii-proekt..."
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    echo "Please install kubectl first: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check cluster connectivity
echo "🔍 Checking Kubernetes cluster..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "Please ensure your cluster is running and kubectl is configured"
    exit 1
fi
echo "✅ Connected to Kubernetes cluster"
echo ""

# Create namespace
echo "📦 Creating namespace: $NAMESPACE..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
echo "✅ Namespace ready"
echo ""

# Apply all manifests
echo "🔧 Deploying resources..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-configmap.yaml
kubectl apply -f k8s/backend-secret.yaml
kubectl apply -f k8s/db-service.yaml
kubectl apply -f k8s/db-statefulset.yaml

# Wait for database
echo "⏳ Waiting for database pod to be ready..."
kubectl wait --for=condition=Ready pod -l app=db -n $NAMESPACE --timeout=${TIMEOUT}s || {
    echo "❌ Database pod failed to start"
    kubectl logs db-0 -n $NAMESPACE
    exit 1
}
echo "✅ Database ready"
echo ""

# Deploy backend
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml

echo "⏳ Waiting for backend pod to be ready..."
kubectl wait --for=condition=Ready pod -l app=backend -n $NAMESPACE --timeout=${TIMEOUT}s || {
    echo "❌ Backend pod failed to start"
    kubectl logs -l app=backend -n $NAMESPACE
    exit 1
}
echo "✅ Backend ready"
echo ""

# Deploy frontend
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml

echo "⏳ Waiting for frontend pod to be ready..."
kubectl wait --for=condition=Ready pod -l app=frontend -n $NAMESPACE --timeout=${TIMEOUT}s || {
    echo "❌ Frontend pod failed to start"
    kubectl logs -l app=frontend -n $NAMESPACE
    exit 1
}
echo "✅ Frontend ready"
echo ""

# Apply ingress (optional)
if kubectl apply -f k8s/ingress.yaml 2>/dev/null; then
    echo "✅ Ingress configured"
else
    echo "⚠️  Ingress not available (may require ingress controller)"
fi
echo ""

# Display deployment summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Deployment Status:"
kubectl get all -n $NAMESPACE
echo ""
echo "🌐 Access Application:"
echo "   Run: kubectl port-forward svc/frontend 3000:80 -n $NAMESPACE"
echo "   Then open: http://localhost:3000"
echo ""
echo "📝 View Logs:"
echo "   Backend:  kubectl logs -f deployment/backend -n $NAMESPACE"
echo "   Frontend: kubectl logs -f deployment/frontend -n $NAMESPACE"
echo "   Database: kubectl logs -f statefulset/db -n $NAMESPACE"
echo ""
echo "🧹 To cleanup:"
echo "   kubectl delete namespace $NAMESPACE"
echo ""
