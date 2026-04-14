# 最終模組：實戰整合 - 從 docker-compose 到 k8s (Hands-on Integration)

## 模組目標
將所有知識整合，完整走一遍從 Docker Compose 應用遷移到 k8s 的全流程。

## 心智模型
你之前用 Docker Compose 就像在夜市擺攤：每攤自己搞定水電（port）、招牌（domain）、倉庫（volume），簡單直接。現在要「進百貨公司（k8s）」：統一管理電力（Resource Limits）、統一門面（Ingress）、統一倉儲（PVC）、統一保全（RBAC）。這個模組就是完整走一遍：把一個 docker-compose.yml 的夜市攤位，升級成百貨公司裡的專櫃。

---

## 第一課：出發點 -- 一個 Docker Compose 應用

### 1.1 典型的三層應用

假設你現在有一個用 Docker Compose 運行的應用：

```yaml
# docker-compose.yml
services:
  frontend:
    image: nginx:1.25
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend

  backend:
    image: node:20-alpine
    working_dir: /app
    command: ["node", "server.js"]
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_PORT: "3306"
      DB_USER: appuser
      DB_PASSWORD: apppass456
      DB_NAME: myapp
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass123
      MYSQL_DATABASE: myapp
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass456
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

**三層架構**：
```
用戶 → Frontend (Nginx) → Backend (Node.js API) → Database (MySQL)
```

### 1.2 遷移清單

把 docker-compose.yml 拆解成 k8s 資源的對照：

| docker-compose | k8s 資源 | 說明 |
|--------|--------|--------|
| `services.frontend` | Deployment + Service | 前端 |
| `services.backend` | Deployment + Service | 後端 API |
| `services.db` | Deployment + Service | 資料庫 |
| `ports` | Service (NodePort / Ingress) | 對外暴露 |
| `environment` | ConfigMap + Secret | 設定與密碼 |
| `volumes: mysql-data` | PVC | 持久化儲存 |
| `depends_on` | Init Container / Readiness Probe | 啟動順序 |
| Nginx 反向代理 | Ingress | 域名/路徑路由 |

---

## 第二課：逐步轉換

### Step 1：建立 Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp
```

```bash
kubectl apply -f namespace.yaml
```

### Step 2：ConfigMap 與 Secret

```yaml
# config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: myapp
data:
  DB_HOST: "db-svc"
  DB_PORT: "3306"
  DB_NAME: "myapp"

---

apiVersion: v1
kind: Secret
metadata:
  name: db-secret
  namespace: myapp
type: Opaque
stringData:
  MYSQL_ROOT_PASSWORD: "rootpass123"
  MYSQL_USER: "appuser"
  MYSQL_PASSWORD: "apppass456"
  DB_USER: "appuser"
  DB_PASSWORD: "apppass456"
```

**對比 docker-compose**：原本散落在 `environment` 裡的設定，現在集中管理。

### Step 3：Database（MySQL）

```yaml
# database.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  namespace: myapp
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: db
  namespace: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: MYSQL_ROOT_PASSWORD
        - name: MYSQL_DATABASE
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: DB_NAME
        - name: MYSQL_USER
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: MYSQL_USER
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: MYSQL_PASSWORD
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "500m"
            memory: "1Gi"
        livenessProbe:
          tcpSocket:
            port: 3306
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - mysqladmin
            - ping
            - -h
            - localhost
          initialDelaySeconds: 20
          periodSeconds: 5
      volumes:
      - name: mysql-data
        persistentVolumeClaim:
          claimName: mysql-pvc

---

apiVersion: v1
kind: Service
metadata:
  name: db-svc
  namespace: myapp
spec:
  selector:
    app: db
  ports:
  - port: 3306
    targetPort: 3306
  type: ClusterIP
```

**對比 docker-compose**：
- `volumes: mysql-data` → PVC
- `environment` → ConfigMap + Secret
- 新增了 Resource Limits 和 Health Checks（docker-compose 沒有的）

### Step 4：Backend（Node.js API）

