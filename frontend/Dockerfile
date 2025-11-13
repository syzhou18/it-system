# 階段 1: 建置 (Build) 靜態檔案
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
#RUN apk add --no-cache python3 make gcc g++
RUN npm install
COPY . .
#RUN node ./node_modules/vite/bin/vite.js build
RUN npm run build  # 執行建置指令，通常會產生 dist 或 build 資料夾

# 階段 2: 運行 (Serve) 靜態檔案
FROM nginx:alpine
# 將建置階段產生的靜態檔案複製到 Nginx 的預設服務目錄
COPY --from=builder /app/dist /usr/share/nginx/html
# 複製 Nginx 設定檔 (如果需要客製化)
# COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]