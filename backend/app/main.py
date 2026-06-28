from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, products, orders, chatbot, admin
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="QuantlyNhathuoc API", version="1.0.0")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

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
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to QuantlyNhathuoc API"}
