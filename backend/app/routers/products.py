from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, func
from sqlalchemy.orm import Session
from app import models, database
from app.database import remove_accents
from app.routers.auth import get_admin_user
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    image_url: Optional[str]
    indications: Optional[str]
    category_id: Optional[int] = None
    active_ingredient: Optional[str] = None
    contraindications: Optional[str] = None
    dosage: Optional[str] = None
    is_active: bool = True

    class Config:
        orm_mode = True

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    image_url: Optional[str] = None
    indications: Optional[str] = None
    category_id: Optional[int] = None
    active_ingredient: Optional[str] = None
    contraindications: Optional[str] = None
    dosage: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    indications: Optional[str] = None
    category_id: Optional[int] = None
    active_ingredient: Optional[str] = None
    contraindications: Optional[str] = None
    dosage: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    if not search:
        return db.query(models.Product).offset(skip).limit(limit).all()
    
    is_sqlite = db.bind.dialect.name == 'sqlite'
    products = []
    
    if is_sqlite:
        term_clean = f"%{remove_accents(search)}%"
        direct_matches = db.query(models.Product).filter(
            func.remove_accents(models.Product.name).ilike(term_clean) | 
            func.remove_accents(models.Product.indications).ilike(term_clean) |
            func.remove_accents(models.Product.description).ilike(term_clean)
        ).all()
    else:
        term = f"%{search}%"
        direct_matches = db.query(models.Product).filter(
            models.Product.name.ilike(term) | 
            models.Product.indications.ilike(term) |
            models.Product.description.ilike(term)
        ).all()
    
    # 2. If direct matches exist, find related products within the same categories (indications)
    if direct_matches:
        matched_ids = {p.id for p in direct_matches}
        unique_indications = {p.indications for p in direct_matches if p.indications}
        
        related_products = []
        if unique_indications:
            related_products = db.query(models.Product).filter(
                models.Product.indications.in_(unique_indications),
                ~models.Product.id.in_(matched_ids)
            ).limit(10).all()
        
        # Combine direct matches first, then related ones
        products = direct_matches + related_products
    else:
        # 3. Fallback: Split search query into words and match any word (OR search)
        words = [w.strip() for w in search.split() if len(w.strip()) > 1]
        if words:
            conditions = []
            if is_sqlite:
                for word in words:
                    w_term = f"%{remove_accents(word)}%"
                    conditions.append(
                        func.remove_accents(models.Product.name).ilike(w_term) | 
                        func.remove_accents(models.Product.description).ilike(w_term) | 
                        func.remove_accents(models.Product.indications).ilike(w_term)
                    )
            else:
                for word in words:
                    w_term = f"%{word}%"
                    conditions.append(
                        models.Product.name.ilike(w_term) | 
                        models.Product.description.ilike(w_term) | 
                        models.Product.indications.ilike(w_term)
                    )
            
            fallback_matches = db.query(models.Product).filter(or_(*conditions)).limit(20).all()
            products = fallback_matches
            
    # Apply pagination on the combined/ranked result set
    return products[skip:skip+limit]

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(database.get_db), admin: models.User = Depends(get_admin_user)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(database.get_db), admin: models.User = Depends(get_admin_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    update_data = product.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(get_admin_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db_product.is_active = False
    db.commit()
    return {"message": "Product deleted successfully"}
