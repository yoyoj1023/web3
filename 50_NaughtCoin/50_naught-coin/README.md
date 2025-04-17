# Naught Coin 攻略指南

本專案基於 [scaffold-eth-2](https://github.com/scaffold-eth/scaffold-eth-2) 架構，用於解決 [Ethernaut](https://ethernaut.openzeppelin.com/) 中的 Naught Coin 挑戰。

## 挑戰概述

Naught Coin 是一種 ERC20 代幣，初始供應量全部分配給了挑戰者（玩家）。然而，該合約實現了一個 `lockTokens` 修飾符，限制玩家在 10 年內無法使用 `transfer()` 函數轉移代幣。

**目標**：繞過時間鎖定限制，將所有代幣從玩家的帳戶中轉移出去。

## 漏洞分析

查看合約原始碼可以發現：

```solidity
contract NaughtCoin is ERC20 {
    uint256 public timeLock = block.timestamp + 10 * 365 days;
    uint256 public INITIAL_SUPPLY;
    address public player;

    constructor(address _player) ERC20("NaughtCoin", "0x0") {
        player = _player;
        INITIAL_SUPPLY = 1000000 * (10 ** uint256(decimals()));
        _mint(player, INITIAL_SUPPLY);
        emit Transfer(address(0), player, INITIAL_SUPPLY);
    }

    function transfer(address _to, uint256 _value) public override lockTokens returns (bool) {
        super.transfer(_to, _value);
    }

    // Prevent the initial owner from transferring tokens until the timelock has passed
    modifier lockTokens() {
        if (msg.sender == player) {
            require(block.timestamp > timeLock);
            _;
        } else {
            _;
        }
    }
}
```

關鍵漏洞：合約只覆寫並限制了 `transfer()` 函數，但 ERC20 標準還提供了其他轉移代幣的方法，特別是：
- `approve()`: 允許其他地址從自己的帳戶中提取代幣
- `transferFrom()`: 用於從已獲批准的帳戶中提取代幣

## 攻擊步驟

1. 使用玩家帳戶呼叫 `approve()` 函數，授權另一個地址（可以是你的另一個帳戶）使用你的全部代幣
2. 從第二個帳戶呼叫 `transferFrom()` 函數，將代幣從玩家帳戶轉移出來

## 環境設置

### 前置條件

- Node.js 16+ 和 Yarn
- MetaMask 錢包
- 一些測試網 ETH (如 Sepolia)

### 安裝步驟

1. 複製專案
```bash
git clone https://github.com/your-username/naught-coin.git
cd naught-coin
```

2. 安裝依賴
```bash
yarn install
```

3. 在兩個不同的終端啟動專案
```bash
# 終端 1: 啟動本地鏈
yarn chain

# 終端 2: 啟動前端
yarn start
```

## 使用 Debug Contracts 頁面解決挑戰

1. 連接到 Ethernaut 實例
   - 在 MetaMask 中，確保你已經連接到包含 Ethernaut 挑戰實例的網絡（如 Sepolia）
   - 獲取 Ethernaut 中 Naught Coin 實例的合約地址

2. 在 Scaffold-eth-2 中設置外部合約
   - 前往 `packages/nextjs/scaffold.config.ts` 確認或修改配置:
     ```typescript
     export const scaffoldConfig = {
       targetNetwork: chains.sepolia,
       // ... 其他配置
     };
     ```
   - 在 Debug Contracts 頁面，點擊 "Add Contract to Debug" 按鈕
   - 輸入合約名稱 "NaughtCoin"，合約地址（從 Ethernaut 獲取），選擇適當的 ABI

3. 執行攻擊
   - 在 Debug Contracts 頁面中找到 NaughtCoin 合約
   - 使用 `balanceOf` 函數查看您的代幣餘額
   - 使用 `approve` 函數：
     - address (spender): 輸入您的另一個帳戶地址
     - amount: 輸入您擁有的全部代幣數量
   - 切換到您的第二個帳戶
   - 使用 `transferFrom` 函數：
     - from: 輸入您的第一個帳戶地址（玩家地址）
     - to: 輸入您的第二個帳戶地址
     - amount: 輸入您要轉移的全部代幣數量
   
4. 驗證成功
   - 使用 `balanceOf` 檢查第一個帳戶餘額，應為 0
   - 使用 `balanceOf` 檢查第二個帳戶餘額，應該有全部代幣
   - 返回 Ethernaut 提交實例以完成挑戰

## 學習要點

- ERC20 標準提供多種代幣轉移機制，需要全面保護才能實現有效的限制
- 繼承自標準合約時，重要的是要理解並正確覆寫所有相關功能
- 在安全審計中，應檢查所有可能的資產轉移途徑

## 運行專案

```bash
# 安裝依賴
yarn install

# 啟動本地鏈
yarn chain

# 在另一個終端部署合約
yarn deploy

# 啟動前端
yarn start
```

瀏覽器訪問: http://localhost:3000
