# 12_HelloOptimism Project

一、學習以太坊L2網路的基礎： 
```
1.L2擴展解決方案，費用更低，交易更快。
2.L2合約允許與L1合約互動，可將L1部分合約的邏輯搬遷到L2執行，以節省氣費。
3.L2支援預言機的功能，可透過預言機獲取鏈下真實數據。
4.知名L2網路有：Optimism、Arbitrum、zkSync (ZK-Rollup)
5.可將L1代幣透過跨鏈橋轉移到L2。
```

二、在狐狸錢包添加 Optimism 主網與測試網：
```
1.Select a network
2.Add a custom network
3.輸入網路資訊： 輸入以下 OP Sepolia 測試網路的詳細資訊：
  網路名稱（Network Name）： OP Sepolia Testnet
  新增 RPC URL（New RPC URL）： https://sepolia.optimism.io
  鏈 ID（Chain ID）： 11155420
  貨幣符號（Currency symbol）： ETH
  區塊鏈瀏覽器網址（Block explorer URL）： https://sepolia.optimism.etherscan.io
4.儲存
```

三、Optimism 官方橋接網站：https://app.optimism.io/bridge

四、Optimism 測試代幣水龍頭網站：https://console.optimism.io/faucet

五、等 Optimism (Optimistic Rollups) 研究一段時間後，可以深入研究另一個 L2 解決方案： ZK-Rollups，代表項目：zkSync、StarkNet。未來潛力巨大。

六、設定 Hardhat 的 Optimism Sepolia 部署環境：

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    optimismSepolia: {
      url: "https://sepolia.optimism.io",  //可換成 Alchemy 或 Infura 的 RPC URL
      accounts: [process.env.PRIVATE_KEY]  // 你的錢包私鑰
    }
  }
};
```

七、Hardhat 部屬 Optimism Sepolia 命令：

```sh
npx hardhat run scripts/deploy.js --network optimismSepolia
```