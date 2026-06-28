# KẾ HOẠCH HOÀN THIỆN DỰ ÁN (BẢN CẬP NHẬT)
## Đề tài 6: Hệ thống Nhà thuốc Trực tuyến tích hợp Chatbot Chẩn đoán Bệnh

Kế hoạch này được xây dựng dựa trên kết quả đánh giá hiện trạng source code tại file [Phân_tích_source_code_quanlynhathuoc.md](file:///C:/Users/Administrator/Downloads/QuantlyNhathuoc/Phân_tích_source_code_quanlynhathuoc.md), tập trung khắc phục các lỗi bảo mật, hoàn thiện các luồng nghiệp vụ còn thiếu (đặc biệt là tích hợp chẩn đoán - gợi ý thuốc) và chuẩn bị hệ thống sẵn sàng cho buổi báo cáo cuối kỳ.

---

## 1. PHÂN CHIA NHIỆM VỤ THEO GIAI ĐOẠN (ROADMAP)

### GIAI ĐOẠN 1: CÁC NHIỆM VỤ ƯU TIÊN CAO (Hoàn thành trong 2-3 ngày)
*Đây là nhóm chức năng cốt lõi bắt buộc phải có để hệ thống đáp ứng đúng mô tả nghiệp vụ của đề tài.*

#### 1.1. Tích hợp chẩn đoán bệnh với gợi ý thuốc thực tế (UC-02)
* **Hiện trạng**: Chatbot trả về chẩn đoán và chuỗi text tên thuốc khuyên dùng (`recommended_drugs` trong DB), chưa liên kết hay trả về đối tượng sản phẩm thực tế trong kho.
* **Giải pháp**:
  * Cập nhật `ChatResponse` schema trong backend để chứa thêm danh sách sản phẩm gợi ý: `recommended_products: List[ProductResponse]`.
  * Trong `nlp_service.py` hoặc `chatbot.py` router, khi tìm được bệnh (`Disease`), thực hiện truy vấn DB tìm các `Product` có trường `indications` hoặc `name` tương thích với danh sách thuốc khuyên dùng.
  * Cập nhật component `ChatWidget.jsx` ở frontend để hiển thị danh sách thuốc gợi ý dưới dạng các thẻ sản phẩm nhỏ (có tên, giá, ảnh, và nút **"Thêm vào giỏ"** nhanh).

#### 1.2. Thêm CRUD Admin cho Sản phẩm & Bảo mật endpoint huấn luyện
* **Hiện trạng**: Admin chưa thể quản lý danh mục thuốc qua UI. Endpoint `/chat/train` đang mở tự do không có xác thực bảo mật.
* **Giải pháp**:
  * Tạo các endpoint mới trong `backend/app/routers/products.py`:
    * `POST /products/` (Tạo mới sản phẩm)
    * `PUT /products/{id}` (Cập nhật giá, mô tả, tồn kho)
    * `DELETE /products/{id}` (Xóa/ẩn sản phẩm)
  * Viết decorator guard kiểm tra quyền admin (`is_admin`) trên các endpoint này và endpoint `/chat/train`.

#### 1.3. Cải tiến Orders & Checkout
* **Hiện trạng**: Bảng `orders` thiếu các thông tin giao hàng cơ bản như địa chỉ giao hàng và phương thức thanh toán.
* **Giải pháp**:
  * Thực hiện Alembic migration hoặc cập nhật trực tiếp DB model `Order` để bổ sung cột `shipping_address` (string) và `payment_method` (string).
  * Cập nhật frontend trang giỏ hàng [cart.js](file:///C:/Users/Administrator/Downloads/QuantlyNhathuoc/frontend/src/pages/cart.js) để thêm form nhập Địa chỉ giao hàng và chọn Phương thức thanh toán (COD hoặc Chuyển khoản) khi bấm Thanh toán.

#### 1.4. Đưa số liệu thật vào Admin Dashboard
* **Hiện trạng**: Số liệu tại [admin/dashboard.js](file:///C:/Users/Administrator/Downloads/QuantlyNhathuoc/frontend/src/pages/admin/dashboard.js) hoàn toàn là dữ liệu tĩnh (hardcode).
* **Giải pháp**:
  * Tạo API endpoint tổng hợp số liệu cho Admin: `GET /admin/stats` (thống kê tổng doanh thu, số đơn hàng, số khách hàng, danh sách đơn hàng mới).
  * Viết code frontend fetch dữ liệu từ endpoint này để đổ vào giao diện quản lý.

---

### GIAI ĐOẠN 2: CÁC CẢI TIẾN TRUNG BÌNH (Hoàn thành trong 1-2 ngày)
*Nhóm nhiệm vụ này giúp tăng chất lượng trải nghiệm người dùng (UX) và tối ưu cấu trúc mã nguồn.*

#### 2.1. Quản lý lịch sử đơn hàng của User ở Frontend
* **Giải pháp**:
  * Tạo giao diện trang `/orders` (hoặc `/profile`) phía khách hàng để hiển thị danh sách các đơn hàng họ đã đặt kèm trạng thái đơn hàng (Đang xử lý, Đang giao, Đã giao, Đã hủy).
  * Cho phép khách hàng nhấn vào từng đơn hàng để xem chi tiết các mặt hàng đã mua.

#### 2.2. Loại bỏ Hardcode API URL ở Frontend
* **Giải pháp**:
  * Tạo file `.env.local` ở thư mục gốc frontend với nội dung:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```
  * Tìm kiếm và thay thế toàn bộ chuỗi `http://localhost:8000` trong các file Next.js bằng `process.env.NEXT_PUBLIC_API_URL` để dễ dàng cấu hình deploy sau này.

#### 2.3. Bổ sung các Cảnh báo Y tế & Tương tác thuốc cơ bản
* **Giải pháp**:
  * Thêm disclaimer y tế cố định dưới widget chat: *"Lưu ý: Kết quả chẩn đoán của chatbot chỉ mang tính chất tham khảo, không thay thế cho chỉ định của bác sĩ chuyên khoa."*
  * Thêm các trường cảnh báo chống chỉ định (ví dụ: *"Không dùng cho phụ nữ có thai"*) vào chi tiết sản phẩm thuốc.

---

### GIAI ĐOẠN 3: KIỂM THỬ & ĐÓNG GÓI BẢO MẬT (Hoàn thành trong 1 ngày)
*Nâng cấp bảo mật sản xuất và viết các kịch bản kiểm thử tự động.*

#### 3.1. Viết Test Suite tự động
* **Giải pháp**:
  * Tạo thư mục `backend/tests/` và viết các kịch bản test sử dụng thư viện `pytest` và `httpx.AsyncClient`.
  * Viết unit test kiểm thử độ chính xác của hàm NLP chẩn đoán bệnh `nlp_service.py`.
  * Viết integration test cho API giỏ hàng và đặt hàng (đảm bảo việc đặt hàng làm trừ tồn kho chính xác, đặt hàng vượt quá tồn kho phải báo lỗi).

#### 3.2. Cải tiến bảo mật lưu trữ Token JWT
* **Giải pháp**: 
  * Cân nhắc chuyển cơ chế lưu trữ JWT token từ `localStorage` (dễ bị tấn công XSS) sang lưu trữ bằng `HttpOnly Cookie` được thiết lập trực tiếp từ backend khi đăng nhập thành công.

---

## 2. DỰ KIẾN KẾT QUẢ ĐẠT ĐƯỢC SAU KHI HOÀN THÀNH

| Mảng chức năng | Hiện tại | Mục tiêu hoàn thiện |
|---|---|---|
| **Chatbot chẩn đoán** | Trả về văn bản đơn thuần | Tự động trả kèm danh sách thuốc thực tế trong kho có thể mua ngay |
| **Giao diện Admin** | Hardcode tĩnh 100% | Lấy dữ liệu thật từ DB, thực hiện được CRUD sản phẩm trực tiếp |
| **Hệ thống đặt hàng** | Không lưu địa chỉ nhận | Lưu đầy đủ địa chỉ giao nhận và phương thức thanh toán |
| **Mức độ bảo mật** | Trung bình | Bảo vệ toàn diện các API quản trị, rate-limiting cơ bản |
| **Độ ổn định** | Chưa được kiểm thử | Có bộ unit & integration tests chạy tự động trước khi demo |

---

*Kế hoạch này sẽ được dùng làm kim chỉ nam thực hiện mã hóa chi tiết cho các bước tiếp theo.*
