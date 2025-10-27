# 10 - Consumer 進階配置

## 學習目標

- 自動提交 vs 手動提交的權衡
- Offset 重置策略
- 消費者並發處理
- 實現可靠的 Consumer

## 自動提交 vs 手動提交

### 對比

| 特性 | 自動提交 | 手動提交 |
|------|---------|----------|
| **實現複雜度** | 簡單 | 較複雜 |
| **性能** | 較高 | 稍低 |
| **可靠性** | 可能丟失或重複 | 更可控 |
| **適用場景** | 允許少量丟失 | 不能丟失數據 |

### 自動提交示例

```typescript
import { Kafka } from 'kafkajs';

const consumer = kafka.consumer({
  groupId: 'auto-commit-group',
  // 自動提交配置（默認）
  autoCommit: true,
  autoCommitInterval: 5000,  // 每 5 秒提交一次
  autoCommitThreshold: 100   // 或每 100 條消息提交
});

await consumer.run({
  eachMessage: async ({ message }) => {
    // 處理消息
    await processMessage(message);
    // Offset 會自動提交（不需要手動操作）
  }
});
```

**風險**：
```
時間線：
0s:  處理 offset 0-99
5s:  自動提交 offset 100
6s:  處理 offset 100-150 時程序崩潰
重啟: 從 offset 100 開始（offset 100-150 丟失）
```

### 手動提交示例

創建 `examples/consumer-advanced/01-manual-commit.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'manual-commit-demo',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({
  groupId: 'manual-commit-group',
  autoCommit: false  // 關閉自動提交
});

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const order = JSON.parse(message.value?.toString() || '{}');
        
        // 1. 處理消息
        await processOrder(order);
        
        // 2. 寫入數據庫
        await saveToDatabase(order);
        
        // 3. 手動提交 offset（確保處理成功後才提交）
        await consumer.commitOffsets([{
          topic,
          partition,
          offset: (parseInt(message.offset) + 1).toString()
        }]);
        
        console.log(`✅ 處理並提交: offset ${message.offset}`);

      } catch (error) {
        console.error(`❌ 處理失敗: offset ${message.offset}`, error);
        // 不提交 offset，下次會重新處理
        // 但要注意避免無限重試
      }
    }
  });
}

async function processOrder(order: any) {
  // 業務邏輯
  console.log(`處理訂單: ${order.orderId}`);
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function saveToDatabase(order: any) {
  // 持久化
  console.log(`保存訂單: ${order.orderId}`);
  await new Promise(resolve => setTimeout(resolve, 50));
}

run();
```

### 批次手動提交

```typescript
await consumer.run({
  eachBatch: async ({ batch, resolveOffset, commitOffsetsIfNecessary }) => {
    for (const message of batch.messages) {
      await processMessage(message);
      resolveOffset(message.offset);
    }
    
    // 批次處理完成後一次性提交
    await commitOffsetsIfNecessary();
  }
});
```

## Offset 重置策略

### earliest vs latest

```typescript
const consumer = kafka.consumer({
  groupId: 'my-group',
  autoOffsetReset: 'earliest'  // 或 'latest'
});
```

| 策略 | 行為 | 適用場景 |
|------|------|---------|
| **earliest** | 從最早的消息開始 | 不能漏消息 |
| **latest** | 從最新的消息開始 | 只關心新消息 |

### 場景分析

```
Partition 狀態：
Offset: 0 ....... 1000 ....... 2000 (最新)

場景 1: 新 Consumer Group（沒有committed offset）
  earliest → 從 offset 0 開始
  latest   → 從 offset 2000 開始

場景 2: 已有 committed offset = 1500
  無論配置如何 → 從 offset 1500 開始

場景 3: committed offset = 500，但最早可用 offset = 1000
  earliest → 從 offset 1000 開始（數據已被清理）
```

## 並發處理

### 方式 1：多 Consumer 實例

```bash
# 啟動多個進程，每個運行一個 Consumer
node consumer.js  # Consumer 1
node consumer.js  # Consumer 2
node consumer.js  # Consumer 3
```

### 方式 2：eachBatch + 並發處理

創建 `examples/consumer-advanced/02-concurrent-processing.ts`：

```typescript
import { Kafka } from 'kafkajs';
import pLimit from 'p-limit';

const kafka = new Kafka({
  clientId: 'concurrent-demo',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'concurrent-group' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: false });

  await consumer.run({
    eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
      // 限制並發數為 10
      const limit = pLimit(10);

      const promises = batch.messages.map((message) =>
        limit(async () => {
          try {
            // 並發處理消息
            await processMessage(message);
            resolveOffset(message.offset);
          } catch (error) {
            console.error(`處理失敗: ${message.offset}`, error);
          }
        })
      );

      // 等待所有消息處理完成
      await Promise.all(promises);
      
      // 發送心跳
      await heartbeat();
    }
  });
}

async function processMessage(message: any) {
  // 模擬異步處理
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  console.log(`處理完成: offset ${message.offset}`);
}

run();
```

**注意**：
- 並發處理會打亂消息順序
- 適用於順序不重要的場景
- 要控制並發數，避免資源耗盡

## 錯誤處理與重試

### 方式 1：立即重試

