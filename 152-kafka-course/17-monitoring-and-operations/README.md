# 17 - 監控與運維基礎

## 學習目標

- 了解 Kafka 的關鍵監控指標
- 掌握常用的監控工具
- 學習常見問題診斷方法
- 理解性能調優基礎

## 關鍵監控指標

### Broker 指標

| 指標 | 含義 | 正常範圍 | 告警閾值 |
|------|------|---------|----------|
| **UnderReplicatedPartitions** | 副本未同步的分區數 | 0 | > 0 |
| **OfflinePartitionsCount** | 離線分區數 | 0 | > 0 |
| **ActiveControllerCount** | Controller 數量 | 1 | != 1 |
| **RequestHandlerAvgIdlePercent** | 請求處理器空閒率 | > 20% | < 10% |
| **NetworkProcessorAvgIdlePercent** | 網路處理器空閒率 | > 30% | < 20% |

### Producer 指標

```
重要指標：
- record-send-rate: 發送速率（records/sec）
- record-error-rate: 錯誤率
- record-retry-rate: 重試率
- request-latency-avg: 平均延遲
- buffer-available-bytes: 可用緩衝區
```

### Consumer 指標

```
重要指標：
- records-lag-max: 最大 Lag
- records-consumed-rate: 消費速率
- commit-latency-avg: 提交延遲
- fetch-latency-avg: 拉取延遲
```

## 使用 Kafka UI

### 安裝（已在 docker-compose.yml 中配置）

訪問: http://localhost:8080

### 功能

1. **查看 Topics**
   - 分區數、副本數
   - 消息數量
   - 配置參數

2. **查看 Consumer Groups**
   - 成員列表
   - Lag 統計
   - Offset 信息

3. **瀏覽消息**
   - 查看最近的消息
   - 按 offset 搜索
   - 查看消息內容

4. **管理操作**
   - 創建/刪除 Topic
   - 修改配置
   - 重置 Offset

## 命令行監控

### 查看 Broker 狀態

```bash
# 查看所有 Broker
kafka-broker-api-versions \
  --bootstrap-server localhost:9092 | head -1

# 查看集群描述
kafka-metadata-shell --snapshot /var/kafka-logs/__cluster_metadata-0/*.log
```

### 查看 Topic 詳情

```bash
# 列出所有 Topic
kafka-topics --list --bootstrap-server localhost:9092

# 查看 Topic 詳細信息
kafka-topics --describe \
  --bootstrap-server localhost:9092 \
  --topic my-topic

# 查看副本未同步的分區
kafka-topics --describe \
  --bootstrap-server localhost:9092 \
  --under-replicated-partitions

# 查看沒有 Leader 的分區
kafka-topics --describe \
  --bootstrap-server localhost:9092 \
  --unavailable-partitions
```

### 監控 Consumer Lag

```bash
# 查看所有 Consumer Group
kafka-consumer-groups --list \
  --bootstrap-server localhost:9092

# 查看特定 Group 的詳情
kafka-consumer-groups --describe \
  --bootstrap-server localhost:9092 \
  --group my-group

# 輸出示例：
GROUP     TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
my-group  orders    0          1500            1500            0
my-group  orders    1          1450            1500            50    ← 有 Lag
my-group  orders    2          1500            1500            0
```

### 查看日誌大小

```bash
# 查看 Topic 數據大小
kafka-log-dirs --describe \
  --bootstrap-server localhost:9092 \
  --topic-list orders

# 查看磁碟使用
du -sh /var/kafka-logs/
du -sh /var/kafka-logs/orders-*
```

## 常見問題診斷

### 問題 1：Consumer Lag 過大

**診斷步驟**：

```bash
# 1. 確認 Lag
kafka-consumer-groups --describe \
  --bootstrap-server localhost:9092 \
  --group my-group

# 2. 檢查 Consumer 是否在線
# 如果 CONSUMER-ID 列為空，說明 Consumer 離線

# 3. 檢查 Consumer 處理速度
# 觀察 LAG 是否持續增長
```

**可能原因**：
- Consumer 數量不足
- Consumer 處理速度慢
- 分區數不足
- Consumer 崩潰

**解決方案**：
```typescript
// 1. 增加 Consumer 數量
// 2. 優化處理邏輯
// 3. 使用批次處理
await consumer.run({
  eachBatch: async ({ batch }) => {
    // 批量處理更快
    await processBatch(batch.messages);
  }
});

// 4. 增加分區數（謹慎）
```

### 問題 2：頻繁 Rebalance

**診斷**：

```bash
# 查看 Consumer 日誌
# 如果頻繁出現 "Rebalance" 相關日誌

# 查看 Group 狀態
kafka-consumer-groups --describe \
  --bootstrap-server localhost:9092 \
  --group my-group \
  --state
```

**可能原因**：
- Session timeout 太短
- 處理時間超過 max.poll.interval.ms
- Consumer 頻繁加入/離開

**解決方案**：

```typescript
const consumer = kafka.consumer({
  groupId: 'stable-group',
  sessionTimeout: 45000,      // 增加
  maxPollInterval: 600000,    // 增加
  heartbeatInterval: 3000
});

// 或使用 eachBatch 手動發送心跳
await consumer.run({
  eachBatch: async ({ batch, heartbeat }) => {
    for (const message of batch.messages) {
      await processMessage(message);
      await heartbeat();  // 定期發送心跳
    }
  }
});
```

