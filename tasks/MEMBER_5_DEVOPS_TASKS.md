# Member 5 Tasks - DevOps & Database Administrator

## ☁️ Your Role
You are responsible for **Infrastructure & Database Management**. You'll set up Google Cloud Platform, configure databases, manage deployments, and ensure everything runs smoothly.

**Estimated Time**: 50 hours over 3 weeks  
**Complexity**: Medium-High  
**Primary Skills Needed**: Google Cloud, PostgreSQL, MongoDB, Redis, Docker (optional)

---

## 📅 Week 1: Cloud & Database Setup (18 hours)

### Day 1-2: Google Cloud Platform Setup (6 hours)
- [ ] Create Google Cloud account (free tier)
- [ ] Create new project: "zalo-clone-project"
- [ ] Enable required APIs:
  - Compute Engine API
  - Cloud SQL API
  - Cloud Storage API
  - Cloud Memorystore (Redis) API
- [ ] Setup billing alerts (stay within free tier)
- [ ] Install Google Cloud SDK on your computer:
  ```bash
  # Download from: https://cloud.google.com/sdk/docs/install
  gcloud init
  gcloud auth login
  gcloud config set project zalo-clone-project
  ```
- [ ] Create service account for the project
- [ ] Download service account key (JSON file)

### Day 3-5: PostgreSQL Setup (6 hours)
- [ ] Create Cloud SQL PostgreSQL instance:
  - Go to Cloud SQL → Create Instance
  - Choose PostgreSQL 15
  - Instance ID: `zalo-postgres`
  - Password: (save securely!)
  - Region: Choose closest to your location
  - Machine type: Lightweight (for free tier)
  - Storage: 10GB
  - Enable Public IP (for development)
  - Add your IP to authorized networks
- [ ] Connect to PostgreSQL:
  ```bash
  gcloud sql connect zalo-postgres --user=postgres
  ```
- [ ] Create database:
  ```sql
  CREATE DATABASE zalo_db;
  \c zalo_db
  ```
- [ ] Create tables for Member 3:
  ```sql
  -- Users table
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Friendships table
  CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2)
  );

  -- Indexes for performance
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_phone ON users(phone);
  CREATE INDEX idx_friendships_user1 ON friendships(user_id_1);
  CREATE INDEX idx_friendships_user2 ON friendships(user_id_2);
  CREATE INDEX idx_friendships_status ON friendships(status);
  ```
- [ ] Test connection from local backend
- [ ] Share connection details with Member 3

### Day 6-7: MongoDB & Redis Setup (6 hours)
- [ ] Setup MongoDB Atlas (Free tier):
  - Go to mongodb.com/cloud/atlas
  - Create account and free cluster
  - Name: `zalo-messages-cluster`
  - Region: Same as Google Cloud
  - Create database user and password
  - Whitelist your IP (0.0.0.0/0 for development)
  - Get connection string
- [ ] Connect and create collections:
  ```javascript
  use zalo_chat;
  
  db.createCollection('conversations');
  db.createCollection('messages');
  
  // Create indexes
  db.messages.createIndex({ conversation_id: 1, timestamp: -1 });
  db.messages.createIndex({ sender_id: 1 });
  db.conversations.createIndex({ participants: 1 });
  ```
- [ ] Setup Redis on Cloud Memorystore:
  - Go to Memorystore → Create Instance
  - Instance ID: `zalo-redis`
  - Tier: Basic (1GB)
  - Region: Same as other services
  - Get connection details (host and port)
- [ ] Test Redis connection:
  ```bash
  redis-cli -h <REDIS_HOST> -p 6379
  ping  # Should return PONG
  ```
- [ ] Share all connection strings with Members 3 & 4

**Week 1 Deliverable**: All databases running and accessible

---

## 📅 Week 2: Storage & Deployment (18 hours)

