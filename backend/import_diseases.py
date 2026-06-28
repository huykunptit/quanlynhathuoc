"""
Script import dữ liệu bệnh từ dataset ViMedical Disease + Symptom2Disease
vào bảng diseases trong database.

Chạy: python import_diseases.py
"""
import pandas as pd
import os
from sqlalchemy.orm import Session
from app.database import engine, Base
from app.models.disease import Disease
from app.models.product import Product

# ============================================================
# PHẦN 1: Mapping tên bệnh → tên sản phẩm trong kho thuốc
# ============================================================
# Map thủ công các bệnh phổ biến với sản phẩm có sẵn trong DB
DISEASE_TO_DRUGS = {
    # Bệnh hô hấp
    "Cảm cúm": "Panadol Extra Đỏ, Siro ho Prospan, Kẹo ngậm ho Bảo Thanh",
    "Viêm họng": "Viên ngậm Strepsils, Kẹo ngậm ho Bảo Thanh",
    "Viêm phế quản": "Siro ho Prospan, Kẹo ngậm ho Bảo Thanh",
    "Viêm mũi dị ứng": "Otryvin, Nước muối sinh lý Vĩnh Phúc",
    "Viêm xoang": "Otryvin, Nước muối sinh lý Vĩnh Phúc",
    "Ho": "Siro ho Prospan, Kẹo ngậm ho Bảo Thanh",
    # Bệnh tiêu hóa
    "Đau dạ dày": "Smecta",
    "Tiêu chảy": "Smecta",
    "Rối loạn tiêu hóa": "Smecta, Men vi sinh BioGaia",
    # Bệnh mắt
    "Mỏi mắt": "V.Rohto Vitamin, Viên uống bổ mắt Wit",
    # Bệnh cơ xương khớp
    "Đau nhức cơ khớp": "Glucosamine Orihiro, Cao xoa bóp Sao Vàng",
    "Đau lưng": "Cao xoa bóp Sao Vàng",
    "Gout": "Glucosamine Orihiro",
    # Bệnh da liễu
    "Mụn trứng cá": "Gel trị mụn Megaduo, Sữa rửa mặt Cetaphil",
    "Viêm da dị ứng": "Sữa dưỡng thể Eucerin pH5",
    "Chàm": "Sữa dưỡng thể Eucerin pH5",
    # Bệnh mãn tính
    "Huyết áp cao": "Máy đo huyết áp Omron HEM-7120",
    "Tiểu đường": "Máy đo đường huyết Accu-Chek Instant",
    # Dinh dưỡng & Vitamin
    "Thiếu vitamin": "DHC Vitamin C, Plusssz Max Multivitamin",
    "Thiếu máu": "DHC Vitamin C, Collagen Youtheory",
    "Suy giảm miễn dịch": "DHC Vitamin C, Plusssz Max Multivitamin, Blackmores Fish Oil",
    # Sốt / Đau
    "Sốt": "Panadol Extra Đỏ, Miếng dán hạ sốt KoolFever",
    "Đau đầu": "Panadol Extra Đỏ, Cao xoa bóp Sao Vàng",
    # Khác
    "Nhiệt miệng": "Betadine, Nước muối sinh lý Vĩnh Phúc",
    "Mất ngủ": "Hoạt huyết dưỡng não Traphaco",
    "Gan": "Viên uống giải độc gan Boganic",
}


def normalize_disease_name(name: str) -> str:
    """Chuẩn hóa tên bệnh: bỏ prefix 'Bệnh', lowercase, strip"""
    name = name.strip()
    # ViMedical thường có format "Bệnh Cơ Tim Giãn Nở" → lấy phần sau "Bệnh "
    if name.startswith("Bệnh "):
        name = name[5:]
    return name


