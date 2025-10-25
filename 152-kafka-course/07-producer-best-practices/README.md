# 07 - Producer 最佳實踐

## 學習目標

在本章節中，你將學到：

- Producer 的錯誤處理策略
- 性能優化要點
- 常見陷阱與解決方案
- 生產環境的配置建議
- 監控和調試技巧

## 錯誤處理

### 錯誤類型

Kafka Producer 可能遇到的錯誤：

1. **網路錯誤**：無法連接到 Broker
2. **超時錯誤**：請求超時
3. **序列化錯誤**：消息格式錯誤
4. **配置錯誤**：參數配置不當
5. **權限錯誤**：沒有寫入權限

### 錯誤處理策略

創建 `src/01-error-handling.ts`：

```typescript
import { Kafka, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'error-handling-demo',
  brokers: ['localhost:9092'],
  logLevel: logLevel.ERROR
});

const producer = kafka.producer({
  idempotent: true,
  retry: {
    retries: 5,
    initialRetryTime: 300
  }
});

// 錯誤類型定義
class KafkaProducerError extends Error {
  constructor(
    message: string,
    public readonly originalError: Error,
    public readonly messageData?: any
  ) {
    super(message);
    this.name = 'KafkaProducerError';
  }
}

async function sendMessageWithErrorHandling(
  topic: string,
  message: { key?: string; value: any }
) {
  try {
    // 1. 驗證消息
    if (!message.value) {
      throw new Error('消息 value 不能為空');
    }

    // 2. 序列化
    const serializedMessage = {
      key: message.key,
      value: typeof message.value === 'string' 
        ? message.value 
        : JSON.stringify(message.value)
    };

    // 3. 發送
    const result = await producer.send({
      topic,
      messages: [serializedMessage]
    });

    console.log('✅ 消息發送成功:', {
      topic,
      partition: result[0].partition,
      offset: result[0].baseOffset
    });

    return result;

  } catch (error: any) {
    // 4. 錯誤處理
    console.error('❌ 發送失敗:', error.message);

    // 記錄錯誤詳情
    if (error.name === 'KafkaJSNumberOfRetriesExceeded') {
      console.error('重試次數已用盡');
      // 可以將消息存入死信隊列或數據庫
      await saveToDeadLetterQueue(message);
    } else if (error.name === 'KafkaJSConnectionError') {
      console.error('連接錯誤，Broker 可能不可用');
      // 觸發告警
      await sendAlert('Kafka 連接失敗');
    } else {
      console.error('未知錯誤:', error);
    }

    throw new KafkaProducerError(
      '消息發送失敗',
      error,
      message
    );
  }
}

// 死信隊列模擬
async function saveToDeadLetterQueue(message: any) {
  console.log('📝 保存到死信隊列:', message);
  // 實際應用中：
  // - 存入數據庫
  // - 寫入文件
  // - 發送到另一個 Kafka Topic
}

// 告警模擬
async function sendAlert(message: string) {
  console.log('🚨 告警:', message);
  // 實際應用中：
  // - 發送郵件
  // - 發送 Slack 通知
  // - 調用告警 API
}

async function run() {
  try {
    await producer.connect();
    console.log('✅ Producer 已連接\n');

    // 測試正常消息
    await sendMessageWithErrorHandling('test-topic', {
      key: 'user-1',
      value: { action: 'login', timestamp: Date.now() }
    });

    // 測試錯誤消息（value 為空）
    try {
      await sendMessageWithErrorHandling('test-topic', {
        key: 'user-2',
        value: null
      });
    } catch (error) {
      console.log('捕獲到錯誤，程序繼續運行\n');
    }

  } catch (error) {
    console.error('❌ 致命錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

### 重試策略建議

```typescript
// 策略 1：有限重試 + 死信隊列
const producer = kafka.producer({
  retry: {
    retries: 5,
    initialRetryTime: 100,
    multiplier: 2,
    maxRetryTime: 30000
  }
});

// 策略 2：冪等性 + 無限重試（推薦）
const producer = kafka.producer({
  idempotent: true,
  retry: {
    retries: Number.MAX_SAFE_INTEGER
  }
});

