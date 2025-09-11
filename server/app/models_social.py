from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class SocialAccount(Base):
    __tablename__ = "SocialAccount"

    social_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("User.user_id"), nullable=False)
    provider: Mapped[str] = mapped_column(Enum("naver", "kakao", name="provider_enum"), nullable=False)
    provider_uid: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at = mapped_column(DateTime, server_default=func.now())