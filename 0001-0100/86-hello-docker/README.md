# Docker 入門指南 🐳

歡迎來到 Docker 的世界！這份指南將帶領完全新手從零開始學習 Docker，包含核心概念到實際操作的完整教學。

## 📚 目錄

1. [什麼是 Docker？](#什麼是-docker)
2. [為什麼要使用 Docker？](#為什麼要使用-docker)
3. [Docker 核心概念](#docker-核心概念)
4. [安裝 Docker](#安裝-docker)
5. [基本命令](#基本命令)
6. [第一個 Docker 容器](#第一個-docker-容器)
7. [建立自己的映像](#建立自己的映像)
8. [Docker Compose 簡介](#docker-compose-簡介)
9. [實踐範例](#實踐範例)
10. [常見問題](#常見問題)
11. [下一步學習](#下一步學習)

## 什麼是 Docker？

Docker 是一個開源的容器化平台，讓開發者可以將應用程式及其相依性打包成一個輕量級、可攜式的容器。

### 簡單比喻
想像 Docker 就像是一個「標準化的貨櫃」：
- 🚛 **傳統部署**：每次搬家都要重新打包，可能會忘記某些東西
- 📦 **Docker 容器**：所有東西都裝在標準貨櫃裡，無論搬到哪裡都能正常運作

## 為什麼要使用 Docker？

### 🔧 解決的問題
1. **環境一致性**：「在我的電腦上可以運行」的問題
2. **依賴管理**：不同專案的版本衝突
3. **部署複雜性**：簡化應用程式的部署流程
4. **資源效率**：比虛擬機器更輕量

### ✅ 主要優勢
- **可攜性**：一次打包，到處運行
- **擴展性**：容易進行水平擴展
- **隔離性**：應用程式間互不干擾
- **版本控制**：可以追蹤映像的版本變化

## Docker 核心概念

### 🖼️ 映像 (Image)
- **定義**：應用程式的模板，包含運行所需的所有檔案
- **特性**：唯讀、可分享、可版本控制
- **比喻**：就像軟體的「安裝光碟」

### 📦 容器 (Container)
- **定義**：映像的運行實例
- **特性**：可寫、隔離、臨時性
- **比喻**：從「安裝光碟」安裝並運行的「程式」

### 📝 Dockerfile
- **定義**：建立映像的指令腳本
- **作用**：定義如何從基礎映像建立自定義映像
- **比喻**：軟體的「安裝手冊」

### 🗂️ 倉庫 (Registry)
- **定義**：儲存和分享映像的地方
- **例子**：Docker Hub、Google Container Registry
- **比喻**：軟體的「應用商店」

## 安裝 Docker

### Windows
1. 下載 [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)
2. 執行安裝檔案
3. 重新啟動電腦
4. 啟動 Docker Desktop

### macOS
1. 下載 [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)
2. 拖拽到 Applications 資料夾
3. 執行 Docker.app

### Linux (Ubuntu)
```bash
# 更新套件列表
sudo apt update

# 安裝必要套件
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# 新增 Docker GPG 金鑰
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 新增 Docker 倉庫
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 安裝 Docker
sudo apt update
sudo apt install docker-ce

# 將使用者加入 docker 群組
sudo usermod -aG docker $USER
```

### 驗證安裝
```bash
docker --version
docker run hello-world
```

## 基本命令

### 映像管理
```bash
# 搜尋映像
docker search <映像名稱>

# 下載映像
docker pull <映像名稱>

# 列出本地映像
docker images

# 刪除映像
docker rmi <映像ID或名稱>
```

### 容器管理
```bash
# 運行容器
docker run <映像名稱>

# 列出運行中的容器
docker ps

# 列出所有容器（包含已停止）
docker ps -a

# 停止容器
docker stop <容器ID或名稱>

# 刪除容器
docker rm <容器ID或名稱>

# 進入運行中的容器
docker exec -it <容器ID或名稱> /bin/bash
```

### 常用參數
```bash
# 在背景運行
docker run -d <映像名稱>

# 連接埠映射
docker run -p 8080:80 <映像名稱>

# 掛載磁碟區
docker run -v /host/path:/container/path <映像名稱>

# 設定環境變數
docker run -e ENV_VAR=value <映像名稱>

# 給容器命名
docker run --name my-container <映像名稱>
```

## 第一個 Docker 容器

讓我們從最簡單的例子開始：

### 1. Hello World
```bash
docker run hello-world
```

### 2. 運行 Nginx 網頁伺服器
```bash
# 下載並運行 Nginx
docker run -d -p 8080:80 --name my-nginx nginx

# 在瀏覽器訪問 http://localhost:8080
```

### 3. 運行 Ubuntu 系統
```bash
# 運行 Ubuntu 並進入互動模式
docker run -it ubuntu /bin/bash

# 在容器內執行命令
apt update
apt install curl
curl google.com
exit
```

## 建立自己的映像

### 建立 Dockerfile
在專案目錄建立 `Dockerfile`：

```dockerfile
# 使用官方 Node.js 作為基礎映像
FROM node:16

# 設定工作目錄
WORKDIR /app

# 複製 package.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製應用程式碼
COPY . .

# 暴露連接埠
EXPOSE 3000

# 定義啟動命令
CMD ["npm", "start"]
```

### 建立映像
```bash
# 建立映像
docker build -t my-app .

# 運行自己的映像
docker run -p 3000:3000 my-app
```

### Dockerfile 常用指令
- `FROM`：指定基礎映像
- `WORKDIR`：設定工作目錄
- `COPY`：複製檔案到容器
- `RUN`：在建立時執行命令
- `CMD`：容器啟動時的默認命令
- `EXPOSE`：暴露連接埠
- `ENV`：設定環境變數

## Docker Compose 簡介

Docker Compose 用於定義和運行多容器 Docker 應用程式。

### 建立 docker-compose.yml
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/myapp

  db:
    image: postgres:13
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

### 常用 Compose 命令
```bash
# 啟動所有服務
docker-compose up

# 在背景啟動
docker-compose up -d

# 停止所有服務
docker-compose down

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs
```

## 實踐範例

### 範例 1：靜態網站
建立一個簡單的 HTML 網站：

**index.html**
```html
<!DOCTYPE html>
<html>
<head>
    <title>我的第一個 Docker 網站</title>
</head>
<body>
    <h1>歡迎來到 Docker 世界！</h1>
    <p>這是在 Docker 容器中運行的網站</p>
</body>
</html>
```

**Dockerfile**
```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
EXPOSE 80
```

**建立和運行**
```bash
docker build -t my-website .
docker run -p 8080:80 my-website
```

### 範例 2：Node.js 應用程式
**app.js**
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.json({
        message: '你好！這是 Docker 容器中的 Node.js 應用程式',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`伺服器在連接埠 ${PORT} 上運行`);
});
```

**package.json**
```json
{
  "name": "docker-node-app",
  "version": "1.0.0",
  "main": "app.js",
  "dependencies": {
    "express": "^4.18.0"
  },
  "scripts": {
    "start": "node app.js"
  }
}
```

**Dockerfile**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 常見問題

### Q: 容器停止後資料會遺失嗎？
A: 是的，容器是臨時的。使用 Volume 來持久化資料：
```bash
docker run -v /host/data:/container/data my-app
```

### Q: 如何除錯容器內的問題？
A: 使用以下命令：
```bash
# 查看容器日誌
docker logs <容器名稱>

# 進入容器檢查
docker exec -it <容器名稱> /bin/sh

# 檢查容器詳細資訊
docker inspect <容器名稱>
```

### Q: 如何清理不需要的映像和容器？
A: 使用以下命令：
```bash
# 刪除所有停止的容器
docker container prune

# 刪除未使用的映像
docker image prune

# 清理所有未使用的資源
docker system prune
```

### Q: 映像太大怎麼辦？
A: 使用以下技巧：
- 使用 Alpine Linux 作為基礎映像
- 使用多階段建立
- 清理不必要的檔案
- 使用 .dockerignore 檔案

## 下一步學習

### 🎯 進階主題
1. **Docker 網路**：自定義網路設定
2. **Docker Swarm**：容器叢集管理
3. **Kubernetes**：進階容器編排
4. **Docker 安全**：最佳實踐和安全設定
5. **CI/CD 整合**：自動化建立和部署

### 📖 推薦資源
- [Docker 官方文件](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Play with Docker](https://labs.play-with-docker.com/)

### 🛠️ 實踐專案建議
1. 將現有專案容器化
2. 建立多服務應用程式
3. 實作 CI/CD 管道
4. 部署到雲端平台

---

## 🎉 恭喜你！

你已經完成了 Docker 入門學習！現在你應該能夠：
- ✅ 理解 Docker 的基本概念
- ✅ 使用基本的 Docker 命令
- ✅ 建立自己的映像
- ✅ 使用 Docker Compose
- ✅ 除錯常見問題

記住，學習 Docker 最好的方法就是多實踐。試著將你的專案容器化，你會發現 Docker 的強大之處！

如果有任何問題，歡迎查閱官方文件或社群資源。祝你在 Docker 的學習路上一切順利！🚀
