這是一份為您精心設計的「從 Docker 到 k8s 深入淺出學習 k8s」課程。

這套課程的設計哲學是**從你已經會的出發，用對比建立直覺，從元件到系統逐步掌握**。我們假設你已經熟悉 Docker（docker run / docker compose）與 Portainer 的 GUI 操作，不會從零開始介紹容器化概念，而是直接從「Docker 的天花板在哪裡」切入，帶你理解 k8s 為什麼存在、它用什麼思維解決問題，然後逐步深入每個核心元件的內部工作原理。

---

### **從 Docker 到 k8s 深入淺出學習 k8s (From Docker to Kubernetes Masterclass)**

**課程目標：** 學習結束後，您將能獨立將一個 Docker Compose 應用遷移至 k8s，掌握 Pod、Deployment、Service、Ingress、Volume、Helm 等核心元件的使用與原理，並具備基礎的監控、除錯與生產環境部署能力。

---

### **課程路徑總覽**

#### [零號模組：從 Docker 到 k8s 的橋樑 (Bridge from Docker)](./module_0_bridge/)
- Docker / Portainer 的能力邊界
- k8s 解決什麼問題
- 宣告式 vs 命令式思維轉換

#### [第一模組：環境建置與第一次接觸 (Setup & First Touch)](./module_1_setup/)
- 本機 k8s 環境建置
- kubectl 核心指令
- 部署 k8s Dashboard

#### [第二模組：最小運行單位 - Pod 的世界 (The Pod)](./module_2_pod/)
- Pod 與 Container 的關係
- YAML 定義 Pod
- Multi-container 模式

#### [第三模組：應用管理 - Deployment 與 Service (Deployment & Service)](./module_3_deployment_service/)
- Deployment / ReplicaSet 副本管理
- Service 四種類型與流量路由
- Namespace 邏輯隔離

#### [第四模組：設定與儲存 - 外部化你的配置 (Config & Storage)](./module_4_config_storage/)
- ConfigMap 與 Secret
- PersistentVolume 與 PersistentVolumeClaim
- StorageClass 動態供應

#### [第五模組：流量入口 - Ingress 與對外服務 (Ingress & Networking)](./module_5_ingress/)
- Ingress Controller 安裝與設定
- 路徑路由與域名路由
- TLS / HTTPS 設定

#### [第六模組：健康檢查與進階部署 (Health Checks & Advanced Deployment)](./module_6_health_deploy/)
- Liveness / Readiness / Startup Probe
- Rolling Update 與 Rollback
- HPA 自動水平擴展

#### [第七模組：Helm 套件管理與監控 (Helm & Observability)](./module_7_helm_monitoring/)
- Helm Chart 結構與操作
- Prometheus + Grafana 監控
- 常見問題排查流程

#### [最終模組：實戰整合 - 從 docker-compose 到 k8s (Hands-on Integration)](./module_8_practice/)
- 完整多層應用部署
- docker-compose.yml 轉換為 k8s YAML
- 生產環境安全補充（RBAC、NetworkPolicy）

---

### **詳細課程內容**

#### **零號模組：從 Docker 到 k8s 的橋樑 (Bridge from Docker)**

**課程目標：** 理解 Docker / Portainer 的能力天花板，以及 k8s 為何存在、它用什麼思維解決問題。
**心智模型：** 用 Docker + Portainer 管容器，就像養「寵物」：每個容器你都認識、手動照顧、壞了會心痛地修。k8s 的思維是管理「牛群」：你只告訴系統「我要 5 頭牛」，死了一頭它自己補一頭，你不需要認識每一頭。這就是從「命令式（我來做）」到「宣告式（我說要什麼，系統幫我做到）」的核心轉變。

*   **1. Docker 的能力邊界：**
    *   Docker / Docker Compose / Portainer 能做什麼、不能做什麼。
    *   單機的瓶頸：容器掛了誰來重啟？流量暴增怎麼自動擴展？多台主機怎麼協調？
*   **2. k8s 的核心價值：**
    *   自動排程、自動修復、水平擴展、滾動更新。
    *   概念對照表：`docker run` vs Pod、`docker-compose.yml` vs Deployment + Service、Portainer vs k8s Dashboard。
