# 第七模組：Helm 套件管理與監控 (Helm & Observability)

## 模組目標
用 Helm 簡化部署管理，並建立基礎的監控與除錯能力。

## 心智模型
**Helm**：手動管 k8s YAML，就像自己去五金行逐一挑螺絲、木板、說明書來組家具 -- 能做，但累。Helm Chart 就是「IKEA 組裝包」：所有零件（YAML templates）+ 說明書（values.yaml）打包好。你只要改幾個參數（顏色、尺寸 = values），`helm install` 一鍵就組裝完成。組錯了？`helm rollback` 拆掉重來。要升級？`helm upgrade` 換新零件。

**監控**：`kubectl logs` 就是「行車紀錄器」：出事了回放錄影，看到底發生什麼。`kubectl describe` 是「車輛診斷報告」：引擎代碼、錯誤碼、事件時間線一目了然。Prometheus + Grafana 則是「即時儀表板」：時速（CPU）、油量（Memory）、引擎轉速（Request 數）即時顯示，還能設警報 -- 油量低於 10% 自動通知你。

---

## 第一課：Helm 基礎

### 1.1 為什麼需要 Helm？

隨著你的應用越來越複雜，YAML 檔案的問題浮現：

**問題 1：重複的 YAML**
- dev、staging、prod 三套環境，Deployment 幾乎一樣，只差 replicas 和 image tag
- 你複製了三份 YAML，改一個設定要改三次

**問題 2：一大堆檔案**
- 一個應用可能需要：Deployment + Service + ConfigMap + Secret + Ingress + PVC + HPA
- 七八個 YAML 檔案，部署順序要對，刪除也要全刪

**Helm 解決這些問題**：把所有 YAML 打包成一個 Chart，用 values 參數化。

### 1.2 安裝 Helm

**Windows**
```powershell
winget install Helm.Helm
# 或
choco install kubernetes-helm
```

**macOS**
```bash
brew install helm
```

**驗證**
```bash
helm version
```

### 1.3 Helm 的核心概念

| 概念 | 說明 | 類比 |
|------|------|------|
| **Chart** | 一個應用的打包模板 | IKEA 組裝包 |
| **values.yaml** | 可調整的參數 | 選色卡、尺寸表 |
| **Release** | Chart 的一次安裝實例 | 你組好的那張桌子 |
| **Repository** | 存放 Chart 的倉庫 | IKEA 商品目錄 |

### 1.4 Chart 的目錄結構

```
my-chart/
├── Chart.yaml          # Chart 的元資料（名稱、版本）
├── values.yaml         # 預設的參數值
├── templates/          # YAML 模板
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── _helpers.tpl    # 模板輔助函數
└── charts/             # 依賴的子 Chart
```

**templates/deployment.yaml 範例**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-app
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
    spec:
      containers:
      - name: app
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: {{ .Values.service.port }}
```

**values.yaml 範例**：
```yaml
replicaCount: 3

image:
  repository: nginx
  tag: "1.25"

service:
  port: 80
  type: ClusterIP
```

- `{{ .Values.xxx }}` 會被 values.yaml 中的值替換
- 不同環境只需要不同的 values 檔案

---

## 第二課：Helm 操作指令

### 2.1 使用公開 Chart

```bash
# 添加官方 Chart 倉庫
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 搜尋可用的 Chart
helm search repo mysql
helm search repo redis
```

### 2.2 安裝 Chart

```bash
# 安裝 MySQL（使用預設 values）
helm install my-mysql bitnami/mysql

# 安裝並自訂參數
helm install my-mysql bitnami/mysql \
  --set auth.rootPassword=mypassword \
  --set auth.database=myapp

# 或用自訂 values 檔案
helm install my-mysql bitnami/mysql -f my-values.yaml
```

### 2.3 管理 Release

```bash
# 查看已安裝的 Release
helm list

# 查看 Release 狀態
helm status my-mysql

# 升級（改參數或升版本）
helm upgrade my-mysql bitnami/mysql --set auth.database=newdb

# 回滾到上一版
helm rollback my-mysql

# 回滾到指定版本
helm history my-mysql
helm rollback my-mysql 2

# 解除安裝
helm uninstall my-mysql
```

### 2.4 查看 Chart 的可用參數

```bash
# 查看 Chart 的所有可調參數
helm show values bitnami/mysql

# 只看 README
helm show readme bitnami/mysql
```

### 2.5 練習：用 Helm 部署 Redis

```bash
# 安裝
helm install my-redis bitnami/redis \
  --set architecture=standalone \
  --set auth.password=redis123

# 查看建立的資源
kubectl get all -l app.kubernetes.io/instance=my-redis

# 測試連線
kubectl exec -it $(kubectl get pod -l app.kubernetes.io/name=redis -o name) -- \
  redis-cli -a redis123 ping
# PONG

# 清理
helm uninstall my-redis
```

---

## 第三課：日誌與除錯

### 3.1 除錯三寶

**`kubectl logs` -- 行車紀錄器**

```bash
# 基本用法
kubectl logs <pod-name>

# 持續追蹤
kubectl logs <pod-name> -f

# 看特定容器（multi-container Pod）
kubectl logs <pod-name> -c <container-name>

# 看之前 crash 的容器日誌
kubectl logs <pod-name> --previous

# 看 Deployment 下所有 Pod 的日誌
kubectl logs deployment/web
```

**`kubectl describe` -- 車輛診斷報告**

```bash
kubectl describe pod <pod-name>
```

重點看最下方的 **Events** 段落：

```
Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Normal   Scheduled  2m    default-scheduler  Successfully assigned...
  Normal   Pulled     2m    kubelet            Container image "nginx" already present
  Normal   Created    2m    kubelet            Created container nginx
  Normal   Started    2m    kubelet            Started container nginx
