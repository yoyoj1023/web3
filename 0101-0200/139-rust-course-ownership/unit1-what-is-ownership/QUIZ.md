# 單元一隨堂測驗：什麼是所有權？

**測驗時間：** 35 分鐘  
**總分：** 100 分  
**及格分數：** 70 分

---

## 📝 第一部分：選擇題（每題 8 分，共 40 分）

### 1. Rust 所有權系統的主要目的是什麼？
A. 提高程式執行速度  
B. 在編譯期保證記憶體安全  
C. 簡化程式碼語法  
D. 支援物件導向編程

### 2. 下列關於堆疊（Stack）和堆積（Heap）的描述，何者正確？
A. 堆疊存取較慢，堆積存取較快  
B. 堆疊用於動態大小資料，堆積用於固定大小資料  
C. 堆疊是後進先出，堆積是先進先出  
D. 堆疊存取快速且大小固定，堆積存取較慢但大小可變

### 3. 所有權的三大規則中，不包括以下哪項？
A. 每個值都有一個擁有者  
B. 同一時間只能有一個擁有者  
C. 擁有者離開作用域時值被丟棄  
D. 值可以被多個擁有者同時持有

### 4. 下列哪個型別實現了 Copy trait？
A. `String`  
B. `Vec<i32>`  
C. `i32`  
D. `Box<i32>`

### 5. 當執行 `let s2 = s1;` 且 s1 是 String 型別時會發生什麼？
A. s1 和 s2 都指向相同的記憶體  
B. s1 的內容被複製給 s2  
C. s1 的所有權轉移給 s2，s1 變為無效  
D. 編譯錯誤

---

## ✍️ 第二部分：程式碼分析題（每題 12 分，共 36 分）

### 6. 分析以下程式碼的行為

```rust
fn main() {
    let x = 42;
    let y = x;
    
    let s1 = String::from("Hello");
    let s2 = s1;
    
    println!("x = {}", x);
    println!("y = {}", y);
    // println!("s1 = {}", s1);  // Line A
    println!("s2 = {}", s2);
}
```

請回答：
a) Line A 如果取消註釋會發生什麼？為什麼？
b) 為什麼 x 在賦值給 y 後仍然可用？
c) 為什麼 s1 在賦值給 s2 後不可用？

### 7. 記憶體佈局分析

```rust
fn memory_example() {
    let a = 10;
    let b = vec![1, 2, 3];
    let c = String::from("Rust");
}
```

請描述：
a) 變數 a、b、c 在堆疊上儲存什麼？
b) 在堆積上儲存什麼？
c) 當函數結束時，記憶體如何被清理？

### 8. 函數所有權轉移

```rust
fn process_string(s: String) -> String {
    let mut result = s;
    result.push_str(" World");
    result
}

fn main() {
    let original = String::from("Hello");
    let processed = process_string(original);
    // 此處 original 和 processed 的狀態如何？
}
```

請分析所有權在函數呼叫過程中的變化。

---

## 🧠 第三部分：實作題（每題 12 分，共 24 分）

### 9. 修復所有權錯誤

以下程式碼有所有權相關的編譯錯誤，請修復它：

```rust
fn broken_ownership() {
    let s1 = String::from("Hello");
    let s2 = s1;
    
    println!("First string: {}", s1);
    println!("Second string: {}", s2);
    
    let s3 = take_ownership(s2);
    println!("Returned string: {}", s2);
}

fn take_ownership(s: String) -> String {
    println!("Processing: {}", s);
    s
}
```

請提供修復後的程式碼並解釋修改的原因。

### 10. 設計函數接口

設計一個函數 `combine_strings`，它接收兩個 String 參數，將它們組合成一個新的 String 並返回。要求：
- 呼叫者在呼叫後仍能使用原始字串
- 函數內部不能使用 `clone()`
- 提供完整的實作和使用範例

---

# 📊 測驗解答

## 第一部分：選擇題解答

### 1. 答案：B
**解釋：** Rust 所有權系統的核心目標是在編譯期（而非執行期）保證記憶體安全，防止常見的記憶體錯誤如懸空指標、重複釋放等。

### 2. 答案：D  
**解釋：** 堆疊具有後進先出（LIFO）特性，存取速度快，用於存放編譯期大小已知的資料；堆積存取較慢但可以儲存大小可變的資料。

### 3. 答案：D
**解釋：** 所有權的核心就是"唯一性"，同一時間一個值只能有一個擁有者，這是防止資料競爭的關鍵。選項 D 違反了規則二。

