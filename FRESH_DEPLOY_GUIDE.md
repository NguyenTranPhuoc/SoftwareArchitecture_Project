# Fresh Deployment Guide - VM Setup from Scratch

**Target Commit**: `77fdaf6` (Fixed version without verification)  
**Date**: December 7, 2025  
**VM IP**: 34.124.227.173

## Overview

This guide walks through a complete fresh deployment on your GCP VM, starting from scratch. We'll remove the email verification code that exists at commit 77fdaf6 and set up a clean registration system.

---

## Phase 1: Clean Up Existing Deployment (5 minutes)

### 1.1 SSH into VM
```bash
ssh your-vm-user@34.124.227.173
```

### 1.2 Stop and Remove All Containers
```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo
docker-compose down -v  # -v removes volumes too
cd ~
```

### 1.3 Remove Old Repository
```bash
rm -rf ~/SoftwareArchitecture_Project
```

### 1.4 Clean Docker Resources (Optional but Recommended)
```bash
# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f
```

---

## Phase 2: Fresh Repository Clone (3 minutes)

### 2.1 Clone Repository
```bash
cd ~
git clone https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git
cd SoftwareArchitecture_Project
```

### 2.2 Verify Commit
```bash
git log --oneline -5
# Should show: 77fdaf6 Fix ERR_UNSAFE_PORT by using relative URLs instead of localhost
```

---

## Phase 3: Fix Backend Email Verification Bug (10 minutes)

**CRITICAL**: Commit 77fdaf6 still has email verification code in the backend. We need to remove it manually.

### 3.1 Edit authService.js

```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo/auth-service/src/services
nano authService.js
```

**Find this section** (around line 10-30):
```javascript
const createUser = async ({ email, password, full_name }) => {
  const password_hash = await hashPassword(password);
  const crypto = require("crypto");
  const verification_token = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    email,
    password_hash,
    full_name,
    verification_token,
    is_verified: false
  });

  const emailService = require("./emailService");
  emailService.sendVerificationEmail(user.email, user.verification_token)
    .catch(console.error);

  return user;
};
```

**Replace with**:
```javascript
const createUser = async ({ email, password, full_name }) => {
  const password_hash = await hashPassword(password);

  const user = await User.create({
    email,
    password_hash,
    full_name,
    is_verified: true  // Auto-verify users
  });

  return user;
};
```

**Changes Made**:
-  Removed `crypto` and `verification_token` generation
-  Removed `verification_token` field from User.create
-  Changed `is_verified: false`  `is_verified: true`
-  Removed `emailService.sendVerificationEmail()` call

Save and exit: `Ctrl+X`, `Y`, `Enter`

### 3.2 Edit authController.js

```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo/auth-service/src/controllers
nano authController.js
```

**Find this line** (around line 20-30):
```javascript
return res.status(201).json({ 
  message: "Registration successful. Please check your email to verify your account." 
});
```

**Replace with**:
```javascript
return res.status(201).json({ 
  message: "Registration successful. You can now login." 
});
```

Save and exit: `Ctrl+X`, `Y`, `Enter`

### 3.3 Commit the Fix
```bash
cd ~/SoftwareArchitecture_Project
git add .
git commit -m "fix: Remove email verification from registration at commit 77fdaf6"
git push origin main
```

---

## Phase 4: Database Setup (5 minutes)

### 4.1 Install PostgreSQL Client (if needed)
```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
```

### 4.2 Start Database Container
```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo
docker-compose up -d postgres
sleep 10  # Wait for PostgreSQL to initialize
```

### 4.3 Verify PostgreSQL is Running
```bash
docker ps | grep postgres
docker logs auth-user-monorepo_postgres_1 --tail 20
```

### 4.4 Create Database Schema
```bash
docker exec -i auth-user-monorepo_postgres_1 psql -U zalouser -d zalodb < ~/SoftwareArchitecture_Project/src/auth-user-monorepo/scripts/init-postgres.sql
```

### 4.5 Verify Tables Created
```bash
docker exec -it auth-user-monorepo_postgres_1 psql -U zalouser -d zalodb -c "\dt"
# Should show: users, refresh_tokens, groups, group_members, etc.
```

---

## Phase 5: Environment Configuration (3 minutes)

**IMPORTANT**: The .env file is gitignored and won't be in the cloned repository. You must create it manually on the VM.

### 5.0 Verify No .env File Exists
```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo
ls -la .env  # Should show: No such file or directory
```

