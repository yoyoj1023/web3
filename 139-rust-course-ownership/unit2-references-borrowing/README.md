# 單元二：參考與借用
## References and Borrowing

**課程目標：** 深入理解 Rust 借用系統，掌握在不轉移所有權的情況下安全存取資料的方法。

**心智模型：** 借用就像圖書館的閱覽室：你可以在不取走書籍的情況下閱讀（不可變借用），或者申請獨佔編輯權來修改文件（可變借用），但不能同時進行。

---

## 1. 什麼是借用？

### 1.1 借用的核心概念

**問題：** 如果每次函數呼叫都需要轉移所有權，程式設計會變得非常不便：

```rust
// 沒有借用的世界 - 非常不便
fn main() {
    let s = String::from("Hello");
    let len = calculate_length(s); // s 被移動
    // println!("{}", s); // 錯誤！s 已經無效
    println!("長度: {}", len);
}

fn calculate_length(s: String) -> usize {
    s.len()
} // s 被丟棄
```

**解決方案：** 使用**參考（Reference）**來**借用（Borrow）**值：

```rust
// 使用借用 - 優雅且高效
fn main() {
    let s = String::from("Hello");
    let len = calculate_length(&s); // 借用 s
    println!("字串 '{}' 的長度是 {}", s, len); // s 仍然有效！
}

fn calculate_length(s: &String) -> usize {
    s.len()
} // s 是借用，不會被丟棄
```

### 1.2 參考的語法

**建立參考：** 使用 `&` 運算子
```rust
let s = String::from("Hello");
let r = &s; // r 是 s 的參考
```

**使用參考：** 自動解參考
```rust
println!("通過參考存取：{}", r); // 自動解參考
println!("明確解參考：{}", *r);   // 手動解參考（通常不需要）
```

**參考的型別：**
```rust
let s: String = String::from("Hello");
let r: &String = &s; // r 的型別是 &String
```

---

## 2. 不可變借用（Immutable Borrows）

### 2.1 基本不可變借用

```rust
fn immutable_borrow_demo() {
    let s = String::from("Hello");
    
    let r1 = &s; // 第一個不可變借用
    let r2 = &s; // 第二個不可變借用
    let r3 = &s; // 第三個不可變借用
    
    println!("r1: {}", r1);
    println!("r2: {}", r2);
    println!("r3: {}", r3);
    println!("原始: {}", s);
    
    // 所有變數都有效，可以同時存在多個不可變借用
}
```

### 2.2 不可變借用的規則

**規則：** 同一時間可以有任意數量的不可變借用

```rust
fn multiple_immutable_borrows() {
    let data = vec![1, 2, 3, 4, 5];
    
    // 可以同時存在多個不可變借用
    let first_ref = &data;
    let second_ref = &data;
    let third_ref = &data;
    
    // 都可以讀取資料
    println!("第一個引用: {:?}", first_ref);
    println!("第二個引用: {:?}", second_ref);
    println!("第三個引用: {:?}", third_ref);
    
    // 原始變數也可以讀取
    println!("原始向量: {:?}", data);
}
```

### 2.3 不可變借用的限制

**不能通過不可變借用修改資料：**

```rust
fn cannot_modify_through_immutable_borrow() {
    let mut s = String::from("Hello");
    let r = &s; // 不可變借用
    
    // r.push_str(" World"); // 編譯錯誤！不能通過不可變借用修改
    
    println!("r: {}", r);
}
```

---

## 3. 可變借用（Mutable Borrows）

### 3.1 基本可變借用

```rust
fn mutable_borrow_demo() {
    let mut s = String::from("Hello");
    
    {
        let r = &mut s; // 可變借用
        r.push_str(" World"); // 可以修改
        println!("可變借用修改後: {}", r);
    } // r 離開作用域
    
    println!("原始字串: {}", s); // "Hello World"
}
```

### 3.2 可變借用的嚴格規則

**規則：** 同一時間只能有**一個**可變借用

```rust
fn single_mutable_borrow() {
    let mut s = String::from("Hello");
    
    let r1 = &mut s; // 第一個可變借用
    // let r2 = &mut s; // 編譯錯誤！不能同時有多個可變借用
    
    r1.push_str(" World");
    println!("r1: {}", r1);
    
    // r1 不再使用後，可以建立新的可變借用
    let r2 = &mut s;
    r2.push('!');
    println!("r2: {}", r2);
}
```

