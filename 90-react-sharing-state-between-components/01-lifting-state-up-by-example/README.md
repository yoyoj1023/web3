# React 狀態共享範例 - 手風琴組件

## 📚 學習單元：Sharing State Between Components

### 🎯 學習目標
本專案展示了如何在 React 組件之間共享狀態，特別是使用「狀態提升」(Lifting State Up) 的技術來讓多個子組件共享同一個狀態。

## 🔍 專案概述
這是一個手風琴 (Accordion) 組件的實作範例，展示了：
- 如何將狀態從子組件提升到父組件
- 如何透過 props 傳遞狀態和狀態更新函數
- 如何讓多個組件協調工作

## 💡 核心概念

### 1. 狀態提升 (Lifting State Up)
當多個組件需要共享同一個狀態時，我們需要將狀態提升到它們共同的父組件中：

```javascript
// ✅ 正確：狀態在父組件中
function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);
  // 狀態和更新函數透過 props 傳遞給子組件
}

// ❌ 錯誤：每個 Panel 有自己的狀態，無法協調
function Panel() {
  const [isActive, setIsActive] = useState(false);
}
```

### 2. 受控組件 (Controlled Components)
Panel 組件是受控組件，它的狀態完全由父組件控制：
- `isActive` 由父組件的狀態決定
- `onShow` 函數更新父組件的狀態

## 🔧 代碼解析

### Accordion 父組件
```javascript
export default function Accordion() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <>
      <Panel
        title="About"
        isActive={activeIndex === 0}
        onShow={() => setActiveIndex(0)}
      >
        {/* 內容 */}
      </Panel>
      <Panel
        title="Etymology"
        isActive={activeIndex === 1}
        onShow={() => setActiveIndex(1)}
      >
        {/* 內容 */}
      </Panel>
    </>
  );
}
```

**重點說明：**
- `activeIndex` 狀態決定哪個面板是活躍的
- 每個 Panel 都接收 `isActive` 布林值來決定是否顯示內容
- `onShow` 回調函數用來更新父組件的狀態

### Panel 子組件
```javascript
function Panel({ title, children, isActive, onShow }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {isActive ? (
        <p>{children}</p>
      ) : (
        <button onClick={onShow}>Show</button>
      )}
    </section>
  );
}
```

**重點說明：**
- 組件不維護自己的狀態
- 根據 `isActive` prop 決定顯示內容或按鈕
- 點擊按鈕時調用 `onShow` 回調函數

## 🚀 如何運行專案

1. 確保已安裝 Node.js
2. 在專案目錄下運行：
```bash
npm install
npm start
```
3. 開啟瀏覽器訪問 `http://localhost:3000`

## 📝 學習要點總結

### ✅ 何時使用狀態提升
- 多個組件需要顯示相同的變化數據
- 兩個組件需要總是一起改變
- 需要協調多個組件的行為

### 🎯 實作步驟
1. **識別共享狀態**：找出需要共享的狀態
2. **找到共同父組件**：將狀態提升到最近的共同父組件
3. **透過 props 傳遞**：將狀態和更新函數作為 props 傳遞給子組件
4. **移除子組件狀態**：移除子組件中的重複狀態

### 🔑 關鍵原則
- **單一數據源**：每個狀態都應該有唯一的數據源
- **由上往下的數據流**：狀態向下傳遞，事件向上傳遞
- **組件協調**：通過共享狀態讓組件協同工作

## 🌟 延伸學習

### 相關概念
- Context API：更高級的狀態共享方法
- Redux：大型應用的狀態管理
- Custom Hooks：提取狀態邏輯的重用

### 練習建議
1. 嘗試添加更多的面板
2. 實作「可以同時開啟多個面板」的功能
3. 添加動畫效果
4. 重構為自定義 Hook

## 📖 參考資源
- [React 官方文檔 - Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [React 官方文檔 - Lifting State Up](https://react.dev/learn/sharing-state-between-components#lifting-state-up-by-example)

---

**最後更新：** 2024
**學習單元：** Sharing State Between Components
**難度等級：** 初級到中級 