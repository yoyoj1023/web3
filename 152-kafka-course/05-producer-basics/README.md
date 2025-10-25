# 05 - Producer 基礎

## 學習目標

在本章節中，你將學到：

- Producer 的工作流程
- 如何使用 TypeScript 設置 KafkaJS 客戶端
- 發送簡單消息
- 發送帶 Key 的消息
- 消息的序列化

## Producer 工作流程

### 完整流程圖

```
應用程式
    ↓
1. 創建 Producer 實例
    ↓
2. 準備消息（key, value, headers）
    ↓
3. 序列化（對象 → 字節）
    ↓
4. 選擇分區
    ↓
5. 累積批次（可選，基於配置）
    ↓
6. 發送到 Broker
    ↓
7. Broker 持久化
    ↓
8. 返回確認（成功/失敗）
    ↓
9. 應用程式處理響應
```

### Producer 的內部組件

```
┌────────────────────────────────────────┐
│          Producer 應用程式               │
└────────┬───────────────────────────────┘
         │ send(message)
         ↓
┌────────────────────────────────────────┐
│         Serializer (序列化器)           │
│   (將 Key 和 Value 轉換為字節)          │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│        Partitioner (分區器)             │
│   (決定消息發送到哪個分區)               │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│      Record Accumulator (累加器)       │
│   (按批次收集消息)                      │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│          Sender (發送線程)              │
│   (實際發送到 Broker)                   │
└────────┬───────────────────────────────┘
         │
         ↓
    Kafka Broker
```

## 設置 TypeScript 項目

### 項目初始化

創建示例項目目錄：

```bash
cd 152-kafka-course
mkdir -p examples/producer
cd examples/producer
```

初始化 npm 項目：

```bash
npm init -y
```

### 安裝依賴

```bash
# 安裝 KafkaJS
npm install kafkajs

# 安裝 TypeScript 相關
npm install --save-dev typescript @types/node ts-node

# 初始化 TypeScript 配置
npx tsc --init
```

### 配置 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 更新 `package.json`

```json
{
  "name": "kafka-producer-examples",
  "version": "1.0.0",
  "description": "Kafka Producer examples in TypeScript",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "ts-node src/index.ts",
    "dev": "ts-node"
  },
  "keywords": ["kafka", "producer", "typescript"],
  "author": "",
  "license": "MIT"
}
```

## 基礎示例

### 示例 1：最簡單的 Producer

創建 `src/01-simple-producer.ts`：

```typescript
import { Kafka } from 'kafkajs';

// 創建 Kafka 實例
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

// 創建 Producer
const producer = kafka.producer();

async function run() {
  try {
    // 連接到 Kafka
    await producer.connect();
    console.log('✅ Producer 已連接');

    // 發送一條簡單的消息
    const result = await producer.send({
      topic: 'test-topic',
      messages: [
        { value: 'Hello Kafka!' }
      ]
    });

    console.log('📤 消息已發送:', result);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    // 斷開連接
    await producer.disconnect();
    console.log('🔌 Producer 已斷開');
  }
}

run();
```

**運行**：

```bash
npm run dev src/01-simple-producer.ts
```

**預期輸出**：

```
✅ Producer 已連接
📤 消息已發送: [
  {
    topicName: 'test-topic',
    partition: 0,
    errorCode: 0,
    baseOffset: '5',
    logAppendTime: '-1',
    logStartOffset: '0'
  }
]
🔌 Producer 已斷開
```

**代碼解析**：

1. **創建 Kafka 實例**：
   ```typescript
   const kafka = new Kafka({
     clientId: 'my-app',      // 客戶端標識
     brokers: ['localhost:9092']  // Broker 地址列表
   });
   ```

2. **創建 Producer**：
   ```typescript
   const producer = kafka.producer();
   ```

3. **連接**：
   ```typescript
   await producer.connect();
   ```

4. **發送消息**：
   ```typescript
   await producer.send({
     topic: 'test-topic',
     messages: [{ value: 'Hello Kafka!' }]
   });
   ```

5. **斷開連接**：
   ```typescript
   await producer.disconnect();
   ```

### 示例 2：發送多條消息

創建 `src/02-multiple-messages.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

async function run() {
  try {
    await producer.connect();
    console.log('✅ Producer 已連接');

    // 發送多條消息
    const messages = [
      { value: 'Message 1' },
      { value: 'Message 2' },
      { value: 'Message 3' },
      { value: 'Message 4' },
      { value: 'Message 5' }
    ];

    const result = await producer.send({
      topic: 'test-topic',
      messages: messages
    });

    console.log(`📤 已發送 ${messages.length} 條消息`);
    console.log('結果:', result);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

**要點**：
- 可以一次發送多條消息
- 這些消息會被批量發送，提高效率
- 所有消息都發往同一個 Topic

### 示例 3：發送 JSON 對象

創建 `src/03-json-messages.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

