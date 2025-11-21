# MongoDB Installation Guide

## Current Status
✅ PostgreSQL is working (User data)  
❌ MongoDB is needed (Chat messages)  
✅ MongoDB Compass is installed (GUI tool)

## What You Need
You have MongoDB Compass (the GUI), but you need **MongoDB Community Server** (the database).

## Installation Steps

### Option 1: Install MongoDB Community Server (Recommended)

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Version: Latest (8.0 or newer)
   - Platform: Windows
   - Package: MSI Installer

2. **Install with these settings**
   - ✅ Install MongoDB as a Service
   - ✅ Run service as Network Service user
   - ✅ Data Directory: `C:\Program Files\MongoDB\Server\8.0\data`
   - ✅ Log Directory: `C:\Program Files\MongoDB\Server\8.0\log`
   - ❌ Don't install MongoDB Compass (you already have it)

3. **Verify Installation**
   ```powershell
   # Check if service is running
   Get-Service -Name MongoDB*
   
   # Test connection (after server starts)
   # The server should automatically connect!
   ```

### Option 2: Use MongoDB Atlas (Cloud - Free Tier)

If you don't want to install locally:

1. **Sign up for MongoDB Atlas** (free): https://www.mongodb.com/cloud/atlas/register
2. **Create a free cluster** (M0 - Free tier)
3. **Get connection string** from Atlas dashboard
4. **Update `.env` file**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zalo_chat
   ```

## After Installation

Once MongoDB is installed and running:

1. **Restart your server**: `npm run dev:server`
2. **You should see**:
   ```
   ✓ PostgreSQL connection test passed
   ✓ MongoDB connection test passed
   ✓ Server is running on port 5000
   ```

3. **MongoDB Compass will automatically connect** to `localhost:27017`

## Troubleshooting

### If MongoDB service doesn't start:
```powershell
# Start MongoDB service
net start MongoDB

# Or manually start mongod
cd "C:\Program Files\MongoDB\Server\8.0\bin"
.\mongod.exe --dbpath "C:\Program Files\MongoDB\Server\8.0\data"
```

### Check if MongoDB is running:
```powershell
Get-NetTCPConnection -LocalPort 27017
```

## What Happens Without MongoDB?

Your server **will still work** for:
- ✅ User authentication (register/login)
- ✅ User profiles
- ✅ Friend management
- ✅ All PostgreSQL features

But **won't work** for:
- ❌ Sending/receiving messages
- ❌ Chat conversations
- ❌ Message history

## Next Steps

1. Install MongoDB Community Server (10-15 minutes)
2. Restart your development server
3. Continue with authentication implementation

---

**Note**: For your university project, installing locally is recommended so you don't need internet connection during development.
