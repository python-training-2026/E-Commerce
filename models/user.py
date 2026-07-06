from sqlalchemy import Column, Integer, String
from database.db import Base

class Register(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String(15), unique=True, nullable=False)
    address =Column(String, nullable=False)
    password = Column(String, nullable=False)
    
