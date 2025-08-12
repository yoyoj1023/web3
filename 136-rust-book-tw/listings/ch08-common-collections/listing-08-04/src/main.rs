fn main() {
    // ANCHOR: here
    let v = vec![1, 2, 3, 4, 5];

    let third: &i32 = &v[2];
    println!("第三個元素是 {third}");

    let third: Option<&i32> = v.get(2);
    match third {
        Some(third) => println!("第三個元素是 {third}"),
        None => println!("第三個元素並不存在。"),
    }
    // ANCHOR_END: here
}