from app.database import SessionLocal
from app.services.nlp_service import NLPService
from dotenv import load_dotenv
load_dotenv()
import os
import traceback

def run():
    db = SessionLocal()
    nlp = NLPService()
    print("Provider:", nlp.llm_provider)
    try:
        reply, score = nlp.get_diagnosis("tôi bị đau bụng dữ dội và nôn mửa liên tục", db)
        print("Reply:", reply)
        print("Score:", score)
    except Exception as e:
        print("Exception in get_diagnosis:")
        traceback.print_exc()
    db.close()

if __name__ == "__main__":
    run()
