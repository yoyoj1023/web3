# 單元三：切片型別
## The Slice Type

**課程目標：** 掌握切片這一強大的 Rust 特性，學會安全高效地引用集合的部分資料。

**心智模型：** 切片就像書籍的目錄頁範圍標記 "第10-15頁" - 它不擁有內容，但精確指向原書中的特定部分。

---

## 1. 切片的核心概念

### 1.1 為什麼需要切片？

**問題場景：** 如何寫一個函數來回傳字串中的第一個單字？

```rust
// 有問題的初始嘗試
fn first_word_problematic(s: &String) -> usize {
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return i;
        }
    }
    
    s.len()
}

fn main() {
    let mut s = String::from("hello world");
    let word_end = first_word_problematic(&s); // word_end = 5
    
    s.clear(); // 清空字串
    
    // word_end 仍然是 5，但字串已經空了！
    // 這個索引現在毫無意義且可能危險
}
```

**問題分析：**
- 返回的索引與原字串失去了連結
- 無法保證索引的有效性
- 需要手動維護索引與資料的同步

### 1.2 切片的解決方案

**切片定義：** 切片是對集合中連續元素序列的引用

```rust
// 使用切片的優雅解決方案
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i]; // 返回字串切片
        }
    }
    
    &s[..] // 返回整個字串的切片
}

fn main() {
    let s = String::from("hello world");
    let word = first_word(&s);
    
    println!("第一個單字: {}", word);
    
    // s.clear(); // 編譯錯誤！不能在借用時修改
}
```

---

## 2. 字串切片（String Slices）

### 2.1 字串切片的語法

**基本語法：** `&s[start..end]`

```rust
fn string_slice_syntax() {
    let s = String::from("hello world");
    
    // 基本切片語法
    let hello = &s[0..5];   // "hello"
    let world = &s[6..11];  // "world"
    
    // 語法糖
    let hello2 = &s[..5];   // 等同於 &s[0..5]
    let world2 = &s[6..];   // 等同於 &s[6..11]
    let whole = &s[..];     // 等同於 &s[0..11]
    
    println!("hello: {}", hello);
    println!("world: {}", world);
    println!("whole: {}", whole);
}
```

### 2.2 字串切片的型別

**`&str` vs `String`：**

```rust
fn string_types_comparison() {
    // String - 擁有資料的可增長字串
    let owned = String::from("hello");
    
    // &str - 字串切片，借用資料
    let borrowed: &str = &owned;
    let slice: &str = &owned[1..4]; // "ell"
    
    // 字串字面值本身就是 &str
    let literal: &str = "hello world";
    
    println!("owned: {}", owned);
    println!("borrowed: {}", borrowed);
    println!("slice: {}", slice);
    println!("literal: {}", literal);
}
```

### 2.3 字串切片的實際應用

```rust
fn string_slice_applications() {
    let text = String::from("The quick brown fox jumps over the lazy dog");
    
    // 提取單字
    let words: Vec<&str> = text.split_whitespace().collect();
    println!("單字: {:?}", words);
    
    // 提取前三個單字
    let first_three_words = &words[0..3];
    println!("前三個單字: {:?}", first_three_words);
    
    // 檢查前綴和後綴
    if text.starts_with("The") {
        println!("文字以 'The' 開頭");
    }
    
    if text.ends_with("dog") {
        println!("文字以 'dog' 結尾");
    }
    
    // 安全的字串切片
    let safe_slice = get_safe_slice(&text, 4, 9);
    println!("安全切片: {:?}", safe_slice);
}

fn get_safe_slice(s: &str, start: usize, end: usize) -> Option<&str> {
    if start <= end && end <= s.len() {
        Some(&s[start..end])
    } else {
        None
    }
}
```

---

## 3. 切片作為函數參數

### 3.1 API 設計的最佳實踐

**靈活的參數設計：** 使用 `&str` 而不是 `&String`

```rust
// 不靈活的設計 - 只能接受 String 的引用
fn process_string_ref(s: &String) {
    println!("處理字串: {}", s);
}

// 靈活的設計 - 可以接受 &String, &str, 字串字面值
fn process_str_ref(s: &str) {
    println!("處理字串: {}", s);
}

fn parameter_flexibility_demo() {
    let owned = String::from("owned string");
    let literal = "string literal";
    
    // process_string_ref 的限制
    process_string_ref(&owned);
    // process_string_ref(literal); // 編譯錯誤！
    
    // process_str_ref 的靈活性
    process_str_ref(&owned);    // 可以
    process_str_ref(literal);   // 可以
    process_str_ref(&owned[0..5]); // 可以
}
```

### 3.2 字串處理函數的實作

