import pandas as pd
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# DB 연결 정보 (server/.env 파일에 있는 값)
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# DB 연결 엔진
engine = create_engine(
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

# CSV 읽기
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # server/ 상위 경로
csv_file = os.path.join(BASE_DIR, "server", "data", "lotto_all_merged.csv")
df = pd.read_csv(csv_file)

# DB에 적재 (replace = 기존 테이블을 새로 채움)
df.to_sql("lotto_retailers", engine, if_exists="replace", index=False)

print("✅ CSV 데이터를 lotto_retailers 테이블에 넣었습니다!")