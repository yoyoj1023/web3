# 第二模組：最小運行單位 - Pod 的世界 (The Pod)

## 模組目標
深入理解 Pod 的結構、定義方式與生命週期。

## 心智模型
Container 是便當裡的一道菜（主菜、配菜），Pod 是裝這些菜的「便當盒」。同一個便當盒裡的菜共享同一組餐具（網路、儲存），一起被端上桌、一起被收走。大多數時候一個便當盒只裝一道主菜（一個 Container），但偶爾你需要加配菜（Sidecar）來輔助。

---

## 第一課：Pod 與 Container 的關係

### 1.1 為什麼不直接用 Container？

在 Docker 中，Container 就是最小單位。但 k8s 多了一層「Pod」的抽象，原因是：

**共享資源的需求**
有些容器天生需要緊密合作。例如：
- 你的 Web 應用 + 一個日誌收集器（它們需要共用同一個日誌目錄）
- 你的 API 服務 + 一個 OAuth 代理（它們需要共用 localhost）

在 Docker 中，你需要用 volume 和 network 來手動連接。在 k8s 中，放在同一個 Pod 裡就自動共享了。

### 1.2 Pod 內部的共享機制

同一個 Pod 裡的所有 Container 共享：

**網路**
- 共用同一個 IP 位址
- Container 之間可以用 `localhost` 互通
- 對外只有一個 IP（Pod IP）

**儲存**
- 可以掛載相同的 Volume
- 多個 Container 同時讀寫同一個目錄

**生命週期**
- 一起建立、一起銷毀
- Pod 被刪除時，裡面所有 Container 都會被終止

```
┌─────────────── Pod ───────────────┐
│                                    │
│  ┌────────────┐  ┌────────────┐   │
│  │ Container A│  │ Container B│   │
│  │  (web app) │  │ (log agent)│   │
│  └──────┬─────┘  └──────┬─────┘   │
│         │               │          │
│    ┌────┴───────────────┴────┐     │
│    │   共享 Volume（日誌目錄） │     │
│    └─────────────────────────┘     │
│                                    │
│    共享 Network（同一個 IP）         │
│    Pod IP: 10.244.0.5              │
└────────────────────────────────────┘
```

### 1.3 一個 Pod 一個 Container 是常態

雖然 Pod 可以包含多個 Container，但**絕大多數情況下是一對一**。Multi-container 只在有明確的共享需求時才使用。

**經驗法則**：如果兩個服務可以獨立部署、獨立擴展，就應該放在不同的 Pod 裡。

---

## 第二課：用 YAML 定義 Pod

### 2.1 從 docker run 到 YAML

**Docker 的方式**：
```bash
docker run -d \
  --name web \
  -p 80:80 \
  -e APP_ENV=production \
  nginx:1.25
```

**等價的 k8s Pod YAML**：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  containers:
  - name: web
    image: nginx:1.25
    ports:
    - containerPort: 80
    env:
    - name: APP_ENV
      value: "production"
```

### 2.2 YAML 四大區塊

每個 k8s 資源的 YAML 都有固定的四個區塊：

```yaml
apiVersion: v1          # 1. API 版本：這個資源用哪個版本的 API
kind: Pod               # 2. 資源類型：Pod、Deployment、Service 等
metadata:               # 3. 元資料：名稱、標籤、命名空間
  name: web
  labels:
    app: web
spec:                   # 4. 規格：你要的具體配置（每種資源不同）
  containers:
  - name: web
    image: nginx:1.25
```

**對應 Docker 的參數**：

| Docker 參數 | YAML 欄位 | 位置 |
|---------|---------|---------|
| `--name web` | `metadata.name` | metadata |
| `nginx:1.25` | `spec.containers[].image` | spec |
| `-p 80:80` | `spec.containers[].ports[].containerPort` | spec |
| `-e APP_ENV=prod` | `spec.containers[].env[]` | spec |

### 2.3 部署與管理

```bash
# 建立 Pod
kubectl apply -f pod.yaml

# 查看狀態
kubectl get pods

# 查看詳情
kubectl describe pod web

# 刪除
kubectl delete -f pod.yaml
# 或
kubectl delete pod web
```

### 2.4 練習：建立一個帶環境變數的 Pod

建立 `my-app.yaml`：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
  labels:
    app: demo
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "echo Hello $MY_NAME && sleep 3600"]
    env:
    - name: MY_NAME
      value: "Kubernetes"
```

```bash
kubectl apply -f my-app.yaml
kubectl logs my-app
# 輸出：Hello Kubernetes
```

---

## 第三課：Multi-container Pod 模式

### 3.1 Sidecar 模式

**場景**：你的主應用把日誌寫到檔案，需要一個 agent 把日誌送到集中式日誌系統。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-logging
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "while true; do echo $(date) - app running >> /var/log/app.log; sleep 5; done"]
    volumeMounts:
    - name: log-volume
      mountPath: /var/log
  - name: log-agent
    image: busybox
    command: ["sh", "-c", "tail -f /var/log/app.log"]
    volumeMounts:
    - name: log-volume
      mountPath: /var/log
  volumes:
  - name: log-volume
    emptyDir: {}
