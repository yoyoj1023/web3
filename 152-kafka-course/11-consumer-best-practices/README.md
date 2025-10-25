# 11 - Consumer 最佳實踐

## 避免重複消費和消息丟失

### At-Least-Once 保證

```
Kafka 默認提供 At-Least-Once 語義：
- 消息至少被處理一次
- 可能重複，但不會丟失

實現方式：
1. 處理消息
2. 提交 offset
3. 如果步驟 2 失敗 → 下次重新處理（重複）
```

### 避免消息丟失

**❌ 不安全的做法**：

```typescript
// 先提交，後處理
await consumer.commitOffsets([...]);
await processMessage(message);  // 如果這裡失敗，消息丟失
```

**✅ 安全的做法**：

```typescript
// 先處理，後提交
await processMessage(message);
await consumer.commitOffsets([...]);  // 確保處理成功才提交
```

### 避免重複消費

方式 1：**冪等性處理**

```typescript
// 使用數據庫唯一約束
async function processOrderIdempotent(order: any) {
  try {
    await db.query(
      'INSERT INTO orders (id, data, processed_at) VALUES ($1, $2, NOW())',
      [order.id, JSON.stringify(order)]
    );
  } catch (error) {
    if (error.code === '23505') {  // Unique violation
      console.log('訂單已處理，跳過');
      return;
    }
    throw error;
  }
}
```

方式 2：**分布式鎖**

```typescript
import Redis from 'ioredis';

const redis = new Redis();

async function processWithLock(messageId: string, handler: () => Promise<void>) {
  const lockKey = `lock:${messageId}`;
  const lockAcquired = await redis.set(lockKey, '1', 'EX', 300, 'NX');
  
  if (!lockAcquired) {
    console.log('消息正在被其他 Consumer 處理');
    return;
  }
  
  try {
    await handler();
  } finally {
    await redis.del(lockKey);
  }
}
```

## 性能優化

### 1. 批次處理

```typescript
await consumer.run({
  eachBatch: async ({ batch }) => {
    const messages = batch.messages.map(m => 
      JSON.parse(m.value?.toString() || '{}')
    );
    
    // 批量插入數據庫
    await db.bulkInsert(messages);
    
    // 比逐條插入快很多
  }
});
```

### 2. 預取配置

```typescript
const consumer = kafka.consumer({
  groupId: 'my-group',
  maxBytesPerPartition: 1048576,  // 每次拉取最大 1MB
  minBytes: 1,                     // 最小字節數
  maxWaitTimeInMs: 5000            // 最多等待 5 秒
});
```

### 3. 並發處理（謹慎使用）

```typescript
import pLimit from 'p-limit';

await consumer.run({
  eachBatch: async ({ batch }) => {
    const limit = pLimit(10);  // 並發數
    
    await Promise.all(
      batch.messages.map(message =>
        limit(() => processMessage(message))
      )
    );
  }
});
```

## 監控與告警

### 關鍵指標

```typescript
// 1. Consumer Lag（延遲）
// 2. 消費速率（messages/sec）
// 3. 錯誤率
// 4. Rebalance 頻率

class ConsumerMetrics {
  private processed = 0;
  private errors = 0;
  private startTime = Date.now();

  recordSuccess() {
    this.processed++;
  }

  recordError() {
    this.errors++;
  }

  getMetrics() {
    const duration = (Date.now() - this.startTime) / 1000;
    return {
      processed: this.processed,
      errors: this.errors,
      errorRate: this.errors / this.processed,
      throughput: this.processed / duration
    };
  }
}
```

## 常見問題排查

### 問題 1：Consumer Lag 過大

**症狀**：LOG-END-OFFSET - CURRENT-OFFSET 很大

**可能原因**：
1. Consumer 處理太慢
2. Consumer 數量不足
3. 分區數不足

**解決方案**：
```typescript
// 1. 增加 Consumer 數量
// 2. 優化處理邏輯
// 3. 增加分區數（謹慎）
// 4. 使用批次處理
```

### 問題 2：頻繁 Rebalance

**症狀**：日誌中頻繁出現 "Rebalance"

**可能原因**：
1. Session Timeout 太短
2. 處理時間超過 maxPollInterval
3. Consumer 頻繁加入/離開

**解決方案**：
```typescript
const consumer = kafka.consumer({
  groupId: 'stable-group',
  sessionTimeout: 45000,      // 增加超時
  maxPollInterval: 600000,    // 增加 poll 間隔
  heartbeatInterval: 3000
});
```

### 問題 3：消息重複

**症狀**：同一條消息被處理多次

