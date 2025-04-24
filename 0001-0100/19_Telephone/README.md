# 19_Telephone Project

一、挑戰攻破 Ethernaut CTF 第 4 題： Telephone

 - 勝利條件：取得合約所有權
 - 知識儲備：Solidity 全域變數、Solidity 的介面與強制轉型與調用外部合約函數的技巧

二、解題思路：

1. 理解 ```tx.origin``` 與 ```msg.sender``` 的差異。準備一個合約來與此合約互動
2. 撰寫 TelephoneCaller 合約，來調用 Telephone changeOwner()

三、Solidity 常見全域變數簡介：

區塊和交易屬性：
- blockhash(uint blockNumber) returns (bytes32): 指定區塊的雜湊值，僅適用於 256 個最新的區塊，不包括當前區塊。如果請求的區塊號碼超出這個範圍，則返回 0。
- block.chainid returns (uint): 當前鏈的 ID。
- block.coinbase returns (address payable): 當前區塊礦工的地址。
- block.difficulty returns (uint): 當前區塊的難度。
- block.gaslimit returns (uint): 當前區塊的 gas 上限。
- block.number returns (uint): 當前區塊的區塊號碼。
- block.timestamp returns (uint): 當前區塊的時間戳，表示為自 Unix epoch (1970-01-01 00:00:00 UTC) 以來的秒數。
- gasleft() returns (uint256): 剩餘的 gas。
- msg.data returns (bytes): 完整的 calldata。
- msg.sender returns (address payable): 交易的發送者地址。
- msg.sig returns (bytes4): calldata 的前四個位元組（也就是函式識別碼）。
- msg.value returns (uint): 隨交易發送的 wei 的數量。
- tx.gasprice returns (uint): 交易的 gas 價格。
- tx.origin returns (address payable): 交易的原始發送者地址（完整呼叫鏈的起點）。

合約相關：
 - this returns (address): 當前合約的地址。
 - selfdestruct(address payable recipient): 銷毀當前合約，並將剩餘的以太幣發送到指定的地址。

數學和密碼學函數：
- abi.decode(bytes memory encodedData, (...)) returns (...): 解碼 ABI 編碼的資料。
- abi.encode(...) returns (bytes): ABI 編碼給定的參數。
- abi.encodePacked(...) returns (bytes): 對給定的參數執行緊密打包編碼。
- abi.encodeWithSelector(bytes4 selector, ...) returns (bytes): ABI 編碼給定的參數，並加上函式選擇器。
- abi.encodeWithSignature(string signature, ...) returns (bytes): ABI 編碼給定的參數，並加上函式簽名。
- bytes.concat(...) returns (bytes): 將可變數量的位元組陣列連接成一個位元組陣列。
- string.concat(...) returns (string): 將可變數量的字串連接成一個字串。
- block.basefee returns (uint): 當前區塊的基本費用（EIP-3198 和 EIP-1559）。
- block.prevrandao returns (uint): 由信標鏈提供的隨機數（EIP-4399）。
- keccak256(bytes memory) returns (bytes32): 計算輸入的 Keccak-256 雜湊值。
- ripemd160(bytes memory) returns (bytes20): 計算輸入的 RIPEMD-160 雜湊值。
- sha256(bytes memory) returns (bytes32): 計算輸入的 SHA-256 雜湊值。
- ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address): 從橢圓曲線簽名中恢復與公鑰相關的地址。

其他：
- assert(bool condition): 如果條件為 false，則中止執行並回退狀態變更。用於檢查內部錯誤。
- require(bool condition, string memory message): 如果條件為 false，則中止執行並回退狀態變更。用於檢查輸入或外部元件中的錯誤。
- revert(string memory message): 中止執行並回退狀態變更，並提供錯誤訊息。
- revert(): 中止執行並回退狀態變更。
- block.timestamp: 返回當前區塊的時間戳，以 Unix 時間（自 1970 年 1 月 1 日午夜以來經過的秒數）表示。
- type(T).name: 返回類型 T 的字串名稱。
- type(T).creationCode: 返回類型 T 的建立程式碼的位元組陣列。僅適用於合約類型。
- type(T).runtimeCode: 返回類型 T 的執行時程式碼的位元組陣列。僅適用於合約類型。