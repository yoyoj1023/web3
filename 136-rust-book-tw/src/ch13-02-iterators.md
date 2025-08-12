## 使用疊代器來處理一系列的項目

疊代器（Iterator）模式讓你可以對一個項目序列依序進行某些任務。疊代器的功用是遍歷序列中每個項目，並決定該序列何時結束。當你使用疊代器，你不需要自己實作這些邏輯。

在 Rust 中疊代器是**惰性**（lazy）的，代表除非你呼叫方法來使用疊代器，不然它們不會有任何效果。舉例來說，範例 13-10 的程式碼會透過 `Vec<T>` 定義的方法 `iter` 從向量`v1` 建立一個疊代器來遍歷它的項目。此程式碼本身沒有啥實用之處。

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-10/src/main.rs:here}}
```

<span class="caption">範例 13-10：建立一個疊代器</span>

疊代器儲存在變數 `v1_iter` 中。一旦我們建立了疊代器，我們可以有很多使用它的方式。在第三章的範例 3-5 中，我們在 `for` 迴圈中使用疊代器來對每個項目執行一些程式碼。在過程中這就隱性建立並使用了一個疊代器，雖然我們當時沒有詳細解釋細節。

在範例 13-11 中，我們區隔了疊代器的建立與使用疊代器 `for` 迴圈。當使用 `v1_iter` 疊代器的 `for` 迴圈被呼叫時，疊代器中的每個元素才會在迴圈中每次疊代中使用，以此印出每個數值。

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-11/src/main.rs:here}}
```

<span class="caption">範例 13-11：在 `for` 迴圈使用疊代器</span>

在標準函式庫沒有提供疊代器的語言中，你可能會用別種方式寫這個相同的函式，像是先從一個變數 0 作為索引開始、使用該變數索引向量來獲取數值，然後在迴圈中增加變數的值直到它抵達向量的總長。

疊代器會為你處理這些所有邏輯，減少重複且你可能會搞砸的程式碼。疊代器還能讓你靈活地將相同的邏輯用於不同的序列，而不只是像向量這種你能進行索引的資料結構。讓我們研究看看疊代器怎麼辦到的。

### `Iterator` 特徵與 `next` 方法

所有的疊代器都會實作定義在標準函式庫的 `Iterator` 特徵。特徵的定義如以下所示：

```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;

    // 以下省略預設實作
}
```

注意到此定義使用了一些新的語法：`type Item` 與 `Self::Item`，這是此特徵定義的**關聯型別（associated type）**。我們會在第十九章進一步探討關聯型別。現在你只需要知道此程式碼表示要實作 `Iterator` 特徵的話，你還需要定義 `Item` 型別，而此 `Item` 型別會用在方法 `next` 的回傳型別中。換句話說，`Item` 型別會是從疊代器回傳的型別。

`Iterator` 型別只要求實作者定義一個方法：`next` 方法會用 `Some` 依序回傳疊代器中的每個項目，並在疊代器結束時回傳 `None`。

我們可以直接在疊代器呼叫 `next` 方法。範例 13-12 展示從向量建立的疊代器重複呼叫 `next` 每次會得到什麼數值。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-12/src/lib.rs:here}}
```

<span class="caption">範例 13-12：對疊代器呼叫 `next` 方法</span>

注意到 `v1_iter` 需要是可變的：在疊代器上呼叫 `next` 方法會改變疊代器內部用來紀錄序列位置的狀態。換句話說，此程式碼**消耗**或者說使用了疊代器。每次 `next` 的呼叫會從疊代器消耗一個項目。而我們不必在 `for` 迴圈指定 `v1_iter` 為可變是因為迴圈會取得 `v1_iter` 的所有權並在內部將其改為可變。

另外還要注意的是我們從 `next` 呼叫取得的是向量中數值的不可變參考。`iter` 方法會從疊代器中產生不可變參考。如果我們想要一個取得 `v1` 所有權的疊代器，我們可以呼叫 `into_iter` 而非 `iter`。同樣地，如果我們想要遍歷可變參考，我們可以呼叫 `iter_mut` 而非 `iter`。

### 消耗疊代器的方法

標準函式庫提供的 `Iterator` 特徵有一些不同的預設實作方法，你可以查閱標準函式庫的 `Iterator` 特徵 API 技術文件來找到這些方法。其中有些方法就是在它們的定義呼叫 `next` 方法，這就是為何當你實作 `Iterator` 特徵時需要提供 `next` 方法的實作。

會呼叫 `next` 的方法被稱之為**消耗配接器（consuming adaptors）**，因為呼叫它們會使用掉疊代器。其中一個例子就是方法 `sum`，這會取得疊代器的所有權並重複呼叫 `next` 來遍歷所有項目，因而消耗掉疊代器。隨著遍歷的過程中，他會將每個項目加到總計中，並在疊代完成時回傳總計數值。範例 13-13 展示了一個使用 `sum` 方法的測試：

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-13/src/lib.rs:here}}
```

