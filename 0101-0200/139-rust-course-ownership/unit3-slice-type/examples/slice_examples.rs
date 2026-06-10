/// 切片應用綜合範例
/// 展示字串切片和陣列切片的實際用途

fn main() {
    println!("=== Rust 切片應用範例 ===\n");
    
    // 1. 字串切片基礎
    println!("1. 字串切片基礎");
    string_slice_basics();
    println!();
    
    // 2. 字串處理實戰
    println!("2. 字串處理實戰");
    string_processing_examples();
    println!();
    
    // 3. 陣列切片操作
    println!("3. 陣列切片操作");
    array_slice_operations();
    println!();
    
    // 4. 高效能文字分析
    println!("4. 高效能文字分析");
    efficient_text_analysis();
    println!();
    
    // 5. 切片模式匹配
    println!("5. 切片模式匹配");
    slice_pattern_matching();
    println!();
}

/// 字串切片基礎操作
fn string_slice_basics() {
    let text = String::from("Hello, Rust Programming!");
    
    // 基本切片操作
    let hello = &text[0..5];
    let rust = &text[7..11];
    let programming = &text[12..23];
    
    println!("原文: {}", text);
    println!("切片 'Hello': {}", hello);
    println!("切片 'Rust': {}", rust);
    println!("切片 'Programming': {}", programming);
    
    // 語法糖示範
    let beginning = &text[..5];    // 等同於 &text[0..5]
    let ending = &text[7..];       // 從索引7到結尾
    let whole = &text[..];         // 整個字串
    
    println!("開頭: {}", beginning);
    println!("結尾: {}", ending);
    println!("全部: {}", whole);
    
    // 安全的切片函數
    println!("安全切片: {:?}", safe_slice(&text, 7, 11));
    println!("超出範圍: {:?}", safe_slice(&text, 50, 60));
}

fn safe_slice(s: &str, start: usize, end: usize) -> Option<&str> {
    if start <= end && end <= s.len() {
        Some(&s[start..end])
    } else {
        None
    }
}

/// 字串處理實戰範例
fn string_processing_examples() {
    let sentence = "The quick brown fox jumps over the lazy dog";
    
    // 1. 提取第一個和最後一個單字
    let first_word = first_word(sentence);
    let last_word = last_word(sentence);
    println!("第一個單字: {}", first_word);
    println!("最後一個單字: {}", last_word);
    
    // 2. 統計單字數量
    let word_count = count_words(sentence);
    println!("單字總數: {}", word_count);
    
    // 3. 找到最長的單字
    if let Some(longest) = find_longest_word(sentence) {
        println!("最長的單字: {} (長度: {})", longest, longest.len());
    }
    
    // 4. 檢查是否包含特定單字
    let target = "fox";
    println!("是否包含 '{}': {}", target, contains_word(sentence, target));
    
    // 5. 提取所有長單字
    let long_words = find_long_words(sentence, 4);
    println!("長度 > 4 的單字: {:?}", long_words);
    
    // 6. 處理 CSV 資料
    let csv_line = "Alice,25,Engineer,New York";
    let fields = parse_csv_line(csv_line);
    println!("CSV 欄位: {:?}", fields);
}

fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    
    s
}

fn last_word(s: &str) -> &str {
    s.split_whitespace().last().unwrap_or("")
}

fn count_words(s: &str) -> usize {
    s.split_whitespace().count()
}

fn find_longest_word(s: &str) -> Option<&str> {
    s.split_whitespace()
        .max_by_key(|word| word.len())
}

fn contains_word(text: &str, word: &str) -> bool {
    text.split_whitespace().any(|w| w == word)
}

fn find_long_words(text: &str, min_length: usize) -> Vec<&str> {
    text.split_whitespace()
        .filter(|word| word.len() > min_length)
        .collect()
}

fn parse_csv_line(line: &str) -> Vec<&str> {
    line.split(',')
        .map(|field| field.trim())
        .collect()
}

