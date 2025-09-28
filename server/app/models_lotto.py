from sqlalchemy import Column, Integer, BigInteger, Date
from .database import Base

class LottoDraw(Base):
    __tablename__ = "LottoDraw"
    __table_args__ = {'extend_existing': True}  # 중복 정의 허용

    년도 = Column(Integer, nullable=False)
    회차 = Column(Integer, primary_key=True)
    추첨일 = Column(Date, nullable=False)
    당첨자수_1 = Column(Integer)
    당첨금액_1 = Column(BigInteger)
    당첨자수_2 = Column(Integer)
    당첨금액_2 = Column(BigInteger)
    당첨자수_3 = Column(Integer)
    당첨금액_3 = Column(BigInteger)
    당첨자수_4 = Column(Integer)
    당첨금액_4 = Column(BigInteger)
    당첨자수_5 = Column(Integer)
    당첨금액_5 = Column(BigInteger)
    당첨번호_1 = Column(Integer, nullable=False)
    당첨번호_2 = Column(Integer, nullable=False)
    당첨번호_3 = Column(Integer, nullable=False)
    당첨번호_4 = Column(Integer, nullable=False)
    당첨번호_5 = Column(Integer, nullable=False)
    당첨번호_6 = Column(Integer, nullable=False)
    보너스번호 = Column(Integer, nullable=False)