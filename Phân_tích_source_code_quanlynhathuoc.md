# BÁO CÁO PHÂN TÍCH SOURCE CODE
## Đề tài số 6: Xây dựng hệ thống nhà thuốc trực tuyến tích hợp chatbot chẩn đoán bệnh

**Repository:** github.com/huykunptit/quanlynhathuoc  
**Môn học:** Thiết kế hệ thống thông minh  
**Thời điểm phân tích:** Tháng 6/2026 (Giai đoạn giữa kỳ)

---

## 1. TỔNG QUAN ĐÁNH GIÁ

Báo cáo này phân tích source code tại repository github.com/huykunptit/quanlynhathuoc, đối chiếu với yêu cầu đặt ra trong báo cáo giữa kỳ để đánh giá mức độ hoàn thiện, các tính năng đã đạt được, những phần còn thiếu và đề xuất cải thiện.

### 1.1. Điểm mạnh nổi bật

- Cấu trúc dự án rõ ràng: tách biệt backend (FastAPI/Python) và frontend (Next.js/React) theo đúng kiến trúc 3 tầng.
- Có Docker Compose để dễ dàng triển khai môi trường.
- NLP Service được xây dựng tốt với TF-IDF + Cosine Similarity, có fallback sang nhiều LLM (OpenAI, Gemini, Claude).
- Dữ liệu seed phong phú: 50 sản phẩm thuốc thực tế, 20+ bệnh với triệu chứng đa dạng.
- Giao diện frontend đẹp, responsive, có UX tốt (ChatWidget nổi, Navbar tích hợp giỏ hàng).
- Có Alembic migration để quản lý schema database chuyên nghiệp.

### 1.2. Tổng điểm hoàn thiện theo từng mảng

| Mảng chức năng | Mức hoàn thiện | Đánh giá |
|---|---|---|
| Backend – Auth (Đăng ký / Đăng nhập) | 85% | ✅ Đạt, cần thêm refresh token |
| Backend – Products API | 70% | ✅ Cơ bản đủ, thiếu CRUD Admin |
| Backend – Orders API | 65% | ⚠️ Thiếu cập nhật trạng thái, địa chỉ giao hàng |
| Backend – Chatbot / NLP | 80% | ✅ Tốt, thiếu gợi ý thuốc trực tiếp trong response |
| Frontend – Giao diện người dùng | 75% | ✅ Đạt, thiếu trang lịch sử đơn hàng & chi tiết |
| Frontend – Admin Dashboard | 20% | ❌ Mới có khung, số liệu hardcode |
| Database – Thiết kế | 85% | ✅ Đầy đủ 5/6 bảng, cần thêm địa chỉ & đánh giá |
| Knowledge Base (Chatbot) | 55% | ⚠️ Cần mở rộng đủ 50+ bệnh theo yêu cầu |
| Hệ thống gợi ý thuốc | 30% | ❌ Mới ở mức cơ bản, chưa có Content-based / CF |
| Kiểm thử (Test) | 15% | ❌ Mới có file test rời rạc, chưa có test suite |

---

## 2. PHÂN TÍCH BACKEND (FastAPI)

### 2.1. Cấu trúc thư mục backend

Cấu trúc backend tuân thủ đúng theo thiết kế trong báo cáo giữa kỳ:

| File / Module | Trạng thái | Ghi chú |
|---|---|---|
| app/main.py | ✅ Hoàn thiện | CORS, router đăng ký đúng |
| app/database.py | ✅ Hoàn thiện | SQLAlchemy engine, SessionLocal |
| app/models/user.py | ✅ Hoàn thiện | Có is_admin, is_active |
| app/models/product.py | ✅ Hoàn thiện | Có trường indications cho gợi ý |
| app/models/order.py | ⚠️ Cơ bản | Thiếu shipping_address, payment_method |
| app/models/disease.py | ✅ Có (bonus) | Không có trong báo cáo, được thêm tốt |
| app/models/chat_history.py | ✅ Hoàn thiện | Hỗ trợ chat ẩn danh (nullable user_id) |
| app/routers/auth.py | ✅ Hoàn thiện | JWT, đăng ký, đăng nhập, /me |
| app/routers/products.py | ⚠️ Thiếu CRUD | Chỉ có GET, thiếu POST/PUT/DELETE cho admin |
| app/routers/orders.py | ⚠️ Thiếu một số tính năng | Thiếu cập nhật status, hủy đơn |
| app/routers/chatbot.py | ✅ Cơ bản tốt | Response thiếu recommended_drugs |
| app/services/nlp_service.py | ✅ Rất tốt | Hybrid: TF-IDF + OpenAI/Gemini/Claude |

