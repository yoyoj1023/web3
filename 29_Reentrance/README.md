# 10_Reentracnce Project

### 一、挑戰攻破 Ethernaut CTF 第 10 題： Reentracnce

- 勝利條件：提領合約的所有代幣
- 知識儲備：重入攻擊、Fallback、合約函數的單執行序的執行方式

### 二、解題思路：

1. 透過一個外部合約呼叫 donate() 更新狀態。

2. 在外部合約的 receive() 內，再次呼叫 withdraw() 觸發重入攻擊

3. 在外部合約呼叫 withdraw() 觸發提領，並且在 Reentracnce 更新餘額狀態之前，由於觸發了外部合約的 receive() 內，再次呼叫 withdraw() 觸發重入攻擊，再次提領

### 三、重入攻擊防護：

```solidity
function withdraw(uint256 _amount) public {
    if (balances[msg.sender] >= _amount) {
        (bool result,) = msg.sender.call{value: _amount}("");
        if (result) {
            _amount;
        }
        balances[msg.sender] -= _amount;
    }
}
```

#### 1. 先變更狀態再執行提款邏輯：

```solidity
function withdraw(uint256 _amount) public {
    if (balances[msg.sender] >= _amount) {
        balances[msg.sender] -= _amount;
        (bool result,) = msg.sender.call{value: _amount}("");
        if (result) {
            _amount;
        }
    }
}
```

#### 2. 重入防護鎖：

```solidity
bool private  _locked = false;

function withdraw(uint256 _amount) public {
    require(_locked == false, unicode"偵測到重入攻擊");
    _locked = true;
    if (balances[msg.sender] >= _amount) {
        balances[msg.sender] -= _amount;
        (bool result,) = msg.sender.call{value: _amount}("");
        if (result) {
            _amount;
        }
    }
    _locked = false;
}
```

#### 3. 使用 OpenZeppelin 的 ReentrancyGuard 庫：

https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/ReentrancyGuard.sol