# FastAPI 第一個 API

本專案為最小 FastAPI 範例：`main.py` 內定義兩個 GET 端點，並可用 Swagger UI 在瀏覽器測試。

## 需求

- Python 3.8+（建議安裝最新的 3.11 或 3.12）
- 終端機：Windows 可用 **PowerShell** 或 **命令提示字元**

若系統沒有 `python` 指令，可改用 Windows 的 Python Launcher：`py`（下列將 `python` 換成 `py` 即可）。

---

## 流程總覽

1. 進入專案目錄  
2. （建議）建立並啟用虛擬環境  
3. 安裝 `fastapi` 與 `uvicorn`  
4. 用 `uvicorn` 啟動應用程式  
5. 瀏覽器開啟本機網址測試 API 與 Swagger

---

## 1. 進入專案目錄

```powershell
cd c:\VScode\web3\178-fastapi-swagger
```

---

## 2. 建立虛擬環境（建議）

可避免套件裝到全系統 Python，也方便日後重現環境。

**PowerShell：**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

若執行政策阻擋啟用指令稿，可在該次 PowerShell 執行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**命令提示字元（cmd）：**

```cmd
python -m venv .venv
.venv\Scripts\activate.bat
```

啟用成功後，提示字元前面通常會出現 `(.venv)`。

---

## 3. 安裝依賴套件

```powershell
pip install fastapi "uvicorn[standard]"
```

- **FastAPI**：Web 框架與 OpenAPI 文件  
- **uvicorn**：ASGI 伺服器，用來在本機提供 HTTP 服務；`[standard]` 含較佳的開發體驗（例如 `watchfiles`）

---

## 4. 啟動 API

在專案目錄（與 `main.py` 同一層）執行：

```powershell
uvicorn main:app --reload
```

說明：

| 參數 | 意義 |
|------|------|
| `main` | 對應檔案 `main.py` |
| `app` | `main.py` 裡建立的 `app = FastAPI()` 實例 |
| `--reload` | 程式碼變更時自動重載（開發時使用） |

預設監聽：**http://127.0.0.1:8000**

停止伺服器：在終端機按 **Ctrl+C**。

---

## 5. 測試與文件

本範例提供的端點（見 `main.py`）：

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/` | 回傳 `{"Hello":"World"}` |
| GET | `/items/{item_id}` | 路徑參數 `item_id`；可選查詢參數 `q`，例如 `/items/1?q=test` |

建議在瀏覽器開啟：

- **根路徑**：<http://127.0.0.1:8000/>  
- **Swagger UI（互動式 API 文件）**：<http://127.0.0.1:8000/docs>  
- **ReDoc（另一種文件介面）**：<http://127.0.0.1:8000/redoc>

在 Swagger 可直接「Try it out」送出請求，不必另外裝 Postman。

---

## 常見問題

**連線被拒絕**  
確認 `uvicorn` 仍在執行，且網址為 `127.0.0.1:8000`（除非你有用 `--port` 改埠號）。

**找不到模組 `fastapi` 或 `uvicorn`**  
確認已啟用虛擬環境，並在同一個終端機執行過 `pip install`。

**PowerShell 無法啟用 `.venv`**  
使用上文 `Set-ExecutionPolicy`，或改用 cmd 的 `activate.bat`。

---

## 專案結構（目前）

```
178-fastapi-swagger/
├── main.py      # FastAPI 應用與路由
└── README.md    # 本說明
```

之後若新增 `requirements.txt`，可用 `pip install -r requirements.txt` 一次安裝依賴。