*   **3. 思維轉換：宣告式 vs 命令式：**
    *   命令式：「請幫我啟動 3 個容器」（你負責每一步）。
    *   宣告式：「我要 3 個副本在運行」（系統負責實現並持續維持）。

#### **第一模組：環境建置與第一次接觸 (Setup & First Touch)**

**課程目標：** 在本機搭建可操作的 k8s 環境，熟悉 kubectl 基本操作。
**心智模型：** minikube / kind 就是你的「飛行模擬器」，在筆電上跑一個完整的迷你 k8s 叢集，所有操作指令和真實環境完全一樣，學會了直接上場。你不需要買一架真的飛機才能學飛。

*   **1. 環境選擇與安裝：**
    *   minikube / kind / Docker Desktop k8s 的差異與選擇建議。
    *   安裝 kubectl 並驗證連線。
*   **2. kubectl 核心指令：**
    *   `get`, `describe`, `logs`, `exec` -- 你的四把瑞士刀。
    *   對比 Portainer 的 GUI 操作：你過去點按鈕做的事，現在用指令完成。
*   **3. 第一個 Pod：**
    *   用 `kubectl run` 跑一個 Nginx，體驗從 `docker run` 到 k8s 的第一步。
    *   部署 k8s Dashboard，找回 Portainer 的熟悉感。

#### **第二模組：最小運行單位 - Pod 的世界 (The Pod)**

**課程目標：** 深入理解 Pod 的結構、定義方式與生命週期。
**心智模型：** Container 是便當裡的一道菜（主菜、配菜），Pod 是裝這些菜的「便當盒」。同一個便當盒裡的菜共享同一組餐具（網路、儲存），一起被端上桌、一起被收走。大多數時候一個便當盒只裝一道主菜（一個 Container），但偶爾你需要加配菜（Sidecar）來輔助。

*   **1. Pod 與 Container 的關係：**
    *   一個 Pod 可包含多個 Container，但大多數時候是一對一。
    *   共享網路命名空間（localhost 互通）與儲存卷。
*   **2. 用 YAML 定義 Pod：**
    *   從 `docker run -d -p 80:80 --name web nginx` 到等價的 Pod YAML。
    *   YAML 四大區塊：apiVersion、kind、metadata、spec。
*   **3. Multi-container Pod 模式：**
    *   Sidecar：日誌收集器、代理。
    *   Init Container：啟動前的初始化任務。
*   **4. Pod 生命週期：**
    *   Pending → Running → Succeeded / Failed 狀態流轉。

#### **第三模組：應用管理 - Deployment 與 Service (Deployment & Service)**

**課程目標：** 掌握 k8s 中最常用的兩大元件，實現應用的副本管理與網路存取。
**心智模型（Deployment）：** 你是餐廳經理，說「我要 3 個服務生在場」，ReplicaSet 是排班表，負責隨時補人。有人請假（Pod 掛了）？排班表自動叫人補上。要擴大營業？你改一下數字就好。你不需要親自找人，只需宣告需求。
**心智模型（Service）：** 員工（Pod）可能換座位、離職、新到任，分機號碼（Pod IP）一直在變。但客戶不需要知道這些，他們只要撥「總機號碼」（Service IP / DNS），總機會自動轉接到當前在位的員工。

*   **1. 為什麼不直接管理 Pod？**
    *   Pod 是「凡人」，會死會被替換。Deployment 確保永遠有足夠的副本。
*   **2. Deployment 與 ReplicaSet：**
    *   對比 docker compose 的 `replicas`。
    *   實作：建立 Deployment、scale up/down、觀察 ReplicaSet 行為。
*   **3. Service -- 穩定的存取入口：**
    *   四種類型：ClusterIP（內線）/ NodePort（直撥號碼）/ LoadBalancer（0800 專線）/ ExternalName。
    *   對比 Docker 的 `-p 8080:80` port mapping。
*   **4. Namespace -- 邏輯隔離：**
    *   把 dev / staging / prod 環境隔開，各管各的。

#### **第四模組：設定與儲存 - 外部化你的配置 (Config & Storage)**