```

**`kubectl exec` -- 進入容器**

```bash
# 進入 shell
kubectl exec -it <pod-name> -- /bin/sh

# 執行單一指令
kubectl exec <pod-name> -- curl localhost:8080/healthz
kubectl exec <pod-name> -- cat /etc/config/app.conf
```

### 3.2 常見問題排查流程

#### CrashLoopBackOff

```
Pod 啟動 → crash → 重啟 → crash → 重啟... 間隔越來越長
```

**排查步驟**：
```bash
# 1. 看日誌
kubectl logs <pod-name> --previous

# 2. 看 Events
kubectl describe pod <pod-name>

# 3. 常見原因
# - image 裡的程式啟動失敗
# - 環境變數或設定檔缺失
# - 依賴的服務還沒準備好
```

#### ImagePullBackOff

```
k8s 無法拉取容器 image
```

**排查步驟**：
```bash
# 1. 看 Events
kubectl describe pod <pod-name>
# 會看到：Failed to pull image "xxx": ...

# 2. 常見原因
# - image 名稱或 tag 打錯
# - 私有 registry 沒有設定 imagePullSecrets
# - 網路問題
```

#### Pending

```
Pod 一直卡在 Pending，不會被排程
```

**排查步驟**：
```bash
# 1. 看 Events
kubectl describe pod <pod-name>

# 2. 常見原因
# - 資源不足（CPU/Memory requests 超過可用量）
# - PVC 無法綁定（沒有可用的 PV）
# - 節點有 taint，Pod 沒有 toleration
```

### 3.3 排查速查表

| 狀態 | 可能原因 | 第一步驟 |
|------|---------|---------|
| CrashLoopBackOff | 應用 crash | `kubectl logs --previous` |
| ImagePullBackOff | image 問題 | `kubectl describe pod` |
| Pending | 資源不足 | `kubectl describe pod` 看 Events |
| OOMKilled | 記憶體超限 | 增加 memory limits |
| Evicted | 節點壓力 | 檢查節點資源 `kubectl top nodes` |

---

## 第四課：Prometheus + Grafana 監控

### 4.1 為什麼需要監控？

`kubectl logs` 和 `kubectl top` 只能看到「現在」的狀況。你需要：
- 歷史數據：昨天 CPU 的趨勢是什麼？
- 告警：記憶體超過 90% 時通知我
- 視覺化：圖表比數字更直觀

### 4.2 監控架構

```
┌─────────┐  metrics  ┌────────────┐  query  ┌──────────┐
│  Pod    ├──────────→│ Prometheus ├────────→│ Grafana  │
│  Pod    │           │ (收集+儲存) │         │ (視覺化)  │
│  Pod    │           └────────────┘         └──────────┘
│  Node   │                │
└─────────┘          ┌─────┴─────┐
                     │ AlertManager│
                     │ (告警通知)   │
                     └───────────┘
```

- **Prometheus**：定時去各 Pod / Node 抓 metrics，存成時間序列資料
- **Grafana**：連接 Prometheus，用圖表呈現資料
- **AlertManager**：根據規則發送告警（Email、Slack 等）

### 4.3 用 Helm 快速部署

```bash
# 添加 Prometheus 社群 Chart 倉庫
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 一鍵安裝整套監控堆疊
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

這一個指令會部署：Prometheus + Grafana + AlertManager + Node Exporter + kube-state-metrics。

### 4.4 存取 Grafana

```bash
# port-forward 到 Grafana
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80

# 瀏覽器打開 http://localhost:3000
# 預設帳密：admin / prom-operator
```

Grafana 已經預裝了多個 Dashboard：
- **Kubernetes / Compute Resources / Cluster**：叢集 CPU / Memory 概覽
- **Kubernetes / Compute Resources / Pod**：單一 Pod 的資源使用
- **Kubernetes / Networking**：網路流量

### 4.5 常用 Prometheus 查詢（PromQL）

在 Grafana 的 Explore 頁面可以直接查詢：

```promql
# 所有 Pod 的 CPU 使用率
rate(container_cpu_usage_seconds_total[5m])

# 所有 Pod 的記憶體使用量
container_memory_usage_bytes

# 特定 Deployment 的 Pod 數量
kube_deployment_status_replicas{deployment="web"}
```

---

## 模組總結

通過本模組，我們掌握了：

1. **Helm**：Chart 打包、values 參數化、install / upgrade / rollback 完整生命週期
2. **除錯三寶**：logs、describe、exec
3. **常見問題排查**：CrashLoopBackOff、ImagePullBackOff、Pending
4. **Prometheus + Grafana**：一鍵部署監控堆疊

### 核心洞察

- Helm 讓你從「管理一堆 YAML」升級到「管理一個 Chart + 一個 values 檔」
- 90% 的 Pod 問題可以靠 `kubectl logs --previous` + `kubectl describe` 解決
- 監控不是可選項，是生產環境的必備基礎設施

## 自我檢驗

在進入下一模組前，請確認您能夠：
- [ ] 用 Helm 安裝、升級、回滾、解除安裝一個 Chart
- [ ] 使用 `helm show values` 查看可調參數
- [ ] 用除錯三寶排查 CrashLoopBackOff 和 ImagePullBackOff
- [ ] 部署 Prometheus + Grafana 並查看基本的監控圖表

## 下一步

所有零件都學完了！是時候把它們全部組裝起來，完整走一遍從 Docker Compose 到 k8s 的遷移流程。進入[最終模組：實戰整合 - 從 docker-compose 到 k8s](../module_8_practice/)！
