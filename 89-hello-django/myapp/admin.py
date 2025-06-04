from django.contrib import admin
from .models import Post

# 註冊Post模型到管理後台
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')  # 在列表頁面顯示的欄位
    list_filter = ('created_at',)  # 添加過濾器
    search_fields = ('title', 'content')  # 添加搜尋功能
    ordering = ('-created_at',)  # 預設排序
