# Chat Server Deployment Guide

## Quick Deploy Chat Server on VM

### Step 1: Create Dockerfile for Chat Server
```bash
cd ~/SoftwareArchitecture_Project
cat > Dockerfile.chat << '\''DOCKERFILE'\''
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/server ./src/server
COPY src/shared ./src/shared
COPY GCS ./GCS

# Build TypeScript
RUN npm run build:server

# Expose port 5000 for chat/socket
EXPOSE 5000

# Start server
CMD ["npm", "run", "start:server"]
DOCKERFILE
```

### Step 2: Create .env for Chat Server
```bash
cat > .env.chat << '\''EOF'\''
# Server Configuration
PORT=5000
NODE_ENV=production

# Database - MongoDB for chat messages
MONGODB_URI=mongodb://mongodb:27017/zalo_chat

# PostgreSQL for user data
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres123
DB_NAME=zalo_clone

# Redis
REDIS_URL=redis://redis:6379

# CORS
CORS_ORIGIN=http://34.124.227.173:3000,http://localhost:3000

# GCS for file uploads
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=./GCS/zola-478416-4990089e3062.json

# JWT (should match auth-service)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
EOF
```

### Step 3: Add Chat Service to docker-compose.yml
```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo

# Add to docker-compose.yml (append to existing file)
cat >> docker-compose.yml << '\''COMPOSE'\''

  mongodb:
    image: mongo:7
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: zalo_chat
    volumes:
      - mongodb-data:/data/db
    ports:
      - "27017:27017"
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('\''ping'\'')"]
      interval: 10s
      timeout: 5s
      retries: 5

  chat-service:
    build:
      context: ../..
      dockerfile: Dockerfile.chat
    env_file:
      - ../../.env.chat
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      mongodb:
        condition: service_healthy
    ports:
      - "5000:5000"
    restart: unless-stopped
    volumes:
      - ../../GCS:/usr/src/app/GCS:ro

volumes:
  postgres-data:
  mongodb-data:
COMPOSE
```

### Step 4: Deploy Chat Service
```bash
cd ~/SoftwareArchitecture_Project/src/auth-user-monorepo

# Build and start all services including chat
docker compose up -d --build

# Check if chat service is running
docker compose ps

# Check logs
docker compose logs chat-service --tail 50

# Test chat service
curl http://localhost:5000/health
```

### Step 5: Update Frontend nginx to proxy WebSocket
The frontend nginx needs to proxy both HTTP and WebSocket requests to chat-service.

Check if nginx config has:
```nginx
location /socket.io/ {
    proxy_pass http://chat-service:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Expected Ports After Deployment:
- 3000: Frontend (nginx)
- 3001: Auth service
- 3002: User service  
- 5000: Chat service + WebSocket
- 5432: PostgreSQL
- 6379: Redis
- 27017: MongoDB

### Verify Chat Works:
1. Login to frontend: http://34.124.227.173:3000
2. Check browser console - WebSocket errors should be gone
3. Try sending a message
4. Check logs: `docker compose logs chat-service -f`

## Troubleshooting:

**MongoDB connection failed:**
```bash
docker compose logs mongodb
docker compose exec mongodb mongosh --eval "db.adminCommand('\''ping'\'')"
```

**Chat service can'\''t connect to MongoDB:**
```bash
# Check network
docker compose exec chat-service ping -c 2 mongodb
# Check env vars
docker compose exec chat-service printenv | grep MONGO
```

**WebSocket still not working:**
- Check nginx config proxies /socket.io/ correctly
- Verify CORS_ORIGIN includes your VM IP
- Check frontend connects to correct URL
