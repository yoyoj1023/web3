## 參考模組項目的路徑

要展示 Rust 如何從模組樹中找到一個項目，我們要使用和查閱檔案系統時一樣的路徑方法。要呼叫函式的話，我們需要知道它的路徑：

路徑可以有兩種形式：

* **絕對路徑**（absolute path）是從 crate 的源頭起始的完整路徑。如果是外部 crate 的話，絕對路徑起始於該 crate 的名稱；如果是當前 crate 的話，則是 `crate` 作為起頭。
* **相對路徑**（relative path）則是從本身的模組開始，使用 `self`、`super` 或是當前模組的標識符（identifiers）。

無論是絕對或相對路徑其後都會接著一或多個標識符，並使用雙冒號（`::`）區隔開來。

回頭看看範例 7-1，假設我們想呼叫函式 `add_to_waitlist`。這就像在問函式 `add_to_waitlist` 的路徑在哪？範例 7-3 移除了一些範例 7-1 的模組與函式來精簡程式碼的呈現方式。

我們會展示兩種從 crate 源頭定義的 `eat_at_restaurant` 函式內呼叫 `add_to_waitlist` 的方法。這些路徑是正確的，不過目前還有其他問題會導致此範例無法編譯，我們會在稍後說明。

`eat_at_restaurant` 函式是我們函式庫 crate 公開 API 的一部分，所以我們會加上 `pub` 關鍵字。在[「使用 `pub` 關鍵字公開路徑」][pub]<!-- ignore -->的段落中，我們會提到更多 `pub` 的細節。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-03/src/lib.rs}}
```

<span class="caption">範例 7-3：使用絕對與相對路徑呼叫 `add_to_waitlist` 函式</span>

我們在 `eat_at_restaurant` 中第一次呼叫 `add_to_waitlist` 函式的方式是用絕對路徑。`add_to_waitlist` 函式和 `eat_at_restaurant` 都是在同一個 crate 底下，所以我們可以使用 `crate` 關鍵字來作為絕對路徑的開頭。我們接續加上對應的模組直到抵達 `add_to_waitlist`。你可以想像一個有相同架構的檔案系統，然後我們指定 `/front_of_house/hosting/add_to_waitlist` 這樣的路徑來執行 `add_to_waitlist` 程式。使用 `crate` 這樣的名稱作為 crate 源頭的開始，就像在你的 shell 使用 `/` 作為檔案系統的根一樣。

而我們第二次在 `eat_at_restaurant` 呼叫 `add_to_waitlist` 的方式是使用相對路徑。路徑的起頭是 `front_of_house`，因為它和 `eat_at_restaurant` 都被定義在模組樹的同一層中。這裡相對應的檔案系統路徑就是 `front_of_house/hosting/add_to_waitlist`。使用一個模組名稱作為開頭通常就是代表相對路徑。

何時該用相對或絕對路徑是你在你的專案中要做的選擇，依照你想將程式碼的定義連帶與使用它們的程式碼一起移動，或是分開移動到不同地方。舉例來說，如果我們同時將 `front_of_house` 模組和 `eat_at_restaurant` 函式移入另一個模組叫做 `customer_experience` 的話，就會需要修改 `add_to_waitlist` 的絕對路徑，但是相對路徑就可以原封不動。而如果我們只單獨將 `eat_at_restaurant` 函式移入一個叫做 `dining` 模組的話，`add_to_waitlist` 的絕對路徑就不用修改，但相對路徑就需要更新。我們通常會傾向於指定絕對路徑，因為分別移動程式碼定義與項目呼叫的位置通常是比較常見的。

讓我們嘗試編譯範例 7-3 並看看為何不能編譯吧！以下範例 7-4 是我們得到的錯誤資訊。

```console
{{#include ../listings/ch07-managing-growing-projects/listing-07-03/output.txt}}
```

<span class="caption">範例 7-4：範例 7-3 嘗試編譯程式碼出現的錯誤</span>

錯誤訊息表示 `hosting` 模組是私有的。換句話說，我們指定 `hosting` 模組與 `add_to_waitlist` 函式的路徑是正確的，但是因為它沒有私有部分的存取權，所以 Rust 不讓我們使用。在 Rust 中所有項目（函式、方法、結構體、列舉、模組與常數）的隱私權都是私有的。如果你想要建立私有的函式或結構體，你可以將它們放入模組內。

上層模組的項目無法使用下層模組的私有項目，但下層模組能使用它們上方所有模組的項目。這麼做的原因是因為下層模組用來實現實作細節，而下層模組應該要能夠看到在自己所定義的地方的其他內容。讓我們繼續用餐廳做比喻的話，我們可以想像隱私權規則就像是餐廳的後台辦公室。對餐廳顧客來說裡面發生什麼事情都是未知的，但是辦公室經理可以知道經營餐廳時的所有事物。

Rust 選擇這樣的模組系統，讓內部實作細節預設都是隱藏起來的。這樣一來，你就能知道內部哪些程式碼需要修改，而不會破壞到外部的程式碼。不過 Rust 有提供 `pub` 關鍵字能讓項目公開，讓你可以將下層模組內部的一些程式碼公開給上層模組來使用。

### 使用 `pub` 關鍵字公開路徑

讓我們再執行一次範例 7-4 的錯誤，它告訴我們 `hosting` 模組是私有的。我們希望上層模組中的 `eat_at_restaurant` 函式可以呼叫下層模組的 `add_to_waitlist` 函式，所以我們將 `hosting` 模組加上 `pub` 關鍵字，如範例 7-5 所示。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-05/src/lib.rs}}
```

<span class="caption">範例 7-5：宣告 `hosting` 模組為 `pub` 好讓 `eat_at_restaurant` 可以使用</span>

不幸的是範例 7-5 的程式碼仍然回傳了另一個錯誤，如範例 7-6 所示。

```console
{{#include ../listings/ch07-managing-growing-projects/listing-07-05/output.txt}}
```

<span class="caption">範例 7-6：編譯範例 7-5 時產生的錯誤</span>

到底發生了什麼事？在 `mod hosting` 之前加上 `pub` 關鍵字確實公開了模組。有了這項修改後，我們的確可以在取得 `front_of_house` 後，繼續進入 `hosting`。但是 `hosting` 的所有**內容**仍然是私有的。模組中的 `pub` 關鍵字只會讓該模組公開讓上層模組使用而已，而不是存取它所有的內部程式碼。因為模組相當於一個容器，如果我們只公開模組的話，本身並不能做多少事情。我們需要再進一步選擇公開模組內一些項目才行。

範例 7-6 的錯誤訊息表示 `add_to_waitlist` 函式是私有的。隱私權規則如同模組一樣適用於結構體、列舉、函式與方法。

讓我們在 `add_to_waitlist` 的函式定義加上 `pub` 公開它吧，如範例 7-7 所示。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground,test_harness
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-07/src/lib.rs}}
```

<span class="caption">範例 7-7：將 `mod hosting` 和 `fn add_to_waitlist` 都加上 `pub` 關鍵字，讓我們可以從 `eat_at_restaurant` 呼叫函式</span>

現在程式碼就能成功編譯了！要理解為何加上 `pub` 關鍵字讓我們可以在 `add_to_waitlist` 取得這些路徑，同時遵守隱私權規則，讓我們來看看絕對路徑與相對路徑。

在絕對路徑中，我們始於 `crate`，這是 crate 模組樹的根。再來 `front_of_house` 模組被定義在 crate 源頭中，`front_of_house` 模組不是公開，但因為 `eat_at_restaurant` 函式被定義在與 `front_of_house` 同一層模組中（也就是 `eat_at_restaurant` 與 `front_of_house` 同輩（siblings）），我們可以從 `eat_at_restaurant` 參考 `front_of_house`。接下來是有 `pub` 標記的 `hosting` 模組，我們可以取得 `hosting` 的上層模組，所以我們可以取得 `hosting`。最後 `add_to_waitlist` 函式也有 `pub` 標記而我們可以取得它的上層模組，所以整個程式呼叫就能執行了！

而在相對路徑中，基本邏輯與絕對路徑一樣，不過第一步有點不同。我們不是從 crate 源頭開始，路徑是從 `front_of_house` 開始。`front_of_house` 與 `eat_at_restaurant` 被定義在同一層模組中，所以從 `eat_at_restaurant` 開始定義的相對路徑是有效的。再來因為 `hosting` 與 `add_to_waitlist` 都有 `pub` 標記，其餘的路徑也都是可以進入的，所以此函式呼叫也是有效的！

如果你計畫分享你的函式庫 crate 來讓其他專案能使用你的程式碼，你的公開 API 就是你對 crate 使用者的合約，這會決定他們能如何使用你的程式碼。這需要考量管理你的公開 API，好讓其他人能輕鬆依賴你的 crate。這類的考量不在本書的範疇，如果你對於此議題有興趣的話，請查看 [Rust API Guidelines][api-guidelines]。

> #### 執行檔與函式庫套件的最佳實踐
>
> 我們提到套件能同時包含 *src/main.rs* 作為執行檔 crate 源頭以及 *src/lib.rs* 作為函式庫 crate 源頭，兩者預設都是用套件的名稱。通常來說，一個函式庫與一個執行檔 crate 這樣的套件模式，在執行檔中只會留下必要的程式碼，其餘則呼叫函式庫的程式碼。這樣其他專案也能運用到套件提供的多數功能，因為函式庫 crate 的程式碼可以分享。
>
> 模組要定義在 *src/lib.rs*。然後在執行檔 crate 中，任何公開項目都能用套件名稱作為開頭找到。執行檔 crate 應視為函式庫 crate 的使用者，就像外部 crate 那樣使用一樣，只能使用公開 API。這有助於你設計出良好的 API，你不僅是作者，同時還是自己的客戶！
>
> 在[第十二章][ch12]<!-- ignore -->中，我們會透過寫個命令列程式來介紹這樣的組織練習，該程式會包含一個執行檔 crate 與一個函式庫 crate。

### 使用 `super` 作為相對路徑的開頭

我們可以在路徑開頭使用 `super` 來建構從上層模組出發的相對路徑，而不用從 crate 源頭開始。這就像在檔案系統中使用 `..` 作為路徑開頭一樣。使用 `super` 讓我們能參考確定位於上層模組的項目。當模組與上層模組有高度關聯，且上層模組可能以後會被移到模組樹的其他地方時，這能讓組織模組樹更加輕鬆。

請考慮範例 7-8 的程式碼，這模擬了一個主廚修正一個錯誤的訂單，並親自提供給顧客的場景。定義在 `back_of_house` 模組的函式 `fix_incorrect_order` 呼叫了定義在上層模組的函式 `deliver_order`，不過這次是使用 `super` 來指定 `deliver_order` 的路徑：

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground,test_harness
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-08/src/lib.rs}}
```

