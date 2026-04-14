# 第三模組：應用管理 - Deployment 與 Service (Deployment & Service)

## 模組目標
掌握 k8s 中最常用的兩大元件，實現應用的副本管理與網路存取。

## 心智模型
**Deployment**：你是餐廳經理，說「我要 3 個服務生在場」，ReplicaSet 是排班表，負責隨時補人。有人請假（Pod 掛了）？排班表自動叫人補上。要擴大營業？你改一下數字就好。你不需要親自找人，只需宣告需求。

**Service**：員工（Pod）可能換座位、離職、新到任，分機號碼（Pod IP）一直在變。但客戶不需要知道這些，他們只要撥「總機號碼」（Service IP / DNS），總機會自動轉接到當前在位的員工。

---

## 第一課：為什麼不直接管理 Pod？

### 1.1 Pod 是凡人

在上一模組的最後，我們看到了問題：

```bash
kubectl run web --image=nginx
kubectl delete pod web
# Pod 就這樣消失了，沒有人幫它重建
```

在生產環境中，Pod 會因為各種原因消失：
- 節點故障（機器掛了）
- 資源不足（被系統驅逐）
- 應用 crash（程式錯誤）

**我們需要一個「管理者」，確保永遠有足夠的 Pod 在運行。**

### 1.2 k8s 的資源層級

```
Deployment（你操作的對象）
    └── ReplicaSet（自動管理，通常不直接操作）
            └── Pod（實際運行的容器）
                    └── Container（你的應用）
```

- **Deployment**：定義「我要什麼版本的應用、跑幾個副本」
- **ReplicaSet**：確保「當前有 N 個 Pod 在跑」
- **Pod**：實際運行容器的載體

---

## 第二課：Deployment

### 2.1 建立你的第一個 Deployment

**對比 Docker Compose**：
```yaml
# docker-compose.yml
services:
  web:
    image: nginx:1.25
    deploy:
      replicas: 3
```

**k8s Deployment**：
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
```

```bash
kubectl apply -f deployment.yaml
```

### 2.2 解讀 Deployment YAML

```yaml
spec:
  replicas: 3              # 我要 3 個副本
  selector:
    matchLabels:
      app: web             # 用 label 找到屬於這個 Deployment 的 Pod
  template:                # Pod 的模板（每個副本長什麼樣）
    metadata:
      labels:
        app: web           # Pod 的標籤（必須跟 selector 對應）
    spec:
      containers:          # 容器定義（跟 Pod YAML 一樣）
      - name: nginx
        image: nginx:1.25
```

**關鍵概念 -- Label 與 Selector**：
- Label 是貼在資源上的標籤（key-value pair）
- Selector 是用來篩選 label 的條件
- Deployment 透過 selector 找到「屬於它的 Pod」

### 2.3 驗證自動修復

```bash
# 查看 Deployment 建立的 3 個 Pod
kubectl get pods
# NAME                   READY   STATUS    RESTARTS   AGE
# web-6b7f4d9c5-abc12   1/1     Running   0          30s
# web-6b7f4d9c5-def34   1/1     Running   0          30s
# web-6b7f4d9c5-ghi56   1/1     Running   0          30s

# 手動刪除一個 Pod（模擬故障）
kubectl delete pod web-6b7f4d9c5-abc12

# 馬上再看
kubectl get pods
# 你會看到新的 Pod 已經被自動建立！
# web-6b7f4d9c5-xyz99   1/1     Running   0          5s   ← 新的
# web-6b7f4d9c5-def34   1/1     Running   0          2m
# web-6b7f4d9c5-ghi56   1/1     Running   0          2m
```

這就是 Deployment + ReplicaSet 的威力：你刪一個，它補一個。永遠維持 3 個。

### 2.4 Scale 擴縮容

```bash
# 方法一：用指令
kubectl scale deployment web --replicas=5

# 方法二：改 YAML 後 apply
# 將 replicas: 3 改成 replicas: 5
kubectl apply -f deployment.yaml

