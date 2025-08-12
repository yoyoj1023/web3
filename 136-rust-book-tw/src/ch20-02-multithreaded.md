## 將單一執行緒伺服器轉換為多執行緒伺服器

現在的伺服器會依序處理請求，代表它處理完第一個連線之前，都無法處理第二個連線。如果伺服器收到越來越多請求，這樣的連續處理方式會變得越來越沒效率。如果伺服器收到一個會花很久時間才能處理完成的請求，之後的請求都得等待這個長時間的請求完成才行，就算新的請求能很快處理完成也是如此。我們需要修正此問題，但首先讓我們先觀察此問題怎麼發生的。

### 對目前伺服器實作模擬緩慢的請求

我們來觀察看看處理緩慢的請求如何影響我們目前伺服器實作中的其他請求。範例 20-10 實作了處理 `/sleep` 的請求，其在回應前讓伺服器沉睡 5 秒鐘來模擬緩慢的回應。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,no_run
{{#rustdoc_include ../listings/ch20-web-server/listing-20-10/src/main.rs:here}}
```

<span class="caption">範例 20-10：沉睡 5 秒鐘來模擬緩慢的請求</span>

由於我們現在有三種情況了，我們將從 `if` 改成 `match`。我們需要用字串字面值數值來配對 `request_line`。`match` 不會像相等方法那樣自動參考和解參考。

第一個分支和範例 20-9 的 `if` 區塊相同。第二個分支配對的請求是 */sleep*。當收到請求時，伺服器會在成功顯示 HTML 頁面之前沈睡 5 秒。第三個和範例 20-9 的 `else` 區塊相同。

你可以看出我們的伺服器有多基本：真實的函式庫會以較不冗長的方式來識別處理數種請求！

使用 `cargo run` 來啟動伺服器，然後開啟兩個瀏覽器視窗：一個請求 *http://127.0.0.1:7878/* 然後另一個請求 *http://127.0.0.1:7878/sleep*。如果你輸入好幾次 `/` URI 的話，你會如之前一樣迅速地收到回應。但如果你先輸入 `/sleep` 在讀取 `/` 的話，你會看到 `/` 得等待 `sleep` 沉睡整整 5 秒鐘後才能讀取。

我們有好幾種方式能避免緩慢請求造成的請求堆積。其中一種就是我們要實作的執行緒池（thread pool）。

### 透過執行緒池改善吞吐量

**執行緒池**（thread pool）會產生一群執行緒來等待並隨時準備好處理任務。當程式收到新任務時，它會將此任務分配給執行緒池其中一條執行緒，然後該執行緒就會處理該任務。池中剩餘的執行緒在第一條執行緒處理任務時，仍能隨時處理任何其他來臨的任務。當第一條執行緒處理完成時，他會回到閒置執行緒池之中，等待處理新的任務。執行緒池讓你能並行處理連線，增加伺服器的吞吐量。

我們會限制執行緒池的數量為少量的數量就好，以避免我們遭受阻斷服務（Denial of Service，DOS）攻擊。如果我們的程式每次遇到新的請求時就產生新的執行緒，某個人就可以產生一千萬個請求至我們的伺服器，來破壞並用光我們伺服器的資源，並導致所有請求的處理都被擱置。

所以與其產生無限制的執行緒，我們會有個固定數量的執行緒在池中等待。當有請求來臨時，它們會被送至池中處理。此池會維護一個接收請求的佇列（queue）。每個執行緒會從此佇列彈出一個請求、處理該請求然後再繼續向佇列索取下一個請求。有了此設計，我們就可以同時處理 `N` 個請求，其中 `N` 就是執行緒的數量。如果每個執行緒都負責到需要長時間處理的請求，隨後的請求還是會阻塞佇列，但是我們至少增加了能夠同時處理長時間請求的數量。

此技巧只是其中一種改善網頁伺服器吞吐量的方式而已。其他你可能會探索到的選項還有 **fork/join 模型**、**單執行緒非同步模型**或**多執行緒非同步模型**。如果你對此議題有興趣，你可以閱讀其他解決方案，並嘗試實作到 Rust 中。像 Rust 這種低階語言，這些所有選項都是可能的。

在我們開始實作執行緒池之前，讓我們討論一下使用該池會是什麼樣子。當你嘗試設計程式碼時，先寫出使用者的介面能協助引導你的設計。寫出程式碼的 API，使其能以你所期望的方式呼叫，然後在該結構內實作功能，而不是先實作功能再設計公開 API。

類似於第十二章的專案所用到的測試驅動開發（test-driven development），我們會在此使用編譯器驅動開發方式。我們會先寫出呼叫所預期函式的程式碼，然後觀察編譯器的錯誤來決定接下來該改變什麼，才能讓程式碼成功運行。不過在那之前，讓我們先觀察一些我們最後不會使用的方式作為起始點。

#### 對每個請求都產生執行緒

首先，讓我們先探討如果我們的程式碼都對每次連線建立新的執行緒會怎樣。如之前提及的，這不會是我們最終的計劃，因為這有可能會產生無限條執行緒的問題，但對於討論多執行緒伺服器來說，這是個很好的起始點。我們接下來會加入執行緒池來改善，然後比較兩者誰比較簡單。範例 20-11 在 `main` 的 `for` 迴圈中，對每個流都產生一條新的執行緒。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,no_run
{{#rustdoc_include ../listings/ch20-web-server/listing-20-11/src/main.rs:here}}
```

<span class="caption">範例 20-11：對每個流都產生新的一條執行緒</span>

如你在第十六章所學到的，`thread::spawn` 會建立一條執行緒並在新的執行緒執行閉包的程式碼。如果你執行此程式碼，並在瀏覽器中讀取 `/sleep`，然後在開兩個瀏覽器分頁來讀取 `/` 的話，你的確就能看到 `/` 請求不必等待 `/sleep` 完成。但如我們所提的，這最終可能會拖累系統，因為你可以無限制地產生新的執行緒。

#### 建立數量有限的執行緒

我們想要我們的執行緒池能以類似的方式運作，這樣從執行緒切換成執行緒池時，使用我們 API 的程式碼就不必作出大量修改。範例 20-12 顯示一個我們想使用的假想 `ThreadPool` 結構體，而非使用 `thread::spawn`。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch20-web-server/listing-20-12/src/main.rs:here}}
```

<span class="caption">範例 20-12：我們理想的 `ThreadPool` 介面</span>

我們使用 `ThreadPool::new` 來建立新的執行緒池且有個可設置的執行緒數量參數，在此例中設為四。然後在 `for` 迴圈中，`pool.execute` 的介面類似於 `thread::spawn`，其會接收一個執行緒池執行在每個流中的閉包。我們需要實作 `pool.execute`，使其能接收閉包並傳給池中的執行緒來執行。此程式碼還不能編譯，但是我們接下來能試著讓編譯器引導我們如何修正。

#### 透過編譯器驅動開發建立 `ThreadPool`

將範例 20-12 的變更寫入 *src/main.rs*，然後讓我們從 `cargo check` 產生的編譯器錯誤來引導我們的開發吧。以下是我們第一個收到的錯誤：

```console
{{#include ../listings/ch20-web-server/listing-20-12/output.txt}}
```

很好！此錯誤告訴我們需要一個 `ThreadPool` 型別或模組，所以現在就讓我們來建立一個。我們的 `ThreadPool` 實作會與網頁伺服器相互獨立，所以讓我們將 `hello` crate 從執行檔 crate 轉換成函式庫 crate 來存放我們的 `ThreadPool` 實作。這樣在我們切換成函式庫 crate 之後，我們就能夠將分出來的執行緒池函式庫用在其他我們想使用執行緒池的地方，而不僅僅是作為網頁請求所用。

建立一個包含以下內容的 *src/lib.rs*，這是我們現在所能寫出最簡單的 `ThreadPool` 結構體定義了：

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-web-server/no-listing-01-define-threadpool-struct/src/lib.rs}}
```

然後編輯 *main.rs* 檔案將 `ThreadPool` 從函式庫 crate 引入作用域，請將以下程式碼寫入 *src/main.rs* 最上方：

<span class="filename">檔案名稱：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch20-web-server/no-listing-01-define-threadpool-struct/src/main.rs:here}}
```

此程式碼仍然無法執行，讓我們再次檢查並取得下一個要解決的錯誤：

```console
{{#include ../listings/ch20-web-server/no-listing-01-define-threadpool-struct/output.txt}}
```

此錯誤指示我們需要對 `ThreadPool` 建立個關聯函式叫做 `new` 。我們還知道 `new` 需要有個參數來接受作為引數的 `4`，並需要回傳 `ThreadPool` 實例。讓我們來實作擁有這些特性的最簡單 `new` 函式：

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-web-server/no-listing-02-impl-threadpool-new/src/lib.rs}}
```

我們選擇 `usize` 作為參數 `size` 的型別，因為我們知道負數對執行緒數量來說沒有任何意義。我們也知道 4 會作為執行緒集合的元素個數，這正是使用 `usize` 型別的原因，如同第三章[「整數型別」][integer-types]<!-- ignore -->段落所講的。

讓我們再檢查程式碼一次：

```console
{{#include ../listings/ch20-web-server/no-listing-02-impl-threadpool-new/output.txt}}
```

現在錯誤的原因是因為我們的 `ThreadPool` 沒有 `execute` 方法。回想一下[「建立數量有限的執行緒」](#建立數量有限的執行緒)<!-- ignore -->段落中，我們決定我們的執行緒池要有類似於 `thread::spawn` 的介面。除此之外，我們會實作 `execute` 函式使其接收給予的閉包並傳至執行緒池中閒置的執行緒來執行。

我們定義 `ThreadPool` 的 `execute` 方法接收一個閉包來作為參數。回憶一下第十三章的[「Fn 特徵以及將獲取的數值移出閉包」][fn-traits]<!-- ignore -->段落中，我們可以透過三種不同的特徵來接受閉包：`Fn`、`FnMut` 與 `FnOnce`。我們需要決定這裡該使用何種閉包。我們知道我們的行為會類似於標準函式庫中 `thread::spawn` 的實作，所以讓我們看看 `thread::spawn` 簽名中的參數有哪些界限吧。技術文件會顯示以下結果給我們：

```rust,ignore
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T,
        F: Send + 'static,
        T: Send + 'static,
```

`F` 型別參數正是我們所在意的，`T` 型別則是與回傳型別有關，而我們目前並不在意。我們可以看到 `spawn` 使用 `FnOnce` 作為 `F` 的界限。這大概就是我們也想要的，因為我們最終會將 `execute` 的引數傳遞給 `spawn`。我們現在更確信 `FnOnce` 就是我們想使用的特徵，因為執行請求的執行緒只會執行該請求閉包一次，這正符合 `FnOnce` 中 `Once` 的意思。

`F` 型別參數還有個特徵界限 `Send` 與生命週期界限 `'static`，這在我們的場合中也很實用，我們需要 `Send` 來將閉包從一個執行緒轉移到另一個，而會需要 `'static` 是因為我們不知道執行緒會處理多久。讓我們對 `ThreadPool` 建立 `execute` 方法，並採用泛型參數型別 `F` 與其界限：

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-web-server/no-listing-03-define-execute/src/lib.rs:here}}
```

我們在 `FnOnce` 之後仍然使用 `()`，因為此 `FnOnce` 代表閉包沒有任何參數且回傳值為單元型別 `()`。與函式定義一樣，回傳型別可以在簽名中省略，但是儘管我們沒有任何參數，我們還是得加上括號。

同樣地，這是 `execute` 方法最簡單的實作，它不會做任何事情，但是我們指示要先讓我們的程式碼能夠編譯通過。讓我們再次檢查：

```console
{{#include ../listings/ch20-web-server/no-listing-03-define-execute/output.txt}}
```

編譯通過了！但值得注意的是如果你嘗試 `cargo run` 並在瀏覽器下請求的話，你會像本章開頭一樣在瀏覽器看到錯誤。我們的函式庫還沒有實際呼叫傳至 `execute` 的閉包！

> 注意：你可能聽過對於像是 Haskell 和 Rust 這種嚴格編譯器的語言，會號稱「如果程式碼能編譯，它就能正確執行。」但這不全然是正確的。我們的專案能編譯，但是它沒有做任何事！如果我們在寫的是實際的完整專案，這是個寫單元測試的好時機，這能檢查程式碼能編譯**而且**有我們的預期行為。

#### 在 `new` 驗證執行緒數量

我們對 `new` 與 `execute` 的參數沒有做任何事情。讓我們對這些函式本體實作出我們所預期的行為吧。我們先從 `new` 開始。稍早我們選擇非帶號型別作為 `size` 的參數，因為負數對於執行緒數量並沒有任何意義。然而，零條執行緒的池一樣也沒有任何意義，但零卻可以是完全合理的 `usize`。我們要在回傳 `ThreadPool` 前，加上程式碼來檢查 `size` 有大於零，並透過 `assert!` 來判定。如果為零的話就會恐慌，如範例 20-13 所示。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-web-server/listing-20-13/src/lib.rs:here}}
```

<span class="caption">範例 20-13：實作 `ThreadPool::new` 且如果 `size` 為零時就會恐慌</span>

我們透過技術文件註解來對 `ThreadPool` 加上技術文件說明。注意到我們有加上一個段落說明何種情況呼叫函式會恐慌，這樣我們就有遵守良好的技術文件典範，如同第十四章所討論過的。嘗試執行 `cargo doc --open` 然後點擊 `ThreadPool` 結構體來看看 `new` 產生出的技術文件長什麼樣子！

除了像我們這樣使用 `assert!` 巨集之外，我們也可以將 `new` 改成 `build` 來回傳 `Result`，就像範例 12-9 我們對 I/O 專案的 `Config::build` 所做的一樣。但是我們決定在此情況中，嘗試建立零條執行緒的池應該要是不可回復的錯誤。如果你有信心的話，你可以試著寫出有以下簽名的 `build` 版本，並比較與 `new` 函式之間的區別：

```rust,ignore
pub fn build(size: usize) -> Result<ThreadPool, PoolCreationError> {
```

#### 建立執行緒的儲存空間

現在我們有一個有效的執行緒數量能儲存至池中，我們可以在回傳實例前，建立這些執行緒並儲存至 `ThreadPool` 結構體中。但我們要怎麼「儲存」執行緒呢？讓我們再看一次 `thread::spawn` 的簽名：

```rust,ignore
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T,
        F: Send + 'static,
        T: Send + 'static,
```

`spawn` 函式會回傳 `JoinHandle<T>`，而 `T` 為閉包回傳的型別。讓我們也試著使用 `JoinHandle` 來看看會發生什麼事。在我們的情況中，我們傳遞至執行緒池的閉包會處理連線但不會回傳任何值，所以 `T` 就會是單元型別 `()`。

範例 20-14 的程式碼可以編譯，但還不會產生任何執行緒。我們變更了 `ThreadPool` 的定義來儲存一個有 `thread::JoinHandle<()>` 實例的向量，用 `size` 來初始化向量的容量，設置一個會執行些程式碼來建立執行緒的 `for` 迴圈，然後回傳包含它們的 `ThreadPool` 實例。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,ignore,not_desired_behavior
{{#rustdoc_include ../listings/ch20-web-server/listing-20-14/src/lib.rs:here}}
```

<span class="caption">範例 20-14：在 `ThreadPool` 中建立向量來儲存執行緒</span>

我們將 `std::thread` 引入函式庫 crate 中的作用域，因為我們使用 `thread::JoinHandle` 作為 `ThreadPool` 中向量的項目型別。

一旦有收到有效大小，`ThreadPool` 就會建立一個可以儲存 `size` 個項目的新向量。`with_capacity` 函式會與 `Vec::new` 做同樣的事，但是有一個關鍵差別：它會預先配置空間給向量。由於我們知道要儲存 `size` 個元素至向量中，這樣的配置方式會比 `Vec::new` 還要略為有效一點，因為後者只會在元素插入時才重新配置自身大小。

當你再次執行 `cargo check`，這次就能成功編譯。

#### 結構體 `Worker` 負責從 `ThreadPool` 傳遞程式碼給一條執行緒

我們在範例 20-14 的 `for` 迴圈中留下一個關於建立執行緒的註解。我們在此將看看我們該如何實際建立執行緒。標準函式庫提供 `thread::spawn` 作為建立執行緒的方式，然後 `thread::spawn` 預期在執行緒建立時就會獲得一些程式碼讓執行緒能夠執行。但在我們的場合中，我們希望建立執行緒，並讓它們**等待**我們之後會傳送的程式碼。標準函式庫的執行緒實作並不包含這種方式，我們得自己實作。

我們實作此行為的方法是在 `ThreadPool` 與執行緒間建立一個新的資料結構，這用來管理此新的行為。我們將此資料結構稱為 `Worker`，這在池實作中是很常見的術語。Worker 拿取要執行的程式碼然後在自己的執行緒跑這段程式碼。想像一下這是有一群人在餐廳廚房內工作：工作者（worker）會等待顧客的訂單，然後他們負責接受這些訂單並完成它們。

所以與其在執行緒池中儲存 `JoinHandle<()>` 實例的向量，我們可以儲存 `Worker` 結構體的實例。每個 `Worker` 會儲存一個 `JoinHandle<()>` 實例。然後對 `Worker` 實作一個方法來取得閉包要執行的程式碼，並傳入已經在執行的執行緒來處理。我們也會給每個 `Worker` 一個 `id`，好讓我們在記錄日誌或除錯時，分辨池中不同的工作者。

當我們建立 `ThreadPool` 時會發生以下事情。我們會用以下方式在設置完 `Worker` 後，實作將閉包傳遞給執行緒的程式碼：

1. 定義 `Worker` 結構體存有 `id` 與 `JoinHandle<()>`。
2. 變更 `ThreadPool` 改儲存 `Worker` 實例的向量。
3. 定義 `Worker::new` 函式來接收 `id` 數字並回傳一個 `Worker` 實例，其包含該 `id` 與一條具有空閉包的執行緒。
4. 在 `ThreadPool::new` 中，使用 `for` 迴圈計數來產生 `id`，以此建立對應 `id` 的新 `Worker`，並將其儲存至向量中。

如果你想要挑戰看看的話，你可以試著先自己實作這些改變，再來查看範例 20-15 的程式碼。

準備好了嗎？以下是範例 20-15 作出修改的方式。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-web-server/listing-20-15/src/lib.rs:here}}
```

<span class="caption">範例 20-15：變更 `ThreadPool` 來儲存 `Worker` 實例，而非直接儲存執行緒</span>

我們將 `ThreadPool` 中欄位的名稱從 `threads` 改為 `workers`，因為它現在儲存的是 `Worker` 實例而非 `JoinHandle<()>` 實例。我們使用 `for` 迴圈的計數作為 `Worker::new` 的引數，然後我們將每個新的  `Worker` 儲存到名稱為 `workers` 的向量中。

外部的程式碼（像是我們在 *src/main.rs* 的伺服器）不需要知道 `ThreadPool` 內部實作細節已經改為使用 `Worker` 結構體，所以我們讓 `Worker` 結構體與其 `new` 函式維持私有。`Worker::new` 函式會使用我們給予的 `id` 並儲存一個 `JoinHandle<()>` 實例，這是用空閉包產生的新執行緒所建立的。

> 注意：如果作業系統因為系統資源不足，而無法建立執行緒的話，`thread::spawn` 會恐慌。這會使我們的伺服器恐慌，就算有些執行緒能成功建立。基於簡潔原則，這段程式碼還算能接受。但如果是正式環境的執行緒實作，你可能會想使用 [`std::thread::Builder`][builder]<!-- ignore --> 與其 [`spawn`][builder-spawn]<!-- ignore --> 方法來回傳 `Result`。

此程式碼會編譯通過並透過 `ThreadPool::new` 的指定引數儲存一定數量的 `Worker` 實例。但我們**仍然**沒有處理 `execute`中取得的閉包。讓我們看看接下來怎麼做。

#### 透過通道傳遞請求給執行緒

接下來我們要來處理的問題是 `thread::spawn` 中的閉包不會做任何事情。目前我們透過 `execute` 取得我們想執行的閉包。但是我們當在 `ThreadPool` 的產生中建立每個 `Worker` 時，我會需要給 `thread::spawn` 一個閉包來執行。

我們想要我們建立的 `Worker` 結構體能夠從 `ThreadPool` 中的佇列提取程式碼來執行，並將該程式碼傳至自身的執行緒來執行。

我們在第十六章中學過的**通道**（channels）是個能在兩個執行緒間溝通的好辦法，這對我們的專案來說可說是絕佳解法。我們會用通道來作為任務佇列，然後 `execute` 來傳送從 `ThreadPool` 一份任務至 `Worker` 實例，其就會傳遞該任務給自身的執行緒。以下是我們的計劃：

1. `ThreadPool` 會建立通道並儲存發送者。
2. 每個 `Worker` 會持有接收者。
3. 我們會建立一個新的結構體 `Job` 來儲存我們想傳入通道的閉包。
4. `execute` 方法將會傳送其想執行的 `Job` 至發送者。
5. 在其執行緒中，`Worker` 會持續遍歷接收者並執行它所收到的任何任務閉包。

讓我們先在 `ThreadPool::new` 建立通道並讓 `ThreadPool` 實例儲存發送者，如範例 20-16 所示。現在結構體 `Job` 還不會儲存任何東西，但是它最終會是我們傳送給通道的型別。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-web-server/listing-20-16/src/lib.rs:here}}
```

<span class="caption">範例 20-16：變更 `ThreadPool` 來儲存發送者以傳送 `Job` 實例</span>

在 `ThreadPool::new` 中，我們建立了一個新的通道並讓執行緒池儲存發送者。這能成功編譯，但還是會有些警告。

讓我們嘗試在執行緒池建立通道時，將接收者傳給每個 `Worker`。我們知道我們想在 `Worker` 產生的執行緒中使用接收者，所以我們得在閉包中參考 `receiver` 參數。不過範例 20-17 的程式碼還不能編譯過。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch20-web-server/listing-20-17/src/lib.rs:here}}
```

<span class="caption">範例 20-17：傳遞接收者給每個工作者</span>

我們做了一些小小卻直觀的改變：我們將接收者傳給 `Worker::new`，然後我們在閉包中使用它。

當我們檢查此程式碼時，我們會得到以下錯誤：

```console
{{#include ../listings/ch20-web-server/listing-20-17/output.txt}}
```

程式碼嘗試將 `receiver` 傳給數個 `Worker` 實例。回憶第十六章的話，你就知道這不會成功：Rust 提供的通道實作是多重**生產者**、單一**消費者**。這意味著我們不能只是克隆接收者來修正此程式碼。我們也不想重複傳送一個訊息給多重消費者，我們想要的是由數個工作者建立的訊息列表，然後每個訊息只會被處理一次。

除此之外，從通道佇列取得任務會需要可變的 `receiver`，所以執行緒需要有個安全的方式來共享並修改 `receiver`。不然的話，我們可能會遇到競爭條件（如第十六章所提及的）。

回想一下第十六章討論到的執行緒安全智慧指標：要在多重執行緒共享所有權並允許執行緒改變數值的話，我們需要使用 `Arc<Mutex<T>>`。`Arc` 型別能讓數個工作者能擁有接收端，而 `Mutex` 能確保同時間只有一個工作者能獲取任務。範例 20-18 顯示了我們需要作出的改變：

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-web-server/listing-20-18/src/lib.rs:here}}
```

<span class="caption">範例 20-18：透過 `Arc` 與`Mutex` 來在工作者間共享接收者</span>

在 `ThreadPool::new` 中，我們將接收者放入 `Arc` 與 `Mutex` 之中。對於每個新的工作者，我們會克隆 `Arc` 來增加參考計數，讓工作者可以共享接收者的所有權。

有了這些改變，程式碼就能編譯了！我們就快完成了！

#### 實作 `execute` 方法

最後讓我們來對 `ThreadPool` 實作 `execute` 方法吧。我們還會將 `Job` 的型別從結構體改為特徵物件的型別別名，這會儲存 `execute` 收到的閉包型別。如同在第十九章的[「透過型別別名建立型別同義詞」][creating-type-synonyms-with-type-aliases]<!-- ignore -->段落所介紹的，型別別名讓我們能將很長的型別變短一些以便使用，如範例 20-19 所示。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-web-server/listing-20-19/src/lib.rs:here}}
```

<span class="caption">範例 20-19：建立一個對 `Box` 的型別別名 `Job`，其存有每個閉包並傳送至通道</span>

在使用 `execute` 收到的閉包來建立新的 `Job` 實例之後，我們將該任務傳送至發送者。我們對 `send` 呼叫 `unwrap` 來處理發送失敗的情況。舉例來說，這可能會發生在當我們停止所有執行緒時，這意味著接收端不再接收新的訊息。不過目前我們還無法讓我們的執行緒停止執行，只要執行緒池還在我們的執行緒就會繼續執行。我們使用 `unwrap` 的原因是因為我們知道失敗不可能發生，但編譯器並不知情。

不過我們還沒結束呢！在工作者中，傳給 `thread::spawn` 的閉包仍然只有**參考**接收者。我們需要讓閉包一直循環，向接收者請求任務，並在取得任務時執行它。讓我們對 `Worker::new` 加上範例 20-20 的程式碼。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-web-server/listing-20-20/src/lib.rs:here}}
```

<span class="caption">範例 20-20：在工作者的執行緒中接收並執行任務</span>

我們在此首先對 `receiver` 呼叫 `lock` 以取得互斥鎖，然後我們呼叫 `unwrap` 讓任何錯誤都會恐慌。如果互斥鎖處於**污染**（poisoned）狀態的話，該鎖可能就會失敗，這在其他執行緒持有鎖時，卻發生恐慌而沒有釋放鎖的話就可能發生。在這種情形，呼叫 `unwrap` 來讓此執行緒恐慌是正確的選擇。你也可以將 `unwrap` 改成 `expect` 來加上一些對你更有幫助的錯誤訊息。

如果我們得到互斥鎖的話，我們呼叫 `recv` 來從通道中取得 `Job`。最後的 `unwrap` 也繞過了任何錯誤，這在持有發送者的執行緒被關閉時就可能發生；就和如果接收端關閉時 `send` 方法就會回傳 `Err` 的情況類似。

`recv` 的呼叫會阻擋執行緒，所以如果沒有任何任務的話，當前執行緒將等待直到下一個任務出現為止。`Mutex<T>` 確保同時間只會有一個 `Worker` 執行緒嘗試取得任務。

我們的執行緒池終於可以運作了！賞它個 `cargo run` 然後下達一些請求吧：

<!-- manual-regeneration
cd listings/ch20-web-server/listing-20-20
cargo run
make some requests to 127.0.0.1:7878
Can't automate because the output depends on making requests
-->

```console
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
warning: field is never read: `workers`
 --> src/lib.rs:7:5
  |
