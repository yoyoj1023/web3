## 透過 `cargo install` 安裝執行檔

`cargo install` 命令讓你能本地安裝並使用執行檔 crates。這並不是打算要取代系統套件，這是為了方便讓 Rust 開發者可以安裝 [crates.io](https://crates.io/)<!-- ignore --> 上分享的工具。注意你只能安裝有執行檔目標的套件。**執行檔目標**（binary target）是在 crate 有 *src/main.rs* 檔案或其他指定的執行檔時，所建立的可執行程式。而相反地，函式庫目標就無法單獨執行，因為它提供給其他程式使用的函式庫。通常 crate 都會提供 *README* 檔案說明此 crate 是函式庫還是執行檔目標，或者兩者都是。

所有透過 `cargo install` 安裝的執行檔都儲存在安裝根目錄的 *bin* 資料夾中。如果你是用 *rustup.rs*  安裝 Rust 且沒有任何自訂設置的話，此目錄會是 *$HOME/.cargo/bin*。請確定該目錄有在你的 `$PATH` 中，這樣才能夠執行 `cargo install` 安裝的程式。

舉例來說，第十二章我們提到有個 Rust 版本的 `grep` 工具叫做 `ripgrep` 能用來搜尋檔案。要安裝 `ripgrep` 的話，我們可以執行以下命令：

<!-- manual-regeneration
cargo install something you don't have, copy relevant output below
-->

```console
$ cargo install ripgrep
    Updating crates.io index
  Downloaded ripgrep v13.0.0
  Downloaded 1 crate (243.3 KB) in 0.88s
  Installing ripgrep v13.0.0
--省略--
   Compiling ripgrep v13.0.0
    Finished release [optimized + debuginfo] target(s) in 3m 10s
  Installing ~/.cargo/bin/rg
   Installed package `ripgrep v13.0.0` (executable `rg`)
```

輸出的最後兩行顯示了執行檔的安裝位置與名稱，在 `ripgrep` 此例中就是 `rg`。如稍早提到的，只要你的 `$PATH` 有包含安裝目錄，你就可以執行 `rg --help` 並開始使用更快更鏽的搜尋檔案工具！