# 查看結果
kubectl get pods
# 現在有 5 個 Pod 了
```

**縮容**：
```bash
kubectl scale deployment web --replicas=2
# k8s 會自動終止多餘的 Pod
```

### 2.5 查看 Deployment 狀態

```bash
# 簡要狀態
kubectl get deployment
# NAME   READY   UP-TO-DATE   AVAILABLE   AGE
# web    3/3     3            3           5m

# 詳細資訊
kubectl describe deployment web

# 查看 ReplicaSet
kubectl get replicaset
```

---

## 第三課：Service -- 穩定的存取入口

### 3.1 問題：Pod IP 不穩定

每次 Pod 重建，它的 IP 就會改變：

```bash
kubectl get pods -o wide
# NAME                   ... IP
# web-6b7f4d9c5-abc12   ... 10.244.0.5
# web-6b7f4d9c5-def34   ... 10.244.0.6

# 刪掉 abc12，新建一個
# web-6b7f4d9c5-xyz99   ... 10.244.0.8  ← IP 變了！
```

如果你的前端應用把 API 地址寫死為 `10.244.0.5`，Pod 一重建就連不上了。

**Service 就是來解決這個問題的。**

### 3.2 Service 是什麼？

Service 提供一個**穩定的 IP 和 DNS 名稱**，自動將流量分配到背後的 Pod。

```
              ┌──────────┐
              │  Service  │
              │ web-svc   │
              │ 10.96.0.1 │
              └─────┬─────┘
          ┌─────────┼─────────┐
          ▼         ▼         ▼
      ┌───────┐ ┌───────┐ ┌───────┐
      │ Pod 1 │ │ Pod 2 │ │ Pod 3 │
      └───────┘ └───────┘ └───────┘
```

不管 Pod 怎麼重建、IP 怎麼變，Service 的 IP 和 DNS 始終不變。

### 3.3 建立 ClusterIP Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web          # 找到 label 是 app=web 的 Pod
  ports:
  - port: 80          # Service 暴露的 port
    targetPort: 80    # 轉發到 Pod 的 port
  type: ClusterIP     # 預設類型
```

```bash
kubectl apply -f service.yaml

# 查看 Service
kubectl get svc
# NAME      TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE
# web-svc   ClusterIP   10.96.0.123   <none>        80/TCP    10s
```

**叢集內部存取**：
```bash
# 在叢集內的任何 Pod 中，都可以用 DNS 存取
kubectl run test --image=busybox --command -- sleep 3600
kubectl exec -it test -- wget -qO- http://web-svc
# 會回傳 Nginx 歡迎頁面
```

### 3.4 四種 Service 類型

| 類型 | 對比 Docker | 存取範圍 | 使用場景 |
|------|---------|---------|---------|
| **ClusterIP** | 內部 network | 叢集內部 | 後端 API、資料庫（內部服務） |
| **NodePort** | `-p 30080:80` | 叢集外部（透過節點 IP） | 開發測試、簡單暴露 |
| **LoadBalancer** | 不支援 | 叢集外部（雲端 LB） | 生產環境對外服務 |
| **ExternalName** | 無 | DNS 轉發 | 指向外部服務 |

**NodePort 範例**：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080       # 固定的外部 port（30000-32767）
  type: NodePort
```

```bash
kubectl apply -f service-nodeport.yaml

# minikube 快速存取
minikube service web-nodeport
# 會自動打開瀏覽器
```

### 3.5 Service 如何找到 Pod？-- Label Selector

Service 和 Deployment 一樣，用 Label Selector 找到目標 Pod：

```yaml
# Deployment 的 Pod 模板
template:
  metadata:
    labels:
      app: web        # Pod 的標籤

# Service 的 selector
spec:
  selector:
    app: web          # 找到 label 是 app=web 的 Pod
