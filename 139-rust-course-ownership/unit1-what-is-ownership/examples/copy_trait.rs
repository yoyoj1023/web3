/// Copy Trait 詳細範例
/// 展示 Copy 語義與 Move 語義的差異

#[derive(Debug, Copy, Clone)]
struct Point {
    x: f64,
    y: f64,
}

fn main() {
    println!("=== Copy Trait 詳細範例 ===\n");
    
    // 1. 基本 Copy 型別
    println!("1. 基本 Copy 型別");
    basic_copy_types();
    println!();
    
    // 2. Copy vs Move 對比
    println!("2. Copy vs Move 對比");
    copy_vs_move_comparison();
    println!();
    
    // 3. 自定義 Copy 型別
    println!("3. 自定義 Copy 型別");
    custom_copy_types();
    println!();
    
    // 4. Copy 的限制
    println!("4. Copy 的限制");
    copy_limitations();
    println!();
    
    // 5. Clone vs Copy
    println!("5. Clone vs Copy");
    clone_vs_copy();
    println!();
}

/// 基本 Copy 型別示範
fn basic_copy_types() {
    // 數值型別都實現了 Copy
    let x = 42;
    let y = x; // Copy 發生
    println!("整數 - x: {}, y: {}", x, y); // 兩者都有效
    
    let a = 3.14;
    let b = a; // Copy 發生
    println!("浮點數 - a: {}, b: {}", a, b);
    
    let flag1 = true;
    let flag2 = flag1; // Copy 發生
    println!("布林值 - flag1: {}, flag2: {}", flag1, flag2);
    
    let ch1 = '🦀';
    let ch2 = ch1; // Copy 發生
    println!("字元 - ch1: {}, ch2: {}", ch1, ch2);
    
    // 陣列如果元素是 Copy，陣列也是 Copy
    let arr1 = [1, 2, 3];
    let arr2 = arr1; // Copy 發生
    println!("陣列 - arr1: {:?}, arr2: {:?}", arr1, arr2);
    
    // 元組如果所有欄位都是 Copy，元組也是 Copy
    let tuple1 = (42, 3.14, true);
    let tuple2 = tuple1; // Copy 發生
    println!("元組 - tuple1: {:?}, tuple2: {:?}", tuple1, tuple2);
}

/// Copy vs Move 對比
fn copy_vs_move_comparison() {
    println!("=== Copy 型別 ===");
    
    // i32 是 Copy 型別
    let a = 10;
    let b = a; // Copy
    take_i32(a); // Copy，a 仍然有效
    println!("a: {}, b: {}", a, b);
    
    println!("=== Move 型別 ===");
    
    // String 是 Move 型別
    let s1 = String::from("hello");
    let s2 = s1; // Move，s1 不再有效
    // take_string(s1); // 編譯錯誤：s1 已被移動
    take_string(s2); // s2 被移動
    // println!("s2: {}", s2); // 編譯錯誤：s2 已被移動
    
    println!("=== 在函數中的行為 ===");
    
    // Copy 型別的函數呼叫
    let num = 42;
    let result = double_number(num); // num 被複製
    println!("原數值: {}, 加倍後: {}", num, result); // num 仍然有效
    
    // Move 型別的函數呼叫
    let text = String::from("hello");
    let result = process_string(text); // text 被移動
    println!("處理結果: {}", result);
    // println!("原文字: {}", text); // 編譯錯誤：text 已被移動
}

fn take_i32(x: i32) {
    println!("接收到整數: {}", x);
}

fn take_string(s: String) {
    println!("接收到字串: {}", s);
}

fn double_number(x: i32) -> i32 {
    x * 2
}

fn process_string(s: String) -> String {
    format!("處理過的: {}", s)
}

/// 自定義 Copy 型別
fn custom_copy_types() {
    // Point 已在文件頂部定義
    
    let p1 = Point { x: 1.0, y: 2.0 };
    let p2 = p1; // Copy 發生
    println!("點1: {:?}, 點2: {:?}", p1, p2); // 兩者都有效
    
    // 函數呼叫也是複製
    let p3 = translate_point(p1, 5.0, 3.0);
    println!("平移後: {:?}, 原點: {:?}", p3, p1); // p1 仍有效
    
    // 實現 Copy 的元組結構體
    #[derive(Debug, Copy, Clone)]
    struct Color(u8, u8, u8);
    
    let red = Color(255, 0, 0);
    let red_copy = red; // Copy
    println!("原色: {:?}, 複製: {:?}", red, red_copy);
    
    // 實現 Copy 的列舉
    #[derive(Debug, Copy, Clone)]
    enum Direction {
        North,
        South,
        East,
        West,
    }
    
    let dir1 = Direction::North;
    let dir2 = dir1; // Copy
    println!("方向1: {:?}, 方向2: {:?}", dir1, dir2);
}

fn translate_point(p: Point, dx: f64, dy: f64) -> Point {
    Point {
        x: p.x + dx,
        y: p.y + dy,
    }
}

