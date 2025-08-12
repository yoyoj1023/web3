## 什麼是所有權？

**所有權**在 Rust 中用來管理程式記憶體的一系列規則。 

所有程式都需要在執行時管理它們使用記憶體的方式。有些語言會用垃圾回收機制，在程式執行時不斷尋找不再使用的記憶體；而有些程式，開發者必須親自配置和釋放記憶體。Rust 選擇了第三種方式：記憶體由所有權系統管理，且編譯器會在編譯時加上一些規則檢查。如果有地方違規的話，程式就無法編譯。這些所有權的規則完全不會降低執行程式的速度。

因為所有權對許多程式設計師來說是個全新的觀念，所以的確需要花一點時間消化。好消息是隨著你越熟悉 Rust 與所有權系統的規則，你越能輕鬆地開發出安全又高效的程式碼。加油，堅持下去！

當你理解所有權時，你就有一個穩健的基礎能夠理解那些使 Rust 獨特的功能。在本章節中，你將透過一些範例來學習所有權，我們會專注在一個非常常見的資料結構：字串。

> ### 堆疊（Stack）與堆積（Heap）
>
> 在許多程式語言中，你通常不需要去想到堆疊與堆積。但在像是 Rust 這樣的系統程式語言，資料是位於堆疊還是堆積就會有差，這會影響語言的行為也是你得作出某些特定決策的理由。在本章稍後討論所有權時，都會談到堆疊與堆積的關聯，所以這裡預先稍作解釋。
>
> 堆疊與堆積都是提供程式碼在執行時能夠使用的記憶體部分，但他們組成的方式卻不一樣。堆疊會按照它取得數值的順序依序存放它們，並以相反的順序移除數值。這通常稱為**後進先出（last in, first out）**。你可以把堆疊想成是盤子，當你要加入更多盤子，你會將它們疊在最上面。如果你要取走盤子的話，你也是從最上方拿走。想要從底部或中間，插入或拿走盤子都是不可行的！當我們要新增資料時，我們會稱呼為**推入堆疊（pushing onto the stack）**，而移除資料則是叫做**彈出堆疊（popping off the stack）**。所有在堆疊上的資料都必須是已知固定大小。在編譯時屬於未知或可能變更大小的資料必須儲存在堆積。
>
> 堆積就比較沒有組織，當你要將資料放入堆積，你得要求一定大小的空間。記憶體配置器（memory allocator）會找到一塊夠大的空位，標記為已佔用，然後回傳一個**指標（pointer）**，指著該位置的位址。這樣的過程稱為**在堆積上配置（allocating on the heap）**，或者有時直接簡稱為**配置**（allocating）就好（將數值放入堆疊不會被視為是在配置）。因為指標是固定已知的大小，所以你可以存在堆疊上。但當你要存取實際資料時，你就得去透過指標取得資料。你可以想像成是一個餐廳。當你進入餐廳時，你會告訴服務員你的團體有多少人，他就會將你們帶到足夠人數的餐桌。如果你的團體有人晚到的話，他們可以直接詢問你坐在哪而找到你。
>
> 將資料推入堆疊會比在堆積上配置還來的快，因為配置器不需要去搜尋哪邊才能存入新資料，其位置永遠在堆疊最上方。相對的，堆積就需要比較多步驟，配置器必須先找到一個夠大的空位來儲存資料，然後作下紀錄為下次配置做準備。
>
> 在堆積上取得資料也比在堆疊上取得來得慢，因為你需要用追蹤指標才找的到。現代的處理器如果在記憶體間跳轉越少的話速度就越快。讓我們繼續用餐廳做比喻，想像伺服器就是在餐廳為數個餐桌點餐。最有效率的點餐方式就是依照餐桌順序輪流點餐。如果幫餐桌 A 點了餐之後跑到餐桌 B 點，又跑回到 A 然後又跑到 B 的話，可以想像這是個浪費時間的過程。同樣的道理，處理器在處理任務時，如果處理的資料相鄰很近（就如同存在堆疊）的話，當然比相鄰很遠（如同存在堆積）來得快。
>
> 當你的程式碼呼叫函式時，傳遞給函式的數值（可能包含指向堆積上資料的指標）與函式區域變數會被推入堆疊。當函式結束時，這些數值就會被彈出。
>
> 追蹤哪部分的程式碼用到了堆積上的哪些資料、最小化堆積上的重複資料、以及清除堆積上沒在使用的資料確保你不會耗盡空間，這些問題都是所有權系統要處理的。一旦你理解所有權後，你通常就不再需要經常考慮堆疊與堆積的問題，不過能理解所有權主要就是為了管理堆積有助於解釋為何它要這樣運作。