// 定義消息類型
interface UserEvent {
  userId: string;
  action: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

async function sendUserEvent(event: UserEvent) {
  // 將對象序列化為 JSON 字符串
  const message = {
    value: JSON.stringify(event)
  };

  const result = await producer.send({
    topic: 'user-events',
    messages: [message]
  });

  return result;
}

async function run() {
  try {
    await producer.connect();
    console.log('✅ Producer 已連接');

    // 發送用戶事件
    const events: UserEvent[] = [
      {
        userId: 'user-123',
        action: 'login',
        timestamp: Date.now()
      },
      {
        userId: 'user-123',
        action: 'view_product',
        timestamp: Date.now(),
        metadata: { productId: 'prod-456' }
      },
      {
        userId: 'user-456',
        action: 'purchase',
        timestamp: Date.now(),
        metadata: { 
          orderId: 'order-789',
          amount: 99.99 
        }
      }
    ];

    for (const event of events) {
      const result = await sendUserEvent(event);
      console.log(`📤 已發送事件: ${event.action}`, result);
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

**要點**：
- 使用 `JSON.stringify()` 將對象轉換為字符串
- 定義 TypeScript 接口確保類型安全
- 適合發送結構化數據

### 示例 4：帶 Key 的消息

創建 `src/04-keyed-messages.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

interface Order {
  orderId: string;
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
  totalAmount: number;
  status: string;
}

async function run() {
  try {
    await producer.connect();
    console.log('✅ Producer 已連接');

    // 模擬訂單
    const orders: Order[] = [
      {
        orderId: 'order-001',
        userId: 'user-123',
        items: [{ productId: 'prod-A', quantity: 2 }],
        totalAmount: 99.98,
        status: 'created'
      },
      {
        orderId: 'order-002',
        userId: 'user-456',
        items: [{ productId: 'prod-B', quantity: 1 }],
        totalAmount: 49.99,
        status: 'created'
      },
      {
        orderId: 'order-003',
        userId: 'user-123',
        items: [{ productId: 'prod-C', quantity: 3 }],
        totalAmount: 149.97,
        status: 'created'
      }
    ];

    // 使用 userId 作為 Key
    // 相同 userId 的訂單會被發送到同一分區，保證順序
    const messages = orders.map(order => ({
      key: order.userId,           // Key: 用於分區選擇
      value: JSON.stringify(order) // Value: 實際數據
    }));

    const result = await producer.send({
      topic: 'orders',
      messages: messages
    });

    console.log('📤 已發送訂單:', result);

    // 觀察分區分配
    result.forEach((r, index) => {
      console.log(
        `訂單 ${orders[index].orderId} ` +
        `(用戶: ${orders[index].userId}) ` +
        `→ 分區 ${r.partition}`
      );
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

**運行並觀察**：

```bash
npm run dev src/04-keyed-messages.ts
```

**預期輸出**：

```
✅ Producer 已連接
📤 已發送訂單: [...]
訂單 order-001 (用戶: user-123) → 分區 1
訂單 order-002 (用戶: user-456) → 分區 0
訂單 order-003 (用戶: user-123) → 分區 1
```

**重要觀察**：
- `user-123` 的兩個訂單都被發送到分區 1
- `user-456` 的訂單被發送到分區 0
- **相同 Key 保證發送到同一分區**

### 示例 5：消息標頭（Headers）

創建 `src/05-message-headers.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

async function run() {
  try {
    await producer.connect();
    console.log('✅ Producer 已連接');

    // 發送帶 Headers 的消息
    const result = await producer.send({
      topic: 'user-events',
      messages: [
        {
          key: 'user-123',
          value: JSON.stringify({
            userId: 'user-123',
            action: 'purchase',
            amount: 99.99
          }),
          headers: {
            // Headers 用於存儲元數據
            'source': 'web-app',
            'version': '1.0.0',
            'correlation-id': 'abc-123-def-456',
            'timestamp': Date.now().toString()
          }
        }
      ]
    });

    console.log('📤 已發送帶 Headers 的消息:', result);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

**Headers 的用途**：
- 存儲元數據（不屬於業務邏輯）
- 追蹤請求（correlation ID）
- 版本控制
- 來源標識
- 時間戳

## 消息序列化

### 什麼是序列化？

```
序列化：對象 → 字節流
反序列化：字節流 → 對象

┌──────────────┐   序列化    ┌──────────────┐
│  JavaScript  │ ────────→   │    字節流     │
│    對象      │             │  (發送到網路)  │
│             │   反序列化   │              │
│             │ ←────────   │              │
└──────────────┘             └──────────────┘
```

### KafkaJS 的默認序列化

KafkaJS 默認使用 **UTF-8 字符串**：

```typescript
// 這些都會被轉換為 UTF-8 字節
{ value: 'Hello' }
{ value: JSON.stringify({ name: 'John' }) }
{ value: Buffer.from('binary data') }
```

### 自定義序列化器

創建 `src/06-custom-serializer.ts`：

```typescript
import { Kafka, CompressionTypes } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

// 自定義序列化邏輯
class JsonSerializer {
  static serialize(data: any): string {
    return JSON.stringify(data);
  }

  static deserialize(str: string): any {
    return JSON.parse(str);
  }
}

const producer = kafka.producer();

async function run() {
  try {
    await producer.connect();
    console.log('✅ Producer 已連接');

    const userData = {
      id: 123,
      name: 'John Doe',
      email: 'john@example.com',
      metadata: {
        registeredAt: new Date().toISOString(),
        plan: 'premium'
      }
    };

    // 使用自定義序列化器
    const serializedData = JsonSerializer.serialize(userData);

    await producer.send({
      topic: 'users',
      messages: [
        {
          key: userData.id.toString(),
          value: serializedData
        }
      ]
    });

    console.log('📤 已發送序列化數據');
    console.log('原始對象:', userData);
    console.log('序列化後:', serializedData);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

## 實用工具類

創建 `src/utils/kafka-producer.ts`：

```typescript
import { Kafka, Producer, ProducerRecord, RecordMetadata } from 'kafkajs';

export class KafkaProducerService {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected: boolean = false;

  constructor(brokers: string[], clientId: string = 'default-producer') {
    this.kafka = new Kafka({
      clientId,
      brokers
    });
    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Producer 已連接');
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('🔌 Producer 已斷開');
    }
  }

  async send(
    topic: string,
    messages: Array<{ key?: string; value: any; headers?: Record<string, string> }>
  ): Promise<RecordMetadata[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    // 序列化消息
    const formattedMessages = messages.map(msg => ({
      key: msg.key,
      value: typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value),
      headers: msg.headers
    }));

    const result = await this.producer.send({
      topic,
      messages: formattedMessages
    });

    return result;
  }

  async sendBatch(records: ProducerRecord[]): Promise<RecordMetadata[][]> {
    if (!this.isConnected) {
      await this.connect();
    }

    const results = await Promise.all(
      records.map(record => this.producer.send(record))
    );

    return results;
  }
}
```

**使用工具類**：

創建 `src/07-using-service.ts`：

```typescript
import { KafkaProducerService } from './utils/kafka-producer';

async function run() {
  const producerService = new KafkaProducerService(['localhost:9092'], 'my-service');

  try {
    await producerService.connect();

    // 發送消息
    await producerService.send('user-events', [
      { key: 'user-1', value: { action: 'login' } },
      { key: 'user-2', value: { action: 'logout' } }
    ]);

    console.log('✅ 消息已發送');

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producerService.disconnect();
  }
}

run();
```

## 小結

在本章中，我們學習了：

1. **Producer 工作流程**：
   - 創建實例 → 連接 → 發送 → 斷開

2. **基本操作**：
   - 發送簡單消息
   - 發送多條消息
   - 發送 JSON 對象

3. **Key 的重要性**：
   - 相同 Key 的消息會到同一分區
   - 保證同一 Key 的消息順序

4. **Headers**：
   - 存儲元數據
   - 不影響分區選擇

5. **序列化**：
   - 對象轉換為字節流
   - JSON 是最常用的格式

## 思考題

1. 為什麼要使用 Key？在什麼場景下 Key 是必需的？
2. 如果不設置 Key，消息會如何分配到分區？
3. Headers 和 Value 有什麼區別？什麼情況下應該使用 Headers？

## 下一步

現在你已經掌握了 Producer 的基礎操作。在下一章中，我們將學習 Producer 的進階配置，包括確認機制、重試、壓縮等。

👉 [下一章：06 - Producer 進階配置](../06-producer-advanced/README.md)

---

[返回目錄](../README.md)

