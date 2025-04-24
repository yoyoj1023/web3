# 16_SimpleProxy Project

一、學習簡易版可升級合約的代理模式：

```
1.代理合約：負責存儲數據並將調用轉發到當前的邏輯合約。它是用戶交互的入口，地址固定。
2.邏輯合約：包含具體的業務邏輯，可以被替換或升級，地址會隨升級而改變。
3.分離存儲與邏輯：代理合約持有狀態（數據），而邏輯合約定義行為。通過這種方式，即使邏輯合約更新，數據仍然保留在代理合約中。
4.利用代理合約的「委託調用」（delegatecall）機制，將執行邏輯委託給當前的邏輯合約，同時保持代理合約的存儲不變。
```

二、Fallback：

```
1.Solidity 0.6.0 版本之後，fallback 函數被拆分為 receive() 函數和 fallback() 函數
2.fallbck() 函數用於處理所有的調用，包括以太幣轉發
3.receive() 函數用於接收以太幣轉帳，不能接收調用數據
```

三、操作方式：

```
1.先部署邏輯合約（例如 LogicContractV1）。
2.然後部署代理合約，並在構造函數中傳入 LogicContractV1 的地址。
3.用戶通過代理合約的地址與合約交互，而不是直接調用邏輯合約。
4.當需要升級時，調用代理合約的 upgrade 函數，將 implementation 更新為新地址。
```

四、延伸討論與注意事項：
```
1.存儲衝突（Storage Collision）：
邏輯合約升級時，必須保持變量的順序和類型與舊版本一致，否則可能覆蓋代理合約中的數據。
解決方法：使用「存儲間隙」（Storage Gap）或 OpenZeppelin 的 Initializable 合約。

2.安全性：
確保只有授權的管理員可以調用 upgrade。
使用成熟的庫（如 OpenZeppelin 的 Proxy 和 UpgradeableProxy）來避免手動實現中的漏洞。

3.透明代理（Transparent Proxy）：
為避免管理員與邏輯合約的調用衝突，可以採用透明代理模式
```

五、OpenZeppelin Upgrades ：提供安全的代理模式實現，包括透明代理和 UUPS（Universal Upgradeable Proxy Standard）。

六、Solidity 語法補充：
```solidity
fallback() external payable {
    address impl = implementation;
    require(impl != address(0), "Implementation not set");

    assembly {
        // 將調用數據複製到內存
        let ptr := mload(0x40) // 從自由內存指針獲取當前可用內存地址
        calldatacopy(ptr, 0, calldatasize()) // 將調用數據複製到內存

        // 使用 delegatecall 執行邏輯合約的代碼
        // 存儲的變量（如 value）會保存在代理合約中
        let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
        let size := returndatasize()  // 獲取返回數據大小
        returndatacopy(ptr, 0, size)  // 將返回數據複製到內存

        // 根據執行結果返回或回退
        switch result
        case 0 { revert(ptr, size) }
        default { return(ptr, size) }
    }
}
```

assembly {} 區域內可使用 EVM 操作碼，很像組合語言：

```
算術運算：
1. := 是是彙編中的賦值符號。
2. add(x, y) 等同 x + y
3. mul(x, y) 等同 x * y
4. sub(x, y) 等同 x - y

堆棧操作：
5.pop：從堆棧頂部移除一個值。
6.mload(ptr)：從內存地址 ptr 讀取 32 字節。
7.mstore(ptr, value)：將值寫入內存地址 ptr。

存儲操作：
8.sload(slot)：從存儲槽 slot 讀取值。
9.sstore(slot, value)：將值寫入存儲槽 slot。

調用相關：
10.delegatecall(gas, addr, in, insize, out, outsize)：執行委託調用。
11.calldatacopy(ptr, offset, size)：將調用數據複製到內存。
```

警告：
```
1.EVM 操作碼可能隨以太坊升級而改變，需確保代碼與目標網絡兼容。
2.assembly 直接操作 EVM，錯誤可能導致合約行為異常或資金損失。是高危險操作
```