/// 陣列切片操作示範
fn array_slice_operations() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // 基本切片操作
    println!("原陣列: {:?}", numbers);
    println!("前5個: {:?}", &numbers[..5]);
    println!("後5個: {:?}", &numbers[5..]);
    println!("中間部分: {:?}", &numbers[2..8]);
    
    // 數學運算
    let slice = &numbers[1..6]; // [2, 3, 4, 5, 6]
    println!("切片: {:?}", slice);
    println!("總和: {}", sum_slice(slice));
    println!("平均值: {:.2}", average_slice(slice));
    println!("最大值: {:?}", max_slice(slice));
    println!("最小值: {:?}", min_slice(slice));
    
    // 查找操作
    let target = 5;
    if let Some(index) = find_in_slice(slice, target) {
        println!("在切片中找到 {} 的索引: {}", target, index);
    }
    
    // 可變切片操作
    let mut mutable_array = [1, 2, 3, 4, 5];
    let mutable_slice = &mut mutable_array[1..4];
    multiply_slice(mutable_slice, 10);
    println!("修改後的陣列: {:?}", mutable_array);
    
    // 向量切片
    let vector = vec![10, 20, 30, 40, 50, 60, 70];
    let vector_slice = &vector[2..5];
    println!("向量切片: {:?}", vector_slice);
    
    // 巢狀切片
    let matrix = vec![
        vec![1, 2, 3, 4],
        vec![5, 6, 7, 8],
        vec![9, 10, 11, 12],
    ];
    
    // 處理二維資料
    process_matrix(&matrix);
}

fn sum_slice(slice: &[i32]) -> i32 {
    slice.iter().sum()
}

fn average_slice(slice: &[i32]) -> f64 {
    if slice.is_empty() {
        0.0
    } else {
        slice.iter().sum::<i32>() as f64 / slice.len() as f64
    }
}

fn max_slice(slice: &[i32]) -> Option<i32> {
    slice.iter().copied().max()
}

fn min_slice(slice: &[i32]) -> Option<i32> {
    slice.iter().copied().min()
}

fn find_in_slice(slice: &[i32], target: i32) -> Option<usize> {
    slice.iter().position(|&x| x == target)
}

fn multiply_slice(slice: &mut [i32], factor: i32) {
    for item in slice.iter_mut() {
        *item *= factor;
    }
}

fn process_matrix(matrix: &[Vec<i32>]) {
    for (row_index, row) in matrix.iter().enumerate() {
        let row_sum: i32 = row.iter().sum();
        println!("第 {} 行: {:?}, 總和: {}", row_index + 1, row, row_sum);
        
        // 處理行的切片
        if row.len() >= 2 {
            let middle = &row[1..row.len()-1];
            println!("  中間元素: {:?}", middle);
        }
    }
}

/// 高效能文字分析
fn efficient_text_analysis() {
    let text = r#"
        Rust is a systems programming language that runs blazingly fast,
        prevents segfaults, and guarantees thread safety. It accomplishes
        these goals by being memory safe without using garbage collection.
        Rust also has excellent documentation, a friendly compiler with
        useful error messages, and top-notch tooling.
    "#;
    
    let clean_text = text.trim();
    
    // 零分配的分析
    println!("文字分析 (零分配):");
    println!("字元數: {}", clean_text.len());
    println!("行數: {}", clean_text.lines().count());
    println!("單字數: {}", clean_text.split_whitespace().count());
    
    // 統計單字長度分布
    let word_lengths: Vec<usize> = clean_text
        .split_whitespace()
        .map(|word| word.trim_matches(|c: char| !c.is_alphanumeric()).len())
        .collect();
    
    println!("平均單字長度: {:.2}", 
             word_lengths.iter().sum::<usize>() as f64 / word_lengths.len() as f64);
    
    // 找到特定長度的單字
    let medium_words: Vec<&str> = clean_text
        .split_whitespace()
        .filter(|word| {
            let clean_word = word.trim_matches(|c: char| !c.is_alphanumeric());
            clean_word.len() >= 5 && clean_word.len() <= 8
        })
        .collect();
    
    println!("中等長度單字 (5-8字母): {:?}", medium_words);
    
    // 關鍵字搜尋
    let keywords = ["Rust", "memory", "safety", "fast"];
    for keyword in keywords {
        let count = count_occurrences(clean_text, keyword);
        if count > 0 {
            println!("關鍵字 '{}' 出現 {} 次", keyword, count);
        }
    }
}

fn count_occurrences(text: &str, pattern: &str) -> usize {
    text.split_whitespace()
        .filter(|word| word.to_lowercase().contains(&pattern.to_lowercase()))
        .count()
}

