from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, database
from app.routers.auth import get_current_user
from app.services.nlp_service import nlp_service
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter(
    prefix="/chat",
    tags=["Chatbot"]
)

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None # Để track lịch sử hội thoại nếu user chưa đăng nhập

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    confidence: float

@router.post("/", response_model=ChatResponse)
def chat_with_bot(
    chat_msg: ChatMessage, 
    db: Session = Depends(database.get_db),
    # Cho phép gọi API mà không cần đăng nhập (khách vãng lai cũng được chat)
):
    session_id = chat_msg.session_id if chat_msg.session_id else str(uuid.uuid4())
    user_text = chat_msg.message.strip()
    
    if not user_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    # Gọi service xử lý
    reply, confidence = nlp_service.get_diagnosis(user_text, db)
    
    # Lưu vào DB
    history = models.ChatHistory(
        session_id=session_id,
        user_message=user_text,
        bot_response=reply,
        confidence=str(confidence)
    )
    db.add(history)
    db.commit()
    
    return ChatResponse(
        reply=reply,
        session_id=session_id,
        confidence=confidence
    )

@router.post("/train")
def trigger_training(db: Session = Depends(database.get_db)):
    """API ẩn để re-train model (thường dành cho Admin)"""
    nlp_service.train_or_update(db)
    return {"message": "Model retrained successfully"}
