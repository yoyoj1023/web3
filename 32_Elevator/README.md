# 11_Elevator Project

### 一、挑戰攻破 Ethernaut CTF 第 11 題： Elevator

- 勝利條件：到達電梯頂樓
- 知識儲備：gas精算、gasleft()、view、變更合約狀態

### 二、解題思路：

1. 透過一個外部合約覆寫 isLastFloor(uint256 _floor) 

2. 根據電梯的在 goTo() 內呼叫 isLastFloor() 次數變更外部合約狀態，使得每次呼叫回傳的 bool 值不同。

3. 另一種作法是，透過 gasleft() 精算剩餘的 gas 達到條件時，觸發回傳不同的 bool 值。

### 三、Solidity：

```solidity
// 不要相信呼叫外部合約函數的結果是 1-1 且 onto 的
    if (!building.isLastFloor(_floor)) {
        floor = _floor;
        top = building.isLastFloor(floor);
    }
```

1. 不要相信呼叫外部合約函數的結果是 1-1 且 onto 的