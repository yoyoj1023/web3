## 定義與實例化結構體

結構體（Structs）和我們在[「元組型別」][tuples]<!-- ignore -->段落討論過的元組類似，兩者都能持有多種相關數值。和元組一樣，結構體的每個部分可以是不同的型別。但與元組不同的地方是，在結構體中你必須為每個資料部分命名以便表達每個數值的意義。因為有了這些名稱，結構體通常比元組還來的有彈性：你不需要依賴資料的順序來指定或存取實例中的值。

欲定義結構體，我們輸入關鍵字 `struct` 並為整個結構體命名。結構體的名稱需要能夠描述其所組合出的資料意義。然後在大括號內，我們對每個資料部分定義名稱與型別，我們會稱為**欄位（fields）**。舉例來說，範例 5-1 定義了一個儲存使用者帳號的結構體。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch05-using-structs-to-structure-related-data/listing-05-01/src/main.rs:here}}
```

<span class="caption">範例 5-1：`User` 結構體定義</span>

要在我們定義後使用該結構體，我們可以指定每個欄位的實際數值來建立結構體的**實例（instance）**。要建立實例的話，我們先寫出結構體的名稱再加上大括號，裡面會包含數個「key: value」的配對。`key` 是每個欄位的名稱，而 `value` 就是你想給予欄位的數值。欄位的順序可以不用和定義結構體時的順序一樣。換句話說，結構體的定義比較像是型別的通用樣板，然後實例會依據此樣板插入特定資料來將產生型別的數值。比如說，我們可以像範例 5-2 這樣宣告一個特定使用者。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch05-using-structs-to-structure-related-data/listing-05-02/src/main.rs:here}}
```

<span class="caption">範例 5-2：產生一個 `User` 結構體的實例</span>

要取得結構體中特定數值的話，我們使用句點。如果我們只是想要此使用者的電子郵件信箱，我們使用 `user1.email`。如果該實例可變的話，我們可以使用句點並賦值給該欄位來改變其值。範例 5-3 顯示了如何改變一個可變 `User` 實例中 `email` 欄位的值。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch05-using-structs-to-structure-related-data/listing-05-03/src/main.rs:here}}
```

<span class="caption">範例 5-3：改變 `User` 中 `email` 欄位的值</span>

請注意整個實例必須是可變的，Rust 不允許我們只標記特定欄位是可變的。再來，就像任何表達式一樣，我們可以在函式本體最後的表達式中，建立一個新的結構體實例作為回傳值。

範例 5-4 展示了 `build_user` 函式會依據給予的電子郵件和使用者名稱來回傳 `User` 實例。而 `active` 欄位取得數值 `true` 且 `sign_in_count` 取得數值 `1`。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch05-using-structs-to-structure-related-data/listing-05-04/src/main.rs:here}}
```

<span class="caption">範例 5-4：`build_user` 函式取得電子郵件與使用者名稱並回傳 `User` 實例</span>

函式參數名稱與結構體欄位名稱相同是非常合理的，但是要重複寫 `email` 和 `username` 的欄位名稱與變數就有點冗長了。如果結構體有更多欄位的話，重複寫這些名稱就顯得有些煩人了。幸運的是，我們的確有更方便的語法！

### 用欄位初始化簡寫語法

