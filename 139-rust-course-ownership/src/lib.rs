/// Rust 所有權課程核心函式庫
/// 
/// 本模組包含課程中使用的各種實用函數和型別定義

/// 所有權相關的實用函數
pub mod ownership {
    /// 計算字串長度而不取得所有權
    pub fn calculate_length(s: &String) -> usize {
        s.len()
    }
    
    /// 安全地從字串中提取切片
    pub fn safe_slice(s: &str, start: usize, end: usize) -> Option<&str> {
        if start <= end && end <= s.len() {
            Some(&s[start..end])
        } else {
            None
        }
    }
    
    /// 提取字串中的第一個單字
    pub fn first_word(s: &str) -> &str {
        let bytes = s.as_bytes();
        
        for (i, &item) in bytes.iter().enumerate() {
            if item == b' ' {
                return &s[0..i];
            }
        }
        
        s
    }
}

/// 借用相關的實用函數
pub mod borrowing {
    /// 計算切片的總和
    pub fn sum_slice(slice: &[i32]) -> i32 {
        slice.iter().sum()
    }
    
    /// 就地修改向量，將所有元素加倍
    pub fn double_all(numbers: &mut Vec<i32>) {
        for num in numbers.iter_mut() {
            *num *= 2;
        }
    }
    
    /// 查找向量中的最大值索引
    pub fn find_max_index(numbers: &[i32]) -> Option<usize> {
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
}

/// 切片相關的實用函數
pub mod slicing {
    /// 統計文字中的單字數量
    pub fn count_words(text: &str) -> usize {
        if text.trim().is_empty() {
            0
        } else {
            text.split_whitespace().count()
        }
    }
    
    /// 查找最長的單字
    pub fn find_longest_word(text: &str) -> Option<&str> {
        text.split_whitespace()
            .max_by_key(|word| word.len())
    }
    
    /// 將單字順序反轉
    pub fn reverse_words(text: &str) -> String {
        text.split_whitespace()
            .rev()
            .collect::<Vec<&str>>()
            .join(" ")
    }
    
    /// 從電子郵件地址中提取域名
    pub fn extract_domain(email: &str) -> Option<&str> {
        let at_pos = email.find('@')?;
        
        if at_pos + 1 >= email.len() {
            return None;
        }
        
        Some(&email[at_pos + 1..])
    }
}

/// 記憶體管理相關的型別和函數
pub mod memory {
    use std::fmt;
    
    /// 一個簡單的 Copy 型別範例
    #[derive(Debug, Copy, Clone)]
    pub struct Point {
        pub x: f64,
        pub y: f64,
    }
    
    impl Point {
        pub fn new(x: f64, y: f64) -> Self {
            Point { x, y }
        }
        
        pub fn distance_from_origin(&self) -> f64 {
            (self.x * self.x + self.y * self.y).sqrt()
        }
    }
    
    /// 一個非 Copy 型別範例
    #[derive(Debug, Clone)]
    pub struct Person {
        pub name: String,
        pub age: u32,
    }
    
    impl Person {
        pub fn new(name: String, age: u32) -> Self {
            Person { name, age }
        }
        
        pub fn greet(&self) -> String {
            format!("你好，我是 {}，今年 {} 歲", self.name, self.age)
        }
    }
    
    impl fmt::Display for Person {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            write!(f, "{} ({}歲)", self.name, self.age)
        }
    }
}

/// 測試模組
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_calculate_length() {
        let s = String::from("hello");
        assert_eq!(ownership::calculate_length(&s), 5);
        // s 在這裡仍然有效
        assert_eq!(s, "hello");
    }
    
    #[test]
    fn test_safe_slice() {
        let text = "hello world";
        assert_eq!(ownership::safe_slice(text, 0, 5), Some("hello"));
        assert_eq!(ownership::safe_slice(text, 6, 11), Some("world"));
        assert_eq!(ownership::safe_slice(text, 0, 20), None); // 超出範圍
    }
    
    #[test]
    fn test_first_word() {
        assert_eq!(ownership::first_word("hello world"), "hello");
        assert_eq!(ownership::first_word("rust"), "rust");
        assert_eq!(ownership::first_word(""), "");
    }
    
    #[test]
    fn test_sum_slice() {
        let numbers = [1, 2, 3, 4, 5];
        assert_eq!(borrowing::sum_slice(&numbers), 15);
        assert_eq!(borrowing::sum_slice(&numbers[1..4]), 9); // [2, 3, 4]
    }
    
    #[test]
    fn test_double_all() {
        let mut numbers = vec![1, 2, 3, 4, 5];
        borrowing::double_all(&mut numbers);
        assert_eq!(numbers, vec![2, 4, 6, 8, 10]);
    }
    
    #[test]
    fn test_find_max_index() {
        let numbers = [1, 5, 3, 9, 2];
        assert_eq!(borrowing::find_max_index(&numbers), Some(3)); // 9 在索引 3
        assert_eq!(borrowing::find_max_index(&[]), None);
    }
    
    #[test]
    fn test_count_words() {
        assert_eq!(slicing::count_words("hello world rust"), 3);
        assert_eq!(slicing::count_words("   "), 0);
        assert_eq!(slicing::count_words("single"), 1);
    }
    
    #[test]
    fn test_find_longest_word() {
        let text = "the quick brown fox";
        assert_eq!(slicing::find_longest_word(text), Some("brown"));
        assert_eq!(slicing::find_longest_word(""), None);
    }
    
    #[test]
    fn test_reverse_words() {
        let text = "hello world rust";
        assert_eq!(slicing::reverse_words(text), "rust world hello");
    }
    
    #[test]
    fn test_extract_domain() {
        assert_eq!(slicing::extract_domain("user@example.com"), Some("example.com"));
        assert_eq!(slicing::extract_domain("invalid"), None);
        assert_eq!(slicing::extract_domain("user@"), None);
    }
    
    #[test]
    fn test_point_copy() {
        let p1 = memory::Point::new(3.0, 4.0);
        let p2 = p1; // Copy 發生
        
        // 兩個點都有效
        assert_eq!(p1.x, 3.0);
        assert_eq!(p2.x, 3.0);
        assert_eq!(p1.distance_from_origin(), 5.0);
    }
    
    #[test]
    fn test_person_clone() {
        let person1 = memory::Person::new(String::from("Alice"), 30);
        let person2 = person1.clone(); // Clone 發生
        
        // 兩個 person 都有效
        assert_eq!(person1.name, "Alice");
        assert_eq!(person2.name, "Alice");
        assert_eq!(person1.age, 30);
        assert_eq!(person2.age, 30);
    }
}