### 2.2. Phân tích chi tiết từng Router

#### 2.2.1. Auth Router – Mức hoàn thiện: 85%

**Đã triển khai:**
- Đăng ký tài khoản với bcrypt hash password, kiểm tra email trùng.
- Đăng nhập trả về JWT Bearer token.
- GET /auth/me để lấy thông tin người dùng hiện tại.
- Middleware xác thực JWT dùng được cho tất cả router khác.

**Còn thiếu:**
- Refresh token: token hiện tại hết hạn buộc người dùng phải đăng nhập lại.
- Đổi mật khẩu, quên mật khẩu (reset password qua email).
- Role-based access control (RBAC): chưa có decorator guard cho admin-only routes.

#### 2.2.2. Products Router – Mức hoàn thiện: 70%

**Đã triển khai:**
- GET /products/ với phân trang (skip/limit) và tìm kiếm theo tên/chỉ định.
- GET /products/{id} lấy chi tiết sản phẩm.

**Còn thiếu (quan trọng cho Admin):**
- POST /products/ – tạo sản phẩm mới.
- PUT /products/{id} – cập nhật thông tin thuốc, giá, tồn kho.
- DELETE /products/{id} – xóa/ẩn sản phẩm.
- Lọc theo danh mục (category), theo giá, sắp xếp (sort).
- Tìm kiếm theo active_ingredient (thành phần hoạt chất).

#### 2.2.3. Orders Router – Mức hoàn thiện: 65%

**Đã triển khai:**
- POST /orders/ – tạo đơn hàng, trừ tồn kho, tính tổng tiền.
- GET /orders/ – xem lịch sử đơn hàng của người dùng hiện tại.

**Còn thiếu:**
- Địa chỉ giao hàng (shipping_address) không được lưu vào đơn hàng.
- Phương thức thanh toán (COD / chuyển khoản) chưa có.
- PATCH /orders/{id}/status – Admin cập nhật trạng thái (pending → confirmed → shipped → delivered).
- DELETE /orders/{id} – Hủy đơn hàng (chỉ khi còn pending).
- GET /orders/{id} – Xem chi tiết một đơn hàng cụ thể.

#### 2.2.4. Chatbot Router – Mức hoàn thiện: 80%

**Đã triển khai:**
- POST /chat/ – nhận triệu chứng, gọi NLP service, lưu lịch sử.
- Hỗ trợ chat ẩn danh qua session_id UUID.
- POST /chat/train – trigger re-train TF-IDF model.

**Còn thiếu / không khớp với báo cáo:**
- ChatResponse trong code chỉ trả về `reply`, `session_id`, `confidence` – không có `recommended_drugs` như báo cáo đặc tả.
- Chưa có API xem lịch sử chat của người dùng (GET /chat/history).
- Chưa có cơ chế feedback (thumbs up/down) để cải thiện model.
- Endpoint /chat/train chưa có bảo vệ bằng quyền Admin.

### 2.3. NLP Service – Điểm nổi bật

> ✅ **ĐIỂM SÁNG:** NLP Service được triển khai vượt xa mức báo cáo đề xuất. Không chỉ có TF-IDF + Cosine Similarity như thiết kế, mà còn tích hợp 3 LLM provider (OpenAI GPT-3.5, Google Gemini, Anthropic Claude) với cơ chế fallback thông minh, chọn qua biến môi trường `LLM_PROVIDER`.

**Logic hoạt động:**
- Bước 1: TF-IDF match với ngưỡng confidence 0.2, nếu tìm được bệnh → trả về luôn.
- Bước 2 (Fallback): Nếu không match → gọi LLM (Gemini/OpenAI/Claude) để trả lời tự do.

**Vấn đề cần cải thiện:**
- Model TF-IDF chỉ được train một lần khi khởi động (singleton). Nếu thêm bệnh mới vào DB sau khi chạy, phải gọi `/chat/train` thủ công.
- Ngưỡng 0.2 có thể quá thấp, dễ gây false positive (chẩn đoán sai bệnh).
- Trường `recommended_drugs` trong Disease model lưu tên thuốc dạng string, không phải ID liên kết với bảng Products – không join được.

---

## 3. PHÂN TÍCH FRONTEND (Next.js / React)

### 3.1. Các trang đã có

