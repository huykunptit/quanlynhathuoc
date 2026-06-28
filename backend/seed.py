import os
from sqlalchemy.orm import Session
from app.database import engine, Base
from app.models.user import User
from app.models.product import Product
from app.models.disease import Disease
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as db:
        # Xóa các sản phẩm cũ (nếu có) để seed mới đẹp hơn
        db.query(Product).delete()
        db.query(Disease).delete()
        db.commit()

        # Seed Users
        if db.query(User).first() is None:
            admin = User(email="admin@example.com", hashed_password=get_password_hash("admin123"), full_name="Admin User", is_admin=True)
            user = User(email="user@example.com", hashed_password=get_password_hash("user123"), full_name="Test User", is_admin=False)
            db.add_all([admin, user])
            db.commit()
            print("Seeded users.")

        # Seed 50 realistic products
        products = [
            # Chăm sóc cá nhân
            Product(name="Nước súc miệng Listerine Cool Mint (Chai 750ml)", price=135000, stock=150, indications="Chăm sóc cá nhân", description="Nước súc miệng diệt khuẩn, mang lại hơi thở thơm mát."),
            Product(name="Dung dịch vệ sinh phụ nữ Dạ Hương (Chai 100ml)", price=33000, stock=400, indications="Chăm sóc cá nhân", description="Dung dịch vệ sinh làm sạch nhẹ nhàng, khử mùi hôi."),
            Product(name="Bông tẩy trang Silcot cơ bản (Hộp 82 miếng)", price=35000, stock=200, indications="Chăm sóc cá nhân", description="Bông tẩy trang mềm mịn không xơ bông xuất xứ Nhật Bản."),
            Product(name="Băng vệ sinh Diana Sensi siêu mỏng không cánh (Gói 8 miếng)", price=18000, stock=500, indications="Chăm sóc cá nhân", description="Băng vệ sinh mỏng nhẹ, thấm hút tốt."),
            Product(name="Kem đánh răng P/S Bảo vệ 123 (Tuýp 240g)", price=38000, stock=300, indications="Chăm sóc cá nhân", description="Bảo vệ nướu, ngừa sâu răng."),
            Product(name="Nước rửa tay Lifebuoy bảo vệ vượt trội (Chai 500g)", price=65000, stock=200, indications="Chăm sóc cá nhân", description="Nước rửa tay diệt 99.9% vi khuẩn."),
            Product(name="Sữa tắm gội thảo dược Yaocare cho bé (Chai 250ml)", price=150000, stock=100, indications="Chăm sóc cá nhân", description="Làm sạch an toàn, ngừa rôm sảy cho bé."),
            Product(name="Dầu gội trị gàu Selsun (Chai 100ml)", price=85000, stock=150, indications="Chăm sóc cá nhân", description="Dầu gội trị nấm, trị gàu hiệu quả."),
            Product(name="Xịt khử mùi Nivea Men phân tử bạc (Chai 150ml)", price=90000, stock=120, indications="Chăm sóc cá nhân", description="Xịt ngăn mùi cơ thể cho nam giới."),
            Product(name="Dao cạo râu Gillette Vector (1 cán + 1 lưỡi)", price=30000, stock=400, indications="Chăm sóc cá nhân", description="Dao cạo râu sát, an toàn."),
            
            # Dược mỹ phẩm
            Product(name="Sữa rửa mặt Cetaphil Gentle Skin Cleanser (Chai 500ml)", price=330000, stock=120, indications="Dược mỹ phẩm", description="Sữa rửa mặt dịu nhẹ, phù hợp mọi loại da kể cả da nhạy cảm."),
            Product(name="Kem bôi trị sẹo Dermatix Ultra (Tuýp 15g)", price=310000, stock=80, indications="Dược mỹ phẩm", description="Kem làm mờ sẹo lâm sàng tiên tiến."),
            Product(name="Nước tẩy trang Bioderma Sensibio H2O (Chai 500ml)", price=450000, stock=60, indications="Dược mỹ phẩm", description="Tẩy trang làm dịu da cho da nhạy cảm."),
            Product(name="Kem chống nắng La Roche-Posay Anthelios UV Mune 400 (Tuýp 50ml)", price=420000, stock=100, indications="Dược mỹ phẩm", description="Chống nắng quang phổ rộng, kiểm soát nhờn."),
            Product(name="Xịt khoáng Vichy Mineralizing Thermal Water (Chai 300ml)", price=290000, stock=80, indications="Dược mỹ phẩm", description="Cấp ẩm, làm dịu da tức thì."),
            Product(name="Kem dưỡng ẩm Cerave Moisturizing Cream (Hũ 453g)", price=380000, stock=50, indications="Dược mỹ phẩm", description="Dưỡng ẩm phục hồi hàng rào bảo vệ da."),
            Product(name="Serum cấp ẩm Hylauronic Acid B5 La Roche-Posay (Chai 30ml)", price=850000, stock=40, indications="Dược mỹ phẩm", description="Serum phục hồi và chống nhăn da."),
            Product(name="Gel trị mụn Megaduo (Tuýp 15g)", price=105000, stock=200, indications="Dược mỹ phẩm", description="Giảm mụn, mờ thâm."),
            Product(name="Sữa dưỡng thể Eucerin pH5 (Chai 400ml)", price=220000, stock=60, indications="Dược mỹ phẩm", description="Dưỡng thể cho da nhạy cảm."),
            Product(name="Son dưỡng ẩm Omi Menturm (Thỏi 4g)", price=45000, stock=300, indications="Dược mỹ phẩm", description="Son dưỡng chống khô môi."),

            # Thực phẩm chức năng
            Product(name="Viên uống DHC Vitamin C trắng da, tăng sức đề kháng (Gói 60 viên)", price=145000, stock=150, indications="Thực phẩm chức năng", description="Viên uống bổ sung vitamin C giúp sáng da, tăng miễn dịch."),
            Product(name="Thực phẩm chức năng Blackmores Fish Oil 1000 (Lọ 400 viên)", price=590000, stock=100, indications="Thực phẩm chức năng", description="Dầu cá không mùi bổ sung Omega 3 tốt cho tim mạch và não bộ."),
            Product(name="Viên uống bổ mắt Wit (Lọ 30 viên)", price=330000, stock=80, indications="Thực phẩm chức năng", description="Hỗ trợ giảm mỏi mắt, tăng thị lực."),
            Product(name="Hoạt huyết dưỡng não Traphaco (Hộp 5 vỉ x 20 viên)", price=95000, stock=200, indications="Thực phẩm chức năng", description="Tăng tuần hoàn máu não, cải thiện trí nhớ."),
            Product(name="Viên sủi Plusssz Max Multivitamin (Tuýp 20 viên)", price=42000, stock=300, indications="Thực phẩm chức năng", description="Bổ sung đa vitamin, tăng cường thể lực."),
            Product(name="Men vi sinh BioGaia Protectis Baby Drops (Tuýp 5ml)", price=415000, stock=50, indications="Thực phẩm chức năng", description="Men vi sinh nhập khẩu Thụy Điển hỗ trợ hệ tiêu hóa trẻ em."),
            Product(name="Vitamin E 400 IU Puritan's Pride (Lọ 100 viên)", price=250000, stock=70, indications="Thực phẩm chức năng", description="Chống oxy hóa, làm đẹp da."),
            Product(name="Viên uống bổ xương khớp Glucosamine Orihiro (Lọ 900 viên)", price=650000, stock=40, indications="Thực phẩm chức năng", description="Hỗ trợ sụn khớp, giảm đau nhức."),
            Product(name="Collagen Youtheory Type 1 2 & 3 (Lọ 390 viên)", price=680000, stock=30, indications="Thực phẩm chức năng", description="Ngăn ngừa lão hóa, đẹp da, tóc, móng."),
            Product(name="Viên uống giải độc gan Boganic (Hộp 50 viên)", price=75000, stock=150, indications="Thực phẩm chức năng", description="Bảo vệ gan, thanh nhiệt giải độc."),

            # Thiết bị y tế
            Product(name="Băng cá nhân Urgo Transparent (Hộp 100 miếng)", price=45000, stock=300, indications="Thiết bị y tế", description="Băng keo cá nhân trong suốt, chống nước."),
            Product(name="Bao cao su Durex Performa kéo dài thời gian (Hộp 12 cái)", price=245000, stock=200, indications="Thiết bị y tế", description="Bao cao su kéo dài thời gian quan hệ."),
            Product(name="Nhiệt kế điện tử Omron MC-246", price=95000, stock=100, indications="Thiết bị y tế", description="Đo nhiệt độ nhanh chóng, chính xác."),
            Product(name="Máy đo huyết áp bắp tay Omron HEM-7120", price=850000, stock=20, indications="Thiết bị y tế", description="Theo dõi huyết áp tại nhà."),
            Product(name="Que test thai Quickstick", price=20000, stock=500, indications="Thiết bị y tế", description="Phát hiện thai sớm, chính xác."),
            Product(name="Khẩu trang y tế 4 lớp Famapro (Hộp 50 cái)", price=45000, stock=400, indications="Thiết bị y tế", description="Khẩu trang kháng khuẩn 4 lớp."),
            Product(name="Nước muối sinh lý Vĩnh Phúc (Natri Clorid 0.9%) (Chai 500ml)", price=5000, stock=1000, indications="Thiết bị y tế", description="Nước súc miệng, nhỏ mắt, vệ sinh mũi họng an toàn."),
            Product(name="Cồn y tế 70 độ (Chai 500ml)", price=25000, stock=200, indications="Thiết bị y tế", description="Sát trùng ngoài da, khử khuẩn."),
            Product(name="Gạc y tế tiệt trùng Bảo Thạch (Túi 10 miếng)", price=8000, stock=300, indications="Thiết bị y tế", description="Băng bó vết thương an toàn."),
            Product(name="Máy đo đường huyết Accu-Chek Instant", price=1200000, stock=15, indications="Thiết bị y tế", description="Đo đường huyết nhanh chóng."),

            # Thuốc và giảm đau (nhóm chung)
            Product(name="Viên uống Panadol Extra Đỏ giảm đau, hạ sốt (Vỉ 15 viên)", price=22000, stock=500, indications="Giảm đau", description="Panadol Extra đỏ với Paracetamol và Caffein giúp giảm đau nhanh chóng."),
            Product(name="Kẹo ngậm ho Bảo Thanh (Hộp 20 viên)", price=32000, stock=300, indications="Giảm đau", description="Kẹo ngậm thảo dược giảm ho, dịu cổ họng hiệu quả."),
            Product(name="Thuốc nhỏ mắt V.Rohto Vitamin (Lọ 13ml)", price=49000, stock=250, indications="Giảm đau", description="Bổ sung vitamin, giảm mỏi mắt, đỏ mắt."),
            Product(name="Siro ho Prospan cho trẻ em (Chai 100ml)", price=75000, stock=150, indications="Giảm đau", description="Siro ho chiết xuất lá thường xuân, an toàn cho trẻ em."),
            Product(name="Miếng dán hạ sốt KoolFever (Hộp 6 miếng)", price=65000, stock=200, indications="Giảm đau", description="Miếng dán giảm sốt nhanh chóng cho trẻ."),
            Product(name="Cao xoa bóp Sao Vàng (Hộp 4g)", price=10000, stock=500, indications="Giảm đau", description="Trị nhức đầu, côn trùng cắn."),
            Product(name="Thuốc tiêu hóa Smecta (Hộp 30 gói)", price=120000, stock=100, indications="Giảm đau", description="Điều trị tiêu chảy cấp và mãn tính."),
            Product(name="Thuốc nhỏ mũi Otryvin 0.05% (Chai 10ml)", price=48000, stock=150, indications="Giảm đau", description="Giảm nghẹt mũi, sổ mũi."),
            Product(name="Viên ngậm trị viêm họng Strepsils (Hộp 100 viên)", price=150000, stock=80, indications="Giảm đau", description="Sát khuẩn hầu họng, giảm ho."),
            Product(name="Thuốc sát trùng Betadine (Chai 125ml)", price=65000, stock=100, indications="Giảm đau", description="Sát khuẩn vết thương ngoài da.")
        ]
        db.add_all(products)
        db.commit()
        print("Seeded realistic products.")

        # Seed Diseases (Giữ nguyên)
        diseases = [
            Disease(name="Cảm cúm", description="Bệnh viêm đường hô hấp cấp tính", symptoms="sốt, ho, đau đầu, sổ mũi", recommended_drugs="Panadol Extra Đỏ, Kẹo ngậm ho Bảo Thanh, Siro ho Prospan"),
            Disease(name="Viêm mũi dị ứng", description="Tình trạng viêm niêm mạc mũi", symptoms="hắt hơi, sổ mũi, ngứa mũi", recommended_drugs="Nước muối sinh lý Vĩnh Phúc, Otryvin"),
            Disease(name="Mỏi mắt", description="Tình trạng nhức mỏi do nhìn máy tính nhiều", symptoms="khô mắt, đỏ mắt, nhức mắt", recommended_drugs="V.Rohto Vitamin, Viên uống bổ mắt Wit"),
            Disease(name="Đau nhức cơ khớp", description="Tình trạng đau mỏi xương khớp", symptoms="đau khớp, nhức mỏi cơ", recommended_drugs="Glucosamine Orihiro, Cao xoa bóp Sao Vàng"),
        ]
        db.add_all(diseases)
        db.commit()
        print("Seeded diseases.")

if __name__ == "__main__":
    seed_data()
    print("Seeding completed!")
