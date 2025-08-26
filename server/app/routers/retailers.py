# server/app/routers/retailers.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db, LottoRetailer

router = APIRouter(prefix="/retailers", tags=["retailers"])

# 판매점 순위 조회
@router.get("/top")
def get_top_retailers(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    rows = db.query(LottoRetailer).order_by(LottoRetailer.count.desc()).limit(limit).all()
    return [
        {
            "상호명": r.상호명,
            "소재지": r.소재지,
            "위도": r.위도,
            "경도": r.경도,
            "count": r.count,
        }
        for r in rows
    ]

# 특정 지역 검색
@router.get("/search")
def search_retailers(region: str, db: Session = Depends(get_db)):
    rows = (
        db.query(LottoRetailer)
        .filter(LottoRetailer.소재지.like(f"%{region}%"))
        .order_by(LottoRetailer.count.desc())  # ✅ 내림차순 정렬 추가
        .all()
    )
    return [
        {
            "상호명": r.상호명,
            "소재지": r.소재지,
            "위도": r.위도,
            "경도": r.경도,
            "count": r.count,
        }
        for r in rows
    ]