<span class="caption">範例 13-13：呼叫 `sum` 方法來取得疊代器中所有項目的總計數值</span>

我們呼叫 `sum` 之後就不再被允許使用 `v1_iter` 了，因為 `sum` 取得了疊代器的所有權。

### 產生其他疊代器的方法

**疊代配接器**（iterator adaptors）是定義在 `Iterator` 特徵的方法，它們不會消耗掉疊代器。它們會改變原本疊代器的一些屬性來產生不同的疊代器。

範例 13-14 呼叫了疊代器的疊代配接器方法 `map`，它會取得一個閉包在進行疊代時對每個項目進行呼叫。`map` 方法會回傳個項目被改變過的新疊代器。這裡的閉包會將向量中的每個項目加 1 來產生新的疊代器：

<span class="filename">檔案名稱：src/main.rs</span>

```rust,not_desired_behavior
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-14/src/main.rs:here}}
```

<span class="caption">範例 13-14：呼叫疊代配接器 `map` 來建立新的疊代器</span>

不過此程式碼會產生個警告：

```console
{{#include ../listings/ch13-functional-features/listing-13-14/output.txt}}
```

範例 13-14 的程式碼不會做任何事情，我們指定的閉包沒有被呼叫到半次。警告提醒了我們原因：疊代配接器是惰性的，我們必須在此消耗疊代器才行。

要修正並消耗此疊代器，我們將使用 `collect` 方法，這是我們在範例 12-1 搭配 `env::args` 使用的方法。此方法會消耗疊代器並收集結果數值至一個資料型別集合。

在範例 13-15 中，我們將遍歷 `map` 呼叫所產生的疊代器結果數值收集到一個向量中。此向量最後會包含原本向量每個項目都加 1 的數值。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-15/src/main.rs:here}}
```

<span class="caption">範例 13-15：呼叫方法 `map` 來建立新的疊代器並呼叫 `collect` 方法來消耗新的疊代器來產生向量</span>

因為 `map` 接受一個閉包，我們可以對每個項目指定任何我們想做的動作。這是一個展示如何使用閉包來自訂行為，同時又能重複使用 `Iterator` 特徵提供的遍歷行為的絕佳例子。

你可以透過疊代配接器串連多重呼叫，在進行一連串複雜運算的同時，仍保持良好的閱讀性。但因為所有的疊代器都是惰性的，你必須呼叫能消耗配接器的方法來取得疊代配接器的結果。

### 使用閉包獲取它們的環境

許多疊代配接器都會拿閉包作為引數，而通常我們向疊代配接器指定的閉包引數都能獲取它們周圍的環境。

在以下例子中，我們要使用 `filter` 方法來取得閉包。閉包會取得疊代器的每個項目並回傳布林值。如果閉包回傳 `true`，該數值就會被包含在 `filter` 產生的疊代器中；如果閉包回傳 `false`，該數值就不會被包含在結果疊代器中。

在範例 13-16 中我們使用 `filter` 與一個從它的環境獲取變數 `shoe_size` 的閉包來遍歷一個有 `Shoe` 結構體實例的集合。它會回傳只有符合指定大小的鞋子：

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-16/src/lib.rs}}
```

<span class="caption">範例 13-16：使用 `filter` 方法與一個獲取 `shoe_size` 的閉包</span>

函式 `shoes_in_size` 會取得鞋子向量的所有權以及一個鞋子大小作為參數。它會回傳只有符合指定大小的鞋子向量。

在 `shoes_in_size` 的本體中，我們呼叫 `into_iter` 來建立一個會取得向量所有權的疊代器。然後我們呼叫 `filter` 來將該疊代器轉換成只包含閉包回傳為 `true` 的元素的新疊代器。

閉包會從環境獲取 `shoe_size` 參數並比較每個鞋子數值的大小，讓只有符合大小的鞋子保留下來。最後呼叫 `collect` 來收集疊代器回傳的數值進一個函式會回傳的向量。

此測試顯示了當我們呼叫 `shoes_in_size` 時，我們會得到我們指定相同大小的鞋子。
