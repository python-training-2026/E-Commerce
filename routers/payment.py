from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.db import get_db
from models.payment import Payment
from models.order import Order, OrderItem
from models.product import Product
from models.cart import Cart
from models.cart_item import CartItem

router = APIRouter(prefix="/payment", tags=["Payment"])

@router.post("/")
async def make_payment(
    order_id: int,
    amount: float,
    payment_method: str,
    db: AsyncSession = Depends(get_db)
):
    # Fetch the order
    order_result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = order_result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "completed":
        return {"message": "Order already processed"}

    # Create Payment record
    payment = Payment(
        order_id=order_id,
        amount=amount,
        payment_method=payment_method,
        payment_status="success"
    )
    db.add(payment)

    # Update Order status
    order.status = "completed"

    # Decrement Product Inventory Stock
    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order_id)
    )
    order_items = items_result.scalars().all()

    for item in order_items:
        prod_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = prod_result.scalar_one_or_none()
        if product:
            product.quantity = max(0, product.quantity - item.quantity)

    # Clear user's Cart items
    cart_result = await db.execute(
        select(Cart).where(Cart.user_id == order.user_id)
    )
    cart = cart_result.scalar_one_or_none()
    if cart:
        await db.execute(
            CartItem.__table__.delete().where(CartItem.cart_id == cart.id)
        )

    await db.commit()

    return {"message": "Payment success"}