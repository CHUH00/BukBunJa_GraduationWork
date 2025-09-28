from sqlalchemy import String, Integer, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "User"

    id: Mapped[int] = mapped_column("user_id", Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column("password", String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    marketing_agree: Mapped[int] = mapped_column(Integer, default=0)
    privacy_agree: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class PredictionJSON(Base):
    __tablename__ = "Prediction"
    __table_args__ = {"extend_existing": True}

    prediction_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("User.user_id"), nullable=False)
    draw_number: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    settings: Mapped[dict] = mapped_column(JSON, nullable=False)

    numbers: Mapped[list] = relationship("PredictionNumberJSON", back_populates="prediction")

class PredictionNumberJSON(Base):
    __tablename__ = "PredictionNumber"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    prediction_id: Mapped[int] = mapped_column(ForeignKey("Prediction.prediction_id"), nullable=False)
    numbers: Mapped[list] = mapped_column(JSON, nullable=False)
    bonus_number: Mapped[int] = mapped_column(Integer, nullable=False)

    prediction: Mapped[PredictionJSON] = relationship("PredictionJSON", back_populates="numbers")