| Trang / Component | Trạng thái | Nhận xét |
|---|---|---|
| / (Trang chủ - index.js) | ✅ Tốt | Hero banner, grid sản phẩm, thông tin USP |
| Navbar.jsx | ✅ Tốt | Tìm kiếm, giỏ hàng live update, đăng nhập/logout |
| ChatWidget.jsx | ✅ Tốt | Widget nổi, hỗ trợ markdown bold, smooth scroll |
| ProductCard.jsx | ✅ Đạt | Hiển thị ảnh, tên, giá, thêm giỏ hàng |
| /product/[id].js | ✅ Có | Trang chi tiết sản phẩm |
| /login.js | ✅ Tốt | Giao diện đăng nhập/đăng ký gộp, xử lý lỗi |
| /cart.js | ✅ Đạt | Quản lý giỏ hàng, checkout gửi API |
| /admin/dashboard.js | ❌ Chưa đủ | Chỉ có UI khung, số liệu hardcode, thiếu chức năng |
| Trang lịch sử đơn hàng | ❌ Chưa có | Người dùng không xem được đơn đã đặt |
| Trang hồ sơ cá nhân | ❌ Chưa có | Không có trang /profile |

### 3.2. Vấn đề kỹ thuật phát hiện trong Frontend

#### 3.2.1. Hardcode API URL

> ⚠️ **VẤN ĐỀ:** Tất cả các trang frontend đều hardcode URL `http://localhost:8000` trực tiếp trong code. Khi deploy lên server sẽ phải tìm và sửa từng file.

**Cách sửa:** Tạo file `.env.local` với `NEXT_PUBLIC_API_URL=http://localhost:8000` và dùng `process.env.NEXT_PUBLIC_API_URL` trong code.

#### 3.2.2. Lưu JWT Token bằng localStorage

> ⚠️ **VẤN ĐỀ BẢO MẬT:** JWT được lưu bằng `localStorage`, dễ bị tấn công XSS. Nên cân nhắc chuyển sang HttpOnly Cookie để bảo mật hơn trong môi trường production.

#### 3.2.3. Admin Dashboard chưa hoàn chỉnh

`/admin/dashboard.js` hiện tại:
- Số liệu (50 sản phẩm, 12 đơn hàng, 1248 khách) là hardcode, không lấy từ API.
- Chú thích "Các module quản lý chi tiết đang trong quá trình xây dựng" xuất hiện ngay trong UI.
- Không có trang quản lý sản phẩm, danh sách đơn hàng, danh sách người dùng.

### 3.3. Giỏ hàng – Điểm cần lưu ý

> ℹ️ **GHI CHÚ:** Giỏ hàng được lưu trong `localStorage`, không đồng bộ với server. Nếu người dùng mở nhiều tab hoặc đổi thiết bị, giỏ hàng sẽ khác nhau. Đây là giới hạn chấp nhận được ở giai đoạn này.

---

## 4. PHÂN TÍCH THIẾT KẾ DATABASE

### 4.1. Bảng đối chiếu với báo cáo

| Bảng | Trong báo cáo | Trong code | Nhận xét |
|---|---|---|---|
| users | ✅ Có | ✅ Có | Đủ trường, có is_admin |
| products | ✅ Có | ✅ Có | Có indications cho chatbot |
| orders | ✅ Có | ✅ Có | Thiếu shipping_address, payment |
| order_items | ✅ Có | ✅ Có | Lưu lịch sử giá đúng |
| chat_history | ✅ Có | ✅ Có | Nullable user_id (ẩn danh) – tốt |
| diseases / knowledge_base | ⚠️ JSON file | ✅ Có (DB) | Code dùng DB thay vì JSON file – tốt hơn thiết kế |

> ✅ **ĐIỂM CỘNG:** Code đã chuyển knowledge base từ file JSON (như trong báo cáo) thành bảng `diseases` trong PostgreSQL – đây là quyết định kiến trúc tốt hơn, cho phép CRUD qua API.

### 4.2. Các bảng còn thiếu – Đề xuất bổ sung

| Bảng đề xuất thêm | Lý do cần thiết | Ưu tiên |
|---|---|---|
| user_addresses | Lưu địa chỉ giao hàng thay vì nhập lại mỗi lần | Cao |
| product_reviews | Cho phép người dùng đánh giá và nhận xét thuốc | Trung bình |
| categories | Phân loại thuốc (kháng sinh, vitamin, dược mỹ phẩm…) | Trung bình |
| chat_feedback | Lưu feedback thumbs up/down để cải thiện chatbot | Trung bình |
| promotions / vouchers | Hệ thống mã giảm giá, khuyến mãi | Thấp |

