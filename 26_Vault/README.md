# 08_Vault Project

### 一、挑戰攻破 Ethernaut CTF 第 8 題： Vault

- 勝利條件：打開金庫
- 知識儲備：變數宣告的公有屬性、私有屬性，byte32型別變數、storage slot

### 二、解題思路：

1. 私有變數 ``` private ``` 關鍵字，不代表徹底保密。存在區塊鏈的變數是徹底公開的

2. 可以透過調查 storage solt 位置與 getStorage() 來查詢變數內容

3. 看了合約的變數宣告順序，先宣告的變數 locked 會放在 slot0，password 變數會放在 slot1

4. 呼叫 hre.ethers.provider.getStorage() 查詢

5. 值得注意的是 getStorage() 舊稱為 getStorageAt() 現已被移除

6. ether.js 更多的函數使用說明，可參考 ether.js 官方 [github庫](https://github.com/ethers-io/ethers.js/blob/main/src.ts/providers/provider.ts) 

### 三、Solidity 補充：

- ``` private ``` 僅代表在編程時，不允許其他外部合約調用。不等於保密，若要保密需採密碼學。