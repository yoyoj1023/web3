# React Effects 生命週期詳解

## 📚 學習目標

本專案將幫助你深入理解 React Effects 的生命週期，包括：
- Effect 如何與依賴項同步
- React 如何驗證 Effect 能夠重新同步
- Effect 的掛載、重新執行和卸載過程
- 依賴項陣列的重要性

## 🏗️ 專案結構

```
01-how-react-verifies-that-your-effect-can-re-synchronize/
├── src/
│   ├── App.js          # 主要組件示例
│   ├── chat.js         # 模擬聊天連接功能
│   ├── index.js        # 應用入口點
│   └── styles.css      # 基本樣式
├── package.json        # 專案配置
└── README.md           # 本教學文件
```

## 🚀 快速開始

```bash
cd 01-how-react-verifies-that-your-effect-can-re-synchronize
npm install
npm start
```

## 🔍 核心概念解析

### 1. Effect 的基本結構

```javascript
useEffect(() => {
  // Effect 函數：在依賴項變化時執行
  const connection = createConnection(serverUrl, roomId);
  connection.connect();
  
  // 清理函數：在下次 Effect 執行前或組件卸載時執行
  return () => connection.disconnect();
}, [roomId]); // 依賴項陣列
```

### 2. Effect 生命週期階段

#### 階段一：初始掛載 (Mount)
1. 組件首次渲染
2. Effect 函數執行
3. 建立連接或訂閱

#### 階段二：依賴項變化 (Re-sync)
1. 依賴項 `roomId` 發生變化
2. **先執行清理函數** - 斷開舊連接
3. **再執行 Effect 函數** - 建立新連接

#### 階段三：組件卸載 (Unmount)
1. 組件即將被移除
2. 執行清理函數
3. 斷開所有連接

### 3. React 如何驗證重新同步

React 通過以下方式確保 Effect 能正確重新同步：

```javascript
// ✅ 正確：roomId 變化時會重新連接到新房間
useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.connect();
  return () => connection.disconnect();
}, [roomId]); // roomId 在依賴項陣列中

// ❌ 錯誤：roomId 變化時不會重新連接
useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.connect();
  return () => connection.disconnect();
}, []); // 遺漏 roomId 依賴項
```

## 💡 示例程式碼分析

### ChatRoom 組件

```javascript
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
  
  return <h1>Welcome to the {roomId} room!</h1>;
}
```

**關鍵要點：**
- `roomId` 是從 props 傳入的值
- 每當 `roomId` 變化，Effect 會先斷開舊連接，再建立新連接
- 這確保了使用者總是連接到正確的聊天室

### App 組件狀態管理

```javascript
export default function App() {
  const [roomId, setRoomId] = useState('general');
  const [show, setShow] = useState(false);
  
  return (
    <>
      <select value={roomId} onChange={e => setRoomId(e.target.value)}>
        <option value="general">general</option>
        <option value="travel">travel</option>
        <option value="music">music</option>
      </select>
      
      <button onClick={() => setShow(!show)}>
        {show ? 'Close chat' : 'Open chat'}
      </button>
      
      {show && <ChatRoom roomId={roomId} />}
    </>
  );
}
```

## 🔄 完整的執行流程

### 情境 1：首次開啟聊天室
1. 使用者點擊 "Open chat"
2. `ChatRoom` 組件掛載
3. Effect 執行：連接到 "general" 房間
4. 控制台顯示：`✅ Connecting to "general" room...`

### 情境 2：切換聊天室
1. 使用者選擇 "travel" 房間
2. `roomId` state 更新為 "travel"
3. Effect 重新執行：
   - 先執行清理函數：`❌ Disconnected from "general" room`
   - 再執行 Effect：`✅ Connecting to "travel" room...`

### 情境 3：關閉聊天室
1. 使用者點擊 "Close chat"
2. `ChatRoom` 組件卸載
3. 清理函數執行：`❌ Disconnected from "travel" room`

## ⚠️ React Strict Mode 的影響

在開發模式下，React Strict Mode 會故意執行兩次 Effect：

```
開發模式執行順序：
1. Effect 執行 → 連接
2. 清理函數執行 → 斷開連接 (Strict Mode)
3. Effect 再次執行 → 重新連接 (Strict Mode)
```

這幫助你：
- 提早發現清理函數的問題
- 確保 Effect 能正確處理重新同步
- 模擬真實的生產環境情境

## 🐛 常見錯誤與解決方案

### 錯誤 1：遺漏依賴項

```javascript
// ❌ 錯誤
useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.connect();
  return () => connection.disconnect();
}, []); // 遺漏 roomId

// ✅ 正確
useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.connect();
  return () => connection.disconnect();
}, [roomId]); // 包含所有使用的變數
```

### 錯誤 2：忘記清理函數

```javascript
// ❌ 錯誤：會造成記憶體洩漏
useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.connect();
  // 沒有返回清理函數
}, [roomId]);

// ✅ 正確：提供清理函數
useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.connect();
  return () => connection.disconnect(); // 重要！
}, [roomId]);
```

### 錯誤 3：在錯誤的時機處理非同步操作

```javascript
// ❌ 錯誤：可能會在組件卸載後設置狀態
useEffect(() => {
  fetchUserData(userId).then(user => {
    setUser(user); // 如果組件已卸載，這會發出警告
  });
}, [userId]);

// ✅ 正確：使用取消標記
useEffect(() => {
  let cancelled = false;
  
  fetchUserData(userId).then(user => {
    if (!cancelled) {
      setUser(user);
    }
  });
  
  return () => {
    cancelled = true; // 標記為已取消
  };
}, [userId]);
```

## 🎯 最佳實踐

### 1. 總是包含所有依賴項
```javascript
// 使用 ESLint 插件 eslint-plugin-react-hooks 來自動檢查
useEffect(() => {
  // 使用到的所有變數都要放在依賴項陣列中
}, [dependency1, dependency2, dependency3]);
```

### 2. 適當的清理
```javascript
useEffect(() => {
  // 訂閱
  const subscription = subscribe();
  
  // 清理
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 3. 避免無限迴圈
```javascript
// ❌ 會造成無限迴圈
const [count, setCount] = useState(0);
useEffect(() => {
  setCount(count + 1); // 每次 count 變化都會觸發 Effect
}, [count]);

// ✅ 使用函數式更新
useEffect(() => {
  setCount(prev => prev + 1); // 不依賴當前的 count 值
}, []); // 空的依賴項陣列
```

## 🧪 實驗與練習

### 練習 1：觀察生命週期
1. 開啟瀏覽器開發者工具的控制台
2. 執行專案並操作 UI
3. 觀察連接和斷開連接的訊息
4. 注意 Strict Mode 的雙重執行

### 練習 2：修改依賴項
1. 移除 `[roomId]` 依賴項，看看會發生什麼
2. 添加不必要的依賴項，觀察 Effect 的執行頻率
3. 體驗依賴項陣列對效能的影響

### 練習 3：擴展功能
1. 添加連接狀態的顯示
2. 模擬連接失敗的情況
3. 添加重新連接的邏輯

## 📖 延伸閱讀

- [React 官方文檔：useEffect](https://react.dev/reference/react/useEffect)
- [React 官方文檔：Effect 的生命週期](https://react.dev/learn/lifecycle-of-reactive-effects)
- [React 官方文檔：移除 Effect 依賴項](https://react.dev/learn/removing-effect-dependencies)

## 🤝 貢獻

歡迎提出問題或改進建議！這個專案的目的是幫助理解 React Effects 的核心概念。

---

**記住：** Effect 的生命週期不是關於組件的生命週期，而是關於同步和重新同步的過程！ 