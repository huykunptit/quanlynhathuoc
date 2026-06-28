from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    image_url = Column(String)
    indications = Column(String) # Chỉ định (dùng để gợi ý thuốc)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    active_ingredient = Column(String, nullable=True)     # Hoạt chất chính
    contraindications = Column(Text, nullable=True)       # Chống chỉ định
    dosage = Column(Text, nullable=True)                  # Liều dùng
    is_active = Column(Boolean, default=True)             # Cho phép ẩn sản phẩm thay vì xóa hẳn

    category = relationship("Category")

