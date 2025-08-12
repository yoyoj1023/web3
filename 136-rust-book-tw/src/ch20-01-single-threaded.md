## 建立單一執行緒的網頁伺服器

我們會先從建立一個可運作的單一執行緒網頁伺服器作為起始。在我們開始之前，讓我們快速瞭解一下建構網頁伺服器會涉及到的協定。這些協定的細節超出本書的範疇，不過以下簡短的概覽可以提供你所需要知道的訊息。

網頁伺服器會涉及到的兩大協定為**超文本傳輸協定（Hypertext Transfer Protocol，HTTP）**與**傳輸控制協定（Transmission Control Protocol，TCP）**。這兩種協定都是**請求-回應（request-response）**協定，這意味著**客戶端**會初始一個請求，然後**伺服器**接聽請求並提供回應給客戶端。協定會定義這些請求與回應的內容。

TCP 是個較底層的協定並描述資訊如何從一個伺服器傳送到另一個伺服器的細節，但是它並不指定資訊內容為何。HTTP 建立在 TCP 之上並定義請求與回應的內容。技術上來說，HTTP 是可以與其他協定組合的，但是對大多數場合中，HTTP 主要還是透過 TCP 來傳送資訊。我們會處理 TCP 與 HTTP 中請求與回應的原始位元組（raw bytes）。

### 監聽 TCP 連線

我們的網頁伺服器需要監聽一個 TCP 連線，所以這就是我們要處理的第一個步驟。標準函式庫有提供 `std::net` 模組能讓我們使用。讓我們如往常一樣建立一個新的專案：

```console
$ cargo new hello
     Created binary (application) `hello` project
$ cd hello
```

