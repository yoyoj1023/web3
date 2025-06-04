from django.shortcuts import render

# Create your views here.
# myapp/views.py
from django.http import HttpResponse
from .models import Post # 引入你的模型

def hello_world(request):
    """首頁視圖 - 顯示歡迎訊息"""
    return render(request, 'myapp/hello_world.html')

def post_list(request):
    """文章列表視圖 - 顯示所有文章"""
    posts = Post.objects.all().order_by('-created_at') # 獲取所有 Post 物件，按創建時間倒序排列
    return render(request, 'myapp/post_list.html', {'posts': posts})
    # render 會載入範本並傳遞資料給它