/// Rust 所有權基礎範例
/// 展示所有權轉移的核心機制

fn main() {
    println!("=== Rust 所有權基礎範例 ===\n");
    
    // 1. 基本所有權轉移
    println!("1. 基本所有權轉移");
    basic_ownership_transfer();
    println!();
    
    // 2. 函數中的所有權
    println!("2. 函數中的所有權");
    function_ownership();
    println!();
    
    // 3. Copy vs Move
    println!("3. Copy vs Move 對比");
    copy_vs_move();
    println!();
    
    // 4. 作用域和自動清理
    println!("4. 作用域和自動清理");
    scope_and_cleanup();
    println!();
}

/// 展示基本的所有權轉移
fn basic_ownership_transfer() {
    // String 的所有權轉移
    let s1 = String::from("Hello");
    println!("s1 創建：{}", s1);
    
    let s2 = s1; // 所有權從 s1 轉移到 s2
    println!("s2 接收所有權：{}", s2);
    
    // 下面這行會導致編譯錯誤，因為 s1 已經無效
    // println!("嘗試使用 s1：{}", s1); // Error: borrow of moved value
    
    println!("✓ s1 的所有權已轉移，s2 現在擁有字串");
}

/// 展示函數中的所有權轉移
fn function_ownership() {
    let s = String::from("World");
    println!("呼叫前 s = {}", s);
    
    let result = take_and_return(s); // s 的所有權轉移到函數
    // println!("呼叫後 s = {}", s); // Error: s 已經無效
    
    println!("函數返回：{}", result);
    
    // 示範如何保持所有權
    let s2 = String::from("Rust");
    let len = calculate_length_taking_ownership(s2.clone()); // 使用 clone 保持所有權
    println!("字串 '{}' 的長度是 {}", s2, len);
}

fn take_and_return(s: String) -> String {
    println!("函數內部：{}", s);
    s // 返回所有權
}

fn calculate_length_taking_ownership(s: String) -> usize {
    s.len()
} // s 離開作用域並被丟棄

/// 展示 Copy trait 與 Move 的差異
fn copy_vs_move() {
    // Copy 型別（基本型別）
    let x = 5;
    let y = x; // x 被複製，不是移動
    println!("Copy 型別 - x: {}, y: {}", x, y); // 兩者都有效
    
    // 陣列如果元素是 Copy 型別，陣列也是 Copy
    let arr1 = [1, 2, 3];
    let arr2 = arr1; // 複製
    println!("Copy 陣列 - arr1: {:?}, arr2: {:?}", arr1, arr2);
    
    // Move 型別（擁有堆積資料）
    let vec1 = vec![1, 2, 3];
    let vec2 = vec1; // vec1 被移動
    println!("Move 型別 - vec2: {:?}", vec2);
    // println!("vec1: {:?}", vec1); // Error: vec1 已被移動
    
    // 元組的行為取決於其元素
    let tuple_copy = (1, 2); // 所有元素都是 Copy
    let tuple_copy2 = tuple_copy; // 複製
    println!("Copy 元組 - tuple_copy: {:?}, tuple_copy2: {:?}", tuple_copy, tuple_copy2);
    
    let tuple_move = (String::from("hello"), 1); // 包含非 Copy 元素
    let tuple_move2 = tuple_move; // 移動
    println!("Move 元組 - tuple_move2: {:?}", tuple_move2);
    // println!("tuple_move: {:?}", tuple_move); // Error: 已被移動
}

/// 展示作用域和自動清理
fn scope_and_cleanup() {
    println!("進入外層作用域");
    let outer_string = String::from("外層");
    
    {
        println!("進入內層作用域");
        let inner_string = String::from("內層");
        println!("內層字串：{}", inner_string);
        println!("外層字串：{}", outer_string);
        
        // 可以建立多個變數
        let temp1 = String::from("臨時1");
        let temp2 = String::from("臨時2");
        println!("臨時變數：{}, {}", temp1, temp2);
        
        println!("即將離開內層作用域");
    } // inner_string, temp1, temp2 在此被自動清理
    
    println!("已離開內層作用域");
    println!("外層字串仍然存在：{}", outer_string);
    
    // 展示條件作用域
    let condition = true;
    if condition {
        let conditional_string = String::from("條件字串");
        println!("條件內：{}", conditional_string);
    } // conditional_string 在此被清理
    
    println!("離開外層作用域前");
} // outer_string 在此被清理

/// 額外示範：所有權轉移的複雜場景
#[allow(dead_code)]
fn complex_ownership_scenarios() {
    // 場景1：向量中的所有權
    let mut strings = Vec::new();
    strings.push(String::from("第一個"));
    strings.push(String::from("第二個"));
    
    // 從向量中取出元素會轉移所有權
    if let Some(first) = strings.into_iter().next() {
        println!("取出的第一個元素：{}", first);
        // strings 已經被 into_iter() 消費，不再可用
    }
    
    // 場景2：結構體中的所有權
    #[derive(Debug)]
    struct Person {
        name: String,
        age: i32,
    }
    
    let person1 = Person {
        name: String::from("Alice"),
        age: 30,
    };
    
    let person2 = person1; // 整個結構體被移動
    println!("Person2: {:?}", person2);
    // println!("Person1: {:?}", person1); // Error: person1 已被移動
}
