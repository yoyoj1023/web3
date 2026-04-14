# 第六模組：健康檢查與進階部署 (Health Checks & Advanced Deployment)

## 模組目標
確保應用不只「活著」，而且「健康地服務中」，並掌握零停機部署策略。

## 心智模型
三種探針就像醫院的三種健檢。**Startup Probe** = 新生兒檢查：應用剛啟動時，先確認它成功「出生」了，還沒好之前不會被誤判為壞掉。**Liveness Probe** = 定期體檢：持續確認應用還「活著」，如果心跳停了（檢查失敗），直接重啟搶救。**Readiness Probe** = 上班前量體溫：確認應用已「準備好」接客，沒準備好就先不分配流量給它。三種探針各有職責，確保你的應用不只「活著」，而且「健康地服務中」。

---

## 第一課：Health Checks -- 三種探針

### 1.1 為什麼需要健康檢查？

沒有健康檢查的世界：
- 應用 crash 了 → k8s 能偵測到（程序退出），會重啟
- 應用**沒有 crash 但卡住了**（deadlock、記憶體洩漏）→ k8s 以為它還活著，繼續送流量給它 → 用戶看到 502

健康檢查讓 k8s 知道應用的**真實健康狀態**，不只是「有沒有在跑」。

### 1.2 Liveness Probe -- 你還活著嗎？

**用途**：偵測應用是否卡死，如果失敗就重啟容器。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5      # 啟動後等 5 秒才開始檢查
          periodSeconds: 10            # 每 10 秒檢查一次
          failureThreshold: 3          # 連續失敗 3 次才判定為不健康
```

**運作流程**：
1. Pod 啟動後等 5 秒
2. 每 10 秒向 `http://localhost:80/` 發送 GET 請求
3. 回傳 2xx/3xx → 健康
4. 連續 3 次失敗 → 重啟容器

### 1.3 Readiness Probe -- 你準備好接客了嗎？

**用途**：決定 Pod 是否可以接收流量。如果失敗，Service 不會把流量導過來。

```yaml
        readinessProbe:
          httpGet:
            path: /healthz
            port: 80
          initialDelaySeconds: 3
          periodSeconds: 5
```

**Liveness vs Readiness 的差別**：

| 面向 | Liveness | Readiness |
|------|----------|-----------|
| 失敗後果 | **重啟**容器 | **停止分配流量**（不重啟） |
| 用途 | 偵測卡死 | 偵測尚未準備好 |
| 典型場景 | 應用 deadlock | 啟動中、正在載入快取 |

### 1.4 Startup Probe -- 你啟動完了嗎？

**用途**：保護啟動時間很長的應用。在 Startup Probe 成功前，Liveness 和 Readiness 不會開始檢查。

```yaml
        startupProbe:
          httpGet:
            path: /healthz
            port: 80
          failureThreshold: 30        # 最多等 30 次
          periodSeconds: 10            # 每 10 秒檢查 → 最多等 300 秒
```

**為什麼需要 Startup Probe？**

如果你的 Java 應用啟動需要 60 秒，但 Liveness Probe 在 5 秒後就開始檢查：
- 5 秒後檢查 → 失敗（還在啟動）
- 15 秒後第 3 次失敗 → 重啟
- 重啟後又等 5 秒 → 又失敗
- **無限重啟迴圈！**

有了 Startup Probe，它會先等應用啟動完，再交棒給 Liveness。

### 1.5 三種檢查方式

```yaml
# HTTP GET（最常用）
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080

# TCP Socket（檢查 port 是否開啟）
livenessProbe:
  tcpSocket:
    port: 3306           # 適合資料庫

# 執行指令
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy        # 檔案存在就健康
```

### 1.6 練習：觀察探針行為

```yaml
# probe-demo.yaml
apiVersion: v1
kind: Pod
metadata:
  name: probe-demo
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "touch /tmp/healthy; sleep 30; rm /tmp/healthy; sleep 600"]
    livenessProbe:
      exec:
        command: ["cat", "/tmp/healthy"]
      initialDelaySeconds: 5
      periodSeconds: 5
```

```bash
kubectl apply -f probe-demo.yaml
kubectl get pod probe-demo -w

# 前 30 秒：正常運行
# 30 秒後：/tmp/healthy 被刪除，探針失敗
# 約 45 秒後：container 被重啟（RESTARTS +1）
```

---

## 第二課：滾動更新與回滾

### 2.1 Rolling Update -- 零停機更新

**Docker 的方式**：
```bash
docker stop web && docker rm web && docker run --name web new-image:v2
# 中間有停機時間
```

**k8s 的方式**：
```bash
# 改 image 版本
kubectl set image deployment/web nginx=nginx:1.26

# 或修改 YAML 後 apply
kubectl apply -f deployment.yaml
```

k8s 會自動執行滾動更新：

```
舊版 Pod: ●●●
新版 Pod:

Step 1: 建立一個新版 Pod
舊版 Pod: ●●●
新版 Pod: ◐

Step 2: 新版就緒，移除一個舊版
舊版 Pod: ●●
新版 Pod: ●

Step 3: 繼續...
舊版 Pod: ●
新版 Pod: ●●

Step 4: 完成
舊版 Pod:
新版 Pod: ●●●
```

### 2.2 更新策略參數

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1            # 更新時最多多出 1 個 Pod
      maxUnavailable: 0      # 更新時不允許任何 Pod 不可用
