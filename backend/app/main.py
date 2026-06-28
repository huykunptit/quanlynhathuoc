from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, products, orders, chatbot

app = FastAPI(title="QuantlyNhathuoc API", version="1.0.0")

# Cấu hình CORS cho Frontend Next.js
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(chatbot.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to QuantlyNhathuoc API"}