```

**只要 label 匹配，Service 就會自動追蹤 Pod 的變化**（新增、刪除、IP 變更）。

### 3.6 Service 的 DNS

k8s 內建 DNS 服務。每個 Service 建立後，自動獲得一個 DNS 名稱：

```
<service-name>.<namespace>.svc.cluster.local
```

實際使用時通常簡寫：
```
web-svc                        # 同 namespace 內
web-svc.default                # 指定 namespace
web-svc.default.svc.cluster.local  # 完整 FQDN
```

---

## 第四課：Namespace -- 邏輯隔離

### 4.1 什麼是 Namespace？

Namespace 就像「資料夾」，用來隔離不同的環境或團隊：

```bash
kubectl get namespaces
# NAME              STATUS   AGE
# default           Active   1d    ← 你一直在用的
# kube-system       Active   1d    ← k8s 系統組件
# kube-public       Active   1d    ← 公開資源
```

### 4.2 建立和使用 Namespace

```bash
# 建立
kubectl create namespace dev
kubectl create namespace staging
kubectl create namespace prod

# 在指定 namespace 部署
kubectl apply -f deployment.yaml -n dev

# 查看指定 namespace 的資源
kubectl get pods -n dev
kubectl get svc -n dev

# 查看所有 namespace
kubectl get pods -A
```

### 4.3 使用場景

```
┌─── dev ────────┐  ┌─── staging ────┐  ┌─── prod ────────┐
│ web (1 replica) │  │ web (2 replicas)│  │ web (5 replicas) │
│ api (1 replica) │  │ api (2 replicas)│  │ api (5 replicas) │
│ db  (1 replica) │  │ db  (1 replica) │  │ db  (3 replicas) │
└─────────────────┘  └─────────────────┘  └──────────────────┘
```

- 不同 namespace 的資源名稱可以重複（都叫 `web` 沒關係）
- 可以對 namespace 設定資源配額（dev 最多用 4 CPU）
- 可以用 RBAC 限制誰能存取哪個 namespace

---

## 第五課：綜合練習

### 5.1 部署一個完整的 Nginx 應用

建立 `nginx-app.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx-app
  template:
    metadata:
      labels:
        app: nginx-app
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-app-svc
spec:
  selector:
    app: nginx-app
  ports:
  - port: 80
    targetPort: 80
  type: NodePort
```

> YAML 中用 `---` 分隔多個資源，可以放在同一個檔案。

```bash
kubectl apply -f nginx-app.yaml

# 驗證
kubectl get deployment nginx-app
kubectl get pods -l app=nginx-app
kubectl get svc nginx-app-svc

# 存取
minikube service nginx-app-svc

# 測試自動修復
kubectl delete pod -l app=nginx-app --wait=false
kubectl get pods -w
# 觀察 Pod 被自動重建
```

### 5.2 練習：Scale 並觀察

```bash
# 擴展到 5 個
kubectl scale deployment nginx-app --replicas=5
kubectl get pods -w

# 縮容到 1 個
kubectl scale deployment nginx-app --replicas=1
kubectl get pods -w

# 清理
kubectl delete -f nginx-app.yaml
```

---

## 模組總結

通過本模組，我們掌握了 k8s 最核心的兩個元件：

1. **Deployment**：管理 Pod 的副本數量，自動修復、自動擴縮
2. **ReplicaSet**：Deployment 的執行者，維持期望的副本數
3. **Service**：提供穩定的存取入口，自動追蹤 Pod 變化
4. **Namespace**：邏輯隔離，區分不同環境
5. **Label / Selector**：k8s 萬物皆靠標籤和選擇器關聯

### 核心洞察

- 永遠不要直接管理 Pod，用 Deployment
- Service 是 Pod 的穩定代言人，不管 Pod 怎麼變
- Label 是 k8s 的「膠水」，連接 Deployment、Pod、Service

## 自我檢驗

在進入下一模組前，請確認您能夠：
- [ ] 寫出一個 Deployment YAML 並部署
- [ ] 使用 `kubectl scale` 擴縮副本數
- [ ] 解釋 Service 的作用與四種類型
- [ ] 建立 Namespace 並在其中部署資源
- [ ] 用 Label 和 Selector 關聯 Deployment 和 Service

## 下一步

應用跑起來了，但設定檔、密碼、資料都還硬寫在 YAML 裡。接下來我們要學習如何把「設定」和「儲存」從容器中抽離。進入[第四模組：設定與儲存 - 外部化你的配置](../module_4_config_storage/)！
