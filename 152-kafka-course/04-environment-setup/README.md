# 04 - 環境搭建與基本操作

## 學習目標

在本章節中,你將學到：

- 使用 Docker 快速啟動 Kafka
- Kafka 的基本命令行工具
- 創建和管理 Topic
- 使用命令行 Producer 和 Consumer
- 驗證 Kafka 是否正常工作

## 環境準備

### 前置要求

在開始之前，確保你已經安裝：

- **Docker Desktop**（Windows/Mac）或 **Docker Engine**（Linux）
- **Docker Compose**
- 基本的終端機/命令行使用知識

### 驗證 Docker 安裝

```bash
# 檢查 Docker 版本
docker --version
# 應該顯示：Docker version 20.x.x 或更高

# 檢查 Docker Compose 版本
docker-compose --version
# 應該顯示：docker-compose version 1.x.x 或更高
```

## 使用 Docker Compose 啟動 Kafka

### 配置文件說明

我們將使用 Docker Compose 來啟動 Kafka 和 ZooKeeper。配置文件已經準備好了。

查看 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: kafka-course-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    networks:
      - kafka-network

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-course-broker
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "9093:9093"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
    networks:
      - kafka-network

networks:
  kafka-network:
    driver: bridge
```

**配置說明**：

- **ZooKeeper**: Kafka 用來管理集群元數據
- **Kafka Broker**: 單個 Kafka 服務器
- **端口**:
  - `2181`: ZooKeeper 端口
  - `9092`: Kafka 外部訪問端口
  - `29092`: Kafka 容器內部端口

### 啟動 Kafka

```bash
# 進入課程目錄
cd 152-kafka-course

# 啟動服務（後台運行）
docker-compose up -d

# 查看容器狀態
docker-compose ps
```

**預期輸出**：

```
NAME                       STATUS              PORTS
kafka-course-broker        Up 30 seconds       0.0.0.0:9092->9092/tcp
kafka-course-zookeeper     Up 31 seconds       0.0.0.0:2181->2181/tcp
```

### 查看日誌

```bash
# 查看 Kafka 日誌
docker-compose logs kafka

# 實時查看日誌
docker-compose logs -f kafka
```

### 停止和清理

```bash
# 停止服務
docker-compose stop

# 停止並刪除容器
docker-compose down

# 停止並刪除所有數據（慎用！）
docker-compose down -v
```

## Kafka 命令行工具

Kafka 提供了一套命令行工具用於管理和測試。這些工具都在 Kafka 容器內。

### 進入 Kafka 容器

```bash
docker exec -it kafka-course-broker bash
```

現在你在 Kafka 容器的 shell 中，可以使用 Kafka 的命令行工具。

### 工具概覽

| 工具 | 用途 |
|-----|------|
| `kafka-topics` | 管理 Topic |
| `kafka-console-producer` | 命令行 Producer |
| `kafka-console-consumer` | 命令行 Consumer |
| `kafka-consumer-groups` | 管理 Consumer Group |
| `kafka-configs` | 管理配置 |

所有工具都在 `/usr/bin/` 目錄下。

## Topic 管理

### 創建 Topic

**基本語法**：

```bash
kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic <topic-name> \
  --partitions <num-partitions> \
  --replication-factor <num-replicas>
```

**示例 1：創建簡單的 Topic**

```bash
kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic test-topic \
  --partitions 3 \
  --replication-factor 1
```

**輸出**：
```
Created topic test-topic.
```

**參數說明**：
- `--bootstrap-server`: Kafka 服務器地址
- `--topic`: Topic 名稱
- `--partitions`: 分區數量
- `--replication-factor`: 副本數量（單機只能是 1）

**示例 2：創建用戶事件 Topic**

```bash
kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --partitions 5 \
  --replication-factor 1
```

### 列出所有 Topic

```bash
kafka-topics --list \
  --bootstrap-server localhost:9092
```

**輸出**：
```
test-topic
user-events
```

### 查看 Topic 詳情

```bash
kafka-topics --describe \
  --bootstrap-server localhost:9092 \
  --topic test-topic
