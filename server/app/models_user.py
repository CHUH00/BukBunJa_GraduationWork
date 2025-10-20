from sqlalchemy import String, Integer, DateTime, func, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
from datetime import datetime
from typing import Optional, List, Any, Dict

class User(Base):
    __tablename__ = "User"

    id: Mapped[int] = mapped_column("user_id", Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column("password", String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    avatar: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    marketing_agree: Mapped[int] = mapped_column(Integer, default=0)
    privacy_agree: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class Prediction(Base):
    __tablename__ = "Prediction"

    prediction_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("User.user_id"), nullable=False)
    draw_number: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    settings: Mapped[dict] = mapped_column(JSON, nullable=False)

    numbers: Mapped[List['PredictionNumber']] = relationship("PredictionNumber", back_populates="prediction")

class PredictionNumber(Base):
    __tablename__ = "PredictionNumber"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    prediction_id: Mapped[int] = mapped_column(ForeignKey("Prediction.prediction_id"), nullable=False)
    numbers: Mapped[List[int]] = mapped_column(JSON, nullable=False)
    bonus_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    prediction: Mapped[Prediction] = relationship("Prediction", back_populates="numbers")


# ----------------- Pydantic JSON Models (v1 style) -----------------
from pydantic import BaseModel
from datetime import datetime

class PredictionNumberJSON(BaseModel):
    numbers: List[int]
    bonus_number: Optional[int] = None

    class Config:
        orm_mode = True

class PredictionJSON(BaseModel):
    prediction_id: Optional[int] = None
    user_id: int
    draw_number: int
    created_at: Optional[datetime] = None
    settings: dict
    numbers: List[PredictionNumberJSON] = []

    class Config:
        orm_mode = True