**課程目標：** 學會將設定檔、敏感資料與持久化儲存從容器中抽離。
**心智模型（Config）：** 程式碼（Container Image）是廚師的手藝，不會因為換餐廳就改變。ConfigMap 就是「菜單」：不同餐廳（環境）可以掛不同菜單，廚師看菜單決定要煮什麼。Secret 則是「保險箱」：放食譜機密、供應商帳密，只有被授權的人能打開。重點是：手藝（Image）和菜單（Config）分離，同一個廚師可以在不同餐廳工作。
**心智模型（Volume）：** Pod 就像臨時工，隨時可能被換掉。如果資料放在臨時工的口袋裡（Container 內部），人走了資料也沒了。PersistentVolume 是公司的「個人置物櫃」：固定的、持久的儲存空間。PersistentVolumeClaim 是「置物櫃申請單」：員工填單申請，管理系統分配一個合適的櫃子。就算員工離職（Pod 被刪），櫃子和裡面的東西還在，新員工可以繼續使用。

*   **1. ConfigMap：**
    *   對比 Docker 的 `-e` 環境變數與 `.env` 檔案。
    *   用 YAML / 檔案 / literal 三種方式建立。
*   **2. Secret：**
    *   Base64 編碼、掛載為環境變數 vs 掛載為檔案。
*   **3. PersistentVolume (PV) 與 PersistentVolumeClaim (PVC)：**
    *   對比 Docker Volume（`-v` / named volume）。
    *   emptyDir / hostPath（開發用）vs PV/PVC（正式用）。
    *   StorageClass 動態供應。
*   **4. 實作：為資料庫 Pod 掛載持久化儲存並外部化連線資訊。**

#### **第五模組：流量入口 - Ingress 與對外服務 (Ingress & Networking)**

**課程目標：** 掌握 k8s 對外暴露服務的標準方式。
**心智模型：** 你的 k8s 叢集是一棟大樓，裡面有很多公司（Service）。Ingress 就是大樓門口的「接待櫃台」：訪客說要找 A 公司（app.example.com），櫃台引導到 3 樓；說要找 B 公司（api.example.com），引導到 5 樓。Ingress Controller（如 Nginx）就是真正坐在櫃台的那個人，負責執行路由規則。沒有 Ingress，每個 Service 就得自己開大門（NodePort），既不安全也不好管理。

*   **1. 為什麼需要 Ingress？**
    *   對比 Docker 世界的 Nginx Proxy Manager / Traefik。
    *   沒有 Ingress，每個 Service 就得自己開 NodePort，既不安全也不好管理。
*   **2. Ingress Controller 安裝：**
    *   Nginx Ingress Controller 的安裝與驗證。
*   **3. Ingress 規則：**
    *   路徑路由（`/api` → backend、`/` → frontend）。
    *   域名路由（`app.example.com` vs `api.example.com`）。
*   **4. TLS / HTTPS 設定：**
    *   使用 Secret 掛載 TLS 憑證。

#### **第六模組：健康檢查與進階部署 (Health Checks & Advanced Deployment)**

**課程目標：** 確保應用不只「活著」，而且「健康地服務中」，並掌握零停機部署策略。
**心智模型：** 三種探針就像醫院的三種健檢。**Startup Probe** = 新生兒檢查：應用剛啟動時，先確認它成功「出生」了，還沒好之前不會被誤判為壞掉。**Liveness Probe** = 定期體檢：持續確認應用還「活著」，如果心跳停了（檢查失敗），直接重啟搶救。**Readiness Probe** = 上班前量體溫：確認應用已「準備好」接客，沒準備好就先不分配流量給它。三種探針各有職責，確保你的應用不只「活著」，而且「健康地服務中」。

*   **1. Health Checks：**
    *   Liveness / Readiness / Startup Probe 的差異與使用場景。
    *   HTTP / TCP / Command 三種檢查方式。
*   **2. 滾動更新與回滾：**
    *   Rolling Update 策略：maxSurge / maxUnavailable。
    *   `kubectl rollout undo` 一鍵回滾。
*   **3. 資源管理：**
    *   Resource Requests 與 Limits（CPU / Memory）。
    *   設不好的後果：OOMKilled、節點壓力。
*   **4. HPA（Horizontal Pod Autoscaler）：**
    *   根據 CPU / Memory 自動擴縮副本數。

