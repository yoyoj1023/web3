## 使用執行緒同時執行程式碼

在大部分的現代作業系統中，被執行的程式碼會在**程序（process）**中執行，作業系統會負責同時處理數個程序。在你的程式中，你也可以將各自獨立的部分同時執行。執行這些獨立部分的功能就叫做**執行緒（threads）**。舉例來說，一個網路伺服器可以有數個執行緒來同時回應一個以上的請求。

將程式中的運算拆成數個執行緒可以提升效能，不過這也同時增加了複雜度。因為執行緒可以同時執行，所以無法保證不同執行緒的程式碼執行的順序。這會導致以下問題：

* 競爭條件（Race conditions）：數個執行緒以不一致的順序取得資料或資源
* 死結（Deadlocks）：兩個執行緒彼此都在等待對方，因而讓執行緒無法繼續執行
* 只在特定情形會發生的程式錯誤，並難以重現與穩定修復

Rust 嘗試降低使用執行緒所帶來的負面效果，不過對於多執行緒程式設計還是得格外小心，其所要求的程式結構也與單一執行緒的程式有所不同。

不同程式語言會以不同的方式實作執行緒，許多作業系統都有提供 API 來建立新的執行緒。Rust 標準函式庫使用的是 *1:1* 的執行緒實作模型，也就是每一個語言產生的執行緒就是一個作業系統的執行緒。有其他 crate 會實作其他種執行緒模型，讓我們能與 1:1 模型之間做取捨。

### 透過 `spawn` 建立新的執行緒

要建立一個新的執行緒，我們呼叫函式 `thread::spawn` 並傳入一個閉包（我們在第十三章談過閉包），其包含我們想在新執行緒執行的程式碼。範例 16-1 會在主執行緒印出一些文字，並在新執行緒印出其他文字：

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch16-fearless-concurrency/listing-16-01/src/main.rs}}
```

<span class="caption">範例 16-1：建立一個會印出一些字的新執行緒，而主執行緒會印出其他字</span>

注意到當 Rust 程式的主執行緒完成的話，所有執行緒也會被停止，無論它有沒有完成任務。此程式的輸出結果每次可能都會有點不相同，但它會類似以下這樣：

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
數字 1 出現在主執行緒中！
數字 1 出現在產生的執行緒中！
數字 2 出現在主執行緒中！
數字 2 出現在產生的執行緒中！
數字 3 出現在主執行緒中！
數字 3 出現在產生的執行緒中！
數字 4 出現在主執行緒中！
數字 4 出現在產生的執行緒中！
數字 5 出現在產生的執行緒中！
```

`thread::sleep` 的呼叫強制執行緒短時間內停止運作，讓不同的執行緒可以執行。執行緒可能會輪流執行，但並不保證絕對如此，這會依據你的作業系統如何安排執行緒而有所不同。在這一輪中，主執行緒會先顯示，就算程式中是先寫新執行緒的 `println!` 陳述式。而且雖然我們是寫說新執行緒印出 `i` 一直到 9，但它在主執行緒結束前只印到 5。

如果當你執行此程式時只看到主執行緒的結果，或者沒有看到任何交錯的話，你可以嘗試增加數字範圍來增加作業系統切換執行緒的機會。

### 使用 `join` 等待所有執行緒完成

範例 16-1 的程式碼在主執行緒結束時不只會在大多數的時候提早結束新產生的執行緒，還不能保證執行緒運行的順序，我們甚至無法保證產生的執行緒真的會執行！

透過儲存 `thread::spawn` 回傳的數值為變數，我們可以修正產生的執行緒完全沒有執行或沒有執行完成的問題。`thread::spawn` 的回傳型別為 `JoinHandle`。`JoinHandle` 是個有所有權的數值，當我們對它呼叫 `join` 方法時，它就會等待它的執行緒完成。範例 16-2 顯示了如何使用我們在範例 16-1 中執行緒的 `JoinHandle` 並呼叫 `join` 來確保產生的執行緒會在 `main` 離開之前完成：

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch16-fearless-concurrency/listing-16-02/src/main.rs}}
```

<span class="caption">範例 16-2：從 `thread::spawn` 儲存 `JoinHandle` 以保障執行緒能執行完成</span>

對其呼叫 `join` 會阻擋當前正在執行的執行緒中直到 `JoinHandle` 的執行緒結束為止。**阻擋**（Blocking）一條執行緒代表該執行緒不會繼續運作或離開。因為我們在主執行緒的 `for` 迴圈之後加上了 `join` 的呼叫，範例 16-2 應該會產生類似以下的輸出：

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
數字 1 出現在主執行緒中！
數字 2 出現在主執行緒中！
數字 1 出現在產生的執行緒中！
數字 3 出現在主執行緒中！
數字 2 出現在產生的執行緒中！
數字 4 出現在主執行緒中！
數字 3 出現在產生的執行緒中！
數字 4 出現在產生的執行緒中！
數字 5 出現在產生的執行緒中！
數字 6 出現在產生的執行緒中！
數字 7 出現在產生的執行緒中！
數字 8 出現在產生的執行緒中！
數字 9 出現在產生的執行緒中！
```

兩條執行緒會互相交錯，但是主執行緒這次會因為 `handle.join()` 而等待，直到產生的執行緒完成前都不會結束。

