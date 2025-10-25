# 09 - Consumer Group 機制

## 學習目標

- 深入理解 Consumer Group 的工作機制
- 掌握 Rebalance 的觸發條件和過程
- 了解分區分配策略
- 實現負載均衡的消費者群組

## Consumer Group 核心概念

### 什麼是 Consumer Group？

Consumer Group 是一組共同消費同一個或多個 Topic 的 Consumer。

**核心規則**：
- 群組內每個 Partition 只能被一個 Consumer 消費
- 一個 Consumer 可以消費多個 Partition
- 不同群組之間互不影響，各自獨立消費

### 視覺化示例

```
Topic: orders (4 個分區)

┌─────── Consumer Group: order-service ───────┐
│                                              │
│  Consumer 1      Consumer 2                 │
│    ↓ ↓             ↓ ↓                      │
│   P0 P1           P2 P3                      │
└──────────────────────────────────────────────┘
     ↑  ↑           ↑  ↑
     └──┴───────────┴──┘
     每個分區只被一個 Consumer 消費

┌─────── Consumer Group: analytics-service ───┐
│                                              │
│  Consumer 1      Consumer 2                 │
│    ↓ ↓             ↓ ↓                      │
│   P0 P1           P2 P3                      │
└──────────────────────────────────────────────┘
     獨立消費，不影響 order-service
```

## Rebalance 機制

### 什麼是 Rebalance？

Rebalance 是 Consumer Group 重新分配 Partition 的過程。

### 觸發條件

1. **Consumer 加入群組**
2. **Consumer 離開群組**（主動或崩潰）
3. **Consumer 超時**（心跳丟失）
4. **Topic 的 Partition 數量變化**
5. **訂閱的 Topic 變化**

### Rebalance 過程

```
步驟 1: 觸發 Rebalance
  Consumer 2 崩潰 → Group Coordinator 檢測到

步驟 2: 暫停消費
  所有 Consumer 停止拉取消息

步驟 3: 撤銷分配
  Consumer 1: 釋放 P0, P1

步驟 4: 重新分配
  Consumer 1: 分配 P0, P1, P2, P3

步驟 5: 恢復消費
  Consumer 1 開始從新分配的分區消費
```

### 示例：觀察 Rebalance

創建 `examples/consumer-group/01-rebalance-demo.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'rebalance-demo',
  brokers: ['localhost:9092']
});

async function createConsumer(consumerId: string) {
  const consumer = kafka.consumer({ 
    groupId: 'rebalance-group',
    sessionTimeout: 30000,
    heartbeatInterval: 3000
  });

  // 監聽 Rebalance 事件
  consumer.on(consumer.events.GROUP_JOIN, ({ payload }) => {
    console.log(`[${consumerId}] 🔄 加入群組`, payload);
  });

  consumer.on(consumer.events.REBALANCING, ({ payload }) => {
    console.log(`[${consumerId}] ⚠️  Rebalance 開始`, payload);
  });

  consumer.on(consumer.events.REBALANCE, ({ payload }) => {
    console.log(`[${consumerId}] ✅ Rebalance 完成`, payload);
  });

  await consumer.connect();
  console.log(`[${consumerId}] ✅ 已連接`);

  await consumer.subscribe({ topic: 'test-topic', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      console.log(`[${consumerId}] P${partition}: ${message.value?.toString()}`);
    }
  });

  return consumer;
}

async function run() {
  console.log('=== Rebalance 演示 ===\n');

  // 啟動 Consumer 1
  console.log('1. 啟動 Consumer 1');
  const consumer1 = await createConsumer('Consumer-1');

  // 等待 5 秒
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 啟動 Consumer 2（觸發 Rebalance）
  console.log('\n2. 啟動 Consumer 2（觸發 Rebalance）');
  const consumer2 = await createConsumer('Consumer-2');

  // 等待 10 秒
  await new Promise(resolve => setTimeout(resolve, 10000));

  // 停止 Consumer 2（再次觸發 Rebalance）
  console.log('\n3. 停止 Consumer 2（觸發 Rebalance）');
  await consumer2.disconnect();

  // 保持 Consumer 1 運行
  console.log('\n4. Consumer 1 繼續運行...');
}

run();
```

## 分區分配策略

### 三種策略

| 策略 | 特點 | 適用場景 |
|------|------|---------|
| **Range** | 按範圍分配 | 默認策略 |
| **RoundRobin** | 輪詢分配 | 均勻分配 |
| **Sticky** | 盡量保持原分配 | 減少 Rebalance 影響 |

