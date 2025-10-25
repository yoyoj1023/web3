# 02 - 核心概念與術語

## 學習目標

在本章節中，你將學到：

- Kafka 的核心組件和術語
- Kafka 的整體架構
- 各組件之間如何協同工作

## Kafka 架構全景圖

在深入各個概念之前，讓我們先看看 Kafka 的整體架構：

```
┌─────────────────────────────────────────────────────────────┐
│                         Kafka Cluster                        │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Broker 1   │  │  Broker 2   │  │  Broker 3   │         │
│  │             │  │             │  │             │         │
│  │ Topic: orders│ │ Topic: orders│ │ Topic: orders│         │
│  │ Partition 0 │  │ Partition 1 │  │ Partition 2 │         │
│  │ (Leader)    │  │ (Leader)    │  │ (Follower)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ▲                                      │
         │                                      │
    [Producer]                             [Consumer]
   (生產者)                               (消費者)
   發送消息                               讀取消息
```

現在讓我們逐一了解每個組件。

## 核心概念

### 1. Message（消息）

**定義**：Kafka 中數據傳輸的基本單位。

**組成部分**：
- **Key**（鍵）：可選，用於決定消息發送到哪個分區
- **Value**（值）：消息的實際內容
- **Timestamp**（時間戳）：消息的時間標記
- **Headers**（標頭）：可選的元數據

**類比**：消息就像一封信
- Key 是收件人地址（決定送到哪個信箱）
- Value 是信件內容
- Timestamp 是郵戳
- Headers 是額外的標籤（如「緊急」、「機密」）

**示例**：
```json
{
  "key": "user-12345",
  "value": {
    "userId": "12345",
    "action": "purchase",
    "amount": 99.99,
    "timestamp": "2024-01-01T10:30:00Z"
  },
  "headers": {
    "source": "web-app",
    "version": "1.0"
  }
}
```

### 2. Topic（主題）

**定義**：消息的分類或頻道，Producer 發送消息到 Topic，Consumer 從 Topic 讀取消息。

**特點**：
- Topic 是邏輯概念，類似資料庫中的「表」
- 一個 Kafka 集群可以有多個 Topic
- Topic 名稱在集群中唯一

**類比**：
- 報紙有不同版面：體育版、財經版、娛樂版
- Topic 就像這些版面，不同類型的新聞（消息）發布到不同版面

**命名建議**：
```
好的命名：
- user-events
- order-created
- payment-completed

不好的命名：
- data
- test123
- topic1
```

**示例場景**：
```
電商系統的 Topics：
- orders（訂單）
- payments（支付）
- inventory（庫存）
- user-activities（用戶活動）
- notifications（通知）
```

### 3. Partition（分區）

**定義**：Topic 被分成多個 Partition，每個 Partition 是一個有序的消息序列。

**為什麼需要分區？**

1. **並行處理**：多個 Consumer 可以同時讀取不同的分區
2. **可擴展性**：分區可以分布在不同的 Broker 上
3. **性能提升**：讀寫可以分散到多個磁碟

**重要特性**：

✅ **分區內有序**：同一分區內的消息按寫入順序排列
❌ **跨分區無序**：不同分區之間沒有順序保證

**類比**：
想像一個大型圖書館：
- Topic 是一個主題區域（如「計算機類」）
- Partition 是該區域的不同書架
- 每個書架上的書按編號排列（有序）
- 但不同書架之間沒有全局順序

**視覺化**：

```
Topic: user-events (3 個分區)

Partition 0: [msg0] → [msg3] → [msg6] → [msg9]  ...
Partition 1: [msg1] → [msg4] → [msg7] → [msg10] ...
Partition 2: [msg2] → [msg5] → [msg8] → [msg11] ...
             ↑                    ↑
           舊消息              新消息
          (offset 0)         (offset 3)
```

**分區數量如何決定？**

- 太少：無法充分利用並行性
- 太多：增加管理開銷
- 經驗法則：考慮 Consumer 數量和期望的吞吐量
- 可以在創建後增加（但不建議減少）

### 4. Offset（偏移量）

**定義**：Partition 中每條消息的唯一序號，從 0 開始遞增。

**作用**：
- 標識消息在分區中的位置
- Consumer 通過 Offset 追蹤已讀取的消息

**類比**：
- 書籍的頁碼
- 視頻播放的進度條
- 你可以記住看到第幾頁，下次從那裡繼續看

**示例**：

