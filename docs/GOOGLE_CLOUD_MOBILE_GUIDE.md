# Google Cloud Platform Integration Guide

## ✅ Diagrams Updated for Google Cloud Platform & Mobile App

All architecture diagrams have been updated to reflect:
1. **Google Cloud Platform** as the cloud provider
2. **Mobile Application** support (iOS & Android)

---

## 📱 Mobile App Integration

### Added to Diagrams:
- **System Context View**: Separate mobile user actor
- **Building Block View**: React Native mobile application
- **Layered Architecture**: Mobile app in presentation layer
- **Deployment View**: Mobile device deployment

### Technology Stack:
- **Framework**: React Native
- **Platforms**: iOS and Android
- **Code Sharing**: Shared business logic with web app
- **API**: Same REST API + WebSocket as web

---

## ☁️ Google Cloud Platform Services

### 1. **Compute Engine**
- **Purpose**: Host Node.js backend application
- **Configuration**: VM instance running Ubuntu/Debian
- **Features**: Auto-scaling, load balancing

### 2. **Cloud SQL (PostgreSQL)**
- **Purpose**: Store user data and relationships
- **Features**: 
  - Automated backups
  - High availability
  - Secure connections
  
### 3. **MongoDB Atlas (or Cloud Firestore)**
- **Purpose**: Store chat messages and conversations
- **Options**:
  - MongoDB Atlas (Google Cloud region)
  - Cloud Firestore (native Google solution)

### 4. **Memorystore for Redis**
- **Purpose**: Session management and caching
- **Features**:
  - Low latency
  - High availability
  - Automatic failover

### 5. **Google Cloud Storage**
- **Purpose**: Store images, videos, documents
- **Features**:
  - Scalable object storage
  - CDN integration
  - Cost-effective

### 6. **Additional Services (Optional)**
- **Cloud Functions**: Serverless background tasks
- **Cloud Pub/Sub**: Real-time messaging queue
- **Cloud CDN**: Content delivery network
- **Cloud Monitoring**: Application monitoring
- **Cloud Logging**: Centralized logging

---

## 🏗️ Architecture Overview

```
Users (Web + Mobile)
        ↓
Google Cloud Load Balancer
        ↓
Compute Engine (Node.js App)
        ↓
    ┌───┴───┬────────┬─────────┐
    ↓       ↓        ↓         ↓
Cloud SQL  MongoDB  Redis  Cloud Storage
(Users)   (Messages) (Cache) (Files)
```

---

## 📊 Updated Diagrams Summary

### 1. System Context View
- ✅ Added: Mobile user actor
- ✅ Updated: Google Cloud Storage reference

### 2. Building Block View
- ✅ Added: Mobile Application (React Native)
- ✅ Updated: Storage to Google Cloud Storage
- ✅ Added: Notes about Google Cloud deployment

### 3. Layered Architecture
- ✅ Added: Mobile App in Presentation Layer
- ✅ Updated: Infrastructure layer mentions Google Cloud

### 4. Deployment View
- ✅ Added: Mobile Device node
- ✅ Updated: Cloud provider to Google Cloud Platform
- ✅ Updated: Storage to Google Cloud Storage
- ✅ Added: Specific Google Cloud services in notes

---

## 💰 Cost Estimation (Student/Small Scale)

### Google Cloud Free Tier:
- **Compute Engine**: 1 f1-micro instance (always free)
- **Cloud Storage**: 5GB free storage
- **Cloud SQL**: Not included in free tier
- **Memorystore**: Not included in free tier

### Monthly Cost Estimate (Small Scale):
- **Compute Engine**: $5-10 (small VM)
- **Cloud SQL**: $10-15 (db-f1-micro)
- **MongoDB Atlas**: $0 (Free tier M0)
- **Memorystore**: $15-20 (Basic tier)
- **Cloud Storage**: $1-2 (for 10GB)
- **Bandwidth**: $5-10

**Total**: ~$40-60/month (with free tier benefits)

### Student Benefits:
- **Google Cloud for Students**: $300 credit
- **GitHub Student Pack**: Additional credits
- **Firebase Free Tier**: For mobile app backend

---

## 🚀 Deployment Steps

### 1. Setup Google Cloud Project
```bash
# Install Google Cloud SDK
gcloud init
gcloud auth login

# Create project
gcloud projects create zalo-clone-project
gcloud config set project zalo-clone-project
```

### 2. Deploy Backend to Compute Engine
```bash
# Create VM instance
gcloud compute instances create zalo-backend \
  --machine-type=e2-medium \
  --zone=asia-southeast1-a

# SSH into instance
gcloud compute ssh zalo-backend

# Install Node.js and dependencies
```

### 3. Setup Cloud SQL (PostgreSQL)
```bash
# Create PostgreSQL instance
gcloud sql instances create zalo-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast1
```

### 4. Setup Cloud Storage
```bash
# Create storage bucket
gsutil mb -c STANDARD -l asia-southeast1 gs://zalo-clone-files/

# Set public access for files
gsutil iam ch allUsers:objectViewer gs://zalo-clone-files/
```

### 5. Deploy Mobile App
- Build for iOS: `react-native run-ios`
- Build for Android: `react-native run-android`
- Deploy to App Store / Google Play

---

## 🔒 Security Best Practices

### Google Cloud Security:
- ✅ Enable **Cloud IAM** for access control
- ✅ Use **VPC** for network isolation
- ✅ Enable **Cloud Armor** for DDoS protection
- ✅ Use **Secret Manager** for API keys
- ✅ Enable **HTTPS** with SSL certificates
- ✅ Use **Cloud KMS** for encryption keys

### Mobile App Security:
- ✅ Store tokens securely (Keychain/KeyStore)
- ✅ Implement certificate pinning
- ✅ Obfuscate code
- ✅ Use HTTPS only
- ✅ Implement biometric authentication

---

## 📱 Mobile App Features

### Cross-Platform Benefits:
- **Code Sharing**: 90% code reused between iOS/Android
- **Faster Development**: Single codebase
- **Consistent UX**: Same look and feel
- **Easy Maintenance**: Update once, deploy to both

### Mobile-Specific Features:
- Push notifications (Firebase Cloud Messaging)
- Camera integration
- Photo/video capture
- File access
- Biometric authentication
- Offline support (with local storage)

---

## 📖 Documentation Files

- `diagrams/architecture_diagrams/system_context.puml` - ✅ Updated
- `diagrams/architecture_diagrams/building_block_view.puml` - ✅ Updated
- `diagrams/architecture_diagrams/layered_architecture.puml` - ✅ Updated
- `diagrams/architecture_diagrams/deployment_view.puml` - ✅ Updated

---

## 🎯 Next Steps

1. ✅ Review updated diagrams
2. ⬜ Setup Google Cloud Platform account
3. ⬜ Apply for student credits
4. ⬜ Create mobile app project with React Native
5. ⬜ Deploy backend to Google Cloud
6. ⬜ Test web and mobile apps

---

**Cloud Provider**: Google Cloud Platform ☁️  
**Mobile Support**: iOS & Android 📱  
**Status**: Diagrams Updated ✅  
**Date**: October 18, 2025