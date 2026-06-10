/// 借用實戰範例
/// 展示各種借用場景和最佳實踐

fn main() {
    println!("=== Rust 借用實戰範例 ===\n");
    
    // 1. 基本借用模式
    println!("1. 基本借用模式");
    basic_borrowing_patterns();
    println!();
    
    // 2. 函數參數借用
    println!("2. 函數參數借用");
    function_parameter_borrowing();
    println!();
    
    // 3. 可變借用實戰
    println!("3. 可變借用實戰");
    mutable_borrowing_practice();
    println!();
    
    // 4. 借用和所有權的組合使用
    println!("4. 借用和所有權的組合使用");
    ownership_borrowing_combination();
    println!();
    
    // 5. 常見錯誤和解決方案
    println!("5. 常見錯誤和解決方案");
    common_errors_and_solutions();
    println!();
}

/// 基本借用模式示範
fn basic_borrowing_patterns() {
    // 不可變借用
    let data = String::from("Hello, Rust!");
    let len = calculate_length(&data);
    println!("字串 '{}' 的長度是 {}", data, len);
    
    // 多個不可變借用
    let first_char = get_first_char(&data);
    let last_char = get_last_char(&data);
    println!("第一個字元: '{}', 最後一個字元: '{}'", first_char, last_char);
    
    // 可變借用
    let mut message = String::from("Hello");
    add_exclamation(&mut message);
    println!("修改後的訊息: '{}'", message);
    
    // 借用後仍可使用原變數
    let original_len = message.len();
    let new_len = calculate_length(&message);
    println!("修改前長度: {}, 修改後長度: {}", original_len - 1, new_len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn get_first_char(s: &String) -> char {
    s.chars().next().unwrap_or(' ')
}

fn get_last_char(s: &String) -> char {
    s.chars().last().unwrap_or(' ')
}

fn add_exclamation(s: &mut String) {
    s.push('!');
}

/// 函數參數借用策略
fn function_parameter_borrowing() {
    println!("=== 不同參數類型的選擇 ===");
    
    let text = String::from("Hello, World!");
    
    // 1. 借用 &String - 只能接受 String 的引用
    print_string_ref(&text);
    
    // 2. 借用 &str - 更靈活，可接受 &String 和 &str
    print_str_ref(&text);
    print_str_ref("直接傳入字串字面值");
    
    // 3. 獲取所有權 String - 會消費原變數
    let owned_text = String::from("This will be consumed");
    let result = process_owned_string(owned_text);
    println!("處理結果: {}", result);
    // println!("原變數: {}", owned_text); // 錯誤：已被移動
    
    // 4. 向量的借用策略
    let numbers = vec![1, 2, 3, 4, 5];
    
    // 借用整個向量
    let sum = sum_vector(&numbers);
    println!("向量 {:?} 的總和: {}", numbers, sum);
    
    // 借用切片（更靈活）
    let slice_sum = sum_slice(&numbers[1..4]);
    println!("切片 {:?} 的總和: {}", &numbers[1..4], slice_sum);
}

fn print_string_ref(s: &String) {
    println!("String 引用: {}", s);
}

fn print_str_ref(s: &str) {
    println!("str 引用: {}", s);
}

fn process_owned_string(s: String) -> String {
    format!("處理過的: {}", s.to_uppercase())
}

fn sum_vector(numbers: &Vec<i32>) -> i32 {
    numbers.iter().sum()
}

fn sum_slice(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

/// 可變借用實戰場景
fn mutable_borrowing_practice() {
    println!("=== 可變借用的實際應用 ===");
    
    // 1. 就地修改向量
    let mut numbers = vec![1, 2, 3, 4, 5];
    println!("修改前: {:?}", numbers);
    
    double_all_numbers(&mut numbers);
    println!("全部加倍後: {:?}", numbers);
    
    add_number(&mut numbers, 100);
    println!("添加元素後: {:?}", numbers);
    
    // 2. 條件修改
    let mut words = vec![
        String::from("hello"),
        String::from("world"),
        String::from("rust"),
        String::from("programming"),
    ];
    println!("修改前的單字: {:?}", words);
    
    capitalize_long_words(&mut words, 5);
    println!("長單字大寫後: {:?}", words);
    
    // 3. 複雜資料結構的修改
    let mut person = Person {
        name: String::from("Alice"),
        age: 25,
        scores: vec![85, 92, 78, 95],
    };
    
    println!("修改前: {:?}", person);
    update_person_info(&mut person);
    println!("修改後: {:?}", person);
}

fn double_all_numbers(numbers: &mut Vec<i32>) {
    for num in numbers.iter_mut() {
        *num *= 2;
    }
}

fn add_number(numbers: &mut Vec<i32>, value: i32) {
    numbers.push(value);
}

fn capitalize_long_words(words: &mut Vec<String>, min_length: usize) {
    for word in words.iter_mut() {
        if word.len() >= min_length {
            *word = word.to_uppercase();
        }
    }
}

#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
    scores: Vec<i32>,
}

fn update_person_info(person: &mut Person) {
    // 修改年齡
    person.age += 1;
    
    // 修改名字
    person.name = format!("Dr. {}", person.name);
    
    // 修改分數（添加獎勵分數）
    for score in person.scores.iter_mut() {
        *score = (*score + 5).min(100); // 最高100分
    }
}

/// 借用和所有權的組合使用
fn ownership_borrowing_combination() {
    println!("=== 借用與所有權的組合策略 ===");
    
    // 1. 建構器模式
    let mut builder = MessageBuilder::new();
    builder
        .add_greeting("Hello")
        .add_name("Alice")
        .add_closing("Best regards");
    
    let message = builder.build();
    println!("構建的訊息: {}", message);
    
    // 2. 借用檢查和效能優化
    let data = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // 高效的借用策略
    let (evens, odds) = separate_even_odd(&data);
    println!("原始資料: {:?}", data);
    println!("偶數: {:?}", evens);
    println!("奇數: {:?}", odds);
    
    // 3. 條件借用
    let mut cache = std::collections::HashMap::new();
    let key = "expensive_computation";
    
    let result = get_or_compute(&mut cache, key, || {
        println!("執行昂貴的計算...");
        42
    });
    println!("第一次結果: {}", result);
    
    let result2 = get_or_compute(&mut cache, key, || {
        println!("這不會被執行");
        0
    });
    println!("第二次結果 (來自快取): {}", result2);
}

struct MessageBuilder {
    parts: Vec<String>,
}

impl MessageBuilder {
    fn new() -> Self {
        MessageBuilder { parts: Vec::new() }
    }
    
    fn add_greeting(&mut self, greeting: &str) -> &mut Self {
        self.parts.push(format!("{},", greeting));
        self
    }
    
    fn add_name(&mut self, name: &str) -> &mut Self {
        self.parts.push(format!("{}!", name));
        self
    }
    
    fn add_closing(&mut self, closing: &str) -> &mut Self {
        self.parts.push(closing.to_string());
        self
    }
    
    fn build(self) -> String {
        self.parts.join(" ")
    }
}

fn separate_even_odd(numbers: &[i32]) -> (Vec<i32>, Vec<i32>) {
    let mut evens = Vec::new();
    let mut odds = Vec::new();
    
    for &num in numbers {
        if num % 2 == 0 {
            evens.push(num);
        } else {
            odds.push(num);
        }
    }
    
    (evens, odds)
}

fn get_or_compute<'a, F>(
    cache: &mut std::collections::HashMap<&'a str, i32>,
    key: &'a str,
    compute: F,
) -> i32
where
    F: FnOnce() -> i32,
{
    if let Some(&value) = cache.get(key) {
        value
    } else {
        let value = compute();
        cache.insert(key, value);
        value
    }
}

/// 常見錯誤和解決方案
fn common_errors_and_solutions() {
    println!("=== 常見借用錯誤的解決方案 ===");
    
    // 問題1：迭代時修改
    println!("問題1: 迭代時修改向量");
    let mut numbers = vec![1, 2, 3, 4, 5];
    
    // 錯誤的做法 (會編譯失敗):
    // for i in 0..numbers.len() {
    //     if numbers[i] % 2 == 0 {
    //         numbers.push(numbers[i] * 10); // 錯誤：在借用時修改
    //     }
    // }
    
    // 正確的做法1：收集要添加的元素
    let to_add: Vec<i32> = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * 10)
        .collect();
    
    numbers.extend(to_add);
    println!("解決方案1 - 收集後添加: {:?}", numbers);
    
    // 問題2：借用檢查和作用域
    println!("\n問題2: 借用作用域管理");
    let mut data = vec![1, 2, 3];
    
    // 錯誤的做法:
    // let first = &data[0];
    // data.push(4); // 錯誤：first 還在使用中
    // println!("First: {}", first);
    
    // 正確的做法1：縮短借用範圍
    {
        let first = &data[0];
        println!("第一個元素: {}", first);
    } // first 的借用在此結束
    data.push(4);
    
    // 正確的做法2：複製值
    let first_value = data[0];
    data.push(5);
    println!("第一個元素的值: {}", first_value);
    
    // 問題3：結構體欄位借用
    println!("\n問題3: 結構體欄位借用");
    
    let mut container = Container {
        items: vec![String::from("item1"), String::from("item2")],
        count: 2,
    };
    
    // 安全的欄位借用
    update_container(&mut container);
    println!("更新後的容器: {:?}", container);
}

