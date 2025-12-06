#!/bin/bash
# Complete VM Deployment Script - Fix CORS Issues
# Run this on the VM to fix all CORS problems

set -e  # Exit on error

echo "=========================================="
echo "VM Deployment - CORS Fix Script"
echo "=========================================="

# 1. Pull latest code
echo "Step 1: Pulling latest code..."
cd ~/SoftwareArchitecture_Project
git pull origin main

# 2. Create .env for auth-user-monorepo
echo "Step 2: Creating .env file for auth-user services..."
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo

cat > .env << 'EOF'
# Database Configuration (PostgreSQL for Auth/User services)
DB_HOST=postgres
DB_PORT=5432
DB_USER=zalo_auth_user
DB_PASS=zalo_auth_pass123
DB_NAME=zalo_auth_db
DB_DIALECT=postgres

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10

# CORS Configuration - CRITICAL for production!
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://34.124.227.173:3000,http://frontend:80,http://34.124.227.173

# Rate Limiting
LOGIN_RATE_LIMIT_WINDOW_MS=60000
LOGIN_RATE_LIMIT_MAX=5

# Email Configuration (optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=shophandmade3@gmail.com
MAIL_PASS=your-app-password-here

# Service Ports
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
EOF

echo "✅ .env file created"
cat .env | grep CORS

# 3. Run database migration for phone verification
echo "Step 3: Running database migrations..."
POSTGRES_CONTAINER=$(docker ps -qf "name=postgres")
if [ -n "$POSTGRES_CONTAINER" ]; then
  docker exec -i $POSTGRES_CONTAINER psql -U postgres -d zalo_auth_db <<EOF
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMP;
EOF
  echo "✅ Database migrations complete"
else
  echo "⚠️ PostgreSQL container not found, skipping migrations"
fi

# 4. Restart auth-user services
echo "Step 4: Restarting auth-user services..."
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo
docker compose down
docker compose up -d

echo "✅ Auth-user services restarted"

# 5. Rebuild and restart backend
echo "Step 5: Rebuilding backend service..."
cd ~/SoftwareArchitecture_Project
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend

echo "✅ Backend service restarted"

# 6. Rebuild and restart frontend
echo "Step 6: Rebuilding frontend service..."
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend

echo "✅ Frontend service restarted"

# 7. Verify all services are running
echo "Step 7: Verifying services..."
echo ""
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Testing CORS:"
echo "1. Open http://34.124.227.173:3000"
echo "2. Check browser console - should have NO CORS errors"
echo "3. Try to login - should work without errors"
echo ""
echo "Check logs:"
echo "  docker logs <auth-container> --tail 50"
echo "  docker logs <user-container> --tail 50"
echo "  docker logs <backend-container> --tail 50"
echo "  docker logs <frontend-container> --tail 50"
echo ""
