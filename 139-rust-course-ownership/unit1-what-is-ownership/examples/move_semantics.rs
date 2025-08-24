/// 移動語義詳細範例
/// 展示 Rust 中所有權轉移的各種場景

fn main() {
    println!("=== Rust 移動語義範例 ===\n");
    
    // 1. 基本移動語義
    println!("1. 基本移動語義");
    basic_move_semantics();
    println!();
    
    // 2. 函數中的移動
    println!("2. 函數中的移動");
    function_moves();
    println!();
    
    // 3. 結構體和集合中的移動
    println!("3. 結構體和集合中的移動");
    struct_and_collection_moves();
    println!();
    
    // 4. 部分移動
    println!("4. 部分移動");
    partial_moves();
    println!();
    
    // 5. 移動和複製的決策
    println!("5. 移動和複製的決策");
    move_vs_copy_decisions();
    println!();
}

/// 基本移動語義示範
fn basic_move_semantics() {
    println!("=== 變數間的移動 ===");
    
    // String 移動
    let s1 = String::from("Hello");
    println!("s1 創建：'{}'", s1);
    
    let s2 = s1; // s1 移動到 s2
    println!("s2 接收移動：'{}'", s2);
    
    // 此時 s1 已經無效
    // println!("s1: {}", s1); // 編譯錯誤
    
    // 向量移動
    let v1 = vec![1, 2, 3, 4, 5];
    println!("v1 創建：{:?}", v1);
    
    let v2 = v1; // v1 移動到 v2
    println!("v2 接收移動：{:?}", v2);
    
    // v1 已經無效
    // println!("v1: {:?}", v1); // 編譯錯誤
    
    println!("✓ 移動後原變數變為無效，防止雙重釋放");
}

/// 函數中的移動語義
fn function_moves() {
    println!("=== 函數參數移動 ===");
    
    let s = String::from("function parameter");
    println!("呼叫前：s = '{}'", s);
    
    takes_ownership(s); // s 移動到函數中
    // println!("呼叫後：s = '{}'", s); // 編譯錯誤：s 已被移動
    
    println!("=== 函數返回值移動 ===");
    
    let s1 = gives_ownership(); // 函數返回值移動到 s1
    println!("從函數獲得：s1 = '{}'", s1);
    
    let s2 = String::from("transfer");
    let s3 = takes_and_gives_back(s2); // s2 移動進函數，返回值移動到 s3
    println!("往返移動：s3 = '{}'", s3);
    // println!("s2 = '{}'", s2); // 編譯錯誤：s2 已被移動
    
    println!("=== 避免不必要的移動 ===");
    
    let s4 = String::from("calculate length");
    let len = calculate_length_clone(&s4); // 使用引用而非移動
    println!("字串 '{}' 的長度是 {}", s4, len); // s4 仍然有效
}

fn takes_ownership(some_string: String) {
    println!("函數內部：'{}'", some_string);
} // some_string 離開作用域並被丟棄

fn gives_ownership() -> String {
    let some_string = String::from("returned from function");
    some_string // 返回並移動所有權給呼叫者
}

fn takes_and_gives_back(a_string: String) -> String {
    a_string // 接收並返回，轉移所有權
}

fn calculate_length_clone(s: &String) -> usize {
    s.len()
} // s 是引用，沒有所有權，所以不會被丟棄

/// 結構體和集合中的移動
fn struct_and_collection_moves() {
    println!("=== 結構體移動 ===");
    
    #[derive(Debug)]
    struct Person {
        name: String,
        age: u32,
    }
    
    let person1 = Person {
        name: String::from("Alice"),
        age: 30,
    };
    println!("person1：{:?}", person1);
    
    let person2 = person1; // 整個結構體移動
    println!("person2：{:?}", person2);
    // println!("person1：{:?}", person1); // 編譯錯誤
    
    println!("=== 集合移動 ===");
    
    // 向量中元素的移動
    let strings = vec![
        String::from("first"),
        String::from("second"),
        String::from("third"),
    ];
    println!("字串向量：{:?}", strings);
    
    // 移動整個向量
    let moved_strings = strings;
    println!("移動後：{:?}", moved_strings);
    // println!("原向量：{:?}", strings); // 編譯錯誤
    
    // 從向量中移動單個元素
    let mut numbers = vec![1, 2, 3, 4, 5];
    let first = numbers.remove(0); // 移動第一個元素
    println!("移動的元素：{}", first);
    println!("剩餘元素：{:?}", numbers);
    
    // 使用 into_iter() 移動所有元素
    let strings2 = vec![
        String::from("a"),
        String::from("b"),
        String::from("c"),
    ];
    
    println!("遍歷並移動每個元素：");
    for s in strings2.into_iter() { // into_iter() 消費向量
        println!("  移動的字串：{}", s);
    }
    // println!("strings2：{:?}", strings2); // 編譯錯誤：已被消費
}

