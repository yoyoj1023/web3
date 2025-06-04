#!/usr/bin/env python
"""
Django專案設置測試腳本
用於驗證Django專案是否正確配置
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def test_django_setup():
    """測試Django專案設置"""
    print("🔍 開始測試Django專案設置...")
    
    # 設置Django環境
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hellodjango.settings')
    django.setup()
    
    # 測試導入
    try:
        from myapp.models import Post
        from myapp import views
        print("✅ 模型和視圖導入成功")
    except ImportError as e:
        print(f"❌ 導入失敗: {e}")
        return False
    
    # 測試URL配置
    try:
        from django.urls import reverse
        from django.test import Client
        
        client = Client()
        
        # 測試首頁
        response = client.get('/')
        if response.status_code == 200:
            print("✅ 首頁訪問成功")
        else:
            print(f"❌ 首頁訪問失敗，狀態碼: {response.status_code}")
        
        # 測試文章列表頁
        response = client.get('/posts/')
        if response.status_code == 200:
            print("✅ 文章列表頁訪問成功")
        else:
            print(f"❌ 文章列表頁訪問失敗，狀態碼: {response.status_code}")
            
    except Exception as e:
        print(f"❌ URL測試失敗: {e}")
        return False
    
    print("🎉 Django專案設置測試完成！")
    return True

if __name__ == '__main__':
    # 檢查是否在正確的目錄
    if not os.path.exists('manage.py'):
        print("❌ 請在Django專案根目錄下運行此腳本")
        sys.exit(1)
    
    # 運行測試
    test_django_setup()
    
    print("\n📝 下一步操作建議：")
    print("1. 運行：python manage.py makemigrations")
    print("2. 運行：python manage.py migrate")
    print("3. 運行：python manage.py createsuperuser")
    print("4. 運行：python manage.py runserver")
    print("5. 打開瀏覽器訪問：http://127.0.0.1:8000/") 