```typescript
async function processWithRetry(message: any, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await processMessage(message);
      return;  // 成功
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('重試次數用盡:', error);
        throw error;
      }
      console.log(`重試 ${attempt + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### 方式 2：死信隊列

創建 `examples/consumer-advanced/03-dead-letter-queue.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'dlq-demo',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ 
  groupId: 'dlq-group',
  autoCommit: false 
});

const dlqProducer = kafka.producer();

async function run() {
  await Promise.all([
    consumer.connect(),
    dlqProducer.connect()
  ]);

  await consumer.subscribe({ topic: 'orders', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        // 嘗試處理
        await processMessage(message);
        
        // 成功後提交
        await consumer.commitOffsets([{
          topic,
          partition,
          offset: (parseInt(message.offset) + 1).toString()
        }]);

      } catch (error) {
        console.error('處理失敗，發送到死信隊列', error);
        
        // 發送到死信隊列
        await dlqProducer.send({
          topic: 'orders-dlq',  // 死信隊列 Topic
          messages: [{
            key: message.key?.toString(),
            value: message.value?.toString(),
            headers: {
              'original-topic': topic,
              'original-partition': partition.toString(),
              'original-offset': message.offset,
              'error-message': (error as Error).message,
              'failed-at': Date.now().toString()
            }
          }]
        });

        // 提交 offset（跳過此消息）
        await consumer.commitOffsets([{
          topic,
          partition,
          offset: (parseInt(message.offset) + 1).toString()
        }]);
      }
    }
  });
}

async function processMessage(message: any) {
  // 模擬隨機失敗
  if (Math.random() < 0.2) {
    throw new Error('處理失敗');
  }
  console.log(`處理成功: ${message.offset}`);
}

run();
```

## 實現可靠的 Consumer

創建 `examples/consumer-advanced/04-reliable-consumer.ts`：

```typescript
import { Kafka, EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'reliable-consumer',
  brokers: ['localhost:9092']
});

class ReliableConsumer {
  private consumer;
  private producer;  // 用於死信隊列
  private running = false;
  private messageHandler: (message: any) => Promise<void>;

  constructor(
    groupId: string,
    topic: string,
    handler: (message: any) => Promise<void>
  ) {
    this.consumer = kafka.consumer({
      groupId,
      autoCommit: false,
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });

    this.producer = kafka.producer({ idempotent: true });
    this.messageHandler = handler;
  }

  async start() {
    await Promise.all([
      this.consumer.connect(),
      this.producer.connect()
    ]);

    this.running = true;

    await this.consumer.subscribe({ 
      topic: 'orders',
      fromBeginning: false 
    });

    await this.consumer.run({
      eachMessage: async (payload) => {
        await this.handleMessage(payload);
      }
    });
  }

  private async handleMessage({ 
    topic, 
    partition, 
    message 
  }: EachMessagePayload) {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // 解析消息
        const parsedMessage = JSON.parse(
          message.value?.toString() || '{}'
        );

        // 調用用戶定義的處理器
        await this.messageHandler(parsedMessage);

        // 成功：提交 offset
        await this.consumer.commitOffsets([{
          topic,
          partition,
          offset: (parseInt(message.offset) + 1).toString()
        }]);

        console.log(`✅ 成功處理: offset ${message.offset}`);
        return;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ 嘗試 ${attempt + 1}/${maxRetries} 失敗:`, error);

        if (attempt < maxRetries - 1) {
          // 指數退避
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    // 所有重試都失敗：發送到死信隊列
    console.error('重試次數用盡，發送到死信隊列');
    await this.sendToDeadLetterQueue(topic, partition, message, lastError!);

    // 提交 offset（跳過此消息）
    await this.consumer.commitOffsets([{
      topic,
      partition,
      offset: (parseInt(message.offset) + 1).toString()
    }]);
  }

  private async sendToDeadLetterQueue(
    topic: string,
    partition: number,
    message: any,
    error: Error
  ) {
    await this.producer.send({
      topic: `${topic}-dlq`,
      messages: [{
        key: message.key?.toString(),
        value: message.value?.toString(),
        headers: {
          'original-topic': topic,
          'original-partition': partition.toString(),
          'original-offset': message.offset,
          'error-message': error.message,
          'failed-at': Date.now().toString()
        }
      }]
    });
  }

  async stop() {
    this.running = false;
    await Promise.all([
      this.consumer.disconnect(),
      this.producer.disconnect()
    ]);
    console.log('✅ Consumer 已停止');
  }
}

// 使用示例
async function main() {
  const consumer = new ReliableConsumer(
    'reliable-group',
    'orders',
    async (order) => {
      // 業務邏輯
      console.log(`處理訂單: ${order.orderId}`);
      
      // 模擬隨機失敗
      if (Math.random() < 0.1) {
        throw new Error('處理失敗');
      }
    }
  );

  await consumer.start();

  // 優雅關閉
  process.on('SIGINT', async () => {
    console.log('\n正在關閉...');
    await consumer.stop();
    process.exit(0);
  });
}

main();
```

## 最佳實踐

### 1. 冪等處理

```typescript
// 使用唯一 ID 檢查是否已處理
const processedIds = new Set();

async function idempotentProcess(message: any) {
  const messageId = message.key.toString();
  
  if (processedIds.has(messageId)) {
    console.log('消息已處理，跳過');
    return;
  }
  
  await processMessage(message);
  processedIds.add(messageId);
}
```

### 2. 監控 Lag

```typescript
// 定期查看 Consumer Lag
setInterval(async () => {
  const admin = kafka.admin();
  await admin.connect();
  
  const lag = await admin.fetchOffsets({ groupId: 'my-group' });
  console.log('Consumer Lag:', lag);
  
  await admin.disconnect();
}, 60000);  // 每分鐘檢查一次
```

## 小結

本章學習了：

1. **提交策略**：自動 vs 手動，權衡性能和可靠性
2. **Offset 重置**：earliest vs latest
3. **並發處理**：提高吞吐量
4. **錯誤處理**：重試和死信隊列
5. **可靠 Consumer**：完整的錯誤處理方案

## 下一步

👉 [下一章：11 - Consumer 最佳實踐](../11-consumer-best-practices/README.md)

---

[返回目錄](../README.md)

