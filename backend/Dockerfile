# 階段 1: 建置階段 - 確保依賴項安裝在 Linux 環境
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make gcc g++
RUN npm install
COPY . .

# 階段 2: 運行階段 - 最終運行時環境
FROM node:18-alpine
WORKDIR /app

# 從建置階段複製依賴項和程式碼
COPY --from=builder /app .

EXPOSE 3000
CMD ["npm", "start"]