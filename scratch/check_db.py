import asyncio
from database.db import engine, Base
from sqlalchemy import select
from models.user import Register
from models.product import Product
from models.cart import Cart
from models.cart_item import CartItem
from models.order import Order, OrderItem
from models.payment import Payment

async def test_conn():
    try:
        print("Connecting to DB...")
        async with engine.begin() as conn:
            print("DB Connected successfully!")
            print("Creating tables if they do not exist...")
            await conn.run_sync(Base.metadata.create_all)
            print("Tables created/checked successfully!")
    except Exception as e:
        print("ERROR CONNECTING TO DB:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_conn())