```

**輸出**：
```
Topic: test-topic       TopicId: xYz123...      PartitionCount: 3       ReplicationFactor: 1    Configs:
        Topic: test-topic       Partition: 0    Leader: 1       Replicas: 1     Isr: 1
        Topic: test-topic       Partition: 1    Leader: 1       Replicas: 1     Isr: 1
        Topic: test-topic       Partition: 2    Leader: 1       Replicas: 1     Isr: 1
```

**解讀**：
- **Partition**: 分區編號
- **Leader**: 該分區的 Leader Broker ID
- **Replicas**: 副本所在的 Broker
- **Isr**: In-Sync Replicas（同步副本）

### 修改 Topic

**增加分區數**：

```bash
kafka-topics --alter \
  --bootstrap-server localhost:9092 \
  --topic test-topic \
  --partitions 5
```

⚠️ **注意**：
- 只能增加分區，不能減少
- 增加分區會影響 key 的分配邏輯

### 刪除 Topic

```bash
kafka-topics --delete \
  --bootstrap-server localhost:9092 \
  --topic test-topic
```

## 使用命令行 Producer

### 啟動 Producer

```bash
kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic test-topic
```

**進入交互模式**：

```
>Hello Kafka
>This is my first message
>Testing 123
```

每輸入一行，按 Enter 就會發送一條消息。

按 `Ctrl+C` 退出。

### 帶 Key 的消息

```bash
kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic test-topic \
  --property "parse.key=true" \
  --property "key.separator=:"
```

**發送格式**：`key:value`

```
>user1:Login event
>user1:Purchase item
>user2:View page
>user1:Logout
```

相同 key 的消息會發送到同一分區。

### 從文件讀取

創建測試文件 `messages.txt`：

```
Message 1
Message 2
Message 3
```

發送文件內容：

```bash
kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic test-topic \
  < messages.txt
```

## 使用命令行 Consumer

### 基本消費

```bash
kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic test-topic \
  --from-beginning
```

**參數說明**：
- `--from-beginning`: 從最早的消息開始讀取
- 不加此參數：只讀取新消息

### 查看 Key 和 Value

```bash
kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic test-topic \
  --from-beginning \
  --property print.key=true \
  --property key.separator=":"
```

**輸出格式**：
```
user1:Login event
user1:Purchase item
null:Message without key
```

### 指定 Consumer Group

```bash
kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic test-topic \
  --group my-consumer-group \
  --from-beginning
```

使用 Consumer Group 後，offset 會被追蹤。

### 查看特定分區

```bash
kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic test-topic \
  --partition 0 \
  --from-beginning
```

只消費 Partition 0 的消息。

## 實戰練習

### 練習 1：創建訂單 Topic

```bash
# 1. 創建 Topic
kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic orders \
  --partitions 3 \
  --replication-factor 1

# 2. 驗證創建成功
kafka-topics --describe \
  --bootstrap-server localhost:9092 \
  --topic orders
```

### 練習 2：模擬訂單處理

**終端 1 - 啟動 Consumer（模擬訂單處理服務）**：

```bash
kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic orders \
  --group order-processing-service \
  --property print.key=true \
  --property key.separator=":"
```

**終端 2 - 啟動 Producer（模擬下單）**：

```bash
kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic orders \
  --property "parse.key=true" \
  --property "key.separator=:"
```

發送訂單：

```
order1:{"userId":"user123","amount":99.99}
order2:{"userId":"user456","amount":149.50}
order3:{"userId":"user123","amount":29.99}
```

觀察 Consumer 終端，應該能看到接收到的訂單。

### 練習 3：多個 Consumer 負載均衡

**終端 1 - Consumer 1**：

```bash
kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic orders \
  --group order-processing-service
```

**終端 2 - Consumer 2（同一個 Group）**：

```bash
kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic orders \
  --group order-processing-service
```

**終端 3 - Producer**：

發送多條消息，觀察兩個 Consumer 如何分擔工作。

### 練習 4：查看 Consumer Group 狀態

```bash
# 列出所有 Consumer Group
kafka-consumer-groups --list \
  --bootstrap-server localhost:9092

