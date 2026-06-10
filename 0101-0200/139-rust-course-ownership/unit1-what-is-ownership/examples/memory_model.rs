/// 記憶體模型詳細範例
/// 展示堆疊和堆積的使用差異

fn main() {
    println!("=== Rust 記憶體模型範例 ===\n");
    
    // 1. 堆疊上的資料
    println!("1. 堆疊上的資料");
    stack_data_demo();
    println!();
    
    // 2. 堆積上的資料
    println!("2. 堆積上的資料");
    heap_data_demo();
    println!();
    
    // 3. 混合資料結構
    println!("3. 混合資料結構");
    mixed_data_demo();
    println!();
    
    // 4. 記憶體效能對比
    println!("4. 記憶體效能對比");
    performance_comparison();
    println!();
}

/// 展示堆疊上的資料類型
fn stack_data_demo() {
    // 基本型別都存放在堆疊上
    let integer = 42i32;           // 4 位元組
    let float = 3.14f64;          // 8 位元組
    let boolean = true;           // 1 位元組
    let character = 'R';          // 4 位元組（UTF-8）
    
    println!("堆疊資料（快速存取）：");
    println!("  整數: {} (4 bytes)", integer);
    println!("  浮點數: {} (8 bytes)", float);
    println!("  布林值: {} (1 byte)", boolean);
    println!("  字元: {} (4 bytes UTF-8)", character);
    
    // 陣列（固定大小）也在堆疊上
    let array = [1, 2, 3, 4, 5];  // 5 * 4 = 20 位元組
    println!("  固定陣列: {:?} (20 bytes)", array);
    
    // 元組在堆疊上
    let tuple = (42, 3.14, true); // 4 + 8 + 1 = 13 位元組（加上對齊）
    println!("  元組: {:?} (~16 bytes with alignment)", tuple);
    
    // 結構體（如果所有欄位都在堆疊上）
    #[derive(Debug)]
    struct Point {
        x: f64,
        y: f64,
    }
    
    let point = Point { x: 1.0, y: 2.0 }; // 16 位元組
    println!("  結構體: {:?} (16 bytes)", point);
    
    println!("✓ 這些資料在函數結束時會自動從堆疊彈出");
}

/// 展示堆積上的資料類型
fn heap_data_demo() {
    // String - 在堆疊上存放元資料，在堆積上存放實際字串
    let string = String::from("Hello, Rust!");
    println!("String 分析：");
    println!("  內容: '{}'", string);
    println!("  長度: {} bytes", string.len());
    println!("  容量: {} bytes", string.capacity());
    println!("  堆疊上存放: 指標 + 長度 + 容量 (24 bytes on 64-bit)");
    println!("  堆積上存放: 實際字串資料 ({} bytes)", string.len());
    
    // Vec - 動態陣列
    let mut vector = Vec::new();
    vector.push(1);
    vector.push(2);
    vector.push(3);
    
    println!("\nVec 分析：");
    println!("  內容: {:?}", vector);
    println!("  長度: {} elements", vector.len());
    println!("  容量: {} elements", vector.capacity());
    println!("  堆疊上存放: 指標 + 長度 + 容量 (24 bytes on 64-bit)");
    println!("  堆積上存放: 陣列資料 ({} bytes)", vector.len() * std::mem::size_of::<i32>());
    
    // Box - 堆積上的單一值
    let boxed_value = Box::new(42);
    println!("\nBox 分析：");
    println!("  內容: {}", boxed_value);
    println!("  堆疊上存放: 指標 (8 bytes on 64-bit)");
    println!("  堆積上存放: 實際值 (4 bytes for i32)");
    
    println!("\n✓ 這些資料的堆積部分在擁有者離開作用域時被自動釋放");
}

