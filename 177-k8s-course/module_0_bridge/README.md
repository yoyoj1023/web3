# 零號模組：從 Docker 到 k8s 的橋樑 (Bridge from Docker)

## 模組目標
理解 Docker / Portainer 的能力天花板，以及 k8s 為何存在、它用什麼思維解決問題。

## 心智模型
用 Docker + Portainer 管容器，就像養「寵物」：每個容器你都認識、手動照顧、壞了會心痛地修。k8s 的思維是管理「牛群」：你只告訴系統「我要 5 頭牛」，死了一頭它自己補一頭，你不需要認識每一頭。這就是從「命令式（我來做）」到「宣告式（我說要什麼，系統幫我做到）」的核心轉變。

---

## 第一課：Docker 的能力邊界

### 1.1 Docker 能做什麼？

你已經很熟悉 Docker 了。讓我們快速回顧你手上擁有的工具：

**Docker CLI / Docker Compose**
- 用 `docker run` 啟動單一容器
- 用 `docker-compose.yml` 定義多容器應用（前端 + 後端 + 資料庫）
- 用 Volume 持久化資料、用 Network 讓容器互通

**Portainer**
- 用 GUI 管理容器的生命週期（啟動、停止、重啟、查看日誌）
- 用 Stack 部署 docker-compose 應用
- 一目了然地看到所有容器的狀態

這些工具在**單機**情境下非常好用。

### 1.2 單機的天花板在哪裡？

現在假設你的應用上線了，用戶開始增長，以下場景會逐一出現：

**場景 1：容器掛了**
```
# 凌晨 3 點，你的 API 容器 crash 了
# Docker 本身不會自動重啟它（除非你設了 restart policy）
# Portainer 會顯示紅色，但不會幫你修
# 你醒來才發現，用戶已經罵了 3 小時
```

Docker 的 `restart: always` 可以解決部分問題，但如果整台機器掛了呢？

**場景 2：流量暴增**
```
# 你的應用上了熱搜，流量翻了 10 倍
# 你需要從 1 個 API 容器擴展到 5 個
# Docker Compose 可以用 scale，但你要手動決定什麼時候加、什麼時候減
# 而且你只有一台機器，CPU 和記憶體就那麼多
```

**場景 3：多台主機**
```
# 你買了第二台伺服器來分擔壓力
# 問題來了：
# - 兩台機器上的容器怎麼互相通訊？
# - 流量怎麼分配到兩台機器？
# - 新部署怎麼同時更新兩台？
# Docker Compose 只管一台機器，管不了跨主機的事
```

### 1.3 Docker 的能力邊界總結

| 能力 | Docker / Compose / Portainer | 需要的解決方案 |
|------|-----|-----|
| 單機容器管理 | 很好 | -- |
| 容器自動重啟 | 有限（restart policy） | 自動修復 |
| 跨主機部署 | 不支援 | 叢集排程 |
| 自動擴縮容 | 不支援 | 水平擴展 |
| 滾動更新 | 不支援 | 零停機部署 |
| 服務發現 | 有限（docker network） | 叢集級 DNS |
| 負載均衡 | 不支援 | 內建流量分配 |

**這張表的右側，就是 Kubernetes 要解決的問題。**

---

## 第二課：k8s 的核心價值

### 2.1 k8s 是什麼？

Kubernetes（簡稱 k8s，因為 k 和 s 之間有 8 個字母）是一個**容器編排平台**。

它不是取代 Docker，而是站在 Docker 之上，解決 Docker 在「大規模」場景下的不足。

**一句話總結**：Docker 負責「跑容器」，k8s 負責「管理一群容器該怎麼跑」。

### 2.2 k8s 的四大核心能力

**自動排程 (Scheduling)**
- 你有 3 台伺服器，要跑 10 個容器
- k8s 會自動決定每個容器放在哪台機器上（根據資源餘量）
- 你不需要手動分配

**自動修復 (Self-healing)**
- 容器掛了？k8s 自動重啟
- 節點掛了？k8s 把上面的容器搬到其他節點
- 健康檢查失敗？k8s 自動停止向它分配流量

**水平擴展 (Horizontal Scaling)**
- 流量增加？k8s 自動加副本
- 流量減少？k8s 自動減副本
- 你只需要設定規則（例如：CPU > 70% 就加一個副本）

**滾動更新 (Rolling Update)**
- 部署新版本時，k8s 逐步替換舊版本
- 全程不停機，用戶無感知
- 出問題？一鍵回滾到上一版

### 2.3 概念對照表

這張表是你學 k8s 最重要的起點。把你已經會的概念映射過去：

| 你已經會的 (Docker) | 對應的 k8s 概念 | 差異 |
|-----|-----|-----|
| `docker run nginx` | Pod | Pod 是最小運行單位，可包含多個 container |
| `docker-compose.yml` | Deployment + Service | Deployment 管副本，Service 管網路入口 |
| `-p 8080:80` | Service (NodePort / LoadBalancer) | k8s 有多種暴露方式 |
| `-v /data:/app/data` | PersistentVolumeClaim | 儲存跟 Pod 生命週期脫鉤 |
| `-e DB_HOST=xxx` | ConfigMap / Secret | 設定與機密分開管理 |
| Portainer GUI | k8s Dashboard / kubectl | kubectl 是主要操作工具 |
| Nginx Proxy Manager | Ingress | 叢集級的反向代理 |
| `docker-compose up -d` | `kubectl apply -f` | 宣告式部署 |
| 手動 `docker restart` | 自動修復（Self-healing） | k8s 自動處理 |