### 3.3 可變借用與不可變借用不能共存

```rust
fn no_mixed_borrows() {
    let mut s = String::from("Hello");
    
    let r1 = &s;     // 不可變借用
    let r2 = &s;     // 另一個不可變借用
    // let r3 = &mut s; // 編譯錯誤！不能在不可變借用存在時建立可變借用
    
    println!("r1: {}, r2: {}", r1, r2);
    
    // r1 和 r2 不再使用後，可以建立可變借用
    let r3 = &mut s;
    r3.push_str(" World");
    println!("r3: {}", r3);
}
```

### 3.4 借用作用域和 NLL（Non-Lexical Lifetimes）

Rust 2018 引入了 NLL，使借用的作用域更加智能：

```rust
fn nll_demo() {
    let mut s = String::from("Hello");
    
    let r1 = &s; // 不可變借用開始
    let r2 = &s; // 另一個不可變借用
    
    println!("r1: {}, r2: {}", r1, r2);
    // r1 和 r2 在此處最後被使用，借用結束
    
    let r3 = &mut s; // 現在可以建立可變借用
    r3.push_str(" World");
    println!("r3: {}", r3);
}
```

---

## 4. 懸掛參考（Dangling References）

### 4.1 什麼是懸掛參考

**懸掛參考：** 指向已經被釋放記憶體的參考

```rust
// 這段程式碼無法編譯
fn dangling_reference() -> &String { // 返回字串的參考
    let s = String::from("hello"); // s 在函數中建立
    &s // 返回 s 的參考
} // s 離開作用域並被丟棄，但參考仍然被返回
```

**編譯錯誤：**
```
error[E0106]: missing lifetime specifier
```

### 4.2 Rust 如何防止懸掛參考

Rust 的借用檢查器通過**生命週期（Lifetimes）**分析防止懸掛參考：

```rust
// 正確的做法 1：返回所有權
fn no_dangling_ownership() -> String {
    let s = String::from("hello");
    s // 返回所有權，不是參考
}

// 正確的做法 2：使用參數的參考
fn no_dangling_parameter(s: &String) -> &String {
    s // 返回參數的參考，生命週期相同
}

// 正確的做法 3：使用靜態字串
fn no_dangling_static() -> &'static str {
    "hello" // 字串字面值有靜態生命週期
}
```

### 4.3 生命週期基礎

**生命週期：** 參考有效的作用域

```rust
fn lifetime_demo() {
    let r;                // 宣告 r
    
    {
        let x = 5;        // x 進入作用域
        r = &x;           // r 借用 x
    }                     // x 離開作用域
    
    // println!("r: {}", r); // 編譯錯誤！x 已經被丟棄
}
```

**生命週期註解範例：**

```rust
// 明確的生命週期註解
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("long string is long");
    let string2 = String::from("xyz");
    
    let result = longest(&string1, &string2);
    println!("最長的字串是: {}", result);
}
```

---

## 5. 借用檢查器的工作原理

### 5.1 編譯期分析

Rust 的借用檢查器在編譯期進行以下分析：

1. **所有權追蹤：** 追蹤每個值的擁有者
2. **借用分析：** 確保借用規則被遵守
3. **生命週期推斷：** 計算參考的有效範圍
4. **安全性驗證：** 防止資料競爭和懸掛參考

```rust
fn borrow_checker_analysis() {
    let mut data = vec![1, 2, 3];
    
    // 階段1：不可變借用
    let read_ref1 = &data;
    let read_ref2 = &data;
    println!("讀取: {:?}, {:?}", read_ref1, read_ref2);
    // read_ref1 和 read_ref2 的生命週期在此結束
    
    // 階段2：可變借用
    let write_ref = &mut data;
    write_ref.push(4);
    println!("修改後: {:?}", write_ref);
    // write_ref 的生命週期在此結束
    
    // 階段3：再次不可變借用
    let read_ref3 = &data;
    println!("最終讀取: {:?}", read_ref3);
}
```

### 5.2 常見的借用錯誤

**錯誤1：同時存在可變和不可變借用**

```rust
fn borrow_error_1() {
    let mut s = String::from("hello");
    
    let r1 = &s;     // 不可變借用
    let r2 = &mut s; // 錯誤！不能在不可變借用存在時建立可變借用
    
    println!("r1: {}, r2: {}", r1, r2);
}
```

