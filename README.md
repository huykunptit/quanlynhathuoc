# Hệ thống Nhà thuốc Trực tuyến tích hợp Chatbot Chẩn đoán Bệnh (QuantlyNhathuoc)

Dự án này là hệ thống nhà thuốc trực tuyến với kiến trúc 3 tầng, bao gồm cả Frontend (Next.js), Backend API (FastAPI) và Chatbot AI tự động chẩn đoán bệnh dựa trên triệu chứng (TF-IDF + Cosine Similarity & Gemini/OpenAI/Anthropic Fallback).

## 1. Yêu cầu hệ thống (Prerequisites)
Để chạy dự án này, máy tính của bạn cần cài đặt:
- **Node.js** (v18 trở lên) & **npm**: Dành cho Frontend Next.js.
- **Python** (v3.9 trở lên): Dành cho Backend FastAPI.
- CSDL mặc định của dự án sử dụng **SQLite** (file `pharmacy.db` lưu trực tiếp), do đó bạn không cần phải cài đặt Docker hay PostgreSQL.

## 2. Các bước Cài đặt và Khởi chạy

### Bước 1: Khởi chạy Backend (FastAPI) & Nạp dữ liệu y khoa (Dataset)
Mở một tab terminal mới tại thư mục gốc và chạy các lệnh sau:

**Đối với Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Tạo CSDL và nạp dữ liệu mẫu ban đầu (Sản phẩm, User, 4 bệnh cơ bản)
python seed.py

# Nạp kho dữ liệu khổng lồ (ViMedical & Symptom2Disease) -> Tạo ra 662 bệnh + hàng ngàn triệu chứng cho TF-IDF
python import_diseases.py

# Khởi chạy server API ở port 8001 (tránh xung đột với các dự án Laravel chạy port 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Sau khi chạy, API sẽ hoạt động tại `http://localhost:8001`. Bạn có thể truy cập `http://localhost:8001/docs` để xem Swagger UI của API.

### Bước 2: Khởi chạy Frontend (Next.js)
Mở thêm một tab terminal khác tại thư mục gốc và chạy:
```bash
cd frontend
npm install
npm run dev
```
Trang web sẽ hoạt động tại `http://localhost:3000`. Đảm bảo file `.env.local` ở frontend đã cấu hình `NEXT_PUBLIC_API_URL=http://localhost:8001`.

## 3. Các tính năng nổi bật & Cập nhật mới nhất

- **Chatbot AI (TF-IDF Local Engine + LLM Fallback)**:
  - Tích hợp bộ dataset y khoa lớn gồm hơn **12,000 dòng dữ liệu** (`ViMedical_Disease` & `Symptom2Disease`), huấn luyện ra **662 bệnh** phổ biến bằng `TfidfVectorizer`.
  - Phản hồi cực nhanh (< 0.1s) không qua mạng cho các bệnh thông thường.
  - Hỗ trợ fallback linh hoạt qua Gemini, OpenAI hoặc Anthropic khi gặp câu hỏi khó.
  - Đã khắc phục hoàn toàn lỗi rate-limit của Gemini và lỗi vòng đời bộ nhớ `DetachedInstanceError` của SQLAlchemy.
- **Live Search Preview**: Thanh tìm kiếm (Navbar) được nâng cấp với tính năng gọi API dạng debounce và dropdown hiển thị ngay các sản phẩm khớp với từ khóa trực quan (có kèm ảnh và giá).
- **Tài khoản mẫu**:
  - Email: `admin@example.com` | Pass: `admin123` (Tài khoản Admin)
  - Email: `user@example.com` | Pass: `user123` (Tài khoản User)

## 4. Kiến trúc & Công nghệ
- **Frontend**: React, Next.js 14, TailwindCSS, Lucide-React.
- **Backend**: Python FastAPI, SQLAlchemy ORM, Alembic (Migration), python-jose (JWT Auth), passlib (Bcrypt).
- **AI/NLP**: scikit-learn (TfidfVectorizer, cosine_similarity), Google Generative AI (Gemini).
- **Database**: SQLite (dễ dàng deploy và phát triển cục bộ).

---
*Dự án được triển khai và hoàn thiện các chức năng bởi AI Agent.*
