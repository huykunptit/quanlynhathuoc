import pandas as pd
from deep_translator import GoogleTranslator
from sqlalchemy.orm import Session
from app.database import engine, Base
from app.models.disease import Disease
import time

def translate_symptom2disease(db: Session):
    print("🔄 Đang xử lý Symptom2Disease.csv...")
    try:
        df = pd.read_csv("datasets/Symptom2Disease.csv")
        # Lấy 3 mẫu câu triệu chứng đại diện cho mỗi bệnh để tránh dịch quá lâu
        df_sampled = df.groupby('label').head(3).reset_index(drop=True)
        
        translator = GoogleTranslator(source='en', target='vi')
        
        count = 0
        for label, group in df_sampled.groupby('label'):
            try:
                vi_name = translator.translate(label)
                time.sleep(0.5)
                
                symptoms_en = " | ".join(group['text'].astype(str).tolist())
                vi_symptoms = translator.translate(symptoms_en)
                time.sleep(0.5)
                
                # Lưu vào DB
                existing = db.query(Disease).filter(Disease.name == vi_name).first()
                if existing:
                    existing.symptoms += " | " + vi_symptoms
                else:
                    disease = Disease(
                        name=vi_name,
                        description=f"Bệnh: {vi_name} (Từ Symptom2Disease)",
                        symptoms=vi_symptoms,
                        recommended_drugs=""
                    )
                    db.add(disease)
                count += 1
                print(f"  + Dịch thành công: {label} -> {vi_name}")
            except Exception as e:
                print(f"  - Lỗi dịch {label}: {e}")
                
        db.commit()
        print(f"✅ Đã thêm {count} bệnh từ Symptom2Disease (Bản dịch Tiếng Việt).")
    except Exception as e:
        print(f"❌ Lỗi xử lý Symptom2Disease: {e}")

