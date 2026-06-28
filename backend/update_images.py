import urllib.request
import urllib.parse
import re
import time
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.product import Product

def get_bing_image(query):
    query = urllib.parse.quote_plus(query)
    url = f"https://www.bing.com/images/search?q={query}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        links = re.findall(r'murl&quot;:&quot;(.*?)&quot;', html)
        if links:
            return links[0]
    except Exception as e:
        pass
    return None

def update_images():
    db: Session = SessionLocal()
    products = db.query(Product).all()
    
    print(f"Bắt đầu tìm và cập nhật ảnh cho {len(products)} sản phẩm bằng Bing...")
    
    for i, product in enumerate(products, 1):
        if product.image_url and "placehold.co" not in product.image_url and "unsplash.com" not in product.image_url:
            print(f"[{i}/{len(products)}] {product.name} đã có ảnh.")
            continue
            
        print(f"[{i}/{len(products)}] Tìm ảnh cho: {product.name}...")
        
        # Chỉ lấy 2 từ đầu để tìm kiếm nếu tên quá dài
        search_query = product.name
        
        image_url = get_bing_image(search_query)
        if not image_url:
            # Fallback to shorter query
            search_query = " ".join(product.name.split()[:4])
            image_url = get_bing_image(search_query)
            
        if image_url:
            product.image_url = image_url
            db.commit()
            print(f"  -> Đã cập nhật ảnh: {image_url}")
        else:
            print(f"  -> Không tìm thấy ảnh.")
            
        time.sleep(1) # Tránh rate limit
        
    db.close()
    print("Đã hoàn tất cập nhật CSDL!")

if __name__ == "__main__":
    update_images()
