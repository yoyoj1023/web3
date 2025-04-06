# 41_HelloUniswapV2

本項目展示如何使用 UniswapV2 核心庫來建立兩個 ERC20 代幣和對應的交易對，並透過 UniswapV2Factory 進行對應部署與配對。

## 環境要求
- [Hardhat](https://hardhat.org)
- Solidity 編譯器版本: 0.5.16
- Node.js 與 npm
- 使用 require("hardhat-dependency-compiler") 編譯 [@uniswap/v2-core](https://github.com/Uniswap/v2-core) 的庫

## 項目結構
- `contracts/`：包含 UniswapV2 相關合約（例如 UniswapV2Factory、UniswapV2Pair、UniswapV2ERC20 等）
- `scripts/`：部署腳本（使用 `npx hardhat run scripts/你的部署腳本.js` 指令執行）
- `package.json`：項目的依賴配置

## 主要步驟
1. 編譯參考 [@uniswap/v2-core](https://github.com/Uniswap/v2-core) 合約，透過 `hardhat-dependency-compiler` 進行編譯。
2. 部署兩個 ERC20 代幣合約。
3. 部署 UniswapV2Factory 合約。
4. 在 UniswapV2Factory 中使用部署好的 ERC20 代幣地址創建交易對。

## 執行方式
在項目根目錄下，請先安裝依賴：
```
npm install
```
然後使用 Hardhat 執行部署腳本：
```
npx hardhat run scripts/你的部署腳本.js
```

你可以根據需要修改腳本內容來完成部署及交易對的添加。

## 注意事項
- 請確認配置文件（如 hardhat.config.cjs）中使用的 Solidity 版本與部署環境一致 (0.5.16)。
- 本項目僅作為練習用途，請勿直接用於生產環境。
