FROM node:20-alpine

# 1. Đặt WORKDIR là thư mục gốc của app
WORKDIR /usr/src/app

# 2. Chỉ copy package.json của auth-service vào thư mục con
COPY auth-service/package*.json ./auth-service/

# 3. Chạy npm ci TỪ BÊN TRONG thư mục đó
RUN cd auth-service && npm ci --production

# 4. Copy mã nguồn của auth-service
COPY auth-service/src/ ./auth-service/src/

# 5. Copy mã nguồn của common
COPY common/src/ ./common/src/

EXPOSE 3001
# 6. Chạy app từ thư mục con
CMD ["node", "auth-service/src/index.js"]