<span class="caption">範例 7-8：使用 `super` 作為呼叫函式路徑的開頭</span>

`fix_incorrect_order` 函式在 `back_of_house` 模組中，所以我們可以使用 `super` 前往 `back_of_house` 的上層模組，在此例的話就是源頭 `crate`。然後在此時我們就能找到 `deliver_order`。成功！我們認定 `back_of_house` 模組與 `deliver_order` 函式應該會維持這樣相同的關係，在我們要組織 crate 的模組樹時，它們理當一起被移動。因此我們使用 `super` 讓我們在未來程式碼被移動到不同模組時，我們不用更新太多程式路徑。

### 公開結構體與列舉

我們也可以使用 `pub` 來公開結構體與列舉，但是我們有些額外細節要考慮到。如果我們在結構體定義之前加上 `pub` 的話，我們的確能公開結構體，但是結構體內的欄位仍然會是私有的。我們可以視情況決定每個欄位要不要公開。在範例 7-9 我們定義了一個公開的結構體 `back_of_house::Breakfast` 並公開欄位 `toast`，不過將欄位 `seasonal_fruit` 維持是私有的。這次範例模擬的情境是，餐廳顧客可以選擇早餐要點什麼類型的麵包，但是由主廚視庫存與當季食材來決定提供何種水果。餐廳提供的水果種類隨季節變化很快，所以顧客無法選擇或預先知道他們會拿到何種水果。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-09/src/lib.rs}}
```

<span class="caption">範例 7-9：一個有些欄位公開而有些是私有欄位的結構體</span>

因為 `back_of_house::Breakfast` 結構體中的 `toast` 欄位是公開的，在 `eat_at_restaurant` 中我們可以加上句點來對 `toast` 欄位進行讀寫。注意我們不能在 `eat_at_restaurant` 使用 `seasonal_fruit` 欄位，因為它是私有的。請嘗試解開修改 `seasonal_fruit` 欄位數值的那行程式註解，看看你會獲得什麼錯誤！

另外因為 `back_of_house::Breakfast` 擁有私有欄位，該結構體必須提供一個公開的關聯函式（associated function）才有辦法產生 `Breakfast` 的實例（我們在此例命名為 `summer`）。如果 `Breakfast` 沒有這樣的函式的話，我們就無法在 `eat_at_restaurant` 建立 `Breakfast` 的實例，因為我們無法在 `eat_at_restaurant` 設置私有欄位 `seasonal_fruit` 的數值。

接下來，如果我們公開列舉的話，那它所有的變體也都會公開。我們只需要在 `enum` 關鍵字之前加上 `pub` 就好，如範例 7-10 所示。

<span class="filename">檔案名稱：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch07-managing-growing-projects/listing-07-10/src/lib.rs}}
```

<span class="caption">範例 7-10：公開列舉會讓其所有變體也公開</span>

因為我們公開了 `Appetizer` 列舉，我們可以在 `eat_at_restaurant` 使用 `Soup` 和 `Salad`。

列舉的變體沒有全部都公開的話，通常會讓列舉很不好用。要用 `pub` 標註所有的列舉變體都公開的話又很麻煩。所以公開列舉的話，預設就會公開其變體。相反地，結構體不讓它的欄位全部都公開的話，通常反而比較實用。因此結構體欄位的通用原則是預設為私有，除非有 `pub` 標註。

我們還有一個 `pub` 的使用情境還沒提到，也就是我們模組系統最後一項功能：`use` 關鍵字。我們接下來會先解釋 `use`，再來研究如何組合 `pub` 和 `use`。

[pub]: ch07-03-paths-for-referring-to-an-item-in-the-module-tree.html#使用-pub-關鍵字公開路徑
[api-guidelines]: https://rust-lang.github.io/api-guidelines/
[ch12]: ch12-00-an-io-project.html
