# 單元二隨堂測驗：參考與借用

**測驗時間：** 40 分鐘  
**總分：** 100 分  
**及格分數：** 70 分

---

## 📝 第一部分：選擇題（每題 8 分，共 40 分）

### 1. 關於借用的描述，何者正確？
A. 借用會轉移所有權  
B. 借用讓你在不獲得所有權的情況下使用值  
C. 借用只能用於堆積上的資料  
D. 借用會複製資料

### 2. 同一時間內，對同一個值可以有多少個不可變借用？
A. 只能有 1 個  
B. 最多 2 個  
C. 任意數量  
D. 根據資料型別而定

### 3. 同一時間內，對同一個值可以有多少個可變借用？
A. 只能有 1 個  
B. 最多 2 個  
C. 任意數量  
D. 根據資料型別而定

### 4. 可變借用和不可變借用能否同時存在？
A. 可以，沒有限制  
B. 不可以，會導致編譯錯誤  
C. 只有在特殊情況下可以  
D. 取決於資料的大小

### 5. 什麼是懸掛參考？
A. 指向堆疊上資料的參考  
B. 指向已被釋放記憶體的參考  
C. 指向可變資料的參考  
D. 指向複製資料的參考

---

## ✍️ 第二部分：程式碼分析題（每題 15 分，共 30 分）

### 6. 分析借用錯誤

```rust
fn problem_code() {
    let mut s = String::from("hello");
    
    let r1 = &s;
    let r2 = &s;
    let r3 = &mut s;
    
    println!("{}, {}, {}", r1, r2, r3);
}
```

請回答：
a) 這段程式碼會產生什麼編譯錯誤？
b) 為什麼會產生這個錯誤？
c) 提供兩種修復方案。

### 7. 生命週期分析

```rust
fn analyze_lifetime() {
    let string1 = String::from("abcd");
    let result;
    
    {
        let string2 = String::from("xyz");
        result = longer(&string1, &string2);
    }
    
    println!("Result: {}", result);
}

fn longer(x: &str, y: &str) -> &str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

請分析：
a) 這段程式碼能否編譯成功？
b) 如果不能，是什麼原因？
c) 如何修復這個問題？

---

## 🧠 第三部分：實作題（每題 15 分，共 30 分）

### 8. 修復借用錯誤

以下程式碼有借用相關的錯誤，請修復它：

```rust
fn broken_function() {
    let mut numbers = vec![1, 2, 3, 4, 5];
    
    let first = &numbers[0];
    numbers.push(6);
    println!("第一個數字: {}", first);
    
    let last = &mut numbers[numbers.len() - 1];
    let second_last = &numbers[numbers.len() - 2];
    *last += *second_last;
    
    println!("修改後的最後一個數字: {}", last);
}
```

### 9. 設計函數接口

設計一個函數 `find_and_replace`，滿足以下要求：
- 接收一個字串向量的可變借用
- 接收要查找的字串的借用
- 接收替換字串的借用
- 將向量中所有匹配的字串替換為新字串
- 返回替換的次數

提供完整的函數實作和使用範例。

---

# 📊 測驗解答

## 第一部分：選擇題解答

### 1. 答案：B
**解釋：** 借用的核心概念是讓你在不獲得所有權的情況下使用值。通過參考（&），你可以讀取或修改資料而不需要取得所有權。

### 2. 答案：C  
**解釋：** 對同一個值可以同時存在任意數量的不可變借用，因為多個讀取者不會互相干擾。

### 3. 答案：A
**解釋：** 同一時間只能有一個可變借用，這是 Rust 防止資料競爭的核心機制。

### 4. 答案：B
**解釋：** 可變借用和不可變借用不能同時存在，這會導致編譯錯誤。這防止了在有人正在修改資料時其他人還在讀取。

### 5. 答案：B
**解釋：** 懸掛參考是指向已經被釋放記憶體的參考，這是一種嚴重的記憶體安全問題，Rust 的借用檢查器會在編譯期防止這種情況。

---

## 第二部分：程式碼分析題解答

### 6. 借用錯誤分析（15分）

**a) 編譯錯誤（5分）**
```
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable
```

**b) 錯誤原因（5分）**
程式碼同時建立了不可變借用（r1, r2）和可變借用（r3）。根據 Rust 的借用規則，不可變借用和可變借用不能同時存在。

**c) 修復方案（5分）**

方案1：使用作用域分離借用
```rust
fn fixed_code_1() {
    let mut s = String::from("hello");
    
    {
        let r1 = &s;
        let r2 = &s;
        println!("{}, {}", r1, r2);
    } // r1, r2 在此結束
    
    let r3 = &mut s;
    println!("{}", r3);
}
```

方案2：利用 NLL（非詞法生命週期）
```rust
fn fixed_code_2() {
    let mut s = String::from("hello");
    
    let r1 = &s;
    let r2 = &s;
    println!("{}, {}", r1, r2); // r1, r2 最後使用，借用結束
    
    let r3 = &mut s; // 現在可以建立可變借用
    println!("{}", r3);
}
```

### 7. 生命週期分析（15分）

**a) 編譯結果（5分）**
這段程式碼無法編譯成功。

**b) 原因分析（5分）**
`string2` 在內層作用域結束時被丟棄，但 `result` 可能指向 `string2`。當程式嘗試在外層作用域使用 `result` 時，它可能指向已被釋放的記憶體。

**c) 修復方案（5分）**

方案1：確保所有資料都有足夠長的生命週期
```rust
fn fixed_lifetime_1() {
    let string1 = String::from("abcd");
    let string2 = String::from("xyz"); // 移到外層作用域
    
    let result = longer(&string1, &string2);
    println!("Result: {}", result);
}
```

方案2：返回所有權而非借用
```rust
fn longer_owned(x: &str, y: &str) -> String {
    if x.len() > y.len() {
        x.to_string()
    } else {
        y.to_string()
    }
}

