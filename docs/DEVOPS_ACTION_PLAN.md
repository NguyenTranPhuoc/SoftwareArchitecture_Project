# DevOps Action Plan - Prioritized Tasks

**Your Role**: DevOps & Database Administrator  
**Timeline**: 2 weeks remaining  
**Status**: Backend partially working, databases need setup

---

## 🚨 CRITICAL - Do This Week

### Day 1-2: MongoDB Setup (URGENT) ⚠️
**Why**: Chat features are completely blocked without MongoDB

**Actions:**
1. **Install MongoDB Community Server**
   - Download: https://www.mongodb.com/try/download/community
   - Choose: Windows MSI installer
   - ✅ Install as Windows Service
   - ✅ Run as Network Service user
   - ✅ Data Directory: `C:\Program Files\MongoDB\Server\8.0\data`
   - ❌ Uncheck "Install MongoDB Compass" (you already have it)

2. **Verify Installation**
   ```powershell
   # Check service is running
   Get-Service -Name MongoDB
   
   # Test connection
   & "C:\Program Files\MongoDB\Server\8.0\bin\mongosh.exe"
   ```

3. **Create Database Structure**
   ```javascript
   // Connect with MongoDB Compass or mongosh
   use zalo_chat
   
   // Create collections
   db.createCollection('conversations')
   db.createCollection('messages')
   
   // Create indexes
   db.messages.createIndex({ conversation_id: 1, timestamp: -1 })
   db.messages.createIndex({ sender_id: 1 })
   db.conversations.createIndex({ participants: 1 })
   ```

4. **Test Server Connection**
   ```bash
   npm run dev:server
   # Should see: ✓ MongoDB connection test passed
   ```

**Time**: 2-3 hours  
**Deliverable**: MongoDB running, server fully operational

---

### Day 3-4: Google Cloud Platform Setup (HIGH PRIORITY) 🌐

**Why**: Need cloud infrastructure for production deployment

**Actions:**

#### 1. Create GCP Account (30 min)
```
1. Go to: https://console.cloud.google.com
2. Sign in with Gmail
3. Accept free trial ($300 credit for 90 days)
4. Create project: "zalo-clone-project"
```

#### 2. Enable Required APIs (15 min)
```
APIs & Services → Library → Enable:
- Compute Engine API
- Cloud SQL Admin API  
- Cloud Storage API
- Cloud Memorystore for Redis API
```

#### 3. Create Service Account (30 min)
```bash
# In GCP Console
1. IAM & Admin → Service Accounts
2. Create Service Account: "zalo-backend-sa"
3. Roles: 
   - Storage Admin
   - Cloud SQL Client
   - Compute Instance Admin
4. Create Key → JSON
5. Download: service-account-key.json
6. Save to: zalo-clone/config/gcp-credentials.json
```

#### 4. Install Google Cloud SDK (30 min)
```powershell
# Download from: https://cloud.google.com/sdk/docs/install-sdk
# Then run:
gcloud init
gcloud auth login
gcloud config set project zalo-clone-project
```

**Time**: 2 hours  
**Deliverable**: GCP account ready, service account created

---

### Day 5-7: Cloud SQL PostgreSQL Migration (MEDIUM) 💾

**Why**: Move from local PostgreSQL to cloud for team access

**Actions:**

#### 1. Create Cloud SQL Instance
```bash
# Via Cloud Console:
Cloud SQL → Create Instance → PostgreSQL
- Instance ID: zalo-postgres
- Password: [SAVE SECURELY!]
- Database Version: PostgreSQL 15
- Region: asia-southeast1 (Singapore - closest to Vietnam)
- Machine type: db-f1-micro (FREE TIER)
- Storage: 10GB HDD
- Networking: Public IP
```

#### 2. Configure Access
```bash
# Add your IP to authorized networks
# Get your IP: https://whatismyipaddress.com
# Cloud SQL → zalo-postgres → Connections → Add Network
```

#### 3. Migrate Database
```powershell
# Export from local PostgreSQL
$env:PGPASSWORD="214789635"
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -d zalo_db > zalo_db_backup.sql

# Import to Cloud SQL
gcloud sql connect zalo-postgres --user=postgres
# Then in psql:
CREATE DATABASE zalo_db;
\c zalo_db
\i zalo_db_backup.sql
```

#### 4. Update .env
```env
# Replace local connection with Cloud SQL
DATABASE_URL=postgresql://postgres:PASSWORD@CLOUD_SQL_IP:5432/zalo_db
```

**Time**: 3-4 hours  
**Deliverable**: PostgreSQL running on GCP, accessible by all team members

---

## 📅 IMPORTANT - Do Next Week

