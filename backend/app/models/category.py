from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)        # "Chăm sóc cá nhân", "Dược mỹ phẩm"...
    slug = Column(String, unique=True)                         # "cham-soc-ca-nhan"
    description = Column(Text, nullable=True)
