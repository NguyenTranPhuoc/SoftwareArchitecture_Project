# 🚀 Quick Start Guide - For Students

## ⚡ Get Started in 3 Steps!

### Step 1: Install Databases (One-time setup)

**PostgreSQL** (Required - 15 minutes):
1. Download: https://www.postgresql.org/download/windows/
2. Install with password: `postgres123` (or your choice)
3. Open pgAdmin → Create database: `zalo_db`
4. Run the SQL from `database_setup.sql`

**MongoDB** (Required - 10 minutes):
1. Download: https://www.mongodb.com/try/download/community
2. Install as Windows Service
3. Open MongoDB Compass
4. Create database: `zalo_chat`
5. Create collections: `messages` and `conversations`

**Redis** (Optional - can skip for now):
- You can skip this for the initial development
- Add it later when needed

### Step 2: Configure Environment

Update your `.env` file with your database passwords:

```env
# Change YOUR_PASSWORD to your actual PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/zalo_db
DB_PASSWORD=YOUR_PASSWORD

# MongoDB (default, usually works as-is)
MONGODB_URI=mongodb://localhost:27017/zalo_chat

# Redis (leave empty if not installed)
REDIS_HOST=
```

### Step 3: Start Development

```powershell
# Install dependencies (first time only)
npm install

# Start the backend server
npm run dev:server
```

You should see:
```
✓ PostgreSQL connection test passed
✓ MongoDB connection test passed
⚠ Redis not configured - skipping
✓ Server is running on port 5000
```

---

## 📝 Quick Commands

```powershell
# Backend development
npm run dev:server          # Start server with auto-reload

# Check if databases are running
Get-Service -Name postgresql*    # PostgreSQL
Get-Service -Name MongoDB        # MongoDB

# Start a service if stopped
Start-Service -Name MongoDB
```

---

## ✅ Verify Setup

Test your server is working:

1. Open browser: http://localhost:5000/health
2. You should see: `{"success":true,"message":"Server is running"}`

Test API info:
- Open: http://localhost:5000/api
- See available endpoints

---

## 🐛 Common Issues

**"Cannot connect to PostgreSQL"**
- Check password in `.env` matches your PostgreSQL password
- Make sure PostgreSQL service is running

**"Cannot find module"**
- Run: `npm install`

**"Port 5000 already in use"**
- Change PORT in `.env` to 5001 or any available port

**"MongoDB connection failed"**
- Check MongoDB service is running
- Try: `Start-Service -Name MongoDB`

---

## 📚 Next Steps

Once your server is running:

1. **Test the health endpoint** - Verify server responds
2. **Create authentication APIs** - Register and login
3. **Build the frontend** - Connect React to backend
4. **Add chat features** - Implement WebSocket messaging

---

## 💡 Pro Tips

- Keep databases running in background
- Use MongoDB Compass to view your data
- Use Postman to test APIs
- Check console for error messages
- Commit your code regularly to GitHub

---

Need help? Check `DATABASE_SETUP_GUIDE.md` for detailed instructions!