### Day 8-10: Google Cloud Storage (8 hours)
- [ ] Create Cloud Storage bucket:
  ```bash
  gsutil mb -p zalo-clone-project -l us-central1 gs://zalo-user-uploads
  ```
- [ ] Set bucket permissions:
  ```bash
  gsutil iam ch allUsers:objectViewer gs://zalo-user-uploads
  ```
- [ ] Create folders structure:
  ```
  gs://zalo-user-uploads/
  ├── avatars/
  ├── chat-images/
  └── chat-files/
  ```
- [ ] Setup file upload backend code:
  ```typescript
  // uploadService.ts
  import { Storage } from '@google-cloud/storage';
  
  const storage = new Storage({
    projectId: 'zalo-clone-project',
    keyFilename: './service-account-key.json'
  });
  
  const bucket = storage.bucket('zalo-user-uploads');
  
  export const uploadFile = async (file: Express.Multer.File, folder: string) => {
    const fileName = `${folder}/${Date.now()}_${file.originalname}`;
    const blob = bucket.file(fileName);
    
    const stream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype
      }
    });
    
    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      });
      stream.end(file.buffer);
    });
  };
  ```
- [ ] Create upload endpoint for avatars
- [ ] Create upload endpoint for chat files
- [ ] Test file upload with Postman
- [ ] Document upload API for Members 3 & 4

### Day 11-14: Application Deployment (10 hours)
- [ ] Create Compute Engine VM:
  - Go to Compute Engine → Create Instance
  - Name: `zalo-backend-server`
  - Machine type: e2-micro (free tier)
  - OS: Ubuntu 22.04 LTS
  - Allow HTTP and HTTPS traffic
  - Create
- [ ] SSH into VM:
  ```bash
  gcloud compute ssh zalo-backend-server
  ```
- [ ] Install Node.js on VM:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  sudo npm install -g pm2
  ```
- [ ] Setup Git and clone repository:
  ```bash
  sudo apt-get install git
  git clone https://github.com/your-team/zalo-clone.git
  cd zalo-clone/src/server
  npm install
  ```
- [ ] Create `.env` file on server:
  ```env
  DATABASE_URL=postgres://user:pass@cloud-sql-ip:5432/zalo_db
  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/zalo_chat
  REDIS_HOST=redis-ip
  REDIS_PORT=6379
  JWT_SECRET=your-secret-key
  GCS_BUCKET=zalo-user-uploads
  ```
- [ ] Start backend with PM2:
  ```bash
  pm2 start npm --name "zalo-backend" -- start
  pm2 save
  pm2 startup
  ```
- [ ] Configure firewall for port 5000:
  ```bash
  sudo ufw allow 5000
  ```
- [ ] Test API access:
  ```bash
  curl http://EXTERNAL_IP:5000/health
  ```

**Week 2 Deliverable**: Backend deployed and accessible

---

## 📅 Week 3: Frontend Hosting & Monitoring (14 hours)

### Day 15-17: Frontend Deployment (8 hours)
- [ ] Setup Firebase Hosting for web app:
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting
  ```
- [ ] Build web app (work with Member 1):
  ```bash
  cd zalo-clone/src/client
  npm run build
  ```
- [ ] Deploy web app:
  ```bash
  firebase deploy --only hosting
  ```
- [ ] Get hosting URL and share with team
- [ ] Setup custom domain (optional):
  - Add domain in Firebase Console
  - Update DNS records
- [ ] Configure environment variables for production
- [ ] Test deployed web app

### Day 18-19: Monitoring & Maintenance (4 hours)
- [ ] Setup Cloud Logging:
  - Enable Cloud Logging API
  - Configure log collection from VM
  - Create log-based metrics
- [ ] Create monitoring dashboard:
  - CPU usage
  - Memory usage
  - Database connections
  - API request count
- [ ] Setup alerting:
  - High CPU alert
  - High memory alert
  - Database connection failures
  - Error rate threshold
