# Sepolia Project

將展示如何將已寫好的合約部屬在 Sepolia 測試網上

採用 .env 檔案的方法保護敏感訊息

```
1.免費 Sepolia 代幣水龍頭
https://cloud.google.com/application/web3/faucet

2.可以註冊https://dashboard.alchemy.com/
這樣就不需要親自獨立架設以太坊節點，也能提交合約部屬在以太鏈上

3.導出狐狸錢包的私鑰

4.在項目根目錄創建 .env 檔，並寫入私鑰與SEPOLIA_RPC_URL的API金鑰

5.執行 npm install dotenv ，安裝 dotenv 包，確保 package.json 檔中有添加依賴 dotenv 的描述

6.變更 hardhat.config.js 添加 require("dotenv").config(); 導入套件。並在 module.exports，新增 networks 添加測試網 sepolia 的 url  與 帳號。

7.部屬腳本不用更動，編譯 npx hardhat compile，之後執行命令 npx hardhat run scripts/deploy.js --network sepolia 

8.等待部屬測試網，與顯示部屬後的合約地址

9.與該合約互動

```

```
補充：導出 Metamask 私鑰
1.點擊右上角的「三點」菜單（⋮）。
2.選擇「帳戶詳細信息」（Account Details）。
3.在「帳戶詳細信息」窗口中，點擊「導出私鑰」（Export Private Key）。

4.部屬合約到測試網，花了我狐狸錢包的0.0021 SepoliaETH

```