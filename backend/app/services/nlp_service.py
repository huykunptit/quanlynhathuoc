import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import openai
import google.generativeai as genai
import anthropic
import os
import logging
from sqlalchemy.orm import Session
from app.models import Disease

logger = logging.getLogger(__name__)
MEDICAL_DISCLAIMER = "\n\n⚠️ *Lưu ý: Kết quả chẩn đoán của chatbot chỉ mang tính chất tham khảo, không thay thế cho chỉ định của bác sĩ chuyên khoa. Vui lòng đến cơ sở y tế gần nhất nếu triệu chứng nghiêm trọng.*"

class NLPService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words=None,
            max_features=5000,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.tfidf_matrix = None
        self.diseases = []
        
        # LLM config
        self.llm_provider = os.getenv("LLM_PROVIDER", "openai").lower()
        
        # OpenAI
        openai.api_key = os.getenv("OPENAI_API_KEY", "")
        
        # Gemini
        genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
        
        # Anthropic
        self.anthropic_client = None
        if os.getenv("ANTHROPIC_API_KEY") and os.getenv("ANTHROPIC_API_KEY") != "placeholder":
            self.anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    def train_or_update(self, db: Session):
        """Huấn luyện mô hình TF-IDF dựa trên dữ liệu bệnh từ database"""
        db_diseases = db.query(Disease).all()
        if not db_diseases:
            return
            
        self.diseases = []
        corpus = []
        for d in db_diseases:
            self.diseases.append({
                "id": d.id,
                "name": d.name,
                "description": d.description,
                "symptoms": d.symptoms,
                "recommended_drugs": d.recommended_drugs
            })
            if d.symptoms:
                corpus.append(d.symptoms.lower())
                
        if corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def diagnose_rule_based(self, user_text: str, threshold: float = 0.15):
        """Sử dụng TF-IDF và Cosine Similarity để chẩn đoán"""
        if self.tfidf_matrix is None or not self.diseases:
            return [], 0.0

        user_vec = self.vectorizer.transform([user_text.lower()])
        similarities = cosine_similarity(user_vec, self.tfidf_matrix).flatten()
        
        if len(similarities) == 0:
            return [], 0.0
            
        top_k = min(3, len(self.diseases))
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        top_diseases = []
        for idx in top_indices:
            if similarities[idx] >= threshold:
                top_diseases.append((self.diseases[idx], similarities[idx]))
                
        if top_diseases:
            return top_diseases, top_diseases[0][1]
            
        return [], similarities[np.argmax(similarities)]

    def diagnose_openai(self, user_text: str):
        """Fallback: Sử dụng OpenAI API để chẩn đoán"""
        if not openai.api_key or openai.api_key == "sk-placeholder":
            return "Tôi không thể nhận diện được triệu chứng này. Xin vui lòng mô tả chi tiết hơn (ví dụ: đau đầu, sổ mũi, khó tiêu).", 0.0
            
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Bạn là một trợ lý y tế ảo. Dựa trên triệu chứng của người dùng, hãy đưa ra chẩn đoán dự đoán sơ bộ ngắn gọn và một lời khuyên nhỏ. Cảnh báo rằng đây không phải chẩn đoán y khoa chính thức."},
                    {"role": "user", "content": f"Triệu chứng của tôi là: {user_text}"}
                ],
                max_tokens=150,
                temperature=0.3
            )
            bot_reply = response.choices[0].message['content'].strip()
            return bot_reply, 1.0 
        except Exception as e:
            return f"Hệ thống OpenAI đang bảo trì. Vui lòng thử lại sau. (Lỗi: {str(e)})", 0.0

    def diagnose_gemini(self, user_text: str):
        """Fallback: Sử dụng Google Gemini API để chẩn đoán"""
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "placeholder":
            return "Tôi không thể nhận diện được triệu chứng này. (Gemini API chưa được cấu hình).", 0.0
            
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
            prompt = f"Bạn là một trợ lý y tế ảo. Dựa trên triệu chứng của người dùng, hãy đưa ra chẩn đoán dự đoán sơ bộ ngắn gọn và một lời khuyên nhỏ. Cảnh báo rằng đây không phải chẩn đoán y khoa chính thức. Triệu chứng: {user_text}"
            response = model.generate_content(prompt)
            return response.text.strip(), 1.0
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "Quota exceeded" in error_msg:
                return "Bạn đang chat quá nhanh (Vượt giới hạn 5 tin nhắn/phút của gói Gemini miễn phí). Vui lòng đợi khoảng 30 giây rồi thử lại nhé!", 0.0
            return f"Hệ thống Gemini đang bảo trì. Vui lòng thử lại sau. (Lỗi: {error_msg})", 0.0

    def diagnose_anthropic(self, user_text: str):
        """Fallback: Sử dụng Anthropic Claude API để chẩn đoán"""
        if not self.anthropic_client:
            return "Tôi không thể nhận diện được triệu chứng này. (Anthropic API chưa được cấu hình).", 0.0
            
        try:
            message = self.anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=150,
                temperature=0.3,
                system="Bạn là một trợ lý y tế ảo. Dựa trên triệu chứng của người dùng, hãy đưa ra chẩn đoán dự đoán sơ bộ ngắn gọn và một lời khuyên nhỏ. Cảnh báo rằng đây không phải chẩn đoán y khoa chính thức.",
                messages=[
                    {"role": "user", "content": f"Triệu chứng của tôi là: {user_text}"}
                ]
            )
            return message.content[0].text.strip(), 1.0
        except Exception as e:
            return f"Hệ thống Claude đang bảo trì. Vui lòng thử lại sau. (Lỗi: {str(e)})", 0.0

    def get_diagnosis(self, user_text: str, db: Session):
        # Đảm bảo model đã được train với dữ liệu mới nhất
        if self.tfidf_matrix is None:
            self.train_or_update(db)

        # 1. Rule-based / TF-IDF
        top_diseases, score = self.diagnose_rule_based(user_text)
        
        if top_diseases:
            best_disease = top_diseases[0][0]
            reply = f"Dựa trên triệu chứng của bạn, tôi dự đoán bạn có thể bị **{best_disease['name']}**.\n\n"
            reply += f"- **Thông tin**: {best_disease['description']}\n"
            
            if len(top_diseases) > 1:
                other_names = [d['name'] for d, s in top_diseases[1:]]
                reply += f"- **Các khả năng khác**: {', '.join(other_names)}\n"
            
            recommended_products = []
            if best_disease['recommended_drugs']:
                reply += f"- **Gợi ý sản phẩm**: Dựa trên phân tích, bạn có thể tham khảo các sản phẩm chứa `{best_disease['recommended_drugs']}`. Vui lòng tham khảo ý kiến bác sĩ trước khi sử dụng."
                
                # Fetch matching products from DB
                from sqlalchemy import or_
                from app import models
                drugs_list = [d.strip() for d in best_disease['recommended_drugs'].split(",") if d.strip()]
                if drugs_list:
                    conditions = []
                    for drug in drugs_list:
                        conditions.append(models.Product.name.ilike(f"%{drug}%"))
                    recommended_products = db.query(models.Product).filter(or_(*conditions)).all()
            
            return reply + MEDICAL_DISCLAIMER, score, recommended_products
            
        # 2. Fallback to LLM
        if self.llm_provider == "gemini":
            reply, llm_score = self.diagnose_gemini(user_text)
        elif self.llm_provider == "anthropic":
            reply, llm_score = self.diagnose_anthropic(user_text)
        else:
            reply, llm_score = self.diagnose_openai(user_text)
            
        return reply + MEDICAL_DISCLAIMER, llm_score, []

nlp_service = NLPService()
