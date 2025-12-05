FROM node:20-alpine

# 1. Đặt WORKDIR là thư mục gốc của app
WORKDIR /usr/src/app

# 2. Chỉ copy package.json của user-service vào thư mục con
COPY user-service/package*.json ./user-service/

# 3. Chạy npm ci TỪ BÊN TRONG thư mục đó
RUN cd user-service && npm ci --production

# 4. Copy mã nguồn của user-service
COPY user-service/src/ ./user-service/src/

# 5. Copy mã nguồn của common
COPY common/src/ ./common/src/

EXPOSE 3002
# 6. Chạy app từ thư mục con
CMD ["node", "user-service/src/index.js"]