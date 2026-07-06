from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.db import get_db
from models.cart import Cart
from models.cart_item import CartItem
from models.product import Product

router = APIRouter(prefix="/cart", tags=["Cart"])
@router.post("/add")
async def add_to_cart(
    user_id: int,
    product_id: int,
    quantity: int,
    db: AsyncSession = Depends(get_db)
):
    # check product
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(404, "Product not found")

    # check cart
    result = await db.execute(
        select(Cart).where(Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()

    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)

    # Check if item already exists in user's cart
    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        )
    )
    cart_item = result.scalar_one_or_none()

    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity
        )
        db.add(cart_item)

    await db.commit()
    return {"message": "Added to cart"}

@router.get("/{user_id}")
async def get_cart(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Cart).where(Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()

    if not cart:
        return []

    # Join CartItem and Product to return rich metadata
    result = await db.execute(
        select(CartItem, Product)
        .join(Product, CartItem.product_id == Product.id)
        .where(CartItem.cart_id == cart.id)
    )
    
    items = []
    for cart_item, product in result.all():
        items.append({
            "id": cart_item.id,
            "product_id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "image": product.image,
            "quantity": cart_item.quantity,
            "stock": product.quantity
        })

    return items

@router.post("/update")
async def update_cart(
    user_id: int,
    product_id: int,
    quantity: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Cart).where(Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()

    if not cart:
        raise HTTPException(404, "Cart not found")

    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        )
    )
    cart_item = result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(404, "Cart item not found")

    if quantity <= 0:
        await db.delete(cart_item)
    else:
        cart_item.quantity = quantity

    await db.commit()
    return {"message": "Cart updated"}

@router.post("/remove")
async def remove_from_cart(
    user_id: int,
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Cart).where(Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()

    if not cart:
        raise HTTPException(404, "Cart not found")

    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        )
    )
    cart_item = result.scalar_one_or_none()

    if cart_item:
        await db.delete(cart_item)
        await db.commit()

    return {"message": "Item removed from cart"}

@router.post("/clear")
async def clear_cart(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Cart).where(Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()

    if cart:
        # Delete all cart items
        await db.execute(
            CartItem.__table__.delete().where(CartItem.cart_id == cart.id)
        )
        await db.commit()

    return {"message": "Cart cleared"}