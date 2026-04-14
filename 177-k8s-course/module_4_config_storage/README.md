# 第四模組：設定與儲存 - 外部化你的配置 (Config & Storage)

## 模組目標
學會將設定檔、敏感資料與持久化儲存從容器中抽離。

## 心智模型
**Config**：程式碼（Container Image）是廚師的手藝，不會因為換餐廳就改變。ConfigMap 就是「菜單」：不同餐廳（環境）可以掛不同菜單，廚師看菜單決定要煮什麼。Secret 則是「保險箱」：放食譜機密、供應商帳密，只有被授權的人能打開。重點是：手藝（Image）和菜單（Config）分離，同一個廚師可以在不同餐廳工作。

**Volume**：Pod 就像臨時工，隨時可能被換掉。如果資料放在臨時工的口袋裡（Container 內部），人走了資料也沒了。PersistentVolume 是公司的「個人置物櫃」：固定的、持久的儲存空間。PersistentVolumeClaim 是「置物櫃申請單」：員工填單申請，管理系統分配一個合適的櫃子。就算員工離職（Pod 被刪），櫃子和裡面的東西還在。

---

## 第一課：ConfigMap

### 1.1 為什麼需要 ConfigMap？

在 Docker 中，你這樣傳設定：
```bash
docker run -e DB_HOST=mysql -e DB_PORT=3306 my-app
```

問題是：
- 環境變數散落在 `docker run` 指令或 `docker-compose.yml` 中
- 同一個 image 在不同環境要改不同的設定
- 設定和部署混在一起，不好管理

**ConfigMap 把設定獨立出來**，跟 Image 和 Deployment 分開管理。

### 1.2 建立 ConfigMap 的三種方式

**方式一：從 YAML 定義**
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_HOST: "mysql"
  DB_PORT: "3306"
  APP_ENV: "production"
```

**方式二：從指令建立**
```bash
kubectl create configmap app-config \
  --from-literal=DB_HOST=mysql \
  --from-literal=DB_PORT=3306
```

**方式三：從檔案建立**
```bash
# 假設你有一個 app.conf 設定檔
kubectl create configmap app-config --from-file=app.conf
```

### 1.3 在 Pod 中使用 ConfigMap

**方式 A：掛載為環境變數**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "echo DB=$DB_HOST:$DB_PORT && sleep 3600"]
    envFrom:
    - configMapRef:
        name: app-config     # 把整個 ConfigMap 載入為環境變數
```

也可以只載入特定 key：
```yaml
    env:
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_HOST
```

**方式 B：掛載為檔案**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config     # 掛載到這個路徑
  volumes:
  - name: config-volume
    configMap:
      name: app-config           # 每個 key 會變成一個檔案
```

掛載後，容器內會看到：
```
/etc/config/DB_HOST    → 內容是 "mysql"
/etc/config/DB_PORT    → 內容是 "3306"
/etc/config/APP_ENV    → 內容是 "production"
```

### 1.4 練習：ConfigMap 實作

```bash
# 建立 ConfigMap
kubectl apply -f configmap.yaml

# 建立使用 ConfigMap 的 Pod
kubectl apply -f app-with-config.yaml

# 驗證
kubectl exec app -- env | grep DB
# DB_HOST=mysql
# DB_PORT=3306
```

---

## 第二課：Secret

### 2.1 Secret vs ConfigMap

| 面向 | ConfigMap | Secret |
|------|-----------|--------|
| 用途 | 一般設定（port、host、mode） | 敏感資料（密碼、API key、TLS 憑證） |
| 儲存方式 | 明文 | Base64 編碼（不是加密！） |
| 存取控制 | 無特殊限制 | 可用 RBAC 限制存取 |
| 對比 Docker | `-e APP_ENV=prod` | `-e DB_PASSWORD=secret` |

> **重要提醒**：Secret 的 Base64 只是編碼，不是加密。任何人取得 Secret 都能解碼。真正的安全要靠 RBAC 和加密 etcd。

### 2.2 建立 Secret

**從指令建立**：
```bash
kubectl create secret generic db-secret \
  --from-literal=DB_USER=admin \
  --from-literal=DB_PASSWORD='MyStr0ngP@ss!'
```

**從 YAML 建立**（需要先 Base64 編碼）：
```bash
echo -n 'admin' | base64           # YWRtaW4=
echo -n 'MyStr0ngP@ss!' | base64  # TXlTdHIwbmdQQHNzIQ==
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  DB_USER: YWRtaW4=
  DB_PASSWORD: TXlTdHIwbmdQQHNzIQ==
```

### 2.3 在 Pod 中使用 Secret

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-secret
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "echo User=$DB_USER && sleep 3600"]
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
```

使用方式跟 ConfigMap 幾乎一樣，只是來源從 `configMapKeyRef` 換成 `secretKeyRef`。

---

## 第三課：PersistentVolume 與 PersistentVolumeClaim

### 3.1 Docker Volume 的回顧

在 Docker 中：
```bash
docker run -v mysql-data:/var/lib/mysql mysql:8
```

`mysql-data` 是一個 named volume，資料存在 Docker 管理的路徑下。
容器刪了，volume 還在。但如果機器掛了，volume 也沒了。

### 3.2 k8s 的儲存架構

k8s 把儲存分成三層：

```
StorageClass（儲存類型的定義）
    │
    ▼
PersistentVolume（PV）── 實際的儲存空間（管理員建立 or 動態供應）
    │
    ▼
PersistentVolumeClaim（PVC）── Pod 的儲存申請單
    │
    ▼
Pod → volumeMounts（掛載到容器的路徑）
```

