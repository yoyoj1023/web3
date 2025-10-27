# 15 - 常見應用模式

## 學習目標

- 理解 Kafka 的常見應用模式
- 掌握事件驅動架構
- 了解 CQRS 和事件溯源
- 實現流處理基礎

## 點對點模式（Queue）

### 特點

```
單一 Consumer Group：
Topic: tasks
  ↓
Consumer Group: task-workers
  ├─ Worker 1
  ├─ Worker 2
  └─ Worker 3

每個任務只被一個 Worker 處理
```

### 示例：任務隊列

```typescript
// Producer: 發送任務
await producer.send({
  topic: 'tasks',
  messages: [
    { value: JSON.stringify({ task: 'send-email', userId: '123' }) },
    { value: JSON.stringify({ task: 'process-image', imageId: '456' }) }
  ]
});

// Consumer: Worker
await consumer.subscribe({ topic: 'tasks' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const task = JSON.parse(message.value?.toString() || '{}');
    await executeTask(task);
  }
});
```

## 發布訂閱模式（Pub/Sub）

### 特點

```
多個 Consumer Groups：
Topic: events
  ↓
  ├─ Consumer Group: analytics (訂閱者 1)
  ├─ Consumer Group: notification (訂閱者 2)
  └─ Consumer Group: audit-log (訂閱者 3)

每個 Group 都能收到所有消息
```

### 示例：用戶事件廣播

```typescript
// 發布者
await producer.send({
  topic: 'user-events',
  messages: [{
    key: 'user-123',
    value: JSON.stringify({
      eventType: 'USER_REGISTERED',
      userId: 'user-123',
      timestamp: Date.now()
    })
  }]
});

// 訂閱者 1: 分析服務
const analyticsConsumer = kafka.consumer({ 
  groupId: 'analytics-service' 
});
await analyticsConsumer.subscribe({ topic: 'user-events' });

// 訂閱者 2: 通知服務
const notificationConsumer = kafka.consumer({ 
  groupId: 'notification-service' 
});
await notificationConsumer.subscribe({ topic: 'user-events' });
```

## 事件驅動架構（EDA）

### 概念

```
傳統同步調用：
Order Service → (HTTP) → Inventory Service
              → (HTTP) → Payment Service
              → (HTTP) → Notification Service

事件驅動：
Order Service → [OrderCreated Event] → Kafka
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
  Inventory       Payment         Notification
   Service        Service           Service
```

### 完整示例：訂單系統

創建 `examples/patterns/01-event-driven-order.ts`：

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'order-system',
  brokers: ['localhost:9092']
});

// === 訂單服務（發布事件）===
class OrderService {
  private producer = kafka.producer({ idempotent: true });

  async connect() {
    await this.producer.connect();
  }

  async createOrder(order: any) {
    console.log(`📝 創建訂單: ${order.orderId}`);

    // 發布 OrderCreated 事件
    await this.producer.send({
      topic: 'order-events',
      messages: [{
        key: order.orderId,
        value: JSON.stringify({
          eventType: 'ORDER_CREATED',
          orderId: order.orderId,
          userId: order.userId,
          items: order.items,
          totalAmount: order.totalAmount,
          timestamp: Date.now()
        })
      }]
    });

    console.log(`✅ 訂單事件已發布`);
  }
}

// === 庫存服務（訂閱事件）===
class InventoryService {
  private consumer = kafka.consumer({ groupId: 'inventory-service' });

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'order-events' });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value?.toString() || '{}');

        if (event.eventType === 'ORDER_CREATED') {
          await this.handleOrderCreated(event);
        }
      }
    });
  }

  private async handleOrderCreated(event: any) {
    console.log(`📦 [Inventory] 處理訂單: ${event.orderId}`);
    // 扣減庫存
    await this.reduceStock(event.items);
    console.log(`✅ [Inventory] 庫存已更新`);
  }

  private async reduceStock(items: any[]) {
    // 模擬庫存扣減
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// === 支付服務（訂閱事件）===
class PaymentService {
  private consumer = kafka.consumer({ groupId: 'payment-service' });

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'order-events' });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value?.toString() || '{}');

        if (event.eventType === 'ORDER_CREATED') {
          await this.handleOrderCreated(event);
        }
      }
    });
  }

  private async handleOrderCreated(event: any) {
    console.log(`💳 [Payment] 處理訂單: ${event.orderId}`);
    // 創建支付訂單
    await this.createPayment(event);
    console.log(`✅ [Payment] 支付訂單已創建`);
  }

  private async createPayment(event: any) {
    // 模擬創建支付
    await new Promise(resolve => setTimeout(resolve, 150));
  }
}

