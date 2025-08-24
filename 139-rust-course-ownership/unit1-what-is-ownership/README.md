# 單元一：什麼是所有權？
## What is Ownership?

**課程目標：** 深入理解 Rust 所有權系統的核心概念，掌握記憶體安全的編譯期保證機制。

**心智模型：** 想像所有權系統就像圖書館的借書制度：每本書同時只能有一個借閱者，借閱者負責保管和歸還，系統自動追蹤所有權狀態。

---

## 1. 為何需要所有權？

### 1.1 記憶體管理的挑戰

程式設計中記憶體管理主要有三種方式：

#### 手動管理（C/C++）
```c
// C 語言範例
char* str = malloc(100);  // 手動分配
strcpy(str, "Hello");     // 使用記憶體
free(str);                // 手動釋放
// str = NULL;            // 如果忘記這行，就有懸空指標
```

**風險：**
- 記憶體洩漏（忘記 `free`）
- 重複釋放（多次 `free`）
- 懸空指標（使用已釋放的記憶體）
- 緩衝區溢位

#### 垃圾回收（Java, Python, Go）
```java
// Java 範例
String str = new String("Hello");  // 分配記憶體
// 不需要手動釋放，GC 自動處理
```

**代價：**
- 執行期效能開銷
- 不可預測的暫停時間
- 記憶體使用量較高
- 無法精確控制釋放時機

#### Rust 的第三條路：編譯期所有權檢查

```rust
fn main() {
    let s = String::from("Hello");  // 分配記憶體
    println!("{}", s);              // 使用記憶體
    // 離開作用域時自動釋放，無需手動或 GC
}
```

**優勢：**
- 編譯期保證記憶體安全
- 零執行期開銷
- 確定性的記憶體釋放
- 防止資料競爭

---

## 2. 核心概念：堆疊與堆積

### 2.1 堆疊（Stack）

**特性：**
- 後進先出（LIFO）
- 存取速度極快
- 大小固定，編譯期已知
- 自動管理

**儲存內容：**
- 基本型別：`i32`, `f64`, `bool`, `char`
- 陣列：`[i32; 5]`
- 結構體（如果所有欄位都在堆疊上）

```rust
fn stack_example() {
    let x = 42;           // 在堆疊上
    let y = [1, 2, 3];    // 在堆疊上
    let z = (10, 20);     // 在堆疊上
    
    // 函數結束時，所有變數自動從堆疊彈出
}
```

### 2.2 堆積（Heap）

**特性：**
- 存取較慢（需要指標間接存取）
- 大小可變，執行期決定
- 需要手動管理（或 GC/所有權系統）

**儲存內容：**
- 動態大小型別：`String`, `Vec<T>`
- 大型資料結構
- 遞迴資料結構

```rust
fn heap_example() {
    let s = String::from("Hello");  // 字串資料在堆積上
    let v = vec![1, 2, 3, 4, 5];    // 向量資料在堆積上
    
    // s 和 v 本身（指標、長度、容量）在堆疊上
    // 實際字串和向量資料在堆積上
}
```

### 2.3 記憶體佈局圖解

```
堆疊（Stack）           堆積（Heap）
┌─────────────┐        ┌─────────────┐
│ v: Vec<i32> │──────→ │ [1, 2, 3]   │
│ ptr: 0x123  │        │             │
│ len: 3      │        │             │ 
│ cap: 4      │        │             │
├─────────────┤        ├─────────────┤
│ s: String   │──────→ │ "Hello"     │
│ ptr: 0x456  │        │             │
│ len: 5      │        │             │
│ cap: 8      │        │             │
└─────────────┘        └─────────────┘
```

---

## 3. 所有權的三大黃金規則

### 規則一：每個值都有一個擁有者
```rust
let s = String::from("Hello");  // s 是字串 "Hello" 的擁有者
```

### 規則二：同一時間只能有一個擁有者
```rust
let s1 = String::from("Hello");
let s2 = s1;  // 所有權從 s1 轉移到 s2
// println!("{}", s1);  // 編譯錯誤！s1 不再有效
println!("{}", s2);     // 正確
```

### 規則三：當擁有者離開作用域時，值被丟棄
```rust
{
    let s = String::from("Hello");  // s 進入作用域
    // 使用 s
} // s 離開作用域，String 被自動丟棄（呼叫 drop）
```

---

## 4. 所有權轉移（Move）

### 4.1 變數賦值的移動語義

```rust
fn move_example() {
    let s1 = String::from("Hello");
    let s2 = s1;  // Move！s1 的所有權轉移給 s2
    
    // println!("{}", s1);  // 編譯錯誤
    println!("{}", s2);     // 正確
}
```

**記憶體變化：**
```
賦值前：
堆疊               堆積
s1 → [ptr|len|cap] → "Hello"

賦值後：
堆疊               堆積  
s1 [無效]
s2 → [ptr|len|cap] → "Hello"
```

### 4.2 函數參數的所有權轉移

```rust
fn take_ownership(s: String) {  // s 獲得所有權
    println!("{}", s);
} // s 離開作用域，值被丟棄

fn main() {
    let s = String::from("Hello");
    take_ownership(s);  // s 的所有權轉移給函數
    // println!("{}", s);  // 編譯錯誤！s 不再有效
}
```

### 4.3 函數返回值的所有權轉移

