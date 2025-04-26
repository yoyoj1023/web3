# Ethernaut Challenge - Magic Number 解題攻略

## 關卡目標

這個關卡要求我們創建一個微型合約（Solver），當呼叫 `whatIsTheMeaningOfLife()` 函數時返回數字 42，並且合約大小不超過 10 個操作碼（opcodes）。

## 解題關鍵

1. **理解底層 EVM 運作**: 這個挑戰要求我們深入理解 EVM（以太坊虛擬機）的底層運作原理，必須使用原始的 EVM 字節碼來創建合約，而不是使用 Solidity 或其他高階語言。
2. **合約創建字節碼**: 我們需要了解合約創建過程中的兩個主要部分：
   - 初始化代碼：用於合約部署期間執行
   - 運行時代碼：實際存儲在區塊鏈上並響應函數調用的代碼

## 攻略步驟

### 1. 分析 MagicNum 合約

```solidity
contract MagicNum {
    address public solver;

    function setSolver(address _solver) public {
        solver = _solver;
    }
}
```

這個合約只有一個功能：儲存 solver 合約的地址。我們需要創建一個能返回 42 的微型合約，並將其地址設置為 solver。

### 2. 撰寫運行時字節碼

運行時代碼需要完成的操作：
- 將值 42（十六進制 0x2a）放入堆疊
- 將該值存入記憶體
- 返回記憶體中的值

對應的操作碼（opcode）：
```
PUSH1 0x2a  // 將 42 壓入堆疊
PUSH1 0x00  // 將 0 壓入堆疊
MSTORE      // 將 42 存入記憶體位置 0
PUSH1 0x20  // 將 32（十六進制 0x20）壓入堆疊（32 位元組的數據長度）
PUSH1 0x00  // 將 0 壓入堆疊（記憶體起始位置）
RETURN      // 返回從位置 0 開始的 32 位元組數據
```

轉換為字節碼：`602a60005260206000f3`（總共 10 位元組，正好符合要求）

### 3. 撰寫初始化字節碼

初始化代碼需要執行以下操作：
- 將運行時代碼複製到記憶體
- 返回運行時代碼給 EVM

對應的操作碼：
```
PUSH10 0x602a60005260206000f3  // 將運行時代碼壓入堆疊
PUSH1 0x00                     // 將 0 壓入堆疊
MSTORE                         // 將運行時代碼存入記憶體位置 0
PUSH1 0x0a                     // 將 10 壓入堆疊（運行時代碼的長度）
PUSH1 0x16                     // 將 22 壓入堆疊（運行時代碼在記憶體中的起始位置）
RETURN                         // 返回運行時代碼
```

完整的部署字節碼：`69602a60005260206000f3600052600a6016f3`

### 4. 部署合約

使用 Web3.js 部署合約：

```javascript
const tx = await web3.eth.sendTransaction({
    from: player,
    data: '0x69602a60005260206000f3600052600a6016f3'
});

const solverAddress = tx.contractAddress;
```

### 5. 設置 Solver

```javascript
await contract.setSolver(solverAddress);
```

## 解題心得

這個挑戰讓我深入了解了 EVM 的底層運作機制，特別是合約的部署過程和操作碼如何轉換為字節碼。這種理解對於優化智能合約或者進行安全審計時非常有用。在 Web3 開發中，即使大多數時候我們使用高級語言如 Solidity，但理解底層原理有助於編寫更高效、更安全的代碼。

## 參考資源

- [EVM Opcodes 參考](https://www.evm.codes/)
- [Ethereum 黃皮書](https://ethereum.github.io/yellowpaper/paper.pdf)
- [Understanding Ethereum Smart Contract Storage](https://programtheblockchain.com/posts/2018/03/09/understanding-ethereum-smart-contract-storage/)
