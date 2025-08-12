enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let msg = Message::ChangeColor(0, 160, 255);

    match msg {
        Message::Quit => {
            println!("Quit 變體沒有資料能解構。");
        }
        Message::Move { x, y } => {
            println!("Move 往 x 的方向為 {x} 且往 y 的方向為 {y}");
        }
        Message::Write(text) => println!("文字訊息：{text}"),
        Message::ChangeColor(r, g, b) => {
            println!("變更顏色為紅色 {r}、綠色 {g} 與藍色 {b}")
        }
    }
}
