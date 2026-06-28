# Hệ thống Nhà thuốc Trực tuyến tích hợp Chatbot Chẩn đoán Bệnh (QuantlyNhathuoc)

Dự án này là hệ thống nhà thuốc trực tuyến với kiến trúc 3 tầng, bao gồm cả Frontend (Next.js), Backend API (FastAPI) và Chatbot AI tự động chẩn đoán bệnh dựa trên triệu chứng (TF-IDF + Cosine Similarity & OpenAI Fallback).

## 1. Yêu cầu hệ thống (Prerequisites)
Để chạy dự án này, máy tính của bạn cần cài đặt:
- **Node.js** (v18 trở lên) & **npm**: Dành cho Frontend Next.js.
- **Python** (v3.9 trở lên): Dành cho Backend FastAPI.
- **Docker** & **Docker Compose**: Dành cho Database PostgreSQL. Đảm bảo ứng dụng Docker Desktop đã được mở và chạy ngầm (icon cá voi màu xanh/ổn định).

## 2. Các bước Cài đặt và Khởi chạy

### Bước 1: Khởi động Database (PostgreSQL)
Mở terminal tại thư mục gốc của dự án (`/Users/huy/Documents/THUE/QuantlyNhathuoc`) và chạy lệnh sau để bật DB:
```bash
docker-compose up -d db
```
> **Lưu ý quan trọng**: Database sẽ chạy ở port `5433` để không đụng chạm với bất kỳ database local nào của bạn.

### Bước 2: Khởi chạy Backend (FastAPI)
Mở một tab terminal mới tại thư mục gốc và chạy các lệnh sau:

**Đối với MacOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

**Đối với Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
Sau khi chạy, API sẽ hoạt động tại `http://localhost:8000`. Bạn có thể truy cập `http://localhost:8000/docs` để xem Swagger UI của API.

### Bước 3: Khởi chạy Frontend (Next.js)
Mở thêm một tab terminal khác tại thư mục gốc và chạy:
```bash
cd frontend
npm install
npm run dev
```
Trang web sẽ hoạt động tại `http://localhost:3000`.

## 3. Hướng dẫn sử dụng & Lưu ý cấu hình

- **Chatbot AI**: Để tính năng chatbot nhận diện các triệu chứng mà rule-based (TF-IDF) không hiểu, bạn cần cung cấp một API Key của OpenAI. Mở file `.env` ở thư mục gốc và sửa `OPENAI_API_KEY=sk-placeholder` thành API key thực của bạn. Nếu không có key, chatbot vẫn sẽ đưa ra thông báo lịch sự khi gặp từ khóa khó.
- **Tài khoản mẫu**:
  - Khi hệ thống setup (seed), nó đã tạo sẵn tài khoản admin:
    - Email: `admin@example.com`
    - Pass: `admin123`
  - Và một tài khoản user bình thường:
    - Email: `user@example.com`
    - Pass: `user123`
- **Chức năng chính**:
  - Giao diện có hiển thị **danh sách thuốc** được nạp sẵn.
  - Có thể ấn **Mua ngay** để thêm thuốc vào giỏ hàng.
  - Tại trang **Giỏ hàng**, bạn có thể tăng giảm số lượng. Phải đăng nhập mới có thể bấm nút **Đặt hàng**.
  - **Bong bóng Chat** nằm ở góc dưới bên phải màn hình. Có thể nhấn vào để khai báo triệu chứng (ví dụ: *"Tôi bị đau đầu và sốt cao"*), chatbot sẽ phân tích và gợi ý bệnh cũng như thuốc.

## 4. Kiến trúc & Công nghệ
- **Frontend**: React, Next.js 14, TailwindCSS.
- **Backend**: Python FastAPI, SQLAlchemy ORM, Alembic (Migration), python-jose (JWT Auth), passlib (Bcrypt).
- **AI/NLP**: scikit-learn (TfidfVectorizer, cosine_similarity), OpenAI API.
- **Database**: PostgreSQL 15.

---
*Dự án được tự động triển khai thành công dựa trên kế hoạch thiết kế ban đầu.*
