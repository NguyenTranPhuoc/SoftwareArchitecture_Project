# 🗄️ Database Setup Guide for Students

This guide will help you set up PostgreSQL, MongoDB, and Redis for the Zalo Clone project in a simple way.

---

## 📋 Prerequisites

- Windows 10/11
- Administrator access
- At least 2GB free disk space

---

## 1️⃣ PostgreSQL Setup (User Data)

### Installation Steps:

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 16 installer
   - File size: ~300MB

2. **Install PostgreSQL:**
   - Run the installer as Administrator
   - Click "Next" through the wizard
   - **IMPORTANT:** Set password for postgres user (e.g., `postgres123`)
   - Keep default port: `5432`
   - Keep default data directory
   - Complete installation

3. **Verify Installation:**
   ```powershell
   # Open PowerShell and run:
   psql --version
   # Should show: psql (PostgreSQL) 16.x
   ```

### Create Database:

**Option A: Using pgAdmin (GUI - Easiest):**
1. Open pgAdmin (installed with PostgreSQL)
2. Connect with your password
3. Right-click "Databases" → "Create" → "Database"
4. Name: `zalo_db`
5. Click "Save"
6. Open Query Tool and paste contents from `database_setup.sql`
7. Click Execute (▶️ button)

**Option B: Using Command Line:**
```powershell
# Open PowerShell as Administrator
cd "C:\Program Files\PostgreSQL\16\bin"

# Connect to PostgreSQL
.\psql -U postgres

# Enter your password when prompted
# Then run:
CREATE DATABASE zalo_db;
\c zalo_db
\i 'F:\14_CaoHoc\Ky2\Kiến trúc phần mềm\Zola2\zalo-clone\database_setup.sql'
\q
```

### Update .env file:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/zalo_db
DB_PASSWORD=YOUR_PASSWORD
```

---

## 2️⃣ MongoDB Setup (Chat Messages)

### Installation Steps:

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI
   - File size: ~350MB

2. **Install MongoDB:**
   - Run installer as Administrator
   - Choose "Complete" installation
   - **Install as Windows Service** ✓
   - Keep default port: `27017`
   - Install MongoDB Compass (GUI tool) ✓
   - Complete installation

3. **Verify Installation:**
   ```powershell
   # Check if MongoDB service is running
   Get-Service -Name MongoDB
   # Status should be: Running
   ```

4. **Create Database Using MongoDB Compass:**
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - Click "Create Database"
   - Database Name: `zalo_chat`
   - Collection Name: `messages`
   - Click "Create Database"
   - Create another collection: `conversations`

### Update .env file:
```env
MONGODB_URI=mongodb://localhost:27017/zalo_chat
```

---

## 3️⃣ Redis Setup (Caching - OPTIONAL for students)

### Option A: Use Redis on Windows (Simple way):

1. **Download Memurai (Redis for Windows):**
   - Visit: https://www.memurai.com/get-memurai
   - Download Developer Edition (Free)
   - Install and start service

2. **Or use Redis Docker (if you have Docker):**
   ```powershell
   docker run -d -p 6379:6379 redis:latest
   ```

### Option B: Skip Redis for Now
If Redis is too complicated, you can modify the code to work without it:
- Comment out Redis code in `server.ts`
- We'll add it later when needed

### Update .env file:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## ✅ Verification Checklist

After setup, verify everything works:

### Check PostgreSQL:
```powershell
psql -U postgres -d zalo_db -c "SELECT COUNT(*) FROM users;"
```

### Check MongoDB:
- Open MongoDB Compass
- You should see `zalo_chat` database
- With `messages` and `conversations` collections

### Check Redis (if installed):
```powershell
redis-cli ping
# Should return: PONG
```

---

## 🚀 Start Your Server

Once all databases are set up:

```powershell
cd "F:\14_CaoHoc\Ky2\Kiến trúc phần mềm\Zola2\zalo-clone"
npm run dev:server
```

You should see:
```
✓ PostgreSQL connection test passed
✓ MongoDB connection test passed
✓ Redis connection test passed (if enabled)
✓ Server is running on port 5000
```

---

## 🐛 Troubleshooting

### PostgreSQL Issues:
- **Can't connect:** Make sure PostgreSQL service is running
  ```powershell
  Get-Service -Name postgresql*
  ```
- **Wrong password:** Update `.env` file with correct password

### MongoDB Issues:
- **Can't connect:** Check if MongoDB service is running
  ```powershell
  Get-Service -Name MongoDB
  ```
- **Start service manually:**
  ```powershell
  Start-Service -Name MongoDB
  ```

### Port Already in Use:
- **PostgreSQL (5432):** Change port in `.env`
- **MongoDB (27017):** Change port in `.env`
- **Server (5000):** Change PORT in `.env`

---

## 📚 Useful Tools

- **pgAdmin** - PostgreSQL GUI (installed with PostgreSQL)
- **MongoDB Compass** - MongoDB GUI (installed with MongoDB)
- **TablePlus** - Universal database client (optional)

---

## 💡 Tips for Students

1. **Write down your passwords!** Keep them in a safe place
2. **Start services on boot:** Configure Windows to auto-start database services
3. **Use MongoDB Compass:** It's easier to visualize your data
4. **Backup your data:** Export before making changes
5. **Ask for help:** If stuck, check with team members

---

## 🎓 Learning Resources

- PostgreSQL Tutorial: https://www.postgresqltutorial.com/
- MongoDB University: https://university.mongodb.com/ (Free courses!)
- SQL Practice: https://www.w3schools.com/sql/

---

Good luck with your project! 🚀