**比喻**：
- **StorageClass** = 儲存方案目錄（SSD、HDD、NFS）
- **PV** = 實際的置物櫃
- **PVC** = 置物櫃申請單
- **Pod** = 使用置物櫃的員工

### 3.3 臨時儲存：emptyDir

最簡單的 Volume，Pod 存在時才存在：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: temp-storage
spec:
  containers:
  - name: writer
    image: busybox
    command: ["sh", "-c", "echo hello > /data/test.txt && sleep 3600"]
    volumeMounts:
    - name: shared
      mountPath: /data
  - name: reader
    image: busybox
    command: ["sh", "-c", "cat /data/test.txt && sleep 3600"]
    volumeMounts:
    - name: shared
      mountPath: /data
  volumes:
  - name: shared
    emptyDir: {}
```

- Pod 建立時建立，Pod 刪除時刪除
- 適合 Multi-container Pod 之間共享暫時資料

### 3.4 持久化儲存：PV + PVC

**Step 1：建立 PersistentVolume（管理員做）**
```yaml
# pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce       # 單節點讀寫
  hostPath:
    path: /tmp/k8s-data   # 本機路徑（開發用）
```

**Step 2：建立 PersistentVolumeClaim（開發者做）**
```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

**Step 3：在 Pod 中使用**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-pvc
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: data
      mountPath: /usr/share/nginx/html
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc
```

```bash
kubectl apply -f pv.yaml
kubectl apply -f pvc.yaml
kubectl apply -f app-with-pvc.yaml

# 驗證綁定
kubectl get pv
kubectl get pvc
# STATUS 應該是 Bound
```

### 3.5 StorageClass 動態供應

手動建立 PV 很麻煩。StorageClass 讓 k8s 在有人申請 PVC 時**自動建立 PV**：

```yaml
# 使用預設的 StorageClass（minikube 已經有了）
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: auto-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
  # 不指定 storageClassName，使用叢集預設
```

```bash
kubectl apply -f auto-pvc.yaml
kubectl get pvc
# PV 會被自動建立並綁定
```

### 3.6 Access Modes

| 模式 | 簡寫 | 說明 |
|------|------|------|
| ReadWriteOnce | RWO | 單節點可讀寫 |
| ReadOnlyMany | ROX | 多節點可讀 |
| ReadWriteMany | RWX | 多節點可讀寫 |

> RWX 需要特定的儲存後端（如 NFS、CephFS），hostPath 只支援 RWO。

---

## 第四課：綜合實作 -- 部署 MySQL 並持久化

### 4.1 完整範例

把 ConfigMap、Secret、PVC 全部整合，部署一個有持久化儲存的 MySQL：

```yaml
# mysql-all.yaml

# ConfigMap：一般設定
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-config
data:
  MYSQL_DATABASE: "myapp"

---

# Secret：敏感資料
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: Opaque
stringData:                    # stringData 不需要手動 Base64
  MYSQL_ROOT_PASSWORD: "rootpass123"
  MYSQL_USER: "appuser"
  MYSQL_PASSWORD: "apppass456"

---

# PVC：儲存申請
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi

---

# Deployment：部署 MySQL
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        envFrom:
        - configMapRef:
            name: mysql-config
        - secretRef:
            name: mysql-secret
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-data
        persistentVolumeClaim:
          claimName: mysql-pvc

---

# Service：內部存取
apiVersion: v1
kind: Service
metadata:
  name: mysql-svc
spec:
  selector:
    app: mysql
  ports:
  - port: 3306
    targetPort: 3306
  type: ClusterIP
```

### 4.2 部署與驗證

```bash
kubectl apply -f mysql-all.yaml

# 等待 Pod 準備好
kubectl get pods -w

# 驗證資料庫可連線
kubectl exec -it $(kubectl get pod -l app=mysql -o name) -- \
  mysql -u appuser -papppass456 -e "SHOW DATABASES;"

# 測試持久化：刪除 Pod，資料還在
kubectl delete pod -l app=mysql
# 等新 Pod 建立後，再連進去看看資料是否還在
```

---

## 模組總結

通過本模組，我們學會了 k8s 的設定與儲存三大元件：

1. **ConfigMap**：一般設定的外部化（環境變數、設定檔）
2. **Secret**：敏感資料的管理（密碼、API Key）
3. **PV / PVC**：持久化儲存，資料不隨 Pod 消失

### 核心洞察

- Image 和 Config 分離是最佳實踐，同一個 Image 在不同環境用不同 ConfigMap
- Secret 的 Base64 不是加密，安全要靠 RBAC
- PVC 是「我要多大的儲存」，PV 是「實際的儲存空間」，StorageClass 讓兩者自動配對

## 自我檢驗

在進入下一模組前，請確認您能夠：
- [ ] 建立 ConfigMap 並在 Pod 中以環境變數和檔案兩種方式使用
- [ ] 建立 Secret 並掛載到 Pod
- [ ] 解釋 PV、PVC、StorageClass 的關係
- [ ] 部署一個帶持久化儲存的資料庫

## 下一步

應用跑起來了、設定和儲存也外部化了，但現在只能在叢集內部存取。接下來我們要學習如何讓外面的世界存取你的服務。進入[第五模組：流量入口 - Ingress 與對外服務](../module_5_ingress/)！
