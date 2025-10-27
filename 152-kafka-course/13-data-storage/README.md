# 13 - 數據存儲與日誌

## 學習目標

- 理解 Kafka 的存儲結構
- 掌握日誌段（Log Segment）機制
- 了解索引的作用
- 理解數據保留和清理策略

## Kafka 的存儲結構

### 目錄結構

```
/var/kafka-logs/                 ← log.dirs 配置的目錄
├── topic-name-0/                ← Topic: topic-name, Partition: 0
│   ├── 00000000000000000000.log        ← Segment 文件
│   ├── 00000000000000000000.index      ← Offset 索引
│   ├── 00000000000000000000.timeindex  ← 時間索引
│   ├── 00000000000000100000.log        ← 下一個 Segment
│   ├── 00000000000000100000.index
│   ├── 00000000000000100000.timeindex
│   └── leader-epoch-checkpoint         ← Leader Epoch 文件
├── topic-name-1/                ← Partition: 1
│   └── ...
└── topic-name-2/                ← Partition: 2
    └── ...
```

### 分區 = 日誌（Log）

```
Partition 在磁碟上就是一個目錄：

topic-orders-0/
    ↓
多個 Segment 文件（按順序追加）

每個 Segment：
- .log 文件：實際的消息數據
- .index 文件：offset → 文件位置的映射
- .timeindex 文件：timestamp → offset的映射
```

## 日誌段（Log Segment）

### 什麼是 Segment？

```
Partition 被分成多個 Segment：

Partition 0:
├── Segment 0    (offset 0 - 99999)
├── Segment 1    (offset 100000 - 199999)
├── Segment 2    (offset 200000 - 299999)  ← Active Segment
└── ...

只有最後一個 Segment 是「Active」（可寫入）
其他 Segment 是「Closed」（只讀）
```

### 為什麼需要 Segment？

1. **加快啟動速度**：不需要一次性載入整個分區
2. **便於清理**：刪除舊 Segment 文件
3. **便於壓縮**：對舊 Segment 進行壓縮
4. **限制單文件大小**：避免文件過大

### Segment 滾動條件

```properties
# 配置文件：server.properties

# 條件 1：大小超過閾值（默認 1GB）
log.segment.bytes=1073741824

# 條件 2：時間超過閾值（默認 7 天）
log.segment.ms=604800000

# 條件 3：索引文件滿了
log.index.size.max.bytes=10485760
```

當任一條件滿足，創建新 Segment。

### Segment 文件命名

```
文件名 = 該 Segment 的起始 offset（20 位，補零）

例如：
00000000000000000000.log    ← offset 0 開始
00000000000000100000.log    ← offset 100000 開始
00000000000000200000.log    ← offset 200000 開始
```

## 消息格式

### 消息在文件中的結構

```
單條消息（Record）：

┌────────────────────────────────┐
│ Offset (8 bytes)               │ ← offset
├────────────────────────────────┤
│ Message Size (4 bytes)         │ ← 消息大小
├────────────────────────────────┤
│ CRC (4 bytes)                  │ ← 校驗和
├────────────────────────────────┤
│ Magic (1 byte)                 │ ← 版本號
├────────────────────────────────┤
│ Attributes (1 byte)            │ ← 壓縮類型等
├────────────────────────────────┤
│ Timestamp (8 bytes)            │ ← 時間戳
├────────────────────────────────┤
│ Key Length (4 bytes)           │
├────────────────────────────────┤
│ Key (variable)                 │ ← Key 數據
├────────────────────────────────┤
│ Value Length (4 bytes)         │
├────────────────────────────────┤
│ Value (variable)               │ ← Value 數據
├────────────────────────────────┤
│ Headers (variable)             │ ← Headers
└────────────────────────────────┘
```

### 批次（Batch）

Kafka 實際上是以批次（Batch）為單位寫入的：

```
Batch:
  Header:
    - Base Offset
    - Batch Length
    - CRC
    - Compression Type
    - Timestamp
    - ...
  Records:
    - Record 1
    - Record 2
    - ...
```

## 索引機制

### Offset Index

**作用**：根據 offset 快速定位到文件位置

```
00000000000000100000.index:

offset → position
100000 → 0
100100 → 5432
100200 → 10864
...

稀疏索引（不是每條消息都有索引項）
```

### Time Index

**作用**：根據時間戳快速定位到 offset

