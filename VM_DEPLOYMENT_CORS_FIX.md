# VM Deployment - CORS Fix Guide

## Issue
Multiple CORS errors on production VM:
- Auth service (/auth/login)
- User service (/user/friends)
- Backend API (/api/*)

## Root Cause
The `.env` file doesn't exist on the VM (it's gitignored), so services are using default CORS settings that don't include the production URL.

## Solution

### 1. Create .env file for auth-user-monorepo

SSH to VM and run:

```bash
cd ~/SoftwareArchitecture_Project/zalo-clone/src/auth-user-monorepo

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

# CORS Configuration - CRITICAL!
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://34.124.227.173:3000,http://frontend:80

# Rate Limiting
LOGIN_RATE_LIMIT_WINDOW_MS=60000
LOGIN_RATE_LIMIT_MAX=5

# Email Configuration (optional - for phone verification)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=shophandmade3@gmail.com
MAIL_PASS=your-app-password-here

# Service Ports
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
EOF
```

### 2. Verify docker-compose.prod.yml CORS setting

The backend service should already have:
```yaml
CORS_ORIGIN: http://34.124.227.173:3000,http://frontend:80
```

### 3. Restart all services

```bash
# Restart auth-user monorepo services
cd ~/SoftwareArchitecture_Project/zalo-clone/src/auth-user-monorepo
docker compose down
docker compose up -d

# Restart main backend (if needed)
cd ~/SoftwareArchitecture_Project/zalo-clone
docker compose -f docker-compose.prod.yml restart backend

# Rebuild and restart frontend (to get new nginx config)
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### 4. Verify services are running

```bash
# Check all containers
docker ps

# Check auth service logs
docker logs <auth-container-name> --tail 50

# Check user service logs  
docker logs <user-container-name> --tail 50

# Check frontend logs
docker logs <frontend-container-name> --tail 50
```

### 5. Test from browser

Open `http://34.124.227.173:3000` and try to login.

Check browser console - there should be no more CORS errors.

## What Changed

1. **Auth Service (port 3001)**: Now accepts requests from `http://34.124.227.173:3000`
2. **User Service (port 3002)**: Now accepts requests from `http://34.124.227.173:3000`
3. **Backend Service (port 6000)**: Already configured in docker-compose.prod.yml
4. **Frontend nginx**: Now proxies `/auth/` and `/users/` to the respective services

## Debugging

If CORS errors persist:

```bash
# Test auth service directly
curl -X POST http://34.124.227.173:3001/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://34.124.227.173:3000" \
  -d '{"email":"test@test.com","password":"password"}' \
  -v

# Check if CORS headers are present in response
# Should see: Access-Control-Allow-Origin: http://34.124.227.173:3000

# Test user service
curl -X GET http://34.124.227.173:3002/user/friends \
  -H "Origin: http://34.124.227.173:3000" \
  -H "Authorization: Bearer <token>" \
  -v
```
