from sqlalchemy import Column, Integer, Float, String, ForeignKey
from database.db import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    amount = Column(Float)
    payment_method = Column(String)
    payment_status = Column(String, default="pending")