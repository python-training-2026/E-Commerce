from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from database.db import get_db
from models.product import Product
from schemas.product import ProductCreate

router = APIRouter(prefix="/products", tags=["Products"])

#################################################
## Product add api
#################################################

import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from models.product import Product

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/")
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):

    # Generate a unique filename
    filename = f"{uuid4()}_{image.filename}"

    filepath = os.path.join("uploads", filename)

    # Save the uploaded image
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    new_product = Product(
        name=name,
        description=description,
        price=price,
        quantity=quantity,
        image=filepath
    )

    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)

    return {
        "message": "Product Created",
        "product": new_product
    }


@router.post("/")
async def create_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_db)
):

    new_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        quantity=product.quantity,
        image=product.image
    )

    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)

    return {
        "message": "Product Added Successfully",
        "product": new_product
    }
    
   
#################################################
## Product get api
#################################################
@router.get("/get/")
async def get_products(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product))
    products = result.scalars().all()

    return products

#################################################
## Product get api by id
#################################################
@router.get("/{product_id}")
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )

    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product