### Range 策略

```
Topic orders (4 個分區)
Topic payments (2 個分區)
Consumer Group (2 個 Consumers)

分配結果：
Consumer 1:
  - orders: P0, P1
  - payments: P0

Consumer 2:
  - orders: P2, P3
  - payments: P1

特點：按 Topic 獨立計算範圍
```

### RoundRobin 策略

```
所有分區：orders-P0, orders-P1, orders-P2, orders-P3, payments-P0, payments-P1
Consumer: C1, C2

分配結果（輪詢）：
C1: orders-P0, orders-P2, payments-P0
C2: orders-P1, orders-P3, payments-P1

特點：跨 Topic 輪詢分配
```

### Sticky 策略

```
初始分配：
C1: P0, P1
C2: P2, P3

C2 離開後（Sticky 策略）：
C1: P0, P1, P2, P3
   ↑   ↑   ← 新增，但保持原有的 P0, P1

優點：減少 Rebalance 時的分區遷移
```

### 配置分區策略

```typescript
import { PartitionAssigners } from 'kafkajs';

const consumer = kafka.consumer({
  groupId: 'my-group',
  partitionAssigners: [
    PartitionAssigners.roundRobin  // 使用 RoundRobin 策略
  ]
});
```

## 負載均衡實戰

### 示例：多 Consumer 並行處理

創建 `examples/consumer-group/02-load-balancing.ts`：

```typescript
import { Kafka } from 'kafkajs';
import * as os from 'os';

const kafka = new Kafka({
  clientId: 'load-balancing-demo',
  brokers: ['localhost:9092']
});

const CONSUMER_ID = `consumer-${os.hostname()}-${process.pid}`;

async function startConsumer() {
  const consumer = kafka.consumer({
    groupId: 'order-processing-group',
    sessionTimeout: 30000,
    heartbeatInterval: 3000
  });

  await consumer.connect();
  console.log(`✅ [${CONSUMER_ID}] 已連接`);

  await consumer.subscribe({ 
    topic: 'orders',
    fromBeginning: false 
  });

  let messageCount = 0;
  const startTime = Date.now();

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const order = JSON.parse(message.value?.toString() || '{}');

      console.log(`[${CONSUMER_ID}] P${partition} 處理訂單: ${order.orderId}`);

      // 模擬處理時間
      await processOrder(order);

      messageCount++;

      // 每 10 條消息輸出統計
      if (messageCount % 10 === 0) {
        const duration = (Date.now() - startTime) / 1000;
        const throughput = (messageCount / duration).toFixed(2);
        console.log(`[${CONSUMER_ID}] 統計: ${messageCount} 條消息, ${throughput} 條/秒`);
      }
    }
  });

  // 優雅關閉
  process.on('SIGINT', async () => {
    console.log(`\n[${CONSUMER_ID}] 正在關閉...`);
    await consumer.disconnect();
    process.exit(0);
  });
}

async function processOrder(order: any) {
  // 模擬處理
  await new Promise(resolve => setTimeout(resolve, 100));
}

startConsumer();
```

**測試負載均衡**：

```bash
# 終端 1: 啟動 Consumer 1
npm run dev examples/consumer-group/02-load-balancing.ts

# 終端 2: 啟動 Consumer 2（同一個 Group）
npm run dev examples/consumer-group/02-load-balancing.ts

# 終端 3: 發送大量測試消息
kafka-producer-perf-test \
  --topic orders \
  --num-records 1000 \
  --throughput 100 \
  --record-size 256 \
  --producer-props bootstrap.servers=localhost:9092
```

## Session Timeout 與 Heartbeat

### 配置說明

```typescript
const consumer = kafka.consumer({
  groupId: 'my-group',
  
  // Session Timeout: Consumer 被認為失敗的時間
  sessionTimeout: 30000,  // 30 秒
  
  // Heartbeat Interval: 發送心跳的間隔
  heartbeatInterval: 3000,  // 3 秒
  
  // Max Poll Interval: 兩次 poll 之間的最大間隔
  maxPollInterval: 300000  // 5 分鐘
});
```

### 關係

```
heartbeatInterval < sessionTimeout < maxPollInterval

典型配置：
heartbeatInterval: 3s
sessionTimeout: 30s
maxPollInterval: 5min

如果 Consumer：
- 30 秒內沒有心跳 → 被踢出群組
- 5 分鐘內沒有 poll → 被踢出群組
```

