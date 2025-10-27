# 06 - Producer 進階配置

## 學習目標

在本章節中，你將學到：

- 確認機制（acks）的不同級別
- 重試機制與冪等性
- 批次發送與壓縮
- 自定義分區策略
- 配置不同的可靠性等級

## 確認機制（acks）

### 什麼是 acks？

`acks` 參數控制 Producer 需要多少個 Broker 確認收到消息後，才認為發送成功。

### 三種級別

| acks | 含義 | 延遲 | 可靠性 | 使用場景 |
|------|------|------|--------|----------|
| **0** | 不等待確認 | 最低 | 最低 | 日誌、指標（允許丟失） |
| **1** | 等待 Leader 確認 | 中等 | 中等 | 大多數應用 |
| **all/-1** | 等待所有 ISR 確認 | 最高 | 最高 | 金融、訂單（不能丟失） |

### 視覺化說明

```
acks = 0：不等待確認
Producer → [發送] → (立即返回) ✓
                    Broker 可能還沒收到

acks = 1：等待 Leader 確認
Producer → [發送] → Leader Broker → (確認) → ✓
                    ↓ (異步複製)
                    Follower Brokers

acks = all：等待所有 ISR 確認
Producer → [發送] → Leader Broker
                    ↓ (同步複製)
                    Follower Brokers (ISR)
                    ↓ (所有完成)
                    ✓ 確認
```

### TypeScript 示例

創建 `src/01-acks-comparison.ts`：

```typescript
import { Kafka, CompressionTypes, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'acks-demo',
  brokers: ['localhost:9092'],
  logLevel: logLevel.ERROR
});

// acks = 0：最快，可能丟失
async function sendWithAcks0() {
  const producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000
  });

  await producer.connect();
  console.log('\n=== acks = 0 (不等待確認) ===');

  const startTime = Date.now();

  await producer.send({
    topic: 'test-acks',
    acks: 0,  // 不等待確認
    messages: Array.from({ length: 100 }, (_, i) => ({
      value: `Message ${i}`
    }))
  });

  const duration = Date.now() - startTime;
  console.log(`✅ 發送 100 條消息耗時: ${duration}ms`);
  console.log('⚠️  風險：可能丟失消息');

  await producer.disconnect();
}

// acks = 1：平衡
async function sendWithAcks1() {
  const producer = kafka.producer();

  await producer.connect();
  console.log('\n=== acks = 1 (等待 Leader 確認) ===');

  const startTime = Date.now();

  await producer.send({
    topic: 'test-acks',
    acks: 1,  // 等待 Leader 確認
    messages: Array.from({ length: 100 }, (_, i) => ({
      value: `Message ${i}`
    }))
  });

  const duration = Date.now() - startTime;
  console.log(`✅ 發送 100 條消息耗時: ${duration}ms`);
  console.log('✓ 適合大多數場景');

  await producer.disconnect();
}

// acks = all：最可靠
async function sendWithAcksAll() {
  const producer = kafka.producer();

  await producer.connect();
  console.log('\n=== acks = all (等待所有 ISR 確認) ===');

  const startTime = Date.now();

  await producer.send({
    topic: 'test-acks',
    acks: -1,  // 等待所有 ISR 確認 (等同於 'all')
    messages: Array.from({ length: 100 }, (_, i) => ({
      value: `Message ${i}`
    }))
  });

  const duration = Date.now() - startTime;
  console.log(`✅ 發送 100 條消息耗時: ${duration}ms`);
  console.log('✓ 最可靠，但延遲最高');

  await producer.disconnect();
}

async function run() {
  try {
    await sendWithAcks0();
    await sendWithAcks1();
    await sendWithAcksAll();
  } catch (error) {
    console.error('❌ 錯誤:', error);
  }
}

run();
```

**運行並比較性能**：

```bash
npm run dev src/01-acks-comparison.ts
```

**預期輸出**：

```
=== acks = 0 (不等待確認) ===
✅ 發送 100 條消息耗時: 25ms
⚠️  風險：可能丟失消息

=== acks = 1 (等待 Leader 確認) ===
✅ 發送 100 條消息耗時: 45ms
✓ 適合大多數場景

=== acks = all (等待所有 ISR 確認) ===
✅ 發送 100 條消息耗時: 65ms
✓ 最可靠，但延遲最高
```