### 所有權規則

首先，讓我們先看看所有權規則。當我們在解釋說明時，請記得這些規則：

* Rust 中每個數值都有個**擁有者（owner）**。
* 同時間只能有一個擁有者。
* 當擁有者離開作用域時，數值就會被丟棄。

### 變數作用域

現在既然我們已經知道了基本語法，我們接下來就不再將 `fn main() {` 寫進程式碼範例範例中。所以你在參考時，請記得親自寫在 `main` 函式內。這樣一來，我們的範例可以更加簡潔，讓我們更加專注在細節而非樣板程式。

作為所有權的第一個範例，我們先來看變數的**作用域（scope）**。作用域是一些項目在程式內的有效範圍。假設我們有以下變數：

```rust
let s = "hello";
```

變數 `s` 是一個字串字面值（string literal），而字串數值是寫死在我們程式內。此變數的有效範圍是從它宣告開始一直到當前**作用域**結束為止。範例 4-1 註解了 `s` 在哪裡是有效的。

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-01/src/main.rs:here}}
```

<span class="caption">範例 4-1：變數與它在作用域的有效範圍</span>

換句話說，這裡有兩個重要的時間點：

* 當 `s` **進入**作用域時，它是有效的。
* 它持續被視為有效直到它**離開**作用域為止。

目前為止，變數何時有效與作用域的關係都還跟其他程式語言相似。現在我們要以此基礎來介紹 `String` 型別

### `String` 型別

要能夠解釋所有權規則，我們需要使用比第三章的[「資料型別」][data-types]<!-- ignore -->介紹過的還複雜的型別才行。之前我們提到的型別都是已知固定大小且儲存在堆疊上的，在作用域結束時就會從堆疊中彈出。而且如果其它部分的程式碼需要在不同作用域使用相同數值的話，它們都能迅速簡單地透過複製產生新的單獨實例。但是我們想要觀察的是儲存在堆積上的資料，並研究 Rust 是如何知道要清理資料的。而 `String` 型別正是個絕佳範例。

我們專注在 `String` 與所有權有關的部分。這些部分也適用於其他基本函式庫或你自己定義的複雜資料型別。我們會在[第八章][ch8]<!-- ignore -->更深入探討 `String`。

我們已經看過字串字面值（string literals），字串的數值是寫死在我們的程式內的。字串字面值的確很方便，但它不可能完全適用於我們使用文字時的所有狀況。其中一個原因是因為它是不可變的，另一個原因是並非所有字串值在我們編寫程式時就會知道。舉例來說，要是我們想要收集使用者的輸入並儲存它呢？對於這些情形，Rust 提供第二種字串型別 `String`。此型別管理配置在堆積上的資料，所以可以儲存我們在編譯期間未知的一些文字。你可以從字串字面值使用 `from` 函式來建立一個 `String`，如以下所示：

```rust
let s = String::from("hello");
```

雙冒號 `::` 讓我們可以將 `from` 函式置於 `String` 型別的命名空間（namespace）底下，而不是取像是 `string_from` 這樣的名稱。我們將會在第五章的[「方法語法」][method-syntax]<!-- ignore -->討論這個語法，並在第七章的[「參考模組項目的路徑」][paths-module-tree]<!-- ignore -->討論模組（modules）與命名空間。

這種類型的字串是**可以**被改變的：

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/no-listing-01-can-mutate-string/src/main.rs:here}}
```

所以這邊有何差別呢？為何 `String` 是可變的，但字面值卻不行？兩者最主要的差別在於它們對待記憶體的方式。

### 記憶體與配置

以字串字面值來說，我們在編譯時就知道它的內容，所以可以寫死在最終執行檔內。這就是為何字串字面值非常迅速且高效。但這些特性均來自於字串字面值的不可變性。不幸的是我們無法將編譯時未知大小的文字，或是執行程式時大小可能會改變的文字等對應記憶體塞進執行檔中。

而對於 `String` 型別來說，為了要能夠支援可變性、改變文字長度大小，我們需要在堆積上配置一塊編譯時未知大小的記憶體來儲存這樣的內容，這代表：

* 記憶體配置器必須在執行時請求記憶體。
* 我們不再需要這個 `String` 時，我們需要以某種方法將此記憶體還給配置器。