### 5.1 Create .env File for Auth Service
```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo
cat > .env << '\''EOF'\''
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=zalouser
DB_PASSWORD=zalopass
DB_NAME=zalodb

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Service Ports
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
CHAT_SERVICE_PORT=3003

# CORS Configuration
CORS_ORIGIN=http://34.124.227.173:3000,http://localhost:3000

# Email Configuration (Optional - not used anymore)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@zaloapp.com
EOF
```

### 5.2 Set Proper Permissions
```bash
chmod 600 .env
```

---

## Phase 6: Build and Start Services (10 minutes)

### 6.1 Start Redis
```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo
docker-compose up -d redis
sleep 5
```

### 6.2 Build and Start Auth Services
```bash
docker-compose up -d --build auth-service user-service
sleep 20  # Wait for services to initialize
```

### 6.3 Verify Services are Running
```bash
docker ps
# Should show: postgres, redis, auth-service, user-service
```

### 6.4 Check Service Logs
```bash
# Auth Service
docker logs auth-user-monorepo_auth-service_1 --tail 30

# User Service
docker logs auth-user-monorepo_user-service_1 --tail 30

# Look for:
#  "Auth-service listening on port 3001"
#  "Database connected successfully"
#  "Redis connected"
#  No errors about email configuration
```

---

## Phase 7: Frontend Deployment (5 minutes)

### 7.1 Navigate to Frontend Directory
```bash
cd ~/SoftwareArchitecture_Project
```

### 7.2 Build Frontend (if using Docker)
```bash
docker build -f Dockerfile.frontend -t zalo-frontend .
```

### 7.3 Start Frontend Container
```bash
docker run -d \
  --name zalo_frontend \
  -p 3000:80 \
  --network auth-user-monorepo_default \
  zalo-frontend
```

**OR** if using docker-compose for frontend:
```bash
cd ~/SoftwareArchitecture_Project
docker-compose -f docker-compose.prod.yml up -d frontend
```

### 7.4 Verify Frontend is Running
```bash
docker ps | grep frontend
docker logs zalo_frontend --tail 20
```

---

## Phase 8: Testing (5 minutes)

### 8.1 Health Check - Backend Services
```bash
# Auth Service Health
curl http://localhost:3001/health

# User Service Health
curl http://localhost:3002/health
```

### 8.2 Test Registration via API
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '\''{"email": "testuser@example.com","password": "SecurePass123","full_name": "Test User"}'\''

# Expected Response:
# {"message": "Registration successful. You can now login."}
```

### 8.3 Test Login via API
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '\''{"email": "testuser@example.com","password": "SecurePass123"}'\''

# Expected Response with accessToken and refreshToken
```

### 8.4 Test Frontend via Browser
1. Open browser: `http://34.124.227.173:3000`
2. Click "Register" or navigate to registration form
3. Fill in: Email, Password, Username, Display Name
4. Click "Register"
5. **Expected**: "Registration successful. You can now login."
6. **NOT Expected**:  "Please check your email to verify"
7. Login immediately with credentials

---

## Phase 9: Verification & Troubleshooting

### 9.1 Verify Database Entries
```bash
docker exec -it auth-user-monorepo_postgres_1 psql -U zalouser -d zalodb

# Check users table
SELECT id, email, full_name, is_verified, created_at FROM users;
# Should show is_verified = true

\q
```

### 9.2 Common Issues

**Issue 1: "Please check your email" message still appears**
```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo
docker-compose down
docker-compose up -d --build
```

**Issue 2: Services not starting**
```bash
docker logs auth-user-monorepo_auth-service_1 --tail 50
docker logs auth-user-monorepo_postgres_1 --tail 50
```

**Issue 3: Cannot connect to database**
```bash
docker exec -it auth-user-monorepo_postgres_1 psql -U zalouser -d zalodb -c "SELECT 1;"
docker network inspect auth-user-monorepo_default
```

---

## Quick Command Reference

```bash
# View all containers
docker ps -a

# View all logs
docker-compose logs -f

# Restart specific service
docker-compose restart auth-service

# Rebuild and restart
docker-compose up -d --build auth-service

# Check database
docker exec -it auth-user-monorepo_postgres_1 psql -U zalouser -d zalodb

# Remove everything and start over
docker-compose down -v
docker system prune -a -f
```

---

## Timeline: ~50 minutes total

**Success Criteria**:
 Registration without verification prompt  
 Immediate login after registration  
 No email service errors in logs  
 Database shows `is_verified=true`  
 All services healthy and responding

---

**Last Updated**: December 7, 2025  
**Tested On**: GCP VM, Commit 77fdaf6 + verification fix


