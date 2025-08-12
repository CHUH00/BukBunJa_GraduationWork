from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, List

from ..database import get_db

router = APIRouter(prefix="/lotto", tags=["lotto"])


@router.get("/db-ping")
def db_ping(db: Session = Depends(get_db)):
    """
    변경: DB 연결/스키마/행수 점검용 임시 엔드포인트
    - has_table: lotto_data 테이블 존재 여부
    - row_count: lotto_data 행 수
    """
    try:
        v = db.execute(text("SELECT VERSION() AS v")).mappings().first()
        t = db.execute(text("""
            SELECT COUNT(*) AS c
            FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = 'lotto_data'
        """)).mappings().first()
        has_table = bool(t and t["c"])
        rows = 0
        if has_table:
            r = db.execute(text("SELECT COUNT(*) AS c FROM lotto_data")).mappings().first()
            rows = r["c"]
        return {"mysql_version": v["v"], "has_table": has_table, "row_count": rows}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"db error: {e}")


@router.get("/latest")
def latest_draw(db: Session = Depends(get_db)):
    """
    변경: draw_no DESC 기준 최신 1건 반환
    - 데이터 없으면 404(detail 명확)
    - SQL 오류는 500(detail 노출)
    """
    try:
        sql = text("""
            SELECT draw_no, draw_date,
                   winning_no_1, winning_no_2, winning_no_3,
                   winning_no_4, winning_no_5, winning_no_6,
                   bonus_no
            FROM lotto_data
            ORDER BY draw_no DESC
            LIMIT 1
        """)
        row = db.execute(sql).mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="no lotto_data rows")

        numbers = [
            row["winning_no_1"], row["winning_no_2"], row["winning_no_3"],
            row["winning_no_4"], row["winning_no_5"], row["winning_no_6"]
        ]
        return {
            "draw_no": row["draw_no"],
            "draw_date": row["draw_date"],
            "numbers": numbers,
            "bonus": row["bonus_no"],
        }
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"/latest error: {e}")


@router.get("/history")
def history(
    limit: int = Query(10, ge=1, le=200, description="최근 n개"),
    db: Session = Depends(get_db)
):
    """
    변경: 최신순으로 최근 n개 반환
    - SQL 오류는 500(detail 노출)
    """
    try:
        sql = text("""
            SELECT draw_no, draw_date,
                   winning_no_1, winning_no_2, winning_no_3,
                   winning_no_4, winning_no_5, winning_no_6,
                   bonus_no
            FROM lotto_data
            ORDER BY draw_no DESC
            LIMIT :limit
        """)
        rows = db.execute(sql, {"limit": limit}).mappings().all()
        return [
            {
                "draw_no": r["draw_no"],
                "draw_date": r["draw_date"],
                "numbers": [
                    r["winning_no_1"], r["winning_no_2"], r["winning_no_3"],
                    r["winning_no_4"], r["winning_no_5"], r["winning_no_6"]
                ],
                "bonus": r["bonus_no"],
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
    res: List[dict] = []
    for i in range(n_sets):
        res.append({"set_id": i + 1, "numbers": [(x + i) % 45 or 45 for x in base]})
    return {"count": n_sets, "results": res}