### Day 8-10: Backend Deployment (HIGH) 🚀

**Why**: Team needs a live API to test against

**Actions:**

#### 1. Create Compute Engine VM
```bash
# Via Console:
Compute Engine → Create Instance
- Name: zalo-backend-server
- Region: asia-southeast1
- Machine type: e2-micro (FREE TIER)
- Boot disk: Ubuntu 22.04 LTS, 10GB
- Firewall: ✅ Allow HTTP, ✅ Allow HTTPS
```

#### 2. Setup Server Environment
```bash
# SSH into VM
gcloud compute ssh zalo-backend-server

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone repository
git clone https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git
cd SoftwareArchitecture_Project/zalo-clone
npm install
```

#### 3. Configure Environment
```bash
# Create .env on server
nano .env
# Copy contents from your local .env
# Update DATABASE_URL to Cloud SQL
# Update MONGODB_URI to Atlas (if using)
```

#### 4. Start Application
```bash
# Build TypeScript
npm run build:server

# Start with PM2
pm2 start dist/server.js --name zalo-backend
pm2 save
pm2 startup

# Configure firewall
sudo ufw allow 5000
```

#### 5. Test Deployment
```bash
# Get external IP
gcloud compute instances list

# Test health endpoint
curl http://EXTERNAL_IP:5000/health
```

**Time**: 4-5 hours  
**Deliverable**: Backend API accessible at `http://YOUR_IP:5000`

---

### Day 11-12: Cloud Storage Setup (MEDIUM) 📦

**Why**: Need storage for user avatars and chat files

**Actions:**

#### 1. Create Storage Bucket
```bash
# Create bucket
gsutil mb -p zalo-clone-project -l asia-southeast1 gs://zalo-user-uploads

# Set public access
gsutil iam ch allUsers:objectViewer gs://zalo-user-uploads

# Create folder structure
gsutil -m cp -r empty_folder gs://zalo-user-uploads/avatars/
gsutil -m cp -r empty_folder gs://zalo-user-uploads/chat-images/
gsutil -m cp -r empty_folder gs://zalo-user-uploads/chat-files/
```

#### 2. Implement Upload Service
```typescript
// Create: src/server/services/uploadService.ts
import { Storage } from '@google-cloud/storage';
import path from 'path';

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: path.join(__dirname, '../../config/gcp-credentials.json')
});

const bucket = storage.bucket(process.env.GCS_BUCKET || 'zalo-user-uploads');

export const uploadFile = async (
  file: Express.Multer.File,
  folder: 'avatars' | 'chat-images' | 'chat-files'
): Promise<string> => {
  const fileName = `${folder}/${Date.now()}_${file.originalname}`;
  const blob = bucket.file(fileName);

  const stream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      console.error('Upload error:', error);
      reject(error);
    });

    stream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    stream.end(file.buffer);
  });
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  const fileName = fileUrl.split(`${bucket.name}/`)[1];
  await bucket.file(fileName).delete();
};
```

#### 3. Create Upload Endpoints
```typescript
// Add to src/server/routes/upload.ts
import express from 'express';
import multer from 'multer';
import { uploadFile } from '../services/uploadService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const url = await uploadFile(req.file, 'avatars');
    res.json({ success: true, url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload chat file
router.post('/chat-file', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const folder = req.file.mimetype.startsWith('image/') ? 'chat-images' : 'chat-files';
    const url = await uploadFile(req.file, folder);
    res.json({ success: true, url });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
```

**Time**: 3-4 hours  
**Deliverable**: File upload API working, files stored in GCP

---

### Day 13-14: Monitoring & Documentation (LOW-MEDIUM) 📊

**Why**: Need to monitor production and help team troubleshoot

**Actions:**

#### 1. Setup Cloud Logging
```bash
# Already enabled by default in GCP
# View logs:
gcloud logging read "resource.type=gce_instance" --limit 50
```

#### 2. Create Health Check Dashboard
```typescript
// Add to server.ts
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      postgres: 'checking',
      mongodb: 'checking',
      redis: 'checking'
    }
  };

  try {
    await pgPool.query('SELECT 1');
    health.services.postgres = 'connected';
  } catch (error) {
    health.services.postgres = 'error';
    health.status = 'degraded';
  }

  try {
    await mongoClient.db('admin').command({ ping: 1 });
    health.services.mongodb = 'connected';
  } catch (error) {
    health.services.mongodb = 'error';
    health.status = 'degraded';
  }

  res.status(health.status === 'ok' ? 200 : 503).json(health);
});
```

#### 3. Create Deployment Documentation
Create: `DEPLOYMENT.md` with:
- API endpoint URLs
- Database connection strings
- Environment variables needed
- Deployment commands
- Troubleshooting guide