// 策略 3：快速失敗（實時系統）
const producer = kafka.producer({
  retry: {
    retries: 0  // 不重試，立即失敗
  }
});
```

## 性能優化

### 優化 1：連接池與複用

**❌ 不好的做法**：

```typescript
// 每次發送都創建新的 Producer
async function badSend(message: any) {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({ topic: 'test', messages: [message] });
  await producer.disconnect();
}
```

**✅ 好的做法**：

```typescript
// 複用同一個 Producer 實例
class ProducerService {
  private producer = kafka.producer();
  private connected = false;

  async initialize() {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }
  }

  async send(topic: string, messages: any[]) {
    await this.initialize();
    return this.producer.send({ topic, messages });
  }

  async shutdown() {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }
}

// 全局單例
const producerService = new ProducerService();
```

### 優化 2：批次發送

創建 `src/02-batching.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'batching-demo',
  brokers: ['localhost:9092']
});

const producer = kafka.producer({
  batchSize: 16384,
  lingerMs: 10
});

// ❌ 不好：逐條發送
async function sendOneByOne(messages: any[]) {
  const startTime = Date.now();

  for (const msg of messages) {
    await producer.send({
      topic: 'test-topic',
      messages: [{ value: msg }]
    });
  }

  const duration = Date.now() - startTime;
  console.log(`逐條發送 ${messages.length} 條消息耗時: ${duration}ms`);
}

// ✅ 好：批量發送
async function sendInBatch(messages: any[]) {
  const startTime = Date.now();

  await producer.send({
    topic: 'test-topic',
    messages: messages.map(msg => ({ value: msg }))
  });

  const duration = Date.now() - startTime;
  console.log(`批量發送 ${messages.length} 條消息耗時: ${duration}ms`);
}

