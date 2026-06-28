from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    symptoms = Column(Text) # Các triệu chứng liên quan (comma separated hoặc JSON)
    recommended_drugs = Column(String) # ID hoặc tên thuốc khuyên dùng