當我們呼叫 `String::from` 時就等於完成第一個部分，它的實作會請求配置一塊它需要的記憶體。這邊大概和其他程式語言都一樣。

不過第二部分就不同了。在擁有**垃圾回收機制**（garbage collector, GC）的語言中，GC 會追蹤並清理不再使用的記憶體，所以我們不用去擔心這件事。沒有 GC 的話，識別哪些記憶體不再使用並明確的呼叫程式碼釋放它們就是我們的責任了，就像我們請求取得它一樣。在以往的歷史我們可以看到要完成這件事是一項艱鉅的任務，如果我們忘了，那麼就等於在浪費記憶體。如果我們釋放的太早的話，我們則有可能會拿到無效的變數。要是我們釋放了兩次，那也會造成程式錯誤。我們必須準確無誤地配對一個 `allocate` 給剛好一個 `free`。

Rust 選擇了一條不同的道路：當記憶體在擁有它的變數離開作用域時就會自動釋放。以下是我們解釋作用域的範例 4-1，但使用的是 `String` 而不是原本的字串字面值：

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/no-listing-02-string-scope/src/main.rs:here}}
```

當 `s` 離開作用域時，我們就可以很自然地將 `String` 所需要的記憶體釋放回配置器。當變數離開作用域時，Rust 會幫我們呼叫一個特殊函式。此函式叫做 [`drop`][drop]<!-- ignore -->，在這裡當時 `String` 的作者就可以寫入釋放記憶體的程式碼。Rust 會在大括號結束時自動呼叫 `drop`。

> 注意：在 C++，這樣在項目生命週期結束時釋放資源的模式，有時被稱為**資源取得即初始化（Resource Acquisition Is Initialization, RAII）**。如果你已經用過 RAII 的模式，那麼你應該就會很熟悉 Rust 的 `drop` 函式。

這樣的模式對於 Rust 程式碼的編寫有很深遠的影響。雖然現在這樣看起來很簡單，但在更多複雜的情況下程式碼的行為可能會變得很難預測。像是當我們需要許多變數，所以得在堆積上配置它們的情況。現在就讓我們開始來探討這些情形。

#### 變數與資料互動的方式：移動（Move）

數個變數在 Rust 中可以有許多不同方式來與相同資料進行互動。讓我們看看使用整數的範例 4-2。

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-02/src/main.rs:here}}
```

<span class="caption">範例 4-2：將變數 `x` 的數值賦值給 `y`</span>

我們大概可以猜到這做了啥：「`x` 取得數值 `5`，然後拷貝（copy）了一份 `x` 的值給 `y`。」所以我們有兩個變數 `x` 與 `y`，而且都等於 `5`。這的確是我們所想的這樣，因為整數是已知且固定大小的簡單數值，所以這兩個數值 `5` 都會推入堆疊中。