/// 部分移動示範
fn partial_moves() {
    println!("=== 結構體部分移動 ===");
    
    #[derive(Debug)]
    struct Book {
        title: String,
        author: String,
        pages: u32,
    }
    
    let book = Book {
        title: String::from("Rust Programming"),
        author: String::from("The Rust Team"),
        pages: 500,
    };
    
    // 移動部分欄位
    let title = book.title; // 移動 title
    let pages = book.pages; // 複製 pages（u32 實現 Copy）
    
    println!("移動的標題：{}", title);
    println!("複製的頁數：{}", pages);
    
    // 現在 book 部分無效
    // println!("完整書籍：{:?}", book); // 編譯錯誤：title 已被移動
    println!("剩餘作者：{}", book.author); // author 仍然有效
    
    println!("=== 元組部分移動 ===");
    
    let tuple = (
        String::from("hello"),
        String::from("world"),
        42,
    );
    
    let (first, _, number) = tuple; // 移動 first，忽略 second，複製 number
    println!("移動的第一個：{}", first);
    println!("複製的數字：{}", number);
    
    // tuple 部分無效
    // println!("完整元組：{:?}", tuple); // 編譯錯誤
    println!("剩餘的第二個：{}", tuple.1); // 第二個元素仍然有效
}

/// 移動和複製的決策示範
fn move_vs_copy_decisions() {
    println!("=== 何時使用移動 vs 複製 ===");
    
    // 1. 大型資料結構 - 移動更高效
    let large_vector = vec![0; 1_000_000]; // 大向量
    println!("大向量長度：{}", large_vector.len());
    
    let moved_vector = large_vector; // 移動（高效）
    // let copied_vector = large_vector.clone(); // 複製（昂貴）
    
    println!("移動大向量（高效）：長度 {}", moved_vector.len());
    
    // 2. 小型資料 - 複製可能更方便
    #[derive(Clone, Copy, Debug)]
    struct Point {
        x: f64,
        y: f64,
    }
    
    let point1 = Point { x: 1.0, y: 2.0 };
    let point2 = point1; // 複製（因為實現了 Copy）
    
    println!("點1：{:?}", point1); // 仍然有效
    println!("點2：{:?}", point2);
    
    // 3. 資源類型 - 移動保證唯一性
    use std::fs::File;
    use std::io::Write;
    
    // 模擬檔案操作（實際上可能失敗，這裡只是示範概念）
    fn simulate_file_operation() {
        if let Ok(mut file) = File::create("temp.txt") {
            let _ = writeln!(file, "Hello, file!");
            
            // 檔案移動到另一個函數
            process_file(file); // file 移動，確保沒有多個擁有者
            
            // let _ = writeln!(file, "Can't write!"); // 編譯錯誤：file 已被移動
        }
    }
    
    fn process_file(mut _file: File) {
        // 處理檔案
        println!("處理檔案中...");
        // 檔案在函數結束時自動關閉
    }
    
    simulate_file_operation();
    
    // 4. 選擇策略總結
    println!("\n=== 選擇策略總結 ===");
    println!("移動適用於：");
    println!("  - 大型資料結構（避免昂貴複製）");
    println!("  - 資源類型（檔案、網路連接等）");
    println!("  - 唯一性要求（確保只有一個擁有者）");
    
    println!("複製適用於：");
    println!("  - 小型數值類型（整數、浮點數等）");
    println!("  - 需要保留原始值的場景");
    println!("  - 實現了 Copy trait 的類型");
}

/// 展示移動語義的進階模式
#[allow(dead_code)]
fn advanced_move_patterns() {
    println!("=== 進階移動模式 ===");
    
    // 1. 條件移動
    let condition = true;
    let s = String::from("conditional");
    
    let result = if condition {
        s // 移動 s
    } else {
        String::from("alternative") // 建立新字串
    };
    
    println!("條件移動結果：{}", result);
    // s 可能已被移動，取決於條件
    
    // 2. 迴圈中的移動
    let strings = vec![
        String::from("one"),
        String::from("two"),
        String::from("three"),
    ];
    
    // 移動到新集合
    let mut processed: Vec<String> = Vec::new();
    for s in strings { // strings 被消費
        let mut modified = s; // 移動每個字串
        modified.push('!');
        processed.push(modified);
    }
    
    println!("處理後的字串：{:?}", processed);
    
    // 3. 閉包中的移動
    let data = String::from("closure data");
    let closure = move || {
        println!("閉包中的資料：{}", data); // data 被移動到閉包中
    };
    
    closure();
    // println!("原始資料：{}", data); // 編譯錯誤：data 已被移動到閉包
}
