# Zalo Clone - Software Architecture Project

A comprehensive real-time messaging application inspired by Zalo, designed and implemented as a software architecture exercise for university coursework.

**Repository**: https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project

---

## Architecture Overview

This project demonstrates a **Layered Architecture** with **MVC pattern**, showcasing modern software engineering principles and practices suitable for enterprise-level applications.

### Key Features
- Real-time messaging with WebSocket support
- User authentication and profile management
- Friend/contact management system
- Group chat functionality
- Multimedia file sharing (images, videos, documents)
- Mobile app support (iOS & Android)

## Project Structure

```
zalo-clone/
├── 📂 src/                          # Source code
│   ├── 📂 client/                   # Frontend React web application
│   ├── 📂 server/                   # Backend Node.js application
│   └── 📂 shared/                   # Shared code between client/server
│
├── 📂 docs/                         # Documentation
│   ├── 📂 api/                      # API documentation
│   ├── 📂 architecture/             # Architecture documentation
│   └── 📂 user-guide/               # User guides
│
├── 📂 diagrams/                     # PlantUML architectural diagrams
│   ├── 📂 architecture_diagrams/    # System architecture views
│   ├── 📂 database_diagrams/        # Database design
│   └── 📂 workflow_diagrams/        # Runtime behavior
│
├── 📂 tasks/                        # Team task distribution (5 members)

│
├── 📂 tests/                        # Test suites
│   ├── 📂 client/                   # Frontend tests
│   ├── 📂 server/                   # Backend tests
│   └── 📂 integration/              # Integration tests
│
└── 📋 Requirement_EN.md             # Project requirements
```

## Architecture Highlights

### 1. **Layered Architecture**
- **Presentation Layer**: React.js web + React Native mobile
- **API Layer**: Express.js with authentication middleware
- **Business Logic Layer**: Core services with domain logic
- **Data Access Layer**: Repository pattern
- **Infrastructure Layer**: External services (Google Cloud)

### 2. **Services Design**
- Authentication Service
- User Management Service
- Chat Service (Real-time messaging)
- Media Service (File handling)

### 3. **Database Strategy**
- **PostgreSQL**: User data and relationships
- **MongoDB**: Chat messages and conversations
- **Redis**: Caching and sessions
- **Google Cloud Storage**: File storage

## Technology Stack

### Frontend
- **React.js** with TypeScript (Web)
- **React Native** with Expo (Mobile)
- **Socket.io-client** for real-time communication
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express.js
- **Socket.io** for WebSocket connections
- **JWT** for authentication
- **TypeScript** for type safety

### Cloud & DevOps
- **Google Cloud Platform**
  - Compute Engine (Application hosting)
  - Cloud SQL (PostgreSQL)
  - Memorystore (Redis)
  - Cloud Storage (File storage)
- **Firebase Hosting** (Frontend deployment)

## Architecture Diagrams

The project includes comprehensive PlantUML diagrams following the **ARC42** documentation standard:

1. **System Context View** - External system interactions
2. **Building Block View** - Internal component structure
3. **Layered Architecture** - Layer organization
4. **Deployment View** - Google Cloud infrastructure
5. **Entity Relationship** - Database design
6. **Runtime Views** - Authentication, messaging, group chat workflows

##  Team Structure (5 Members )

- **Huynh Nhu**: User + Auth + Postgres
- **Nhan**:  Chat + Redis + MongoDB
- **Manh**:  Frontend app + Google Could
- **Quynh Nhu**: Frontend web + Google Cloud
- **Phuoc**: DevOps & Database Admin (Google Cloud Platform)

See detailed task breakdown in the [`tasks/`](tasks/) folder.

## Getting Started

### Quick Start with Docker (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git
cd SoftwareArchitecture_Project

# 2. Install dependencies
npm install

# 3. Setup environment variables (already configured for Docker)
cp .env.example .env

# 4. Start all databases with Docker
docker-compose up -d

# 5. Build and start the server
npm run build:server
npm run start:server
```

**Server running at**: http://localhost:5000

**Database UIs**:
- PostgreSQL Admin: http://localhost:5050 (admin@zalo.com / admin123)
- MongoDB Express: http://localhost:8081 (admin / admin123)
- RedisInsight: http://localhost:8001

### Manual Setup

If you prefer manual installation without Docker, see **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for detailed instructions.

## Available Scripts

```bash
# Backend Development
npm run dev:server          # Start dev server with hot reload
npm run build:server        # Build TypeScript to JavaScript
npm run start:server        # Start production server

# Frontend Development
npm run dev:client          # Start React development server

# Testing & Quality
npm test                    # Run tests
npm run lint                # Run linter
```

## Test Users

The database is pre-populated with test users (password: `password123`):
- alice@example.com
- bob@example.com
- charlie@example.com
- nhan@example.com

## Documentation

### Setup & Deployment
- 📘 **[Setup Guide](SETUP_GUIDE.md)** - Complete local development setup
- 📗 **[GCP Setup Guide](GCP_SETUP_GUIDE.md)** - Google Cloud deployment
- 📙 **[Claude AI Guide](CLAUDE.md)** - Project structure and guidelines

### Implementation Details
- 🔵 **[Nhan's Chat Service](NHAN_CHAT_SERVICE.md)** - Chat implementation with MongoDB & Redis
- 🟢 **Huynh Nhu's User Management** - Coming soon
- 🟡 **Frontend Implementation** - Coming soon

### Architecture
- **[Architecture Justification](docs/architecture_docs/Architecture_Justification.md)** - Design decisions
- **[Requirements](Requirement_EN.md)** - Functional and non-functional requirements

## API Endpoints

Once the server is running, you can access:

- **Health Check**: `GET /health`
- **API Info**: `GET /api`
- **Conversations**: `POST/GET /api/conversations`
- **Messages**: `POST/GET /api/messages`


## Project Status

✅ **Completed**:
- Server infrastructure with Express + Socket.io
- Multi-database setup (PostgreSQL, MongoDB, Redis)
- Chat service with real-time messaging
- Docker development environment
- Database initialization scripts

🚧 **In Progress**:
- User authentication (Huynh Nhu)
- Frontend web app (Quynh Nhu)
- Mobile app (Manh)
- GCP production deployment (Phuoc)