#### 4. Setup Team Access
```bash
# Share these with team:
- API URL: http://YOUR_IP:5000
- PostgreSQL: Host, Port, Database, User, Password
- MongoDB URI: mongodb://... or Atlas connection string
- GCS Bucket: zalo-user-uploads
- Service Account Key: (share securely)
```

**Time**: 3-4 hours  
**Deliverable**: Monitoring setup, complete documentation

---

## 📝 Optional (If Time Permits)

### Redis Setup
```bash
# Option 1: Cloud Memorystore (NOT FREE)
# Skip for now, use if budget allows

# Option 2: Redis Labs Free Tier
# Go to: https://redis.com/try-free/
# Create free database (30MB)
# Get connection string
```

### CI/CD Pipeline
```yaml
# Create: .github/workflows/deploy.yml
name: Deploy to GCP

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to VM
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.GCP_VM_IP }}
          username: ${{ secrets.GCP_VM_USER }}
          key: ${{ secrets.GCP_SSH_KEY }}
          script: |
            cd SoftwareArchitecture_Project/zalo-clone
            git pull
            npm install
            npm run build:server
            pm2 restart zalo-backend
```

### Database Backups
```bash
# Create: scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL backup
gcloud sql export sql zalo-postgres gs://zalo-backups/postgres_$DATE.sql \
  --database=zalo_db

# Schedule with cron
# crontab -e
# 0 2 * * * /path/to/backup.sh
```

---

## 📋 Checklist Progress

### Week 1 (Critical):
- [ ] MongoDB installed and running
- [ ] GCP account created and configured
- [ ] Cloud SQL PostgreSQL migrated
- [ ] Service account created
- [ ] Team can access cloud databases

### Week 2 (Important):
- [ ] Backend deployed to Compute Engine
- [ ] API accessible via public IP
- [ ] Cloud Storage bucket created
- [ ] File upload API working
- [ ] Health monitoring setup
- [ ] Documentation complete

---

## 🚨 Common Issues & Quick Fixes

### MongoDB won't start:
```powershell
# Check service
Get-Service MongoDB

# Start service
Start-Service MongoDB

# If fails, check logs at:
# C:\Program Files\MongoDB\Server\8.0\log\mongod.log
```

### Can't connect to Cloud SQL:
```bash
# Check your IP is whitelisted
# Get IP: curl ifconfig.me
# Add to Cloud SQL → Connections → Authorized networks
```

### VM deployment fails:
```bash
# Check firewall
sudo ufw status
sudo ufw allow 5000

# Check PM2 logs
pm2 logs zalo-backend

# Restart application
pm2 restart zalo-backend
```

### File upload fails:
```bash
# Verify service account has permissions
# IAM → Service Accounts → zalo-backend-sa
# Should have "Storage Admin" role
```

---

## 🎯 Success Criteria

By end of Week 2:
- ✅ All databases accessible by team
- ✅ Backend API deployed and running
- ✅ File uploads working
- ✅ Health check endpoint working
- ✅ Documentation complete
- ✅ All team members can connect
- ✅ Staying within free tier budget

---

## 📞 Team Communication

### Share with team:

**API Endpoints:**
```
Production API: http://YOUR_VM_IP:5000
Health Check: http://YOUR_VM_IP:5000/health
API Info: http://YOUR_VM_IP:5000/api
```

**Database Connections:**
```env
# PostgreSQL (Cloud SQL)
DATABASE_URL=postgresql://postgres:PASSWORD@CLOUD_SQL_IP:5432/zalo_db

# MongoDB (Local or Atlas)
MONGODB_URI=mongodb://localhost:27017/zalo_chat
# OR
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/zalo_chat

# Google Cloud Storage
GCS_BUCKET=zalo-user-uploads
```

**Testing Credentials:**
```
Test User 1: test1@example.com / password123
Test User 2: test2@example.com / password123
```

---

## 💰 Budget Tracking

**Free Tier Limits:**
- ✅ Compute Engine: 1 e2-micro instance (24/7)
- ✅ Cloud SQL: 1 db-f1-micro instance (24/7)
- ✅ Cloud Storage: 5GB
- ❌ Memorystore: NOT in free tier (skip for now)

**Estimated Costs (if exceed free tier):**
- Compute Engine e2-micro: ~$7/month
- Cloud SQL db-f1-micro: ~$7/month
- Cloud Storage: $0.02/GB/month

**Total**: Should stay FREE with proper setup!

---

**Priority**: Fix MongoDB TODAY, then move to GCP setup  
**Time Remaining**: ~2 weeks  
**Status**: Ready to execute! 🚀