def find_matching_drugs(disease_name: str) -> str:
    """Tìm thuốc khuyên dùng dựa trên tên bệnh"""
    disease_lower = disease_name.lower()
    for key, drugs in DISEASE_TO_DRUGS.items():
        if key.lower() in disease_lower or disease_lower in key.lower():
            return drugs
    return ""


def import_vimedical(csv_path: str, db: Session):
    """
    Import từ ViMedical_Disease.csv
    Format: Disease | Question
    - Group tất cả Question theo Disease
    - Gom thành 1 chuỗi symptoms dài cho TF-IDF
    """
    if not os.path.exists(csv_path):
        print(f"⚠️  Không tìm thấy file: {csv_path}")
        return 0

    df = pd.read_csv(csv_path)
    print(f"📖 Đọc được {len(df)} rows từ ViMedical_Disease.csv")

    # Group theo bệnh, gom tất cả câu hỏi/triệu chứng
    grouped = df.groupby("Disease")["Question"].apply(
        lambda questions: " | ".join(questions.astype(str).unique())
    ).reset_index()

    count = 0
    for _, row in grouped.iterrows():
        disease_name = normalize_disease_name(row["Disease"])
        symptoms_text = row["Question"]

        # Kiểm tra đã tồn tại chưa
        existing = db.query(Disease).filter(Disease.name == disease_name).first()
        if existing:
            # Nối thêm triệu chứng mới vào existing
            existing.symptoms = existing.symptoms + " | " + symptoms_text
            continue

        disease = Disease(
            name=disease_name,
            description=f"Bệnh {disease_name}",
            symptoms=symptoms_text,
            recommended_drugs=find_matching_drugs(disease_name)
        )
        db.add(disease)
        count += 1

    db.commit()
    print(f"✅ Imported {count} bệnh mới từ ViMedical Disease")
    return count


def import_symptom2disease(csv_path: str, db: Session):
    """
    Import từ Symptom2Disease.csv (tiếng Anh)
    Format: label | text
    - Dùng làm bổ sung cho các bệnh quốc tế
    - Text tiếng Anh → vẫn hoạt động với TF-IDF đa ngôn ngữ
    """
    if not os.path.exists(csv_path):
        print(f"⚠️  Không tìm thấy file: {csv_path}")
        return 0

    df = pd.read_csv(csv_path)
    print(f"📖 Đọc được {len(df)} rows từ Symptom2Disease.csv")

    grouped = df.groupby("label")["text"].apply(
        lambda texts: " | ".join(texts.astype(str).unique())
    ).reset_index()

    count = 0
    for _, row in grouped.iterrows():
        disease_name = row["label"].strip()
        symptoms_text = row["text"]

        existing = db.query(Disease).filter(Disease.name == disease_name).first()
        if existing:
            existing.symptoms = existing.symptoms + " | " + symptoms_text
            continue

        disease = Disease(
            name=disease_name,
            description=f"Disease: {disease_name}",
            symptoms=symptoms_text,
            recommended_drugs=""
        )
        db.add(disease)
        count += 1

    db.commit()
    print(f"✅ Imported {count} bệnh mới từ Symptom2Disease")
    return count


def main():
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        # Giữ nguyên 4 bệnh gốc từ seed.py, chỉ thêm mới
        existing_count = db.query(Disease).count()
        print(f"📊 Hiện có {existing_count} bệnh trong DB\n")

        # Import ViMedical (tiếng Việt - ưu tiên)
        vi_count = import_vimedical("datasets/ViMedical_Disease.csv", db)

        # Import Symptom2Disease (tiếng Anh - bổ sung)
        en_count = import_symptom2disease("datasets/Symptom2Disease.csv", db)

        total = db.query(Disease).count()
        print(f"\n🎯 Tổng cộng sau import: {total} bệnh")
        print(f"   (Thêm {vi_count} từ ViMedical + {en_count} từ Symptom2Disease)")
        print("\n💡 Hãy gọi POST /chat/train để re-train TF-IDF model!")


if __name__ == "__main__":
    main()
