# 14 - 可靠性與一致性保證

## 學習目標

- 理解 Kafka 的交付語義
- 掌握數據持久性保證
- 了解事務支持
- 實現 Exactly-Once 語義

## Kafka 的交付語義

### 三種語義

| 語義 | 含義 | 實現方式 | 適用場景 |
|------|------|---------|----------|
| **At-Most-Once** | 最多一次 | 先提交後處理 | 允許丟失（日誌） |
| **At-Least-Once** | 至少一次 | 先處理後提交 | 不能丟失（訂單） |
| **Exactly-Once** | 恰好一次 | 冪等性+事務 | 嚴格要求（金融） |

### At-Most-Once（最多一次）

```typescript
// 配置
const consumer = kafka.consumer({
  groupId: 'my-group',
  autoCommit: true  // 自動提交，處理前就提交了
});

await consumer.run({
  eachMessage: async ({ message }) => {
    // 如果這裡崩潰，消息丟失
    await processMessage(message);
  }
});
```

**特點**：
- ✅ 不會重複
- ❌ 可能丟失
- 🚀 性能最好

### At-Least-Once（至少一次）

```typescript
// 配置
const consumer = kafka.consumer({
  groupId: 'my-group',
  autoCommit: false  // 手動提交
});

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    // 先處理
    await processMessage(message);
    
    // 後提交
    await consumer.commitOffsets([{
      topic,
      partition,
      offset: (parseInt(message.offset) + 1).toString()
    }]);
    
    // 如果提交失敗，下次重新處理（重複）
  }
});
```

**特點**：
- ✅ 不會丟失
- ⚠️ 可能重複
- 🔧 需要處理重複問題

### Exactly-Once（恰好一次）

結合以下技術：
1. Producer 冪等性
2. 事務支持
3. Consumer offset 存儲在事務中

## Producer 端可靠性

### 冪等性 Producer

```typescript
const producer = kafka.producer({
  idempotent: true,  // 啟用冪等性
  maxInFlightRequests: 5,
  acks: -1  // 等待所有 ISR 確認
});
```

**工作原理**：

```
Producer 自動分配：
- Producer ID (PID)
- Sequence Number

每條消息：
Message = {
  PID: 12345,
  Epoch: 0,
  Sequence: 0  ← 每條消息遞增
  Data: ...
}

Broker 檢查：
if (收到的 Sequence <= 已存儲的 Sequence):
    返回成功，但不重複存儲
else:
    存儲消息
```

**保證**：
- 同一 Producer 會話內不重複
- 單個分區內有序
- 不跨會話（重啟 Producer 後 PID 變化）

### Producer 事務

```typescript
const producer = kafka.producer({
  transactional Id: 'my-transactional-id',  // 唯一標識
  idempotent: true,
  maxInFlightRequests: 1,
  acks: -1
});

await producer.connect();

// 開始事務
const transaction = await producer.transaction();

try {
  // 發送多條消息（原子性）
  await transaction.send({
    topic: 'orders',
    messages: [{ value: 'order-1' }]
  });
  
  await transaction.send({
    topic: 'payments',
    messages: [{ value: 'payment-1' }]
  });
  
  // 提交事務
  await transaction.commit();
  console.log('✅ 事務提交成功');

} catch (error) {
  // 回滾事務
  await transaction.abort();
  console.error('❌ 事務已回滾', error);
}
```

**保證**：
- 所有消息要麼全部成功，要麼全部失敗
- 跨多個 Topic 和 Partition

## Consumer 端可靠性

### Exactly-Once with Transactions

創建 `examples/reliability/exactly-once-consumer.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'exactly-once-demo',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({
  groupId: 'exactly-once-group',
  autoCommit: false,
  // 只讀取已提交的事務消息
  isolation Level: 'read_committed'
});

const producer = kafka.producer({
  transactionalId: 'output-producer',
  idempotent: true,
  acks: -1
});

async function run() {
  await Promise.all([
    consumer.connect(),
    producer.connect()
  ]);

  await consumer.subscribe({ 
    topic: 'input-topic',
    fromBeginning: false 
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // 開始事務
      const transaction = await producer.transaction();

      try {
        // 1. 處理消息
        const result = await processMessage(message);

        // 2. 發送結果到輸出 Topic
        await transaction.send({
          topic: 'output-topic',
          messages: [{ value: JSON.stringify(result) }]
        });

        // 3. 提交 Consumer Offset（在事務中）
        await transaction.sendOffsets({
          consumerGroupId: 'exactly-once-group',
          topics: [{
            topic,
            partitions: [{
              partition,
              offset: (parseInt(message.offset) + 1).toString()
            }]
          }]
        });

        // 4. 提交事務
        await transaction.commit();
        console.log(`✅ Exactly-Once: offset ${message.offset}`);

      } catch (error) {
        // 回滾事務
        await transaction.abort();
        console.error('❌ 事務失敗，回滾', error);
      }
    }
  });
}

async function processMessage(message: any) {
  const data = JSON.parse(message.value?.toString() || '{}');
  // 處理邏輯
  return { 
    processed: true,
    original: data,
    timestamp: Date.now()
  };
}

run();
```