/// 展示混合資料結構
fn mixed_data_demo() {
    // 包含堆疊和堆積資料的結構體
    #[derive(Debug)]
    struct Person {
        name: String,        // 堆積：字串資料
        age: u32,           // 堆疊：整數
        scores: Vec<f64>,   // 堆積：向量資料
        is_student: bool,   // 堆疊：布林值
    }
    
    let person = Person {
        name: String::from("Alice"),
        age: 25,
        scores: vec![98.5, 87.2, 92.0],
        is_student: true,
    };
    
    println!("混合結構體分析：");
    println!("Person: {:?}", person);
    println!("\n記憶體佈局：");
    println!("堆疊上：");
    println!("  - Person 結構體框架");
    println!("  - name 的元資料 (ptr, len, cap)");
    println!("  - age: {} (4 bytes)", person.age);
    println!("  - scores 的元資料 (ptr, len, cap)");
    println!("  - is_student: {} (1 byte)", person.is_student);
    
    println!("堆積上：");
    println!("  - name 字串: '{}'", person.name);
    println!("  - scores 陣列: {:?}", person.scores);
    
    // 向量中存放 String
    let names = vec![
        String::from("Alice"),
        String::from("Bob"),
        String::from("Charlie"),
    ];
    
    println!("\n向量包含字串的情況：");
    println!("names: {:?}", names);
    println!("記憶體層次：");
    println!("  堆疊: Vec 元資料");
    println!("  堆積層1: Vec 的 String 陣列");
    println!("  堆積層2: 每個 String 的實際字元資料");
}

/// 記憶體效能對比
fn performance_comparison() {
    use std::time::Instant;
    
    // 堆疊操作效能測試
    let start = Instant::now();
    let mut sum = 0;
    for i in 0..1_000_000 {
        let x = i; // 堆疊分配
        sum += x;
    }
    let stack_duration = start.elapsed();
    println!("堆疊操作 (1M 次整數)：{:?}", stack_duration);
    println!("結果：{}", sum);
    
    // 堆積操作效能測試
    let start = Instant::now();
    let mut strings = Vec::new();
    for i in 0..10_000 {
        let s = String::from(format!("String {}", i)); // 堆積分配
        strings.push(s);
    }
    let heap_duration = start.elapsed();
    println!("堆積操作 (10K 次字串)：{:?}", heap_duration);
    println!("字串數量：{}", strings.len());
    
    // 陣列 vs 向量效能
    let arr = [1; 1000]; // 堆疊陣列
    let vec: Vec<i32> = vec![1; 1000]; // 堆積向量
    
    let start = Instant::now();
    let mut sum = 0;
    for _ in 0..10_000 {
        for &x in &arr {
            sum += x;
        }
    }
    let array_duration = start.elapsed();
    
    let start = Instant::now();
    let mut sum2 = 0;
    for _ in 0..10_000 {
        for &x in &vec {
            sum2 += x;
        }
    }
    let vector_duration = start.elapsed();
    
    println!("\n效能對比 (10K 次遍歷 1K 元素)：");
    println!("  陣列 (堆疊): {:?}", array_duration);
    println!("  向量 (堆積): {:?}", vector_duration);
    
    if array_duration < vector_duration {
        println!("  → 陣列更快（堆疊存取優勢）");
    } else {
        println!("  → 向量效能相近（編譯器優化）");
    }
}

/// 展示記憶體洩漏預防
#[allow(dead_code)]
fn memory_safety_demo() {
    println!("記憶體安全示範：");
    
    // Rust 防止的問題 1：懸空指標
    {
        let s = String::from("temporary");
        // let reference = &s;  // 如果這個引用逃出作用域會怎樣？
    } // s 被釋放
    // println!("{}", reference); // 編譯器會阻止這種懸空引用
    
    // Rust 防止的問題 2：雙重釋放
    {
        let s1 = String::from("hello");
        let s2 = s1; // 移動，不是複製
        // 當作用域結束時，只有 s2 會被釋放，s1 已經無效
    }
    
    // Rust 防止的問題 3：使用已釋放的記憶體
    {
        let v = vec![1, 2, 3];
        // let item = &v[0];
        // drop(v); // 手動釋放
        // println!("{}", item); // 編譯器阻止這種使用
    }
    
    println!("✓ Rust 的所有權系統在編譯期防止了所有這些記憶體安全問題");
}
