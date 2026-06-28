from dotenv import load_dotenv
load_dotenv()
import os
from app.services.nlp_service import NLPService

service = NLPService()
try:
    print(service.diagnose_gemini("ho, có đờm"))
except Exception as e:
    import traceback
    traceback.print_exc()