def add_mock_vietnamese_data(db: Session):
    print("\n🔄 Đang thêm kho dữ liệu y tế mở rộng (Mock Crawled Data)...")
    
    # 50 bệnh bổ sung với triệu chứng chi tiết
    extra_diseases = [
        ("Viêm màng não", "Đau đầu dữ dội, sốt cao, cứng gáy, buồn nôn, nhạy cảm với ánh sáng"),
        ("Sốt rét", "Sốt cao từng cơn, ớn lạnh, vã mồ hôi, đau đầu, mệt mỏi"),
        ("Viêm gan B", "Vàng da, vàng mắt, nước tiểu sẫm màu, chán ăn, mệt mỏi kéo dài"),
        ("Viêm gan C", "Mệt mỏi, chán ăn, buồn nôn, đau nhức cơ khớp, vàng da"),
        ("Sỏi mật", "Đau quặn bụng trên bên phải, buồn nôn, đầy hơi, khó tiêu"),
        ("Viêm loét dạ dày", "Đau thượng vị, ợ hơi, ợ chua, buồn nôn, chán ăn, sụt cân"),
        ("Trào ngược dạ dày thực quản (GERD)", "Ợ chua, nóng rát sau xương ức, buồn nôn, viêm họng mãn tính, ho khan"),
        ("Hội chứng ruột kích thích (IBS)", "Đau bụng, co thắt ruột, đầy hơi, tiêu chảy xen lẫn táo bón"),
        ("Viêm đại tràng", "Đau quặn bụng dọc khung đại tràng, đi ngoài phân nhầy máu, mót rặn"),
        ("Bệnh Crohn", "Đau bụng, tiêu chảy kéo dài, sụt cân, mệt mỏi, sốt"),
        ("Hen suyễn", "Khó thở, thở khò khè, tức ngực, ho nhiều về đêm và sáng sớm"),
        ("Bệnh phổi tắc nghẽn mãn tính (COPD)", "Khó thở khi gắng sức, ho có đờm mãn tính, thở khò khè, tức ngực"),
        ("Viêm phổi", "Sốt cao, ớn lạnh, ho có đờm xanh hoặc vàng, khó thở, đau ngực khi ho"),
        ("Lao phổi", "Ho kéo dài trên 2 tuần, ho ra máu, sốt nhẹ về chiều, sụt cân, đổ mồ hôi trộm"),
        ("Viêm amidan", "Đau họng, nuốt vướng, amindan sưng đỏ có mủ, sốt, hôi miệng"),
        ("Cường giáp", "Tim đập nhanh, sụt cân nhanh, run tay, đổ mồ hôi nhiều, lo âu, bướu cổ"),
        ("Suy giáp", "Mệt mỏi, tăng cân không rõ nguyên nhân, sợ lạnh, da khô, rụng tóc"),
        ("Đái tháo đường type 1", "Khát nước nhiều, đi tiểu nhiều, sụt cân nhanh, mệt mỏi, mờ mắt"),
        ("Đái tháo đường type 2", "Khát nước, tiểu nhiều, vết thương lâu lành, tê bì chân tay, mờ mắt"),
        ("Gout (Gút)", "Sưng đỏ, nóng, đau dữ dội ở khớp ngón chân cái, đau tăng vào ban đêm"),
        ("Thoái hóa khớp", "Đau nhức khớp khi vận động, cứng khớp buổi sáng, lục khục khi cử động"),
        ("Thoát vị đĩa đệm", "Đau nhức vùng lưng lan xuống chân, tê bì, yếu cơ, đau tăng khi cúi"),
        ("Loãng xương", "Đau mỏi xương khớp, giảm chiều cao, gù lưng, dễ gãy xương"),
        ("Thiếu máu cơ tim", "Đau thắt ngực, khó thở, hồi hộp, nhịp tim nhanh, mệt mỏi khi gắng sức"),
        ("Suy tim", "Khó thở khi nằm, phù chân, mệt mỏi, nhịp tim nhanh, ho khan về đêm"),
        ("Tăng huyết áp", "Đau đầu vùng chẩm, chóng mặt, ù tai, hoa mắt, đỏ bừng mặt"),
        ("Huyết áp thấp", "Hoa mắt, chóng mặt khi thay đổi tư thế, mệt mỏi, buồn nôn, lạnh chân tay"),
        ("Viêm bàng quang", "Tiểu buốt, tiểu rắt, đi tiểu nhiều lần, nước tiểu đục có máu, đau bụng dưới"),
        ("Viêm cầu thận", "Phù mặt, phù chân, tiểu ít, nước tiểu có bọt, tăng huyết áp"),
        ("Sỏi thận", "Đau quặn hố thắt lưng lan xuống bẹn, tiểu buốt, nước tiểu có máu, buồn nôn"),
        ("Bệnh lậu", "Tiểu buốt, chảy mủ niệu đạo, đau vùng chậu, sưng đau tinh hoàn"),
        ("Giang mai", "Săn giang mai (vết loét không đau), phát ban toàn thân, rụng tóc, mệt mỏi"),
        ("Sùi mào gà", "Nổi nốt sùi màu hồng nhạt ở cơ quan sinh dục, ngứa ngáy, chảy máu khi cọ xát"),
        ("Nấm Candida", "Ngứa rát vùng kín, khí hư màu trắng đục như bã đậu, tiểu buốt, đau khi quan hệ"),
        ("Viêm âm đạo", "Ngứa ngáy, khí hư có mùi hôi, màu sắc bất thường, đau tức vùng bụng dưới"),
        ("U xơ tử cung", "Đau tức vùng chậu, rong kinh, tiểu nhiều lần, đau khi quan hệ, táo bón"),
        ("U nang buồng trứng", "Đau bụng dưới, rối loạn kinh nguyệt, đau khi quan hệ, chướng bụng"),
        ("Phì đại tuyến tiền liệt", "Tiểu khó, tiểu không hết, tia nước tiểu yếu, tiểu đêm nhiều lần"),
        ("Trĩ nội", "Đi ngoài ra máu tươi, sa búi trĩ, ngứa hậu môn, tiết dịch nhầy"),
        ("Trĩ ngoại", "Cộm vướng hậu môn, búi trĩ sưng đau, có cục máu đông, chảy máu"),
        ("Viêm da cơ địa", "Da khô ráp, bong tróc, nổi mẩn đỏ, ngứa ngáy dữ dội, chàm hóa"),
        ("Vảy nến", "Mảng da đỏ phủ vảy trắng bạc, ngứa ngáy, khô nứt, rỉ máu"),
        ("Mề đay", "Nổi sẩn phù màu hồng, ngứa dữ dội, xuất hiện đột ngột và lan rộng"),
        ("Zona thần kinh", "Đau rát, nổi mụn nước mọc thành chùm dọc theo dây thần kinh, sốt nhẹ"),
        ("Thủy đậu", "Sốt, mệt mỏi, nổi mụn nước toàn thân, ngứa ngáy, đóng vảy"),
        ("Sởi", "Sốt cao, viêm long đờm, phát ban từ đầu lan xuống toàn thân, mắt đỏ"),
        ("Quai bị", "Sốt, đau đầu, sưng đau tuyến nước bọt mang tai, đau khi nhai nuốt"),
        ("Sốt xuất huyết", "Sốt cao đột ngột, đau hốc mắt, đau nhức cơ khớp, xuất huyết dưới da"),
        ("Sốt virus", "Sốt cao, mệt mỏi, đau nhức toàn thân, hắt hơi, sổ mũi"),
        ("COVID-19", "Sốt, ho khan, mất vị giác khứu giác, khó thở, đau họng, mệt mỏi"),
        ("Đau nửa đầu (Migraine)", "Đau nhói một bên đầu, buồn nôn, nhạy cảm với ánh sáng và tiếng ồn"),
        ("Rối loạn tiền đình", "Chóng mặt, hoa mắt, mất thăng bằng, buồn nôn, ù tai"),
        ("Suy nhược thần kinh", "Mệt mỏi kéo dài, mất ngủ, khó tập trung, lo âu, dễ cáu gắt"),
        ("Trầm cảm", "Buồn bã, chán nản, mất hứng thú, rối loạn giấc ngủ, suy nghĩ tiêu cực"),
        ("Rối loạn lo âu", "Căng thẳng quá mức, bồn chồn, tim đập nhanh, vã mồ hôi, khó thở"),
        ("Thiếu máu não", "Đau đầu, hoa mắt, chóng mặt, giảm trí nhớ, tê bì chân tay"),
        ("Bệnh Parkinson", "Run tay chân khi nghỉ ngơi, cứng cơ, cử động chậm chạp, mất thăng bằng"),
        ("Bệnh Alzheimer", "Suy giảm trí nhớ nghiêm trọng, lú lẫn, mất định hướng, thay đổi tính cách"),
        ("Viêm tai giữa", "Đau nhức tai, chảy mủ tai, ù tai, giảm thính lực, sốt"),
        ("Viêm giác mạc", "Đau nhức mắt, cộm xốn, chảy nước mắt, nhạy cảm ánh sáng, mờ mắt"),
        ("Bệnh Glaucoma (Cườm nước)", "Đau nhức mắt dữ dội, nhìn mờ, thấy quầng sáng, đau đầu, buồn nôn"),
        ("Đục thủy tinh thể (Cườm khô)", "Nhìn mờ như qua màn sương, chói mắt khi nhìn ánh sáng, giảm thị lực ban đêm"),
        ("Cận thị", "Nhìn mờ khi nhìn xa, hay nheo mắt, mỏi mắt, đau đầu"),
        ("Suy giãn tĩnh mạch", "Nặng chân, nhức mỏi chân, nổi gân xanh ngoằn ngoèo, phù nề về chiều"),
        ("Bệnh Raynaud", "Các ngón tay chân chuyển màu trắng bệch, tím tái rồi đỏ khi gặp lạnh, tê buốt"),
        ("Thiếu hụt Canxi", "Chuột rút, co cứng cơ, tê bì đầu ngón tay chân, mệt mỏi, loãng xương"),
        ("Thiếu hụt Vitamin D", "Đau nhức xương, yếu cơ, mệt mỏi, trầm cảm nhẹ, dễ gãy xương"),
        ("Thừa cân, béo phì", "Chỉ số BMI cao, tích tụ mỡ nhiều ở bụng, mệt mỏi khi vận động, khó thở"),
        ("Suy dinh dưỡng", "Sụt cân, gầy gò, mệt mỏi, da xanh xao, dễ mắc bệnh nhiễm trùng"),
        ("Ngộ độc thực phẩm", "Buồn nôn, nôn mửa, tiêu chảy cấp, đau quặn bụng, sốt nhẹ")
    ]
    
    count = 0
    for name, symptoms in extra_diseases:
        existing = db.query(Disease).filter(Disease.name == name).first()
        if existing:
            existing.symptoms += " | " + symptoms.lower()
        else:
            disease = Disease(
                name=name,
                description=f"Bệnh {name}",
                symptoms=symptoms.lower(),
                recommended_drugs=""
            )
            db.add(disease)
        count += 1
        
    db.commit()
    print(f"✅ Đã thêm {count} bệnh từ Kho dữ liệu mở rộng (Crawled/Mock Data).")


def main():
    with Session(engine) as db:
        translate_symptom2disease(db)
        add_mock_vietnamese_data(db)
        
        total = db.query(Disease).count()
        print(f"\n🎉 HOÀN TẤT! Tổng số bệnh trong DB hiện tại: {total} bệnh.")
        print("💡 Hãy chạy lại lệnh: curl.exe -X POST http://localhost:8001/chat/train (hoặc khởi động lại server) để Retrain mô hình.")

if __name__ == "__main__":
    main()
