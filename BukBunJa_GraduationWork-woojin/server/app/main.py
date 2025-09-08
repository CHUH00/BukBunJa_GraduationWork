# server/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import lotto, retailers

app = FastAPI(debug=True)  # ★ 디버그 ON (개발용에서만)

app = FastAPI()

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(lotto.router)
app.include_router(retailers.router)   # 👉 retailers 라우터 추가

@app.get("/")
def read_root():
    return {"message": "로또 대시보드 API 서버입니다."}