**關鍵點**：
1. Consumer 使用 `isolationLevel: 'read_committed'`
2. Producer 使用事務
3. Offset 提交包含在事務中
4. 原子性：處理 + 發送 + 提交 offset

## 數據持久性保證

### Broker 端配置

```properties
# 副本數（越多越可靠）
default.replication.factor=3

# 最小同步副本數
min.insync.replicas=2

# 不依賴 fsync（依賴 Page Cache）
log.flush.interval.messages=9223372036854775807
log.flush.interval.ms=null
```

### Producer 端配置

```typescript
const producer = kafka.producer({
  acks: -1,  // 等待所有 ISR 確認
  idempotent: true,
  retries: Number.MAX_SAFE_INTEGER
});
```

### 可靠性等級

**Level 1：基本可靠**
```typescript
// Broker: RF=3, min.insync.replicas=1
// Producer: acks=1
// 風險：Leader 失敗可能丟數據
```

**Level 2：高可靠（推薦）**
```typescript
// Broker: RF=3, min.insync.replicas=2
// Producer: acks=-1, idempotent=true
// 保證：至少 2 個副本確認
```

**Level 3：極致可靠**
```typescript
// Broker: RF=3, min.insync.replicas=3
// Producer: acks=-1, idempotent=true, transactions
// 保證：所有副本確認 + 事務
// 代價：性能較低
```

## 一致性模型

### Leader-Follower 一致性

```
HW (High Watermark)：
- 所有 ISR 都已複製的位置
- Consumer 只能讀取到 HW

LEO (Log End Offset)：
- 每個副本的最新位置

┌─────────┐        ┌─────────┐        ┌─────────┐
│ Leader  │        │Follower1│        │Follower2│
│         │        │         │        │         │
│ LEO: 10 │───────→│ LEO: 9  │        │ LEO: 8  │
│ HW: 8   │        │ HW: 8   │←───────│ HW: 8   │
└─────────┘        └─────────┘        └─────────┘

Consumer 只能讀到 offset 8（HW）
```

### Leader Epoch

避免數據截斷問題：

```
問題場景（沒有 Leader Epoch）：
1. Leader A 寫入 offset 10
2. Follower B 只複製到 offset 8
3. Leader A 掛了
4. B 成為新 Leader
5. A 恢復後，截斷 offset 8-10（數據丟失）

解決方案（Leader Epoch）：
- 每次 Leader 變更，Epoch 遞增
- 副本記錄 (Epoch, Start Offset)
- 恢復時檢查 Epoch，避免錯誤截斷
```

## 故障場景分析

### 場景 1：Producer 發送失敗

```
無冪等性：
發送 → 失敗 → 重試 → 成功 → 可能重複

有冪等性：
發送 (Seq=0) → 失敗 → 重試 (Seq=0) → Broker 去重 → 不重複
```

### 場景 2：Consumer 處理失敗

```
At-Least-Once：
讀取 → 處理失敗 → 不提交 → 重新處理 → 可能重複

Exactly-Once：
讀取 → 處理 + 輸出 + 提交 offset（事務） → 原子性
```

### 場景 3：Broker 失敗

```
RF=3, min.insync.replicas=2：
- 1 個 Broker 掛了 → 正常運行
- 2 個 Broker 掛了 → 只能讀，不能寫
- 3 個 Broker 掛了 → 不可用
```

## 最佳實踐

### 生產環境推薦配置

```typescript
// Producer
const producer = kafka.producer({
  idempotent: true,
  acks: -1,
  maxInFlightRequests: 5,
  retries: Number.MAX_SAFE_INTEGER,
  compression: CompressionTypes.ZSTD
});

// Broker (server.properties)
default.replication.factor=3
min.insync.replicas=2
unclean.leader.election.enable=false  // 禁止非 ISR 成為 Leader

// Consumer
const consumer = kafka.consumer({
  groupId: 'my-group',
  autoCommit: false,
  isolationLevel: 'read_committed'  // 如果使用事務
});
```

### 監控指標

```bash
# 查看副本狀態
kafka-topics --describe --bootstrap-server localhost:9092 \
  --under-replicated-partitions

# 查看 ISR
kafka-topics --describe --bootstrap-server localhost:9092 \
  --topic my-topic

# 監控 Lag
kafka-consumer-groups --describe --bootstrap-server localhost:9092 \
  --group my-group
```

## 小結

本章學習了：

1. **交付語義**：At-Most-Once, At-Least-Once, Exactly-Once
2. **冪等性**：避免 Producer 重複
3. **事務**：跨 Partition 原子性
4. **持久性**：副本和 ISR
5. **一致性**：HW、LEO、Leader Epoch

## 下一步

完成了架構深入部分，接下來進入實戰應用！

👉 [下一章：15 - 常見應用模式](../15-common-patterns/README.md)

---

[返回目錄](../README.md)

