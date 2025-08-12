// ANCHOR: here
fn first_word(s: &str) -> &str {
    // ANCHOR_END: here
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}

// ANCHOR: usage
fn main() {
    let my_string = String::from("hello world");

    // first_word 適用於 `String` 的切片，無論是部分或整體
    let word = first_word(&my_string[0..6]);
    let word = first_word(&my_string[..]);
    // first_word 也適用於 `String` 的參考，這等同於對整個 `String` 切片的操作。
    let word = first_word(&my_string);

    let my_string_literal = "hello world";

    // first_word 適用於字串字面值，無論是部分或整體
    let word = first_word(&my_string_literal[0..6]);
    let word = first_word(&my_string_literal[..]);

    // 因為字串字面值本來就是切片
    // 沒有切片語法也是可行的！
    let word = first_word(my_string_literal);
}
// ANCHOR_END: usage