- [ ] Create backup scripts:
  ```bash
  # PostgreSQL backup
  pg_dump -h CLOUD_SQL_IP -U postgres zalo_db > backup_$(date +%Y%m%d).sql
  
  # MongoDB backup
  mongodump --uri="mongodb+srv://..." --out=mongo_backup_$(date +%Y%m%d)
  ```
- [ ] Schedule daily backups with cron

### Day 20-21: Documentation & Support (2 hours)
- [ ] Create deployment documentation
- [ ] Document all environment variables
- [ ] Create troubleshooting guide
- [ ] Help team with any deployment issues
- [ ] Perform final testing
- [ ] Create production checklist

**Week 3 Deliverable**: Fully deployed and monitored application

---

## 📦 Infrastructure Checklist

### Google Cloud Platform:
- [ ] Project created with billing enabled
- [ ] Service account created with keys
- [ ] Compute Engine VM running
- [ ] Cloud SQL PostgreSQL instance running
- [ ] Cloud Memorystore Redis running
- [ ] Cloud Storage bucket created
- [ ] Firewall rules configured
- [ ] APIs enabled

### Databases:
- [ ] PostgreSQL schema created
- [ ] PostgreSQL indexes added
- [ ] MongoDB cluster created
- [ ] MongoDB collections created
- [ ] MongoDB indexes added
- [ ] Redis instance accessible
- [ ] All connection strings shared

### Deployment:
- [ ] Backend deployed on VM
- [ ] Backend accessible via HTTP
- [ ] PM2 process manager configured
- [ ] Frontend deployed on Firebase
- [ ] Environment variables configured
- [ ] SSL certificates (if using custom domain)

### Monitoring:
- [ ] Cloud Logging enabled
- [ ] Monitoring dashboard created
- [ ] Alerts configured
- [ ] Backup scripts created
- [ ] Backup schedule configured

---

## 🛠️ Required Skills & Learning

### Essential:
- ✅ Basic Linux commands
- ✅ Basic networking concepts
- ✅ Basic database concepts

### Need to learn:
- 📚 Google Cloud Platform
- 📚 PostgreSQL administration
- 📚 MongoDB administration
- 📚 Redis basics
- 📚 Cloud deployment
- 📚 Monitoring and logging

### Learning Resources:
- Google Cloud docs: https://cloud.google.com/docs
- PostgreSQL tutorial: https://www.postgresqltutorial.com
- MongoDB University: https://university.mongodb.com
- Firebase docs: https://firebase.google.com/docs

---

## 🤝 Collaboration Points

### With Member 3 (Auth Backend):
- Provide PostgreSQL connection string
- Setup database tables for users
- Help with database queries
- Debug connection issues

### With Member 4 (Chat Backend):
- Provide MongoDB connection string
- Provide Redis connection details
- Setup Cloud Storage for file uploads
- Help with database optimization

### With Member 1 & 2 (Frontend):
- Provide API endpoints URLs
- Deploy frontend applications
- Configure CORS settings
- Help with production builds

---

## ✅ Daily Checklist

### Every Morning:
- [ ] Check all services are running
- [ ] Check Cloud costs (stay in free tier!)
- [ ] Review logs for errors
- [ ] Check database connections

### Every Evening:
- [ ] Commit any infrastructure changes
- [ ] Update documentation
- [ ] Check backup status
- [ ] Monitor resource usage

---

## 📝 Code Examples

### Example: Database Connection Helper
```typescript
// database.ts
import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

// PostgreSQL
export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// MongoDB
export const mongoClient = new MongoClient(process.env.MONGODB_URI!);
export const messagesDB = mongoClient.db('zalo_chat');
export const messagesCollection = messagesDB.collection('messages');
export const conversationsCollection = messagesDB.collection('conversations');

// Redis
export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

// Initialize all connections
export const initDatabases = async () => {
  try {
    await pgPool.connect();
    console.log('PostgreSQL connected');
    
    await mongoClient.connect();
    console.log('MongoDB connected');
    
    await redisClient.connect();
    console.log('Redis connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
```