```

- `app` 容器把日誌寫到 `/var/log/app.log`
- `log-agent` 容器從同一個目錄讀取日誌
- 兩者透過 `emptyDir` Volume 共享目錄

```bash
kubectl apply -f app-with-logging.yaml
kubectl logs app-with-logging -c log-agent
# 會看到 app 容器產生的日誌
```

### 3.2 Init Container 模式

**場景**：你的主應用啟動前，需要先等資料庫準備好。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
spec:
  initContainers:
  - name: wait-for-db
    image: busybox
    command: ["sh", "-c", "echo Waiting for DB...; sleep 10; echo DB ready!"]
  containers:
  - name: app
    image: nginx
```

- `initContainers` 裡的容器會**先於**主容器執行
- Init Container 執行成功後（exit code 0），主容器才會啟動
- 如果 Init Container 失敗，k8s 會不斷重試

**對比 Docker Compose**：你可能用過 `depends_on` 或 `wait-for-it.sh`，Init Container 是 k8s 的原生解決方案。

### 3.3 何時該用 Multi-container？

| 模式 | 使用場景 | 例子 |
|------|---------|------|
| **Sidecar** | 輔助功能（日誌、監控、代理） | log agent, proxy, config reloader |
| **Init Container** | 啟動前的初始化 | 等待依賴、下載設定檔、資料庫遷移 |
| **單一 Container** | 大多數情況 | 獨立的 Web 應用、API、Worker |

---

## 第四課：Pod 生命週期

### 4.1 狀態流轉

```
Pending ──→ Running ──→ Succeeded
                    └──→ Failed
```

| 狀態 | 含義 | 常見原因 |
|------|------|---------|
| **Pending** | Pod 已被接受，但尚未運行 | 正在下載 image、等待排程到節點 |
| **Running** | 至少一個 Container 在運行 | 正常運行中 |
| **Succeeded** | 所有 Container 正常結束（exit 0） | 一次性任務完成 |
| **Failed** | 至少一個 Container 以非零 exit code 結束 | 程式錯誤、設定錯誤 |
| **CrashLoopBackOff** | Container 反覆 crash 並重啟 | 啟動失敗、依賴缺失 |

### 4.2 觀察 Pod 狀態變化

```bash
# 即時追蹤 Pod 狀態
kubectl get pods -w

# 在另一個終端建立 Pod，觀察狀態從 Pending → ContainerCreating → Running
kubectl run test --image=nginx
```

### 4.3 Pod 的重啟策略

```yaml
spec:
  restartPolicy: Always    # 預設值：永遠重啟
  # restartPolicy: OnFailure  # 只在失敗時重啟
  # restartPolicy: Never       # 永不重啟
```

- `Always`：適用於長期運行的服務（Web Server、API）
- `OnFailure`：適用於一次性任務（批次處理、資料遷移）
- `Never`：適用於除錯

### 4.4 為什麼不應該直接管理 Pod？

你可能已經注意到：直接用 `kubectl run` 或 Pod YAML 建立的 Pod，如果掛了就真的掛了。

```bash
# 建立一個 Pod
kubectl run lonely-pod --image=nginx

# 手動刪除它（模擬故障）
kubectl delete pod lonely-pod

# 它不會回來了！沒有人會幫它重建
kubectl get pods
# 空的
```

**這就是為什麼我們需要 Deployment** -- 下一個模組的主角。Deployment 會確保即使 Pod 死了，也會自動被重建。

---

## 模組總結

通過本模組，我們深入理解了：

1. **Pod 是 k8s 的最小運行單位**，不是 Container
2. **Pod 內的 Container 共享**網路和儲存
3. **YAML 是 k8s 的語言**，四大區塊：apiVersion、kind、metadata、spec
4. **Multi-container 模式**：Sidecar 和 Init Container 各有用途
5. **Pod 會死**：直接管理 Pod 沒有自動修復能力

### 核心洞察

- 一個 Pod 一個 Container 是常態，Multi-container 是特例
- YAML 就是你對 k8s 的「宣告」，`kubectl apply` 就是提交宣告
- Pod 是「凡人」，會死會掛。你需要更高層的抽象（Deployment）來管理它

## 自我檢驗

在進入下一模組前，請確認您能夠：
- [ ] 解釋 Pod 和 Container 的關係
- [ ] 寫出一個基本的 Pod YAML
- [ ] 理解 Sidecar 和 Init Container 的使用場景
- [ ] 解釋為什麼不應該直接管理 Pod

## 下一步

Pod 是會死的凡人，我們需要一個「經理」來管理它們。進入[第三模組：應用管理 - Deployment 與 Service](../module_3_deployment_service/)！