**可能原因**：
1. 處理後提交 offset 失敗
2. Rebalance 導致

**解決方案**：
```typescript
// 實現冪等性處理
async function process(message: any) {
  const messageId = message.key.toString();
  
  // 檢查是否已處理
  const exists = await db.exists(messageId);
  if (exists) return;
  
  // 處理並記錄
  await db.transaction(async (trx) => {
    await trx.processMessage(message);
    await trx.markAsProcessed(messageId);
  });
}
```

## 完整示例：生產級 Consumer

創建 `examples/consumer-best-practices/production-consumer.ts`：

```typescript
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import winston from 'winston';

// 日誌配置
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'consumer.log' })
  ]
});

export class ProductionConsumer {
  private consumer: Consumer;
  private metrics = {
    processed: 0,
    errors: 0,
    startTime: Date.now()
  };

  constructor(
    brokers: string[],
    groupId: string,
    topics: string[]
  ) {
    const kafka = new Kafka({
      clientId: `${groupId}-client`,
      brokers,
      retry: { retries: 5 }
    });

    this.consumer = kafka.consumer({
      groupId,
      autoCommit: false,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxPollInterval: 300000
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.consumer.on(this.consumer.events.CRASH, ({ payload }) => {
      logger.error('Consumer crashed', payload);
    });

    this.consumer.on(this.consumer.events.REBALANCING, () => {
      logger.warn('Rebalance starting');
    });

    this.consumer.on(this.consumer.events.REBALANCE, () => {
      logger.info('Rebalance completed');
    });
  }

  async start(
    handler: (message: any) => Promise<void>
  ) {
    await this.consumer.connect();
    logger.info('Consumer connected');

    await this.consumer.subscribe({ 
      topics: ['orders'],
      fromBeginning: false 
    });

    await this.consumer.run({
      eachMessage: async (payload) => {
        await this.handleMessage(payload, handler);
      }
    });

    // 定期輸出指標
    setInterval(() => this.logMetrics(), 60000);
  }

  private async handleMessage(
    { topic, partition, message }: EachMessagePayload,
    handler: (data: any) => Promise<void>
  ) {
    const startTime = Date.now();

    try {
      // 解析消息
      const data = JSON.parse(message.value?.toString() || '{}');

      // 調用處理器
      await handler(data);

      // 提交 offset
      await this.consumer.commitOffsets([{
        topic,
        partition,
        offset: (parseInt(message.offset) + 1).toString()
      }]);

      this.metrics.processed++;
      
      const duration = Date.now() - startTime;
      logger.debug('Message processed', {
        topic,
        partition,
        offset: message.offset,
        duration
      });

    } catch (error) {
      this.metrics.errors++;
      
      logger.error('Message processing failed', {
        topic,
        partition,
        offset: message.offset,
        error: (error as Error).message
      });

      // 這裡可以實現重試邏輯或發送到 DLQ
    }
  }

  private logMetrics() {
    const duration = (Date.now() - this.metrics.startTime) / 1000;
    const throughput = (this.metrics.processed / duration).toFixed(2);
    const errorRate = (
      (this.metrics.errors / this.metrics.processed) * 100
    ).toFixed(2);

    logger.info('Metrics', {
      processed: this.metrics.processed,
      errors: this.metrics.errors,
      throughput: `${throughput} msg/s`,
      errorRate: `${errorRate}%`
    });
  }

  async stop() {
    await this.consumer.disconnect();
    logger.info('Consumer disconnected');
  }
}

// 使用示例
async function main() {
  const consumer = new ProductionConsumer(
    ['localhost:9092'],
    'production-group',
    ['orders']
  );

  await consumer.start(async (order) => {
    // 業務邏輯
    console.log(`處理訂單: ${order.orderId}`);
    await processOrder(order);
  });

  // 優雅關閉
  process.on('SIGINT', async () => {
    await consumer.stop();
    process.exit(0);
  });
}

async function processOrder(order: any) {
  // 實際的業務處理邏輯
  await new Promise(resolve => setTimeout(resolve, 100));
}

main();
```

## 小結

本章涵蓋了：

1. **避免丟失和重複**：正確的提交順序、冪等性
2. **性能優化**：批次處理、預取配置
3. **監控**：關鍵指標、日誌
4. **問題排查**：Lag、Rebalance、重複

這些實踐能幫助你構建可靠、高效的 Consumer。

## 下一步

至此，我們完成了 Producer 和 Consumer 的學習。接下來將深入 Kafka 的架構。

👉 [下一章：12 - Broker 與集群](../12-broker-and-cluster/README.md)

---

[返回目錄](../README.md)

