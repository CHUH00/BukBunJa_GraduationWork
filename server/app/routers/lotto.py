from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from typing import Optional, List

from ..database import get_db, LottoDraw, LottoRetailer  # LottoRetailer 모델도 import 필요

router = APIRouter(prefix="/lotto", tags=["lotto"])

# ==============================
# 기존 API (번호 관련)
# ==============================

@router.get("/latest-draw")
def get_latest_draw(db: Session = Depends(get_db)):
    try:
        latest_draw = db.query(LottoDraw).order_by(LottoDraw.draw_number.desc()).first()

        if not latest_draw:
            raise HTTPException(status_code=404, detail="로또 데이터를 찾을 수 없습니다.")

        numbers = [
            latest_draw.num1, latest_draw.num2, latest_draw.num3,
            latest_draw.num4, latest_draw.num5, latest_draw.num6
        ]

        return {
            "draw_number": latest_draw.draw_number,
            "draw_date": latest_draw.draw_date,
            "numbers": numbers,
            "bonus_number": latest_draw.bonus_number,
            "first_prize_winners": latest_draw.first_prize_winners,
            "first_prize_amount": latest_draw.first_prize_amount,
            "second_prize_winners": latest_draw.second_prize_winners,
            "second_prize_amount": latest_draw.second_prize_amount,
            "third_prize_winners": latest_draw.third_prize_winners,
            "third_prize_amount": latest_draw.third_prize_amount,
            "fourth_prize_winners": latest_draw.fourth_prize_winners,
            "fourth_prize_amount": latest_draw.fourth_prize_amount,
            "fifth_prize_winners": latest_draw.fifth_prize_winners,
            "fifth_prize_amount": latest_draw.fifth_prize_amount,
        }
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"/latest-draw error: {e}")


@router.get("/history")
def history(
    limit: int = Query(10, ge=1, le=200, description="최근 n개"),
    db: Session = Depends(get_db)
):
    try:
        rows = db.query(LottoDraw).order_by(LottoDraw.draw_number.desc()).limit(limit).all()

        return [
            {
                "draw_number": r.draw_number,
                "draw_date": r.draw_date,
                "numbers": [
                    r.num1, r.num2, r.num3,
                    r.num4, r.num5, r.num6
                ],
                "bonus_number": r.bonus_number,
                "first_prize_winners": r.first_prize_winners,
                "first_prize_amount": r.first_prize_amount,
                "second_prize_winners": r.second_prize_winners,
                "second_prize_amount": r.second_prize_amount,
                "third_prize_winners": r.third_prize_winners,
                "third_prize_amount": r.third_prize_amount,
                "fourth_prize_winners": r.fourth_prize_winners,
                "fourth_prize_amount": r.fourth_prize_amount,
                "fifth_prize_winners": r.fifth_prize_winners,
                "fifth_prize_amount": r.fifth_prize_amount,
            }
            for r in rows
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"/history error: {e}")


@router.get("/recommend")
def recommend(n_sets: int = Query(3, ge=1, le=20)):
    """
    변경: 추천 로직은 추후 교체(현재는 고정 패턴, 프론트 연동 확인용)
    """
    base = [1, 7, 14, 23, 31, 42]

    res = []

    for i in range(n_sets):
        res.append({"set_id": i + 1, "numbers": [(x + i) % 45 or 45 for x in base]})

    return {"count": n_sets, "results": res}


# ==============================
# 신규 API (판매점 관련)
# ==============================

@router.get("/top-retailers")
def top_retailers(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    """
    전국 판매점 count 기준 상위 랭킹
    """
    try:
        rows = (
            db.query(
                LottoRetailer.상호명,
                LottoRetailer.소재지,
                LottoRetailer.위도,
                LottoRetailer.경도,
                func.count().label("count")
            )
            .group_by(LottoRetailer.상호명, LottoRetailer.위도, LottoRetailer.경도, LottoRetailer.소재지)
            .order_by(func.count().desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "상호명": r[0],
                "소재지": r[1],
                "위도(lat)": r[2],
                "경도(lon)": r[3],
                "count": r[4],
            }
            for r in rows
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"/top-retailers error: {e}")


@router.get("/search-retailers")
def search_retailers(
    region: str,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    특정 지역(주소 포함 검색)에서 판매점 count 순위 조회
    """
    try:
        rows = (
            db.query(
                LottoRetailer.상호명,
                LottoRetailer.소재지,
                LottoRetailer.위도,
                LottoRetailer.경도,
                func.count().label("count")
            )
            .filter(LottoRetailer.소재지.like(f"%{region}%"))
            .group_by(LottoRetailer.상호명, LottoRetailer.위도, LottoRetailer.경도, LottoRetailer.소재지)
            .order_by(func.count().desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "상호명": r[0],
                "소재지": r[1],
                "위도(lat)": r[2],
                "경도(lon)": r[3],
                "count": r[4],
            }
            for r in rows
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"/search-retailers error: {e}")