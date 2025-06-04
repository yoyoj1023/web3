# 🚀 Django入門教學指南

歡迎來到Django世界！這是一個完整的Django入門教學專案，適合初學者學習Django框架的基本概念和操作。

## 📚 什麼是Django？

Django是一個高級的Python Web框架，它鼓勵快速開發和簡潔、實用的設計。Django遵循"不要重複自己"（DRY）的原則，並且提供了豐富的功能來幫助開發者快速構建Web應用程式。

## 🎯 學習目標

通過這個教學專案，您將學會：

- ✅ 創建Django專案和應用程式
- ✅ 理解Django的MVC架構（Model-View-Template）
- ✅ 配置URL路由系統
- ✅ 創建和使用視圖函數
- ✅ 使用Django模板系統
- ✅ 設計資料庫模型
- ✅ 使用Django管理後台
- ✅ 處理靜態檔案和CSS樣式

## 🛠️ 環境需求

- Python 3.8+
- pip（Python套件管理工具）

## 📁 專案結構

```
89-hello-django/
├── hellodjango/           # Django專案配置目錄
│   ├── __init__.py
│   ├── settings.py        # 專案設定檔
│   ├── urls.py           # 主要URL配置
│   ├── wsgi.py           # WSGI配置
│   └── asgi.py           # ASGI配置
├── myapp/                 # Django應用程式
│   ├── migrations/        # 資料庫遷移檔案
│   ├── templates/         # HTML模板
│   │   └── myapp/
│   │       ├── base.html
│   │       ├── hello_world.html
│   │       └── post_list.html
│   ├── __init__.py
│   ├── admin.py          # 管理後台配置
│   ├── apps.py           # 應用程式配置
│   ├── models.py         # 資料模型
│   ├── urls.py           # 應用程式URL配置
│   ├── views.py          # 視圖函數
│   └── tests.py          # 測試檔案
├── manage.py             # Django管理腳本
├── db.sqlite3            # SQLite資料庫
├── requirements.txt      # Python依賴套件
└── README.md            # 本教學檔案
```

## 🚀 快速開始

### 第一步：準備虛擬環境

```bash
# 創建虛擬環境
python -m venv myenv

# 啟動虛擬環境
# Windows:
myenv\Scripts\activate
# macOS/Linux:
source myenv/bin/activate
```

### 第二步：安裝依賴套件

```bash
pip install -r requirements.txt
```

### 第三步：執行資料庫遷移

```bash
python manage.py makemigrations
python manage.py migrate
```

### 第四步：創建管理員帳號

```bash
python manage.py createsuperuser
```

依照提示輸入：
- 使用者名稱
- 電子信箱（可選）
- 密碼

### 第五步：啟動開發伺服器

```bash
python manage.py runserver
```

### 第六步：瀏覽應用程式

打開瀏覽器並訪問：

- 🏠 **首頁**: http://127.0.0.1:8000/
- 📝 **文章列表**: http://127.0.0.1:8000/posts/
- ⚙️ **管理後台**: http://127.0.0.1:8000/admin/

## 🔍 詳細教學

### 1. Django專案結構解析

#### `settings.py` - 專案設定檔
這是Django專案的核心配置檔案，包含：
- 資料庫配置
- 已安裝的應用程式
- 中介軟體配置
- 模板設定

#### `urls.py` - URL路由配置
定義URL模式，將網址對應到相應的視圖函數。

#### `models.py` - 資料模型
定義資料庫表結構和資料之間的關係。

#### `views.py` - 視圖函數
處理HTTP請求並返回HTTP回應的邏輯。

#### `templates/` - 模板目錄
存放HTML模板檔案，用於生成動態網頁。

### 2. 理解Django的MVC架構

Django遵循MTV（Model-Template-View）模式：

- **Model（模型）**: 處理資料和業務邏輯
- **Template（模板）**: 處理呈現層（HTML）
- **View（視圖）**: 處理請求/回應邏輯

### 3. 資料模型說明

在 `models.py` 中定義的 `Post` 模型：

```python
class Post(models.Model):
    title = models.CharField(max_length=200)        # 標題欄位
    content = models.TextField()                    # 內容欄位
    created_at = models.DateTimeField(auto_now_add=True)  # 創建時間

    def __str__(self):
        return self.title  # 在管理後台顯示的名稱
```

### 4. 視圖函數說明

在 `views.py` 中定義的視圖函數：

```python
def hello_world(request):
    """首頁視圖 - 顯示歡迎訊息"""
    return render(request, 'myapp/hello_world.html')

def post_list(request):
    """文章列表視圖 - 顯示所有文章"""
    posts = Post.objects.all().order_by('-created_at')
    return render(request, 'myapp/post_list.html', {'posts': posts})
```

### 5. URL配置說明

主要URL配置（`hellodjango/urls.py`）：
```python
urlpatterns = [
    path('admin/', admin.site.urls),      # 管理後台
    path('', include('myapp.urls')),      # 包含應用程式的URL
]
```

應用程式URL配置（`myapp/urls.py`）：
```python
urlpatterns = [
    path('', views.hello_world, name='hello_world'),      # 首頁
    path('posts/', views.post_list, name='post_list'),    # 文章列表
]
```

### 6. 模板系統說明

Django模板系統使用特殊語法：
- `{{ variable }}` - 顯示變數
- `{% tag %}` - 模板標籤
- `{% block %}` - 區塊繼承
- `{% url %}` - URL反向解析

## 🎮 互動練習

### 練習1：添加新文章
1. 訪問管理後台：http://127.0.0.1:8000/admin/
2. 登入管理員帳號
3. 點擊「Posts」
4. 點擊「Add Post」
5. 填寫標題和內容
6. 保存後回到文章列表頁面查看

### 練習2：修改模板樣式
1. 編輯 `myapp/templates/myapp/base.html`
2. 修改CSS樣式
3. 重新載入頁面查看變化

### 練習3：添加新視圖
1. 在 `views.py` 中添加新的視圖函數
2. 在 `urls.py` 中添加對應的URL模式
3. 創建新的HTML模板
4. 測試新功能

## 🐛 常見問題與解決方案

### 問題1：ModuleNotFoundError: No module named 'django'
**解決方案**: 確保已激活虛擬環境並安裝了Django
```bash
pip install Django
```

### 問題2：port is already in use
**解決方案**: 使用不同的端口
```bash
python manage.py runserver 8001
```

### 問題3：Template does not exist
**解決方案**: 檢查模板路徑和檔案名稱是否正確

### 問題4：CSRF verification failed
**解決方案**: 在表單中添加 `{% csrf_token %}`

## 📖 進階學習建議

完成本教學後，建議您繼續學習：

1. **Django表單處理** - 學習如何處理用戶輸入
2. **用戶驗證系統** - 實現登入/註冊功能
3. **Django REST Framework** - 建構API服務
4. **部署應用程式** - 將應用程式部署到雲端
5. **測試驅動開發** - 編寫自動化測試

## 📚 推薦資源

- [Django官方文檔](https://docs.djangoproject.com/)
- [Django Girls教程](https://tutorial.djangogirls.org/)
- [Mozilla Django教程](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django)
- [Real Python Django教程](https://realpython.com/tutorials/django/)

## 🤝 貢獻與回饋

如果您在學習過程中發現任何問題或有改進建議，歡迎：
- 提出Issue
- 發送Pull Request
- 分享學習心得

## 📄 授權

本教學專案採用MIT授權條款。

---

**祝您學習愉快！🎉**

記住：學習程式設計最好的方法就是動手實作。不要害怕犯錯，每個錯誤都是學習的機會！ 