/// 切片模式匹配示範
fn slice_pattern_matching() {
    println!("=== 陣列切片模式匹配 ===");
    
    let numbers = [1, 2, 3, 4, 5];
    analyze_slice(&numbers);
    
    let few_numbers = [42];
    analyze_slice(&few_numbers);
    
    let empty: [i32; 0] = [];
    analyze_slice(&empty);
    
    println!("\n=== 字串切片模式匹配 ===");
    
    let commands = ["start", "hello world", "stop"];
    for command in commands {
        process_command(command);
    }
    
    println!("\n=== 高級模式匹配 ===");
    
    let data_sets = [
        vec![],
        vec![1],
        vec![1, 2],
        vec![1, 2, 3, 4, 5],
    ];
    
    for data in data_sets {
        analyze_vector_pattern(&data);
    }
}

fn analyze_slice(slice: &[i32]) {
    match slice {
        [] => println!("空切片"),
        [x] => println!("單元素切片: {}", x),
        [x, y] => println!("雙元素切片: {}, {}", x, y),
        [first, .., last] => println!("多元素切片，首: {}, 尾: {}", first, last),
    }
}

fn process_command(command: &str) {
    let parts: Vec<&str> = command.split_whitespace().collect();
    
    match parts.as_slice() {
        [] => println!("空命令"),
        ["start"] => println!("啟動系統"),
        ["stop"] => println!("停止系統"),
        ["hello", name] => println!("你好, {}!", name),
        ["hello", first, last] => println!("你好, {} {}!", first, last),
        ["set", key, value] => println!("設定 {} = {}", key, value),
        [cmd, args @ ..] => println!("執行命令 '{}' 參數: {:?}", cmd, args),
    }
}

fn analyze_vector_pattern(vec: &[i32]) {
    match vec {
        [] => println!("向量: 空的"),
        [single] => println!("向量: 單一元素 {}", single),
        [first, second] => println!("向量: 兩個元素 {}, {}", first, second),
        [first, middle @ .., last] => {
            println!("向量: 首 {}, 中 {:?}, 尾 {}", first, middle, last);
        }
    }
}

/// 進階切片應用
#[allow(dead_code)]
fn advanced_slice_applications() {
    // 1. 滑動窗口
    let data = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    println!("滑動窗口 (大小 3):");
    for window in data.windows(3) {
        let sum: i32 = window.iter().sum();
        println!("  {:?} -> 總和: {}", window, sum);
    }
    
    // 2. 分塊處理
    println!("\n分塊處理 (大小 3):");
    for chunk in data.chunks(3) {
        let avg = chunk.iter().sum::<i32>() as f64 / chunk.len() as f64;
        println!("  {:?} -> 平均: {:.2}", chunk, avg);
    }
    
    // 3. 二分搜尋
    let sorted_data = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    let target = 11;
    
    if let Some(index) = binary_search(&sorted_data, target) {
        println!("二分搜尋找到 {} 在索引 {}", target, index);
    }
    
    // 4. 合併排序的合併步驟
    let left = [1, 3, 5, 7];
    let right = [2, 4, 6, 8];
    let merged = merge_sorted_slices(&left, &right);
    println!("合併排序: {:?} + {:?} = {:?}", left, right, merged);
}

fn binary_search(slice: &[i32], target: i32) -> Option<usize> {
    let mut left = 0;
    let mut right = slice.len();
    
    while left < right {
        let mid = left + (right - left) / 2;
        match slice[mid].cmp(&target) {
            std::cmp::Ordering::Equal => return Some(mid),
            std::cmp::Ordering::Less => left = mid + 1,
            std::cmp::Ordering::Greater => right = mid,
        }
    }
    
    None
}

fn merge_sorted_slices(left: &[i32], right: &[i32]) -> Vec<i32> {
    let mut result = Vec::with_capacity(left.len() + right.len());
    let mut left_idx = 0;
    let mut right_idx = 0;
    
    while left_idx < left.len() && right_idx < right.len() {
        if left[left_idx] <= right[right_idx] {
            result.push(left[left_idx]);
            left_idx += 1;
        } else {
            result.push(right[right_idx]);
            right_idx += 1;
        }
    }
    
    result.extend_from_slice(&left[left_idx..]);
    result.extend_from_slice(&right[right_idx..]);
    
    result
}