# 查看特定 Group 的詳情
kafka-consumer-groups --describe \
  --bootstrap-server localhost:9092 \
  --group order-processing-service
```

**輸出示例**：

```
GROUP                     TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
order-processing-service  orders    0          5               5               0
order-processing-service  orders    1          3               3               0
order-processing-service  orders    2          4               4               0
```

**字段說明**：
- **CURRENT-OFFSET**: Consumer 已讀取到的位置
- **LOG-END-OFFSET**: 分區最新消息的位置
- **LAG**: 落後的消息數量（0 表示已讀完）

## 常用操作速查表

### Topic 操作

```bash
# 創建
kafka-topics --create --bootstrap-server localhost:9092 --topic <name> --partitions <n> --replication-factor <n>

# 列出
kafka-topics --list --bootstrap-server localhost:9092

# 詳情
kafka-topics --describe --bootstrap-server localhost:9092 --topic <name>

# 刪除
kafka-topics --delete --bootstrap-server localhost:9092 --topic <name>
```

### Producer 操作

```bash
# 基本發送
kafka-console-producer --bootstrap-server localhost:9092 --topic <name>

# 帶 Key
kafka-console-producer --bootstrap-server localhost:9092 --topic <name> \
  --property "parse.key=true" --property "key.separator=:"
```

### Consumer 操作

```bash
# 從頭開始
kafka-console-consumer --bootstrap-server localhost:9092 --topic <name> --from-beginning

# 使用 Group
kafka-console-consumer --bootstrap-server localhost:9092 --topic <name> --group <group-name>

# 顯示 Key
kafka-console-consumer --bootstrap-server localhost:9092 --topic <name> \
  --property print.key=true --property key.separator=":"
```

### Consumer Group 操作

```bash
# 列出所有 Group
kafka-consumer-groups --list --bootstrap-server localhost:9092

# 查看 Group 詳情
kafka-consumer-groups --describe --bootstrap-server localhost:9092 --group <name>

# 重置 Offset
kafka-consumer-groups --reset-offsets --bootstrap-server localhost:9092 \
  --group <name> --topic <topic> --to-earliest --execute
```

## 故障排查

### 無法連接到 Kafka

**檢查服務狀態**：

```bash
docker-compose ps
```

確保所有服務都是 `Up` 狀態。

**查看日誌**：

```bash
docker-compose logs kafka
```

### Topic 創建失敗

**常見原因**：
- Replication factor 大於 Broker 數量
- Topic 名稱包含非法字符

**解決方案**：
- 單機環境使用 `--replication-factor 1`
- Topic 名稱使用字母、數字、`.`、`_`、`-`

### Consumer 收不到消息

**檢查清單**：
1. Topic 是否存在？`kafka-topics --list`
2. Topic 中是否有消息？使用 `--from-beginning` 測試
3. Consumer Group 的 offset 是否已經到末尾？

## 小結

在本章中，我們學習了：

1. **環境搭建**：
   - 使用 Docker Compose 啟動 Kafka
   - 驗證服務運行狀態

2. **Topic 管理**：
   - 創建、列出、查看、修改、刪除 Topic

3. **命令行工具**：
   - `kafka-console-producer`: 發送測試消息
   - `kafka-console-consumer`: 接收消息
   - `kafka-consumer-groups`: 管理 Consumer Group

4. **實戰練習**：
   - 模擬訂單處理系統
   - 觀察 Consumer Group 負載均衡
   - 查看消費進度

## 思考題

1. 為什麼在 Consumer 啟動時使用 `--from-beginning` 參數，它會讀取所有歷史消息？
2. 如果有 3 個分區和 2 個 Consumer（同一 Group），消息如何分配？
3. 兩個不同的 Consumer Group 消費同一個 Topic，它們會互相影響嗎？

## 下一步

現在你已經可以在本地運行 Kafka 並進行基本操作了！在下一章中，我們將開始使用 TypeScript 編寫真正的 Producer 程序。

👉 [下一章：05 - Producer 基礎](../05-producer-basics/README.md)

---

[返回目錄](../README.md)

