# 04_FirstToken Project

一、撰寫一個基於 ERC20 的代幣合約，可以選擇手動實現 ERC20 標準，或是直接繼承 ERC20

```
1.部屬在測試網上後，會有代幣合約地址。

2.之後打開狐狸錢包，選擇測試網，之後可以導入該代幣地址就能閱覽使用該代幣了
```

二、Solidity 語法學習：mapping

在 Solidity 中，mapping 是一種資料結構，用來將唯一的鍵（key）對應到特定的值（value）。它類似於其他編程語言中的哈希表或字典。

```solidity

pragma solidity ^0.8.0;

contract SimpleMapping {
    // 定義一個 mapping，將地址對應到一個 uint 值
    mapping(address => uint256) public balances;

    // 設置地址的餘額
    function setBalance(address _address, uint256 _balance) public {
        balances[_address] = _balance;
    }

    // 獲取地址的餘額
    function getBalance(address _address) public view returns (uint256) {
        return balances[_address];
    }
}
```
