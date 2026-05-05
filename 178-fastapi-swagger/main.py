from fastapi import FastAPI

# 1. 建立一個 FastAPI 實例
app = FastAPI()

# 2. 定義一個 GET 請求的 API
@app.get("/")
def read_root():
    return {"Hello": "World"}

# 3. 定義另一個帶參數的 API (選填，讓你看看效果)
@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "query": q}