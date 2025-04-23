# Ethernaut #19 - Recovery

這是 Ethernaut 遊戲中的第 19 關「Recovery」挑戰的解決方案。

## 關卡說明

在這個關卡中，我們需要恢復一個丟失的合約地址。有人使用 `Recovery` 合約創建了一個 `SimpleToken` 代幣，並向其中發送了一些以太幣，但是不記得合約的地址了。我們需要找回這個合約並取回其中的資金。

## 攻略要點

### 問題核心
1. 找到丟失的 `SimpleToken` 合約地址
2. 利用合約中的 `destroy` 函數將資金取回

### 解題思路

#### 1. 尋找合約地址
以太坊上的合約地址是確定性的，由創建者地址和 nonce 計算得出。當一個合約創建另一個合約時，新合約的地址是由創建合約的地址和其 nonce 決定的。

計算合約地址的公式：
```
address = rightmost_20_bytes(keccak256(RLP(creator_address, creator_nonce)))
```

對於 `SimpleToken` 合約，它是由 `Recovery` 合約通過 `generateToken` 函數創建的，因此可以根據 `Recovery` 合約地址和 nonce 計算出 `SimpleToken` 的地址。

#### 2. 執行 destroy 函數
一旦找到了 `SimpleToken` 的地址，可以調用其 `destroy` 函數，該函數使用 `selfdestruct` 將合約內的所有資金發送到指定地址。

```solidity
function destroy(address payable _to) public {
    selfdestruct(_to);
}
```

### 實現步驟
1. 使用 `scripts/interact.ts` 腳本，提供正確的 `SimpleToken` 地址
2. 調用 `destroy` 函數將資金轉移到我們的地址
3. 驗證 `SimpleToken` 合約餘額為 0，表示攻擊成功

## 學習心得
1. 合約地址是確定性的，可以通過創建者地址和 nonce 計算得出
2. `selfdestruct` 操作會銷毀合約並將資金發送至指定地址
3. 即使忘記了合約地址，只要知道創建合約的交易，仍然可以找回合約

## 預防措施
1. 不要依賴 `selfdestruct` 作為合約中的功能，除非確實需要
2. 為關鍵操作添加適當的權限控制
3. 妥善保管合約地址和相關信息，避免丟失