### 問題 3：磁碟空間不足

**診斷**：

```bash
# 檢查磁碟使用
df -h /var/kafka-logs

# 檢查最大的 Topic
du -sh /var/kafka-logs/* | sort -h | tail -10
```

**解決方案**：

```bash
# 1. 調整保留策略
kafka-configs --alter \
  --bootstrap-server localhost:9092 \
  --entity-type topics \
  --entity-name my-topic \
  --add-config retention.ms=86400000  # 1 天

# 2. 啟用壓縮
kafka-configs --alter \
  --bootstrap-server localhost:9092 \
  --entity-type topics \
  --entity-name my-topic \
  --add-config compression.type=zstd

# 3. 刪除舊 Topic
kafka-topics --delete \
  --bootstrap-server localhost:9092 \
  --topic old-topic
```

### 問題 4：Producer 發送緩慢

**診斷**：

```typescript
// 記錄發送延遲
const startTime = Date.now();
await producer.send({...});
const latency = Date.now() - startTime;

if (latency > 1000) {
  console.warn(`發送延遲過高: ${latency}ms`);
}
```

**可能原因**：
- 批次大小太小
- 未啟用壓縮
- acks=-1 但副本同步慢
- 網路問題

**解決方案**：

```typescript
const producer = kafka.producer({
  batchSize: 32768,        // 增加批次大小
  lingerMs: 10,            // 等待湊批
  compression: CompressionTypes.ZSTD,
  acks: 1                  // 降低可靠性要求（如果可以）
});
```

## 性能調優基礎

### Producer 調優

```typescript
// 高吞吐量配置
const producer = kafka.producer({
  batchSize: 32768,
  lingerMs: 50,
  compression: CompressionTypes.LZ4,
  acks: 1
});

// 低延遲配置
const producer = kafka.producer({
  batchSize: 1024,
  lingerMs: 0,
  compression: CompressionTypes.None,
  acks: 1
});

// 高可靠性配置
const producer = kafka.producer({
  idempotent: true,
  acks: -1,
  maxInFlightRequests: 1
});
```

### Consumer 調優

```typescript
// 高吞吐量配置
const consumer = kafka.consumer({
  groupId: 'my-group',
  maxBytesPerPartition: 2097152,  // 2MB
  minBytes: 102400,                // 100KB
  maxWaitTimeInMs: 500
});

// 低延遲配置
const consumer = kafka.consumer({
  groupId: 'my-group',
  maxBytesPerPartition: 524288,  // 512KB
  minBytes: 1,
  maxWaitTimeInMs: 100
});
```

### Broker 調優

```properties
# 高吞吐量
num.network.threads=8
num.io.threads=16
socket.send.buffer.bytes=1048576
socket.receive.buffer.bytes=1048576

# 副本配置
num.replica.fetchers=4
replica.fetch.max.bytes=1048576

# 日誌配置
log.segment.bytes=1073741824
log.flush.interval.messages=10000
```

## 監控腳本示例

創建 `scripts/monitor.sh`：

```bash
#!/bin/bash

echo "=== Kafka 健康檢查 ==="
echo ""

# 1. 檢查 Broker
echo "1. Broker 狀態:"
kafka-broker-api-versions --bootstrap-server localhost:9092 2>&1 | \
  grep -q "localhost:9092" && echo "  ✓ Broker 正常" || echo "  ✗ Broker 離線"
echo ""

# 2. 檢查副本未同步的分區
echo "2. 副本狀態:"
UNDER_REPLICATED=$(kafka-topics --describe --bootstrap-server localhost:9092 \
  --under-replicated-partitions 2>/dev/null | wc -l)
  
if [ $UNDER_REPLICATED -eq 0 ]; then
  echo "  ✓ 所有副本已同步"
else
  echo "  ⚠  有 $UNDER_REPLICATED 個分區副本未同步"
fi
echo ""

# 3. 檢查 Consumer Lag
echo "3. Consumer Lag:"
kafka-consumer-groups --list --bootstrap-server localhost:9092 2>/dev/null | \
while read group; do
  MAX_LAG=$(kafka-consumer-groups --describe \
    --bootstrap-server localhost:9092 \
    --group $group 2>/dev/null | \
    awk 'NR>1 {print $6}' | sort -nr | head -1)
    
  if [ -n "$MAX_LAG" ] && [ "$MAX_LAG" -gt 1000 ]; then
    echo "  ⚠  Group: $group, Max Lag: $MAX_LAG"
  fi
done
echo ""

# 4. 檢查磁碟空間
echo "4. 磁碟使用:"
df -h /var/kafka-logs | awk 'NR==2 {print "  使用: "$5}'
```

## 小結

本章學習了：

1. **監控指標**：Broker、Producer、Consumer 的關鍵指標
2. **監控工具**：Kafka UI、命令行工具
3. **問題診斷**：常見問題的排查方法
4. **性能調優**：基礎的調優策略

## 下一步

最後一章：課程總結與進階方向！

👉 [下一章：18 - 課程總結與進階方向](../18-summary-and-next-steps/README.md)

---

[返回目錄](../README.md)

