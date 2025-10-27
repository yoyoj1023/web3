# 16 - TypeScript 實戰項目

## 學習目標

- 實現完整的訂單處理系統
- 構建實時日誌收集系統
- 應用所學的 Kafka 知識
- 掌握生產級代碼組織

## 項目 1：訂單處理系統

### 系統架構

```
┌─────────────┐
│ Web API     │ 接收訂單請求
└──────┬──────┘
       │ 發布事件
       ↓
┌─────────────┐
│ Kafka       │ order-events
└──────┬──────┘
       │ 訂閱
   ┌───┴────┬────────┬────────┐
   ↓        ↓        ↓        ↓
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│庫存  │ │支付  │ │物流  │ │通知  │
│服務  │ │服務  │ │服務  │ │服務  │
└──────┘ └──────┘ └──────┘ └──────┘
```

### 項目結構

```
projects/order-system/
├── src/
│   ├── api/
│   │   └── order-api.ts        # HTTP API
│   ├── services/
│   │   ├── order-service.ts    # 訂單服務
│   │   ├── inventory-service.ts # 庫存服務
│   │   ├── payment-service.ts   # 支付服務
│   │   └── notification-service.ts # 通知服務
│   ├── kafka/
│   │   ├── producer.ts         # Producer 封裝
│   │   └── consumer.ts         # Consumer 封裝
│   ├── types/
│   │   └── events.ts           # 事件類型定義
│   └── index.ts                # 入口
├── package.json
└── tsconfig.json
```

### 實現代碼

**types/events.ts**：

```typescript
export type OrderEvent =
  | {
      type: 'ORDER_CREATED';
      orderId: string;
      userId: string;
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
      }>;
      totalAmount: number;
      timestamp: number;
    }
  | {
      type: 'INVENTORY_RESERVED';
      orderId: string;
      reservationId: string;
      timestamp: number;
    }
  | {
      type: 'PAYMENT_COMPLETED';
      orderId: string;
      paymentId: string;
      amount: number;
      timestamp: number;
    }
  | {
      type: 'ORDER_SHIPPED';
      orderId: string;
      trackingNumber: string;
      timestamp: number;
    }
  | {
      type: 'ORDER_FAILED';
      orderId: string;
      reason: string;
      timestamp: number;
    };

export interface Order {
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  status: 'CREATED' | 'PROCESSING' | 'PAID' | 'SHIPPED' | 'FAILED';
  totalAmount: number;
  createdAt: number;
}
```

**kafka/producer.ts**：

```typescript
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { OrderEvent } from '../types/events';

export class EventProducer {
  private producer: Producer;
  private connected = false;

  constructor(brokers: string[]) {
    const kafka = new Kafka({
      clientId: 'order-system',
      brokers
    });

    this.producer = kafka.producer({
      idempotent: true,
      acks: -1,
      maxInFlightRequests: 5
    });
  }

  async connect() {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
      console.log('✅ Producer 已連接');
    }
  }

  async publishEvent(event: OrderEvent) {
    await this.connect();

    await this.producer.send({
      topic: 'order-events',
      messages: [{
        key: event.orderId,
        value: JSON.stringify(event),
        headers: {
          'event-type': event.type,
          'timestamp': Date.now().toString()
        }
      }]
    });

    console.log(`📤 事件已發布: ${event.type} (${event.orderId})`);
  }

  async disconnect() {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }
}
```

**services/order-service.ts**：

```typescript
import { EventProducer } from '../kafka/producer';
import { Order, OrderEvent } from '../types/events';

export class OrderService {
  private orders = new Map<string, Order>();

  constructor(private eventProducer: EventProducer) {}

  async createOrder(order: Omit<Order, 'orderId' | 'status' | 'createdAt'>) {
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newOrder: Order = {
      ...order,
      orderId,
      status: 'CREATED',
      createdAt: Date.now()
    };

    this.orders.set(orderId, newOrder);

    // 發布訂單創建事件
    const event: OrderEvent = {
      type: 'ORDER_CREATED',
      orderId: newOrder.orderId,
      userId: newOrder.userId,
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
      timestamp: Date.now()
    };

    await this.eventProducer.publishEvent(event);

    console.log(`✅ 訂單已創建: ${orderId}`);
    return newOrder;
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  updateOrderStatus(orderId: string, status: Order['status']) {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      this.orders.set(orderId, order);
    }
  }
}
```

**services/inventory-service.ts**：

