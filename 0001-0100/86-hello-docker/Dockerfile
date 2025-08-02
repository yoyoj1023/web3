# 1. 使用一个官方的 Nginx 镜像作为基础镜像
FROM nginx:latest

# 2. 将我们自己创建的 index.html 文件复制到 Nginx 的默认网站内容目录
# 第一个参数是宿主机上的文件路径 (相对于 Dockerfile 所在目录)
# 第二个参数是容器内的目标路径
COPY index.html /usr/share/nginx/html/index.html

# (可选) 暴露端口，这更多是文档性质，实际端口映射在 docker run 时指定
EXPOSE 80