# 12 - Broker 與集群

## 學習目標

- 理解 Kafka 集群架構
- 了解 Broker 的角色和職責
- 掌握副本機制
- 理解 Controller 的作用

## Kafka 集群架構

### 基本結構

```
┌──────────────────────────────────────────────────────────┐
│                    Kafka Cluster                          │
│                                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │ Broker 1 │    │ Broker 2 │    │ Broker 3 │           │
│  │ ID: 1    │    │ ID: 2    │    │ ID: 3    │           │
│  │          │    │          │    │          │           │
│  │ T1-P0 (L)│    │ T1-P0 (F)│    │ T1-P1 (L)│           │
│  │ T1-P1 (F)│    │ T1-P1 (F)│    │ T1-P2 (L)│           │
│  │ T1-P2 (F)│    │ T1-P2 (F)│    │          │           │
│  └──────────┘    └──────────┘    └──────────┘           │
│                                                            │
│  L = Leader, F = Follower                                 │
└──────────────────────────────────────────────────────────┘
                          ↑
                          │
                  ┌───────┴───────┐
                  │   ZooKeeper   │
                  │  (元數據協調)   │
                  └───────────────┘
```

## Broker 的職責

### 主要功能

1. **接收消息**：從 Producer 接收消息
2. **存儲消息**：持久化到磁碟
3. **服務讀取**：響應 Consumer 請求
4. **副本管理**：同步和管理副本
5. **元數據管理**：維護 Topic 和 Partition 信息

### Broker ID

每個 Broker 有唯一的 ID：

```
Broker 配置：
broker.id=1

# 或自動生成
broker.id.generation.enable=true
```

## 副本機制（Replication）

### Leader 和 Follower

```
Topic: orders, Partition 0, Replication Factor: 3

┌─────────┐        ┌─────────┐        ┌─────────┐
│Broker 1 │        │Broker 2 │        │Broker 3 │
│         │        │         │        │         │
│ Leader  │───────→│Follower │        │Follower │
│  P0     │   同步  │  P0     │←───────│  P0     │
│         │        │         │  同步   │         │
└─────────┘        └─────────┘        └─────────┘
     ↑                  ↑                  ↑
     │                  │                  │
  讀寫請求         同步數據          同步數據
```

**規則**：
- **Leader**：處理所有讀寫請求
- **Follower**：從 Leader 同步數據，作為備份
- **ISR**：與 Leader 保持同步的副本集合

### ISR（In-Sync Replicas）

```
ISR = Leader + 同步的 Followers

示例：
Leader: Broker 1
All Replicas: [Broker 1, Broker 2, Broker 3]
ISR: [Broker 1, Broker 2]  ← Broker 3 落後，不在 ISR 中
```

**ISR 的重要性**：
- 只有 ISR 中的副本可以被選為新 Leader
- `acks=all` 等待所有 ISR 確認

### 副本配置

```bash
# 創建 Topic 時指定副本數
kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic my-topic \
  --partitions 3 \
  --replication-factor 3
```

## Controller

### 什麼是 Controller？

Controller 是 Kafka 集群中的一個特殊 Broker，負責：

1. **Leader 選舉**：當 Leader 失敗時選舉新 Leader
2. **分區分配**：管理分區的副本分配
3. **元數據更新**：將變更通知給所有 Broker
4. **Broker 管理**：監控 Broker 的加入和離開

### Controller 選舉

```
集群啟動：
1. 所有 Broker 向 ZooKeeper 註冊
2. 第一個成功創建 /controller 節點的成為 Controller
3. 其他 Broker 監聽 Controller 變化

Controller 失敗：
1. ZooKeeper 檢測到 Controller 離線
2. 觸發新的選舉
3. 新 Controller 接管職責
```

## ZooKeeper 的作用

### 傳統 Kafka（使用 ZooKeeper）

```
ZooKeeper 負責：
- Broker 註冊和發現
- Controller 選舉
- Topic 配置
- Consumer Group 元數據（舊版本）
- ACL 權限管理

┌─────────────┐
│  ZooKeeper  │
│   Ensemble  │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
Kafka  Kafka
Broker Broker
```

### KRaft 模式（新架構）

Kafka 2.8+ 引入 KRaft（Kafka Raft），不再依賴 ZooKeeper：

```
KRaft 模式：
- Kafka 自己管理元數據
- 使用 Raft 共識算法
- 簡化部署和運維
- 更好的性能

┌─────────────────────┐
│  Kafka Cluster      │
│  (內建 Raft 元數據)  │
│                     │
│  Broker + KRaft     │
│  Broker + KRaft     │
│  Broker + KRaft     │
└─────────────────────┘
```

## 故障恢復

### 場景 1：Follower 失敗

```
影響：
- Leader 繼續服務
- ISR 縮小
- 可靠性略微下降

恢復：
1. Follower 重啟
2. 從 Leader 同步數據
3. 追上進度後重新加入 ISR
```

### 場景 2：Leader 失敗

```
過程：
1. Controller 檢測到 Leader 失敗
2. 從 ISR 中選舉新 Leader
3. 更新元數據
4. 通知所有 Broker 和 Client
5. 新 Leader 開始服務

時間：通常幾秒內完成
```

### 場景 3：Controller 失敗

```
過程：
1. ZooKeeper 檢測到 Controller 失敗
2. 觸發新的 Controller 選舉
3. 新 Controller 初始化
4. 恢復正常操作

影響：短暫的管理操作暫停
```

## 集群擴展

### 添加 Broker

```bash
# 1. 配置新 Broker
# config/server.properties
broker.id=4
listeners=PLAINTEXT://new-broker:9092
log.dirs=/var/kafka-logs

# 2. 啟動新 Broker
kafka-server-start.sh config/server.properties

# 3. 新 Broker 自動加入集群
# 但不會自動分配現有分區

# 4. 手動重新分配分區（可選）
kafka-reassign-partitions.sh ...
```

### 移除 Broker

```bash
# 1. 將分區遷移到其他 Broker
# 2. 確保沒有分區在此 Broker 上
# 3. 關閉 Broker
kafka-server-stop.sh
```

## 配置要點

### Broker 核心配置

```properties
# Broker ID
broker.id=1

# 監聽地址
listeners=PLAINTEXT://localhost:9092

# 日誌目錄
log.dirs=/var/kafka-logs

# ZooKeeper 連接
zookeeper.connect=localhost:2181

# 副本設置
default.replication.factor=3
min.insync.replicas=2

# 自動創建 Topic
auto.create.topics.enable=false
```

## 監控命令

```bash
# 查看集群 Broker
kafka-broker-api-versions --bootstrap-server localhost:9092

# 查看 Topic 的副本分佈
kafka-topics --describe --bootstrap-server localhost:9092 --topic my-topic

# 輸出示例：
Topic: my-topic    PartitionCount: 3    ReplicationFactor: 3
  Partition: 0    Leader: 1    Replicas: 1,2,3    Isr: 1,2,3
  Partition: 1    Leader: 2    Replicas: 2,3,1    Isr: 2,3,1
  Partition: 2    Leader: 3    Replicas: 3,1,2    Isr: 3,1,2
```

## 小結

本章學習了：

1. **Kafka 集群架構**：多 Broker 協同工作
2. **Broker 職責**：接收、存儲、服務、副本管理
3. **副本機制**：Leader/Follower、ISR
4. **Controller**：集群管理者
5. **故障恢復**：自動選舉和恢復
6. **ZooKeeper vs KRaft**：元數據管理演進

## 下一步

👉 [下一章：13 - 數據存儲與日誌](../13-data-storage/README.md)

---

[返回目錄](../README.md)