/// Copy 的限制
fn copy_limitations() {
    println!("=== 不能實現 Copy 的情況 ===");
    
    // 包含 String 的結構體不能實現 Copy
    #[derive(Debug, Clone)]
    struct Person {
        name: String, // String 不是 Copy
        age: u32,     // u32 是 Copy，但整個結構體仍不能 Copy
    }
    
    let person1 = Person {
        name: String::from("Alice"),
        age: 30,
    };
    
    let person2 = person1.clone(); // 只能使用 clone()
    // let person2 = person1; // 這會是 Move，person1 變無效
    
    println!("人員1: {:?}", person1); // 因為用了 clone，所以仍有效
    println!("人員2: {:?}", person2);
    
    // 包含 Vec 的結構體也不能實現 Copy
    #[derive(Debug, Clone)]
    struct Container {
        items: Vec<i32>, // Vec 不是 Copy
    }
    
    let container1 = Container {
        items: vec![1, 2, 3],
    };
    
    let container2 = container1.clone(); // 必須使用 clone
    println!("容器1: {:?}", container1);
    println!("容器2: {:?}", container2);
    
    println!("=== Copy 和 Drop 的互斥性 ===");
    
    // 如果型別實現了 Drop，就不能實現 Copy
    struct DropExample {
        data: i32,
    }
    
    impl Drop for DropExample {
        fn drop(&mut self) {
            println!("DropExample 被清理，data: {}", self.data);
        }
    }
    
    let drop_ex1 = DropExample { data: 42 };
    let drop_ex2 = drop_ex1; // Move，因為不能 Copy
    
    // println!("drop_ex1: {:?}", drop_ex1.data); // 編譯錯誤
    println!("drop_ex2.data: {}", drop_ex2.data);
    
    // drop_ex2 在作用域結束時會呼叫 drop
}

/// Clone vs Copy
fn clone_vs_copy() {
    println!("=== Clone 的靈活性 ===");
    
    // Copy 是 Clone 的子集
    let x = 42;
    let y = x;        // Copy（隱式）
    let z = x.clone(); // Clone（顯式，但對 Copy 型別來說等同 Copy）
    println!("Copy 型別 - x: {}, y: {}, z: {}", x, y, z);
    
    // Clone 可以用於非 Copy 型別
    let s1 = String::from("hello");
    let s2 = s1.clone(); // 深拷貝
    let s3 = s1.clone(); // 可以多次 clone
    println!("Clone 型別 - s1: {}, s2: {}, s3: {}", s1, s2, s3);
    
    // 自定義 Clone 行為
    #[derive(Debug)]
    struct ExpensiveClone {
        data: Vec<i32>,
        metadata: String,
    }
    
    impl Clone for ExpensiveClone {
        fn clone(&self) -> Self {
            println!("執行昂貴的複製操作...");
            ExpensiveClone {
                data: self.data.clone(),
                metadata: format!("{} (複製)", self.metadata),
            }
        }
    }
    
    let expensive = ExpensiveClone {
        data: vec![1, 2, 3, 4, 5],
        metadata: String::from("原始資料"),
    };
    
    let expensive_copy = expensive.clone();
    println!("原始: {:?}", expensive);
    println!("複製: {:?}", expensive_copy);
    
    println!("=== 性能考量 ===");
    
    // Copy：無成本，只是記憶體複製
    let numbers: [i32; 1000] = [42; 1000];
    let start = std::time::Instant::now();
    for _ in 0..10000 {
        let _copy = numbers; // Copy，非常快
    }
    let copy_time = start.elapsed();
    
    // Clone：可能有成本，取決於實作
    let strings: Vec<String> = (0..1000).map(|i| format!("string_{}", i)).collect();
    let start = std::time::Instant::now();
    for _ in 0..100 { // 注意迴圈次數減少了
        let _clone = strings.clone(); // Clone，較慢
    }
    let clone_time = start.elapsed();
    
    println!("Copy 時間 (10000次): {:?}", copy_time);
    println!("Clone 時間 (100次): {:?}", clone_time);
}

/// 實際應用中的 Copy/Clone 策略
#[allow(dead_code)]
fn practical_copy_clone_strategies() {
    // 策略1：小型資料結構使用 Copy
    #[derive(Debug, Copy, Clone)]
    struct RGB {
        r: u8,
        g: u8,
        b: u8,
    }
    
    // 策略2：大型或複雜資料結構使用 Clone
    #[derive(Debug, Clone)]
    struct Image {
        width: u32,
        height: u32,
        pixels: Vec<RGB>,
    }
    
    // 策略3：提供兩種版本的函數
    fn process_color_by_copy(color: RGB) -> RGB {
        // 處理顏色，參數被複製
        RGB {
            r: color.r,
            g: color.g,
            b: color.b,
        }
    }
    
    fn process_color_by_ref(color: &RGB) -> RGB {
        // 處理顏色，參數被借用
        RGB {
            r: color.r,
            g: color.g,
            b: color.b,
        }
    }
    
    let color = RGB { r: 255, g: 0, b: 0 };
    
    // 兩種呼叫方式都有效
    let processed1 = process_color_by_copy(color); // Copy
    let processed2 = process_color_by_ref(&color); // Borrow
    
    println!("原色: {:?}", color);
    println!("處理1: {:?}", processed1);
    println!("處理2: {:?}", processed2);
}