// === 通知服務（訂閱事件）===
class NotificationService {
  private consumer = kafka.consumer({ groupId: 'notification-service' });

  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'order-events' });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value?.toString() || '{}');

        if (event.eventType === 'ORDER_CREATED') {
          await this.handleOrderCreated(event);
        }
      }
    });
  }

  private async handleOrderCreated(event: any) {
    console.log(`📧 [Notification] 發送通知給用戶: ${event.userId}`);
    await this.sendEmail(event.userId, event.orderId);
    console.log(`✅ [Notification] 通知已發送`);
  }

  private async sendEmail(userId: string, orderId: string) {
    // 模擬發送郵件
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

// === 運行示例 ===
async function main() {
  // 啟動所有服務
  const inventoryService = new InventoryService();
  const paymentService = new PaymentService();
  const notificationService = new NotificationService();
  const orderService = new OrderService();

  await Promise.all([
    inventoryService.start(),
    paymentService.start(),
    notificationService.start(),
    orderService.connect()
  ]);

  console.log('🚀 所有服務已啟動\n');

  // 等待服務準備好
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 創建訂單
  await orderService.createOrder({
    orderId: `order-${Date.now()}`,
    userId: 'user-123',
    items: [
      { productId: 'prod-A', quantity: 2, price: 99.99 },
      { productId: 'prod-B', quantity: 1, price: 49.99 }
    ],
    totalAmount: 249.97
  });

  console.log('\n觀察各服務如何並行處理事件...\n');
}

main();
```

## 事件溯源（Event Sourcing）

### 概念

```
傳統方式（存儲當前狀態）：
Orders Table:
orderId  status    amount
order-1  PAID      99.99

事件溯源（存儲事件序列）：
Events:
1. OrderCreated(order-1, amount=99.99)
2. OrderPaid(order-1, paymentId=xxx)
3. OrderShipped(order-1, trackingNo=yyy)

當前狀態 = 重放所有事件
```

### 示例

```typescript
// 事件定義
type OrderEvent =
  | { type: 'ORDER_CREATED'; orderId: string; amount: number }
  | { type: 'ORDER_PAID'; orderId: string; paymentId: string }
  | { type: 'ORDER_SHIPPED'; orderId: string; trackingNo: string }
  | { type: 'ORDER_CANCELLED'; orderId: string; reason: string };

// 發布事件
async function publishEvent(event: OrderEvent) {
  await producer.send({
    topic: 'order-events',
    messages: [{
      key: event.orderId,
      value: JSON.stringify(event)
    }]
  });
}

// 重建狀態
async function rebuildOrderState(orderId: string) {
  const events: OrderEvent[] = await fetchAllEvents(orderId);
  
  let state = {
    orderId,
    status: 'CREATED',
    amount: 0,
    paymentId: null,
    trackingNo: null
  };

  for (const event of events) {
    switch (event.type) {
      case 'ORDER_CREATED':
        state.amount = event.amount;
        break;
      case 'ORDER_PAID':
        state.status = 'PAID';
        state.paymentId = event.paymentId;
        break;
      case 'ORDER_SHIPPED':
        state.status = 'SHIPPED';
        state.trackingNo = event.trackingNo;
        break;
      case 'ORDER_CANCELLED':
        state.status = 'CANCELLED';
        break;
    }
  }

  return state;
}
```

## CQRS（命令查詢職責分離）

### 概念

```
傳統架構：
API → Service → Database
     (讀寫同一個數據庫)

CQRS：
寫入側（Command）：
API → Command Handler → Write DB → Kafka Events

讀取側（Query）：
Kafka Events → Event Handler → Read DB (優化的查詢模型)
                              ↑
API ←─────────────────────────┘
```

### 示例

```typescript
// === 寫入側 ===
class OrderCommandHandler {
  async createOrder(command: any) {
    // 1. 驗證
    // 2. 寫入數據庫
    await writeDB.insert(command);
    
    // 3. 發布事件
    await producer.send({
      topic: 'order-events',
      messages: [{
        value: JSON.stringify({
          type: 'ORDER_CREATED',
          ...command
        })
      }]
    });
  }
}

// === 讀取側 ===
class OrderQueryHandler {
  async start() {
    const consumer = kafka.consumer({ groupId: 'order-query-service' });
    await consumer.subscribe({ topic: 'order-events' });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value?.toString() || '{}');
        
        // 更新讀取模型（可以是不同的數據結構）
        await this.updateReadModel(event);
      }
    });
  }

  async updateReadModel(event: any) {
    switch (event.type) {
      case 'ORDER_CREATED':
        // 更新訂單列表視圖
        await readDB.upsert('order_list', {
          orderId: event.orderId,
          status: 'CREATED',
          createdAt: event.timestamp
        });
        
        // 更新用戶訂單視圖
        await readDB.upsert('user_orders', {
          userId: event.userId,
          orderId: event.orderId
        });
        break;
    }
  }

  // 查詢方法
  async getOrderById(orderId: string) {
    return await readDB.findOne('order_list', { orderId });
  }

  async getUserOrders(userId: string) {
    return await readDB.find('user_orders', { userId });
  }
}
```

## 流處理簡介

### Stateless 處理

```typescript
// 簡單的流處理：過濾和轉換
await consumer.run({
  eachMessage: async ({ message }) => {
    const data = JSON.parse(message.value?.toString() || '{}');
    
    // 過濾
    if (data.amount > 1000) {
      // 轉換
      const transformed = {
        ...data,
        category: 'HIGH_VALUE',
        alertSent: true
      };
      
      // 發送到另一個 Topic
      await producer.send({
        topic: 'high-value-orders',
        messages: [{ value: JSON.stringify(transformed) }]
      });
    }
  }
});
```

### Stateful 處理

```typescript
// 統計每個用戶的訂單數量
const userOrderCounts = new Map<string, number>();

await consumer.run({
  eachMessage: async ({ message }) => {
    const order = JSON.parse(message.value?.toString() || '{}');
    
    // 更新狀態
    const currentCount = userOrderCounts.get(order.userId) || 0;
    userOrderCounts.set(order.userId, currentCount + 1);
    
    // 如果訂單數達到閾值
    if (userOrderCounts.get(order.userId)! >= 10) {
      console.log(`用戶 ${order.userId} 已下 10 單，升級為 VIP`);
    }
  }
});
```

## 小結

本章學習了：

1. **點對點模式**：任務隊列
2. **發布訂閱模式**：事件廣播
3. **事件驅動架構**：解耦服務
4. **事件溯源**：存儲事件序列
5. **CQRS**：讀寫分離
6. **流處理**：實時數據處理

## 下一步

接下來我們將實現兩個完整的實戰項目！

👉 [下一章：16 - TypeScript 實戰項目](../16-practical-projects/README.md)

---

[返回目錄](../README.md)