async function run() {
  try {
    await producer.connect();

    const testMessages = Array.from({ length: 100 }, (_, i) => 
      `Message ${i}`
    );

    console.log('=== 性能比較 ===\n');
    await sendOneByOne(testMessages.slice(0, 50));
    await sendInBatch(testMessages.slice(50));

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

### 優化 3：異步發送

```typescript
// ❌ 同步等待每條消息
for (const msg of messages) {
  await producer.send({ topic: 'test', messages: [msg] });
}

// ✅ 並行發送（無順序要求時）
const promises = messages.map(msg => 
  producer.send({ topic: 'test', messages: [msg] })
);
await Promise.all(promises);

// ✅ 火忘模式（Fire and Forget）- 不等待結果
producer.send({ topic: 'test', messages })
  .catch(error => console.error('異步發送失敗:', error));
```

### 優化 4：壓縮

```typescript
import { CompressionTypes } from 'kafkajs';

// 根據數據特性選擇壓縮算法
const producer = kafka.producer({
  // 文本、JSON：高壓縮率
  compression: CompressionTypes.ZSTD,
  
  // 已壓縮數據（圖片）：不壓縮
  // compression: CompressionTypes.None
});
```

## 常見陷阱

### 陷阱 1：忘記斷開連接

**問題**：

```typescript
async function sendMessage() {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({...});
  // ❌ 忘記 disconnect，連接洩漏
}
```

**解決方案**：

```typescript
async function sendMessage() {
  const producer = kafka.producer();
  try {
    await producer.connect();
    await producer.send({...});
  } finally {
    await producer.disconnect();  // ✅ 確保斷開
  }
}
```

### 陷阱 2：序列化循環引用

**問題**：

```typescript
const obj: any = { name: 'test' };
obj.self = obj;  // 循環引用

// ❌ 會拋出錯誤
JSON.stringify(obj);
```

**解決方案**：

```typescript
// 方案 1：移除循環引用
const clone = JSON.parse(JSON.stringify(obj));

// 方案 2：自定義序列化
function safeStringify(obj: any) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  });
}
```

### 陷阱 3：分區數變化影響 Key 路由

**問題**：

```
初始：3 個分區
user-123 → hash % 3 = 1 (分區 1)

增加到 6 個分區後：
user-123 → hash % 6 = 4 (分區 4)

❌ 同一個 Key 的消息分散在不同分區
```

**解決方案**：

```typescript
// 1. 謹慎增加分區
// 2. 如果必須增加，考慮：
//    - 使用自定義分區器（固定邏輯）
//    - 或接受短期內順序性損失

// 3. 或者使用一致性哈希
class ConsistentHashPartitioner {
  // 實現一致性哈希邏輯
  // 增加分區時影響較小
}
```

### 陷阱 4：大消息導致性能問題

**問題**：

```typescript
// ❌ 發送 10MB 的消息
const largeData = { 
  data: Array(10000000).fill('x') 
};
await producer.send({
  topic: 'test',
  messages: [{ value: JSON.stringify(largeData) }]
});
```

**解決方案**：

```typescript
// ✅ 方案 1：分塊發送
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const chunks = chunkArray(largeData.data, 10000);
for (const chunk of chunks) {
  await producer.send({
    topic: 'test',
    messages: [{ value: JSON.stringify({ chunk }) }]
  });
}

// ✅ 方案 2：使用外部存儲
// 將大數據存到 S3，只發送引用
const s3Url = await uploadToS3(largeData);
await producer.send({
  topic: 'test',
  messages: [{ value: JSON.stringify({ dataUrl: s3Url }) }]
});
```

## 生產環境配置模板

創建 `src/03-production-template.ts`：

```typescript
import { Kafka, CompressionTypes, Partitioners, logLevel } from 'kafkajs';

// 環境變量配置
const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'my-app';
const LOG_LEVEL = process.env.KAFKA_LOG_LEVEL || logLevel.INFO;

// 創建 Kafka 實例
const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: KAFKA_BROKERS,
  logLevel: LOG_LEVEL,
  
  // SSL/TLS 配置（生產環境通常需要）
  ssl: process.env.KAFKA_SSL === 'true' ? {
    rejectUnauthorized: true
  } : undefined,
  
  // SASL 認證（生產環境通常需要）
  sasl: process.env.KAFKA_USERNAME ? {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD
  } : undefined,
  
  // 連接超時
  connectionTimeout: 10000,
  requestTimeout: 30000,
  
  // 重試配置
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Producer 配置
const producer = kafka.producer({
  // 冪等性（防止重複）
  idempotent: true,
  
  // 最大未確認請求數
  maxInFlightRequests: 5,
  
  // 批次配置
  batchSize: parseInt(process.env.KAFKA_BATCH_SIZE || '16384'),
  lingerMs: parseInt(process.env.KAFKA_LINGER_MS || '10'),
  
  // 壓縮
  compression: CompressionTypes.ZSTD,
  
  // 分區器
  createPartitioner: Partitioners.DefaultPartitioner,
  
  // 重試
  retry: {
    maxRetryTime: 30000,
    initialRetryTime: 100,
    retries: Number.MAX_SAFE_INTEGER
  },
  
  // 超時
  transactionTimeout: 30000
});

// Producer 服務類
export class ProductionProducerService {
  private connected = false;

  async connect() {
    if (!this.connected) {
      await producer.connect();
      this.connected = true;
      console.log('✅ Producer 已連接');
      
      // 註冊錯誤監聽器
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    producer.on('producer.connect', () => {
      console.log('📡 Producer 連接成功');
    });

    producer.on('producer.disconnect', () => {
      console.log('🔌 Producer 斷開連接');
      this.connected = false;
    });

    producer.on('producer.network.request_timeout', (payload) => {
      console.error('⏱️ 請求超時:', payload);
    });
  }

  async send(topic: string, messages: Array<{
    key?: string;
    value: any;
    headers?: Record<string, string>;
  }>) {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const formattedMessages = messages.map(msg => ({
        key: msg.key,
        value: typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value),
        headers: {
          ...msg.headers,
          'produced-at': Date.now().toString(),
          'producer-id': CLIENT_ID
        }
      }));

      const result = await producer.send({
        topic,
        acks: -1,  // 等待所有 ISR
        timeout: 30000,
        compression: CompressionTypes.ZSTD,
        messages: formattedMessages
      });

      return result;

    } catch (error: any) {
      console.error('❌ 發送失敗:', {
        topic,
        error: error.message,
        stack: error.stack
      });

      // 這裡可以添加監控指標
      // metricsService.incrementCounter('kafka.producer.errors');

      throw error;
    }
  }

  async disconnect() {
    if (this.connected) {
      await producer.disconnect();
      this.connected = false;
      console.log('🔌 Producer 已斷開');
    }
  }

  // 優雅關閉
  async shutdown() {
    console.log('開始優雅關閉...');
    
    // 等待未完成的請求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await this.disconnect();
    console.log('✅ 優雅關閉完成');
  }
}

// 使用示例
async function example() {
  const producerService = new ProductionProducerService();

  try {
    await producerService.connect();

    await producerService.send('orders', [
      {
        key: 'order-123',
        value: {
          orderId: 'order-123',
          amount: 99.99,
          timestamp: Date.now()
        },
        headers: {
          'event-type': 'order-created',
          'version': '1.0'
        }
      }
    ]);

    console.log('✅ 消息已發送');

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producerService.shutdown();
  }
}
```

## 監控與調試

### 關鍵指標

```typescript
// 1. 發送成功率
let successCount = 0;
let failureCount = 0;

try {
  await producer.send({...});
  successCount++;
} catch (error) {
  failureCount++;
}

console.log(`成功率: ${(successCount / (successCount + failureCount) * 100).toFixed(2)}%`);

// 2. 發送延遲
const startTime = Date.now();
await producer.send({...});
const latency = Date.now() - startTime;
console.log(`延遲: ${latency}ms`);

// 3. 批次大小
const batchSizes: number[] = [];
// 記錄每個批次的大小
```

### 日誌配置

```typescript
import { logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
  logLevel: logLevel.DEBUG,  // 開發環境
  // logLevel: logLevel.ERROR,  // 生產環境
  
  // 自定義日誌
  logCreator: (logLevel) => {
    return ({ namespace, level, label, log }) => {
      const { message, ...extra } = log;
      console.log(`[${label}] ${namespace}: ${message}`, extra);
      
      // 可以發送到日誌系統
      // logService.log({ level, message, extra });
    };
  }
});
```

## 最佳實踐清單

### ✅ 應該做的

1. **複用 Producer 實例**
2. **使用冪等性**（`idempotent: true`）
3. **配置適當的重試策略**
4. **使用批次發送**
5. **選擇合適的壓縮算法**
6. **為消息設置有意義的 Key**
7. **添加錯誤處理**
8. **監控關鍵指標**
9. **使用連接池**
10. **優雅關閉**

### ❌ 不應該做的

1. **每次發送都創建新 Producer**
2. **發送超大消息（> 1MB）**
3. **忘記處理錯誤**
4. **在生產環境使用 `acks=0`（除非有特殊需求）**
5. **忽略序列化錯誤**
6. **不設置超時**
7. **不監控性能**
8. **硬編碼配置**
9. **忽略分區策略**
10. **不測試故障場景**

## 小結

在本章中，我們學習了：

1. **錯誤處理**：
   - 不同類型的錯誤
   - 重試策略
   - 死信隊列

2. **性能優化**：
   - 複用連接
   - 批次發送
   - 異步處理
   - 壓縮

3. **常見陷阱**：
   - 連接洩漏
   - 序列化問題
   - 分區變化
   - 大消息

4. **生產環境配置**：
   - 完整配置模板
   - 安全認證
   - 監控指標

## 思考題

1. 為什麼說複用 Producer 實例很重要？創建新實例有什麼開銷？
2. 在什麼情況下應該使用"火忘"模式（不等待發送結果）？
3. 如何平衡吞吐量和延遲？

## 下一步

恭喜！你已經完成了 Producer 部分的學習。在下一章中，我們將開始學習 Consumer 的基礎知識。

👉 [下一章：08 - Consumer 基礎](../08-consumer-basics/README.md)

---

[返回目錄](../README.md)