那如果我們如以下這樣將 `handle.join()` 移到 `main` 中的 `for` 迴圈前會發生什麼事呢：

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch16-fearless-concurrency/no-listing-01-join-too-early/src/main.rs}}
```

主執行緒會等待產生的執行緒完成才會執行它的 `for` 迴圈，所以輸出結果就不會彼此交錯，如以下所示：

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
數字 1 出現在產生的執行緒中！
數字 2 出現在產生的執行緒中！
數字 3 出現在產生的執行緒中！
數字 4 出現在產生的執行緒中！
數字 5 出現在產生的執行緒中！
數字 6 出現在產生的執行緒中！
數字 7 出現在產生的執行緒中！
數字 8 出現在產生的執行緒中！
數字 9 出現在產生的執行緒中！
數字 1 出現在主執行緒中！
數字 2 出現在主執行緒中！
數字 3 出現在主執行緒中！
數字 4 出現在主執行緒中！
```

像這樣將 `join` 呼叫置於何處的小細節，會影響你的執行緒會不會同時運行。

### 透過執行緒使用 `move` 閉包

我們通常會使用 `thread::spawn` 時都會搭配有 `move` 關鍵字的閉包，因為該閉包能獲取周圍環境的數值，轉移那些數值的所有權到另一個執行緒中。在第十三章的[「獲取參考或移動所有權」][capture]<!-- ignore-->段落我們討論過閉包如何運用 `move`。現在我們會來專注在 `move` 與 `thread::spawn` 之間如何互動。


在第十三章中，我們提到我們可以在閉包參數列表前使用 `move` 關鍵字來強制閉包取得其從環境獲取數值的所有權。此技巧在建立新的執行緒特別有用，讓我們可以從一個執行緒轉移數值所有權到另一個執行緒。

注意到範例 16-1 中我們傳入 `thread::spawn` 的閉包沒有任何引數，我們在產生的執行緒程式碼內沒有使用主執行緒的任何資料。要在產生的執行緒中使用主執行緒的資料的話，產生的執行緒閉包必須獲取它所需的資料。範例 16-3 嘗試在主執行緒建立一個向量並在產生的執行緒使用它。不過這目前無法執行，你會在稍後知道原因。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch16-fearless-concurrency/listing-16-03/src/main.rs}}
```

<span class="caption">範例 16-3：嘗試在其他執行緒使用主執行緒建立的向量</span>

閉包想使用 `v`，所以它得獲取 `v` 並使其成為閉包環境的一部分。因為 `thread::spawn` 會在新的執行緒執行此閉包，我們要能在新的執行緒內存取 `v`。但當我們編譯此範例時，我們會得到以下錯誤：

```console
{{#include ../listings/ch16-fearless-concurrency/listing-16-03/output.txt}}
```

Rust 會**推斷**如何獲取 `v` 而且因為 `println!` 只需要 `v` 的參考，閉包得借用 `v`。不過這會有個問題，Rust 無法知道產生的執行緒會執行多久，所以它無法確定 `v` 的參考是不是永遠有效。

範例 16-4 提供了一個情境讓 `v` 很有可能不再有效：

<span class="filename">檔案名稱：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch16-fearless-concurrency/listing-16-04/src/main.rs}}
```

<span class="caption">範例 16-4：執行緒的閉包嘗試獲取 `v` 的參考，但主執行緒會釋放 `v`</span>

如果 Rust 允許執行此程式碼，產生的執行緒是有可能會置於背景而沒有馬上執行。產生的執行緒內部有 `v` 的參考，但主執行緒會立即釋放 `v`，使用我們在第十五章討論過的 `drop` 函式。然後當產生的執行緒開始執行時，`v` 就不再有效了，所以它的參考也是無效的了。喔不！

要修正範例 16-3 的編譯錯誤，我們可以使用錯誤訊息的建議：

<!-- manual-regeneration
after automatic regeneration, look at listings/ch16-fearless-concurrency/listing-16-03/output.txt and copy the relevant part
-->

```text
help: to force the closure to take ownership of `v` (and any other referenced variables), use the `move` keyword
  |
6 |     let handle = thread::spawn(move || {
  |                                ++++
```

透過在閉包前面加上 `move` 關鍵字，我們強制讓閉包取得它所要使用數值的所有權，而非任由 Rust 去推斷它是否該借用數值。範例 16-5 修改了範例 16-3 並能夠如期編譯與執行：

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch16-fearless-concurrency/listing-16-05/src/main.rs}}
```

<span class="caption">範例 16-5：使用 `move` 關鍵字強制閉包取得它所使用數值的所有權</span>


我們可能會想嘗試用範例 16-4 做的事來修正程式碼，使用 `move` 閉包的同時在主執行緒呼叫 `drop`。但這樣的修正沒有用，因為範例 16-4 想做的事情會因為不同原因而不被允許。如果我們對閉包加上了 `move`，我們將會把 `v` 移入閉包環境，而在主執行緒將無法再對它呼叫 `drop` 了。我們會得到另一個編譯錯誤：

```console
{{#include ../listings/ch16-fearless-concurrency/output-only-01-move-drop/output.txt}}
```

Rust 的所有權規則再次拯救了我們！我們在範例 16-3 會得到錯誤是因為 Rust 是保守的，所以只會為執行緒借用 `v`，這代表主執行緒理論上可能會使產生的執行緒的參考無效化。透過告訴 Rust 將 `v` 的所有權移入產生的執行緒中，我們向 Rust 保證不會在主執行緒用到 `v`。如果我們用相同方式修改範例 16-4 的話，當我們嘗試在主執行緒使用 `v` 的話，我們就違反了所有權規則。`move` 關鍵字會覆蓋 Rust 保守的預設借用行為，且也不允許我們違反所有權規則。

有了對執行緒與執行緒 API 的基本瞭解，讓我們看看我們可以透過執行緒**做些**什麼。

[capture]: ch13-01-closures.html#獲取參考或移動所有權
