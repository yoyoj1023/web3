# 12_Privacy Project

### 一、挑戰攻破 Ethernaut CTF 第 12 題： Privacy

- 勝利條件：解開鎖
- 知識儲備：storageSlot、storage packing

### 二、解題思路：

1. 使用 getStorage 調查插槽，找到密鑰，再進行資料處理

### 三、Solidity：

```solidity
bytes32[3] private data;

function unlock(bytes16 _key) public {
        require(_key == bytes16(data[2]));
        locked = false;
    }
```

1. 在強制轉型的時候，Solidity 採用右側填充0、或右側截斷的方式來處理資料