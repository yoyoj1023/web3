# 單元三隨堂測驗：切片型別

**測驗時間：** 30 分鐘  
**總分：** 100 分  
**及格分數：** 70 分

---

## 📝 第一部分：選擇題（每題 10 分，共 40 分）

### 1. 關於切片的描述，何者正確？
A. 切片擁有它所引用的資料  
B. 切片是對集合中連續元素序列的引用  
C. 切片只能用於字串  
D. 切片會複製原始資料

### 2. `&str` 和 `String` 的主要差異是什麼？
A. `&str` 可以修改，`String` 不能  
B. `String` 擁有資料，`&str` 是借用  
C. `&str` 只能存放 ASCII 字元  
D. `String` 比 `&str` 更安全

### 3. 以下哪個切片語法是正確的？
A. `&s[0, 5]`  
B. `&s[0:5]`  
C. `&s[0..5]`  
D. `&s[0-5]`

### 4. 為什麼函數參數推薦使用 `&str` 而不是 `&String`？
A. `&str` 執行速度更快  
B. `&str` 更靈活，可接受多種字串類型  
C. `&str` 佔用記憶體更少  
D. `&String` 會導致編譯錯誤

---

## ✍️ 第二部分：程式碼分析題（每題 15 分，共 30 分）

### 5. 分析切片行為

```rust
fn analyze_slicing() {
    let s = String::from("hello world");
    let hello = &s[0..5];
    let world = &s[6..11];
    
    println!("{} {}", hello, world);
    
    // s.clear();  // Line A
}
```

請回答：
a) Line A 如果取消註釋會發生什麼？
b) `hello` 和 `world` 的型別是什麼？
c) 這些切片是否會複製字串資料？

### 6. 切片範圍分析

```rust
fn slice_ranges() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    let a = &numbers[..3];
    let b = &numbers[3..7];
    let c = &numbers[7..];
    let d = &numbers[..];
    
    println!("a: {:?}", a);
    println!("b: {:?}", b);
    println!("c: {:?}", c);
    println!("d: {:?}", d);
}
```

請說明每個切片包含哪些元素，並解釋 `..` 語法的含義。

---

## 🧠 第三部分：實作題（每題 15 分，共 30 分）

### 7. 實作字串處理函數

實作一個函數 `extract_domain`，從電子郵件地址中提取域名部分：

```rust
fn extract_domain(email: &str) -> Option<&str> {
    // 你的實作
}

// 測試案例
// extract_domain("user@example.com") 應該返回 Some("example.com")
// extract_domain("invalid_email") 應該返回 None
```

### 8. 實作陣列處理函數

實作一個函數 `find_max_subarray_sum`，找到陣列中連續子陣列的最大和，並返回該子陣列的切片：

```rust
fn find_max_subarray_sum(numbers: &[i32]) -> Option<&[i32]> {
    // 你的實作
}

// 測試案例
// find_max_subarray_sum(&[1, -3, 2, 1, -1]) 應該返回 Some(&[2, 1])
// find_max_subarray_sum(&[-1, -2, -3]) 應該返回 Some(&[-1])
```

---

# 📊 測驗解答

## 第一部分：選擇題解答

### 1. 答案：B
**解釋：** 切片是對集合（如字串、陣列、向量）中連續元素序列的引用。它不擁有資料，也不複製資料，只是提供了一個安全的視窗來存取原始資料的一部分。

### 2. 答案：B  
**解釋：** `String` 是擁有資料的可增長字串型別，而 `&str` 是字串切片，只是對字串資料的借用。這個差異反映了 Rust 所有權系統中擁有vs借用的核心概念。

### 3. 答案：C
**解釋：** Rust 中切片的語法是 `&collection[start..end]`，使用 `..` 運算子來指定範圍。

### 4. 答案：B
**解釋：** `&str` 更靈活，因為它可以接受 `&String`、字串字面值、以及任何字串切片。而 `&String` 只能接受 `String` 的引用，限制了函數的通用性。

---

## 第二部分：程式碼分析題解答

### 5. 切片行為分析（15分）

**a) Line A 取消註釋的結果（5分）**
會產生編譯錯誤：`cannot borrow s as mutable because it is also borrowed as immutable`。因為 `hello` 和 `world` 切片還在使用中，不能同時修改 `s`。

**b) 切片的型別（5分）**
`hello` 和 `world` 的型別都是 `&str`（字串切片）。

**c) 是否複製資料（5分）**
不會。切片只是指向原始字串中特定範圍的引用，不會複製任何字串資料。它們只包含指向原始資料的指標和長度資訊。

### 6. 切片範圍分析（15分）

