from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Có thể null nếu chat ẩn danh
    session_id = Column(String, index=True)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    confidence = Column(String) # Lưu độ tin cậy hoặc thông tin chẩn đoán
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
