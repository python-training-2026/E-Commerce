from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from database.db import engine, Base
from routers.auth import router as auth_router
from routers.product import router as product_router

from routers.cart import router as cart_router
from routers.order import router as order_router
from routers.payment import router as payment_router

# Import all models to register them on Base metadata for startup table creation
from models.user import Register
from models.product import Product
from models.cart import Cart
from models.cart_item import CartItem
from models.order import Order, OrderItem
from models.payment import Payment

########################
## for image purpose

import os
os.makedirs("uploads", exist_ok=True)
########################

app = FastAPI()

app.include_router(product_router)
app.include_router(auth_router)

        
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(payment_router)

templates = Jinja2Templates(directory="templates")
templates.env.cache = None
app.mount("/static", StaticFiles(directory="static"), name="static")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def index_page(request: Request):
    return templates.TemplateResponse(
        request,
        "index.html"
    )


@app.get("/register-page")
async def register_page(request: Request):
    return templates.TemplateResponse(
        request,
        "register.html"
    )


@app.get("/login-page")
async def login_page(request: Request):
    return templates.TemplateResponse(
        request,
        "login.html"
    )


@app.get("/add-product-page")
async def add_product_page(request: Request):
    return templates.TemplateResponse(
        request,
        "add_product.html"
    )


@app.get("/products-page")
async def products_page(request: Request):
    return templates.TemplateResponse(
        request,
        "products.html"
    )


@app.get("/cart-page")
async def cart_page(request: Request):
    return templates.TemplateResponse(
        request,
        "cart.html"
    )


@app.get("/checkout-page")
async def checkout_page(request: Request):
    return templates.TemplateResponse(
        request,
        "checkout.html"
    )


@app.get("/orders-page")
async def orders_page(request: Request):
    return templates.TemplateResponse(
        request,
        "orders.html"
    )


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
