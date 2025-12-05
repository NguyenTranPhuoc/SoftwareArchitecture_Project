#!/bin/bash

# Zalo Clone Deployment Script for GCP VM
# This script automates the deployment process

set -e  # Exit on error

echo "========================================="
echo "Zalo Clone - Deployment Script"
echo "========================================="

# Get VM IP
VM_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")
echo "VM IP: $VM_IP"

# Stop existing services
echo ""
echo "[1/8] Stopping existing services..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
cd src/auth-user-monorepo && docker compose down 2>/dev/null || true
cd ../..

# Pull latest code (if using git)
echo ""
echo "[2/8] Pulling latest code..."
git pull || echo "Not a git repository, skipping..."

# Update environment variables
echo ""
echo "[3/8] Updating environment variables..."
sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://$VM_IP:6000|g" src/client/webapp/.env.production
sed -i "s|VITE_AUTH_URL=.*|VITE_AUTH_URL=http://$VM_IP:3001|g" src/client/webapp/.env.production
sed -i "s|VITE_USER_URL=.*|VITE_USER_URL=http://$VM_IP:3002|g" src/client/webapp/.env.production

# Update CORS
sed -i "s|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=http://$VM_IP:3000,http://$VM_IP:3001,http://$VM_IP:3002,http://$VM_IP:6000,http://localhost:3000|g" src/auth-user-monorepo/.env

# Build frontend
echo ""
echo "[4/8] Building frontend..."
cd src/client/webapp
npm install
npm run build
cd ../../..

# Build Docker images
echo ""
echo "[5/8] Building Docker images..."
docker compose -f docker-compose.prod.yml build

# Start main services
echo ""
echo "[6/8] Starting main services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for databases to be ready
echo ""
echo "[7/8] Waiting for databases..."
sleep 10

# Start auth services
echo ""
echo "[8/8] Starting auth services..."
cd src/auth-user-monorepo
docker compose up -d
cd ../..

# Show status
echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Services Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Access your application at:"
echo "  Frontend: http://$VM_IP:3000"
echo "  Backend:  http://$VM_IP:6000"
echo "  Auth:     http://$VM_IP:3001"
echo "  User:     http://$VM_IP:3002"
echo ""
echo "Check logs with:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
