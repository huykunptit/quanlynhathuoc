# KẾ HOẠCH TRIỂN KHAI
# Hệ thống Nhà thuốc Trực tuyến tích hợp Chatbot Chẩn đoán Bệnh

> Dựa trên báo cáo giữa kỳ "Thiết kế hệ thống Y tế thông minh có chatbot" (Đề tài số 6).
> Báo cáo hiện chỉ ở mức **thiết kế + code mẫu rời rạc**, chưa có hệ thống chạy được.
> Mục tiêu của plan này là biến thiết kế thành một hệ thống thực thi được, theo từng giai đoạn.

---

## 0. Hiện trạng (theo báo cáo) & việc cần bổ sung ngay

| Đã có trong báo cáo | Còn thiếu / chưa rõ |
|---|---|
| Kiến trúc 3 tầng (Client - API - DB) | Chưa có repo code thật, chỉ có snippet rời |
| Bảng so sánh giải pháp chatbot (Rasa/Dialogflow/GPT/Rule-based) | Chưa chốt cấu hình OpenAI key, fallback logic |
| 3 Actor: User, Admin, Chatbot AI | Chưa có đặc tả UC-02 (Gợi ý thuốc) đầy đủ |
| Công thức TF-IDF + Cosine Similarity | Chưa có ngưỡng (threshold) test thực tế, mới có `0.3` mặc định |
| Code mẫu: `main.py`, `nlp_service.py`, `chatbot.py`, `ChatWidget.jsx` | Thiếu `auth.py`, `products.py`, `orders.py`, các model SQLAlchemy, `database.py` |
| Mô tả 3/6 bảng CSDL (Users, Products, ChatHistory) | Thiếu Orders, OrderItems, và 1 bảng còn lại (đề xuất: `Diseases`/`Symptoms` nếu chuyển KB từ JSON vào DB) |
| Knowledge base mẫu: 3 bệnh (Cảm cúm, Đau dạ dày, Viêm da dị ứng) | Cần mở rộng lên 50+ bệnh / 500+ từ khóa (mục 6.2 báo cáo) |
| 10 hình (Hình 1.1 → 5.3) | Tất cả mới là **caption placeholder**, chưa có hình vẽ thật (cần PlantUML/draw.io) |
| Bảng 5.1 "API endpoint chính" được liệt kê trong mục lục | Chưa có nội dung — cần lập bảng endpoint thật khi code xong |

---

## 1. Công nghệ sử dụng (giữ theo báo cáo)

| Tầng | Công nghệ | Phiên bản |
|---|---|---|
| Frontend | React + Next.js | 14.x |
| Frontend UI | TailwindCSS | 3.x |
| Backend | FastAPI (Python) | 0.104 |
| Database | PostgreSQL | 15.x |
| ORM | SQLAlchemy | 2.x |
| AI/NLP | scikit-learn (TF-IDF, Cosine Similarity) | 1.3 |
| AI API fallback | OpenAI API (GPT-3.5) | - |
| Auth | JWT (python-jose) | 3.3 |
| Deploy | Docker Compose | latest |

---

## 2. Cấu trúc thư mục (theo báo cáo, dùng làm chuẩn khi code)

```
pharmacy-system/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/        # user.py, product.py, order.py, chat_history.py (+ thêm nếu cần)
│   │   ├── routers/       # auth.py, products.py, orders.py, chatbot.py
│   │   └── services/      # chatbot_service.py, nlp_service.py
│   ├── knowledge_base/symptoms_data.json
│   └── requirements.txt
├── frontend/
│   ├── pages/             # index.js, products/, chat.js
│   ├── components/        # ChatWidget.jsx, ProductCard.jsx, Navbar.jsx
│   └── package.json
└── docker-compose.yml
```

---

## 3. Lộ trình triển khai theo Phase

### Phase 1 — Khởi tạo môi trường & hạ tầng cơ sở (2-3 ngày)
- [ ] Tạo repo Git, cấu trúc thư mục đúng như mục lục báo cáo
- [ ] Khởi tạo `backend/` (venv, `requirements.txt`: fastapi, uvicorn, sqlalchemy, psycopg2-binary, python-jose, passlib[bcrypt], scikit-learn, openai)
- [ ] Khởi tạo `frontend/` bằng `create-next-app` + cài TailwindCSS
- [ ] Viết `docker-compose.yml` tối thiểu: service `db` (postgres:15), `backend`, `frontend`
- [ ] Cấu hình `.env` (DB_URL, JWT_SECRET, OPENAI_API_KEY) — **không commit secrets**

### Phase 2 — Thiết kế & khởi tạo Database (2 ngày)
- [ ] Hoàn thiện ERD đầy đủ 6 bảng: `users`, `products`, `orders`, `order_items`, `chat_history`, `diseases` (hoặc giữ KB ở JSON nếu không cần bảng thứ 6)
- [ ] Viết model SQLAlchemy cho từng bảng (`models/*.py`)
- [ ] Viết `database.py` (engine, SessionLocal, get_db dependency)
- [ ] Tạo migration bằng Alembic (khuyến nghị, báo cáo chưa đề cập nhưng cần cho production)
- [ ] Seed dữ liệu mẫu: vài user, ~20 sản phẩm thuốc

### Phase 3 — Backend Core API (4-5 ngày)
- [ ] `routers/auth.py`: đăng ký, đăng nhập, JWT issue/verify
- [ ] `routers/products.py`: CRUD sản phẩm, tìm kiếm, lọc theo chỉ định
- [ ] `routers/orders.py`: tạo đơn hàng, giỏ hàng, lịch sử đơn hàng
- [ ] Hoàn thiện `main.py` theo code mẫu đã có trong báo cáo (đã sẵn sàng dùng được)
- [ ] Viết test cơ bản cho từng router (pytest + httpx)