現在讓我們看看 `String` 的版本：

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/no-listing-03-string-move/src/main.rs:here}}
```

這和之前的程式碼非常相近，所以我們可能會認為它做的事也是一樣的：也就是第二行也會拿到一份 `s1` 拷貝的值給 `s2`。但事實上卻不是這樣。

請看看圖示 4-1 來瞭解 `String` 底下的架構到底長什麼樣子。一個 `String` 由三個部分組成，如圖中左側所示：一個指向儲存字串內容記憶體的指標、它的長度和它的容量。這些資料是儲存在堆疊上的，但圖右的內容則是儲存在堆積上。

<img alt="Two tables: the first table contains the representation of s1 on the
stack, consisting of its length (5), capacity (5), and a pointer to the first
value in the second table. The second table contains the representation of the
string data on the heap, byte by byte." src="img/trpl04-01.svg" class="center"
style="width: 50%;" />

<span class="caption">圖示 4-1：將數值 `"hello"` 賦值給 `s1` 的 `String` 記憶體結構</span>

長度指的是目前所使用的 `String` 內容在記憶體以位元組為單位所佔用的大小。而容量則是 `String` 從配置器以位元組為單位取得的總記憶體量。長度和容量的確是有差別的，但現在對我們來說還不太重要，你現在可以先忽略容量的問題。

當我們將 `s1` 賦值給 `s2`，`String` 的資料會被拷貝，不過我們拷貝的是堆疊上的指標、長度和容量。我們不會拷貝指標指向的堆積資料。資料以記憶體結構表示的方式會如圖示 4-2 表示。

<img alt="Three tables: tables s1 and s2 representing those strings on the
stack, respectively, and both pointing to the same string data on the heap."
src="img/trpl04-02.svg" class="center" style="width: 50%;" />

<span class="caption">圖示 4-2：`s2` 擁有一份 `s1` 的指標、長度和容量的記憶體結構</span>

所以實際上的結構**不會**長的像圖示 4-3 這樣，如果 Rust 也會拷貝堆積資料的話，才會看起來像這樣。如果 Rust 這麼做的話，`s2 = s1` 的動作花費會變得非常昂貴。當堆積上的資料非常龐大時，對執行時的性能影響是非常顯著的。

<img alt="Four tables: two tables representing the stack data for s1 and s2,
and each points to its own copy of string data on the heap."
src="img/trpl04-03.svg" class="center" style="width: 50%;" />

<span class="caption">圖示 4-3：如果 Rust 也會拷貝堆積資料，`s2 = s1` 可能會長得樣子</span>

稍早我們提到當變數離開作用域時，Rust 會自動呼叫 `drop` 函式並清理該變數在堆積上的資料。但圖示 4-2 顯示兩個資料指標都指向相同位置，這會造成一個問題。當 `s2` 與 `s1` 都離開作用域時，它們都會嘗試釋放相同的記憶體。這被稱呼為**雙重釋放**（double free）錯誤，也是我們之前提過的錯誤之一。釋放記憶體兩次可能會導致記憶體損壞，進而造成安全漏洞。

為了保障記憶體安全，在此情況中 Rust 還會再做一件重要的事。在 `let s2 = s1;` 之後，Rust 就不再將 `s1` 視爲有效。因此當 `s1` 離開作用域時，Rust 不需要釋放任何東西。請看看如果在 `s2` 建立之後繼續使用 `s1` 會發生什麼事，以下程式就執行不了：

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch04-understanding-ownership/no-listing-04-cant-use-after-move/src/main.rs:here}}
```

你會得到像這樣的錯誤，因為 Rust 會防止你使用無效的參考：

```console
{{#include ../listings/ch04-understanding-ownership/no-listing-04-cant-use-after-move/output.txt}}
```

如果你在其他語言聽過**淺拷貝（shallow copy）**和**深拷貝（deep copy）**這樣的詞，拷貝指標、長度和容量而沒有拷貝實際內容這樣的概念應該就相近於淺拷貝。但因為 Rust 同時又無效化第一個變數，我們不會叫此為淺拷貝，而是稱此動作為**移動（move）**。在此範例我們會稱 `s1` **被移動**到 `s2`，所以實際上發生的事長得像圖示 4-4 這樣。

<img alt="Three tables: tables s1 and s2 representing those strings on the
stack, respectively, and both pointing to the same string data on the heap.
Table s1 is grayed out be-cause s1 is no longer valid; only s2 can be used to
access the heap data." src="img/trpl04-04.svg" class="center" style="width:
50%;" />

<span class="caption">圖示 4-4：`s1` 無效後的記憶體結構</span>

這樣就解決了問題！只有 `s2` 有效的話，當它離開作用域，就只有它會釋放記憶體，我們就完成所有動作了。

除此之外，這邊還表達了另一個設計決策：Rust 永遠不會自動將你的資料建立「深拷貝」。因此任何**自動**的拷貝動作都可以被視為是對執行效能影響很小的。

#### 變數與資料互動的方式：克隆（Clone）

要是我們**真的想**深拷貝 `String` 在堆積上的資料而非僅是堆疊資料的話，我們可以使用一個常見的方法（method）叫做 `clone`。我們會在第五章講解方法語法，不過既然方法是很常見的程式語言功能，你很可能已經有些概念了。

以下是 `clone` 方法運作的範例：

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/no-listing-05-clone/src/main.rs:here}}
```

此程式碼能執行無誤，並明確作出了像圖示 4-3 這樣的行為，也就是堆積資料**的確**被複製了一份。

當你看到 `clone` 的呼叫，你就會知道有一些特定的程式碼被執行且消費可能是相對昂貴的。你可以很清楚地知道有些不同的行為正在發生。

#### 只在堆疊上的資料：拷貝（Copy）

還有一個小細節我們還沒提到，也就是我們在使用整數時的程式碼。回想一下範例 4-2 是這樣寫的，它能執行而且是有效的：

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/no-listing-06-copy/src/main.rs:here}}
```

