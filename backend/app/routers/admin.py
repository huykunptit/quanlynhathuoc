from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, database
from app.routers.auth import get_admin_user
from app.routers.orders import OrderResponse

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(database.get_db), admin: models.User = Depends(get_admin_user)):
    """Trả về thống kê tổng quan cho dashboard"""
    total_revenue = db.query(func.sum(models.Order.total_amount)).scalar() or 0
    recent_orders = db.query(models.Order).order_by(models.Order.created_at.desc()).limit(10).all()
    
    # We use OrderResponse to format the recent_orders to make it easy for frontend
    formatted_recent_orders = []
    for order in recent_orders:
        items = []
        for item in order.items:
            items.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": item.price
            })
            
        formatted_recent_orders.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "shipping_address": order.shipping_address,
            "payment_method": order.payment_method,
            "note": order.note,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": items
        })

    return {
        "total_products": db.query(models.Product).count(),
        "total_orders": db.query(models.Order).count(),
        "total_users": db.query(models.User).count(),
        "total_revenue": total_revenue,
        "pending_orders": db.query(models.Order).filter(models.Order.status == "pending").count(),
        "low_stock_products": db.query(models.Product).filter(models.Product.stock < 10).count(),
        "recent_orders": formatted_recent_orders
    }

@router.get("/users")
def get_all_users(db: Session = Depends(database.get_db), admin: models.User = Depends(get_admin_user)):
    users = db.query(models.User).all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "address": user.address,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    return result
