from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, database
from app.routers.auth import get_current_user
from typing import List
from pydantic import BaseModel

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float

    class Config:
        orm_mode = True

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    items: List[OrderItemResponse]

    class Config:
        orm_mode = True

@router.post("/", response_model=OrderResponse)
def create_order(
    order: OrderCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    total_amount = 0
    order_items = []
    
    # Tính tổng tiền và kiểm tra stock
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        
        # Trừ stock
        product.stock -= item.quantity
        
        item_price = product.price
        total_amount += item_price * item.quantity
        
        order_items.append(models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=item_price
        ))
        
    new_order = models.Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    for o_item in order_items:
        o_item.order_id = new_order.id
        db.add(o_item)
        
    db.commit()
    db.refresh(new_order)
    
    return new_order

@router.get("/", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
    return orders
