# 08 - Consumer 基礎

## 學習目標

- 理解 Consumer 的工作原理
- 掌握 Offset 管理機制  
- 使用 TypeScript 實現基本的 Consumer
- 訂閱主題並處理消息
- 手動提交 Offset

## Consumer 工作原理

### 基本流程

```
1. Consumer 連接到 Kafka 集群
   ↓
2. 加入 Consumer Group（或獨立消費）
   ↓
3. 訂閱一個或多個 Topic
   ↓
4. 分配 Partition（Group 內協調）
   ↓
5. 從分配的 Partition 拉取消息
   ↓
6. 處理消息
   ↓
7. 提交 Offset（記錄進度）
   ↓
8. 重複步驟 5-7
```

### Pull 模式

Kafka Consumer 使用 **Pull（拉取）** 模式：

```
Consumer 主動請求數據：
Consumer → (請求) → Broker
Consumer ← (返回數據) ← Broker

優點：
✓ Consumer 按自己的速度消費
✓ 可以批量拉取
✓ 減輕 Broker 壓力
```

## Offset 管理

### 什麼是 Offset？

```
Partition 0:
Offset: 0    1    2    3    4    5    6    7
消息:  [A]  [B]  [C]  [D]  [E]  [F]  [G]  [H]
                         ↑
                   Current Offset: 3
                   (下次從 offset 4 開始讀取)
```

### 重要概念

```typescript
// Current Offset: Consumer 當前讀取的位置
// Committed Offset: 已確認處理完成的位置
// Log-End Offset: 分區中最新消息的位置

// Lag（延遲）= Log-End Offset - Current Offset
```

## 基礎示例

### 示例 1：最簡單的 Consumer

創建 `examples/consumer/01-simple-consumer.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ 
  groupId: 'test-group' 
});

async function run() {
  try {
    // 1. 連接
    await consumer.connect();
    console.log('✅ Consumer 已連接');

    // 2. 訂閱 Topic
    await consumer.subscribe({ 
      topic: 'test-topic',
      fromBeginning: true  // 從頭開始讀取
    });
    console.log('📖 已訂閱 test-topic');

    // 3. 消費消息
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          topic,
          partition,
          offset: message.offset,
          key: message.key?.toString(),
          value: message.value?.toString(),
          timestamp: message.timestamp
        });
      }
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  }
}

run();

// 優雅關閉
process.on('SIGINT', async () => {
  console.log('\n正在關閉 Consumer...');
  await consumer.disconnect();
  process.exit(0);
});
```

**運行**：

```bash
# 終端 1: 啟動 Consumer
npm run dev examples/consumer/01-simple-consumer.ts

# 終端 2: 發送測試消息
kafka-console-producer --bootstrap-server localhost:9092 --topic test-topic
> Hello
> World
```

### 示例 2：處理 JSON 消息

創建 `examples/consumer/02-json-consumer.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'json-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'json-group' });

interface UserEvent {
  userId: string;
  action: string;
  timestamp: number;
  metadata?: any;
}

async function run() {
  await consumer.connect();
  console.log('✅ Consumer 已連接');

  await consumer.subscribe({ 
    topic: 'user-events',
    fromBeginning: true 
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        // 解析 JSON
        const event: UserEvent = JSON.parse(
          message.value?.toString() || '{}'
        );

        console.log('📨 收到用戶事件:', {
          用戶: event.userId,
          動作: event.action,
          時間: new Date(event.timestamp).toLocaleString(),
          分區: partition,
          偏移: message.offset
        });

        // 處理業務邏輯
        await handleUserEvent(event);

      } catch (error) {
        console.error('處理消息失敗:', error);
      }
    }
  });
}

async function handleUserEvent(event: UserEvent) {
  // 根據不同的 action 執行不同邏輯
  switch (event.action) {
    case 'login':
      console.log(`  → ${event.userId} 登入系統`);
      break;
    case 'purchase':
      console.log(`  → ${event.userId} 完成購買`);
      break;
    case 'logout':
      console.log(`  → ${event.userId} 登出系統`);
      break;
    default:
      console.log(`  → 未知動作: ${event.action}`);
  }
}

run();

process.on('SIGINT', async () => {
  await consumer.disconnect();
  process.exit(0);
});
```

### 示例 3：批次處理

創建 `examples/consumer/03-batch-consumer.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'batch-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'batch-group' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: true });

  // 使用 eachBatch 進行批次處理
  await consumer.run({
    eachBatch: async ({ 
      batch, 
      resolveOffset, 
      heartbeat, 
      isRunning, 
      isStale 
    }) => {
      console.log(`\n📦 收到批次: ${batch.messages.length} 條消息`);
      console.log(`分區: ${batch.partition}`);

      for (const message of batch.messages) {
        if (!isRunning() || isStale()) break;

        console.log(`  處理 offset ${message.offset}`);

        // 處理單條消息
        await processOrder(message.value?.toString());

        // 手動提交每條消息的 offset
        resolveOffset(message.offset);

        // 發送心跳（防止被踢出 Group）
        await heartbeat();
      }

      console.log('✅ 批次處理完成');
    }
  });
}

async function processOrder(orderJson?: string) {
  // 模擬處理時間
  await new Promise(resolve => setTimeout(resolve, 100));
}

run();

process.on('SIGINT', async () => {
  await consumer.disconnect();
  process.exit(0);
});
```