```rust
// 實用的字串處理函數
fn count_words(text: &str) -> usize {
    if text.trim().is_empty() {
        0
    } else {
        text.split_whitespace().count()
    }
}

fn reverse_words(text: &str) -> String {
    text.split_whitespace()
        .rev()
        .collect::<Vec<&str>>()
        .join(" ")
}

fn find_longest_word(text: &str) -> Option<&str> {
    text.split_whitespace()
        .max_by_key(|word| word.len())
}

fn capitalize_first_letter(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(first) => first.to_uppercase().chain(chars).collect(),
    }
}

fn string_processing_demo() {
    let text = "the quick brown fox jumps over the lazy dog";
    
    println!("原文: {}", text);
    println!("單字數: {}", count_words(text));
    println!("反轉單字順序: {}", reverse_words(text));
    println!("最長的單字: {:?}", find_longest_word(text));
    println!("首字母大寫: {}", capitalize_first_letter(text));
}
```

---

## 4. 其他型別的切片

### 4.1 陣列切片

**語法：** `&[T]` 表示型別 T 的切片

```rust
fn array_slice_demo() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // 各種切片操作
    let first_half = &numbers[0..5];
    let second_half = &numbers[5..];
    let middle = &numbers[2..8];
    let whole = &numbers[..];
    
    println!("原陣列: {:?}", numbers);
    println!("前半部: {:?}", first_half);
    println!("後半部: {:?}", second_half);
    println!("中間部分: {:?}", middle);
    println!("整個陣列: {:?}", whole);
    
    // 切片的長度和索引
    println!("middle 的長度: {}", middle.len());
    println!("middle 的第一個元素: {}", middle[0]);
}
```

### 4.2 向量切片

```rust
fn vector_slice_demo() {
    let mut numbers = vec![1, 2, 3, 4, 5];
    
    // 不可變切片
    let slice = &numbers[1..4];
    println!("向量切片: {:?}", slice);
    
    // 可變切片
    let mutable_slice = &mut numbers[1..4];
    for item in mutable_slice.iter_mut() {
        *item *= 2;
    }
    
    println!("修改後的向量: {:?}", numbers);
    
    // 切片作為函數參數
    let sum = sum_slice(&numbers[1..4]);
    println!("切片 {:?} 的總和: {}", &numbers[1..4], sum);
}

fn sum_slice(slice: &[i32]) -> i32 {
    slice.iter().sum()
}
```

### 4.3 多維切片操作

```rust
fn multidimensional_slice_demo() {
    // 二維向量
    let matrix = vec![
        vec![1, 2, 3],
        vec![4, 5, 6],
        vec![7, 8, 9],
    ];
    
    // 切片行
    let first_row = &matrix[0];
    println!("第一行: {:?}", first_row);
    
    // 切片行的一部分
    let partial_row = &matrix[1][1..];
    println!("第二行的後半部: {:?}", partial_row);
    
    // 處理二維資料
    for (i, row) in matrix.iter().enumerate() {
        let row_sum: i32 = row.iter().sum();
        println!("第 {} 行的總和: {}", i + 1, row_sum);
    }
}
```

---

## 5. 切片的進階應用

### 5.1 切片模式匹配

```rust
fn slice_pattern_matching() {
    let numbers = [1, 2, 3, 4, 5];
    
    match &numbers[..] {
        [] => println!("空切片"),
        [x] => println!("單元素切片: {}", x),
        [x, y] => println!("雙元素切片: {}, {}", x, y),
        [first, .., last] => println!("首尾元素: {}, {}", first, last),
        _ => println!("其他情況"),
    }
    
    // 處理字串切片
    let text = "hello,world,rust";
    match text.split(',').collect::<Vec<&str>>().as_slice() {
        [single] => println!("單一元素: {}", single),
        [first, second] => println!("兩個元素: {}, {}", first, second),
        [first, middle @ .., last] => {
            println!("首: {}, 中: {:?}, 尾: {}", first, middle, last);
        }
        _ => println!("其他模式"),
    }
}
```

### 5.2 切片的窗口操作

```rust
fn slice_window_operations() {
    let data = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // 固定窗口滑動
    println!("3元素滑動窗口:");
    for window in data.windows(3) {
        println!("  {:?}", window);
    }
    
    // 分塊處理
    println!("3元素分塊:");
    for chunk in data.chunks(3) {
        println!("  {:?}", chunk);
    }
    
    // 可變分塊
    let mut numbers = vec![1, 2, 3, 4, 5, 6];
    for chunk in numbers.chunks_mut(2) {
        for item in chunk.iter_mut() {
            *item *= 10;
        }
    }
    println!("修改後: {:?}", numbers);
}
```

### 5.3 高效能字串處理

```rust
fn high_performance_string_processing() {
    let large_text = "This is a very long text with many words that we want to process efficiently without unnecessary allocations";
    
    // 零分配的單字計數
    let word_count = large_text.split_whitespace().count();
    println!("單字數: {}", word_count);
    
    // 查找符合條件的單字（零分配）
    let long_words: Vec<&str> = large_text
        .split_whitespace()
        .filter(|word| word.len() > 5)
        .collect();
    println!("長單字: {:?}", long_words);
    
    // 高效的字串搜尋
    if let Some(pos) = find_word_position(large_text, "very") {
        println!("找到 'very' 在位置: {}", pos);
    }
}

fn find_word_position(text: &str, target: &str) -> Option<usize> {
    let mut pos = 0;
    for word in text.split_whitespace() {
        if word == target {
            return Some(pos);
        }
        pos += word.len() + 1; // +1 for space
    }
    None
}
```

