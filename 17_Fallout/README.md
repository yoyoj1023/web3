# 17_Fallout Project

一、挑戰攻破 Ethernaut CTF 第2題： Fallout

 - 勝利條件：成為合約所有者
 - 知識儲備：建構子

二、解題思路：

1. 眼睛放大看清楚，直接呼叫 ```Fal1out()``` 就變成 owner 了

三、Solidity語法補充：關於 `view`

```solidity
function allocatorBalance(address allocator) public view returns (uint256) {
        return allocations[allocator];
    }
```

 `view` 用於聲明一個函數不會修改合約的狀態變量，也不能發出事件，僅能是只讀函數。

 用途：

 1. 不修改狀態： view 函數保證不會更改合約的任何狀態變量。這對於讀取合約數據而不影響其狀態非常重要。

 2. Gas 消耗： 調用 view 函數通常不消耗 gas，除非它們是從另一個需要消耗 gas 的合約函數調用的。這是因為它們可以在本地節點上執行，而無需在區塊鏈上執行交易。

 3. 宣告方式： 你可以在函數聲明中使用 view 關鍵字，例如：function getData() public view returns (uint) { ... }。

 4. 限制： view 函數不能調用任何非 `view` 或 `pure` 的函數，因為這些函數可能會修改狀態。

 5. 使用場景： 常見的使用場景包括：

    - 讀取狀態變量的值。
    - 執行計算並返回結果，而不更改合約狀態。
    - 查詢合約的某些屬性。