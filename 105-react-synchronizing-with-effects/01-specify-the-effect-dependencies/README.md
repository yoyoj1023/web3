# React useEffect 依賴性教學

## 📚 學習目標

本範例將幫助您理解：
- 什麼是 React Effects
- 如何指定 Effect 的依賴性 (Dependencies)
- Effect 何時會執行和重新執行
- 如何避免不必要的 Effect 重新執行

## 🔍 什麼是 Effects？

**Effect** 讓您可以在渲染完成後執行副作用（side effects），用來：
- 與外部系統同步（API 呼叫、DOM 操作等）
- 處理不屬於純函數計算的操作
- 在組件生命週期的特定時機執行程式碼

## 🎯 範例說明

### 程式碼結構

```javascript
function VideoPlayer({ src, isPlaying }) {
  const ref = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      console.log('Calling video.play()');
      ref.current.play();
    } else {
      console.log('Calling video.pause()');
      ref.current.pause();
    }
  }, [isPlaying]); // 👈 依賴性陣列

  return <video ref={ref} src={src} loop playsInline />;
}
```

### 重要概念解析

#### 1. useEffect 的基本語法
```javascript
useEffect(() => {
  // Effect 的程式碼
}, [dependencies]); // 依賴性陣列
```

#### 2. 依賴性陣列 `[isPlaying]`
- **作用**：告訴 React 何時需要重新執行 Effect
- **規則**：只有當 `isPlaying` 的值改變時，Effect 才會重新執行
- **比較**：React 使用 `Object.is()` 來比較前後的值

#### 3. 三種依賴性情況

| 依賴性陣列 | 執行時機 | 說明 |
|------------|----------|------|
| `[isPlaying]` | `isPlaying` 改變時 | 只有依賴的值改變時執行 |
| `[]` | 僅在組件掛載時 | 空陣列 = 無依賴性 |
| 無陣列 | 每次渲染後 | 不推薦使用 |

## 🚀 如何運行範例

1. **啟動專案**
```bash
npm start
# 或
yarn start
```

2. **互動測試**
- 在輸入框中輸入文字
- 點擊 "Play" 按鈕播放視頻
- 點擊 "Pause" 按鈕暫停視頻
- 觀察控制台輸出

## 🔬 實驗與觀察

### 實驗 1：依賴性的作用
1. 在輸入框中輸入文字
2. 觀察控制台是否有新的訊息
3. **結果**：輸入文字不會觸發 Effect，因為 `text` 不在依賴性陣列中

### 實驗 2：依賴性改變
1. 點擊 Play/Pause 按鈕
2. 觀察控制台的 `video.play()` 或 `video.pause()` 訊息
3. **結果**：只有 `isPlaying` 改變時才執行 Effect

### 實驗 3：移除依賴性
嘗試將依賴性陣列改為 `[]`：
```javascript
useEffect(() => {
  // Effect 程式碼
}, []); // 空陣列
```
**結果**：Effect 只在組件掛載時執行一次

## 💡 重要觀念

### 1. Effect 的執行時機
- **渲染之後**：Effect 在 DOM 更新完成後執行
- **依賴性檢查**：React 比較前後渲染的依賴性值
- **有條件執行**：只有依賴性改變時才重新執行

### 2. 為什麼需要依賴性？
```javascript
// ❌ 沒有依賴性 - 每次渲染都執行
useEffect(() => {
  console.log('每次都執行');
});

// ✅ 有依賴性 - 只在需要時執行
useEffect(() => {
  console.log('只在 isPlaying 改變時執行');
}, [isPlaying]);
```

### 3. 依賴性的選擇規則
- 包含 Effect 中使用的所有響應式值
- 包含 props、state 和由它們計算出的值
- 不包含 ref 和 setState 函數（它們是穩定的）

## 🎓 最佳實踐

### 1. 誠實地宣告依賴性
```javascript
// ✅ 正確：包含所有使用的值
useEffect(() => {
  fetchData(userId, filter);
}, [userId, filter]);

// ❌ 錯誤：遺漏依賴性
useEffect(() => {
  fetchData(userId, filter);
}, [userId]); // 遺漏了 filter
```

### 2. 使用 ESLint 插件
安裝 `eslint-plugin-react-hooks` 來自動檢查依賴性：
```bash
npm install eslint-plugin-react-hooks --save-dev
```

### 3. 避免物件和函數作為依賴性
```javascript
// ❌ 可能造成無限循環
const options = { userId, filter };
useEffect(() => {
  fetchData(options);
}, [options]);

// ✅ 直接使用原始值
useEffect(() => {
  fetchData({ userId, filter });
}, [userId, filter]);
```

## 🔗 相關資源

- [React 官方文件 - useEffect](https://react.dev/reference/react/useEffect)
- [React 官方文件 - Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [Effect 依賴性詳細說明](https://react.dev/learn/synchronizing-with-effects#sending-analytics)

## 📝 練習建議

1. **修改依賴性陣列**：嘗試不同的依賴性組合
2. **添加更多狀態**：增加新的 state 並觀察 Effect 的行為
3. **移除依賴性**：看看會發生什麼問題
4. **使用 React DevTools**：觀察 Effect 的執行時機

## 🎯 總結

- Effect 讓組件能夠與外部系統同步
- 依賴性陣列控制 Effect 的執行時機
- 正確的依賴性設定可以避免性能問題和錯誤
- 遵循 React 的依賴性規則是寫出可靠程式碼的關鍵 