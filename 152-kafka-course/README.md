# Kafka 深入淺出課程

> 一個為初學者設計的系統化 Kafka 學習課程，從基礎概念到實戰應用

## 課程簡介

本課程專為完全沒有 Kafka 經驗但具備基本程式設計背景的學習者設計。透過循序漸進的方式，帶你從零開始掌握 Kafka 的核心概念、架構原理和實際應用。

### 你會學到什麼

- ✅ 理解 Kafka 的核心概念和應用場景
- ✅ 掌握 Kafka 的基本架構和工作原理
- ✅ 能夠使用 TypeScript 進行基本的 Kafka 應用開發
- ✅ 了解 Kafka 在實際專案中的應用模式
- ✅ 掌握 Kafka 的最佳實踐和常見問題解決方案

### 課程特色

- 🎯 **深入淺出**：從最基本的概念開始，逐步深入到中級主題
- 💻 **理論與實踐結合**：每個概念都配有 TypeScript 程式碼示例
- 🔍 **重視理解**：不只教怎麼用，更解釋為什麼這樣設計
- 🚀 **實用導向**：聚焦於實際工作中會遇到的場景
- 🇹🇼 **中文友善**：使用繁體中文，降低學習門檻

## 前置知識要求

- 基本的程式設計能力（變數、函數、物件等）
- 了解 JavaScript/TypeScript 基礎
- 基本的命令行操作
- 了解基本的網路概念（不需要很深入）

## 技術棧

- **Node.js** + **TypeScript**
- **KafkaJS**（官方推薦的 Node.js 客戶端）
- **Docker** 與 **Docker Compose**（用於本地環境）

## 課程結構

### 📚 第一部分：Kafka 基礎概念

- [01 - 什麼是 Kafka](./01-what-is-kafka/README.md)
- [02 - 核心概念與術語](./02-core-concepts/README.md)
- [03 - Kafka 的設計哲學](./03-design-philosophy/README.md)
- [04 - 環境搭建與基本操作](./04-environment-setup/README.md)

### 📤 第二部分：Producer 深入

- [05 - Producer 基礎](./05-producer-basics/README.md)
- [06 - Producer 進階配置](./06-producer-advanced/README.md)
- [07 - Producer 最佳實踐](./07-producer-best-practices/README.md)

### 📥 第三部分：Consumer 深入

- [08 - Consumer 基礎](./08-consumer-basics/README.md)
- [09 - Consumer Group 機制](./09-consumer-group/README.md)
- [10 - Consumer 進階配置](./10-consumer-advanced/README.md)
- [11 - Consumer 最佳實踐](./11-consumer-best-practices/README.md)

### 🏗️ 第四部分：Kafka 架構深入

- [12 - Broker 與集群](./12-broker-and-cluster/README.md)
- [13 - 數據存儲與日誌](./13-data-storage/README.md)
- [14 - 可靠性與一致性保證](./14-reliability-and-consistency/README.md)

### 🚀 第五部分：實戰應用

- [15 - 常見應用模式](./15-common-patterns/README.md)
- [16 - TypeScript 實戰項目](./16-practical-projects/README.md)
- [17 - 監控與運維基礎](./17-monitoring-and-operations/README.md)

### 🎓 第六部分：總結與進階路徑

- [18 - 課程總結與進階方向](./18-summary-and-next-steps/README.md)

## 學習建議

- **建議學習時間**：4-6 週
- **每週學習**：3-4 章節
- **務必動手實作**：每個程式碼示例都要親自執行
- **完成實戰項目**：透過兩個實戰項目鞏固知識

## 快速開始

### 1. 環境準備

確保你已安裝：
- Node.js 16+ 
- Docker Desktop
- 你喜歡的程式碼編輯器（推薦 VS Code）

### 2. 啟動 Kafka 環境

```bash
# 進入課程目錄
cd 152-kafka-course

# 啟動 Kafka（使用 Docker Compose）
docker-compose up -d

# 驗證 Kafka 是否正常運行
docker-compose ps
```

### 3. 安裝依賴

```bash
# 進入示例代碼目錄
cd examples

# 安裝依賴
npm install
```

### 4. 開始學習

從 [第一章](./01-what-is-kafka/README.md) 開始你的 Kafka 學習之旅！

## 課程資源

- 📁 `examples/`：所有章節的 TypeScript 程式碼示例
- 📁 `projects/`：兩個完整的實戰項目
- 📄 `docker-compose.yml`：本地 Kafka 環境配置
- 📄 `package.json`：TypeScript 專案配置

## 學習路徑圖

```
入門 → 基礎概念 → Producer → Consumer → 架構深入 → 實戰應用 → 進階學習
  ↓        ↓         ↓         ↓         ↓          ↓           ↓
 第1章   第2-4章    第5-7章   第8-11章   第12-14章  第15-17章   第18章
```

## 常見問題

### Q: 我完全沒有接觸過消息隊列，可以學這個課程嗎？
A: 可以！本課程從零開始，會先介紹消息隊列的基本概念，然後再深入 Kafka。

### Q: 為什麼選擇 TypeScript 而不是 Java？
A: Kafka 本身是用 Java 開發的，但 TypeScript/JavaScript 生態也非常成熟。對於初學者來說，TypeScript 更容易上手，而且 KafkaJS 是一個非常優秀的客戶端庫。

### Q: 學完這個課程後，我可以在生產環境使用 Kafka 嗎？
A: 本課程涵蓋了基礎到中級的內容，學完後你可以在中小型專案中使用 Kafka。但對於大規模生產環境，建議繼續學習運維、性能調優等進階主題。

### Q: 需要準備多少學習時間？
A: 建議每週投入 5-8 小時，持續 4-6 週。但這取決於你的背景和學習速度。

## 反饋與貢獻

如果你在學習過程中發現任何問題或有改進建議，歡迎提出！

## 授權

本課程內容採用 MIT 授權。

---

**準備好了嗎？讓我們開始 Kafka 的學習之旅！** 🚀

👉 [開始學習：第一章 - 什麼是 Kafka](./01-what-is-kafka/README.md)