```
Partition 0:
Offset: 0    1    2    3    4    5    6
消息:  [A] [B] [C] [D] [E] [F] [G]
                    ↑
              Consumer 當前位置
         (已讀取到 offset 3)
```

**重要概念**：

- **Current Offset**：Consumer 當前讀取的位置
- **Committed Offset**：Consumer 已確認處理完成的位置
- **Log-End Offset**：分區中最新消息的 offset

### 5. Producer（生產者）

**定義**：向 Kafka Topic 發送消息的客戶端應用程序。

**主要職責**：
1. 連接到 Kafka 集群
2. 序列化消息（將對象轉換為字節）
3. 決定消息發送到哪個分區
4. 發送消息並處理響應

**分區選擇邏輯**：

```
如果消息有 Key：
    使用 hash(key) % 分區數 → 決定分區
    相同 key 的消息會被發送到同一分區（保證順序）

如果消息沒有 Key：
    使用輪詢（round-robin）或其他策略分配
```

**類比**：
- Producer 就像郵局寄件員
- 知道要寄到哪個地址（Topic）
- 決定使用哪個郵箱（Partition）
- 確認信件是否成功投遞

**基本流程**：

```
1. 創建 Producer 實例
2. 準備消息（key, value, headers）
3. 發送消息到指定 Topic
4. 等待確認（可選）
5. 關閉 Producer
```

### 6. Consumer（消費者）

**定義**：從 Kafka Topic 讀取消息的客戶端應用程序。

**主要職責**：
1. 連接到 Kafka 集群
2. 訂閱一個或多個 Topic
3. 從分配的 Partition 讀取消息
4. 反序列化消息（將字節轉換為對象）
5. 處理消息
6. 提交 Offset（記錄處理進度）

**類比**：
- Consumer 就像訂閱報紙的讀者
- 每天從信箱取出報紙（Partition）
- 閱讀內容（處理消息）
- 記住看到哪一頁（提交 Offset）

**消費方式**：

```
拉取模式（Pull）：
Consumer 主動向 Broker 請求數據
↓
好處：Consumer 可以按自己的速度消費
```

### 7. Consumer Group（消費者群組）

**定義**：一組共同消費同一個 Topic 的 Consumer。

**核心規則**：
- 群組內每個 Partition 只能被一個 Consumer 消費
- 一個 Consumer 可以消費多個 Partition
- 不同群組之間互不影響，各自獨立消費

**視覺化**：

```
Topic: orders (4 個分區)

Consumer Group A (2 個 consumers):
┌────────────┐                 ┌────────────┐
│ Consumer 1 │ ← Partition 0   │ Consumer 2 │
│            │ ← Partition 1   │            │
│            │                 │            │ ← Partition 2
└────────────┘                 └────────────┘ ← Partition 3

Consumer Group B (3 個 consumers):
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Consumer 1 │  │ Consumer 2 │  │ Consumer 3 │
│            │  │            │  │            │
│            │  │            │  │            │
└────────────┘  └────────────┘  └────────────┘
     ↑               ↑               ↑
 Partition 0    Partition 1    Partition 2
                               Partition 3
```

**使用場景**：

**場景 1：負載均衡**
```
4 個分區 + 4 個 Consumer（同一群組）
= 每個 Consumer 處理 1 個分區
= 並行處理，提高吞吐量
```

**場景 2：多個獨立應用**
```
Topic: user-events

Consumer Group: analytics-service
→ 用於數據分析

Consumer Group: notification-service
→ 用於發送通知

兩個服務獨立消費相同的數據
```

**重要提示**：
- Consumer 數量 > Partition 數量：會有空閒的 Consumer
- Consumer 數量 < Partition 數量：一個 Consumer 處理多個 Partition
- 最佳實踐：Consumer 數量 = Partition 數量

### 8. Broker（代理）

**定義**：Kafka 服務器，負責接收、存儲和發送消息。

**主要職責**：
1. 接收來自 Producer 的消息
2. 將消息持久化到磁碟
3. 響應 Consumer 的讀取請求
4. 管理 Partition 的副本
5. 參與集群的協調工作

**特點**：
- 一個 Kafka 集群通常有多個 Broker
- 每個 Broker 有一個唯一的 ID
- Broker 之間通過網絡通訊
- 可以動態增加或移除 Broker

**類比**：
- Broker 就像銀行的分行
- 每個分行（Broker）存儲部分數據（Partition）
- 客戶（Producer/Consumer）可以與任何分行互動
- 分行之間互相備份（副本機制）

**視覺化**：