## Offset 提交策略

### 自動提交 vs 手動提交

```typescript
// 自動提交（默認）
const consumer = kafka.consumer({
  groupId: 'my-group',
  autoCommit: true,
  autoCommitInterval: 5000  // 每 5 秒自動提交
});

// 手動提交
const consumer = kafka.consumer({
  groupId: 'my-group',
  autoCommit: false  // 關閉自動提交
});
```

### 示例 4：手動提交 Offset

創建 `examples/consumer/04-manual-commit.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'manual-commit-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({
  groupId: 'manual-commit-group',
  autoCommit: false  // 關閉自動提交
});

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const order = JSON.parse(message.value?.toString() || '{}');
        
        console.log(`處理訂單: ${order.orderId}`);
        
        // 處理訂單
        await processOrder(order);
        
        // 手動提交 offset
        await consumer.commitOffsets([{
          topic,
          partition,
          offset: (parseInt(message.offset) + 1).toString()
        }]);
        
        console.log(`✅ 已提交 offset: ${message.offset}`);

      } catch (error) {
        console.error('❌ 處理失敗，不提交 offset:', error);
        // 處理失敗時不提交，下次重新處理
      }
    }
  });
}

async function processOrder(order: any) {
  // 模擬處理
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模擬隨機失敗
  if (Math.random() < 0.1) {
    throw new Error('處理失敗');
  }
}

run();

process.on('SIGINT', async () => {
  await consumer.disconnect();
  process.exit(0);
});
```

## 訂閱模式

### 模式 1：訂閱單個 Topic

```typescript
await consumer.subscribe({ 
  topic: 'orders',
  fromBeginning: true 
});
```

### 模式 2：訂閱多個 Topic

```typescript
await consumer.subscribe({ 
  topics: ['orders', 'payments', 'notifications'],
  fromBeginning: false 
});
```

### 模式 3：使用正則表達式

```typescript
// 訂閱所有以 'log-' 開頭的 Topic
await consumer.subscribe({ 
  topic: /^log-.*/,
  fromBeginning: false 
});
```

## 實用工具類

創建 `examples/consumer/utils/consumer-service.ts`：

```typescript
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

export class ConsumerService {
  private consumer: Consumer;
  private connected = false;

  constructor(
    brokers: string[],
    groupId: string,
    clientId: string = 'default-consumer'
  ) {
    const kafka = new Kafka({ clientId, brokers });
    this.consumer = kafka.consumer({ groupId });
  }

  async connect() {
    if (!this.connected) {
      await this.consumer.connect();
      this.connected = true;
      console.log('✅ Consumer 已連接');
    }
  }

  async subscribe(topics: string | string[], fromBeginning = false) {
    await this.connect();

    if (Array.isArray(topics)) {
      await this.consumer.subscribe({ topics, fromBeginning });
    } else {
      await this.consumer.subscribe({ topic: topics, fromBeginning });
    }

    console.log(`📖 已訂閱: ${Array.isArray(topics) ? topics.join(', ') : topics}`);
  }

  async consume(handler: MessageHandler) {
    await this.consumer.run({
      eachMessage: async (payload) => {
        try {
          await handler(payload);
        } catch (error) {
          console.error('❌ 處理消息失敗:', error);
          // 這裡可以添加錯誤處理邏輯
          // 例如：發送到死信隊列、記錄日誌等
        }
      }
    });
  }

  async disconnect() {
    if (this.connected) {
      await this.consumer.disconnect();
      this.connected = false;
      console.log('🔌 Consumer 已斷開');
    }
  }

  setupGracefulShutdown() {
    const cleanup = async () => {
      console.log('\n正在優雅關閉...');
      await this.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }
}
```

**使用工具類**：

```typescript
import { ConsumerService } from './utils/consumer-service';

async function main() {
  const consumerService = new ConsumerService(
    ['localhost:9092'],
    'my-group',
    'my-app'
  );

  await consumerService.subscribe('orders', true);

  await consumerService.consume(async ({ topic, partition, message }) => {
    const value = message.value?.toString();
    console.log(`收到消息: ${value}`);
  });

  consumerService.setupGracefulShutdown();
}

main();
```

## 小結

本章學習了：

1. **Consumer 工作原理**：Pull 模式，主動拉取
2. **Offset 管理**：追蹤消費進度
3. **基本操作**：連接、訂閱、消費、斷開
4. **提交策略**：自動提交 vs 手動提交
5. **訂閱模式**：單個/多個 Topic、正則表達式

## 思考題

1. 為什麼 Kafka 使用 Pull 模式而不是 Push 模式？
2. 什麼情況下應該使用手動提交 Offset？
3. `fromBeginning: true` 是否每次都從頭讀取？

## 下一步

👉 [下一章：09 - Consumer Group 機制](../09-consumer-group/README.md)

---

[返回目錄](../README.md)

