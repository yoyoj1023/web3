fn main() {
    // ANCHOR: here
    let mut v = vec![1, 2, 3, 4, 5];

    let first = &v[0];

    v.push(6);

    println!("第一個元素是：{first}");
    // ANCHOR_END: here
}
