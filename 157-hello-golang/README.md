這份教學將帶您從零開始，一步步完成 Go 語言 (Golang) 的環境建置、下載，並成功運行您的第一個 "Hello, World!" 程式。

### 第一步：環境建置與下載 Go

首先，您需要從 Go 的官方網站下載並安裝對應您作業系統的安裝包。

1.  **前往下載頁面**：
    *   開啟 Go 語言的官方網站下載頁面：[https://go.dev/dl/](https://go.dev/dl/)
    *   如果官方頁面無法訪問，您也可以使用鏡像站點：[https://golang.google.cn/dl/](https://golang.google.cn/dl/)

2.  **根據您的作業系統選擇並安裝**：

    *   **Windows**:
        *   下載 `.msi` 結尾的安裝程式。
        *   雙擊下載的檔案，然後依照提示完成安裝。 安裝程式會預設將 Go 安裝到 `C:\Program Files\Go` 或相似目錄，並自動設定好環境變數。

    *   **macOS**:
        *   下載 `.pkg` 結尾的安裝包檔案。
        *   開啟下載的檔案，依照提示完成安裝。 Go 將會被安裝到 `/usr/local/go`。

    *   **Linux**:
        *   下載 `.tar.gz` 結尾的壓縮檔。
        *   將下載的壓縮檔解壓縮到 `/usr/local` 目錄。
        *   接著，您需要將 `/usr/local/go/bin` 加入到您的 `PATH` 環境變數中。這可以透過編輯您的 `~/.profile` 或 `~/.bashrc` 檔案來完成。

3.  **驗證安裝**：
    *   安裝完成後，打開您的終端機 (Terminal) 或命令提示字元 (Command Prompt)。
    *   輸入以下指令並按下 Enter：
        ```bash
        go version
        ```
    *   如果您看到類似 `go version go1.22.1 linux/amd64` 的版本資訊輸出，代表 Go 已經成功安裝。

### 第二步：編寫 "Hello, World!" 程式碼

現在您的環境已經準備就緒，可以開始編寫第一支 Go 程式了。

1.  **建立專案目錄**：
    *   在您喜歡的位置建立一個新的資料夾，例如 `hello`，並進入該資料夾。
    ```bash
    mkdir hello
    cd hello
    ```

2.  **建立 Go 原始檔**：
    *   使用任何文字編輯器（例如 VSCode, Sublime Text, 或記事本）建立一個名為 `hello.go` 的檔案。

3.  **輸入以下程式碼**：
    *   將下方的程式碼完整複製並貼到您的 `hello.go` 檔案中。
    ```go
    package main
    
    import "fmt"
    
    func main() {
        fmt.Println("Hello, World!")
    }
    ```

**程式碼解析**：
*   `package main`: 這一行宣告了這個檔案屬於 `main` 套件。在 Go 中，`main` 套件是一個特殊的套件，它表示這是一個可執行的程式，而不是一個函式庫。
*   `import "fmt"`: 這一行匯入了 `fmt` 套件，這是一個 Go 的標準函式庫，提供了格式化輸入輸出的功能，例如在螢幕上列印文字。
*   `func main()`: 這是程式的進入點。當您運行這個程式時，`main` 函式會被第一個執行。
*   `fmt.Println("Hello, World!")`: 這行程式碼使用了 `fmt` 套件中的 `Println` 函式，它會將引號中的文字 "Hello, World!" 列印到終端機上。

### 第三步：執行您的 Go 程式碼

Go 提供了兩種主要的方式來運行您的程式。

#### 方法一：使用 `go run` (直接編譯並執行)

這種方法會一步到位地編譯並執行您的程式碼，通常在開發和快速測試時使用，它不會在您的資料夾中留下可執行檔。

1.  **打開您的終端機**，並確認您位於 `hello.go` 檔案所在的目錄。
2.  **輸入以下指令**：
    ```bash
    go run hello.go
    ```
3.  **您將會看到以下輸出**：
    ```
    Hello, World!
    ```

#### 方法二：使用 `go build` (編譯成可執行檔)

這種方法會先將您的程式碼編譯成一個獨立的可執行二進位檔案，然後您可以直接運行這個檔案。 這是在部署應用程式時使用的方式。

1.  **在終端機中**，確認您位於 `hello.go` 檔案所在的目錄。
2.  **輸入以下指令來編譯程式**：
    ```bash
    go build hello.go
    ```
3.  執行完畢後，您會發現在同一個資料夾下多出了一個檔案。
    *   在 macOS 或 Linux 上，檔案名為 `hello`。
    *   在 Windows 上，檔案名為 `hello.exe`。

4.  **執行這個新產生的檔案**：
    *   在 macOS 或 Linux 上，輸入：
        ```bash
        ./hello
        ```
    *   在 Windows 上，輸入：
        ```bash
        hello.exe
        ```
5.  **同樣地，您將會看到以下輸出**：
    ```
    Hello, World!
    ```

恭喜！您已經成功搭建了 Go 的開發環境，並編寫且執行了您的第一個 Go 程式。