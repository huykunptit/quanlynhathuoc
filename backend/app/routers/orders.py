from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, database
from app.routers.auth import get_current_user, get_admin_user
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: Optional[str] = None
    payment_method: str = "COD"
    note: Optional[str] = None

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
    shipping_address: Optional[str] = None
    payment_method: str
    note: Optional[str] = None
    created_at: datetime
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
        status="pending",
        shipping_address=order.shipping_address,
        payment_method=order.payment_method,
        note=order.note
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
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.created_at.desc()).all()
    return orders

@router.get("/admin/all", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(database.get_db), admin: models.User = Depends(get_admin_user)):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail(order_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return order

@router.patch("/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(database.get_db), admin: models.User = Depends(get_admin_user)):
    valid_statuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status
    db.commit()
    return {"message": f"Order status updated to {status}"}

@router.delete("/{order_id}")
def cancel_order(order_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be cancelled")
        
    # Restore stock
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
            
    order.status = "cancelled"
    db.commit()
    return {"message": "Order cancelled successfully"}