---

## 5. PHÂN TÍCH NGHIỆP VỤ – TÍNH NĂNG CÒN THIẾU

### 5.1. Luồng nghiệp vụ đã hoàn thiện

- Đăng ký → Đăng nhập → Xem sản phẩm → Thêm giỏ hàng → Đặt hàng: ✅ Hoàn chỉnh.
- Chat với Chatbot → Nhận chẩn đoán sơ bộ: ✅ Hoạt động.
- Tìm kiếm sản phẩm theo từ khóa: ✅ Hoạt động.
- Admin kiểm tra quyền truy cập dashboard: ✅ Cơ bản.

### 5.2. Luồng nghiệp vụ còn thiếu

#### UC-02: Gợi ý thuốc từ kết quả chẩn đoán

> ❌ **THIẾU NGHIỆP VỤ QUAN TRỌNG:** Báo cáo đặc tả UC-02 là khi chatbot chẩn đoán xong phải tự động gợi ý sản phẩm thuốc có trong kho (kèm giá, nút thêm giỏ hàng). Hiện tại `ChatResponse` chỉ trả về text chẩn đoán, không có danh sách thuốc gợi ý.

**Để sửa:** Trong `nlp_service`, khi tìm được `Disease`, query thêm các `Product` có `indications` khớp với `disease.recommended_drugs` và trả về mảng `products` trong response.

#### UC-03: Quản lý đơn hàng (Admin)

- Admin chưa thể xem danh sách tất cả đơn hàng (chỉ người dùng xem được của mình).
- Admin chưa thể cập nhật trạng thái đơn hàng.
- Người dùng chưa nhận được thông báo khi đơn hàng thay đổi trạng thái.

#### UC-04: Quản lý danh mục thuốc (Admin)

- Admin chưa thể thêm / sửa / xóa sản phẩm thuốc qua giao diện.
- Chưa có chức năng upload ảnh sản phẩm.
- Chưa quản lý được cảnh báo tồn kho thấp.

#### UC-05: Hệ thống gợi ý thông minh (Recommendation)

Báo cáo đề cập đến hai loại gợi ý:
- **Content-based Filtering:** mới ở mức `disease → recommended_drugs string`, chưa join với bảng Products thực tế. ⚠️
- **Collaborative Filtering:** chưa triển khai – cần lịch sử mua hàng đủ lớn và thuật toán similarity giữa người dùng. ❌

### 5.3. Tính năng cảnh báo y tế còn thiếu

> ⚠️ **QUAN TRỌNG VỀ NGHIỆP VỤ Y TẾ:** Hệ thống nhà thuốc cần có các cảnh báo chuyên biệt mà hiện tại chưa có, đây là điểm phân biệt với e-commerce thông thường.

- Cảnh báo tương tác thuốc: khi người dùng thêm 2+ loại thuốc có tương tác vào giỏ hàng. ❌
- Cảnh báo chống chỉ định: thuốc không dùng cho phụ nữ mang thai, trẻ em... ❌
- Nhắc nhở liều dùng và cách dùng trong trang chi tiết sản phẩm. ⚠️
- Disclaimer y tế bắt buộc: thêm câu "Đây không phải chẩn đoán y khoa chính thức" vào mọi kết quả chatbot. ⚠️

---

## 6. CÁC VẤN ĐỀ KỸ THUẬT CẦN CẢI THIỆN

### 6.1. Bảo mật

| Vấn đề | Mức độ | Giải pháp |
|---|---|---|
| JWT lưu localStorage dễ bị XSS | Cao ❌ | Chuyển sang HttpOnly Cookie |
| /chat/train không có auth guard | Cao ❌ | Thêm `Depends(get_current_user)` + kiểm tra `is_admin` |
| CORS cho phép mọi method (*) | Trung bình ⚠️ | Giới hạn origins khi deploy production |
| Không có rate limiting cho API | Trung bình ⚠️ | Dùng `slowapi` để giới hạn request/phút |
| API key LLM lưu trực tiếp trong .env | Thấp | Dùng secrets manager (Docker secrets / Vault) |

### 6.2. Chất lượng code

