# /server/app/main.py

import os
import json
import datetime
from typing import List, Optional, Union

from fastapi import FastAPI, APIRouter, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from pydantic import BaseModel

# --- DB, 모델, 라우터 ---
from .database import Base, engine, get_db
from .models_user import PredictionJSON, PredictionNumberJSON
from .models_lotto import LottoDraw
from .routers import lotto, retailers, auth as auth_router, auth_social, users as users_router

# --- AI 모델 ---
from .ai_model import recommend_numbers

load_dotenv()
app = FastAPI(debug=True)

# ------------ CORS ------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------ 정적 파일 (프로필 이미지 등) ------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ------------ 라우터 등록 ------------
app.include_router(lotto.router)
app.include_router(retailers.router)
app.include_router(auth_router.router)
app.include_router(auth_social.router)
app.include_router(users_router.router)

# ------------ AI 추천 라우터 ------------
ai_router = APIRouter(tags=["AI"])

# --- 요청 모델 ---
class RecommendRequest(BaseModel):
    settings: Optional[dict] = None
    k: int = 2000   # 후보군 생성 수
    topn: int = 5   # 최종 추천 개수

# --- 응답 모델 ---
class SingleRecommendResponse(BaseModel):
    numbers: List[int]
    score: float

class FullRecommendResponse(BaseModel):
    prediction_id: int
    recommendations: List[SingleRecommendResponse]

@ai_router.post("/recommend", response_model=FullRecommendResponse)
async def ai_recommend(req: RecommendRequest, db: Session = Depends(get_db)):
    # 1) AI 추천 호출
    results: Union[List[dict], dict] = recommend_numbers(
        settings=req.settings, k=req.k, topn=req.topn
    )

    # 1-1) 결과 형태 정규화: dict 하나여도 리스트로 바꿔 처리
    if isinstance(results, dict):
        results = [results]
    if not isinstance(results, list):
        raise HTTPException(status_code=500, detail="Unexpected recommend() return type")

    # 2) 사용자/회차 정보
    user_id = 1  # TODO: 실제 인증 붙이면 교체
    latest_draw = db.query(LottoDraw).order_by(LottoDraw.회차.desc()).first()
    draw_number = latest_draw.회차 if latest_draw else 1

    # 3) PredictionJSON 1건 저장
    settings_json = json.dumps(req.settings if req.settings else {})
    new_prediction = PredictionJSON(
        user_id=user_id,
        draw_number=draw_number,
        settings=settings_json,
        created_at=datetime.datetime.now(),
    )
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    # 4) 추천 조합 저장 + 응답 구성
    response_recommendations: List[SingleRecommendResponse] = []
    for item in results:
        # 안전 접근
        numbers = item.get("numbers")
        if not isinstance(numbers, list):
            # numbers가 없거나 비정상이면 스킵/에러 중 하나 선택
            raise HTTPException(status_code=500, detail="recommend() missing 'numbers' list")

        score = float(item.get("score", 0.0))
        bonus = int(item.get("bonus", 0))  # ai_model에서 안 줄 수도 있음

        # DB 저장
        pred_numbers_json = PredictionNumberJSON(
            prediction_id=new_prediction.prediction_id,
            numbers=numbers,
            bonus_number=bonus,
        )
        db.add(pred_numbers_json)

        # 응답 누적
        response_recommendations.append(
            SingleRecommendResponse(numbers=numbers, score=score)
        )

    db.commit()

    # 5) 응답
    return FullRecommendResponse(
        prediction_id=new_prediction.prediction_id,
        recommendations=response_recommendations,
    )

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