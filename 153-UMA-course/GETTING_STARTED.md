# 快速開始指南

本指南將幫助你在 10 分鐘內設置好學習環境並運行第一個 UMA 範例。

---

## 📋 前置檢查

在開始之前，請確保你的系統已安裝：

```bash
# 檢查 Node.js (建議 v16 或更高)
node --version

# 檢查 npm
npm --version

# 檢查 Git
git --version
```

如果還沒安裝，請訪問：
- Node.js: https://nodejs.org/
- Git: https://git-scm.com/

---

## 🚀 5 步驟快速開始

### 步驟 1：進入課程目錄

```bash
cd 153-UMA-course
```

### 步驟 2：初始化 Node.js 項目

```bash
# 創建 package.json
npm init -y

# 或者使用已提供的 package.json
```

### 步驟 3：安裝依賴

```bash
# 安裝 Hardhat
npm install --save-dev hardhat

# 安裝 Hardhat 插件
npm install --save-dev @nomicfoundation/hardhat-toolbox

# 安裝 OpenZeppelin 合約
npm install @openzeppelin/contracts

# 安裝 ethers.js
npm install ethers

# 安裝測試工具
npm install --save-dev chai @nomicfoundation/hardhat-chai-matchers
```

### 步驟 4：初始化 Hardhat

```bash
# 初始化 Hardhat 項目
npx hardhat init

# 選擇：Create a JavaScript project
# 其他選項使用預設值即可
```

這將創建以下結構：
```
153-UMA-course/
├── contracts/       # 智能合約目錄
├── scripts/         # 部署腳本目錄
├── test/           # 測試文件目錄
└── hardhat.config.js  # Hardhat 配置
```

### 步驟 5：複製範例合約

```bash
# 複製模組一的範例合約到 contracts 目錄
cp module1/01-SimpleFinder.sol contracts/
cp module1/02-FinderConsumer.sol contracts/
cp module1/03-FeeCalculator.sol contracts/

# 複製測試腳本到 scripts 目錄
cp module1/04-test-finder.js scripts/
cp module1/05-test-fee-calculator.js scripts/
```

---

## ✅ 驗證安裝

### 編譯合約

```bash
npx hardhat compile
```

你應該看到：
```
Compiling 3 files with 0.8.0
Compilation finished successfully
```

### 運行本地節點

在一個新的終端窗口中：

```bash
npx hardhat node
```

你應該看到：
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
...
```

保持這個終端運行。

### 運行測試腳本

在另一個終端中：

```bash
# 測試 Finder
npx hardhat run scripts/04-test-finder.js --network localhost

# 測試 FeeCalculator
npx hardhat run scripts/05-test-fee-calculator.js --network localhost
```

如果看到 ✅ 符號和成功訊息，恭喜！你的環境已經設置完成。

---

## 📚 開始學習

### 建議學習順序

1. **閱讀概念** (1-2 天)
   ```bash
   # 閱讀模組零
   cat module0/README.md | less
   
   # 或在瀏覽器中打開
   # 使用 Markdown 預覽器查看
   ```

2. **完成練習** (1 天)
   ```bash
   cat module0/02-exercises.md | less
   ```

3. **動手實踐** (2-3 天)
   - 閱讀 `module1/README.md`
   - 修改範例合約
   - 運行測試腳本

4. **深入探索** (1 週)
   - 完成 `module1/EXERCISES.md` 中的練習
   - 構建自己的應用
   - 探索 `protocol/` 目錄中的官方合約

---

## 🛠️ 常見問題

### Q1: 編譯時出現 "SPDX license identifier not provided" 警告

**解決方案**：這是正常的警告，可以忽略。如果想消除，在合約頂部添加：
```solidity
// SPDX-License-Identifier: MIT
```

### Q2: 運行測試時出現 "Error: could not detect network"

**解決方案**：確保本地 Hardhat 節點正在運行：
```bash
# 在新終端中
npx hardhat node
```

### Q3: 合約編譯失敗，提示 "@openzeppelin/contracts not found"

**解決方案**：重新安裝 OpenZeppelin：
```bash
npm install @openzeppelin/contracts
```

### Q4: 如何使用 Remix IDE？

**步驟**：
1. 打開 https://remix.ethereum.org/
2. 創建新文件，複製合約代碼
3. 在 "Solidity Compiler" 選擇編譯器版本 0.8.0+
4. 點擊 "Compile"
5. 在 "Deploy & Run Transactions" 部署合約

### Q5: 我想在測試網上部署，如何配置？

**步驟**：

1. 獲取測試網 RPC URL（如 Infura 或 Alchemy）

2. 修改 `hardhat.config.js`：
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.16",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: ["YOUR_PRIVATE_KEY"] // 警告：不要提交到 Git！
    }
  }
};
```

3. 部署到測試網：
```bash
npx hardhat run scripts/04-test-finder.js --network sepolia
```

---

## 🔧 開發工具推薦

### VSCode 擴展

```bash
# Solidity 語法高亮
code --install-extension JuanBlanco.solidity

# Hardhat 支持
code --install-extension NomicFoundation.hardhat-solidity
```

### 瀏覽器擴展

- **MetaMask**：與 DApp 交互
  - https://metamask.io/

---

## 📖 額外資源

### 學習資源

- [Solidity 官方文檔](https://docs.soliditylang.org/)
- [Hardhat 教程](https://hardhat.org/tutorial)
- [OpenZeppelin 合約](https://docs.openzeppelin.com/contracts/)

### UMA 資源

- [UMA 官方文檔](https://docs.umaproject.org)
- [UMA Discord](https://discord.gg/umaproject)
- [UMA GitHub](https://github.com/UMAprotocol/protocol)

---

## 🎯 快速測試：5 分鐘挑戰

完成設置後，嘗試這個 5 分鐘挑戰來驗證你的理解：

### 挑戰：修改 SimpleFinder

**任務**：在 `SimpleFinder.sol` 中添加一個函數，返回已註冊的介面數量。

**提示**：
```solidity
// 添加一個計數器
uint256 public interfaceCount;

// 在 changeImplementationAddress 中更新計數器
```

**驗證**：
```bash
npx hardhat compile
npx hardhat run scripts/04-test-finder.js --network localhost
```

如果編譯通過並且測試運行成功，你已經準備好深入學習了！

---

## 📝 下一步

1. ✅ 環境設置完成
2. 📖 開始閱讀 [模組零](./module0/README.md)
3. 💻 實踐 [模組一](./module1/README.md)
4. 🎯 完成練習獲得深入理解

**準備好了嗎？讓我們開始吧！** 🚀

---

## 💬 需要幫助？

如果遇到問題：
1. 查看本指南的「常見問題」部分
2. 參考 [Hardhat 故障排除](https://hardhat.org/hardhat-runner/docs/guides/troubleshooting)
3. 加入 [UMA Discord](https://discord.gg/umaproject) 提問
4. 查看 `protocol/` 目錄中的官方範例

祝學習順利！