#### **第七模組：Helm 套件管理與監控 (Helm & Observability)**

**課程目標：** 用 Helm 簡化部署管理，並建立基礎的監控與除錯能力。
**心智模型（Helm）：** 手動管 k8s YAML，就像自己去五金行逐一挑螺絲、木板、說明書來組家具 -- 能做，但累。Helm Chart 就是「IKEA 組裝包」：所有零件（YAML templates）+ 說明書（values.yaml）打包好。你只要改幾個參數（顏色、尺寸 = values），`helm install` 一鍵就組裝完成。組錯了？`helm rollback` 拆掉重來。要升級？`helm upgrade` 換新零件。
**心智模型（監控）：** `kubectl logs` 就是「行車紀錄器」：出事了回放錄影，看到底發生什麼。`kubectl describe` 是「車輛診斷報告」：引擎代碼、錯誤碼、事件時間線一目了然。Prometheus + Grafana 則是「即時儀表板」：時速（CPU）、油量（Memory）、引擎轉速（Request 數）即時顯示，還能設警報 -- 油量低於 10% 自動通知你。

*   **1. Helm 基礎：**
    *   Chart 結構：templates / values.yaml。
    *   核心指令：install / upgrade / rollback / uninstall。
    *   使用公開 Chart 部署應用（MySQL、Redis）。
*   **2. 日誌與除錯：**
    *   `kubectl logs` / `kubectl exec` / `kubectl describe` 除錯三寶。
    *   常見問題排查：CrashLoopBackOff、ImagePullBackOff、Pending。
*   **3. 監控堆疊簡介：**
    *   Metrics Server 安裝。
    *   Prometheus + Grafana 概覽與快速部署。

#### **最終模組：實戰整合 - 從 docker-compose 到 k8s (Hands-on Integration)**

**課程目標：** 將所有知識整合，完整走一遍從 Docker Compose 應用遷移到 k8s 的全流程。
**心智模型：** 你之前用 Docker Compose 就像在夜市擺攤：每攤自己搞定水電（port）、招牌（domain）、倉庫（volume），簡單直接。現在要「進百貨公司（k8s）」：統一管理電力（Resource Limits）、統一門面（Ingress）、統一倉儲（PVC）、統一保全（RBAC）。這個模組就是完整走一遍：把一個 docker-compose.yml 的夜市攤位，升級成百貨公司裡的專櫃。

*   **1. 完整多層應用部署：**
    *   架構：Frontend + Backend API + Database。
    *   將 docker-compose.yml 逐步轉換為 k8s YAML。
*   **2. 全套整合：**
    *   ConfigMap、Secret、PVC、Service、Ingress、Probe 一次到位。
*   **3. 生產環境安全補充：**
    *   RBAC 權限管理簡介（門禁卡系統：誰能進哪裡）。
    *   NetworkPolicy 網路策略（防火牆：誰能跟誰通訊）。
    *   Pod Security Standards（員工守則：什麼行為被允許）。
*   **4. 常用 kubectl 指令速查表。**

---

通過這套精心設計的課程，您將從熟悉的 Docker 世界出發，建立起對 Kubernetes 堅實而全面的理解，具備獨立部署、管理與除錯 k8s 應用的實戰能力。

### 課程特色
- **以你已會的為起點**：每個模組都從 Docker 對比切入，降低認知門檻
- **心智模型先行**：先建立直覺，再深入細節
- **實作驅動**：每個模組都有動手練習
- **循序漸進**：從單一 Pod 到完整多層應用，逐步堆疊

### 學習建議
- 預計學習時間：30-50 小時（根據背景而定）
- 建議基礎：熟悉 Docker（docker run / docker compose）與 Portainer 基本操作
- 學習方式：概念理解 + 動手實作 + Docker 對比回顧

### 課程目標

#### 學習結束後，您將：
- 理解 k8s 的核心架構與設計哲學
- 熟練操作 kubectl 管理叢集資源
- 獨立將 Docker Compose 應用遷移至 k8s
- 掌握 Helm 套件管理與基礎監控能力
- 具備生產環境部署的安全意識

---

**立即開始您的 Kubernetes 學習之旅！**
