# 08_UnitTesting Project

一、學習如何對合約進行單元測試： 
```
1.在 hardhat 框架中，單元測試腳本可以放置於 test 目錄下
2.執行命令 npx hardhat test 可執行單元測試
3.執行命令 npx hardhat coverage 可生成測試報告
4.在使用 npx hardhat test 時，會自動先對合約進行編譯。因此不須用測試事先再下 npx hardhat compile
```

二、chai 提供了單元測試所需要的斷言庫：
```javascript
const { expect } = require("chai");
```