```

| 參數 | 說明 | 預設 |
|------|------|------|
| maxSurge | 允許超出 replicas 的 Pod 數量 | 25% |
| maxUnavailable | 允許不可用的 Pod 數量 | 25% |

**保守設定**（零停機）：
```yaml
maxSurge: 1
maxUnavailable: 0
```

**激進設定**（快速更新）：
```yaml
maxSurge: 50%
maxUnavailable: 50%
```

### 2.3 觀察更新過程

```bash
# 觸發更新
kubectl set image deployment/web nginx=nginx:1.26

# 即時觀察
kubectl rollout status deployment/web

# 查看更新歷史
kubectl rollout history deployment/web
```

### 2.4 回滾

```bash
# 回滾到上一版
kubectl rollout undo deployment/web

# 回滾到指定版本
kubectl rollout history deployment/web
kubectl rollout undo deployment/web --to-revision=2

# 驗證
kubectl rollout status deployment/web
```

---

## 第三課：資源管理

### 3.1 為什麼要設定資源限制？

沒有限制的世界：
- 一個 Pod 消耗了節點所有的 CPU / Memory
- 其他 Pod 因為資源不足被驅逐（Evicted）
- 整個節點變得不穩定

### 3.2 Requests 與 Limits

```yaml
containers:
- name: app
  image: my-app
  resources:
    requests:
      cpu: "250m"          # 最少需要 0.25 核 CPU
      memory: "128Mi"      # 最少需要 128 MB 記憶體
    limits:
      cpu: "500m"          # 最多使用 0.5 核 CPU
      memory: "256Mi"      # 最多使用 256 MB 記憶體
```

| 概念 | 說明 | 類比 |
|------|------|------|
| **Requests** | 排程時的保證資源 | 預訂座位 |
| **Limits** | 運行時的最大上限 | 消費上限 |

**CPU 單位**：`1` = 1 核、`500m` = 0.5 核、`250m` = 0.25 核
**記憶體單位**：`128Mi` = 128 MiB、`1Gi` = 1 GiB

### 3.3 超出 Limits 的後果

| 資源 | 超過 Requests | 超過 Limits |
|------|---------|---------|
| CPU | 被節流（throttle），變慢但不會死 | 被節流 |
| Memory | 正常使用 | **OOMKilled**（直接被殺） |

```bash
# 觀察 OOMKilled
kubectl get pods
# NAME    READY   STATUS      RESTARTS
# app     0/1     OOMKilled   3
```

### 3.4 建議做法

- **永遠設定 Requests 和 Limits**
- Requests 設為應用正常運行所需的資源
- Limits 設為 Requests 的 1.5~2 倍，留一些彈性
- Memory Limits 要設準，超過就會 OOMKilled

---

## 第四課：HPA -- 自動水平擴展

### 4.1 什麼是 HPA？

HPA（Horizontal Pod Autoscaler）根據 CPU / Memory 使用率自動調整 Pod 數量。

**對比手動 Scale**：
```bash
# 手動（你看到 CPU 高了，自己加副本）
kubectl scale deployment web --replicas=5

# HPA（系統自動加減副本）
# CPU > 70% → 加 Pod
# CPU < 70% → 減 Pod
```

### 4.2 前置條件

HPA 需要 Metrics Server 來取得 CPU / Memory 數據：

```bash
# minikube 已經有了
minikube addons enable metrics-server

# 驗證
kubectl top nodes
kubectl top pods
```

### 4.3 建立 HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70    # CPU 平均使用率 > 70% 就擴展
```

也可以用指令快速建立：
```bash
kubectl autoscale deployment web --min=2 --max=10 --cpu-percent=70
```

### 4.4 模擬壓力測試

```bash
# 確保 Deployment 有設定 resources.requests
# 在另一個終端產生負載
kubectl run load-generator --image=busybox --command -- \
  sh -c "while true; do wget -qO- http://web-svc; done"

# 觀察 HPA 行為
kubectl get hpa -w
# TARGETS    MINPODS   MAXPODS   REPLICAS
# 10%/70%    2         10        2
# 85%/70%    2         10        2      ← CPU 超過 70%
# 85%/70%    2         10        4      ← 自動擴展到 4

# 停止負載
kubectl delete pod load-generator

# 觀察縮容（需要幾分鐘）
kubectl get hpa -w
# REPLICAS 會逐步降回 2
```

---

## 模組總結

通過本模組，我們掌握了：

1. **三種探針**：Liveness（活著嗎）、Readiness（準備好了嗎）、Startup（啟動完了嗎）
2. **滾動更新**：零停機更新，一鍵回滾
3. **資源管理**：Requests 保證、Limits 上限，避免 OOMKilled
4. **HPA**：根據 CPU / Memory 自動擴縮

### 核心洞察

- 沒有 Readiness Probe，更新時可能有短暫停機（新 Pod 還沒準備好就接到流量）
- 沒有 Resource Limits，一個失控的 Pod 可能拖垮整個節點
- HPA 是 k8s 「自動擴展」的基石，但需要先設定好 Requests

## 自我檢驗

在進入下一模組前，請確認您能夠：
- [ ] 區分 Liveness、Readiness、Startup Probe 的用途
- [ ] 為 Deployment 設定滾動更新策略
- [ ] 設定 Resource Requests 和 Limits
- [ ] 建立 HPA 並理解其運作方式
- [ ] 使用 `kubectl rollout undo` 回滾

## 下一步

應用的部署和管理已經很完善了。但隨著服務越來越多，YAML 也越來越多。接下來我們學習用 Helm 簡化管理，同時建立監控能力。進入[第七模組：Helm 套件管理與監控](../module_7_helm_monitoring/)！
