# ⚡ Quick Start Guide - Zalo Clone

## 🚀 Khởi Động Nhanh (5 phút)

### Bước 1: Cài Đặt Dependencies
```bash
npm install
```

### Bước 2: Tạo File .env
```bash
# Copy từ template
cp .env.example .env
```

Hoặc tạo file `.env` mới với nội dung:
```bash
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Databases
MONGO_URI=mongodb://admin:admin123@localhost:27017/zalo_clone?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
```

### Bước 3: Khởi Động Databases
```bash
# Start tất cả databases với Docker Compose
docker-compose up -d

# Chờ 10 giây cho databases khởi động
```

**Kiểm tra:**
```bash
docker ps
```
Bạn sẽ thấy 6 containers đang chạy:
- ✅ zalo_postgres (port 5432)
- ✅ zalo_mongodb (port 27017)
- ✅ zalo_redis (port 6379)
- 🎨 zalo_pgadmin (port 5050)
- 🎨 zalo_mongo_express (port 8081)
- 🎨 zalo_redis_insight (port 8001)

### Bước 4: Seed Test Data
```bash
npx ts-node src/server/scripts/seed.ts
```

### Bước 5: Start Backend
```bash
npm run dev:server
```

✅ Backend sẽ chạy tại: **http://localhost:5000**

### Bước 6: Start Frontend (Terminal mới)
```bash
cd src/client/webapp
npm install
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:3000**

---

## 🎯 Mở App

1. Mở browser: **http://localhost:3000**
2. Bạn sẽ thấy giao diện chat
3. Chọn conversation "UAV Pilots Club"
4. Gửi tin nhắn "Hello!"
5. ✨ Real-time chat hoạt động!

---

## 🛠️ Database GUI Tools (Bonus!)

Docker Compose đã cài sẵn các công cụ xem database:

### 1. Mongo Express (MongoDB GUI)
- **URL:** http://localhost:8081
- **Username:** admin
- **Password:** admin123
- **Dùng để:** Xem messages, conversations trực quan

### 2. pgAdmin (PostgreSQL GUI)
- **URL:** http://localhost:5050
- **Email:** admin@zalo.com
- **Password:** admin123
- **Dùng để:** Quản lý users, authentication (coming soon)

### 3. RedisInsight (Redis GUI)
- **URL:** http://localhost:8001
- **Dùng để:** Xem cache, sessions

---

## 📊 Xem Data Nhanh

### MongoDB (Messages)
```bash
# Xem tất cả messages
docker exec zalo_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin zalo_clone --eval "db.messages.find().forEach(printjson)"

# Đếm messages
docker exec zalo_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin zalo_clone --eval "print('Total:', db.messages.countDocuments())"
```

### Redis (Cache)
```bash
# Ping Redis
docker exec zalo_redis redis-cli -a redis123 PING

# Xem tất cả keys
docker exec zalo_redis redis-cli -a redis123 KEYS "*"
```

---

## 🛑 Dừng Services

### Dừng Backend & Frontend
Nhấn **Ctrl+C** trong terminal đang chạy

### Dừng Databases
```bash
# Dừng nhưng giữ data
docker-compose stop

# Dừng và xóa containers (giữ data)
docker-compose down

# Dừng và XÓA HẾT data (cẩn thận!)
docker-compose down -v
```

---

## 🔄 Restart Services

### Restart Tất Cả
```bash
# Restart databases
docker-compose restart

# Restart backend (Ctrl+C rồi chạy lại)
npm run dev:server
```

### Restart Chỉ 1 Database
```bash
docker restart zalo_mongodb
docker restart zalo_redis
docker restart zalo_postgres
```

---

## 🧹 Reset Everything

Nếu muốn bắt đầu lại từ đầu:

```bash
# 1. Dừng và xóa tất cả containers + data
docker-compose down -v

# 2. Xóa node_modules
rm -rf node_modules src/client/webapp/node_modules

# 3. Cài lại dependencies
npm install
cd src/client/webapp && npm install && cd ../..

# 4. Start lại từ đầu
docker-compose up -d
npx ts-node src/server/scripts/seed.ts
npm run dev:server
```

---

## 🐛 Troubleshooting Nhanh

### Backend không start được?
```bash
# Kiểm tra port 5000 có bị chiếm không
netstat -ano | findstr :5000

# Kill process đang dùng port (Windows)
taskkill //F //PID <PID>
```

### MongoDB connection failed?
```bash
# Check container
docker ps | grep mongo

# Restart
docker restart zalo_mongodb

# Check logs
docker logs zalo_mongodb
```

### Frontend không connect được backend?
- Check CORS_ORIGIN trong .env: `http://localhost:3000`
- Check backend đang chạy: `curl http://localhost:5000/health`
- Hard refresh browser: **Ctrl+Shift+R**

### Messages không lưu vào database?
```bash
# Tắt MongoDB validation
docker exec zalo_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin zalo_clone --eval "db.runCommand({collMod: 'messages', validator: {}, validationLevel: 'off'})"
```

---

## ✅ Checklist

- [ ] Docker Desktop đã mở và chạy
- [ ] `docker-compose up -d` thành công
- [ ] `docker ps` hiển thị 6 containers
- [ ] `.env` file đã tạo
- [ ] `npm install` thành công
- [ ] Database đã seed: `npx ts-node src/server/scripts/seed.ts`
- [ ] Backend chạy: `npm run dev:server` → http://localhost:5000
- [ ] Frontend chạy: `cd src/client/webapp && npm run dev` → http://localhost:3000
- [ ] Socket.IO connected (check browser console)
- [ ] Có thể gửi và nhận messages

---

## 🎓 Tài Liệu Đầy Đủ

Nếu gặp vấn đề, xem chi tiết tại:
- **BACKEND_SETUP_GUIDE.md** - Hướng dẫn setup chi tiết
- **HOW_TO_VIEW_MONGODB.md** - Cách xem MongoDB
- **INTEGRATION_GUIDE.md** - Kiến trúc & integration

---

## 📦 Các Commands Hay Dùng

```bash
# Start all services
docker-compose up -d && npm run dev:server

# View all logs
docker-compose logs -f

# Check service status
docker-compose ps

# View backend logs
# (tự động hiển thị khi chạy dev:server)

# Seed database lại
npx ts-node src/server/scripts/seed.ts

# Build backend
npm run build:server

# Test API
curl http://localhost:5000/health
curl http://localhost:5000/api
```

---

Happy coding! 🚀
