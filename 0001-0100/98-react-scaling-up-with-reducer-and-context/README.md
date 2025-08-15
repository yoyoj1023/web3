# React 狀態管理進階教學：結合 Reducer 與 Context

## 📖 課程概要

本專案是 **Learn React** 系列課程的一部分，專門教授如何在 React 應用程式中擴展狀態管理。當應用程式變得複雜時，單純使用 `useState` 已無法滿足需求，這時就需要學習更進階的狀態管理模式。

### 🎯 學習目標

- 了解何時需要使用 `useReducer` 來管理複雜狀態
- 學習如何使用 React Context 在組件樹中共享狀態
- 掌握 Reducer 與 Context 結合的最佳實踐
- 理解如何重構程式碼以提高可維護性和可讀性

## 🗂 專案結構

```
98-react-scaling-up-with-reducer-and-context/
├── 01-combining-a-reducer-with-context/
│   ├── src/
│   │   ├── App.js              # 主應用組件，包含 reducer 邏輯
│   │   ├── TasksContext.js     # Context 定義
│   │   ├── AddTask.js          # 新增任務組件
│   │   ├── TaskList.js         # 任務列表組件
│   │   └── index.js            # 應用入口點
│   └── package.json
├── 02-moving-all-wiring-into-a-single-file/
│   ├── src/
│   │   ├── App.js              # 簡化的主組件
│   │   ├── TasksContext.js     # 整合所有邏輯的 Context
│   │   ├── AddTask.js          # 使用自訂 hook 的新增組件
│   │   ├── TaskList.js         # 使用自訂 hook 的列表組件
│   │   └── index.js            # 應用入口點
│   └── package.json
└── README.md
```

## 📚 課程內容詳解

### 第一階段：結合 Reducer 與 Context

在 `01-combining-a-reducer-with-context` 資料夾中，你將學習：

#### 🔧 核心概念

1. **useReducer Hook**
   ```javascript
   const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
   ```
   - 管理複雜的狀態邏輯
   - 透過 action 物件來描述狀態變更
   - 集中化狀態更新邏輯

2. **React Context**
   ```javascript
   export const TasksContext = createContext(null);
   export const TasksDispatchContext = createContext(null);
   ```
   - 避免 prop drilling 問題
   - 在組件樹中共享狀態和 dispatch 函數

3. **Reducer 函數設計**
   ```javascript
   function tasksReducer(tasks, action) {
     switch (action.type) {
       case 'added': // 新增任務
       case 'changed': // 修改任務
       case 'deleted': // 刪除任務
       default: // 錯誤處理
     }
   }
   ```

#### 💡 學習重點

- **狀態不可變性 (Immutability)**：使用展開運算子和數組方法來創建新的狀態
- **Action 物件設計**：清晰的 type 屬性和必要的數據
- **Context Provider 架構**：如何正確包裝應用程式組件

### 第二階段：重構為單一檔案架構

在 `02-moving-all-wiring-into-a-single-file` 資料夾中，你將學習：

#### 🏗 架構改進

1. **自訂 Provider 組件**
   ```javascript
   export function TasksProvider({ children }) {
     const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
     // 返回 Context Providers
   }
   ```

2. **自訂 Hooks**
   ```javascript
   export function useTasks() {
     return useContext(TasksContext);
   }
   
   export function useTasksDispatch() {
     return useContext(TasksDispatchContext);
   }
   ```

#### ✨ 改進優勢

- **封裝性**：將所有狀態邏輯封裝在單一檔案中
- **可重用性**：提供清晰的 API 介面
- **類型安全**：更容易添加 TypeScript 支援
- **測試友好**：邏輯集中便於單元測試

## 🚀 快速開始

### 環境需求

- Node.js 14.0 或更高版本
- npm 或 yarn 套件管理器

### 安裝與執行

1. **安裝依賴**
   ```bash
   # 進入第一個專案
   cd 01-combining-a-reducer-with-context
   npm install
   
   # 或進入第二個專案
   cd 02-moving-all-wiring-into-a-single-file
   npm install
   ```

2. **啟動開發伺服器**
   ```bash
   npm start
   ```

3. **開啟瀏覽器**
   前往 `http://localhost:3000` 查看應用程式

## 🎮 互動功能

### 任務管理應用

這是一個模擬「京都一日遊」的任務清單應用，包含以下功能：

- ✅ **新增任務**：在輸入框中輸入任務內容並點擊「Add」
- ✏️ **編輯任務**：點擊任務文字進行編輯，按 Enter 確認
- ☑️ **切換完成狀態**：點擊核取方塊標記任務完成/未完成
- 🗑️ **刪除任務**：點擊「Delete」按鈕移除任務

### 預設任務

- Philosopher's Path（哲學之道）✅
- Visit the temple（參拜寺廟）
- Drink matcha（品嘗抹茶）

## 🔍 程式碼學習指南

### 關鍵文件解析

#### `TasksContext.js` - 狀態管理核心

```javascript
// 第一階段：基本 Context 建立
export const TasksContext = createContext(null);
export const TasksDispatchContext = createContext(null);

// 第二階段：完整的 Context 提供者
export function TasksProvider({ children }) {
  // useReducer 整合
  // 自訂 hooks 匯出
}
```

#### `App.js` - 應用程式架構

```javascript
// 第一階段：包含所有邏輯
function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  // JSX 回傳
}

// 第二階段：簡化架構
function TaskApp() {
  return (
    <TasksProvider>
      {/* 子組件 */}
    </TasksProvider>
  );
}
```

### 🎯 學習建議

1. **從第一階段開始**：理解基本的 Context 與 Reducer 結合方式
2. **比較兩個版本**：觀察程式碼結構的改進
3. **實際操作**：在瀏覽器中測試所有功能
4. **閱讀程式碼**：仔細研究每個組件的實作方式
5. **嘗試修改**：添加新功能或改進現有邏輯

## 🏆 進階練習

### 建議的擴展功能

1. **任務分類**：為任務添加類別標籤
2. **優先級排序**：實作任務優先級功能
3. **本地儲存**：使用 localStorage 持久化數據
4. **拖拽排序**：實作任務順序調整
5. **搜尋過濾**：添加任務搜尋和過濾功能

### 技術挑戰

1. **TypeScript 轉換**：將專案轉換為 TypeScript
2. **錯誤邊界**：添加錯誤處理機制
3. **效能最佳化**：使用 `useMemo` 和 `useCallback`
4. **測試撰寫**：為組件和 hooks 撰寫單元測試

## 📖 相關文檔

- [React useReducer 文檔](https://react.dev/reference/react/useReducer)
- [React Context 文檔](https://react.dev/reference/react/createContext)
- [React 狀態管理最佳實踐](https://react.dev/learn/managing-state)

## 🤝 學習社群

這個專案是學習 React 進階狀態管理的絕佳起點。建議與其他學習者交流心得，分享程式碼改進建議。

---

**祝你學習愉快！透過這個專案，你將掌握 React 應用程式中複雜狀態管理的精髓。** 🎉 