import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

USER = os.getenv("DB_USER")
PASS = os.getenv("DB_PASS")
HOST = os.getenv("DB_HOST", "127.0.0.1")
PORT = os.getenv("DB_PORT", "3306")
NAME = os.getenv("DB_NAME", "lotto_db")

DATABASE_URL = f"mysql+pymysql://{USER}:{PASS}@{HOST}:{PORT}/{NAME}?charset=utf8mb4"

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()