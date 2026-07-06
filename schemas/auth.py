from pydantic import BaseModel, EmailStr

class Registerr(BaseModel):
    name: str
    email:EmailStr
    address: str
    phone: str
    password:str
    
class Login(BaseModel):
    email: EmailStr
    password:str