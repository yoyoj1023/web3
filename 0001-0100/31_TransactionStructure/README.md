# 31_TransactionStructure Solidity 交易結構參數實戰

本專案主要用來練習 Solidity 中交易結構的各種參數，並透過 JavaScript 來呼叫智能合約的函數。透過範例程式碼，你將學習到如何設定與使用以下參數：

- **nonce**：交易的序號，用於避免重放攻擊。
- **gasLimit**：指定交易或函數呼叫所允許的最大 gas 數量。
- **gasPrice**：支付給礦工作為手續費的 gas 單價（在 EIP-1559 之前）。
- **maxFeePerGas** 與 **maxPriorityFeePerGas**：EIP-1559 統一收費結構後的新參數，分別定義最大每單位 gas 費用與礦工小費。
- **value**：轉帳金額（單位為 wei），當呼叫支付以太幣的合約函數時使用。
- **chainId**：防止交易重放攻擊的網路識別，確保交易只在指定區塊鏈上生效。

## 專案目的

本專案透過實際的範例，展示在呼叫合約函數時如何附帶這些參數。這不但有助於理解每個參數的具體意義，也能讓你熟悉在 Ether 或其他 EVM 相容鏈上發送交易的流程。

## 技術棧

- **Solidity**：智能合約語言，用於定義合約和處理交易結構。
- **JavaScript**：透過相應的 library（例如 web3.js 或 ethers.js），實際發送交易請求。
- **Node.js**：環境要求，用以運行 JavaScript 範例腳本。

## 安裝與設定

1. **環境需求**
   - Node.js (建議版本 14+)
   - npm 或 yarn

2. **安裝依賴**
   在專案根目錄下執行：
   ```bash
   npm install