### 示例：處理慢消息

創建 `examples/consumer-group/03-slow-processing.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'slow-processing-demo',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({
  groupId: 'slow-processing-group',
  sessionTimeout: 60000,      // 增加到 60 秒
  heartbeatInterval: 3000,
  maxPollInterval: 300000     // 5 分鐘
});

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'slow-jobs', fromBeginning: false });

  await consumer.run({
    // 使用 eachBatch 手動控制心跳
    eachBatch: async ({ 
      batch, 
      resolveOffset, 
      heartbeat, 
      isRunning 
    }) => {
      for (const message of batch.messages) {
        if (!isRunning()) break;

        console.log(`處理消息: ${message.offset}`);

        // 模擬長時間處理（10 秒）
        await slowProcess(message.value?.toString());

        // 處理完成後提交 offset
        resolveOffset(message.offset);

        // 定期發送心跳（重要！）
        await heartbeat();
      }
    }
  });
}

async function slowProcess(data?: string) {
  // 模擬慢處理
  console.log('  開始處理...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log('  處理完成');
}

run();

process.on('SIGINT', async () => {
  await consumer.disconnect();
  process.exit(0);
});
```

## Consumer Group 管理

### 查看 Group 信息

```bash
# 列出所有 Consumer Group
kafka-consumer-groups --bootstrap-server localhost:9092 --list

# 查看特定 Group 詳情
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group order-processing-group \
  --describe

# 輸出示例：
GROUP                    TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
order-processing-group   orders    0          1000            1000            0
order-processing-group   orders    1          950             1000            50
order-processing-group   orders    2          1000            1000            0
```

### 重置 Offset

```bash
# 重置到最早
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group my-group \
  --topic my-topic \
  --reset-offsets --to-earliest \
  --execute

# 重置到最新
--reset-offsets --to-latest --execute

# 重置到特定時間
--reset-offsets --to-datetime 2024-01-01T00:00:00.000 --execute

# 重置到特定 offset
--reset-offsets --to-offset 100 --execute
```

## 最佳實踐

### 1. Consumer 數量建議

```
✅ 推薦：Consumer 數量 = Partition 數量
⚠️  可以：Consumer 數量 < Partition 數量
❌ 浪費：Consumer 數量 > Partition 數量（部分 Consumer 空閒）

示例：
4 個分區 + 4 個 Consumer = 每個 Consumer 處理 1 個分區 ✓
4 個分區 + 2 個 Consumer = 每個 Consumer 處理 2 個分區 ✓
4 個分區 + 6 個 Consumer = 2 個 Consumer 空閒 ✗
```

### 2. 避免頻繁 Rebalance

```typescript
// ✅ 增加超時時間
const consumer = kafka.consumer({
  groupId: 'stable-group',
  sessionTimeout: 45000,      // 45 秒
  heartbeatInterval: 3000,    // 3 秒
  maxPollInterval: 600000     // 10 分鐘
});

// ✅ 使用 Sticky 分配策略
import { PartitionAssigners } from 'kafkajs';

const consumer = kafka.consumer({
  groupId: 'stable-group',
  partitionAssigners: [PartitionAssigners.sticky]
});
```

### 3. 處理 Rebalance 事件

```typescript
consumer.on(consumer.events.REBALANCING, async () => {
  console.log('⚠️  Rebalance 開始');
  // 保存當前狀態、清理資源等
});

consumer.on(consumer.events.REBALANCE, async () => {
  console.log('✅ Rebalance 完成');
  // 初始化新分區的狀態
});
```

## 小結

本章學習了：

1. **Consumer Group 機制**：負載均衡和多訂閱者
2. **Rebalance**：觸發條件和過程
3. **分區分配策略**：Range、RoundRobin、Sticky
4. **Session Timeout**：心跳和超時配置
5. **最佳實踐**：Consumer 數量、避免頻繁 Rebalance

## 思考題

1. 為什麼 Rebalance 期間會暫停消費？這有什麼影響？
2. 什麼情況下應該使用 Sticky 分配策略？
3. 如果處理單條消息需要 1 分鐘，應該如何配置？

## 下一步

👉 [下一章：10 - Consumer 進階配置](../10-consumer-advanced/README.md)

---

[返回目錄](../README.md)

