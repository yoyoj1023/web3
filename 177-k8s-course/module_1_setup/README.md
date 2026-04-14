# 第一模組：環境建置與第一次接觸 (Setup & First Touch)

## 模組目標
在本機搭建可操作的 k8s 環境，熟悉 kubectl 基本操作。

## 心智模型
minikube / kind 就是你的「飛行模擬器」，在筆電上跑一個完整的迷你 k8s 叢集，所有操作指令和真實環境完全一樣，學會了直接上場。你不需要買一架真的飛機才能學飛。

---

## 第一課：環境選擇與安裝

### 1.1 三種本機 k8s 方案比較

| 方案 | 原理 | 優點 | 缺點 | 建議對象 |
|------|------|------|------|----------|
| **minikube** | 建立一個虛擬機或容器作為單節點叢集 | 功能完整、插件豐富 | 資源消耗較大 | 初學者首選 |
| **kind** | 用 Docker 容器模擬多節點叢集 | 輕量快速、可模擬多節點 | 功能較少 | 已熟悉 Docker 的人 |
| **Docker Desktop** | 內建 k8s（Settings → Kubernetes → Enable） | 最簡單、零額外安裝 | 只有 Windows/Mac、功能有限 | 只想快速體驗 |

### 1.2 安裝 minikube（建議方案）

**Windows (PowerShell 管理員)**
```powershell
# 使用 winget 安裝
winget install Kubernetes.minikube

# 或使用 Chocolatey
choco install minikube
```

**macOS**
```bash
brew install minikube
```

**Linux**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

**啟動叢集**
```bash
# 使用 Docker 作為驅動（你已經有 Docker 了）
minikube start --driver=docker

# 驗證叢集狀態
minikube status
```

預期輸出：
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

### 1.3 安裝 kubectl

kubectl 是操作 k8s 的命令列工具，相當於 k8s 世界的 `docker` 指令。

**Windows**
```powershell
winget install Kubernetes.kubectl
```

**macOS**
```bash
brew install kubectl
```

**驗證安裝**
```bash
kubectl version --client
kubectl cluster-info
```

預期看到叢集的 API Server 位址，代表 kubectl 已正確連線到 minikube。

---

## 第二課：kubectl 核心指令

### 2.1 對比 Portainer 的操作

你在 Portainer 中做的事，現在用 kubectl 完成：

| Portainer 操作 | kubectl 指令 | 用途 |
|---------|---------|---------|
| 看所有容器列表 | `kubectl get pods` | 列出所有 Pod |
| 點進容器看詳情 | `kubectl describe pod <name>` | 查看 Pod 詳細資訊 |
| 看容器日誌 | `kubectl logs <pod-name>` | 查看 Pod 日誌 |
| 進入容器終端 | `kubectl exec -it <pod-name> -- /bin/sh` | 進入 Pod 的 shell |

### 2.2 四把瑞士刀

**`kubectl get` -- 列出資源**
```bash
kubectl get pods                # 列出所有 Pod
kubectl get pods -o wide        # 更多資訊（IP、節點等）
kubectl get all                 # 列出所有類型的資源
kubectl get nodes               # 列出叢集的所有節點
```

**`kubectl describe` -- 查看詳情**
```bash
kubectl describe pod <pod-name>
# 顯示：
# - Pod 的狀態、IP、所在節點
# - Container 的 image、port
# - Events（事件歷史），除錯時最重要的資訊
```

**`kubectl logs` -- 查看日誌**
```bash
kubectl logs <pod-name>              # 查看日誌
kubectl logs <pod-name> -f           # 持續追蹤（等同 docker logs -f）
kubectl logs <pod-name> --tail=100   # 最後 100 行
```

**`kubectl exec` -- 進入容器**
```bash
kubectl exec -it <pod-name> -- /bin/sh    # 進入 shell
kubectl exec -it <pod-name> -- /bin/bash  # 如果有 bash 的話
```

### 2.3 資源的命名空間

k8s 用 Namespace 來隔離資源（就像資料夾）：

```bash
kubectl get pods                      # 只看 default 命名空間
kubectl get pods -n kube-system       # 看系統組件的命名空間
kubectl get pods --all-namespaces     # 看所有命名空間（簡寫 -A）
```

---

## 第三課：你的第一個 Pod

### 3.1 從 docker run 到 kubectl run

你過去這樣跑 Nginx：
```bash
docker run -d --name web -p 80:80 nginx
```

在 k8s 中，等價的操作：
```bash
kubectl run web --image=nginx --port=80
```

