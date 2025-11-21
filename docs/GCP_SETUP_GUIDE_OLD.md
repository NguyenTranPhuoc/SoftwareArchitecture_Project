# Google Cloud Platform Setup - Simple Guide for University Project

**Your Role**: Google Cloud Administrator  
**Goal**: Setup basic GCP infrastructure for the team  
**Time**: ~10-15 hours total  
**Budget**: FREE (using GCP free tier)

---

## 🎯 Your 3 Main Tasks

1. **Setup GCP Account & Project** (2 hours)
2. **Deploy Backend Server** (4-5 hours)
3. **Setup File Storage** (2-3 hours)

**That's it!** Keep it simple for university.

---

## 📅 Week 1: Setup & Configuration

### Task 1: Create GCP Account (Day 1 - 1 hour)

#### Step 1: Sign Up
```
1. Go to: https://console.cloud.google.com
2. Sign in with your Gmail account
3. Click "Try for Free"
4. Enter credit card (won't be charged if you stay in free tier)
5. Get $300 free credit (valid 90 days)
```

#### Step 2: Create Project
```
1. In GCP Console, click project dropdown (top bar)
2. Click "New Project"
3. Project name: "zola-clone"
4. Organization: (leave as-is)
5. Click "Create"
```

#### Step 3: Enable Required APIs
```
Go to: APIs & Services → Library

Search and enable:
✅ Compute Engine API
✅ Cloud Storage API

That's all you need!
```

---

### Task 2: Create Service Account (Day 1 - 30 min)

#### Why?
Your backend needs credentials to access GCP services (like file storage).

#### Steps:
```
1. Go to: IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name: "zola-backend"
4. Description: "Backend application service account"
5. Click "Create and Continue"
6. Grant role: "Storage Admin"
7. Click "Continue" → "Done"
8. Click on the service account you just created
9. Go to "Keys" tab
10. Click "Add Key" → "Create New Key"
11. Choose "JSON"
12. Save file as: "gcp-credentials.json"
13. Keep it SAFE and SECRET!
```

#### Save the file:
```
Put it in: F:\14_CaoHoc\Ky2\Kiến trúc phần mềm\Zola2\zola-clone\config\gcp-credentials.json

⚠️ IMPORTANT: Add to .gitignore so it's not pushed to GitHub!
```

---

### Task 3: Install Google Cloud SDK (Day 1 - 30 min)

#### Download & Install:
```
1. Go to: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Download Windows installer
3. Run installer (keep default settings)
4. Open PowerShell and run:

gcloud init
gcloud auth login
gcloud config set project zola-clone
```

✅ **Week 1 Done!** You now have GCP account, project, and credentials.

---

## 📅 Week 2: Deployment

### Task 4: Create Storage Bucket (Day 8 - 2 hours)

#### Why?
Store user profile pictures and chat images.

#### Steps via Console (Easy):
```
1. Go to: Cloud Storage → Buckets
2. Click "Create Bucket"
3. Name: "zola-uploads-[your-student-id]" (must be globally unique)
4. Location type: "Region"
5. Location: "asia-southeast1" (Singapore)
6. Storage class: "Standard"
7. Access control: "Fine-grained"
8. Click "Create"
```

#### Make it Public:
```
1. Click on your bucket
2. Go to "Permissions" tab
3. Click "Grant Access"
4. New principals: "allUsers"
5. Role: "Storage Object Viewer"
6. Click "Save"
```

#### Test Upload:
```powershell
# In PowerShell
gsutil cp test.txt gs://zola-uploads-[your-student-id]/
```

---

### Task 5: Deploy Backend Server (Day 9-10 - 4 hours)

#### Create Virtual Machine:
```
1. Go to: Compute Engine → VM Instances
2. Click "Create Instance"
3. Configure:
   - Name: "zola-server"
   - Region: "asia-southeast1"
   - Zone: "asia-southeast1-a"
   - Machine type: "e2-micro" (FREE TIER ✅)
   - Boot disk: "Ubuntu 22.04 LTS", 10GB
   - Firewall: ✅ Allow HTTP, ✅ Allow HTTPS
4. Click "Create"
5. Wait 2-3 minutes for VM to start
```