由於範例 5-4 的參數名稱與結構體欄位名稱相同，我們可以使用**欄位初始化簡寫**（field init shorthand）語法來重寫 `build_user`，讓它的結果相同但不必重複寫出 `email` 和 `username`，如範例 5-5 所示。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch05-using-structs-to-structure-related-data/listing-05-05/src/main.rs:here}}
```

<span class="caption">範例 5-5：`build_user` 函式使用欄位初始化簡寫，因為參數 `username` 與 `email` 結構體欄位相同</span>

在此我們建立了 `User` 結構體的實例，它有一個欄位叫做 `email`。我們希望用 `build_user` 函式中的參數 `email` 賦值給 `email` 欄位。然後因為 `email` 欄位與 `email` 參數有相同的名稱，我們只要寫 `email` 就好，不必寫 `email: email`。

### 使用結構體更新語法從其他結構體建立實例

通常我們也會從其他的實例來產生新的實例，保留大部分欄位，不過修改一些欄位數值，這時你可以使用**結構體更新語法（struct update syntax）**。

首先範例 5-6 顯示了我們沒有使用更新語法來建立新的 `User` 實例 `user2`。我們設置了新的數值給 `email`，但其他欄位就使用我們在範例 5-2 建立的 `user1` 相同的值。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch05-using-structs-to-structure-related-data/listing-05-06/src/main.rs:here}}
```

<span class="caption">範例 5-6：從 `user1` 中建立新的 `User` 實例</span>

使用結構體更新語法，我們可以用較少的程式碼達到相同的效果，如範例 5-7 所示。`..` 語法表示剩下沒指明的欄位都會取得與所提供的實例相同的值。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch05-using-structs-to-structure-related-data/listing-05-07/src/main.rs:here}}
```

<span class="caption">範例 5-7：對新的 `User` 實例設置新的 `email` 數值，但剩下就都使用 `user1` </span>

範例 5-7 的程式碼產生的 `user2` 實例有不同 `email`，但是有與 `user1` 相同的 `username`、`active` 和 `sign_in_count`。`..user1` 加在最後面表示任何剩餘的欄位都會與 `user1` 對應欄位的數值相同，不過我們可以用任意順序指定多少想指定的欄位，不需要與結構體定義欄位的順序一樣。

注意到結構體更新語法和賦值一樣使用 `=`，這是因為它也會轉移資料，就如同我們在[「變數與資料互動的方式：移動」][move]<!-- ignore -->段落看到的一樣。在此範例中，我們在建立 `user2` 之後就無法再使用 `user1`，因為 `user1` 的 `username` 欄位的 `String` 被移到 `user2` 了。如果我們同時給 `user2` 的 `email` 與 `username` 新的 `String`，這樣 `user1` 會用到的數值只會有 `active` 和 `sign_in_count`，這樣 `user1` 在 `user2` 就仍會有效。因為 `active` 和 `sign_in_count` 都是有實作 `Copy` 特徵的型別，所以我們在[「變數與資料互動的方式：克隆」][copy]<!-- ignore -->段落討論到的行為會造成影響。

### 使用無名稱欄位的元組結構體來建立不同型別

Rust 還支援定義結構體讓它長得像是元組那樣，我們稱作**元組結構體（tuple structs）**。元組結構體仍然有定義整個結構的名稱，但是它們的欄位不會有名稱，它們只會有欄位型別而已。元組結構體的用途在於當你想要為元組命名，好讓它跟其他不同型別的元組作出區別，以及對常規結構體每個欄位命名是冗長且不必要的時候。

要定義一個元組結構體，一樣先從 `struct` 關鍵字開始，其後再接著要定義的元組。舉例來說，以下是兩個使用元組結構體定義的 `Color` 和 `Point`：

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch05-using-structs-to-structure-related-data/no-listing-01-tuple-structs/src/main.rs}}
```

注意 `black` 與 `origin` 屬於不同型別，因為它們是不同的元組結構體實例。每個你定義的結構體都是專屬於自己的型別，就算它們的欄位型別可能一模一樣。舉例來說，一個參數為 `Color` 的函式就無法接受 `Point` 引數，就算它們的型別都是三個 `i32` 的組合。除此之外，元組結構體實例和元組類似，你可以將它們解構為獨立部分，你也可以使用 `.` 加上索引來取得每個數值。

### 無任何欄位的類單元結構體

