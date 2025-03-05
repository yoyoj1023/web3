# 04_FirstToken Project

一、撰寫一個基於 ERC20 的代幣合約，可以選擇手動實現 ERC20 標準，或是直接繼承 ERC20

```
1.部屬在測試網上後，會有代幣合約地址。

2.之後打開狐狸錢包，選擇測試網，之後可以導入該代幣地址就能閱覽使用該代幣了
```

二、Solidity 語法補充

關於 mapping

```solidity
// 儲存每個地址的餘額
mapping(address => uint256) public balanceOf;
// 儲存授權資訊：某地址允許另一地址使用的代幣數量
mapping(address => mapping(address => uint256)) public allowance;
```

```
1.未完待續...
```