fn update_container(container: &mut Container) {
    // 可以同時借用不同欄位
    container.items.push(String::from("item3"));
    container.count = container.items.len();
}

#[derive(Debug)]
struct Container {
    items: Vec<String>,
    count: usize,
}

/// 進階借用模式示範
#[allow(dead_code)]
fn advanced_borrowing_patterns() {
    // 1. 內部可變性 (Interior Mutability)
    use std::cell::RefCell;
    use std::rc::Rc;
    
    let data = Rc::new(RefCell::new(vec![1, 2, 3]));
    
    // 可以在不可變引用的情況下修改內容
    {
        let mut borrowed = data.borrow_mut();
        borrowed.push(4);
    }
    
    println!("使用內部可變性: {:?}", data.borrow());
    
    // 2. 生命週期省略規則
    fn process_text(input: &str) -> &str {
        // 編譯器自動推斷生命週期
        input.trim()
    }
    
    let text = "  hello world  ";
    let trimmed = process_text(text);
    println!("處理後的文字: '{}'", trimmed);
    
    // 3. 借用分割 (Borrow Splitting)
    let mut array = [1, 2, 3, 4, 5];
    let (left, right) = array.split_at_mut(2);
    
    left[0] = 10;
    right[0] = 30;
    
    println!("分割借用後的陣列: {:?}", array);
}