#### Setup Server:
```bash
# Click "SSH" button to connect to your VM

# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 2. Install PM2 (keeps your app running)
sudo npm install -g pm2

# 3. Setup GitHub Authentication (IMPORTANT!)
# Option A: Create Personal Access Token (Recommended for private repos)
# Go to: https://github.com/settings/tokens/new
# - Note: "GCP VM Access"
# - Expiration: 90 days
# - Select scope: ✅ repo (full control of private repositories)
# - Click "Generate token"
# - COPY THE TOKEN IMMEDIATELY!
#
# Then clone with token:
git clone https://YOUR_USERNAME:YOUR_TOKEN@github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git

# Option B: Make repo public temporarily (easier but less secure)
# Go to: https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project/settings
# Scroll to "Danger Zone" → "Change visibility" → "Make public"
# Then clone normally:
# git clone https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git

# Navigate to project
cd SoftwareArchitecture_Project/zola-clone

# 4. Install dependencies
npm install

# 5. Install TypeScript type definitions (IMPORTANT!)
npm install --save-dev @types/pg

# 6. Create .env file
# Note: nano might not be installed, use vi instead
vi .env
# Press 'i' to enter insert mode
# Paste your .env contents (right-click in SSH terminal)
# Press 'Esc', then type ':wq' and press Enter to save

# ⚠️ IMPORTANT: Your .env must have these values for PRODUCTION:
# NODE_ENV=production
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/zola_db"
# MONGODB_URI=mongodb://localhost:27017/zola_chat
# GCS_PROJECT_ID=zola-478416
# GCS_BUCKET_NAME=zola-uploads-[your-id]
# GCS_KEY_FILE=./config/gcp-credentials.json

# 7. Build the project
npm run build:server

# 8. Start the server
pm2 start dist/server.js --name zola-backend
pm2 save
pm2 startup
# ⚠️ PM2 will show a command to run - COPY AND RUN IT!
# It looks like: sudo env PATH=... pm2 startup systemd -u YOUR_USER --hp /home/YOUR_USER
# This enables auto-start on reboot
```

#### Open Firewall Port:
```bash
# Still in SSH terminal
sudo ufw allow 5000
sudo ufw enable
```

#### Configure External Access:
```
1. In GCP Console, go to: VPC Network → Firewall
2. Click "Create Firewall Rule"
3. Name: "allow-backend-5000"
4. Direction: "Ingress"
5. Targets: "All instances in the network"
6. Source IPv4 ranges: "0.0.0.0/0"
7. Protocols and ports: "tcp:5000"
8. Click "Create"
```

#### Get Your Server URL:
```
1. Go to: Compute Engine → VM Instances
2. Find your "zola-server"
3. Copy "External IP" (e.g., 34.87.123.45)
4. Your API: http://34.124.227.173:5000
5. Test: http://34.124.227.173/health
```

✅ **Share this URL with your team!**

---

### Task 6: Update Backend for GCP Storage (Day 11 - 2 hours)

#### Install Required Package:
```bash
# On your LOCAL machine (not the VM)
cd "F:\14_CaoHoc\Ky2\Kiến trúc phần mềm\Zola2\zola-clone"
npm install @google-cloud/storage
```

#### Create Upload Service:
Create file: `src/server/services/uploadService.ts`

```typescript
import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'zola-clone',
  keyFilename: path.join(__dirname, '../../config/gcp-credentials.json')
});

const bucketName = 'zola-uploads-[your-student-id]'; // ⚠️ Change this!
const bucket = storage.bucket(bucketName);

export const uploadFile = async (
  file: Express.Multer.File,
  folder: 'avatars' | 'chat-images'
): Promise<string> => {
  // Create unique filename
  const fileName = `${folder}/${Date.now()}_${file.originalname}`;
  const blob = bucket.file(fileName);

  // Upload to GCS
  const stream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype
    }
  });

  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      resolve(publicUrl);
    });
    stream.end(file.buffer);
  });
};
```

#### Create Upload Route:
Create file: `src/server/routes/upload.ts`