### Example: Health Check Endpoint
```typescript
// server.ts
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      postgres: 'unknown',
      mongodb: 'unknown',
      redis: 'unknown'
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
  
  try {
    await redisClient.ping();
    health.services.redis = 'connected';
  } catch (error) {
    health.services.redis = 'error';
    health.status = 'degraded';
  }
  
  res.status(health.status === 'ok' ? 200 : 503).json(health);
});
```

### Example: Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backups"

# PostgreSQL backup
echo "Backing up PostgreSQL..."
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U postgres zalo_db > $BACKUP_DIR/postgres_$DATE.sql

# MongoDB backup
echo "Backing up MongoDB..."
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/mongodb_$DATE

# Upload to Cloud Storage
gsutil cp $BACKUP_DIR/postgres_$DATE.sql gs://zalo-backups/
gsutil -m cp -r $BACKUP_DIR/mongodb_$DATE gs://zalo-backups/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -type d -name "mongodb_*" -mtime +7 -exec rm -rf {} +

echo "Backup completed: $DATE"
```

---

## 🐛 Common Issues & Solutions

### Issue: "Can't connect to Cloud SQL"
**Solution**: Check IP whitelist, verify password, ensure Cloud SQL API is enabled

### Issue: "MongoDB Atlas connection timeout"
**Solution**: Add 0.0.0.0/0 to IP whitelist, check connection string

### Issue: "Redis connection refused"
**Solution**: Verify Redis instance is running, check host and port

### Issue: "File upload fails"
**Solution**: Check service account permissions, verify bucket exists

### Issue: "VM out of memory"
**Solution**: Use PM2 with memory limits, upgrade to larger instance

### Issue: "High Cloud costs"
**Solution**: Stop unused instances, use e2-micro type, monitor billing

---

## 📊 Connection Strings Format

Document these for your team:

```env
# PostgreSQL (Cloud SQL)
DATABASE_URL=postgresql://postgres:PASSWORD@CLOUD_SQL_IP:5432/zalo_db

# MongoDB (Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zalo_chat

# Redis (Memorystore)
REDIS_HOST=10.x.x.x
REDIS_PORT=6379

# Google Cloud Storage
GCS_PROJECT_ID=zalo-clone-project
GCS_BUCKET=zalo-user-uploads
GCS_KEY_FILE=./service-account-key.json

# Backend API
API_URL=http://EXTERNAL_IP:5000

# Frontend URL
FRONTEND_URL=https://your-app.web.app
```

---

## 🎯 Success Criteria

By the end of 3 weeks:
- [ ] All databases running smoothly
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] File uploads working
- [ ] Monitoring dashboard setup
- [ ] Backups configured
- [ ] All team members can access services
- [ ] Documentation complete
- [ ] Staying within free tier budget

---

## 💰 Cost Management (IMPORTANT!)

### Free Tier Limits:
- **Compute Engine**: 1 f1-micro instance
- **Cloud SQL**: 1 db-f1-micro instance
- **Cloud Storage**: 5GB storage
- **Memorystore**: Not in free tier (minimize usage)
- **Firebase Hosting**: 10GB storage, 360MB/day transfer

### Tips to Stay Free:
- Use e2-micro for Compute Engine
- Use db-f1-micro for Cloud SQL
- Consider using Redis Labs free tier instead of Memorystore
- Delete unused resources daily
- Set billing alert at $5

---

## 📊 Progress Tracking

**Week 1**: ___% complete  
**Week 2**: ___% complete  
**Week 3**: ___% complete  

---

**Your Role**: DevOps & Database Admin  
**Time Commitment**: ~50 hours  
**Primary Technology**: Google Cloud, PostgreSQL, MongoDB, Redis  
**Complexity**: Medium-High  
**Status**: Ready to Start! 🚀