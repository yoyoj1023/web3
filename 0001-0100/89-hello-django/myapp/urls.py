from django.urls import path
from . import views

app_name = 'myapp'
urlpatterns = [
    path('', views.hello_world, name='hello_world'),
    path('posts/', views.post_list, name='post_list'),
] 