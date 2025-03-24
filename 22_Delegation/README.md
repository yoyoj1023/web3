# 06_Delegation Project

一、挑戰攻破 Ethernaut CTF 第 6 題： Delegate

- 勝利條件：取得合約實例的所有權
- 知識儲備：函數選擇器、delegatecall()與合約狀態、全域變數(msg.date)、 keccak256(toUtf8Bytes(sig))、交易的結構

二、解題思路：

1. 算出 pwn() 的函數選擇器的值(函數簽名的 Keccak-256 的前四個位元組)

2. 當 EVM 收到一個函數調用時，它會使用函數選擇器來查找要執行的函數

三、Solidity 補充：

- ``` .delegatecall() ``` 是非常危險的函數，它會呼叫外部函數的執行內容，但卻是改變本合約的狀態。