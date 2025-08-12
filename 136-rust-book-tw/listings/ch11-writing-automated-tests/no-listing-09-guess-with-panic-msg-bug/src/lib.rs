pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        // ANCHOR: here
        if value < 1 {
            panic!(
                "猜測數字必須小於等於 100，取得的數值是 {}。",
                value
            );
        } else if value > 100 {
            panic!(
                "猜測數字必須大於等於 1，取得的數值是 {}。",
                value
            );
        }
        // ANCHOR_END: here

        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic(expected = "小於等於 100")]
    fn greater_than_100() {
        Guess::new(200);
    }
}