7 |     workers: Vec<Worker>,
  |     ^^^^^^^^^^^^^^^^^^^^
  |
  = note: `#[warn(dead_code)]` on by default

warning: field is never read: `id`
  --> src/lib.rs:48:5
   |
48 |     id: usize,
   |     ^^^^^^^^^

warning: field is never read: `thread`
  --> src/lib.rs:49:5
   |
49 |     thread: thread::JoinHandle<()>,
   |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

warning: `hello` (lib) generated 3 warnings
    Finished dev [unoptimized + debuginfo] target(s) in 1.40s
     Running `target/debug/hello`
Worker 0 got a job; executing.
Worker 2 got a job; executing.
Worker 1 got a job; executing.
Worker 3 got a job; executing.
Worker 0 got a job; executing.
Worker 2 got a job; executing.
Worker 1 got a job; executing.
Worker 3 got a job; executing.
Worker 0 got a job; executing.
Worker 2 got a job; executing.
```

成功了！我們現在有個執行緒池能非同步地處理連線。我們產生的執行緒不超過四條，所以如果伺服器收到大量請求時，我們的系統就不會超載。如果我們下達 `/sleep` 的請求，伺服器會有其他執行緒來處理其他請求並執行它們。

> 注意：如果你在數個瀏覽器視窗同時打開 `/sleep`，它們可能會彼此間隔 5 秒鐘來讀取。這是因為有些網頁瀏覽器會對多個相同請求的實例做快取。這項限制不是網頁伺服器造成的。

在學習過第十八章的 `while let` 迴圈後，你可能會好奇為何我們不像範例 20-21 這樣來寫工作者執行緒的程式碼。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,ignore,not_desired_behavior
{{#rustdoc_include ../listings/ch20-web-server/listing-20-21/src/lib.rs:here}}
```

