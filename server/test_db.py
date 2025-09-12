import os
from sqlalchemy import create_engine
from dotenv import load_dotenv
import urllib.parse

# .env 파일 읽기
load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = urllib.parse.quote_plus(os.getenv("DB_PASS"))  # 비밀번호에 특수문자가 있을 때 안전하게
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=True)

# 테스트 연결
try:
    with engine.connect() as conn:
        print("DB 연결 성공!")
except Exception as e:
    print("DB 연결 실패:", e)