from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.database import get_db
from app.models_user import Prediction, PredictionNumber, User  # 모델 임포트
from app.schemas_prediction import PredictionJSON  # Pydantic 스키마
from app.security import JWT_SECRET, JWT_ALG
import json

router = APIRouter(
    prefix="/mypage",
    tags=["mypage"]
)

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/history", response_model=list[PredictionJSON])
def get_user_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 로그인한 사용자의 모든 예측 기록 반환
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Prediction 조회
    predictions = db.query(Prediction).filter(Prediction.user_id == current_user.user_id).all()
    
    results = []
    for p in predictions:
        # PredictionNumber 조회
        pn = db.query(PredictionNumber).filter(PredictionNumber.prediction_id == p.prediction_id).first()
        
        numbers_list = []
        if pn and pn.numbers:
            try:
                numbers_list = json.loads(pn.numbers)
            except json.JSONDecodeError:
                numbers_list = []

        recommended_numbers = {
            "numbers": numbers_list,
            "bonus_number": pn.bonus_number if pn else 0
        }
        
        results.append({
            "prediction_id": p.prediction_id,
            "draw_number": p.draw_number,
            "created_at": p.created_at,
            "settings": p.settings,
            "recommended_numbers": recommended_numbers
        })
    
    return results