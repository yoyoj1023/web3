## 定義列舉

結構體讓你能將相關的欄位與資訊組織在一起，像是 `Rectangle` 中的 `width` 與 `height`，而列舉則是讓你能表達一個數值屬於一組特定數值的其中一種。舉例來說，我們可能想要表達 `Rectangle` 是其中一種可能的形狀，而這些形狀可能還包括 `Circle` 與 `Triangle`。Rust 讓我們能以列舉的形式表現這樣的可能性。

讓我們看一個程式碼表達的例子，來看看為何此時用列舉會比結構體更恰當且實用。假設我們要使用 IP 位址，而且現在有兩個主要的標準能使用 IP 位址：IPv4 與 IPv6。這些是我們的程式碼可能會遇到的 IP 位址，我們可以**列舉**（enumerate）出所有可能的變體，這正是列舉的由來。

任何 IP 位址可以是第四版或第六版，但不是同時存在。IP 位址這樣的特性非常適合使用列舉資料結構，因為列舉的值只能是其中一個變體。第四版與第六版同時都屬於 IP 位址，所以當有程式碼要處理任何類型的 IP 位址時，它們都應該被視為相同型別。

要表達這樣的概念，我們可以定義 `IpAddrKind` 列舉和列出 IP 位址可能的類型 `V4` 和 `V6`。這些稱為列舉的變體（variants）：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-01-defining-enums/src/main.rs:def}}
```

`IpAddrKind` 現在成了能在我們程式碼任何地方使用的自訂資料型別。

### 列舉數值

我們可以像這樣建立兩個不同變體的 `IpAddrKind` 實例：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-01-defining-enums/src/main.rs:instance}}
```

注意變體會位於列舉命名空間底下，所以我們用兩個冒號來標示。這樣的好處在於 `IpAddrKind::V4` 和 `IpAddrKind::V6` 都是同型別 `IpAddrKind`。比方說，我們就可以定義一個接收任 `IpAddrKind` 的函式：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-01-defining-enums/src/main.rs:fn}}
```

然後我們可以用任意變體呼叫此函式：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-01-defining-enums/src/main.rs:fn_call}}
```

使用列舉還有更多好處。我們再進一步想一下我們的 IP 位址型別還沒有辦法儲存實際的 IP 位址**資料**，我們現在只知道它是哪種**類型**。考慮到你已經學會第五章的結構體，你應該會像範例 6-1 這樣嘗試用結構體解決問題。

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/listing-06-01/src/main.rs:here}}
```

<span class="caption">範例 6-1：使用 `struct` 儲存 IP 位址的資料與 `IpAddrKind` 的變體</span>

我們在這裡定義了一個有兩個欄位的結構體 `IpAddr`：欄位 `kind` 擁有 `IpAddrKind`（我們上面定義過的列舉）型別，`address` 欄位則是 `String` 型別。再來我們有兩個此結構體的實例。第一個 `home` 擁有 `IpAddrKind::V4` 作為 `kind` 的值，然後位址資料是 `127.0.0.1`。第二個實例 `loopback` 擁有 `IpAddrKind` 另一個變體 `V6` 作為 `kind` 的值，且有 `::1` 作為位址資料。我們用結構體來組織 `kind` 和 `address` 的值在一起，讓變體可以與數值相關。

但是我們可以用另一種更簡潔的方式來定義列舉就好，而不必使用結構體加上列舉。列舉內的每個變體其實都能擁有數值。以下這樣新的定義方式讓 `IpAddr` 的 `V4` 與 `V6` 都能擁有與其相關的 `String` 數值：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-02-enum-with-data/src/main.rs:here}}
```

我們將資料直接附加到列舉的每個變體上，這樣就不再用結構體。這裏我們還能看到另一項列舉的細節：我們定義的每一個列舉變體也會變成建構該列舉的函式。也就是說 `IpAddr::V4()` 是個函式，且接收 `String` 引數並回傳 `IpAddr` 的實例。我們在定義列舉時就會自動拿到這樣的建構函式。

改使用列舉而非結構體的話還有另一項好處：每個變體可以擁有不同型別與資料的數量。第四版的 IP 位址永遠只會有四個 0 到 255 的數字部分，如果我們想要讓 `V4` 儲存四個 `u8`，但 `V6` 位址仍保持 `String` 不變的話，我們在結構體是無法做到的。列舉可以輕鬆勝任：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-03-variants-with-different-data/src/main.rs:here}}
```

我們展示了許多種定義儲存第四版與第六版 IP 位址資料結構的方式，不過需要儲存 IP 位址並編碼成不同類型的案例實在太常見了，所以[標準函式庫已經幫我們定義好了！][IpAddr]<!-- ignore -->讓我們看看標準函式庫是怎麼定義 `IpAddr` 的：它有和我們一模一樣的列舉變體，不過變體各自儲存的資料是另外兩個不同的結構體，兩個定義的內容均不相同：

```rust
struct Ipv4Addr {
    // --省略--
}

