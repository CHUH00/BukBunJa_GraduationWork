from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from typing import Optional, List

from ..database import get_db, LottoDraw, LottoRetailer

router = APIRouter(prefix="/lotto", tags=["lotto"])

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
        limit: Optional[int] = Query(None, ge=1, description="최근 n개"),
        db: Session = Depends(get_db)
):
    try:
        query = db.query(LottoDraw).order_by(LottoDraw.draw_number.desc())
        if limit:
            query = query.limit(limit)
        rows = query.all()

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


@router.get("/draws")
def get_draws(
        limit: int = Query(2000, ge=1, description="최근 n개(오래된 순으로 정렬)"),
        db: Session = Depends(get_db)
):
    try:
        rows = (
            db.query(LottoDraw)
            .order_by(LottoDraw.draw_number.asc())
            .limit(limit)
            .all()
        )

        out = []
        for r in rows:
            d = r.draw_date
            if hasattr(d, "isoformat"):
                draw_date = d.isoformat()
                year = getattr(d, "year", int(str(d)[:4]))
            else:
                draw_date = str(d) if d is not None else None
                year = int(str(d)[:4]) if d else None

            out.append({
                "회차": r.draw_number,
                "추첨일": draw_date,
                "년도": year,
                "당첨번호_1": r.num1,
                "당첨번호_2": r.num2,
                "당첨번호_3": r.num3,
                "당첨번호_4": r.num4,
                "당첨번호_5": r.num5,
                "당첨번호_6": r.num6,
                "보너스번호": r.bonus_number,
            })
        return out
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"/draws error: {e}")