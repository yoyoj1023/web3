## Cargo 工作空間

在第十二章中，我們建立的套件包含一個執行檔 crate 與一個函式庫 crate。隨著專案開發，你可能會發現函式庫 crate 變得越來越大，而你可能會想要將套件拆成數個函式庫 crate。Cargo 提供了一個功能叫做**工作空間**（workspaces）能來幫助管理並開發數個相關的套件。

### 建立工作空間

**工作空間**是一系列的共享相同 *Cargo.lock* 與輸出目錄的套件。讓我們建立個使用工作空間的專案，我們會使用簡單的程式碼，好讓我們能專注在工作空間的架構上。組織工作空間的架構有很多種方式，我們會介紹其中一種常見的方式。我們的工作空間將會包含一個執行檔與兩個函式庫。執行檔會提供主要功能，並依賴其他兩個函式庫。其中一個函式庫會提供函式 `add_one`，而另一個函式庫會提供函式 `add_two`。這三個 crate 會包含在相同的工作空間中，我們先從建立工作空間的目錄開始：

```console
$ mkdir add
$ cd add
```

接著在 *add* 目錄中，我們建立會設置整個工作空間的 *Cargo.toml* 檔案。此檔案不會有 `[package]` 段落。反之，他會使用一個 `[workspace]` 段落作為起始，讓我們可以透過指定執行檔 crate 的套件路徑來將它加到工作空間的成員中。在此例中，我們的路徑是 *adder*：

<span class="filename">檔案名稱：Cargo.toml</span>

```toml
{{#include ../listings/ch14-more-about-cargo/no-listing-01-workspace-with-adder-crate/add/Cargo.toml}}
```

接下來我們會在 *add* 目錄下執行 `cargo new` 來建立 `adder` 執行檔 crate：

<!-- manual-regeneration
cd listings/ch14-more-about-cargo/output-only-01-adder-crate/add
rm -rf adder
cargo new adder
copy output below
-->

```console
$ cargo new adder
     Created binary (application) `adder` package
```

在這個階段，我們已經可以執行 `cargo build` 來建構工作空間。目錄 *add* 底下的檔案應該會看起來像這樣：