```yaml
# backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: myapp
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
      initContainers:
      - name: wait-for-db
        image: busybox
        command: ["sh", "-c", "until nc -z db-svc 3306; do echo waiting for db; sleep 2; done"]
      containers:
      - name: backend
        image: node:20-alpine
        workingDir: /app
        command: ["node", "server.js"]
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: backend-config
        env:
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: DB_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: DB_PASSWORD
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---

apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  namespace: myapp
spec:
  selector:
    app: backend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

**對比 docker-compose**：
- `depends_on: db` → Init Container（等待 db 可連線）
- `replicas: 2`（docker-compose 預設只有 1 個）
- 加了 Health Checks

### Step 5：Frontend（Nginx）

```yaml
# frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: myapp
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
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "50m"
            memory: "64Mi"
          limits:
            cpu: "200m"
            memory: "128Mi"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          periodSeconds: 5

---

apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
  namespace: myapp
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### Step 6：Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  namespace: myapp
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.local
    http:
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
              number: 3000
```

**對比 docker-compose**：原本用 `ports: "80:80"` 直接暴露，現在用 Ingress 統一管理。

---

## 第三課：部署與驗證

### 3.1 一鍵部署

```bash
# 按順序部署
kubectl apply -f namespace.yaml
kubectl apply -f config.yaml
kubectl apply -f database.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
kubectl apply -f ingress.yaml

# 或把所有檔案放在同一個目錄，一次部署
kubectl apply -f k8s/ -n myapp
```

### 3.2 驗證狀態

```bash
# 查看所有資源
kubectl get all -n myapp

# 查看 Pod 是否都 Running
kubectl get pods -n myapp -w

# 查看 Service
kubectl get svc -n myapp

# 查看 Ingress
kubectl get ingress -n myapp

# 查看 PVC 綁定
kubectl get pvc -n myapp
```

### 3.3 功能驗證

```bash
# 設定本機 hosts（指向 minikube IP）
# myapp.local → $(minikube ip)

# 測試前端
curl http://myapp.local

# 測試後端 API
curl http://myapp.local/api

# 測試資料庫連線
kubectl exec -n myapp -it $(kubectl get pod -n myapp -l app=db -o name) -- \
  mysql -u appuser -papppass456 -e "SHOW DATABASES;"
```

### 3.4 測試自動修復

```bash
# 刪除一個 backend Pod
kubectl delete pod -n myapp -l app=backend --wait=false

# 觀察自動重建
kubectl get pods -n myapp -w
```

---

## 第四課：對照總覽

### 4.1 docker-compose vs k8s 完整對照

```
docker-compose.yml              k8s 資源
──────────────                  ─────────
services:
  frontend:
    image: nginx               → Deployment (frontend)
    ports: "80:80"             → Service + Ingress
                               
  backend:                     
    image: node                → Deployment (backend)
    environment:               → ConfigMap + Secret
    depends_on: db             → Init Container
                               
  db:                          
    image: mysql               → Deployment (db)
    environment:               → ConfigMap + Secret
    volumes: mysql-data        → PVC
                               
volumes:                       
  mysql-data:                  → PersistentVolumeClaim

（docker-compose 沒有的）        → Resource Limits
                               → Health Checks (Probes)
                               → HPA (自動擴展)
                               → Namespace (環境隔離)
                               → Ingress (域名路由 + TLS)
```

### 4.2 k8s 多出來的好處

| 能力 | docker-compose | k8s |
|------|--------|--------|
| 自動修復 | 有限 (restart) | 完整 (重建 Pod) |
| 水平擴展 | 手動 scale | HPA 自動 |
| 零停機更新 | 不支援 | Rolling Update |
| 域名路由 | 需額外 reverse proxy | Ingress 內建 |
| 資源隔離 | 不支援 | Requests / Limits |
| 健康檢查 | 有限 | 三種 Probe |
| 環境隔離 | 不同 compose 檔案 | Namespace |
| 密碼管理 | .env 檔案 | Secret + RBAC |

---

## 第五課：生產環境安全補充

### 5.1 RBAC -- 誰能做什麼？

RBAC（Role-Based Access Control）控制「誰」能對「什麼資源」做「什麼操作」：

```yaml
# 建立一個只能查看 Pod 的角色
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: myapp
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]

---

# 把角色綁定到使用者
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: myapp
subjects:
- kind: User
  name: developer
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

**心智模型**：RBAC 就是門禁卡系統 -- developer 拿到 pod-reader 這張卡，只能看 Pod，不能刪也不能改。

### 5.2 NetworkPolicy -- 誰能跟誰通訊？

預設情況下，k8s 叢集裡所有 Pod 都能互相通訊。NetworkPolicy 讓你限制：

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-policy
  namespace: myapp