```
Kafka Cluster (3 個 Brokers)

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Broker 0       │  │   Broker 1       │  │   Broker 2       │
│   (ID: 0)        │  │   (ID: 1)        │  │   (ID: 2)        │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Topic-A-Part-0   │  │ Topic-A-Part-1   │  │ Topic-A-Part-2   │
│ Topic-B-Part-0   │  │ Topic-B-Part-2   │  │ Topic-B-Part-1   │
│ Topic-C-Part-1   │  │ Topic-C-Part-0   │  │ Topic-C-Part-2   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 9. Cluster（集群）

**定義**：多個 Broker 組成的 Kafka 集群。

**優勢**：
- **高可用性**：單個 Broker 故障不影響整體服務
- **可擴展性**：可以增加 Broker 來提升性能
- **負載均衡**：數據和請求分散到多個 Broker

**協調機制**：
- 使用 ZooKeeper（傳統方式）或 KRaft（新方式）
- 選舉 Controller Broker
- 管理集群元數據

## 概念之間的關係

讓我們看看這些概念如何協同工作：

### 完整的消息流程

```
1. Producer 發送消息
   ↓
2. 消息被路由到特定的 Topic 和 Partition
   ↓
3. Broker 接收並持久化消息
   ↓
4. 消息被分配一個 Offset
   ↓
5. Consumer Group 中的 Consumer 從 Partition 讀取
   ↓
6. Consumer 處理消息並提交 Offset
```

### 層級關係

```
Cluster（集群）
  └── Broker（服務器）
       └── Topic（主題）
            └── Partition（分區）
                 └── Message（消息，帶 Offset）
```

### 實際示例

假設我們要構建一個訂單處理系統：

```
場景：處理用戶訂單

1. 配置：
   - Cluster: 3 個 Broker
   - Topic: "orders"
   - Partitions: 6 個分區
   - Replication: 每個分區有 3 個副本

2. 生產者端：
   - 訂單服務（Producer）發送訂單到 "orders" Topic
   - 使用 userId 作為 Key（確保同一用戶的訂單有序）
   
3. 消費者端：
   - Consumer Group "inventory-service": 3 個 Consumer，處理庫存扣減
   - Consumer Group "notification-service": 2 個 Consumer，發送通知
   - Consumer Group "analytics-service": 1 個 Consumer，數據分析

4. 數據流：
   訂單服務 → Partition 0-5 → 各 Consumer Group 獨立消費
```

## 關鍵數字和限制

了解一些實際的數字，有助於理解 Kafka 的能力：

- **單個 Broker**：可處理數百 MB/s 的吞吐量
- **Partition 數量**：單個 Broker 可管理數千個 Partition
- **消息大小**：默認最大 1MB（可配置）
- **保留時間**：默認 7 天（可配置為無限期）
- **Consumer 數量**：建議不超過 Partition 數量（同一 Group 內）

## 小結

在本章中，我們學習了 Kafka 的核心概念：

| 概念 | 簡單描述 | 類比 |
|-----|----------|------|
| **Message** | 數據的基本單位 | 一封信 |
| **Topic** | 消息的分類 | 報紙的版面 |
| **Partition** | Topic 的分片 | 書架 |
| **Offset** | 消息的位置標識 | 頁碼 |
| **Producer** | 發送消息的應用 | 寄件人 |
| **Consumer** | 接收消息的應用 | 收件人 |
| **Consumer Group** | 共同消費的消費者組 | 訂閱同一報紙的家庭成員 |
| **Broker** | Kafka 服務器 | 郵局 |
| **Cluster** | Broker 的集合 | 郵局網絡 |

**核心要點**：
1. Partition 是並行處理的基礎
2. Consumer Group 實現負載均衡和多訂閱者模式
3. Offset 管理是 Kafka 消費的核心機制
4. Broker 和 Cluster 提供高可用性和可擴展性

## 思考題

1. 如果一個 Topic 有 4 個 Partition，一個 Consumer Group 有 6 個 Consumer，會發生什麼？
2. 為什麼同一個 Key 的消息會被發送到同一個 Partition？這有什麼好處？
3. 兩個不同的 Consumer Group 消費同一個 Topic，它們會互相影響嗎？

## 下一步

現在你已經掌握了 Kafka 的核心概念和術語。在下一章中，我們將深入探討 Kafka 的設計哲學，了解為什麼 Kafka 能夠如此高效。

👉 [下一章：03 - Kafka 的設計哲學](../03-design-philosophy/README.md)

---

[返回目錄](../README.md)

