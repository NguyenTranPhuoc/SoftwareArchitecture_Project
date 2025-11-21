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
├── src/                          # Source code
│   ├── client/                   # Frontend React web application
│   ├── server/                   # Backend Node.js application
│   └── shared/                   # Shared code between client/server
│
├── docs/                         # Documentation
│   ├── GCP_SETUP_GUIDE.md        # GCP deployment guide
│   ├── CHAT_UPLOAD_GUIDE.md      # Chat upload API
│   ├── IMAGE_DISPLAY_GUIDE.md    # Image display guide
│   ├── DEPLOYMENT_FIX.md         # Deployment fixes
│   ├── TROUBLESHOOTING.md        # Common issues
│   └── DEVOPS_ACTION_PLAN.md     # DevOps action plan
│
├── public/                       # Static files for testing
│   ├── index.html                # Test homepage
│   ├── chat-demo.html            # Chat interface demo
│   └── chat-upload-test.html     # Upload test page
│
├── diagrams/                     # PlantUML architectural diagrams
│   ├── architecture_diagrams/    # System architecture views
│   ├── database_diagrams/        # Database design
│   └── workflow_diagrams/        # Runtime behavior
│
├── tasks/                        # Team task distribution
│
├── tests/                        # Test suites
│   ├── client/                   # Frontend tests
│   ├── server/                   # Backend tests
│   └── integration/              # Integration tests
│
└── Requirement_EN.md             # Project requirements
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

### Installation
```bash
# Clone repository
git clone https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git
cd SoftwareArchitecture_Project

# Install dependencies (when available)
npm install

# Setup environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Documentation

### Deployment and DevOps
- **[GCP Setup Guide](docs/GCP_SETUP_GUIDE.md)** - Deploy to Google Cloud Platform
- **[Deployment Fix](docs/DEPLOYMENT_FIX.md)** - Deployment troubleshooting
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[DevOps Action Plan](docs/DEVOPS_ACTION_PLAN.md)** - DevOps tasks

### Chat Upload Feature
- **[Chat Upload Guide](docs/CHAT_UPLOAD_GUIDE.md)** - File upload API documentation
- **[Image Display Guide](docs/IMAGE_DISPLAY_GUIDE.md)** - Display images in chat

### Architecture
- **[Architecture Justification](docs/architecture_docs/Architecture_Justification.md)** - Architecture decisions

### Requirements
- **[Requirements (English)](Requirement_EN.md)** - Project requirements

## Demo and Testing

**Live Server**: http://34.124.227.173:5000

**Test Pages**:
- Homepage: http://34.124.227.173:5000/
- Chat Demo: http://34.124.227.173:5000/chat-demo.html
- Upload Test: http://34.124.227.173:5000/chat-upload-test.html