你也可以定義沒有任何欄位的結構體！這些叫做**類單元結構體（unit-like structs）**，因為它們的行為就很像我們在[「元組型別」][tuples]<!-- ignore -->段落討論過的單元型別（unit type）`()` 類似。類單元結構體很適合用在當你要實作一個特徵（trait）或某種型別，但你沒有任何需要儲存在型別中的資料。我們會在第十章討論特徵。以下的範例宣告並實例化一個類單元結構體叫做 `AlwaysEqual`：

```rust
{{#rustdoc_include ../listings/ch05-using-structs-to-structure-related-data/no-listing-04-unit-like-structs/src/main.rs}}
```

我們使用 `struct` 關鍵字定義我們想要的名稱 `AlwaysEqual`，然後加上分號就好，不必再加任何括號！這樣我們就能一樣用 `subject` 變數取得一個 `AlwaysEqual` 的實例：直接使用我們定義的名稱，不用加任何括號。想像一下之後我們可以針對 `AlwaysEqual` 的實例實作與其他型別實例相同的行爲，像是爲了測試回傳已知的結果。我們不需要任何資料就能實作該行爲！你能在第十章看到如何定義特徵（trait）並對任何型別實作它們，這也包含類單元結構體。

> ### 結構體資料的所有權
>
> 在範例 5-1 的 `User` 結構體定義中，我們使用了擁有所有權的 `String` 型別，而不是 `&str` 字串切片型別。這邊是故意這樣選擇的，因為我們希望每個結構體的實例可以擁有它所有的資料，並在整個結構體都有效時資料也是有效的。
>
> 要在結構體中儲存別人擁有的資料參考是可行的，但這會用到**生命週期（lifetimes）**，我們在第十章才會談到。生命週期能確保資料參考在結構體存在期間都是有效的。要是你沒有使用生命週期來用結構體儲存參考的話，會如以下出錯：
>
> <span class="filename">檔案名稱：src/main.rs</span>
>
> <!-- CAN'T EXTRACT SEE https://github.com/rust-lang/mdBook/issues/1127 -->
>
> ```rust,ignore,does_not_compile
> struct User {
>     active: bool,
>     username: &str,
>     email: &str,
>     sign_in_count: u64,
> }
>
> fn main() {
>     let user1 = User {
>         active: true,
>         username: "someusername123",
>         email: "someone@example.com",
>         sign_in_count: 1,
>     };
> }
> ```
>
> 編譯器會抱怨它需要生命週期標記：
>
> ```console
> $ cargo run
>    Compiling structs v0.1.0 (file:///projects/structs)
> error[E0106]: missing lifetime specifier
>  --> src/main.rs:3:15
>   |
> 3 |     username: &str,
>   |               ^ expected named lifetime parameter
>   |
> help: consider introducing a named lifetime parameter
>   |
> 1 ~ struct User<'a> {
> 2 |     active: bool,
> 3 ~     username: &'a str,
>   |
>
> error[E0106]: missing lifetime specifier
>  --> src/main.rs:4:12
>   |
> 4 |     email: &str,
>   |            ^ expected named lifetime parameter
>   |
> help: consider introducing a named lifetime parameter
>   |
> 1 ~ struct User<'a> {
> 2 |     active: bool,
> 3 |     username: &str,
> 4 ~     email: &'a str,
>   |
>
> For more information about this error, try `rustc --explain E0106`.
> error: could not compile `structs` due to 2 previous errors
> ```
>
> 在第十章，我們將會討論如何修正這樣的錯誤，好讓你可以在結構體中儲存參考。但現在的話，我們先用有所有權的 `String` 而非 `&str` 參考來避免錯誤。

<!-- manual-regeneration
for the error above
after running update-rustc.sh:
pbcopy < listings/ch05-using-structs-to-structure-related-data/no-listing-02-reference-in-struct/output.txt
paste above
add `> ` before every line -->

[tuples]: ch03-02-data-types.html#元組型別
[move]: ch04-01-what-is-ownership.html#變數與資料互動的方式移動move
[copy]: ch04-01-what-is-ownership.html#只在堆疊上的資料拷貝copy