## 重試機制

### 為什麼需要重試？

網路可能暫時不穩定，Broker 可能暫時不可用。重試可以提高消息投遞的成功率。

### 配置選項

```typescript
const producer = kafka.producer({
  retry: {
    maxRetryTime: 30000,    // 最多重試 30 秒
    initialRetryTime: 100,  // 首次重試等待 100ms
    retries: 8,             // 最多重試 8 次
    multiplier: 2,          // 每次重試時間翻倍
    factor: 0.2             // 隨機因子
  }
});
```

### 重試策略示例

創建 `src/02-retry-config.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'retry-demo',
  brokers: ['localhost:9092'],
  // 全局重試配置
  retry: {
    initialRetryTime: 300,
    retries: 5
  }
});

const producer = kafka.producer({
  // Producer 級別重試配置（會覆蓋全局配置）
  retry: {
    maxRetryTime: 30000,
    initialRetryTime: 100,
    retries: 8,
    multiplier: 2
  }
});

async function run() {
  try {
    await producer.connect();
    console.log('✅ Producer 已連接（已配置重試機制）');

    // 發送消息
    // 如果失敗，會自動重試
    await producer.send({
      topic: 'test-retry',
      messages: [
        { value: 'Test message with retry' }
      ]
    });

    console.log('✅ 消息已發送（可能經過重試）');

  } catch (error) {
    console.error('❌ 發送失敗（重試次數已用盡）:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

### 重試的副作用：消息重複

```
場景：Producer 發送消息，Broker 收到並持久化，
      但確認響應丟失，Producer 誤以為失敗，重試

時間線：
1. Producer 發送 "Hello" → Broker ✓ (存儲成功)
2. Broker 發送確認 → X (網路故障，確認丟失)
3. Producer 超時，認為失敗
4. Producer 重試發送 "Hello" → Broker ✓ (再次存儲)
5. 結果：Broker 中有兩條 "Hello" 消息
```

**解決方案**：使用冪等性 Producer

## 冪等性 Producer

### 什麼是冪等性？

**冪等性**：同一個操作執行多次，結果與執行一次相同。

```
非冪等操作：x = x + 1  (執行 3 次：x = x + 3)
冪等操作：  x = 5      (執行 3 次：x = 5)
```

### Kafka 的冪等性機制

```
每條消息都有唯一的 (ProducerID, SequenceNumber)

發送流程：
1. Producer 分配到 ProducerID: 12345
2. 發送消息 A，SequenceNumber: 0
3. Broker 記錄：(12345, 0) → 消息 A
4. 如果 Producer 重試發送消息 A
5. Broker 檢查：(12345, 0) 已存在
6. Broker 返回成功，但不重複存儲
```

### 啟用冪等性

創建 `src/03-idempotent-producer.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'idempotent-demo',
  brokers: ['localhost:9092']
});

const producer = kafka.producer({
  idempotent: true,  // 啟用冪等性
  maxInFlightRequests: 5,  // 允許 5 個未確認的請求
  retry: {
    retries: Number.MAX_SAFE_INTEGER  // 無限重試（安全，因為有冪等性）
  }
});

