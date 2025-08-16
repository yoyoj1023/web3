# IPFS 留言板範例專案

這是一個展示 IPFS 檔案結構的範例專案。

## 檔案結構

```
folder-example/
├── config/           # 配置檔案
│   ├── app-config.json
│   └── theme-config.json
├── messages/         # 訊息範例
│   ├── welcome.txt
│   └── sample-posts.json
└── docs/            # 文件
    └── README.md
```

## 使用說明

1. 將整個 `folder-example` 資料夾上傳到 IPFS
2. 取得根目錄的 CID
3. 透過 `/ipfs/CID/config/app-config.json` 存取特定檔案
4. 體驗 IPFS 的目錄瀏覽功能

## 學習重點

- IPFS 如何處理目錄結構
- 如何存取目錄中的特定檔案
- 目錄和檔案的 CID 關係