```rust
fn give_ownership() -> String {
    let s = String::from("Hello");
    s  // 返回 s，將所有權轉移給呼叫者
}

fn take_and_give_back(s: String) -> String {
    s  // 直接返回，轉移所有權
}

fn main() {
    let s1 = give_ownership();        // s1 獲得所有權
    let s2 = String::from("World");   
    let s3 = take_and_give_back(s2);  // s2 移動進函數，s3 獲得返回值
    
    // s1 和 s3 有效，s2 已無效
}
```

---

## 5. 複製特性（Copy Trait）

### 5.1 堆疊型別的複製語義

```rust
fn copy_example() {
    let x = 5;
    let y = x;  // Copy！x 仍然有效
    
    println!("x = {}, y = {}", x, y);  // 兩者都有效
}
```

### 5.2 實現 Copy 的型別

**自動實現 Copy 的型別：**
- 所有整數型別：`i32`, `u64` 等
- 浮點數型別：`f32`, `f64`
- 布林型別：`bool`
- 字元型別：`char`
- 元組（如果所有元素都實現 Copy）：`(i32, i32)`

```rust
fn copy_types_demo() {
    // 這些都是 Copy 型別
    let a = 42;
    let b = a;        // a 仍然有效
    
    let c = 3.14;
    let d = c;        // c 仍然有效
    
    let e = true;
    let f = e;        // e 仍然有效
    
    let g = (1, 2);
    let h = g;        // g 仍然有效
    
    println!("a={}, b={}, c={}, d={}, e={}, f={}, g={:?}, h={:?}", 
             a, b, c, d, e, f, g, h);
}
```

### 5.3 Copy vs Move 的判斷規則

```rust
// 實現 Copy 的型別不能包含 Drop
#[derive(Copy, Clone)]
struct Point {
    x: i32,
    y: i32,
}

// 不能實現 Copy，因為包含 String（實現了 Drop）
struct Person {
    name: String,  // String 不是 Copy
    age: i32,      // i32 是 Copy
}
```

---

## 6. 實戰練習

### 練習 1：理解所有權轉移

```rust
fn exercise1() {
    let s1 = String::from("Hello");
    let s2 = s1.clone();  // 明確複製而非移動
    
    println!("s1 = {}, s2 = {}", s1, s2);  // 兩者都有效
}
```

**思考：** `clone()` 和直接賦值有什麼差異？

### 練習 2：函數所有權

編寫一個函數，接收一個 `String`，在其後加上感嘆號，然後返回。

<details>
<summary>解答</summary>

```rust
fn add_exclamation(mut s: String) -> String {
    s.push('!');
    s
}

fn main() {
    let s = String::from("Hello");
    let s = add_exclamation(s);  // 重新綁定到返回值
    println!("{}", s);  // "Hello!"
}
```

</details>

### 練習 3：Copy vs Move

分析以下程式碼的行為：

```rust
fn analyze_ownership() {
    let x = 5;
    let y = x;
    
    let s1 = String::from("Hello");
    let s2 = s1;
    
    println!("x = {}", x);   // 這行能編譯嗎？
    // println!("s1 = {}", s1); // 這行能編譯嗎？
    println!("y = {}", y);   // 這行能編譯嗎？  
    println!("s2 = {}", s2); // 這行能編譯嗎？
}
```

---

## 7. 深入思考

### 思考題 1
為什麼 Rust 選擇了移動語義作為預設行為，而不是複製？

### 思考題 2  
如果一個型別同時實現了 `Copy` 和 `Drop`，會發生什麼問題？

### 思考題 3
在什麼情況下，你會選擇 `clone()` 而不是移動所有權？

---

## 8. 下一步預習

在下一個單元中，我們將探索：
- **借用（Borrowing）** 如何在不轉移所有權的情況下使用值
- **參考（References）** 的語法和規則
- **可變借用** 與 **不可變借用** 的限制和保證

---

## 8. 本單元實踐範例

### 📁 範例程式清單

| 範例 | 檔案 | 重點內容 |
|------|------|----------|
| **基礎所有權** | [ownership_basic.rs](./examples/ownership_basic.rs) | 所有權轉移、函數傳參、作用域清理 |
| **記憶體模型** | [memory_model.rs](./examples/memory_model.rs) | 堆疊vs堆積、記憶體佈局、效能對比 |
| **移動語義** | [move_semantics.rs](./examples/move_semantics.rs) | 複雜移動場景、部分移動、策略選擇 |
| **Copy特性** | [copy_trait.rs](./examples/copy_trait.rs) | Copy vs Move、自定義Copy型別、限制 |

### 🏃 運行方式
```bash
# 進入課程根目錄
cd 139-rust-course-ownership

# 運行單元一的範例
cargo run --example ownership_basic
cargo run --example memory_model
cargo run --example move_semantics
cargo run --example copy_trait
```

### 📚 學習建議
1. **依序學習**：建議按照列表順序運行範例
2. **仔細觀察**：注意輸出中的記憶體變化和所有權轉移
3. **修改實驗**：嘗試修改代碼，觀察編譯器的反應
4. **對比理解**：對比不同範例中的所有權處理方式

---

**關鍵要點回顧：**
1. 所有權系統在編譯期保證記憶體安全，無執行期開銷
2. 堆疊用於固定大小資料，堆積用於動態大小資料
3. 三大規則：一個擁有者、同時只能一個、離開作用域自動清理
4. 移動語義防止懸空指標，Copy 特性允許簡單型別複製
5. 理解何時發生移動、何時發生複製是掌握所有權的關鍵