```text
├── Cargo.lock
├── Cargo.toml
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

工作空間在頂層有一個 *target* 目錄用來儲存編譯結果。`adder` 套件不會有自己的 *target* 目錄。就算我們在 *adder* 目錄底下執行 `cargo build`，編譯結果仍然會在 *add/target* 底下而非 *add/adder/target*。Cargo 之所以這樣組織工作空間的 *target* 目錄是因為工作空間的 crate 是會彼此互相依賴的。如果每個 crate 都有自己的 *target* 目錄，每個 crate 就得重新編譯工作空間中的其他每個 crate 才能將編譯結果放入它們自己的 *target* 目錄。共享 *target* 目錄的話，crate 可以避免不必要的重新建構。

### 在工作空間中建立第二個套件

接下來讓我們在工作空間中建立另一個套件成員 `add_one`。請修改頂層 *Cargo.toml* 來指定 *add_one* 的路徑到 `members` 列表中：

<span class="filename">檔案名稱：Cargo.toml</span>

```toml
{{#include ../listings/ch14-more-about-cargo/no-listing-02-workspace-with-two-crates/add/Cargo.toml}}
```

然後產生新的函式庫 crate `add_one`：

<!-- manual-regeneration
cd listings/ch14-more-about-cargo/output-only-02-add_one/add
rm -rf add_one
cargo new add_one --lib
copy output below
-->

```console
$ cargo new add_one --lib
     Created library `add_one` package
```

*add* 目錄現在應該要擁有這些目錄與檔案：

```text
├── Cargo.lock
├── Cargo.toml
├── add_one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

在 *add_one/src/lib.rs* 檔案中，讓我們加上一個函式 `add_one`：

<span class="filename">檔案名稱：add_one/src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch14-more-about-cargo/no-listing-02-workspace-with-two-crates/add/add_one/src/lib.rs}}
```

現在我們可以讓我們 `adder` 套件的執行檔依賴擁有函式庫的 `add_one` 套件。首先，我們需要將 `add_one` 的路徑依賴加到 *adder/Cargo.toml*。

<span class="filename">檔案名稱：adder/Cargo.toml</span>

```toml
{{#include ../listings/ch14-more-about-cargo/no-listing-02-workspace-with-two-crates/add/adder/Cargo.toml:6:7}}
```

Cargo 不會假設工作空間下的 crate 會彼此依賴，我們要指定彼此之間依賴的關係。

接著讓我們在 `adder` 內使用 `add_one` crate 的 `add_one` 函式。開啟 *adder/src/main.rs* 檔案並在最上方加上 `use` 來將 `add_one` 函式庫引入作用域。然後變更 `main` 函式來呼叫 `add_one` 函式，如範例 14-7 所示。

<span class="filename">檔案名稱：adder/src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch14-more-about-cargo/listing-14-07/add/adder/src/main.rs}}
```

<span class="caption">範例 14-7：在 `adder` crate 中使 `add_one` 函式庫 crate</span>

讓我們在頂層的 *add* 目錄執行 `cargo build` 來建構工作空間吧！

<!-- manual-regeneration
cd listings/ch14-more-about-cargo/listing-14-07/add
cargo build
copy output below; the output updating script doesn't handle subdirectories in paths properly
-->

```console
$ cargo build
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.68s
```

要執行 *add* 目錄的執行檔 crate，我們可以透過 `-p` 加上套件名稱使用 `cargo run` 來執行我們想要在工作空間中指定的套件：

<!-- manual-regeneration
cd listings/ch14-more-about-cargo/listing-14-07/add
cargo run -p adder
copy output below; the output updating script doesn't handle subdirectories in paths properly
-->

```console
$ cargo run -p adder
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/adder`
你好，世界！10 加一會是 11！
```

這就會執行 *adder/src/main.rs* 的程式碼，其依賴於 `add_one` crate。

#### 在工作空間中依賴外部套件

注意到工作空間只有在頂層有一個 *Cargo.lock* 檔案，而不是在每個 crate 目錄都有一個 *Cargo.lock*。這確保所有的 crate 都對所有的依賴使用相同的版本。如果我們加了 `rand` 套件到 *adder/Cargo.toml* 與 *add_one/Cargo.toml* 檔案中，Cargo 會將兩者的版本解析為同一個 `rand` 版本並記錄到同個 *Cargo.lock* 中。確保工作空間所有 crate 都會使用相同依賴代表工作空間中的 crate 永遠都彼此相容。讓我們將 `rand` crate 加到 *add_one/Cargo.toml* 檔案的 `[dependencies]` 段落中，使 `add_one` crate 可以使用 `rand` crate：

<!-- When updating the version of `rand` used, also update the version of
`rand` used in these files so they all match:
* ch02-00-guessing-game-tutorial.md
* ch07-04-bringing-paths-into-scope-with-the-use-keyword.md
-->

<span class="filename">檔案名稱：add_one/Cargo.toml</span>

```toml
{{#include ../listings/ch14-more-about-cargo/no-listing-03-workspace-with-external-dependency/add/add_one/Cargo.toml:7:8}}
```

我們現在就可以將 `use rand;` 加到 *add_one/src/lib.rs* 檔案中，接著在 *add* 目錄下執行 `cargo build` 來建構整個工作空間就會引入並編譯 `rand` crate。我們會得到一個警告，因爲我們還沒有開始使用引入作用域的 `rand`：

<!-- manual-regeneration
cd listings/ch14-more-about-cargo/no-listing-03-workspace-with-external-dependency/add
cargo build
copy output below; the output updating script doesn't handle subdirectories in paths properly
-->

```console
$ cargo build
    Updating crates.io index
  Downloaded rand v0.8.5
   --省略--
   Compiling rand v0.8.5
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
warning: unused import: `rand`
 --> add_one/src/lib.rs:1:5
  |
1 | use rand;
  |     ^^^^
  |
  = note: `#[warn(unused_imports)]` on by default
warning: `add_one` (lib) generated 1 warning
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 10.18s
```

頂層的 *Cargo.lock* 現在就包含 `add_one` 有 `rand` 作為依賴的資訊。不過就算我們能在工作空間的某處使用 `rand`，並不代表我們可以在工作空間的其他 crate 中使用它，除非它們的 *Cargo.toml* 也加上了 `rand`。舉例來說，如果我們將 `use rand;` 加到 *adder/src/main.rs* 檔案中想讓 `adder` 套件也使用的話，我們就會得到錯誤：

<!-- manual-regeneration
cd listings/ch14-more-about-cargo/output-only-03-use-rand/add
cargo build
copy output below; the output updating script doesn't handle subdirectories in paths properly
-->

```console
$ cargo build
  --省略--
   Compiling adder v0.1.0 (file:///projects/add/adder)
error[E0432]: unresolved import `rand`
 --> adder/src/main.rs:2:5
  |
2 | use rand;
  |     ^^^^ no external crate `rand`
```

要修正此問題，只要修改 `adder` 套件的 *Cargo.toml* 檔案，指示它也加入 `rand` 作為依賴就好了。這樣建構 `adder` 套件就會將在 *Cargo.lock* 中將 `rand` 加入 `adder` 的依賴，但是沒有額外的 `rand` 會被下載。Cargo 會確保工作空間中每個套件的每個 crate 都會使用相同的 `rand` 套件版本。這可以節省空間，並能確保工作空間中的 crate 彼此可以互相兼容。

#### 在工作空間中新增測試

讓我們再進一步加入一個測試函式 `add_one::add_one` 到 `add_one` crate 之中：

<span class="filename">檔案名稱：add_one/src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch14-more-about-cargo/no-listing-04-workspace-with-tests/add/add_one/src/lib.rs}}
```

現在在頂層的 *add* 目錄執行 `cargo test`。像這樣在工作空間的架構下執行 `cargo test` 會執行工作空間下所有 crate 的測試：

<!-- manual-regeneration
cd listings/ch14-more-about-cargo/no-listing-04-workspace-with-tests/add
cargo test
copy output below; the output updating script doesn't handle subdirectories in paths properly
-->

```console
$ cargo test
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished test [unoptimized + debuginfo] target(s) in 0.27s
     Running unittests src/lib.rs (target/debug/deps/add_one-f0253159197f7841

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/debug/deps/adder-49979ff40686fa8e

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests add_one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

輸出的第一個段落顯示了 `add_one` crate 中的 `it_works` 測試通過。下一個段落顯示 `adder` crate 沒有任何測試，然後最後一個段落顯示 `add_one` 中沒有任何技術文件測試。

我們也可以在頂層目錄使用 `-p` 並指定我們想測試的 crate 名稱來測試工作空間中特定的 crate：

<!-- manual-regeneration
cd listings/ch14-more-about-cargo/no-listing-04-workspace-with-tests/add
cargo test -p add_one
copy output below; the output updating script doesn't handle subdirectories in paths properly
-->

```console
$ cargo test -p add_one
    Finished test [unoptimized + debuginfo] target(s) in 0.00s
     Running unittests src/lib.rs (target/debug/deps/add_one-b3235fea9a156f74

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests add_one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

此輸出顯示 `cargo test` 只執行了 `add_one` crate 的測試並沒有執行 `adder` crate 的測試。

如果你想要發佈工作空間的 crate 到 [crates.io](https://crates.io/)，工作空間中的每個 crate 必須分別獨自發佈。和 `cargo test` 一樣，我們可以用 `-p` 的選項來指定想要的 crate 名稱，來發布工作空間內的特定 crate。

之後想嘗試練習的話，你可以在工作空間中在加上 `add_two` crate，方式和 `add_one` crate 類似！

隨著你的專案成長，你可以考慮使用工作空間：拆成各個小部分比一整塊大程式還更容易閱讀。再者，如果需要經常同時修改的話，將 crate 放在同個工作空間中更易於彼此的協作。