struct Ipv6Addr {
    // --省略--
}

enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}
```

此程式碼展示了你可以將任何資料類型放入列舉的變體中：字串、數字型別、結構體都可以。你甚至可以再包含另一個列舉！另外標準函式庫內的型別常常沒有你想得那麼複雜。

請注意雖然標準函式庫已經有定義 `IpAddr`，但我們還是可以使用並建立我們自己定義的型別，而且不會產生衝突，因為我們還沒有將標準函式庫的定義匯入到我們的作用域中。我們會在第七章討論如何將型別匯入作用域內。

讓我們再看看範例 6-2 的另一個列舉範例，這次的變體有各式各樣的型別。

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/listing-06-02/src/main.rs:here}}
```

<span class="caption">範例 6-2：`Message` 列舉的變體各自擁有不同的型別與數值數量</span>

此列舉有四個不同型別的變體：

* `Quit` 沒有包含任何資料。
* `Move` 包含了和結構體一樣的名稱欄位。
* `Write` 包含了一個 `String`。
* `ChangeColor` 包含了三個 `i32`。

如同範例 6-2 這樣定義列舉變體和定義不同類型的結構體很像，只不過列舉不使用 `struct` 關鍵字，而且所有的變體都會在 `Message` 型別底下。以下的結構體可以包含與上方列舉變體定義過的資料：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-04-structs-similar-to-message-enum/src/main.rs:here}}
```

但是如果我們使用不同結構體且各自都有自己的型別的話，我們就無法像範例 6-2 那樣將 `Message` 視為單一型別，輕鬆在定義函式時接收訊息所有可能的類型。

列舉和結構體還有一個地方很像：如同我們可以對結構體使用 `impl` 定義方法，我們也可以對列舉定義方法。以下範例顯示我們可以對 `Message` 列舉定義一個 `call` 方法：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-05-methods-on-enums/src/main.rs:here}}
```

方法本體使用 `self` 來取得我們呼叫方法的值。在此例中，我們建立了一個變數 `m` 並取得 `Message::Write(String::from("hello"))`，而這就會是當我們執行 `m.call()` 時 `call` 方法內會用到的 `self`。

讓我們再看看另一個標準函式庫內非常常見且實用的列舉：`Option`。

### `Option` 列舉相對於空值的優勢

在此段落我們將來研究 `Option`，這是在標準函式庫中定義的另一種列舉。`Option` 廣泛運用在許多場合，它能表示一個數值可能有某個東西，或者什麼都沒有。

舉例來說，如果你向一串包含元素的列表索取第一個值，你會拿到數值，但如果你向空列表索取的話，你就什麼都拿不到。在型別系統中表達這樣的概念可以讓編譯器檢查我們是否都處理完我們該處理的情況了。這樣的功能可以防止其他程式語言中極度常見的程式錯誤。

程式語言設計通常要考慮哪些功能是你要的，但同時哪些功能是你不要的也很重要。Rust 沒有像其他許多語言都有空值。**空值**（Null）代表的是沒有任何數值。在有空值的語言，所有變數都有兩種可能：空值或非空值。

而其發明者 Tony Hoare 在他 2009 的演講「空參考：造成數十億損失的錯誤」（“Null References: The Billion Dollar Mistake”）中提到：

> 我稱它為我十億美元級的錯誤。當時我正在為一門物件導向語言設計第一個全方位的參考型別系統。我當時的目標是透過編譯器自動檢查來確保所有的參考都是安全的。但我無法抗拒去加入空參考的誘惑，因為實作的方式實在太簡單了。這導致了無數的錯誤、漏洞與系統崩潰，在接下來的四十年中造成了大概數十億美金的痛苦與傷害。

空值的問題在於，如果你想在非空值使用空值的話，你會得到某種錯誤。由於空值與非空值的特性無所不在，你會很容易犯下這類型的錯誤。

但有時候能夠表達「空（null）」的概念還是很有用的：空值代表目前的數值因為某些原因而無效或缺少。

所以問題不在於概念本身，而在於如何實作。所以 Rust 並沒有空值，但是它有一個列舉可以表達出這樣的概念，也就是一個值可能是存在或不存在的。此列舉就是 `Option<T>`，它是在[標準函式庫中這樣定義的][option]<!-- ignore -->：