```
00000000000000100000.timeindex:

timestamp → offset
1609459200000 → 100000
1609462800000 → 100500
1609466400000 → 101000
...
```

### 查找過程

```
查找 offset 150000 的消息：

1. 二分查找 Segment:
   - 00000000000000000000.log (0-99999)
   - 00000000000000100000.log (100000-199999) ✓ 命中
   - 00000000000000200000.log (200000-299999)

2. 讀取 index 文件：
   100000 → 0
   100100 → 5432
   100200 → 10864
   ...
   150000 → 267890 ✓

3. 從 position 267890 開始順序讀取到 offset 150000
```

## 數據保留策略

### 策略 1：基於時間

```properties
# 保留 7 天
log.retention.hours=168

# 或更精確
log.retention.ms=604800000

刪除邏輯：
if (segment最後修改時間 + retention時間 < 當前時間):
    刪除該 segment
```

### 策略 2：基於大小

```properties
# 每個分區最多保留 10GB
log.retention.bytes=10737418240

刪除邏輯：
if (分區總大小 > retention.bytes):
    刪除最舊的 segment
```

### 策略 3：Log Compaction

**適用場景**：需要保留每個 Key 的最新值（如數據庫變更日誌）

```properties
log.cleanup.policy=compact
```

**工作原理**：

```
原始日誌：
offset  key  value
0       A    1
1       B    2
2       A    3      ← A 的新值
3       C    4
4       B    5      ← B 的新值

壓縮後：
offset  key  value
2       A    3      ← 保留 A 的最新值
3       C    4      ← C 只有一個值
4       B    5      ← 保留 B 的最新值

Key 為 null 的消息會被刪除（墓碑消息）
```

**配置**：

```properties
# 啟用壓縮
log.cleanup.policy=compact

# 壓縮頻率
log.cleaner.min.cleanable.ratio=0.5

# 最小保留時間（即使壓縮也保留）
log.cleaner.min.compaction.lag.ms=60000
```

## 數據清理

### 刪除（Delete）

```bash
# 默認每 5 分鐘檢查一次
log.retention.check.interval.ms=300000

清理過程：
1. 後台線程定期檢查
2. 找出過期的 Segment
3. 刪除 .log, .index, .timeindex 文件
```

### 壓縮（Compact）

```bash
# Log Cleaner 線程數
log.cleaner.threads=1

壓縮過程：
1. 選擇需要壓縮的 Segment
2. 構建 Key 的哈希表
3. 掃描 Segment，保留每個 Key 的最新值
4. 寫入新的 Segment
5. 替換舊 Segment
```

## 性能優化

### 配置建議

```properties
# 1. Segment 大小
# 較大的 Segment：減少文件數量，但刪除/壓縮慢
# 較小的 Segment：更快清理，但文件數量多
log.segment.bytes=1073741824  # 1GB（默認）

# 2. Flush 策略
# 依賴作業系統 Page Cache，不頻繁 flush
log.flush.interval.messages=9223372036854775807
log.flush.interval.ms=null

# 3. 壓縮配置（如果使用）
compression.type=producer  # 保持 Producer 的壓縮
```

### 監控指標

```bash
# 查看分區大小
du -sh /var/kafka-logs/topic-name-0/

# 查看 Segment 數量
ls -l /var/kafka-logs/topic-name-0/ | grep .log | wc -l

# 查看最老的 Segment
ls -lt /var/kafka-logs/topic-name-0/*.log | tail -1
```

## 實用命令

```bash
# 查看 Segment 詳情
kafka-run-class kafka.tools.DumpLogSegments \
  --files /var/kafka-logs/topic-name-0/00000000000000000000.log \
  --print-data-log

# 驗證索引
kafka-run-class kafka.tools.DumpLogSegments \
  --files /var/kafka-logs/topic-name-0/00000000000000000000.index \
  --verify-index-only

# 查看 Topic 數據大小
kafka-log-dirs --describe --bootstrap-server localhost:9092 \
  --topic-list topic-name
```

## 小結

本章學習了：

1. **存儲結構**：目錄、Segment、索引
2. **Log Segment**：分片管理、滾動條件
3. **索引機制**：快速定位消息
4. **保留策略**：時間、大小、壓縮
5. **性能優化**：配置和監控

## 下一步

👉 [下一章：14 - 可靠性與一致性保證](../14-reliability-and-consistency/README.md)

---

[返回目錄](../README.md)