async function run() {
  try {
    await producer.connect();
    console.log('✅ 冪等性 Producer 已連接');

    // 發送消息
    await producer.send({
      topic: 'orders',
      acks: -1,  // 配合冪等性使用
      messages: [
        {
          key: 'order-123',
          value: JSON.stringify({
            orderId: 'order-123',
            amount: 99.99,
            status: 'pending'
          })
        }
      ]
    });

    console.log('✅ 消息已發送（保證不重複）');

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

**冪等性的限制**：
- 只保證單個 Producer Session 內不重複
- 如果 Producer 重啟，ProducerID 會變化
- 只在單個分區內保證冪等性

## 批次發送與壓縮

### 批次發送

**批次配置**：

```typescript
const producer = kafka.producer({
  // 批次大小（字節）
  batchSize: 16384,  // 16KB（默認）
  
  // 等待時間（毫秒）
  lingerMs: 10,      // 等待 10ms 湊批
  
  // 壓縮類型
  compression: CompressionTypes.GZIP
});
```

**工作原理**：

```
時間線：
0ms:  收到消息 A → 放入批次緩衝區
2ms:  收到消息 B → 放入批次緩衝區
5ms:  收到消息 C → 放入批次緩衝區
10ms: 達到 lingerMs → 發送批次 [A, B, C]

或者：

0ms:  收到消息 1-100 → 累積 15KB
3ms:  收到消息 101 → 累積超過 16KB
3ms:  立即發送批次（不等待 lingerMs）
```

### 壓縮

創建 `src/04-compression.ts`：

```typescript
import { Kafka, CompressionTypes } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'compression-demo',
  brokers: ['localhost:9092']
});

async function testCompression(
  compressionType: CompressionTypes,
  name: string
) {
  const producer = kafka.producer({
    compression: compressionType
  });

  await producer.connect();
  console.log(`\n=== 測試 ${name} 壓縮 ===`);

  // 創建重複性高的數據（易於壓縮）
  const largeMessage = JSON.stringify({
    data: Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      status: 'active'
    }))
  });

  const messageSizeKB = (Buffer.byteLength(largeMessage) / 1024).toFixed(2);
  console.log(`原始消息大小: ${messageSizeKB} KB`);

  const startTime = Date.now();

  await producer.send({
    topic: 'test-compression',
    messages: [{ value: largeMessage }]
  });

  const duration = Date.now() - startTime;
  console.log(`發送耗時: ${duration}ms`);

  await producer.disconnect();
}

async function run() {
  try {
    await testCompression(CompressionTypes.None, '無壓縮');
    await testCompression(CompressionTypes.GZIP, 'GZIP');
    await testCompression(CompressionTypes.Snappy, 'Snappy');
    await testCompression(CompressionTypes.LZ4, 'LZ4');
    await testCompression(CompressionTypes.ZSTD, 'ZSTD');
  } catch (error) {
    console.error('❌ 錯誤:', error);
  }
}

run();
```

**壓縮算法比較**：

| 算法 | 壓縮率 | CPU 使用 | 速度 | 適用場景 |
|------|--------|---------|------|----------|
| **None** | - | 最低 | 最快 | 已壓縮的數據（圖片、視頻） |
| **GZIP** | 最高 | 高 | 慢 | 網路頻寬有限 |
| **Snappy** | 中 | 中 | 快 | 平衡選擇 |
| **LZ4** | 中低 | 低 | 最快 | 低延遲要求 |
| **ZSTD** | 高 | 中 | 中快 | 新推薦（Kafka 2.1+） |

## 自定義分區策略

### 默認分區邏輯

```typescript
// 有 Key：hash(key) % 分區數
// 無 Key：輪詢或 Sticky Partitioner
```

### 自定義 Partitioner

創建 `src/05-custom-partitioner.ts`：

```typescript
import { Kafka, Partitioners, PartitionerArgs } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'custom-partitioner',
  brokers: ['localhost:9092']
});

// 自定義分區器：根據業務邏輯分區
const customPartitioner = () => {
  return ({ topic, partitionMetadata, message }: PartitionerArgs) => {
    const numPartitions = partitionMetadata.length;

    // 業務邏輯 1：VIP 用戶發送到特定分區
    if (message.key) {
      const key = message.key.toString();
      
      if (key.startsWith('vip-')) {
        // VIP 用戶都發送到分區 0（可能配置更多資源）
        return 0;
      }

      // 業務邏輯 2：根據用戶 ID 範圍分區
      const userId = parseInt(key.replace('user-', ''));
      
      if (userId < 1000) {
        return 0;  // 新用戶
      } else if (userId < 10000) {
        return 1;  // 中等用戶
      } else {
        return 2;  // 高級用戶
      }
    }

    // 無 Key：輪詢
    return Math.floor(Math.random() * numPartitions);
  };
};

const producer = kafka.producer({
  createPartitioner: customPartitioner
});

async function run() {
  try {
    await producer.connect();
    console.log('✅ 已連接（使用自定義分區器）');

    const users = [
      { key: 'vip-user-1', value: { type: 'vip', action: 'purchase' } },
      { key: 'user-500', value: { type: 'new', action: 'register' } },
      { key: 'user-5000', value: { type: 'regular', action: 'login' } },
      { key: 'user-50000', value: { type: 'senior', action: 'upgrade' } }
    ];

    const results = await producer.send({
      topic: 'users',
      messages: users.map(u => ({
        key: u.key,
        value: JSON.stringify(u.value)
      }))
    });

    results.forEach((r, i) => {
      console.log(`${users[i].key} → 分區 ${r.partition}`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

**預期輸出**：

```
✅ 已連接（使用自定義分區器）
vip-user-1 → 分區 0
user-500 → 分區 0
user-5000 → 分區 1
user-50000 → 分區 2
```

## 完整配置示例

創建 `src/06-production-config.ts`：

```typescript
import { Kafka, CompressionTypes, Partitioners, logLevel } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'production-app',
  brokers: ['localhost:9092'],
  logLevel: logLevel.INFO,
  
  // 連接配置
  connectionTimeout: 10000,
  requestTimeout: 30000,
  
  // 重試配置
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// 生產環境推薦配置
const producer = kafka.producer({
  // 冪等性（防止重複）
  idempotent: true,
  
  // 最大未確認請求數
  maxInFlightRequests: 5,
  
  // 批次配置
  batchSize: 16384,        // 16KB
  lingerMs: 10,            // 等待 10ms
  
  // 壓縮
  compression: CompressionTypes.ZSTD,
  
  // 分區器
  createPartitioner: Partitioners.DefaultPartitioner,
  
  // 重試
  retry: {
    maxRetryTime: 30000,
    initialRetryTime: 100,
    retries: Number.MAX_SAFE_INTEGER  // 配合冪等性
  },
  
  // 超時
  transactionTimeout: 30000
});

interface OrderEvent {
  orderId: string;
  userId: string;
  amount: number;
  items: any[];
  timestamp: number;
}

async function sendOrder(order: OrderEvent) {
  await producer.send({
    topic: 'orders',
    acks: -1,  // 等待所有 ISR 確認
    messages: [
      {
        key: order.userId,  // 使用 userId 作為 Key
        value: JSON.stringify(order),
        headers: {
          'event-type': 'order-created',
          'version': '1.0',
          'source': 'order-service',
          'timestamp': Date.now().toString()
        }
      }
    ]
  });
}

async function run() {
  try {
    await producer.connect();
    console.log('✅ Producer 已連接（生產環境配置）');

    // 模擬訂單
    const order: OrderEvent = {
      orderId: `order-${Date.now()}`,
      userId: 'user-12345',
      amount: 299.99,
      items: [
        { productId: 'prod-A', quantity: 2, price: 149.99 }
      ],
      timestamp: Date.now()
    };

    await sendOrder(order);
    console.log('✅ 訂單已發送:', order.orderId);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await producer.disconnect();
  }
}

run();
```

## 配置建議

### 高吞吐量場景

```typescript
const producer = kafka.producer({
  batchSize: 32768,      // 32KB
  lingerMs: 50,          // 等待 50ms
  compression: CompressionTypes.LZ4,
  acks: 1
});
```

### 低延遲場景

```typescript
const producer = kafka.producer({
  batchSize: 1024,       // 1KB
  lingerMs: 0,           // 不等待
  compression: CompressionTypes.None,
  acks: 1
});
```

### 高可靠性場景

```typescript
const producer = kafka.producer({
  idempotent: true,
  acks: -1,              // 等待所有 ISR
  compression: CompressionTypes.ZSTD,
  retry: {
    retries: Number.MAX_SAFE_INTEGER
  }
});
```

## 小結

在本章中，我們學習了：

1. **確認機制（acks）**：
   - 0：不等待（最快，可能丟失）
   - 1：等待 Leader（平衡）
   - all：等待所有 ISR（最可靠）

2. **重試機制**：
   - 自動重試提高成功率
   - 可能導致消息重複

3. **冪等性**：
   - 防止重試導致的重複
   - `idempotent: true`

4. **批次與壓縮**：
   - 批次提高吞吐量
   - 壓縮減少網路傳輸

5. **自定義分區**：
   - 根據業務邏輯控制消息分區

## 思考題

1. 在什麼情況下，你會選擇 `acks=0`？這樣做的風險是什麼？
2. 冪等性 Producer 能完全避免消息重複嗎？有什麼限制？
3. 如果你的應用既需要低延遲又需要高吞吐量，應該如何配置？

## 下一步

現在你已經掌握了 Producer 的進階配置。在下一章中，我們將學習 Producer 的最佳實踐和常見問題。

👉 [下一章：07 - Producer 最佳實踐](../07-producer-best-practices/README.md)

---

[返回目錄](../README.md)