### Phase 4 — Module Chatbot AI / NLP (4-5 ngày)
- [ ] Triển khai `nlp_service.py` đúng theo code mẫu (TF-IDF + Cosine Similarity)
- [ ] Mở rộng `knowledge_base/symptoms_data.json` từ 3 → tối thiểu 15-20 bệnh cho giai đoạn này (mục tiêu cuối kỳ: 50+)
- [ ] Hoàn thiện `routers/chatbot.py` theo code mẫu, lưu `chat_history`
- [ ] Thêm fallback gọi OpenAI API khi `confidence < threshold` (báo cáo đã chọn hướng hybrid nhưng chưa code phần fallback)
- [ ] Test độ chính xác chatbot với bộ câu hỏi mẫu (đo precision thủ công, ghi nhận để báo cáo cuối kỳ)

### Phase 5 — Hệ thống gợi ý thuốc (Recommendation) (3 ngày)
- [ ] Content-based filtering: map `disease → recommended_drug_ids` (đã có trong KB)
- [ ] Collaborative filtering (giai đoạn sau, có thể để cuối kỳ): gợi ý theo lịch sử mua hàng người dùng tương tự
- [ ] Thêm cảnh báo tương tác thuốc / chống chỉ định cơ bản (đã nêu trong "Hướng phát triển" 6.2)

### Phase 6 — Frontend (5-6 ngày)
- [ ] Trang chủ (`pages/index.js`) + danh sách sản phẩm + `ProductCard.jsx`
- [ ] `ChatWidget.jsx`: dùng đúng code mẫu trong báo cáo, kết nối `/api/chat`
- [ ] Trang giỏ hàng / đặt hàng
- [ ] Trang đăng nhập / đăng ký, lưu JWT (httpOnly cookie hoặc localStorage tuỳ quyết định bảo mật)
- [ ] Responsive UI (mục 6.2 báo cáo có nêu "hoàn thiện giao diện responsive")

### Phase 7 — Vẽ lại các hình/sơ đồ còn placeholder (1-2 ngày, làm song song)
- [ ] Hình 1.1 Kiến trúc tổng thể — vẽ bằng draw.io/PlantUML
- [ ] Hình 3.1 Use Case tổng quát, Hình 3.2 Sequence Diagram
- [ ] Hình 4.1 ERD, Hình 4.2 kiến trúc backend
- [ ] Hình 2.2 minh họa TF-IDF, Hình 2.1 luồng xử lý chatbot
- [ ] Screenshot thật Hình 5.1-5.3 sau khi có UI chạy

### Phase 8 — Testing & QA (2-3 ngày)
- [ ] Test tích hợp toàn luồng: nhập triệu chứng → chẩn đoán → gợi ý thuốc → đặt hàng
- [ ] Test các use case thay thế (UC-01 luồng thay thế: triệu chứng không nhận diện được)
- [ ] Viết / hoàn thiện đặc tả UC-02 (Gợi ý thuốc) còn thiếu trong báo cáo

### Phase 9 — Đóng gói & Deploy (1-2 ngày)
- [ ] Hoàn thiện `docker-compose.yml` đầy đủ 3 service (đúng mục 6.2: "triển khai trên Docker Compose với môi trường production")
- [ ] Biến môi trường tách biệt dev/prod
- [ ] (Tuỳ chọn) Deploy thử lên VPS / cloud free-tier để demo

### Phase 10 — Hoàn thiện báo cáo cuối kỳ
- [ ] Bổ sung Bảng 5.1 (API endpoint thật) sau khi code xong
- [ ] Bổ sung số liệu thật: độ chính xác chatbot, số bệnh trong KB, kết quả test
- [ ] Cập nhật ảnh chụp giao diện thật thay placeholder

---

## 4. Thứ tự ưu tiên nếu thời gian hạn chế

1. Phase 1-2 (môi trường + DB) — **bắt buộc, làm trước tiên**
2. Phase 3-4 (Backend + Chatbot) — đây là phần lõi "thông minh" của đề tài, ưu tiên cao nhất
3. Phase 6 (Frontend) — để demo được, ít nhất cần `ChatWidget` + trang chủ
4. Phase 7 (vẽ hình) — có thể làm song song bất kỳ lúc nào, không phụ thuộc code
5. Phase 5, 8, 9 — làm sau nếu còn thời gian, hoặc dồn vào giai đoạn cuối kỳ
6. Phase 10 — làm cuối, ngay trước khi nộp báo cáo cuối kỳ

---

## 5. Rủi ro cần lưu ý

- **Knowledge base nhỏ (3 bệnh)** → chatbot sẽ trả "không nhận diện được" rất nhiều khi demo. Cần mở rộng ít nhất 15-20 bệnh trước khi demo giữa kỳ tiếp theo.
- **Threshold cosine similarity = 0.3** là giá trị đặt cứng, chưa kiểm chứng — nên thử nghiệm với dữ liệu thật để tinh chỉnh.
- **Chatbot chẩn đoán bệnh** — cần giữ rõ disclaimer "không thay thế chẩn đoán y khoa" xuyên suốt UI, đúng như phạm vi đã giới hạn ở mục 1.3 báo cáo.
- **OpenAI API** tốn phí theo token — nên giới hạn fallback chỉ gọi khi rule-based/TF-IDF thất bại, và đặt budget cap khi test.
