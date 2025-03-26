# 09_King Project

### 一、挑戰攻破 Ethernaut CTF 第 9 題： King

- 勝利條件：成為 King，並且維持 King，在提交實例時關卡會試圖奪取 King，需要守住。
- 知識儲備：合約轉帳函數類型與限制，Fallback，Force，gas，變更狀態的 gas 消耗，重入攻擊

### 二、解題思路：

1. 透過一個合約轉發代幣給 King 成為 king。同時在合約不定義 ```receive()```

2. 在 King 發送代幣給前任國王後，如果下一個挑戰者試圖成為新國王，會因為現任國王的合約沒有定義 ```receive()```，導致轉帳失敗，交易回滾。

3. 往後再也沒有人能夠成為新國王，形同永久鎖住。

4. 此為阻絕服務攻擊，經典真實案例： King of the Ether 和 King of the Ether Postmortem

### 三、Solidity 補充：

- 在 KingAttacker 使用轉帳函數時需要注意以下方法特性： transfer(數量)、send(數量)、call{value: 數量}("")、selfdestruct(對象地址)

- 當 ```transfer``` 被呼叫時，它只分配 2300 gas 給受款者的 fallback 或 receive 函數，這個數值足夠執行簡單的操作（例如記錄事件 ```emit Event()```），但不夠修改合約的存儲（storage）或執行更複雜的邏輯。例如： ```king = msg.sender;``` 這個操作會失敗。

- 存儲（storage）大概需要 20,000 gas 這麼多。

- transfer 內部固定限制提供 2300 gas，目的是防止受款者執行過多邏輯，減少重入攻擊風險。

- ```call{value: amount}("")``` 可自定義 gas 限制，以繞開 2300 gas 限制。

- ```selfdestruct()``` 發送 ETH 時，這種轉移是在 EVM（以太坊虛擬機）的較低層次完成的，不會觸發目標地址的 ```receive()``` 函數。


| 轉帳方式 | 說明 | Gas限制 |
| :------: | :------: | :------: |
| ```transfer``` | 安全轉帳，失敗會自動 revert | 2300 gas |
| ```send``` | 返回 true/false，不會自動 revert | 2300 gas |
| ```call``` | 自由度高，可自定義 gas 限制 | 無固定限制 |


### 四、其他：

 - 可在hardhat.config.cjs添加： require("@nomicfoundation/hardhat-ethers");

 - 讓 VScode 能查詢 hardhat-ethers 包內的所有函數的定義