```typescript
import express from 'express';
import multer from 'multer';
import { uploadFile } from '../services/uploadService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const url = await uploadFile(req.file, 'avatars');
    res.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload chat image
router.post('/chat-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const url = await uploadFile(req.file, 'chat-images');
    res.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
```

#### Add Route to Server:
Edit `src/server/server.ts`:

```typescript
// Add this import at the top
import uploadRoutes from './routes/upload';

// Add this with other routes
app.use('/api/upload', uploadRoutes);
```

#### Deploy to GCP:
```bash
# 1. Push your code to GitHub
git add .
git commit -m "Add GCP file upload"
git push

# 2. SSH into your VM
# (Use SSH button in GCP Console)

# 3. Update code on VM
cd SoftwareArchitecture_Project/zola-clone
git pull
npm install
npm run build:server
pm2 restart zola-backend

# 4. Upload credentials file
# On your LOCAL machine:
gcloud compute scp config/gcp-credentials.json zola-server:~/SoftwareArchitecture_Project/zola-clone/config/gcp-credentials.json --zone=asia-southeast1-a
```

---

## 📋 Your Deliverables (Share with Team)

### 1. GCP Project Access
```
Project ID: zola-clone
Project Number: [find in GCP Console → Dashboard]

Add team members:
1. Go to: IAM & Admin → IAM
2. Click "Grant Access"
3. Enter their Gmail addresses
4. Role: "Viewer" (read-only) or "Editor" (can modify)
```

### 2. API Endpoint
```
Production API: http://YOUR_VM_EXTERNAL_IP:5000
Health Check: http://YOUR_VM_EXTERNAL_IP:5000/health

Example:
http://34.87.123.45:5000
```

### 3. Storage Bucket
```
Bucket Name: zola-uploads-[your-student-id]
Upload Endpoints:
  - POST /api/upload/avatar
  - POST /api/upload/chat-image

Example:
curl -X POST http://34.87.123.45:5000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@profile.jpg"
```

### 4. Service Account Key
```
File: config/gcp-credentials.json
⚠️ Share privately with backend developers only!
⚠️ Never push to GitHub!
```

---

## 🔧 Common Commands

### Check Server Status:
```bash
# SSH into VM, then:
pm2 status
pm2 logs zola-backend
pm2 logs zola-backend --lines 50  # See last 50 lines
```

### Restart Server:
```bash
pm2 restart zola-backend
pm2 reload zola-backend  # Zero-downtime reload
```

### Update Code from GitHub:
```bash
cd ~/SoftwareArchitecture_Project/zola-clone

# If you have local changes that conflict:
git stash  # Save local changes temporarily

# Pull latest code
git pull origin main

# Reinstall dependencies (if package.json changed)
npm install

# Rebuild
npm run build:server

# Restart server
pm2 restart zola-backend

# Check logs
pm2 logs zola-backend
```

### Check Firewall:
```bash
sudo ufw status
sudo ufw allow 5000  # Open port if needed
```

### View .env file:
```bash
cat .env  # Display entire file
head -n 20 .env  # Display first 20 lines
```

### Useful PM2 Commands:
```bash
pm2 list  # List all processes
pm2 stop zola-backend  # Stop server
pm2 start zola-backend  # Start server
pm2 delete zola-backend  # Remove from PM2
pm2 monit  # Real-time monitoring
```

### Check if server is responding:
```bash
# From within VM:
curl http://localhost:5000/health

# From your local machine (replace with your VM's external IP):
curl http://YOUR_EXTERNAL_IP:5000/health
```

---

## 💰 Cost Management (IMPORTANT!)

### Stay in Free Tier:
- ✅ Use **e2-micro** VM (744 hours/month free)
- ✅ Store less than **5GB** in Cloud Storage (free)
- ✅ **Stop VM** when not using (nights/weekends)

### Stop VM (Save money):
```
GCP Console → Compute Engine → VM Instances
Click ⋮ (three dots) → Stop
```

### Start VM:
```
Click ⋮ (three dots) → Start
⚠️ External IP will change! Update your team.
```

### Monitor Costs:
```
Go to: Billing → Reports
Set alert: $5 (email notification)
```

---

## ✅ Simple Checklist

