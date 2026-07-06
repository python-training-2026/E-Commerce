from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.db import get_db
from models.cart import Cart
from models.cart_item import CartItem
from models.product import Product
from models.order import Order, OrderItem

router = APIRouter(prefix="/order", tags=["Order"])

@router.post("/checkout")
async def checkout(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Cart).where(Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()

    if not cart:
        raise HTTPException(404, "Cart empty")

    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id)
    )
    items = result.scalars().all()

    if not items:
        raise HTTPException(400, "Cart is empty")

    total = 0
    checkout_items = []

    # Calculate total and verify products
    for item in items:
        prod_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = prod_result.scalar_one_or_none()
        if not product:
            raise HTTPException(404, f"Product {item.product_id} not found")
        
        # Check stock limits
        if product.quantity < item.quantity:
            raise HTTPException(
                400, 
                f"Insufficient stock for {product.name}. Available: {product.quantity}"
            )
        
        total += product.price * item.quantity
        checkout_items.append((item, product))

    # Create Order
    order = Order(
        user_id=user_id,
        total_amount=total,
        status="pending"
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    # Create OrderItems
    for cart_item, product in checkout_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=cart_item.quantity,
            price=product.price
        )
        db.add(order_item)

    await db.commit()

    return {
        "message": "Order created",
        "order_id": order.id,
        "total": total
    }

@router.get("/{user_id}")
async def get_orders(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).where(Order.user_id == user_id).order_by(Order.id.desc())
    )
    orders = result.scalars().all()

    history = []
    for order in orders:
        items_result = await db.execute(
            select(OrderItem, Product)
            .join(Product, OrderItem.product_id == Product.id)
            .where(OrderItem.order_id == order.id)
        )
        items = []
        for order_item, product in items_result.all():
            items.append({
                "product_id": product.id,
                "name": product.name,
                "image": product.image,
                "quantity": order_item.quantity,
                "price": order_item.price
            })
        
        history.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "items": items
        })

    return history