現在輸入範例 20-1 的程式碼到 *src/main.rs*。此程式碼會監聽 `127.0.0.1:7878` 本地位址（address）傳來的 TCP 流（Stream）。當其收到傳入的資料流時，它就會印出 `連線建立！`。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,no_run
{{#rustdoc_include ../listings/ch20-web-server/listing-20-01/src/main.rs}}
```

<span class="caption">範例 20-1：監聽傳入的流並在收到流時顯示訊息</span>

透過 `TcpListener`，我們可以監聽 `127.0.0.1:7878` 位址上的 TCP 連線。在位址中，分號之前指的是代表你電腦自己的 IP 位址（每部電腦都一樣，這並不只是用於本書作者電腦的例子），然後 `7878` 是通訊埠（port）。我們選擇此通訊埠的原因有兩個：HTTP 通常不會佔用此通訊埠，所以我們的伺服器不太可能會與你機器上執行的其他網路伺服器衝突，而且在傳統電話的九宮格上輸入 7878 的話就是「rust」。

在此情境中的 `bind` 函式與常見的 `new` 函式行為類似，這會回傳一個新的 `TcpListener` 實例。此函式會叫做 `bind` 的原因是因為在網際網路中，連接一個通訊埠並監聽就稱為「綁定（bind）通訊埠」。

`bind` 函式會回傳 `Result<T, E>`，也就是說綁定可能會失敗。舉例來說，連接通訊埠 80 需要管理員權限（非管理員使用者可以連接 1023 以上的通訊埠），所以如果我們不是管理員卻嘗試連接通訊埠 80 的話，綁定就不會成功。另一個例子是，如果執行同個程式碼兩次產生兩個實例，造成這兩個程式同時監聽同個通訊埠的話，綁定也不會成功。由於我們只會寫個用於學習目的的基本伺服器，我們不太需要擔心如何處理這些種類的錯誤。所以我如果遇到錯誤的話，我們採用 `unwrap` 來停止程式。

`TcpListener` 的 `incoming` 方法會回傳一個疊代器，給予我們一連串的流（更準確的來說是 `TcpStream` 型別的流）。一個**流**（Stream）代表的是客戶端與伺服器之間的開啟的連線。而**連線**（connection）指的是整個請求與回應的過程，這之中客戶端會連線至伺服器、伺服器會產生回應，然後伺服器會關閉連線。這樣一來，我們就能讀取 `TcpStream` 來查看客戶端傳送了什麼，然後將我們的回應寫入流中，將資料傳回給客戶端。整體來說，此 `for` 迴圈會依序遍歷每個連線，然後產生一系列的流讓我們能夠加以處理。

目前我們處理流的方式包含呼叫 `unwrap`，這當流有任何錯誤時，就會結束我們的程式。如果沒有任何錯誤的話，程式就會顯示訊息。我們會在下個範例在成功的情況下加入更多功能。當客戶端連接伺服器時，我們可能會從 `incoming` 方法取得錯誤的原因是因為我們實際上不是在遍歷每個連線。反之，我們是在遍歷**連線嘗試**。連線不成功可能有很多原因，而其中許多都與作業系統有關。舉例來說，許多作業系統都會限制它們能支援的同時連線開啟次數，當新的連線超出此範圍時就會產生錯誤，直到有些連線被關閉為止。

讓我們跑跑看此程式碼吧！在終端機呼叫 `cargo run` 然後在網頁瀏覽器載入 *127.0.0.1:7878*。瀏覽器應該會顯示一個像是「Connection reset」之類的錯誤訊息，因為伺服器目前還不會回傳任何資料。但是當你觀察終端機，在瀏覽器連接伺服器時，你應該會看到一些訊息顯示出來！

```text
     Running `target/debug/hello`
連線建立！
連線建立！
連線建立！
```

有時候你可能從一次瀏覽器請求看到數個訊息顯示出來，原因很可能是因為瀏覽器除了請求頁面內容以外，也嘗試請求其他資源，像是出現在瀏覽器分頁上的 *favicon.ico* 圖示。

而瀏覽器嘗試多次連線至伺服器的原因還有可能是因為伺服器沒有回傳任何資料。當 `stream` 離開作用域並在迴圈結尾被釋放時，連線會在 `drop` 的實作中被關閉。瀏覽器有時處理被關閉的連線的方式是在重試幾次，因為發生的問題可能是暫時的。不管如何，現在最重要的是我們成功取得 TCP 的連線了！

當你執行完特定版本的程式碼後，記得按下 <span class="keystroke">ctrl-c</span> 來停止程式。然後在你變更一些程式碼後重新呼叫 `cargo run` 來確保你有執行到最新的程式碼。

### 讀取請求

讓我們來實作讀取瀏覽器請求的功能吧！為了能分開取得連線的方式與處理連線的方式，我們會建立另一個新的函式來處理連線。在此 `handle_connection` 新的函式中，我們會讀取從 TCP 流取得的資料並顯示出來，讓我們可以觀察瀏覽器傳送的資料。請修改程式碼成範例 20-2。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,no_run
{{#rustdoc_include ../listings/ch20-web-server/listing-20-02/src/main.rs}}
```

<span class="caption">範例 20-2：讀取 `TcpStream` 並顯示資料</span>

我們將 `std::io::prelude` 和 `std::io::BufReader` 引入作用域來取得特定的特徵，讓我們可以讀取並寫入流之中。在 `main` 函式的 `for` 迴圈中，不同於印出說我們取得連線的訊息，我們現在會呼叫新的 `handle_connection` 函式並將 `stream` 傳入。

在 `handle_connection` 函式中，我們建立 `BufReader` 的實例並取得 `stream` 的可變參考。`BufReader` 提供了緩衝區（buffering），幫助我們管理 `std::io::Read` 方法的呼叫。

我們建立了一個變數 `http_request` 來收集瀏覽器傳送到伺服器的每行請求。我們加上 `Vec<_>` 型別詮釋來指示我們想要將每行收集成向量。

`BufReader` 實作的 `std::io::BufRead` 特徵有提供個 `lines` 方法。該方法會回傳個 `Result<String, std::io::Error>` 的疊代器，這會在每次看到換行（newline）位元組時，將資料流分開。我們用 `map ` 對每個 `Result` 呼叫 `unwrap` 來取得 `String`。如果資料不是有效的 UTF-8 或是讀取流時發生問題的話，`Result` 可能會產生錯誤。在正式環境的程式應該要適當地處理這些錯誤，但為了簡潔我們在這裡選擇直接在遇到錯誤時就終止程式。

瀏覽器會傳送兩次換行字元來表達 HTTP 的請求結束了，所以要確定我們從流中取得一個請求的話，我們就重複取得行數直到有一行是空字串為止。一旦我們將行數收集到向量中，我們就使用好看的除錯格式印出來，讓我們可以觀察瀏覽器傳送了哪些指令給我們的伺服器。

讓我們嘗試看看此程式碼！開啟程式並再次從網頁瀏覽器發送請求。注意到我們仍然會在瀏覽器中取得錯誤頁面，但是我們程式在終端機的輸出應該會類似以下結果：

```console
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.42s
     Running `target/debug/hello`
Request: [
    "GET / HTTP/1.1",
    "Host: 127.0.0.1:7878",
    "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0",
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language: en-US,en;q=0.5",
    "Accept-Encoding: gzip, deflate, br",
    "DNT: 1",
    "Connection: keep-alive",
    "Upgrade-Insecure-Requests: 1",
    "Sec-Fetch-Dest: document",
    "Sec-Fetch-Mode: navigate",
    "Sec-Fetch-Site: none",
    "Sec-Fetch-User: ?1",
    "Cache-Control: max-age=0",
]
```

依據你的瀏覽器，你可能會看到一些不同的輸出結果。現在我們顯示了請求的資料，我們可以觀察為何瀏覽器會產生多次請求，我們可以看看 `Request: GET` 之後的路徑。如果重複的連線都在請求 `/` 的話，我們就能知道瀏覽器在重複嘗試取得 `/`，因為它沒有從我們的程式取得回應。

讓我們拆開此請求資料來理解瀏覽器在向我們的程式請求什麼。

### 仔細觀察 HTTP 請求

HTTP 是基於文字的協定，而請求格式如下：

```text
Method Request-URI HTTP-Version CRLF
headers CRLF
message-body
```

第一行是**請求行（request line）**並持有客戶端想請求什麼的資訊。請求行的第一個部分代表著想使用的**方法（method）**，像是 `GET` 或 `POST`，這描述了客戶端如何產生此請求。在此例中，我們的客戶端使用的是 `GET` 請求。

請求行的下一個部分是 `/`，這代表客戶端請求的**統一資源標誌符（Uniform Resource Identifier，URI）**，URI 絕大多數（但不是絕對）就等於**統一資源定位符（Uniform Resource Locator，URL）**。URI 與 URL 的差別對於本章節的學習目的來說並不重要，但是 HTTP 規格使用的術語是 URI，所以我們這裡將 URL 替換為 URI。

最後一個部分是客戶端使用的 HTTP 版本，然後請求行最後以 **CRLF 序列**做結尾，CRLF 指的是**輸入（carriage return）與換行（line feed）**，這是打字機時代的術語！CRLF 序列也可以寫成 `\r\n`，`\r` 指的是輸入，而 `\n` 指的是換行。CRLF 序列將請求行與剩餘的請求資料區隔開來。注意到當 CRLF 印出時，我們會看到的是新的一行而不是 `\r\n`。

觀察我們目前從程式中取得的請求行資料，我們看到它使用 `GET` 方法，`/`  為請求 URI，然後版本為 `HTTP/1.1`。

在請求行之後，剩餘從 `Host:` 開始的行數都是標頭（header）。`GET` 請求不會有本體（body）。

你可以嘗試看看從不同的瀏覽器或尋問不同的位址，像是 *127.0.0.1:7878/test*，來看看請求資料有什麼改變。

現在我們知道瀏覽器在請求什麼了，讓我們回傳一些資料吧！

### 寫入回應

現在我們要實作傳送資料來回應客戶端的請求。回應格式如下：

```text
HTTP-Version Status-Code Reason-Phrase CRLF
headers CRLF
message-body
```

第一行為**狀態行（status line）**，這包含回應使用的 HTTP 版本、用來總結請求結果的狀態碼，以及狀態碼的文字來描述原因。在 CRLF 序列後，會接著任何標頭、另一個 CRLF 序列，然後是回應的本體。

以下是個使用 HTTP 版本 1.1 的回應範例，其狀態碼為 200、文字描述為 OK，沒有標頭與本體：

```text
HTTP/1.1 200 OK\r\n\r\n
```

狀態碼 200 是標準的成功回應。這段文字就是小小的 HTTP 成功回應。讓我們將此寫入流中作為我們對成功請求的回應吧！在 `handle_connection` 函式中，移除原先印出請求資料的 `println!`，然後換成範例 20-3 的程式碼。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,no_run
{{#rustdoc_include ../listings/ch20-web-server/listing-20-03/src/main.rs:here}}
```

<span class="caption">範例 20-3：寫入一個小小的成功 HTTP 回應至流中</span>

新的第一行定義了變數 `response` 會持有成功訊息的資料。然後我們對我們的 `response` 呼叫 `as_bytes` 來將字串轉換成位元組。`stream` 中的 `write_all` 方法接收 `&[u8]` 然後將這些位元組直接傳到連線中。由於 `write_all` 操作可能會失敗，我們如前面一樣對任何錯誤使用 `unwrap`。同樣地，在實際的應用程式中你應該要在此加上錯誤處理。

有了這些改變，讓我們執行程式碼然後下達請求。我們不再顯示任何資料到終端機上了，所以我們不會看到任何輸出，只會有 Cargo 執行的訊息。當你在網頁瀏覽器讀取 *127.0.0.1:7878* 時，你應該會得到一個空白頁面，而不是錯誤了。你剛剛手寫了一個 HTTP 請求與回應！

### 回傳真正的 HTML

讓我們實作不止是回傳空白頁面的功能。首先在專案根目錄建立一個檔案 *hello.html*，而不是在 *src* 目錄內。你可以輸入任何你想要的 HTML，範例 20-4 示範了其中一種可能的範本。

<span class="filename">檔案名稱：hello.html</span>

```html
{{#include ../listings/ch20-web-server/listing-20-05/hello.html}}
```

<span class="caption">範例 20-4：用於回應的 HTML 檔案範本</span>

這是最小化的 HTML 文件，其附有一個標頭與一些文字。為了要在收到請求後從伺服器回傳此檔案，我們要修改範例 20-5 的 `handle_connection` 來讀取 HTML 檔案、加進回應本體中然後傳送出去。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,no_run
{{#rustdoc_include ../listings/ch20-web-server/listing-20-05/src/main.rs:here}}
```

<span class="caption">範例 20-5：將 *hello.html* 內容作為回應本體傳送出去</span>

我們在 `use` 新增了 `fs` 來將標準函式庫中的檔案系統模組引入作用域。讀取檔案內容至字串的程式碼看起來會很熟悉，因為這在第十二章範例 12-4 當我們想在 I/O 專案中讀取檔案內容時就用過了。

接下來，我們使用 `format!` 來加入檔案內容來作為成功回應的本體。為了確保這是有效的 HTTP 回應，我們加上 `Content-Length` 標頭並設置為回應本體的大小，在此例中就是 `hello.html` 的大小。

透過 `cargo run` 執行此程式碼並在你的瀏覽器讀取 *127.0.0.1:7878*，你應該就會看到 HTML 的顯示結果了！

目前我們忽略了 `http_request` 中的請求資料，並毫無條件地回傳 HTML 檔案內容。這意味著如果你嘗試在瀏覽器中請求 *127.0.0.1:7878/something-else*，你還是會得到相同的 HTML 回應。這樣我們的伺服器是很受限的，而且這也不是大多數網頁伺服器會做的行為。我們想要依據請求自訂我們的回應，並只對格式良好的 `/` 請求回傳 HTML 檔案。

### 驗證請求並選擇性地回應

目前我們的網頁伺服器不管客戶端的請求為何，都會回傳 HTML 檔案。讓我們加個功能來在回傳 HTML 檔案前檢查瀏覽器請求是否為 `/`，如果瀏覽器請求的是其他的話就回傳錯誤。為此我們得修改 `handle_connection` 成像是範例 20-6 這樣。此新的程式碼會檢查收到的請求，比較是否符合 `/` 的前半部分，並增加了 `if` 與 `else` 區塊來處理不同請求。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,no_run
{{#rustdoc_include ../listings/ch20-web-server/listing-20-06/src/main.rs:here}}
```

<span class="caption">範例 20-6：分開處理 `/` 與其他請求</span>

我們只會查看 HTTP 請求的第一行，所以與其讀取整個請求到向量中，我們不如呼叫 `next` 來取得疊代器的第一個項目就好。第一個 `unwrap` 會處理 `Option`，如果疊代器沒有任何項目的話程式就會停止。第二個 `unwrap` 處理的則是 `Result`，它和範例 20-2 `map` 裡的 `unwrap` 有相同的效果。

接著，我們檢查 `request_line` 是否等同於以 */* 路徑形式寫成的 GET 請求。如果是的話，那麼 `if` 區塊就回傳 HTML 檔案的內容。

如果 `request_line` **並沒有** 符合在 */* 路徑形式下的 GET 請求的話，代表我們收到的是其他請求。我們稍後會在 `else` 區塊加上回應其他所有請求的程式碼。

執行此程式碼並請求 *127.0.0.1:7878* 的話，你應該會收到 *hello.html* 的 HTML。如果你下達其他任何請求，像是 *127.0.0.1:7878/something-else* 的話，你會和執行範例 20-1 與 20-2 的程式碼時獲得一樣的錯誤。

現在讓我們將範例 20-7 的程式碼加入 `else` 區塊來回傳狀態碼為 404 的回應，這代表請求的內容無法找到。我們也會回傳一個 HTML 頁面讓瀏覽器能顯示並作為終端使用者的回應。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,no_run
{{#rustdoc_include ../listings/ch20-web-server/listing-20-07/src/main.rs:here}}
```

<span class="caption">範例 20-7：如果不是 `/` 的請求就回應狀態碼 404 與一個錯誤頁面</span>

我們在此的狀態行有狀態碼 404 與原因描述 `NOT FOUND`。回應的本體會是 *404.html* 檔案內的 HTML。你會需要在 *hello.html* 旁建立一個 *404.html* 檔案來作為錯誤頁面。同樣地，你可以使用任何你想使用的 HTML 或者使用範例 20-8 的 HTML 範本。

<span class="filename">檔案名稱：404.html</span>

```html
{{#include ../listings/ch20-web-server/listing-20-07/404.html}}
```

<span class="caption">範例 20-8：回傳任何 404 回應的頁面內容範本</span>

有了這些改變後，再次執行你的伺服器。請求 *127.0.0.1:7878* 的話就應該會回傳 *hello.html* 的內容，而任何其他請求，像是 *127.0.0.1:7878/foo* 就應該回傳 *404.html* 的錯誤頁面。

### 再做一些重構

目前 `if` 與 `else` 區塊有很多重複的地方，它們都會讀取檔案並將檔案內容寫入流中。唯一不同的地方在於狀態行與檔案名稱。讓我們將程式碼變得更簡潔，將不同之處分配給 `if` 與 `else`，它們會分別將相對應的狀態行與檔案名稱賦值給變數。我們就能使用這些變數無條件地讀取檔案並寫入回應。範例 20-9 顯示了替換大段 `if` 與 `else` 區塊後的程式碼。

<span class="filename">檔案名稱：src/main.rs</span>

```rust,no_run
{{#rustdoc_include ../listings/ch20-web-server/listing-20-09/src/main.rs:here}}
```

<span class="caption">範例 20-9：重構 `if` 與 `else` 區塊來只包含兩個條件彼此不同的地方</span>

現在 `if` 與 `else` 區塊只回傳狀態行與檔案名稱的數值至一個元組，我們可以在 `let` 陳述式使用模式來解構並將分別兩個數值賦值給 `status_line` 與 `filename`，如第十八章所提及的。

之前重複的程式碼現在位於 `if` 與 `else` 區塊之外並使用變數 `status_line` 與 `filename`。這讓我們更容易觀察兩種條件不同的地方，且也意味著如果我們想要變更讀取檔案與寫入回應的行為的話，我們只需要更新其中一段程式碼就好。範例 20-9 與範例 20-8 的程式碼行為一模一樣。

太棒了！我們現在有個用約莫 40 行 Rust 程式碼寫出的簡單網頁瀏覽器，可以對一種請求回應內容頁面，然後對其他所有請求回應 404 錯誤。

目前我們的伺服器只跑在單一執行緒，這意味著它一次只能處理一個請求。讓我們模擬些緩慢的請求來探討這為何會成為問題。然後我們會加以修正讓我們伺服器可以同時處理數個請求。
