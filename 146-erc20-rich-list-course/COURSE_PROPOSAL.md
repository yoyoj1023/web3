好的，這是一份為您設計的課程企劃書，內容涵蓋了您提出的所有要求，並以 `scaffold-alchemy` 框架為核心，旨在提供一個完整且實用的 Web3 開發學習路徑。

---

### **課程名稱：使用 Scaffold-Alchemy 打造 ERC20 代幣富豪榜應用**

**課程簡介：**

本課程將帶領學員從零開始，使用當前熱門的 Web3 開發框架 `scaffold-alchemy`，親手部屬一個 ERC20 代幣至 Optimism Sepolia 測試網路。更進一步，我們將學習如何利用 Alchemy 提供的強大 API，打造一個動態前端應用程式，用以查詢並展示任何 ERC20 代幣的富豪榜（Top Holders）。課程將著重於實踐 `scaffold-alchemy` 的核心理念，大量運用其內建的 UI 元件與 Hooks，讓學員體驗閃電般快速的迭代開發流程。

**學習目標：**

完成本課程後，學員將能夠：
*   獨立設定並運行 `scaffold-alchemy` 開發環境。
*   編寫並使用 Hardhat 將 ERC20 智能合約部屬到 Layer 2 網路 (Optimism Sepolia)。
*   熟悉 `scaffold-alchemy` 的專案結構，並能客製化其前端介面。
*   整合 Alchemy 的 Token API，高效獲取鏈上代幣持有者數據。
*   運用 `scaffold-alchemy` 內建的 React Hooks 進行鏈上數據的讀取與狀態管理。
*   使用內建的 UI 元件庫，快速建構美觀且功能完善的前端頁面。
*   在前端實現數據分頁功能，以優化大量數據的展示體驗。

**目標受眾：**
*   對 Web3 技術有基本認識，並希望深入實作的開發者。
*   熟悉 React 和 JavaScript，想轉型進入區塊鏈領域的前端工程師。
*   希望學習如何高效打造 DApp 原型的專案經理或創業者。

**先修知識：**
*   具備 React.js 的基礎知識。
*   了解基本的區塊鏈與智能合約概念 (ERC20)。
*   擁有 Node.js 與 npm/yarn 的使用經驗。

**必備工具：**
*   Node.js (v22 或更高版本)。
*   Yarn (v1 或 v2+)。
*   Git 版本控制工具。
*   一個 Alchemy 免費帳戶及 API Key。
*   瀏覽器錢包，如 MetaMask。

---

### **課程大綱 (Course Outline):**

**第一單元：課程介紹與環境設定**
1.  **歡迎與課程總覽**
    *   介紹課程目標與最終將完成的專案。
    *   展示最終成品：一個可以查詢任何 ERC20 代幣富豪榜的 DApp。
2.  **Scaffold-Alchemy 框架介紹**
    *   什麼是 `scaffold-alchemy`？為何選擇它？
    *   核心特色：與智能合約的快速迭代、內建元件與 Hooks、整合 Alchemy 強大 API。
3.  **專案初始化與環境設定**
    *   使用 `npx create-web3-dapp` 指令建立新專案。
    *   設定 Optimism Sepolia 網路，並獲取測試用的 ETH。
    *   導覽專案結構：`packages/hardhat` 與 `packages/nextjs` 的分工。

**第二單元：ERC20 智能合約的部屬**
1.  **編寫你的第一個 ERC20 代幣**
    *   使用 OpenZeppelin 標準合約快速建立一個 ERC20 Token。
    *   客製化代幣名稱、代號與初始發行量。
2.  **設定 Hardhat 部屬腳本**
    *   在 `hardhat.config.ts` 中配置 Optimism Sepolia 網路資訊。
    *   修改 `deploy.ts` 腳本以部屬我們的 ERC20 合約。
3.  **執行部屬與鏈上驗證**
    *   運行 `yarn deploy` 指令將合約部屬至 Optimism Sepolia。
    *   在 Optimism Sepolia 的區塊鏈瀏覽器上查看已部屬的合約與代幣。

**第三單元：前端基礎建設 - 打造查詢介面**
1.  **Scaffold-Alchemy 前端元件介紹**
    *   認識常用的內建元件，例如 `AddressInput`, `IntegerInput` 等。
    *   學習如何使用這些元件來快速搭建 UI。
2.  **建立富豪榜查詢頁面**
    *   在 Next.js 中建立一個新的頁面路由 (e.g., `/rich-list`)。
    *   使用 `AddressInput` 元件讓使用者輸入 ERC20 代幣的合約地址。
    *   利用 React `useState` Hook 來管理輸入的地址狀態。

**第四單元：串接 Alchemy API - 獲取富豪榜數據**
1.  **認識 Alchemy Token API**
    *   介紹 `getOwnersForContract` 這個強大的 API 端點，它可以一次性獲取所有代幣持有者及其餘額。
    *   了解 API 回傳的資料結構。
2.  **打造自定義 Hook `useTokenHolders`**
    *   在 `packages/nextjs/hooks` 目錄下建立新的 Hook。
    *   在這個 Hook 中，使用 `fetch` 或 `axios` 呼叫 Alchemy API。
    *   處理 API 的載入中 (loading)、錯誤 (error) 與成功 (data) 等狀態。
    *   對獲取的數據進行排序，找出餘額前幾名的持有者。
3.  **在前端頁面展示數據**
    *   在 `/rich-list` 頁面中調用我們剛建立的 `useTokenHolders` Hook。
    *   將獲取到的富豪榜數據，以表格形式清晰地呈現在畫面上。
    *   使用 `scaffold-alchemy` 內建的 `Address` 元件來優化錢包地址的顯示。

**第五單元：進階功能 - 實現分頁**
1.  **分頁邏輯設計**
    *   為什麼需要分頁？處理大量數據時的效能考量。
    *   解釋基於頁碼 (page number) 和每頁筆數 (items per page) 的分頁原理。
2.  **為 `useTokenHolders` Hook 增加分頁參數**
    *   修改 Hook，使其可以接收 `page` 參數。
    *   在 Hook 內部對 API 回傳的完整列表進行客戶端分頁 (client-side pagination) 處理。
3.  **在前端加入分頁控制元件**
    *   在頁面上增加 "上一頁" 與 "下一頁" 的按鈕。
    *   使用 `useState` 來追蹤當前的頁碼。
    *   綁定按鈕的 `onClick` 事件，用以更新頁碼狀態，並觸發畫面的重新渲染。
    *   顯示當前的頁碼與總頁數，提供更好的使用者體驗。

**第六單元：課程總結與未來展望**
1.  **專案回顧**
    *   快速回顧從合約部屬到前端實現的完整流程。
    *   強調 `scaffold-alchemy` 如何加速我們的開發過程。
2.  **未來可以優化的方向**
    *   伺服器端分頁 (Server-side Pagination) 的討論。
    *   加入圖表視覺化功能。
    *   部署到 Vercel 等平台，讓 DApp 正式上線。
3.  **Q&A 與下一步學習建議**

---