**錯誤2：多個可變借用**

```rust
fn borrow_error_2() {
    let mut s = String::from("hello");
    
    let r1 = &mut s; // 第一個可變借用
    let r2 = &mut s; // 錯誤！不能同時有多個可變借用
    
    println!("r1: {}, r2: {}", r1, r2);
}
```

**錯誤3：使用已移動的值**

```rust
fn borrow_error_3() {
    let s1 = String::from("hello");
    let s2 = s1;     // s1 被移動到 s2
    
    let r = &s1;     // 錯誤！s1 已經無效
    println!("r: {}", r);
}
```

---

## 6. 實戰練習

### 練習 1：修復借用錯誤

```rust
// 修復這個函數中的借用錯誤
fn fix_borrow_error() {
    let mut vec = vec![1, 2, 3];
    
    let first = &vec[0];
    vec.push(4);
    println!("第一個元素: {}", first);
}
```

<details>
<summary>解答</summary>

```rust
fn fix_borrow_error() {
    let mut vec = vec![1, 2, 3];
    
    // 方案1：縮短借用範圍
    {
        let first = &vec[0];
        println!("第一個元素: {}", first);
    }
    vec.push(4);
    
    // 方案2：複製值而非借用
    let first_value = vec[0];
    vec.push(4);
    println!("第一個元素: {}", first_value);
}
```

</details>

### 練習 2：設計安全的 API

設計一個函數，接收一個可變向量的借用，在其中找到最大值並將其加倍。

<details>
<summary>解答</summary>

```rust
fn double_max(numbers: &mut Vec<i32>) {
    if let Some(max_index) = find_max_index(numbers) {
        numbers[max_index] *= 2;
    }
}

fn find_max_index(numbers: &[i32]) -> Option<usize> {
    if numbers.is_empty() {
        return None;
    }
    
    let mut max_index = 0;
    for (i, &value) in numbers.iter().enumerate() {
        if value > numbers[max_index] {
            max_index = i;
        }
    }
    Some(max_index)
}

fn main() {
    let mut vec = vec![1, 5, 3, 9, 2];
    println!("修改前: {:?}", vec);
    double_max(&mut vec);
    println!("修改後: {:?}", vec);
}
```

</details>

### 練習 3：理解生命週期

分析以下程式碼的生命週期：

```rust
fn analyze_lifetimes() {
    let string1 = String::from("xyz");
    let result;
    
    {
        let string2 = String::from("abcd");
        result = longest(&string1, &string2);
    }
    
    println!("最長的字串: {}", result);
}

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

**問題：** 這段程式碼能編譯嗎？為什麼？

---

## 7. 深入思考

### 思考題 1
為什麼 Rust 要限制同時只能有一個可變借用？這如何防止資料競爭？

### 思考題 2  
在什麼情況下，你會選擇傳遞所有權而不是借用？

### 思考題 3
借用檢查器如何在零執行期開銷的同時保證記憶體安全？

---

## 8. 本單元實踐範例

### 📁 範例程式清單

| 範例 | 檔案 | 重點內容 |
|------|------|----------|
| **借用實戰** | [borrowing_practice.rs](./examples/borrowing_practice.rs) | 全面的借用規則應用、錯誤解決方案、進階模式 |

### 🏃 運行方式
```bash
# 進入課程根目錄
cd 139-rust-course-ownership

# 運行單元二的範例
cargo run --example borrowing_practice
```

### 📚 學習建議
1. **詳細觀察**：這個範例包含了借用的各種場景
2. **錯誤學習**：注意範例中註釋掉的錯誤代碼，理解為什麼會出錯
3. **實際應用**：觀察如何在實際編程中應用借用規則
4. **解決策略**：學習常見借用問題的解決方案

---

## 9. 下一步預習

在下一個單元中，我們將探索：
- **切片（Slices）** 如何安全地引用集合的一部分
- **字串切片** 的強大功能和實際應用
- **陣列切片** 在高效能程式設計中的作用

---

**關鍵要點回顧：**
1. 借用讓你在不轉移所有權的情況下使用值
2. 不可變借用可以有多個，可變借用只能有一個
3. 可變借用與不可變借用不能同時存在
4. 借用檢查器在編譯期防止懸掛參考和資料競爭
5. NLL 讓借用的作用域更加智能和靈活