---

## 6. 實戰練習

### 練習 1：實作字串處理函數

實作一個函數，接收一個字串切片，返回其中所有單字的第一個字母組成的字串。

<details>
<summary>解答</summary>

```rust
fn first_letters(text: &str) -> String {
    text.split_whitespace()
        .filter_map(|word| word.chars().next())
        .collect()
}

// 測試
fn test_first_letters() {
    let text = "Hello World Rust Programming";
    let result = first_letters(text);
    println!("'{}'的首字母: '{}'", text, result); // "HWRP"
}
```

</details>

### 練習 2：陣列切片操作

實作一個函數，找到陣列中最大值的位置，並返回該位置前後各兩個元素的切片（如果存在）。

<details>
<summary>解答</summary>

```rust
fn around_max(slice: &[i32]) -> Option<&[i32]> {
    if slice.is_empty() {
        return None;
    }
    
    // 找到最大值的位置
    let max_pos = slice
        .iter()
        .enumerate()
        .max_by_key(|(_, &value)| value)?
        .0;
    
    // 計算切片範圍
    let start = max_pos.saturating_sub(2);
    let end = std::cmp::min(max_pos + 3, slice.len());
    
    Some(&slice[start..end])
}

// 測試
fn test_around_max() {
    let numbers = [1, 3, 7, 2, 9, 4, 5];
    if let Some(around) = around_max(&numbers) {
        println!("最大值周圍: {:?}", around); // [3, 7, 2, 9, 4]
    }
}
```

</details>

### 練習 3：高效文字分析

實作一個函數，統計字串中每個單字的出現次數，使用切片避免不必要的分配。

<details>
<summary>解答</summary>

```rust
use std::collections::HashMap;

fn word_count(text: &str) -> HashMap<&str, usize> {
    let mut counts = HashMap::new();
    
    for word in text.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }
    
    counts
}

// 測試
fn test_word_count() {
    let text = "hello world hello rust world";
    let counts = word_count(text);
    for (word, count) in counts {
        println!("'{}': {}", word, count);
    }
}
```

</details>

---

## 7. 深入思考

### 思考題 1
為什麼字串切片 `&str` 比 `String` 更適合作為函數參數？

### 思考題 2  
切片如何在不複製資料的情況下提供安全的記憶體存取？

### 思考題 3
在什麼情況下你會選擇使用 `&[T]` 而不是 `&Vec<T>` 作為函數參數？

---

## 8. 性能考量和最佳實踐

### 8.1 零成本抽象

```rust
fn zero_cost_abstractions() {
    let data = "hello,world,rust,programming";
    
    // 這種操作不會分配新記憶體
    let parts: Vec<&str> = data.split(',').collect();
    
    // 所有這些切片都指向原始字串
    for part in parts {
        println!("部分: {}", part);
    }
    
    // 編譯器會將切片操作優化為簡單的指標算術
}
```

### 8.2 切片的安全保證

```rust
fn slice_safety_guarantees() {
    let data = vec![1, 2, 3, 4, 5];
    let slice = &data[1..4]; // [2, 3, 4]
    
    // 切片保證:
    // 1. 索引範圍有效
    // 2. 資料在切片生命週期內不會被釋放
    // 3. 無法通過切片修改原資料（除非是可變切片）
    
    println!("安全的切片: {:?}", slice);
    
    // drop(data); // 編譯錯誤！切片還在使用
}
```

---

## 9. 本單元實踐範例

### 📁 範例程式清單

| 範例 | 檔案 | 重點內容 |
|------|------|----------|
| **切片應用大全** | [slice_examples.rs](./examples/slice_examples.rs) | 字串切片、陣列切片、高效文字處理、模式匹配 |

### 🏃 運行方式
```bash
# 進入課程根目錄
cd 139-rust-course-ownership

# 運行單元三的範例
cargo run --example slice_examples
```

### 📚 學習建議
1. **全面體驗**：這個範例展示了切片的各種應用場景
2. **效能關注**：注意範例中的零分配字串處理技巧
3. **模式學習**：學習切片在模式匹配中的強大功能
4. **實際應用**：觀察如何用切片設計高效的 API

---

**關鍵要點回顧：**
1. 切片提供對集合部分資料的安全借用
2. `&str` 比 `&String` 更靈活，是字串參數的最佳選擇
3. `&[T]` 是處理陣列和向量的通用介面
4. 切片操作是零成本抽象，編譯器會高度優化
5. 切片結合模式匹配提供強大的資料處理能力
