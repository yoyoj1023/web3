# 07_Force Project

一、挑戰攻破 Ethernaut CTF 第 7 題： Force

- 勝利條件：使合約的餘額大於 0
- 知識儲備：Fallback、selfdestruct()、payable

二、解題思路：

1. 透過自毀函數 selfdestruct() 強制將錢傳送到指定目標合約地址，即便目標合約沒有定義 receive()


三、Solidity 補充：

- 目前 selfdestrcut() 已被棄用。不建議在新合約部屬中使用。

- 在坎昆升級後，底層機器碼已不再刪除與帳戶相關的代碼和數據。僅將其以太幣轉移給受益人。

- 更多延伸說明請參見 EIP-6780