```typescript
import { Kafka } from 'kafkajs';
import { EventProducer } from '../kafka/producer';
import { OrderEvent } from '../types/events';

export class InventoryService {
  private inventory = new Map([
    ['prod-A', 100],
    ['prod-B', 50],
    ['prod-C', 200]
  ]);

  constructor(
    private kafka: Kafka,
    private eventProducer: EventProducer
  ) {}

  async start() {
    const consumer = this.kafka.consumer({ 
      groupId: 'inventory-service' 
    });

    await consumer.connect();
    await consumer.subscribe({ topic: 'order-events' });

    console.log('📦 庫存服務已啟動');

    await consumer.run({
      eachMessage: async ({ message }) => {
        const event: OrderEvent = JSON.parse(
          message.value?.toString() || '{}'
        );

        if (event.type === 'ORDER_CREATED') {
          await this.handleOrderCreated(event);
        }
      }
    });
  }

  private async handleOrderCreated(event: Extract<OrderEvent, { type: 'ORDER_CREATED' }>) {
    console.log(`\n[庫存] 處理訂單: ${event.orderId}`);

    try {
      // 檢查庫存
      for (const item of event.items) {
        const available = this.inventory.get(item.productId) || 0;
        
        if (available < item.quantity) {
          throw new Error(
            `庫存不足: ${item.productId} (需要 ${item.quantity}, 可用 ${available})`
          );
        }
      }

      // 扣減庫存
      for (const item of event.items) {
        const current = this.inventory.get(item.productId)!;
        this.inventory.set(item.productId, current - item.quantity);
        console.log(`  ✓ ${item.productId}: ${current} → ${current - item.quantity}`);
      }

      // 發布庫存保留成功事件
      await this.eventProducer.publishEvent({
        type: 'INVENTORY_RESERVED',
        orderId: event.orderId,
        reservationId: `res-${Date.now()}`,
        timestamp: Date.now()
      });

      console.log(`✅ [庫存] 庫存已保留`);

    } catch (error) {
      console.error(`❌ [庫存] 失敗:`, (error as Error).message);
      
      // 發布訂單失敗事件
      await this.eventProducer.publishEvent({
        type: 'ORDER_FAILED',
        orderId: event.orderId,
        reason: (error as Error).message,
        timestamp: Date.now()
      });
    }
  }
}
```

**services/payment-service.ts**：

```typescript
import { Kafka } from 'kafkajs';
import { EventProducer } from '../kafka/producer';
import { OrderEvent } from '../types/events';

export class PaymentService {
  constructor(
    private kafka: Kafka,
    private eventProducer: EventProducer
  ) {}

  async start() {
    const consumer = this.kafka.consumer({ 
      groupId: 'payment-service' 
    });

    await consumer.connect();
    await consumer.subscribe({ topic: 'order-events' });

    console.log('💳 支付服務已啟動');

    await consumer.run({
      eachMessage: async ({ message }) => {
        const event: OrderEvent = JSON.parse(
          message.value?.toString() || '{}'
        );

        if (event.type === 'INVENTORY_RESERVED') {
          await this.handleInventoryReserved(event);
        }
      }
    });
  }

  private async handleInventoryReserved(
    event: Extract<OrderEvent, { type: 'INVENTORY_RESERVED' }>
  ) {
    console.log(`\n[支付] 處理訂單: ${event.orderId}`);

    try {
      // 模擬支付處理
      await new Promise(resolve => setTimeout(resolve, 500));

      // 模擬 90% 成功率
      if (Math.random() < 0.9) {
        const paymentId = `pay-${Date.now()}`;

        await this.eventProducer.publishEvent({
          type: 'PAYMENT_COMPLETED',
          orderId: event.orderId,
          paymentId,
          amount: 0, // 應該從訂單中獲取
          timestamp: Date.now()
        });

        console.log(`✅ [支付] 支付成功: ${paymentId}`);
      } else {
        throw new Error('支付網關錯誤');
      }

    } catch (error) {
      console.error(`❌ [支付] 失敗:`, (error as Error).message);
      
      await this.eventProducer.publishEvent({
        type: 'ORDER_FAILED',
        orderId: event.orderId,
        reason: `支付失敗: ${(error as Error).message}`,
        timestamp: Date.now()
      });
    }
  }
}
```

**services/notification-service.ts**：