但這段程式碼似乎和我們剛學的互相矛盾：我們沒有呼叫 `clone`，但 `x` 卻仍是有效的，沒有移動到 `y`。

原因是因為像整數這樣的型別在編譯時是已知大小，所以只會存在在堆疊上。所以要拷貝一份實際數值的話是很快的。這也讓我們沒有任何理由要讓 `x` 在 `y` 建立後被無效化。換句話說，這邊沒有所謂淺拷貝與深拷貝的差別。所以這邊呼叫 `clone` 的話不會與平常的淺拷貝有啥不一樣，我們可以保持這樣就好。

Rust 有個特別的標記叫做 `Copy` 特徵（trait）可以用在標記像整數這樣存在堆疊上的型別（我們會在[第十章][traits]<!-- ignore -->討論什麼是特徵）。如果一個型別有 `Copy` 特徵的話，一個變數在賦值給其他變數後仍然會是有效的。

如果一個型別有實作（implement）`Drop` 特徵的話，Rust 不會允許我們讓此型別擁有 `Copy` 特徵。如果我們對某個型別在數值離開作用域時，需要再做特別處理的話，我們對此型別標註 `Copy` 特徵會在編譯時期產生錯誤。想要瞭解如何為你的型別實作 `Copy` 特徵的話，請參考附錄 C [「可推導的特徵」][derivable-traits]<!-- ignore -->。

所以哪些型別有實作 `Copy` 特徵呢？你可以閱讀技術文件來知道哪些型別有，但基本原則是任何簡單地純量數值都可以實作 `Copy`，且不需要配置記憶體或任何形式資源的型別也有實作 `Copy`。以下是一些有實作 `Copy` 的型別：

* 所有整數型別像是 `u32`。
* 布林型別 `bool`，它只有數值 `true` 與 `false`。
* 所有浮點數型別像是 `f64`。
* 字元型別 `char`。
* 元組，不過包含的型別也都要有實作 `Copy` 才行。比如 `(i32, i32)` 就有實作 `Copy`，但 `(i32, String)` 則無。

### 所有權與函式

傳遞數值給函式的方式和賦值給變數是類似的。傳遞變數給函式會是移動或拷貝，就像賦值一樣。範例 4-3 說明了變數如何進入且離開作用域。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-03/src/main.rs}}
```

<span class="caption">範例 4-3：具有所有權的函式</span>

如果我們嘗試在呼叫 `takes_ownership` 後使用 `s`，Rust 會拋出編譯時期錯誤。這樣的靜態檢查可以免於我們犯錯。你可以試試看在 `main` 裡哪裡可以使用 `s` 和 `x`，以及所有權規則如何防止你寫錯。

### 回傳值與作用域

回傳值一樣能轉移所有權，範例 4-4 和範例 4-3 一樣加上了註解說明一個函式如何回傳些數值。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-04/src/main.rs}}
```

<span class="caption">範例 4-4：轉移回傳值的所有權</span>

變數的所有權每次都會遵從相同的模式：賦值給其他變數就會移動。當擁有堆積資料的變數離開作用域時，該數值就會被 `drop` 清除，除非該資料的所有權被移動到其他變數所擁有。

雖然這樣是正確的，但在每個函式取得所有權再回傳所有權的確有點囉唆。要是我們可以讓函式使用一個數值卻不取得所有權呢？要是我們想重複使用同個值，但每次都要傳入再傳出實在是很麻煩。而且我們有時也會想要讓函式回傳一些它們自己產生的值。

Rust 能讓我們使用元組回傳多個數值，如範例 4-5 所示。

<span class="filename">檔案名稱：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch04-understanding-ownership/listing-04-05/src/main.rs}}
```

<span class="caption">範例 4-5：回傳參數的所有權</span>

但這實在太繁瑣，而且這樣的情況是很常見的。幸運的是 Rust 有提供一個概念能在不轉移所有權的狀況下使用數值，這叫做**參考（references）**。

[data-types]: ch03-02-data-types.html#data-types
[ch8]: ch08-02-strings.html
[traits]: ch10-02-traits.html
[derivable-traits]: appendix-03-derivable-traits.html
[method-syntax]: ch05-03-method-syntax.html#method-syntax
[paths-module-tree]: ch07-03-paths-for-referring-to-an-item-in-the-module-tree.html
[drop]: https://doc.rust-lang.org/std/ops/trait.Drop.html#tymethod.drop
