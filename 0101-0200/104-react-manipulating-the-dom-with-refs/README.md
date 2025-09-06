# React - 使用 Refs 操作 DOM

這個專案包含學習如何在 React 中使用 `useRef` Hook 來直接操作 DOM 元素的範例程式。

## 什麼是 Refs？

在 React 中，通常我們透過 props 和 state 來處理資料流，但有時候我們需要直接存取 DOM 元素，這時就需要使用 `useRef`。

Refs 提供了一種方式來存取在 render 方法中建立的 DOM 節點或 React 元素。

## 何時使用 Refs？

以下是一些適合使用 refs 的場景：
- 管理焦點（focus）、文字選取或媒體播放
- 觸發命令式動畫
- 與第三方 DOM 程式庫整合
- 測量 DOM 元素的尺寸或位置

## 專案結構

```
104-react-manipulating-the-dom-with-refs/
├── 01-example-focusing-a-text-input/     # 範例 1：聚焦文字輸入框
├── 02-example-scrolling-to-an-element/   # 範例 2：滾動到指定元素
└── README.md
```

## 範例 1：聚焦文字輸入框

### 📁 `01-example-focusing-a-text-input/`

這個範例示範如何使用 `useRef` 來控制 input 元素的焦點。

#### 核心程式碼：

```javascript
import { useRef } from 'react';

export default function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>
        Focus the input
      </button>
    </>
  );
}
```

#### 重點說明：

1. **建立 ref**：`const inputRef = useRef(null)`
   - `useRef(null)` 建立一個 ref 物件，初始值為 `null`

2. **附加到 DOM 元素**：`<input ref={inputRef} />`
   - 將 ref 附加到 input 元素上

3. **存取 DOM 元素**：`inputRef.current.focus()`
   - 透過 `inputRef.current` 存取實際的 DOM 元素
   - 呼叫 DOM 元素的 `focus()` 方法

#### 執行步驟：
```bash
cd 01-example-focusing-a-text-input
npm install
npm start
```

## 範例 2：滾動到指定元素

### 📁 `02-example-scrolling-to-an-element/`

這個範例示範如何使用多個 refs 來控制頁面滾動到特定元素。

#### 核心程式碼：

```javascript
import { useRef } from 'react';

export default function CatFriends() {
  const firstCatRef = useRef(null);
  const secondCatRef = useRef(null);
  const thirdCatRef = useRef(null);

  function handleScrollToFirstCat() {
    firstCatRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  // 其他處理函數...

  return (
    <>
      <nav>
        <button onClick={handleScrollToFirstCat}>Neo</button>
        {/* 其他按鈕... */}
      </nav>
      <div>
        <ul>
          <li>
            <img
              src="https://placecats.com/neo/300/200"
              alt="Neo"
              ref={firstCatRef}
            />
          </li>
          {/* 其他圖片... */}
        </ul>
      </div>
    </>
  );
}
```

#### 重點說明：

1. **多個 refs**：為每個需要滾動到的元素建立獨立的 ref
2. **scrollIntoView API**：使用原生 DOM API 來滾動到元素
   - `behavior: 'smooth'`：平滑滾動效果
   - `block: 'nearest'`：垂直對齊方式
   - `inline: 'center'`：水平對齊方式

#### 執行步驟：
```bash
cd 02-example-scrolling-to-an-element
npm install
npm start
```

## useRef 的重要概念

### 1. Ref 物件結構
```javascript
const myRef = useRef(initialValue);
// myRef = { current: initialValue }
```

### 2. 存取 DOM 元素
```javascript
myRef.current // 存取實際的 DOM 元素
```

### 3. Ref vs State 的差異
- **State**：更新時會觸發重新渲染
- **Ref**：更新時不會觸發重新渲染

### 4. 常見用法
```javascript
// 聚焦元素
ref.current.focus();

// 滾動到元素
ref.current.scrollIntoView();

// 選取文字
ref.current.select();

// 獲取元素尺寸
const width = ref.current.offsetWidth;
```

## 注意事項

1. **初始值**：DOM refs 通常初始化為 `null`
2. **時機**：只能在元素掛載後存取 `ref.current`
3. **不要過度使用**：能用 props 和 state 解決的就不要用 refs
4. **避免在渲染期間存取**：refs 應該在事件處理器或 effect 中使用

## 實戰練習建議

1. 嘗試建立一個表單驗證系統，使用 refs 來聚焦第一個錯誤欄位
2. 實作一個圖片輪播，使用 refs 來控制滾動位置
3. 建立一個音樂播放器，使用 refs 來控制音訊元素

## 總結

`useRef` 是 React 中操作 DOM 的強大工具，它讓我們能夠：
- 直接存取和操作 DOM 元素
- 在不觸發重新渲染的情況下儲存可變值
- 與第三方程式庫進行整合

記住，refs 是逃生艙口，應該謹慎使用。大多數情況下，React 的聲明式方法已經足夠了。 