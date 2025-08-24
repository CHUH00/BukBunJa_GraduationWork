# server/app/database.py (최종 수정본)
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Date, BigInteger
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

USER = os.getenv("DB_USER")
PASS = os.getenv("DB_PASS")
HOST = os.getenv("DB_HOST", "127.0.0.1")
PORT = os.getenv("DB_PORT", "3306")
NAME = os.getenv("DB_NAME", "lotto_db")

DATABASE_URL = f"mysql+pymysql://{USER}:{PASS}@{HOST}:{PORT}/{NAME}?charset=utf8mb4"

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)

Base = declarative_base()

class LottoDraw(Base):
    __tablename__ = "LottoDraw"

    year = Column("년도", Integer)
    draw_number = Column("회차", Integer, primary_key=True)
    draw_date = Column("추첨일", Date)
    first_prize_winners = Column("1등_당첨자수", Integer)
    first_prize_amount = Column("1등_당첨금액", BigInteger)
    second_prize_winners = Column("2등_당첨자수", Integer)
    second_prize_amount = Column("2등_당첨금액", BigInteger)
    third_prize_winners = Column("3등_당첨자수", Integer)
    third_prize_amount = Column("3등_당첨금액", BigInteger)
    fourth_prize_winners = Column("4등_당첨자수", Integer)
    fourth_prize_amount = Column("4등_당첨금액", BigInteger)
    fifth_prize_winners = Column("5등_당첨자수", Integer)
    fifth_prize_amount = Column("5등_당첨금액", BigInteger)
    num1 = Column("당첨번호_1", Integer)
    num2 = Column("당첨번호_2", Integer)
    num3 = Column("당첨번호_3", Integer)
    num4 = Column("당첨번호_4", Integer)
    num5 = Column("당첨번호_5", Integer)
    num6 = Column("당첨번호_6", Integer)
    bonus_number = Column("보너스번호", Integer)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()