想在 C# 中運行經典的 "Hello, World!" 程式嗎？本指南將從頭開始，帶您逐步完成環境建置、下載安裝，直到成功執行您的第一個 C# 程式。您可以選擇使用整合開發環境 (IDE) 或純文字編輯器搭配命令列工具來完成。

### 方法一：使用 Visual Studio (適合初學者的整合式環境)

Visual Studio 是一個功能強大的整合開發環境 (IDE)，由微軟官方提供，它簡化了 C# 的開發、偵錯和執行流程。

**步驟一：環境建置與下載**

1.  **下載 Visual Studio**: 前往 [Visual Studio 官方網站](https://visualstudio.microsoft.com/vs/community/) 下載 Visual Studio Community 版本，這是一個功能齊全且免費的版本。
2.  **安裝 Visual Studio**: 執行下載的安裝程式。在安裝過程中，您會看到一個工作負載 (Workloads) 的選擇畫面。請務必勾選「.NET 桌面開發」(.NET desktop development) 這個選項，它會包含所有建立主控台應用程式所需的一切。
3.  **啟動 Visual Studio**: 安裝完成後，啟動 Visual Studio。

**步驟二：建立您的第一個專案**

1.  在 Visual Studio 的起始畫面，選擇「建立新專案」(Create a new project)。
2.  在專案範本中，選擇「主控台應用程式」(Console App)。請確保語言選擇為 C#。
3.  為您的專案命名 (例如："HelloWorld")，並選擇儲存位置，然後點擊「建立」(Create)。

**步驟三：編寫與執行程式碼**

1.  **檢視程式碼**: 專案建立後，Visual Studio 會自動生成一個名為 `Program.cs` 的檔案，其中已經包含了基本的 "Hello, World!" 程式碼。

    ```csharp
    using System;

    namespace HelloWorld
    {
        class Program
        {
            static void Main(string[] args)
            {
                Console.WriteLine("Hello, World!");
            }
        }
    }
    ```

    在較新版本的 .NET 中，程式碼可能被簡化為：

    ```csharp
    Console.WriteLine("Hello, World!");
    ```

2.  **執行程式**: 按下鍵盤上的 `F5` 鍵，或點擊工具列上的綠色「開始」按鈕來執行程式。

3.  **檢視結果**: 一個主控台視窗將會彈出，並顯示 "Hello, World!" 的訊息。

### 方法二：使用 .NET SDK 與 Visual Studio Code (更輕量級的跨平台選擇)

如果您偏好使用輕量級的程式碼編輯器和命令列工具，這是一個很好的選擇。

**步驟一：環境建置與下載**

1.  **下載 .NET SDK**: 前往 [.NET 官方下載頁面](https://dotnet.microsoft.com/download) 下載並安裝 .NET SDK (軟體開發套件)。 SDK 包含了編譯和執行 C# 程式所需的工具。
2.  **驗證安裝**: 開啟您的命令提示字元 (CMD) 或終端機 (Terminal)，輸入以下指令並按下 Enter。如果安裝成功，將會顯示已安裝的 .NET SDK 版本。

    ```bash
    dotnet --version
    ```
3.  **安裝 Visual Studio Code**: 前往 [Visual Studio Code 官方網站](https://code.visualstudio.com/) 下載並安裝。
4.  **安裝 C# 擴充功能**: 在 VS Code 中，點擊側邊欄的擴充功能圖示，搜尋並安裝由 Microsoft 發布的「C# Dev Kit」擴充功能，它將提供豐富的 C# 開發支援。

**步驟二：建立您的第一個專案**

1.  **建立專案資料夾**: 開啟命令提示字元或終端機，並使用 `cd` 指令切換到您想要儲存專案的目錄。
2.  **建立新專案**: 輸入以下指令來建立一個新的主控台應用程式專案。

    ```bash
    dotnet new console -o HelloWorld
    ```
    這個指令會建立一個名為 "HelloWorld" 的資料夾，並在其中生成專案檔案。

3.  **開啟專案**: 使用 VS Code 開啟剛剛建立的 "HelloWorld" 資料夾。

**步驟三：編寫與執行程式碼**

1.  **檢視程式碼**: 在 VS Code 的檔案總管中，打開 `Program.cs` 檔案。您會看到預設的 "Hello, World!" 程式碼。

    ```csharp
    Console.WriteLine("Hello, World!");
    ```
2.  **執行程式**: 在 VS Code 中，您可以開啟整合式終端機 (Terminal)。在終端機中，輸入以下指令來編譯並執行您的程式。

    ```bash
    dotnet run
    ```
3.  **檢視結果**: "Hello, World!" 的訊息將會直接顯示在您的終端機中。

透過以上任一種方法，您都可以成功地建立並執行您的第一個 C# "Hello, World!" 程式。Visual Studio 提供了整合度更高的開發體驗，而 .NET SDK 搭配 VS Code 則提供了更輕量和跨平台的彈性。