**切片內容：**
- `a = &numbers[..3]` → `[1, 2, 3]`（前3個元素）
- `b = &numbers[3..7]` → `[4, 5, 6, 7]`（索引3到6）
- `c = &numbers[7..]` → `[8, 9, 10]`（從索引7到結尾）
- `d = &numbers[..]` → `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`（整個陣列）

**`..` 語法說明：**
- `..end` 表示從開頭到 end（不包含）
- `start..` 表示從 start 到結尾
- `..` 表示整個範圍
- `start..end` 表示從 start 到 end（不包含 end）

---

## 第三部分：實作題解答

### 7. 字串處理函數（15分）

```rust
fn extract_domain(email: &str) -> Option<&str> {
    // 找到 @ 符號的位置
    let at_pos = email.find('@')?;
    
    // 檢查 @ 後面是否還有內容
    if at_pos + 1 >= email.len() {
        return None;
    }
    
    // 返回 @ 之後的部分
    Some(&email[at_pos + 1..])
}

// 更嚴格的版本，檢查域名格式
fn extract_domain_strict(email: &str) -> Option<&str> {
    let at_pos = email.find('@')?;
    
    if at_pos == 0 || at_pos + 1 >= email.len() {
        return None;
    }
    
    let domain = &email[at_pos + 1..];
    
    // 簡單檢查域名是否包含點
    if domain.contains('.') && !domain.starts_with('.') && !domain.ends_with('.') {
        Some(domain)
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_extract_domain() {
        assert_eq!(extract_domain("user@example.com"), Some("example.com"));
        assert_eq!(extract_domain("test@domain.org"), Some("domain.org"));
        assert_eq!(extract_domain("invalid_email"), None);
        assert_eq!(extract_domain("@domain.com"), Some("domain.com"));
        assert_eq!(extract_domain("user@"), None);
    }
}
```

### 8. 陣列處理函數（15分）

```rust
fn find_max_subarray_sum(numbers: &[i32]) -> Option<&[i32]> {
    if numbers.is_empty() {
        return None;
    }
    
    let mut max_sum = numbers[0];
    let mut current_sum = numbers[0];
    let mut max_start = 0;
    let mut max_end = 0;
    let mut current_start = 0;
    
    for i in 1..numbers.len() {
        if current_sum < 0 {
            current_sum = numbers[i];
            current_start = i;
        } else {
            current_sum += numbers[i];
        }
        
        if current_sum > max_sum {
            max_sum = current_sum;
            max_start = current_start;
            max_end = i;
        }
    }
    
    Some(&numbers[max_start..=max_end])
}

// 簡化版本
fn find_max_subarray_sum_simple(numbers: &[i32]) -> Option<&[i32]> {
    if numbers.is_empty() {
        return None;
    }
    
    let mut best_sum = i32::MIN;
    let mut best_range = (0, 0);
    
    for start in 0..numbers.len() {
        let mut current_sum = 0;
        for end in start..numbers.len() {
            current_sum += numbers[end];
            if current_sum > best_sum {
                best_sum = current_sum;
                best_range = (start, end);
            }
        }
    }
    
    Some(&numbers[best_range.0..=best_range.1])
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_find_max_subarray_sum() {
        assert_eq!(find_max_subarray_sum(&[1, -3, 2, 1, -1]), Some(&[2, 1][..]));
        assert_eq!(find_max_subarray_sum(&[-1, -2, -3]), Some(&[-1][..]));
        assert_eq!(find_max_subarray_sum(&[1, 2, 3]), Some(&[1, 2, 3][..]));
        assert_eq!(find_max_subarray_sum(&[]), None);
        assert_eq!(find_max_subarray_sum(&[5]), Some(&[5][..]));
    }
}
```

**評分標準：**

**第7題：**
- 正確處理 @ 符號查找（5分）
- 正確返回域名部分（5分）
- 適當的錯誤處理（3分）
- 程式碼風格（2分）

**第8題：**
- 正確實作最大子陣列算法（8分）
- 正確返回切片（4分）
- 處理邊界情況（2分）
- 程式碼效率和風格（1分）

---

## 🎯 評分等級

- **90-100分：** 優秀 - 深入理解切片概念和應用
- **80-89分：** 良好 - 很好掌握切片基本操作和語法  
- **70-79分：** 及格 - 基本理解切片用途
- **60-69分：** 不及格 - 需要重新學習切片語法
- **60分以下：** 不及格 - 建議重新完整學習本單元

## 📚 復習建議

如果分數不理想，建議重點復習：
1. **切片的基本語法和範圍表示法（.. 運算子）**
2. **&str 與 String 的差異和使用場景**  
3. **切片作為函數參數的最佳實踐**
4. **陣列和向量切片的實際應用**
5. **切片的安全性保證和效能特性**