- Thiếu validation: `ChatMessage` không giới hạn độ dài message (có thể bị spam prompt dài tốn token LLM).
- Không có logging: không có file log để debug khi có lỗi production.
- Thiếu exception handling: Products và Orders router không có try-catch cho database errors.
- NLP model train lại toàn bộ mỗi lần gọi `train_or_update` – sẽ chậm khi dataset lớn.

### 6.3. Kiểm thử (Testing)

> ❌ **THIẾU NGHIÊM TRỌNG:** Hiện tại chỉ có các file `test_*.py` rời rạc (`test_bing.py`, `test_gemini.py`, `test_yahoo.py`) để test thủ công. Chưa có test suite tự động nào cho router hoặc service.

**Cần bổ sung:**
- Unit test cho `NLPService.diagnose_rule_based()` với bộ câu hỏi mẫu tiếng Việt.
- Integration test cho các API endpoint với pytest + httpx.
- Test case cho giỏ hàng: tạo đơn hàng với `stock = 0` phải fail.

---

## 7. ĐỀ XUẤT CẢI THIỆN THEO ƯU TIÊN

### 7.1. Ưu tiên cao – Hoàn thiện trước báo cáo cuối kỳ

| # | Công việc | Thời gian ước tính | Impact |
|---|---|---|---|
| 1 | Hoàn thiện ChatResponse: trả về danh sách thuốc gợi ý (join Disease → Products) | 1–2 ngày | Rất cao |
| 2 | Thêm CRUD Admin cho Products: POST/PUT/DELETE /products/ | 1–2 ngày | Cao |
| 3 | Trang lịch sử đơn hàng /orders cho người dùng frontend | 1 ngày | Cao |
| 4 | Admin Dashboard: fetch số liệu thật từ API thay vì hardcode | 1 ngày | Cao |
| 5 | Mở rộng knowledge base lên 50+ bệnh với 500+ từ khóa | 2–3 ngày | Cao |
| 6 | Thêm shipping_address vào Order model và form checkout | 0.5 ngày | Trung bình |
| 7 | Guard /chat/train và các admin-only route bằng is_admin check | 0.5 ngày | Cao |

### 7.2. Ưu tiên trung bình – Nâng chất lượng hệ thống

- Thêm biến môi trường `NEXT_PUBLIC_API_URL`, bỏ hardcode `localhost:8000` trong frontend.
- Viết ít nhất 10 unit test cho NLP Service và các router chính.
- Thêm field `categories` vào Product model và tính năng lọc theo danh mục.
- Thêm trang `/profile` cho người dùng xem và sửa thông tin cá nhân.
- Thêm disclaimer y tế rõ ràng trong mọi kết quả chatbot và trang chi tiết sản phẩm.

### 7.3. Ưu tiên thấp – Nếu còn thời gian

- Collaborative Filtering gợi ý thuốc dựa trên lịch sử mua hàng người dùng tương tự.
- Hệ thống thông báo email khi đơn hàng thay đổi trạng thái.
- Cảnh báo tương tác thuốc trong giỏ hàng.
- Refresh token mechanism.
- Tính năng đánh giá sản phẩm (rating, review).

---

## 8. KẾT LUẬN

Source code tại github.com/huykunptit/quanlynhathuoc đã đạt được nền tảng kỹ thuật vững chắc so với báo cáo giữa kỳ. Các chức năng cốt lõi (xác thực, hiển thị sản phẩm, đặt hàng, chatbot AI) đều đã hoạt động được. Đặc biệt, module NLP Service vượt xa thiết kế ban đầu khi tích hợp thêm Gemini và Claude làm fallback.

Những điểm cần tập trung cải thiện nhất trước báo cáo cuối kỳ là:

- Kết nối chatbot với gợi ý sản phẩm thực tế trong kho (UC-02 – nghiệp vụ trọng tâm của đề tài).
- Hoàn thiện Admin Dashboard với chức năng quản lý sản phẩm và đơn hàng thực sự.
- Mở rộng knowledge base đủ 50+ bệnh như cam kết trong hướng phát triển.
- Viết test tự động để đảm bảo độ ổn định khi demo.

> 📊 **ĐÁNH GIÁ TỔNG THỂ:** Mức hoàn thiện so với yêu cầu báo cáo giữa kỳ: khoảng **65–70%**. Đây là tiến độ tốt cho giai đoạn này. Với 4–6 ngày tập trung vào các hạng mục ưu tiên cao, dự án có thể đạt **85–90% hoàn thiện** trước báo cáo cuối kỳ.

---

*Báo cáo được tạo tự động dựa trên phân tích source code – Tháng 6/2026*