```rust
enum Option<T> {
    None,
    Some(T),
}
```

`Option<T>` 實在太實用了，所以它早已加進 prelude 中，你不需要特地匯入作用域中。它的變體一樣也被加進 prelude 中，你可以直接使用 `Some` 和 `None` 而不必加上 `Option::` 的前綴。`Option<T>` 仍然就只是個列舉，
`Some(T)` 與 `None` 仍然是`Option<T>` 型別的變體。

`<T>` 語法是我們還沒介紹到的 Rust 功能。它是個泛型型別參數，我們會在第十章正式介紹泛型（generics）。現在你只需要知道 `<T>` 指的是 `Option` 列舉中的 `Some` 變體可以是任意型別。而透過 `Option` 數值來持有數字型別和字串型別的話，它們最終會換掉 `Option<T>` 中的 `T`，成為不同的型別。以下是使用 `Option` 來包含數字與字串型別的範例：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-06-option-examples/src/main.rs:here}}
```


`some_number` 的型別是 `Option<i32>`，而 `some_char` 的型別是 `Option<char>`，兩者是不同的型別。Rust 可以推導出這些型別，因為我們已經在 `Some` 變體指定數值。至於 `absent_number` 的話，Rust 需要我們寫出完整的 `Option` 型別，因為編譯器無法從 `None` 推導出相對應的 `Some` 變體會持有哪種型別。我們在這裡告訴 Rust 我們 `absent_number` 所指的型別為 `Option<i32>`。

當我們有 `Some` 值時，我們會知道數值是存在的而且就位於 `Some` 內。當我們有 `None` 值時，在某種意義上它代表該值是空的，我們沒有有效的數值。所以為何 `Option<T>` 會比用空值來得好呢？

簡單來說因為 `Option<T>` 與 `T`（`T` 可以是任意型別）是不同的型別，編譯器不會允許我們像一般有效的值那樣來使用 `Option<T>`。舉例來說，以下範例是無法編譯的，因為這是將 `i8` 與 `Option<i8>` 相加：

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-07-cant-use-option-directly/src/main.rs:here}}
```

如果我們執行此程式，我們會得到以下錯誤訊息：

```console
{{#include ../listings/ch06-enums-and-pattern-matching/no-listing-07-cant-use-option-directly/output.txt}}
```

這樣其實很好！此錯誤訊息事實上指的是 Rust 不知道如何將 `i8` 與 `Option<i8>` 相加，因為它們是不同的型別。當我們在 Rust 中有個型別像是 `i8`，編譯器將會確保我們永遠會擁有有效數值。我們可以很放心地使用該值，而不必檢查是不是空的。我們只有在使用 `Option<i8>` （或者任何其他要使用的型別）時才需要去擔心會不會沒有值。然後編譯器會確保我們在使用該值前，有處理過該有的條件。

換句話說，你必須將 `Option<T>` 轉換為 `T` 你才能對 `T` 做運算。這通常就能幫助我們抓到空值最常見的問題：認為某值不為空，但它其實就是空值。

消除掉非空值是否正確的風險，可以讓你對你寫的程式碼更有信心。要讓一個值變成可能為空的話，你必須顯式建立成對應型別的 `Option<T>`。然後當你要使用該值時，你就得顯式處理數值是否為空的條件。只要一個數值的型別不是 `Option<T>`，你就**可以**安全地認定該值不為空。這是 Rust 刻意考慮的設計決定，限制無所不在的空值，並增強 Rust 程式碼的安全性。

所以當我們有一個數值型別 `Option<T>`，我們要怎麼從 `Some` 變體取出 `T`，好讓我們可以使用該值呢？`Option<T>` 列舉有大量實用的方法可以在不同的場合下使用。你可以在[它的技術文件][docs]<!-- ignore -->查閱。更加熟悉 `Option<T>` 的方法十分益於你接下來的 Rust 旅程。

整體來說，要使用 `Option<T>` 數值的話，你要讓程式碼可以處理每個變體。你會希望有一些程式碼只會在當我們有 `Some(T)` 時執行，然後這些程式碼允許使用內部的 `T`。你會希望有另一部分的程式碼能在只有 `None` 時執行，且這些程式碼不會拿到有效的 `T` 數值。`match` 表達式正是處理此列舉行為的控制流結構：它會針對不同的列舉變體執行不同的程式碼，而且程式碼可以使用配對到的數值資料。

[IpAddr]: https://doc.rust-lang.org/std/net/enum.IpAddr.html
[option]: https://doc.rust-lang.org/std/option/enum.Option.html
[docs]: https://doc.rust-lang.org/std/option/enum.Option.html
