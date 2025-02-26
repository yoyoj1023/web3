# web3
web3 練習

helloworldV3 使用方法

_1.安裝node.js  npm hardhat。
_2.在根目錄創建 hardhat項目軟體框架(npx hardhat)。
_3.創建HelloWorld.sol的Solidity合約，放置於 contracts/
_4.編譯.sol (npx hardhat compile)，之後會產出可執行EVM機器碼於 古代遺物/
_5.在 scripts/ 創建 deploy.js 部屬合約的腳本
_6.啟動 hardhat 本地以太測試網節點 (npx hardhat node)
_7.執行部屬腳本於本地測試網路 (npx hardhat run scripts/deploy.js --network localhost)
_8.查看部屬的合約地址(於部屬腳本內getAddress())
_9.啟動 Hardhat Console與合約互動(npx hardhat console --network localhost) 或是創建 scripts/interact.js 與合約互動，取出合約上的 hello world 信息