spec:
  podSelector:
    matchLabels:
      app: db
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: backend       # 只有 backend 能存取 db
    ports:
    - port: 3306
```

**心智模型**：NetworkPolicy 就是防火牆規則 -- 只有 backend 可以跟 db 說話，frontend 不行。

### 5.3 Pod Security Standards

限制 Pod 能做的事，防止安全風險：

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp
  labels:
    pod-security.kubernetes.io/enforce: restricted
```

**restricted** 模式禁止：
- 以 root 身份運行
- 使用特權模式
- 掛載 hostPath
- 使用 hostNetwork

---

## 第六課：常用 kubectl 指令速查表

### 基本操作
```bash
kubectl get <resource>                    # 列出資源
kubectl describe <resource> <name>        # 查看詳情
kubectl delete <resource> <name>          # 刪除資源
kubectl apply -f <file.yaml>              # 建立/更新資源
kubectl edit <resource> <name>            # 直接編輯
```

### Pod 操作
```bash
kubectl logs <pod> [-f] [-c container]    # 查看日誌
kubectl exec -it <pod> -- /bin/sh         # 進入容器
kubectl port-forward <pod> 8080:80        # 暫時轉發 port
kubectl top pod                           # 查看資源使用
```

### Deployment 操作
```bash
kubectl scale deployment <name> --replicas=N    # 擴縮容
kubectl set image deployment/<name> <c>=<img>   # 更新 image
kubectl rollout status deployment/<name>        # 查看更新狀態
kubectl rollout undo deployment/<name>          # 回滾
kubectl rollout history deployment/<name>       # 更新歷史
```

### 除錯
```bash
kubectl get pods -w                       # 即時追蹤狀態
kubectl get events --sort-by='.lastTimestamp'  # 查看事件
kubectl describe pod <name>               # 看 Events 段落
kubectl logs <pod> --previous             # 看之前 crash 的日誌
kubectl get pods -o wide                  # 看 Pod 所在節點
```

### Helm
```bash
helm repo add <name> <url>               # 添加倉庫
helm search repo <keyword>               # 搜尋 Chart
helm install <release> <chart>            # 安裝
helm upgrade <release> <chart>            # 升級
helm rollback <release> [revision]        # 回滾
helm uninstall <release>                  # 解除安裝
helm list                                 # 列出已安裝
helm show values <chart>                  # 查看可用參數
```

---

## 模組總結

恭喜！通過這個最終模組，您已經完成了從 Docker 到 k8s 的完整旅程：

1. **完整遷移**：把 docker-compose.yml 逐步轉換為 k8s 資源
2. **全套整合**：Namespace + ConfigMap + Secret + PVC + Deployment + Service + Ingress + Probes
3. **生產安全**：RBAC、NetworkPolicy、Pod Security Standards
4. **工具速查**：kubectl 和 Helm 常用指令

### 核心洞察

- docker-compose 是起點，k8s 是終點。兩者的概念是對應的，只是 k8s 多了很多生產級的能力
- 遷移不是「推翻重來」，而是「逐步升級」：每個 docker-compose 的元素都有對應的 k8s 資源
- k8s 的複雜度是有代價的，但換來的是自動修復、自動擴展、零停機更新

## 自我檢驗

完成課程後，請確認您能夠：
- [ ] 把一個 docker-compose.yml 拆解為對應的 k8s 資源
- [ ] 獨立部署一個包含 Frontend + Backend + DB 的完整應用
- [ ] 為應用配置 Health Checks、Resource Limits、Ingress
- [ ] 解釋 RBAC 和 NetworkPolicy 的作用
- [ ] 使用 Helm 部署和管理第三方應用
- [ ] 排查常見的 Pod 問題（CrashLoopBackOff、ImagePullBackOff、Pending）

## 課程完結

通過這套課程，您已經從熟悉的 Docker 世界出發，建立起對 Kubernetes 堅實而全面的理解。您具備了獨立部署、管理與除錯 k8s 應用的實戰能力，可以自信地在生產環境中使用 k8s。

**建議的下一步**：
- 在真實的雲端環境（AWS EKS / GCP GKE / Azure AKS）部署叢集
- 學習 CI/CD 整合（GitOps / ArgoCD）
- 探索 Service Mesh（Istio / Linkerd）
- 深入 k8s 安全（OPA / Falco）
