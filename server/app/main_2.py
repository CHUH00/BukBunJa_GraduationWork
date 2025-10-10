import os
import json
import datetime
from fastapi import FastAPI, APIRouter, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from .database import Base, engine, get_db
from .routers import lotto, retailers
from .routers import auth as auth_router
from .routers import auth_social
from .routers import users as users_router
from .models_user import PredictionJSON, PredictionNumberJSON
from .models_lotto import LottoDraw
from .ai_model import recommend_numbers

load_dotenv()
app = FastAPI(debug=True)

# ------------ CORS 설정 ------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------ 정적 파일 경로 설정 (프로필 이미지 접근 가능하도록) ------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ------------ 라우터 등록 ------------
app.include_router(lotto.router)
app.include_router(retailers.router)
app.include_router(auth_router.router)
app.include_router(auth_social.router)
app.include_router(users_router.router)

# ------------ AI 추천 라우터 추가 ------------
ai_router = APIRouter(tags=["AI"])


class RecommendRequest(BaseModel):
    settings: Optional[dict] = None
    k: int = 1000
    topn: int = 5


class RecommendResponse(BaseModel):
    numbers: list[int]
    bonus: int
    score: float


@ai_router.post("/recommend", response_model=RecommendResponse)
async def ai_recommend(req: RecommendRequest, db: Session = Depends(get_db), current_user: "User" = Depends(lambda: None)):
    from .routers.auth import get_current_user
    current_user: "User" = Depends(get_current_user)
    user_id = current_user.user_id

    result = recommend_numbers(settings=req.settings, k=req.k, topn=req.topn)

    latest_draw = db.query(LottoDraw).order_by(LottoDraw.회차.desc()).first()
    draw_number = latest_draw.회차 if latest_draw else 1

    settings = req.settings if req.settings else {}
    prediction_json = PredictionJSON(
        user_id=user_id,
        draw_number=draw_number,
        created_at=datetime.datetime.now(),
        settings=json.dumps(settings),
    )
    db.add(prediction_json)
    db.commit()
    db.refresh(prediction_json)

    pred_numbers_json = PredictionNumberJSON(
        prediction_id=prediction_json.prediction_id,
        numbers=result["numbers"],
        bonus_number=result.get("bonus"),
    )
    db.add(pred_numbers_json)
    db.commit()

    return {
        "numbers": result["numbers"],
        "bonus": result["bonus"],
        "score": result["score"],
    }


app.include_router(ai_router)

# ------------ 테이블 생성 ------------
Base.metadata.create_all(bind=engine)

# ------------ 헬스체크/루트 ------------
@app.get("/")
def read_root(request: Request):
    base_url = str(request.base_url).rstrip("/")
    return {
        "message": "로또 대시보드 API 서버입니다.",
        "upload_example": f"{base_url}/uploads/sample.png",
    }