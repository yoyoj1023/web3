# 第五模組：流量入口 - Ingress 與對外服務 (Ingress & Networking)

## 模組目標
掌握 k8s 對外暴露服務的標準方式。

## 心智模型
你的 k8s 叢集是一棟大樓，裡面有很多公司（Service）。Ingress 就是大樓門口的「接待櫃台」：訪客說要找 A 公司（app.example.com），櫃台引導到 3 樓；說要找 B 公司（api.example.com），引導到 5 樓。Ingress Controller（如 Nginx）就是真正坐在櫃台的那個人，負責執行路由規則。沒有 Ingress，每個 Service 就得自己開大門（NodePort），既不安全也不好管理。

---

## 第一課：為什麼需要 Ingress？

### 1.1 現有方案的問題

到目前為止，我們用過兩種方式讓外部存取服務：

**port-forward（臨時用）**
```bash
kubectl port-forward svc/web-svc 8080:80
```
- 只適合開發除錯，關掉終端就斷了

**NodePort**
```yaml
type: NodePort
# 暴露在 30000-32767 的 port
```
- 每個服務要占一個 port（http://node-ip:30080、http://node-ip:30081...）
- port 號碼不好記
- 沒有域名路由、沒有 HTTPS

### 1.2 Docker 世界的對比

在 Docker 中，你可能用過：
- **Nginx Proxy Manager**：GUI 設定反向代理 + 自動 SSL
- **Traefik**：自動發現 container 並路由

**Ingress 就是 k8s 原生的反向代理機制**，功能等價，但與 k8s 深度整合。

### 1.3 Ingress 的運作方式

```
用戶瀏覽器
    │
    ▼
┌──────────────────────┐
│   Ingress Controller  │  ← 真正的反向代理（如 Nginx）
│   （監聽 80/443）      │
└──────────┬───────────┘
           │
     根據 Ingress 規則路由
           │
    ┌──────┼──────┐
    ▼      ▼      ▼
 Service  Service  Service
 (frontend) (api)  (admin)
```

- **Ingress Controller**：實際運行的反向代理 Pod（需要安裝）
- **Ingress 資源**：路由規則的定義（YAML）

---

## 第二課：安裝 Ingress Controller

### 2.1 在 minikube 中啟用

```bash
minikube addons enable ingress

# 驗證安裝
kubectl get pods -n ingress-nginx
# NAME                                        READY   STATUS
# ingress-nginx-controller-xxxxx              1/1     Running
```

### 2.2 其他環境的安裝

如果不是用 minikube，可以用 Helm 安裝：
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx
```

### 2.3 驗證 Controller 運作

```bash
kubectl get svc -n ingress-nginx
# 你會看到 ingress-nginx-controller 的 Service
# 它監聽 80 和 443 port
```

---

## 第三課：Ingress 規則

### 3.1 準備工作：部署兩個服務

先部署 frontend 和 backend 兩個服務作為練習：

```yaml
# apps.yaml

# Frontend
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: nginx
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
spec:
  selector:
    app: frontend
  ports:
  - port: 80
---

# Backend
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: hashicorp/http-echo
        args: ["-text=Hello from Backend API"]
        ports:
        - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
spec:
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 5678
```

```bash
kubectl apply -f apps.yaml
```

### 3.2 路徑路由（Path-based Routing）

不同路徑導向不同服務：

```yaml
# ingress-path.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-svc
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-svc
            port:
              number: 80
```

```bash
kubectl apply -f ingress-path.yaml

# 取得 minikube 的 IP
minikube ip
# 例如：192.168.49.2

# 測試
curl http://$(minikube ip)/        # → frontend (Nginx 歡迎頁)
curl http://$(minikube ip)/api     # → backend (Hello from Backend API)
```

### 3.3 域名路由（Host-based Routing）

不同域名導向不同服務：

```yaml
# ingress-host.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress-host
spec:
  ingressClassName: nginx
  rules:
  - host: app.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-svc
            port:
              number: 80
  - host: api.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-svc
            port:
              number: 80
```

```bash
kubectl apply -f ingress-host.yaml

# 在本機的 hosts 檔案加入（需要管理員權限）
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/Mac: /etc/hosts
# 加入：
# 192.168.49.2  app.local api.local

# 測試
curl http://app.local    # → frontend
curl http://api.local    # → backend
```

### 3.4 查看 Ingress 狀態

```bash
kubectl get ingress
# NAME               CLASS   HOSTS              ADDRESS        PORTS
# app-ingress-host   nginx   app.local,api.local 192.168.49.2  80

kubectl describe ingress app-ingress-host
```

---

## 第四課：TLS / HTTPS 設定

### 4.1 建立 TLS Secret

先產生自簽憑證（開發測試用）：

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=app.local"

kubectl create secret tls app-tls \
  --cert=tls.crt \
  --key=tls.key
```

### 4.2 在 Ingress 中啟用 TLS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress-tls
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.local
    secretName: app-tls        # 指向 TLS Secret
  rules:
  - host: app.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-svc
            port:
              number: 80
```

```bash
kubectl apply -f ingress-tls.yaml

# 測試（因為自簽憑證，加 -k 跳過驗證）
curl -k https://app.local
```

### 4.3 生產環境的 TLS

在生產環境中，通常搭配 **cert-manager** 自動管理 Let's Encrypt 憑證：

```bash
# 安裝 cert-manager（用 Helm，第七模組會詳細介紹）
helm install cert-manager jetstack/cert-manager --set installCRDs=true
```

設定好後，cert-manager 會自動：
1. 申請 Let's Encrypt 憑證
2. 建立 TLS Secret
3. 到期前自動續約

---

## 第五課：Ingress 對比 Docker 方案

### 5.1 對照表

| 功能 | Nginx Proxy Manager | Traefik (Docker) | k8s Ingress |
|------|---------------------|-----------------|-------------|
| 路徑路由 | GUI 設定 | labels | YAML rules |
| 域名路由 | GUI 設定 | labels | YAML host |
| HTTPS | 自動 Let's Encrypt | 自動 Let's Encrypt | cert-manager |
| 自動發現 | 手動新增 | 自動偵測 container | 自動偵測 Service |
| 健康檢查 | 無 | 有 | 有 |
| 管理方式 | Web GUI | 設定檔 / labels | YAML（宣告式） |

### 5.2 Ingress 的優勢

- 與 k8s 深度整合，自動追蹤 Service 和 Pod 的變化
- 宣告式管理，所有路由規則都在版本控制中
- 支援多種 Controller（Nginx、Traefik、HAProxy、Istio）

---

## 模組總結

通過本模組，我們掌握了：

1. **Ingress Controller**：叢集的統一流量入口
2. **路徑路由**：`/` → frontend、`/api` → backend
3. **域名路由**：`app.local` → frontend、`api.local` → backend
4. **TLS / HTTPS**：用 Secret 掛載憑證

### 核心洞察

- Ingress Controller 是必須安裝的組件，它不是 k8s 預設內建的
- Ingress 資源只是「規則定義」，真正執行的是 Controller
- 生產環境用 cert-manager 自動管理 HTTPS 憑證

## 自我檢驗

在進入下一模組前，請確認您能夠：
- [ ] 解釋 Ingress 和 Ingress Controller 的關係
- [ ] 設定路徑路由和域名路由
- [ ] 為 Ingress 配置 TLS / HTTPS
- [ ] 對比 Ingress 與 Docker 世界的 Nginx Proxy Manager / Traefik

## 下一步

服務可以對外存取了，但如何確保它一直「健康」地運行？如何做到零停機更新？進入[第六模組：健康檢查與進階部署](../module_6_health_deploy/)！
