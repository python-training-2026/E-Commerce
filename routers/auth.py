from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.db import get_db 
from models.user import Register
from schemas.auth import Registerr,Login

router = APIRouter()

@router.post("/register")
async def register( 
    user:Registerr, 

    db: AsyncSession = Depends(get_db)
):

    new_user = Register( 
        name= user.name,
        email= user.email,
        address= user.address,
        phone= user.phone,
        password=user.password
    )
    db.add(new_user) 

    await db.commit() 

    return {
        "message": "User Registered"
    }



@router.post("/login")
async def login(
    user: Login,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Register).where(
            Register.email == user.email
        )
    )
    
    db_user = result.scalar_one_or_none()

    if db_user is None:     
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user.password != user.password:
        raise HTTPException(status_code=400, detail="Wrong password")
        
    return {
        "message": "Login Success",
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "phone": db_user.phone,
        "address": db_user.address
    }