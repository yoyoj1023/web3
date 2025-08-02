# Python 虛擬環境 `venv` 使用指南

本文件將引導您如何使用 Python 內建的 `venv` 模組來建立和管理虛擬環境。

## 什麼是 Python 虛擬環境？

Python 虛擬環境是一個獨立的目錄樹，其中包含特定版本的 Python 解譯器以及一些額外的套件。它的主要目的是為特定的專案建立一個隔離的環境，讓專案可以擁有自己的依賴套件版本，而不會與系統中其他專案或其他 Python 環境的套件互相干擾。

## 為什麼要使用虛擬環境？

使用虛擬環境有許多好處：

*   **依賴管理**：不同的專案可能需要不同版本的套件。虛擬環境允許您為每個專案安裝特定版本的套件，避免版本衝突。
*   **環境隔離**：保持您的全域 Python 環境乾淨，避免安裝過多不必要的套件。
*   **可重現性**：您可以輕鬆地與他人分享專案的依賴套件列表 (`requirements.txt`)，確保其他人在設定專案時能有一致的環境。
*   **避免權限問題**：在虛擬環境中安裝套件通常不需要管理員權限。

## 如何使用 `venv`

`venv` 是 Python 3.3+ 版本內建的工具，用於建立輕量級的虛擬環境。

### 1. 建立虛擬環境

開啟您的終端機或命令提示字元，並切換到您專案的目錄。然後執行以下指令來建立一個名為 `venv`（或其他您喜歡的名稱）的虛擬環境：

```bash
python -m venv venv
```

這會在您的專案目錄下建立一個名為 `venv` 的資料夾，裡面包含了 Python 解譯器的副本以及相關檔案。

**提示：**
*   您可以將 `venv` 替換成任何您想要為虛擬環境取的名稱，例如 `.venv` 或 `my_env`。
*   建議將虛擬環境資料夾的名稱（例如 `venv/`）加入到您的 `.gitignore` 檔案中，以避免將其提交到版本控制系統。

### 2. 啟動虛擬環境

建立虛擬環境後，您需要啟動它才能開始使用。啟動指令會因您的作業系統而異：

*   **Windows (cmd.exe):**

    ```batch
    venv\Scripts\activate.bat
    ```

*   **Windows (PowerShell):**

    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
    (如果遇到執行原則問題，您可能需要先執行 `Set-ExecutionPolicy Unrestricted -Scope Process` 或 `Set-ExecutionPolicy RemoteSigned -Scope Process` 來允許腳本執行)

*   **macOS / Linux (bash/zsh):**

    ```bash
    source venv/bin/activate
    ```

啟動成功後，您的終端機提示字元通常會顯示虛擬環境的名稱（例如 `(venv)`），表示您現在正處於虛擬環境中。

### 3. 停用虛擬環境

當您完成在虛擬環境中的工作後，可以使用以下指令來停用它：

```bash
deactivate
```

執行此指令後，您的終端機提示字元會恢復正常，表示您已退出虛擬環境，並返回到系統的全域 Python 環境。

### 4. 安裝套件

在啟動的虛擬環境中，您可以使用 `pip` 來安裝、更新和移除套件。這些套件將會被安裝到當前啟動的虛擬環境中，而不會影響到您的全域 Python 環境或其他虛擬環境。

例如，安裝 `requests` 套件：

```bash
pip install requests
```

查看已安裝的套件：

```bash
pip list
```

### 5. 匯出與匯入套件列表 (requirements.txt)

為了讓其他人 (或未來的您) 能夠重現您的專案環境，通常會將專案的依賴套件及其版本記錄在一個名為 `requirements.txt` 的檔案中。

*   **匯出套件列表：**

    在啟動的虛擬環境中，執行以下指令會將目前環境中所有已安裝的套件及其版本號儲存到 `requirements.txt` 檔案：

    ```bash
    pip freeze > requirements.txt
    ```

*   **從套件列表安裝：**

    當其他人取得您的專案，或者您需要在新的環境中設定專案時，可以在建立並啟動新的虛擬環境後，執行以下指令來安裝 `requirements.txt` 中列出的所有套件：

    ```bash
    pip install -r requirements.txt
    ```

這就是使用 `venv` 進行 Python 虛擬環境管理的基本流程。透過有效地使用虛擬環境，您可以讓您的 Python 開發更加整潔、有條理且易於協作。
