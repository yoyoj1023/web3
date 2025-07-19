# Rust Hello World 專案

這是一個簡單的 Rust 學習專案，展示如何建立和運行最基本的 "Hello, world!" 程序。

## 📋 專案概述

本專案是學習 Rust 程式語言的第一步，包含一個基本的 Hello World 程序，可以幫助您：
- 了解 Rust 專案的基本結構
- 學習使用 Cargo（Rust 的套件管理工具）
- 體驗編譯和運行 Rust 程序的流程

## 🚀 快速開始

### 前置需求

在開始之前，您需要安裝 Rust 程式語言環境：

1. **安裝 Rust**
   - 前往 [https://rustup.rs/](https://rustup.rs/) 
   - 下載並執行安裝程式
   - 或使用以下命令（Linux/macOS）：
     ```bash
     curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
     ```

2. **驗證安裝**
   ```bash
   rustc --version
   cargo --version
   ```

### 運行專案

1. **進入專案目錄**
   ```bash
   cd 115-hello-rust/hello_world
   ```

2. **編譯並運行程序**
   ```bash
   cargo run
   ```
   
   您應該會看到輸出：
   ```
   Hello, world!
   ```

3. **其他有用的命令**
   ```bash
   # 僅編譯程序（不運行）
   cargo build
   
   # 編譯優化版本
   cargo build --release
   
   # 檢查程式碼語法
   cargo check
   ```

## 📁 專案結構

```
hello_world/
├── Cargo.toml          # 專案配置檔案
├── Cargo.lock          # 依賴鎖定檔案
├── src/
│   └── main.rs         # 主程式檔案
├── target/             # 編譯輸出目錄
└── README.md           # 本說明檔案
```

### 檔案說明

- **`Cargo.toml`**: Rust 專案的配置檔案，定義專案名稱、版本和依賴
- **`src/main.rs`**: 程序的入口點，包含 `main` 函數
- **`target/`**: Cargo 編譯時生成的目標檔案存放目錄
- **`Cargo.lock`**: 記錄確切的依賴版本，確保重現性構建

## 💡 程式碼說明

```rust
fn main() {
    println!("Hello, world!");
}
```

- `fn main()`: 定義程序的主函數，是 Rust 程序的入口點
- `println!`: 是一個宏（macro），用於在終端輸出文字並換行
- 注意宏的語法是 `!`，這與一般函數不同

## 📚 學習資源

- [Rust 官方文件](https://doc.rust-lang.org/)
- [Rust 程式設計語言書籍](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Cargo 文件](https://doc.rust-lang.org/cargo/)

## 🔧 開發環境建議

推薦的 IDE 和編輯器：
- **Visual Studio Code** + Rust Analyzer 擴充套件
- **IntelliJ IDEA** + Rust 插件
- **Vim/Neovim** + rust.vim
- **CLion** + Rust 插件

## ❓ 常見問題

**Q: 如何更新 Rust？**
```bash
rustup update
```

**Q: 如何查看已安裝的 Rust 版本？**
```bash
rustup show
```

**Q: 如何清理編譯產物？**
```bash
cargo clean
```

## 📝 下一步

完成這個 Hello World 後，您可以：
1. 學習 Rust 的基本語法和資料型別
2. 嘗試建立包含函數和變數的程序
3. 學習 Rust 的擁有權（ownership）概念
4. 探索 Rust 的套件生態系統

---

**祝您 Rust 學習愉快！** 🦀 