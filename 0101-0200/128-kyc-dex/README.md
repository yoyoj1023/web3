# caffold-ETH 2 KYC DEX 去中心化交易所

🚀 這是一個基於 **Scaffold-ETH 2** 構建的具有 KYC (Know Your Customer) 功能的去中心化交易所，集成了身份驗證、自動做市商 (AMM) 和流動性挖礦功能。使用 NextJS、RainbowKit、Wagmi、Viem 和 TypeScript 開發。

⚙️ 內建 **Hardhat 網絡** 用於快速開發，支援熱重載您的智能合約和前端。

🔥 **Burner Wallet & Local Faucet**: 快速測試您的應用程式，無需處理測試網的水龍頭。

![Debug Contracts tab](https://github.com/yoyoj1023/web3/blob/main/128-kyc-dex/sample.png)

<h4 align="center">
  <a href="https://orion-dex-sigma.vercel.app/">部屬網站</a>
</h4>

## 🎯 核心功能

### 📋 KYC 白名單系統
- **身份驗證管理**: 管理員可以添加和移除用戶的 KYC 驗證狀態
- **存取控制**: 只有通過 KYC 驗證的用戶才能使用 DEX 功能
- **事件追蹤**: 完整記錄所有 KYC 狀態變更

### 💱 去中心化交易所 (DEX)
- **自動做市商 (AMM)**: 基於恆定乘積公式的價格發現機制
- **ETH ↔ LPT 交易**: 支援以太幣與 LepusToken 之間的即時兌換
- **流動性提供**: 用戶可以提供流動性賺取手續費
- **安全保護**: 內建重入攻擊保護和滑點控制

### 🪙 代幣系統
- **LepusToken (LPT)**: 項目原生代幣，總供應量對應新台幣總量
- **流動性代幣**: 提供流動性後獲得 LP Token，代表在池中的份額

## 🔧 技術架構

### 智能合約層
- **前端**: Next.js 15, React, TypeScript, Tailwind CSS
- **區塊鏈**: Solidity, Hardhat, Viem, Wagmi
- **錢包**: RainbowKit (支援 MetaMask, WalletConnect 等)
- **網絡**: 本地 Hardhat 網絡 + Optimism Sepolia 測試網

### 智能合約詳細說明

#### 📝 KYCRegistry.sol - KYC 白名單合約
```solidity
// 主要功能
- addVerifiedUser(address)    // 添加已驗證用戶（僅限擁有者）
- removeVerifiedUser(address) // 移除用戶驗證（僅限擁有者）
- isVerified(address)         // 查詢用戶驗證狀態

// 安全特性
- 使用 OpenZeppelin Ownable 確保權限控制
- 防止重複添加/移除操作
- 完整的事件記錄用於審計
```

#### 🔄 DEX.sol - 去中心化交易所合約
```solidity
// 核心功能
- ethToToken()     // ETH 兌換代幣（需要 KYC 驗證）
- tokenToEth()     // 代幣兌換 ETH（需要 KYC 驗證）
- deposit()        // 提供流動性（僅限擁有者）
- withdraw()       // 移除流動性（僅限擁有者）
- price()          // 計算交易價格（包含 0.3% 手續費）

// 安全機制
- KYC 驗證整合：所有交易需要通過身份驗證
- 重入攻擊保護：使用 lock 修飾符
- 滑點保護：支援最小輸出數量設定
- 緊急停止：管理員可暫停 DEX 操作
```

#### 🪙 LepusToken.sol - 項目代幣
```solidity
// 代幣特性
- 名稱: LepusToken (LPT)
- 標準: ERC20
- 總供應量: 64,458,727,000,000 (對應新台幣總量)
- 部署時間戳記錄: 便於追蹤和審計
```

## 📱 前端應用

### 主要頁面
- **🏠 首頁**: 項目介紹和快速導航
- **💱 交易頁面** (`/trade`): DEX 交易界面
  - ETH ↔ LPT 即時兌換
  - 流動性提供和移除
  - 實時價格顯示
- **📋 KYC 事件** (`/kyc-events`): KYC 狀態變更歷史
- **📊 DEX 事件** (`/dex-events`): 交易和流動性事件記錄
- **🐛 Debug Contracts** (`/debug`): 智能合約開發者界面
- **🔍 Block Explorer** (`/blockexplorer`): 本地區塊鏈瀏覽器

### 核心元件
- **Address**: 格式化顯示以太坊地址
- **Balance**: 即時顯示錢包餘額
- **EtherInput**: 支援 ETH/USD 轉換的輸入元件
- **RainbowKit**: 錢包連接和管理界面

## 🚀 快速開始

### 前置要求

- [Node.js](https://nodejs.org/en/download/) >= 20.18.3
- [Yarn](https://classic.yarnpkg.com/en/docs/install/) >= 3.2.3
- [Git](https://git-scm.com/downloads)

### 安裝與部署

1. **克隆儲存庫**：
```bash
git clone https://github.com/your-username/kyc-dex.git
cd kyc-dex
```

2. **安裝依賴**：
```bash
yarn install
```

3. **啟動本地區塊鏈**：
```bash
yarn chain
```

4. **部署智能合約**（新終端視窗）：
```bash
yarn deploy
```

5. **啟動前端應用**：
```bash
yarn start
```

6. **訪問應用**: 打開 [http://localhost:3000](http://localhost:3000)

## 🏗️ 項目結構

```
128-kyc-dex/
├── packages/
│   ├── hardhat/                    # 智能合約開發環境
│   │   ├── contracts/
│   │   │   ├── KYCRegistry.sol    # KYC 白名單合約
│   │   │   ├── DEX.sol            # 去中心化交易所合約
│   │   │   ├── LepusToken.sol     # 項目代幣合約
│   │   │   ├── UniswapV2Factory.sol # Uniswap V2 工廠合約
│   │   │   └── UniswapV2Pair.sol  # Uniswap V2 配對合約
│   │   ├── deploy/                # 合約部署腳本
│   │   ├── test/                  # 合約測試文件
│   │   └── scripts/               # 輔助腳本
│   └── nextjs/                    # 前端應用程式
│       ├── app/
│       │   ├── trade/             # 交易頁面
│       │   ├── kyc-events/        # KYC 事件頁面
│       │   ├── dex-events/        # DEX 事件頁面
│       │   ├── debug/             # 合約調試頁面
│       │   └── blockexplorer/     # 區塊瀏覽器
│       ├── components/            # React 元件
│       ├── hooks/                 # 自定義 Hooks
│       └── contracts/             # 生成的合約類型
```

## 🛠️ 開發指令

```bash
yarn chain              # 啟動本地 Hardhat 網絡
yarn deploy             # 部署智能合約到本地網絡
yarn start              # 啟動前端開發伺服器
yarn compile            # 編譯智能合約
yarn test               # 運行合約測試
yarn lint               # 代碼格式檢查
yarn format             # 自動格式化代碼
yarn account            # 顯示部署帳戶信息
yarn account:generate   # 生成新的帳戶
```

## 📈 使用指南

### 👑 管理員操作
1. 連接錢包（部署者帳戶）
2. 前往 **Debug Contracts** 頁面
3. 使用 **KYCRegistry** 合約：
   - `addVerifiedUser`: 添加 KYC 驗證用戶
   - `removeVerifiedUser`: 移除用戶驗證狀態
4. 使用 **DEX** 合約：
   - `init`: 初始化流動性池
   - `setBlocked`: 控制 DEX 開關狀態

### 👤 用戶操作
1. **申請 KYC 驗證**: 聯絡管理員進行身份驗證
2. **查看驗證狀態**: 在 Debug Contracts 中查詢 `isVerified`
3. **使用 DEX 交易**:
   - 前往 **交易頁面** (`/trade`)
   - 選擇 ETH → LPT 或 LPT → ETH
   - 設定交易數量和滑點容忍度
   - 確認交易

### 🧑‍💻 開發者指南
1. **合約互動**: 使用 Scaffold-ETH 2 的 hooks
   ```typescript
   // 讀取數據
   const { data } = useScaffoldReadContract({
     contractName: "DEX",
     functionName: "isVerified",
     args: [userAddress],
   });

   // 寫入數據
   const { writeContractAsync } = useScaffoldWriteContract({
     contractName: "DEX"
   });
   ```

2. **新增功能**: 在 `packages/nextjs/app` 中添加新頁面
3. **合約測試**: 在 `packages/hardhat/test` 中編寫測試

## 🌐 部署到測試網

### 環境配置

在 `packages/hardhat/.env` 創建：
```env
ALCHEMY_API_KEY=your_alchemy_api_key
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
```

在 `packages/nextjs/.env.local` 創建：
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

### 部署指令
```bash
# 部署到 Optimism Sepolia
yarn deploy --network optimismSepolia

# 驗證合約
yarn verify --network optimismSepolia
```

## 🧪 測試

```bash
# 運行智能合約測試
yarn hardhat:test

# 運行前端測試
yarn next:test
```

## 🔒 安全特性

- **身份驗證**: 強制 KYC 驗證才能使用 DEX
- **權限控制**: 使用 OpenZeppelin Ownable 模式
- **重入保護**: DEX 合約防止重入攻擊
- **輸入驗證**: 全面的參數檢查和錯誤處理
- **事件記錄**: 完整的審計追蹤
- **緊急停止**: 管理員可暫停系統操作

## 📚 相關資源

- [Scaffold-ETH 2 文檔](https://docs.scaffoldeth.io)
- [Hardhat 開發框架](https://hardhat.org/docs)
- [Next.js 官方文檔](https://nextjs.org/docs)
- [RainbowKit 錢包連接](https://rainbowkit.com/docs)
- [Wagmi React Hooks](https://wagmi.sh)
- [OpenZeppelin 安全合約](https://docs.openzeppelin.com/contracts)

## 🤝 貢獻指南

我們歡迎社群貢獻！請遵循以下步驟：

1. Fork 此儲存庫
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 開源授權

此項目採用 [MIT License](LICENCE) 授權。

## 💬 社群支援

遇到問題或需要協助？

1. 📖 查閱 [Scaffold-ETH 2 文檔](https://docs.scaffoldeth.io)
2. 🐛 提交 [GitHub Issues](../../issues)
3. 💬 加入 [BuidlGuidl Discord](https://discord.gg/BAKqpA4t)
4. 🐦 關注 [@BuidlGuidl](https://twitter.com/BuidlGuidl)

---

<p align="center">
  ❤️ 使用 <a href="https://scaffoldeth.io">Scaffold-ETH 2</a> 精心打造的 KYC DEX
</p>