```typescript
import { Kafka } from 'kafkajs';
import { OrderEvent } from '../types/events';

export class NotificationService {
  constructor(private kafka: Kafka) {}

  async start() {
    const consumer = this.kafka.consumer({ 
      groupId: 'notification-service' 
    });

    await consumer.connect();
    await consumer.subscribe({ topic: 'order-events' });

    console.log('📧 通知服務已啟動');

    await consumer.run({
      eachMessage: async ({ message }) => {
        const event: OrderEvent = JSON.parse(
          message.value?.toString() || '{}'
        );

        switch (event.type) {
          case 'ORDER_CREATED':
            await this.sendOrderConfirmation(event);
            break;
          case 'PAYMENT_COMPLETED':
            await this.sendPaymentConfirmation(event);
            break;
          case 'ORDER_SHIPPED':
            await this.sendShippingNotification(event);
            break;
          case 'ORDER_FAILED':
            await this.sendFailureNotification(event);
            break;
        }
      }
    });
  }

  private async sendOrderConfirmation(
    event: Extract<OrderEvent, { type: 'ORDER_CREATED' }>
  ) {
    console.log(`\n[通知] 📧 發送訂單確認郵件給用戶 ${event.userId}`);
  }

  private async sendPaymentConfirmation(
    event: Extract<OrderEvent, { type: 'PAYMENT_COMPLETED' }>
  ) {
    console.log(`\n[通知] 💰 發送支付成功通知 (${event.orderId})`);
  }

  private async sendShippingNotification(
    event: Extract<OrderEvent, { type: 'ORDER_SHIPPED' }>
  ) {
    console.log(`\n[通知] 📦 發送物流信息 (追蹤號: ${event.trackingNumber})`);
  }

  private async sendFailureNotification(
    event: Extract<OrderEvent, { type: 'ORDER_FAILED' }>
  ) {
    console.log(`\n[通知] ⚠️  發送訂單失敗通知: ${event.reason}`);
  }
}
```

**index.ts**：

```typescript
import { Kafka } from 'kafkajs';
import { EventProducer } from './kafka/producer';
import { OrderService } from './services/order-service';
import { InventoryService } from './services/inventory-service';
import { PaymentService } from './services/payment-service';
import { NotificationService } from './services/notification-service';

async function main() {
  const kafka = new Kafka({
    clientId: 'order-system',
    brokers: ['localhost:9092']
  });

  const eventProducer = new EventProducer(['localhost:9092']);
  await eventProducer.connect();

  // 創建服務
  const orderService = new OrderService(eventProducer);
  const inventoryService = new InventoryService(kafka, eventProducer);
  const paymentService = new PaymentService(kafka, eventProducer);
  const notificationService = new NotificationService(kafka);

  // 啟動所有消費者服務
  await Promise.all([
    inventoryService.start(),
    paymentService.start(),
    notificationService.start()
  ]);

  console.log('\n🚀 訂單系統已啟動\n');
  console.log('═'.repeat(50));

  // 等待服務準備好
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 創建測試訂單
  await orderService.createOrder({
    userId: 'user-123',
    items: [
      { productId: 'prod-A', quantity: 2, price: 99.99 },
      { productId: 'prod-B', quantity: 1, price: 49.99 }
    ],
    totalAmount: 249.97
  });

  await new Promise(resolve => setTimeout(resolve, 5000));

  // 創建第二個訂單
  await orderService.createOrder({
    userId: 'user-456',
    items: [
      { productId: 'prod-C', quantity: 3, price: 29.99 }
    ],
    totalAmount: 89.97
  });

  console.log('\n═'.repeat(50));
  console.log('\n觀察事件在各服務間的流動...\n');
}

main().catch(console.error);

process.on('SIGINT', () => {
  console.log('\n正在關閉...');
  process.exit(0);
});
```

### 運行項目

```bash
# 1. 創建 Topic
kafka-topics --create --bootstrap-server localhost:9092 \
  --topic order-events --partitions 3 --replication-factor 1

# 2. 安裝依賴
cd projects/order-system
npm install

# 3. 運行
npm run dev
```

## 項目 2：日誌收集系統

簡化版架構：

```
多個應用 → Kafka (logs) → 日誌處理器 → 存儲/告警
```

核心代碼結構類似項目 1，重點在於：
- 高吞吐量配置
- 批次處理
- 日誌級別過濾
- 錯誤告警

## 小結

通過兩個實戰項目，我們學習了：

1. **事件驅動架構**：解耦服務
2. **完整的項目結構**：生產級代碼組織
3. **錯誤處理**：優雅處理失敗場景
4. **TypeScript 最佳實踐**：類型安全

## 下一步

👉 [下一章：17 - 監控與運維基礎](../17-monitoring-and-operations/README.md)

---

[返回目錄](../README.md)

