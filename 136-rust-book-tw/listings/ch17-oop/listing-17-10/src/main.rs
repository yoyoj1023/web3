use gui::Screen;

fn main() {
    let screen = Screen {
        components: vec![Box::new(String::from("嗨"))],
    };

    screen.run();
}
