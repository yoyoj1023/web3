# React useReducer 教學：用計數器範例學會狀態管理

我們來用一個超級簡單的「計數器」範例，一步一步教你怎麼使用 useReducer。
這個範例會非常清楚地展示 useReducer 的三個核心部分：State、Action 和 Reducer。

## 我們的目標

我們要建立一個簡單的計數器，它有三個按鈕：
- 「+」：數字加 1
- 「-」：數字減 1
- 「歸零」：數字變回 0

## 第 1 步：定義「說明書」 (Reducer 函式)

Reducer 就像一台機器的操作說明書。它告訴 React，當收到某個指令 (Action) 時，應該如何更新狀態 (State)。

這個函式永遠接收兩個參數：
- `state`：目前的狀態值 (例如：現在的數字是 5)
- `action`：一個描述「要做什麼」的指令物件 (例如：指令是「增加」)

然後，它會回傳一個新的狀態值。

```javascript
// 這就是我們的 Reducer 函式，我們的「說明書」
function counterReducer(state, action) {
  // 我們用 switch 來判斷收到了哪種指令 (action.type)
  switch (action.type) {
    case 'increment': // 如果指令是 'increment'
      return state + 1; // 就回傳「目前的 state + 1」作為新狀態
    case 'decrement': // 如果指令是 'decrement'
      return state - 1; // 就回傳「目前的 state - 1」
    case 'reset':     // 如果指令是 'reset'
      return 0;         // 就直接回傳 0
    default:          // 如果是沒看過的指令
      throw new Error("未知的指令：" + action.type); // 拋出錯誤
  }
}
```

**重點：** 這個函式是獨立的，完全不依賴 React 元件本身。它只負責計算邏輯。

## 第 2 步：在元件中「安裝」這台機器

現在我們要在我們的 React 元件裡，使用 useReducer 來安裝這台有說明書的機器。

useReducer 需要兩個參數：
- `reducer`：我們剛剛寫好的那本「說明書」
- `initialState`：機器的「初始狀態」（計數器一開始是多少）

它會回傳兩個東西給你：
- `state`：目前最新的狀態值
- `dispatch`：一個讓你下達「指令」的專用函式

```jsx
import { useReducer } from 'react';

// 我們的說明書 (Reducer 函式)
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    case 'reset':
      return 0;
    default:
      throw new Error("未知的指令：" + action.type);
  }
}

// 我們的元件
function Counter() {
  // 安裝機器！
  // useReducer(說明書, 初始值)
  // 會回傳 [目前的狀態, 下指令的工具]
  const [number, dispatch] = useReducer(counterReducer, 0); // 初始值設為 0

  return (
    <div>
      {/* 畫面直接顯示目前的狀態 `number` */}
      <h1>計數：{number}</h1>

      {/* 按下按鈕時，我們就用 dispatch 來下達指令 */}
      {/* 我們傳入一個物件 { type: '指令名稱' } */}
      <button onClick={() => dispatch({ type: 'increment' })}> + </button>
      <button onClick={() => dispatch({ type: 'decrement' })}> - </button>
      <button onClick={() => dispatch({ type: 'reset' })}> 歸零 </button>
    </div>
  );
}

export default Counter;
```

## 流程拆解：當你按下「+」按鈕時發生了什麼？

1. **使用者點擊**：你點擊了「+」按鈕。

2. **元件下達指令**：`onClick` 事件被觸發，執行 `dispatch({ type: 'increment' })`。`dispatch` 函式把你給的指令物件 `{ type: 'increment' }` 發送出去。

3. **React 呼叫說明書**：React 內部接收到這個指令，馬上拿出你的「說明書」`counterReducer`，然後把**「目前的 state」和「你剛發送的 action」**這兩個東西交給它。
   ```javascript
   counterReducer(0, { type: 'increment' }) // (假設目前 state 是 0)
   ```

4. **說明書計算新狀態**：`counterReducer` 函式內部，`switch` 語句看到了 `action.type` 是 `'increment'`，於是它執行 `return state + 1;`，也就是 `return 0 + 1;`，最後回傳了 `1`。

5. **React 更新狀態**：React 拿到說明書回傳的新狀態 `1`，就用這個新值來更新元件的狀態。

6. **畫面重新渲染**：`number` 的值從 `0` 變成了 `1`，元件重新渲染，畫面上 `<h1>` 裡的數字就變成了 `1`。

## 總結一下

| 角色 | 作用 | 簡單比喻 |
|------|------|----------|
| `reducer` | 一個純函式，根據舊 state 和 action 計算出新 state | 說明書 / 大腦 |
| `state` | 當前的資料狀態 | 目前的數字 |
| `dispatch` | 一個函式，用來觸發 action，告訴 reducer 該做事了 | 下指令的按鈕 |
| `action` | 一個物件，描述了要執行的操作，通常有個 type 屬性 | 指令本身 (例如："增加") |

## 核心好處

使用 useReducer 的核心好處是把「如何更新狀態的邏輯」從你的元件中抽離出來。當狀態更新邏輯變得很複雜時（比如一個動作要同時改變好幾個狀態），這種分離會讓你的元件程式碼保持乾淨、清晰，也更容易測試。
