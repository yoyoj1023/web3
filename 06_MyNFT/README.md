# 06_MyNFT Project

一、學習 ERC721 標準來實作 NFT

二、NatSpec（Ethereum Natural Specification Format）它用來為合約、函數和變數提供文檔註釋。
```
@title：合約或函數的標題。
@notice：對合約或函數的簡要描述。
@dev：對開發者的詳細描述，通常用於描述內部邏輯或實現細節。
@param：描述函數參數，後面接參數名稱和描述。
@return：描述函數返回值，後面接返回值的描述。
@inheritdoc：從基礎合約繼承文檔
```

三、IPFS（InterPlanetary File System，星際文件系統）是一種去中心化的文件存儲和共享協議，旨在創建一個更快、更安全、更開放的網絡。IPFS 的設計確實具有抗審查性，因為文件是分佈式存儲的，沒有單一的控制點可以刪除或屏蔽文件。

```
1.先選擇一個 IPFS 服務供應商，將圖片或影片與 JSON 上傳，之後會取得 URI
2.將 URI 傳入到合約(ERC721)，生成 NFT

補充疑問：
1.作者仍有可能移除檔案(或叫unpin)，使得NFT圖片連結失效成為空殼NFT。
2.若考慮On-chain storage，則要付出高昂的儲存成本限制。

```

四、openzeppelin

可參考：https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master
