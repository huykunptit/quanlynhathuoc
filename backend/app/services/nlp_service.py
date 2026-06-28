import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import openai
import google.generativeai as genai
import anthropic
import os
from sqlalchemy.orm import Session
from app.models import Disease

class NLPService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words=None, max_features=1000)
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
        self.diseases = db.query(Disease).all()
        if not self.diseases:
            return
            
        corpus = [d.symptoms.lower() for d in self.diseases if d.symptoms]
        if corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def diagnose_rule_based(self, user_text: str, threshold: float = 0.2):
        """Sử dụng TF-IDF và Cosine Similarity để chẩn đoán"""
        if self.tfidf_matrix is None or not self.diseases:
            return None, 0.0

        user_vec = self.vectorizer.transform([user_text.lower()])
        similarities = cosine_similarity(user_vec, self.tfidf_matrix).flatten()
        
        best_match_idx = np.argmax(similarities)
        best_score = similarities[best_match_idx]

        if best_score >= threshold:
            best_disease = self.diseases[best_match_idx]
            return best_disease, best_score
            
        return None, best_score

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
        disease, score = self.diagnose_rule_based(user_text)
        
        if disease:
            reply = f"Dựa trên triệu chứng của bạn, tôi dự đoán bạn có thể bị **{disease.name}**.\n\n"
            reply += f"- **Thông tin**: {disease.description}\n"
            if disease.recommended_drugs:
                reply += f"- **Gợi ý sản phẩm**: Dựa trên phân tích, bạn có thể tham khảo các sản phẩm chứa `{disease.recommended_drugs}`. Vui lòng tham khảo ý kiến bác sĩ trước khi sử dụng."
            return reply, score
            
        # 2. Fallback to LLM
        if self.llm_provider == "gemini":
            reply, llm_score = self.diagnose_gemini(user_text)
        elif self.llm_provider == "anthropic":
            reply, llm_score = self.diagnose_anthropic(user_text)
        else:
            reply, llm_score = self.diagnose_openai(user_text)
            
        return reply, llm_score

nlp_service = NLPService()