fn fixed_lifetime_2() {
    let string1 = String::from("abcd");
    let result;
    
    {
        let string2 = String::from("xyz");
        result = longer_owned(&string1, &string2);
    }
    
    println!("Result: {}", result);
}
```

---

## 第三部分：實作題解答

### 8. 修復借用錯誤（15分）

**問題分析：**
1. `first` 借用了 `numbers`，但接著 `push` 需要可變借用
2. `last` 和 `second_last` 同時借用了 `numbers`，一個可變一個不可變

**修復後的程式碼：**
```rust
fn fixed_function() {
    let mut numbers = vec![1, 2, 3, 4, 5];
    
    // 方案1：縮短借用範圍
    {
        let first = &numbers[0];
        println!("第一個數字: {}", first);
    } // first 借用結束
    
    numbers.push(6);
    
    // 方案2：分開處理借用
    let last_index = numbers.len() - 1;
    let second_last_value = numbers[numbers.len() - 2]; // 複製值
    numbers[last_index] += second_last_value;
    
    println!("修改後的最後一個數字: {}", numbers[last_index]);
}

// 更優雅的版本
fn elegant_fixed_function() {
    let mut numbers = vec![1, 2, 3, 4, 5];
    
    // 先處理需要不可變借用的邏輯
    let first_value = numbers[0];
    println!("第一個數字: {}", first_value);
    
    // 然後處理需要可變借用的邏輯
    numbers.push(6);
    
    // 安全地修改最後一個元素
    let len = numbers.len();
    if len >= 2 {
        let second_last_value = numbers[len - 2];
        numbers[len - 1] += second_last_value;
        println!("修改後的最後一個數字: {}", numbers[len - 1]);
    }
}
```

### 9. 設計函數接口（15分）

**函數實作：**
```rust
fn find_and_replace(
    strings: &mut Vec<String>,
    target: &str,
    replacement: &str,
) -> usize {
    let mut count = 0;
    
    for string in strings.iter_mut() {
        if string == target {
            *string = replacement.to_string();
            count += 1;
        }
    }
    
    count
}

// 使用範例
fn main() {
    let mut words = vec![
        String::from("hello"),
        String::from("world"),
        String::from("hello"),
        String::from("rust"),
        String::from("hello"),
    ];
    
    println!("替換前: {:?}", words);
    
    let replacements = find_and_replace(&mut words, "hello", "hi");
    
    println!("替換後: {:?}", words);
    println!("替換了 {} 個字串", replacements);
}
```

**進階版本（支援部分匹配）：**
```rust
fn find_and_replace_partial(
    strings: &mut Vec<String>,
    target: &str,
    replacement: &str,
) -> usize {
    let mut count = 0;
    
    for string in strings.iter_mut() {
        if string.contains(target) {
            *string = string.replace(target, replacement);
            count += 1;
        }
    }
    
    count
}
```

**評分標準：**
- 正確的函數簽名（借用型別正確）：5分
- 正確的實作邏輯：5分
- 完整的使用範例：3分
- 程式碼風格和註釋：2分

---

## 🎯 評分等級

- **90-100分：** 優秀 - 深入理解借用機制和生命週期
- **80-89分：** 良好 - 很好掌握借用規則，能解決實際問題  
- **70-79分：** 及格 - 基本理解借用概念
- **60-69分：** 不及格 - 需要重新學習借用規則
- **60分以下：** 不及格 - 建議重新完整學習本單元

## 📚 復習建議

如果分數不理想，建議重點復習：
1. **借用的基本概念和語法（& 和 &mut）**
2. **不可變借用與可變借用的規則和限制**  
3. **生命週期的基本概念和常見問題**
4. **如何分析和修復借用檢查器錯誤**
5. **NLL（非詞法生命週期）的工作原理**
