# 15_Fallback Project

一、挑戰攻破 Ethernaut CTF 第1題： Fallback

```
1.攻破勝利條件：獲得這個合約的所有權、把合約的餘額歸零
2.關鍵技巧：透過與 ABI 互動發送 ether、如何在 ABI 之外發送 ether
3.知識儲備：轉換 wei/ether 單位、fallback 方法
```

二、答案與心得：

執行環境
```
1.我變更了 package.json 配置，添加 "type": "module", 轉變成 ES Module
2.我變更了 hardhat.config.cjs 副檔名，因為他是 CommonJS (CJS) 語法
3.我在 hardhat.config.cjs 添加 timeout: 60000, 因為與合約互動反應時間總是比較長
4.我在 hardhat.config.cjs OP_SEPOLIA_RPC_URL_API_KEY，因為 L2 測試網較快
5.Ethernaut CTF 支援 OP sepolia 網路，不僅反應較快，費用也比較少
6.建議用 私有的測試節點 PRC，因為公有網路例如 "https://sepolia.optimism.io" 會限制一些功能
7.建議用 hardhat ether.js 創建實例、發送、呼叫，不僅簡潔可讀性高，又能繞開一些限制
```

攻擊腳本：scripts/interct_hre_etherjs.js
```
1.題目合約 Fallback.sol 要先經過編譯，取得 Fallback.json
2.從 Fallback.json 複製 abi 的標籤敘述，放到腳本內保存，用於創建實例
```


三、Solidity 語法說明： payable

```
1.在 Solidity 中，payable 是一個修飾符（modifier），用來指示函數或地址可以接收以太幣（Ether）。
2.payable 可以應用在以下兩種情境：
```

1.在函數上使用

```solidity
function contribute() public payable {
    require(msg.value < 0.001 ether);
    contributions[msg.sender] += msg.value;
    if (contributions[msg.sender] > contributions[owner]) {
        owner = msg.sender;
    }
}
```

```
1.這裡 payable 修飾符允許 contribute() 接收以太幣。
2.msg.value 表示呼叫者傳送的以太幣數量（以 wei 為單位）。
3.函數內的邏輯要求傳送的以太幣少於 0.001 ether，並將該數量加到 contributions 映射中。
```

```solidity
receive() external payable {
    require(msg.value > 0 && contributions[msg.sender] > 0);
    owner = msg.sender;
}
```

```
1.receive() 是一個特殊的函數，當合約接收到以太幣且未指定調用的函數時，會自動觸發此函數。
也就是說，如果直接粗暴的把錢打到合約地址，就會觸發 receive()
反之，調用  contribute() 的方式發送錢，則不會觸發
這個合約的 contribute() 是標記 payable 的

2.它被標記為 external payable，表示合約可以直接接收以太幣（例如通過純粹的轉帳交易）。
3.條件要求傳送的以太幣大於 0，且呼叫者的貢獻紀錄必須大於 0。
```

2.在地址上使用

當一個地址被標記為 payable 時，該地址可以接收以太幣。這通常用於將以太幣從合約傳送到某個地址。

合約中的例子：
在 withdraw() 函數中：

```solidity
function withdraw() public onlyOwner {
    payable(owner).transfer(address(this).balance);
}
```

```
1.payable(owner) 將 owner 地址轉換為 payable 類型。
2.transfer() 是 Solidity 中用來傳送以太幣的內建函數，只有 payable 類型的地址才能使用它。
3.這裡的邏輯是將此合約的全部餘額（address(this).balance）傳送給 owner 地址。
```

payable 的重要性
```
1.接收以太幣：如果一個函數沒有標記為 payable，則試圖向它傳送以太幣會導致交易失敗。例如，若 contribute() 移除 payable，則無法接收以太幣。
2.傳送以太幣：只有 payable 地址可以使用 .transfer()、.send() 或 .call() 等方法傳送以太幣。
3.靈活性：payable 提供了在合約中處理以太幣交易的基礎，特別是在眾籌、支付或轉帳等場景中。
```