<span class="caption">範例 20-21：使用 `while let` 來實作 `Worker::new` 的替代方案</span>

此程式碼能編譯並執行，但不會是有我們預期的執行緒行為：緩慢的請求仍然會卡住其他請求。發生的原因有點微妙，`Mutex` 結構體沒有公開的 `unlock` 方法，這是因為鎖的所有權是依據 `lock` 方法所回傳的 `LockResult<MutexGuard<T>>` 中 `MutexGuard<T>` 的生命週期。在編譯時借用檢查器可以以此確保沒有持有鎖的話，我們就無法取得 `Mutex` 守護的資源。不過沒有仔細思考 `MutexGuard<T>` 的生命週期的話，此實作可能就會導致持有鎖的時間比預期的更久。

在範例 20-20 程式碼中的 `let job = receiver.lock().unwrap().recv().unwrap();` 可以這樣寫的原因是因爲用的是 `let`，等號右方任何表達式中的暫時數值都會在 `let` 陳述式結束時釋放。然而 `while let` （還有 `if let` 和 `match`）是不會釋放暫時數值的，直到其區塊結束爲止。在範例 20-21 中，在呼叫 `job` 的這段期間內，鎖都會持續鎖著，代表其他工作者無法取得工作。

[creating-type-synonyms-with-type-aliases]: ch19-03-advanced-types.html#透過型別別名建立型別同義詞
[integer-types]: ch03-02-data-types.html#整數型別
[fn-traits]:
ch13-01-closures.html#fn-特徵以及將獲取的數值移出閉包
[builder]: https://doc.rust-lang.org/std/thread/struct.Builder.html
[builder-spawn]: https://doc.rust-lang.org/std/thread/struct.Builder.html#method.spawn
