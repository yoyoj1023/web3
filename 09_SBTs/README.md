# 09_SBTS Project

一、學習什麼是靈魂代幣： 
```
1.不可轉讓
2.可做代表個人身份之應用：如信用評分、履歷、投票、獎狀...等
```

二、Ownable 庫：

```
```

三、Solidity 語法說明： 關於 函數修飾器 (function modifier)

```solidity
function mint(address to) public onlyOwner {
        require(balanceOf(to) == 0, "Address already owns a token");
        _tokenIdCounter++;
        _safeMint(to, _tokenIdCounter);
    }
```

```solidity
modifier onlyOwner() {
        _checkOwner();
        _;
}

function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
}
```

```
1.在 mint 函式執行前，先呼叫修飾器 onlyOwner() 的 _checkOwner();
2._; 上部分是指函式執行前先執行的內容，如果_;下方有程式是指 mint 函式執行完後要執行的內容
```