查看結果：
```bash
kubectl get pods
```

預期輸出：
```
NAME   READY   STATUS    RESTARTS   AGE
web    1/1     Running   0          30s
```

### 3.2 查看 Pod 詳情

```bash
kubectl describe pod web
```

重點關注的欄位：
- **Status**: Running（正常）/ Pending（等待中）/ Error（出錯）
- **IP**: Pod 的叢集內部 IP
- **Events**: 最下方的事件列表，出問題時第一個看的地方

### 3.3 存取 Pod 中的 Nginx

Pod 的 IP 只在叢集內部有效，外部無法直接存取。可以用 port-forward 暫時打通：

```bash
kubectl port-forward pod/web 8080:80
```

然後在瀏覽器打開 `http://localhost:8080`，你會看到 Nginx 歡迎頁面。

> 這個操作類似 Docker 的 `-p 8080:80`，但只是臨時的除錯用途。正式的做法是用 Service（第三模組會學）。

### 3.4 清理

```bash
kubectl delete pod web
```

---

## 第四課：部署 k8s Dashboard

### 4.1 為什麼要裝 Dashboard？

你習慣了 Portainer 的 GUI 管理介面。k8s Dashboard 可以讓你用類似的方式看到叢集狀態，降低初期的不適感。

### 4.2 使用 minikube 快速啟用

```bash
minikube addons enable dashboard
minikube addons enable metrics-server

# 啟動 Dashboard
minikube dashboard
```

瀏覽器會自動打開 Dashboard。你可以在上面：
- 查看所有 Pod、Deployment、Service 的狀態
- 查看 Pod 日誌
- 查看資源使用量（CPU / Memory）

### 4.3 Dashboard vs Portainer 對比

| 功能 | Portainer | k8s Dashboard |
|------|-----------|---------------|
| 看容器 / Pod 列表 | 有 | 有 |
| 看日誌 | 有 | 有 |
| 進入終端 | 有 | 有 |
| 部署新應用 | 用 Stack | 用 YAML |
| 資源監控 | 基礎 | 需搭配 metrics-server |
| 管理難度 | 低 | 中 |

> Dashboard 適合視覺化輔助，但日常操作建議以 `kubectl` 為主。隨著你越來越熟練，你會發現指令比 GUI 更快、更精確。

---

## 第五課：常用操作練習

### 5.1 練習：跑一個自訂的 Pod

```bash
# 跑一個 busybox，啟動後保持 shell
kubectl run debug --image=busybox --command -- sleep 3600

# 進入容器
kubectl exec -it debug -- sh

# 在裡面測試
/ # echo "Hello from k8s!"
/ # wget -qO- http://google.com
/ # exit

# 清理
kubectl delete pod debug
```

### 5.2 練習：探索系統組件

```bash
# 看看 k8s 自己跑了哪些 Pod
kubectl get pods -n kube-system

# 你會看到 etcd、kube-apiserver、kube-scheduler 等
# 這些就是零號模組提到的 Control Plane 組件
```

### 5.3 常用 kubectl 快捷技巧

```bash
# 設定別名（加到你的 shell profile）
alias k=kubectl

# 之後就可以用
k get pods
k describe pod web
k logs web

# 自動補全（bash）
source <(kubectl completion bash)

# 自動補全（PowerShell）
kubectl completion powershell | Out-String | Invoke-Expression
```

---

## 模組總結

通過本模組，我們完成了：

1. **環境建置**：用 minikube 搭建了本機 k8s 叢集
2. **kubectl 四把瑞士刀**：get、describe、logs、exec
3. **第一個 Pod**：體驗了從 `docker run` 到 `kubectl run` 的轉變
4. **Dashboard**：找回 Portainer 的熟悉感

### 核心洞察

- kubectl 是你跟 k8s 叢集溝通的唯一入口
- Pod 的 IP 只在叢集內部有效，外部存取需要額外機制
- Dashboard 是輔助工具，`kubectl` 才是日常主力

## 自我檢驗

在進入下一模組前，請確認您能夠：
- [ ] 用 minikube 啟動和停止叢集
- [ ] 使用 `kubectl get`、`describe`、`logs`、`exec` 四個基本指令
- [ ] 用 `kubectl run` 建立一個 Pod 並查看其狀態
- [ ] 使用 `port-forward` 存取 Pod 中的服務

## 下一步

環境就緒，kubectl 也上手了。接下來我們要深入理解 k8s 的最小運行單位 -- Pod。進入[第二模組：最小運行單位 - Pod 的世界](../module_2_pod/)！