### 2.4 k8s 架構速覽

一個 k8s 叢集由兩種角色的節點組成：

```
┌─────────────────────────────────────────────────┐
│                  Control Plane                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ API Server│ │ Scheduler│ │ Controller Manager│ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────┐                                    │
│  │   etcd   │ (儲存所有叢集狀態)                    │
│  └──────────┘                                    │
└─────────────────────────────────────────────────┘
        │               │               │
┌───────┴───┐   ┌───────┴───┐   ┌───────┴───┐
│  Worker 1  │   │  Worker 2  │   │  Worker 3  │
│ ┌───┐ ┌───┐│   │ ┌───┐ ┌───┐│   │ ┌───┐      │
│ │Pod│ │Pod││   │ │Pod│ │Pod││   │ │Pod│      │
│ └───┘ └───┘│   │ └───┘ └───┘│   │ └───┘      │
│  kubelet   │   │  kubelet   │   │  kubelet   │
└────────────┘   └────────────┘   └────────────┘
```

**Control Plane（控制平面）**：大腦，負責決策
- **API Server**：所有操作的入口（kubectl 就是跟它溝通）
- **Scheduler**：決定 Pod 放在哪個節點
- **Controller Manager**：監控並維持期望狀態
- **etcd**：分散式鍵值儲存，保存所有叢集資料

**Worker Node（工作節點）**：手腳，負責執行
- **kubelet**：每個節點上的代理人，負責管理該節點上的 Pod
- **Pod**：真正跑你的容器的地方

---

## 第三課：思維轉換 -- 宣告式 vs 命令式

### 3.1 你現在的工作方式（命令式）

用 Docker 時，你的操作是「命令式」的：

```bash
# 你告訴 Docker 每一步該做什麼
docker run -d --name api -p 3000:3000 my-api:v1
docker run -d --name api2 -p 3001:3000 my-api:v1
docker run -d --name api3 -p 3002:3000 my-api:v1

# 要更新版本？你逐一操作
docker stop api
docker rm api
docker run -d --name api -p 3000:3000 my-api:v2
# 重複三次...
```

**問題**：你在告訴系統「怎麼做」（How），每一步都由你控制。

### 3.2 k8s 的工作方式（宣告式）

用 k8s 時，你只描述「最終狀態」：

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3          # 我要 3 個副本
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: my-api:v1
        ports:
        - containerPort: 3000
```

```bash
# 一句話搞定：「請幫我實現這個狀態」
kubectl apply -f deployment.yaml
```

**要更新版本？** 改一行就好：

```yaml
        image: my-api:v2   # 改這裡
```

```bash
kubectl apply -f deployment.yaml
# k8s 自動執行滾動更新，零停機
```

### 3.3 宣告式的核心哲學

| 面向 | 命令式 (Docker) | 宣告式 (k8s) |
|------|--------|--------|
| 你做的事 | 告訴系統每一步怎麼做 | 告訴系統最終要什麼樣 |
| 系統的責任 | 執行你的指令 | 持續維持你要的狀態 |
| 容器掛了 | 你自己處理 | 系統自動修復 |
| 版本更新 | 手動逐一替換 | 系統自動滾動更新 |
| 設定來源 | 散落在各處的指令歷史 | 一份 YAML 就是真相 |

**核心差異**：宣告式不是「做一次就完」，而是**持續確保**。k8s 會不斷比較「期望狀態」和「當前狀態」，如果有差異就自動修正。

### 3.4 Reconciliation Loop（協調迴圈）

這是 k8s 最核心的運作原理：

```
    ┌──────────────────────────────────┐
    │                                  │
    ▼                                  │
 觀察當前狀態 ──→ 比較期望狀態 ──→ 有差異？──→ 執行修正
    │                                  │
    │              沒有差異             │
    ▼                                  │
   等待 ──────────────────────────────┘
```

**實例**：
1. 你宣告 `replicas: 3`
2. k8s 觀察到目前只有 2 個 Pod 在跑
3. 差異！自動啟動第 3 個 Pod
4. 持續監控，確保永遠有 3 個

這就像你告訴恆溫器「保持 25 度」，它會自動開冷氣或暖氣來維持，你不需要手動控制。

---

## 模組總結

通過本模組，我們建立了從 Docker 到 k8s 的認知橋樑：

1. **Docker 的邊界**：單機管理很好，但跨主機、自動擴展、自動修復做不到
2. **k8s 的價值**：自動排程、自動修復、水平擴展、滾動更新
3. **概念映射**：每個 Docker 概念都有對應的 k8s 概念
4. **思維轉換**：從「告訴系統怎麼做」到「告訴系統要什麼」

### 核心洞察

- k8s 不是取代 Docker，而是在 Docker 之上管理大規模容器
- 宣告式思維是 k8s 的靈魂，所有操作都圍繞「期望狀態」展開
- Reconciliation Loop 是 k8s 自動修復的基礎

## 自我檢驗

在進入下一模組前，請確認您能夠：
- [ ] 列出至少 3 個 Docker 無法解決但 k8s 可以解決的問題
- [ ] 將常用的 Docker 概念對應到 k8s 概念
- [ ] 用自己的話解釋「宣告式」和「命令式」的差異
- [ ] 理解 k8s 叢集的基本架構（Control Plane + Worker Node）

## 下一步

理解了為什麼需要 k8s 之後，讓我們動手搭建環境！進入[第一模組：環境建置與第一次接觸](../module_1_setup/)！