### Week 1:
- [ ] GCP account created ($300 credit)
- [ ] Project "zola-clone" created
- [ ] APIs enabled (Compute Engine, Cloud Storage)
- [ ] Service account created
- [ ] gcp-credentials.json downloaded
- [ ] Google Cloud SDK installed

### Week 2:
- [ ] Storage bucket created
- [ ] Bucket is public (for images)
- [ ] VM instance created (e2-micro)
- [ ] Server deployed and running
- [ ] Port 5000 opened
- [ ] API accessible via External IP
- [ ] File upload working
- [ ] Team has access

---

## 🐛 Troubleshooting

### GitHub Clone Fails (Authentication Error)?
```
Problem: "remote: Support for password authentication was removed"

Solution 1 - Personal Access Token (PAT):
1. Go to: https://github.com/settings/tokens/new
2. Note: "GCP VM Access"
3. Expiration: 90 days
4. Check: ✅ repo
5. Generate and COPY the token
6. Clone with: git clone https://USERNAME:TOKEN@github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git

Solution 2 - Make repo public:
1. Go to repo settings
2. Danger Zone → Change visibility → Public
3. Clone normally
```

### Build Fails - "Cannot find module"?
```
Problem: npm run build:server shows missing module errors

Common causes:
1. Missing source files → Make sure you pushed all code to GitHub
2. Git pull conflicts → Run: git stash, then git pull
3. Missing package-lock.json → Delete it on VM: rm package-lock.json; git pull
4. Missing type definitions → Run: npm install --save-dev @types/pg

Solution:
cd ~/SoftwareArchitecture_Project/zola-clone
git stash  # Save local changes
git pull origin main  # Get latest code
npm install  # Reinstall dependencies
npm install --save-dev @types/pg  # Install types
npm run build:server  # Try building again
```

### Nano Command Not Found?
```
Problem: "nano: command not found"

Solution - Use vi instead (already installed):
vi .env
Press 'i' → paste content → Press Esc → type ':wq' → Enter

Or install nano:
sudo apt-get update
sudo apt-get install -y nano
```

### Git Pull Says "Already up to date" but files missing?
```
Problem: Local commits not pushed to GitHub

Solution - On your LOCAL machine:
git status  # Check what needs pushing
git push origin main  # Push to GitHub

Then on VM:
git pull origin main  # Now it will download
```

### PM2 Startup Shows Long Command?
```
This is NORMAL! ✅

PM2 is showing you the command to enable auto-start.
COPY the entire command and run it with sudo.

Example:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u USERNAME --hp /home/USERNAME

After running, you should see: "Command successfully executed"
```

### Can't access API?
```
1. Check VM is running
2. Check firewall rule exists (allow-backend-5000)
3. Check PM2: pm2 status
4. Check logs: pm2 logs zola-backend
5. Check .env has NODE_ENV=production
```

### Upload fails?
```
1. Check gcp-credentials.json exists on VM
2. Check bucket name is correct in uploadService.ts
3. Check bucket is public
4. Check file size < 5MB
```

### VM costs money?
```
1. Stop VM when not using
2. Use e2-micro (free tier)
3. Delete unused resources
4. Check Billing alerts
```

---

## 📞 Share with Team

After setup, create a text file with:

```
=== zola CLONE - GCP RESOURCES ===

API Endpoint: http://34.87.123.45:5000
Health Check: http://34.87.123.45:5000/health

Upload Endpoints:
- Avatar: POST /api/upload/avatar
- Chat Image: POST /api/upload/chat-image

GCP Project: zola-clone
Storage Bucket: zola-uploads-[your-id]

Service Account Key: (ask me privately)

Last Updated: [date]
```

---

## 🎯 That's It!

**Total Time**: ~10-15 hours  
**Cost**: $0 (free tier)  
**Complexity**: Simple (for university)

Focus on these 3 things:
1. ✅ GCP account setup
2. ✅ Backend deployment
3. ✅ File storage

Everything else is handled by other team members!

---

**Need Help?**
- GCP Documentation: https://cloud.google.com/docs
- GCP Free Tier: https://cloud.google.com/free
- YouTube: "GCP for beginners"

Good luck! 🚀

