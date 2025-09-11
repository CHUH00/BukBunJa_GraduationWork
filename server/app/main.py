import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import Base, engine
from .routers import lotto, retailers
from .routers import auth as auth_router
from .routers import auth_social
from .routers import users as users_router
from . import models_user



load_dotenv() 
app = FastAPI(debug=True) 

# ------------ CORS 설정 ------------
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
origins = [
    FRONTEND_ORIGIN,
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

# ------------ 라우터 등록 ------------
app.include_router(lotto.router)
app.include_router(retailers.router)
app.include_router(auth_router.router)
app.include_router(auth_social.router)
app.include_router(users_router.router)

# ------------ 테이블 생성 ------------
Base.metadata.create_all(bind=engine)

# ------------ 헬스체크/루트 ------------
@app.get("/")
def read_root():
    return {"message": "로또 대시보드 API 서버입니다."}