import os
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import json

from .database import Base, engine
from .routers import lotto, retailers
from .routers import auth as auth_router
from .routers import auth_social
from .routers import users as users_router
from . import models_user
from .ai_model import recommend_numbers

# --- 추가: DB 모델, 세션, 의존성, datetime import
from .models_user import PredictionJSON, PredictionNumberJSON
from .models_lotto import LottoDraw
from sqlalchemy.orm import Session
from fastapi import Depends
from .database import get_db
import datetime



load_dotenv() 
app = FastAPI(debug=True) 

# ------------ CORS 설정 ------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 프론트엔드 도메인 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------ 기존 라우터 등록 ------------
app.include_router(lotto.router)
app.include_router(retailers.router)
app.include_router(auth_router.router)
app.include_router(auth_social.router)
app.include_router(users_router.router)

# ------------ AI 추천 라우터 추가 ------------
ai_router = APIRouter(tags=["AI"])

from pydantic import BaseModel
from typing import Optional

class RecommendRequest(BaseModel):
    settings: Optional[dict] = None
    k: int = 1000
    topn: int = 5

class RecommendResponse(BaseModel):
    numbers: list[int]
    bonus: int
    score: float

@ai_router.post("/recommend", response_model=RecommendResponse)
async def ai_recommend(req: RecommendRequest, db: Session = Depends(get_db)):
    result = recommend_numbers(settings=req.settings, k=req.k, topn=req.topn)

    # 예시: user_id를 1로 임시 지정, 실제로는 로그인 유저 id 사용
    user_id = 1

    # 최신 회차 가져오기
    latest_draw = db.query(LottoDraw).order_by(LottoDraw.회차.desc()).first()
    # 기존: draw_number = latest_draw.회차 + 1 if latest_draw else 1
    # 변경: draw_number는 FK 제약조건 위반을 피하기 위해 존재하는 회차(latest_draw.회차)로 설정
    draw_number = latest_draw.회차 if latest_draw else 1

    # settings 값이 없을 경우 빈 dict로 초기화
    settings = req.settings if req.settings else {}

    # PredictionJSON 테이블 저장 (settings JSON 직접 저장)
    prediction_json = PredictionJSON(
        user_id=user_id,
        draw_number=draw_number,
        created_at=datetime.datetime.now(),
        settings=json.dumps(settings)
    )
    db.add(prediction_json)
    db.commit()
    db.refresh(prediction_json)

    # PredictionNumberJSON 테이블 저장 (numbers를 JSON 컬럼에 저장)
    pred_numbers_json = PredictionNumberJSON(
        prediction_id=prediction_json.prediction_id,
        numbers=result["numbers"],  # Store the list of numbers as JSON
        bonus_number=result.get("bonus")
    )
    db.add(pred_numbers_json)
    db.commit()

    return {
        "numbers": result["numbers"],
        "bonus": result["bonus"],
        "score": result["score"]
    }

app.include_router(ai_router)

# ------------ 테이블 생성 ------------
Base.metadata.create_all(bind=engine)

# ------------ 헬스체크/루트 ------------
@app.get("/")
def read_root():
    return {"message": "로또 대시보드 API 서버입니다."}