### 4. 答案：C
**解釋：** `i32` 是存放在堆疊上的基本型別，實現了 Copy trait。`String`、`Vec<i32>`、`Box<i32>` 都涉及堆積記憶體分配，不實現 Copy。

### 5. 答案：C
**解釋：** 對於非 Copy 型別如 String，賦值操作會發生移動（move），所有權從 s1 轉移到 s2，s1 變為無效。

---

## 第二部分：程式碼分析題解答

### 6. 程式碼行為分析（12分）

**a) Line A 取消註釋的結果（4分）**
會產生編譯錯誤：`borrow of moved value: s1`。因為 s1 的所有權已經在 `let s2 = s1;` 時轉移給了 s2。

**b) x 賦值後仍可用的原因（4分）**
因為 `i32` 實現了 Copy trait。當執行 `let y = x;` 時，x 的值被複製給 y，而不是移動，所以 x 仍然有效。

**c) s1 賦值後不可用的原因（4分）**
因為 `String` 沒有實現 Copy trait。當執行 `let s2 = s1;` 時，s1 的所有權被移動到 s2，為了防止二次釋放同一塊記憶體，s1 被標記為無效。

### 7. 記憶體佈局分析（12分）

**a) 堆疊上的內容（4分）**
- 變數 a：直接儲存值 10
- 變數 b：儲存 Vec 的元資料（指標、長度、容量）
- 變數 c：儲存 String 的元資料（指標、長度、容量）

**b) 堆積上的內容（4分）**
- vec![1, 2, 3] 的實際陣列資料
- "Rust" 字串的實際 UTF-8 位元組資料

**c) 記憶體清理（4分）**
函數結束時，堆疊上的變數按相反順序清理（c, b, a）。Rust 會自動呼叫 Vec 和 String 的 drop 方法，釋放它們在堆積上的記憶體。

### 8. 函數所有權轉移分析（12分）

**所有權變化流程：**
1. `original` 擁有字串 "Hello" 的所有權
2. 呼叫 `process_string(original)` 時，所有權從 `original` 轉移到參數 `s`
3. 在函數內，`s` 被移動到 `result`，然後修改
4. 函數返回時，`result` 的所有權轉移給 `processed`
5. 此時 `original` 已無效，`processed` 擁有 "Hello World" 的所有權

---

## 第三部分：實作題解答

### 9. 修復所有權錯誤（12分）

**修復後的程式碼：**
```rust
fn fixed_ownership() {
    let s1 = String::from("Hello");
    let s2 = s1.clone();  // 明確複製而非移動
    
    println!("First string: {}", s1);
    println!("Second string: {}", s2);
    
    let s3 = take_ownership(s2);
    println!("Returned string: {}", s3);  // 使用 s3 而非 s2
}

fn take_ownership(s: String) -> String {
    println!("Processing: {}", s);
    s
}
```

**修改解釋：**
1. 使用 `clone()` 複製 s1 給 s2，避免所有權轉移
2. 將最後的 `s2` 改為 `s3`，因為 s2 的所有權已轉移給函數

### 10. 設計函數接口（12分）

**解決方案：使用借用**
```rust
fn combine_strings(s1: &str, s2: &str) -> String {
    format!("{}{}", s1, s2)
}

fn main() {
    let first = String::from("Hello");
    let second = String::from("World");
    
    let combined = combine_strings(&first, &second);
    
    // 原始字串仍然可用
    println!("First: {}", first);
    println!("Second: {}", second);
    println!("Combined: {}", combined);
}
```

**設計解釋：**
- 使用 `&str` 參數接受字串切片，可以接受 `&String` 或 `&str`
- 不獲取所有權，只是借用資料
- 使用 `format!` 巨集建立新的 String
- 呼叫者保持對原始資料的所有權

---

## 🎯 評分等級

- **90-100分：** 優秀 - 深入理解所有權概念和記憶體模型
- **80-89分：** 良好 - 很好掌握基本概念，能分析複雜情況  
- **70-79分：** 及格 - 基本理解所有權規則
- **60-69分：** 不及格 - 需要重新學習移動和複製概念
- **60分以下：** 不及格 - 建議重新完整學習本單元

## 📚 復習建議

如果分數不理想，建議重點復習：
1. **所有權三大規則的具體應用場景**
2. **Move 語義與 Copy 語義的判斷標準**  
3. **堆疊與堆積記憶體的儲存策略**
4. **函數參數傳遞的所有權變化**
5. **如何使用 clone() 和借用解決所有權問題**
