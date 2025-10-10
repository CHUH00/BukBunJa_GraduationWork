from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..schemas_prediction import PredictionJSON, PredictionNumberJSON
from ..models_user import Prediction, PredictionNumber, User
from ..dependencies import get_current_user
import json
from collections import Counter

router = APIRouter(prefix="/prediction", tags=["Prediction"])


def _create_prediction_json(p: Prediction, n: PredictionNumber) -> PredictionJSON:
    """데이터베이스 모델(Prediction, PredictionNumber) -> API 응답용 PredictionJSON 변환

    - settings 컬럼이 문자열로 저장되어 있을 수 있어 안전하게 JSON으로 파싱합니다.
    - numbers 컬럼이 문자열("[1,2,3]")일 수 있어 파싱 후 정수 리스트로 변환합니다.
    """
    # settings 처리: 문자열이면 파싱, 아니면 사전으로 보장
    settings_dict = p.settings
    if isinstance(settings_dict, str):
        try:
            settings_dict = json.loads(settings_dict)
        except json.JSONDecodeError:
            settings_dict = {}
    elif not isinstance(settings_dict, dict):
        settings_dict = {}

    # prediction_id 보정
    prediction_id = getattr(p, "prediction_id", None) or getattr(p, "id", None)
    if prediction_id is None:
        raise ValueError("Prediction object missing prediction_id")

    # 숫자 배열 보정
    numbers_list = []
    nums_val = getattr(n, "numbers", None)
    if isinstance(nums_val, list):
        numbers_list = [int(num) for num in nums_val if isinstance(num, (int, float, str)) and str(num).isdigit()]
    elif isinstance(nums_val, str):
        try:
            loaded_numbers = json.loads(nums_val)
            numbers_list = [int(num) for num in loaded_numbers if isinstance(num, (int, float, str)) and str(num).isdigit()]
        except Exception:
            numbers_list = []

    return PredictionJSON(
        prediction_id=prediction_id,
        draw_number=p.draw_number,
        created_at=p.created_at,
        settings=settings_dict,
        recommended_numbers=PredictionNumberJSON(
            numbers=numbers_list,
            bonus_number=n.bonus_number,
        ),
    )


@router.get("/history", response_model=list[PredictionJSON])
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """현재 로그인한 사용자의 예측 이력(최근순) 반환"""
    results = (
        db.query(Prediction, PredictionNumber)
        .join(PredictionNumber, Prediction.prediction_id == PredictionNumber.prediction_id)
        .filter(Prediction.user_id == getattr(current_user, 'user_id', None) or getattr(current_user, 'id', None))
        .order_by(Prediction.created_at.desc())
        .all()
    )

    return [_create_prediction_json(p, n) for p, n in results]


@router.get("/all", response_model=list[PredictionJSON])
def get_all_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """현재 로그인한 사용자의 모든 예측 반환(프론트에서 사용)"""
    user_identifier = getattr(current_user, 'user_id', None) or getattr(current_user, 'id', None)

    results = (
        db.query(Prediction, PredictionNumber)
        .join(PredictionNumber, Prediction.prediction_id == PredictionNumber.prediction_id)
        .filter(Prediction.user_id == user_identifier)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    return [_create_prediction_json(p, n) for p, n in results]


@router.get("/top-numbers")
def get_top_numbers(
    db: Session = Depends(get_db)
):
    """데이터베이스에 저장된 모든 추천 번호를 모아서 상위 10개 숫자와 횟수를 반환"""
    all_numbers = db.query(PredictionNumber.numbers).all()

    counter = Counter()
    for (numbers_json,) in all_numbers:
        if isinstance(numbers_json, str):
            try:
                numbers = json.loads(numbers_json)
            except Exception:
                numbers = []
        elif isinstance(numbers_json, list):
            numbers = numbers_json
        else:
            numbers = []

        # 정수 변환
        int_numbers = []
        for num in numbers:
            try:
                int_numbers.append(int(num))
            except Exception:
                continue

        counter.update(int_numbers)

    top_10 = counter.most_common(10)
    result = [{"number": num, "count": count} for num, count in top_10]

    return result


@router.get("/favorite")
def get_favorite_numbers(
    db: Session = Depends(get_db)
):
    """favorite 엔드포인트는 top-numbers와 동일한 결과를 반환합니다"""
    return get_top_numbers(db)


# ------------------------ 디버그용 엔드포인트 (개발 중에만 사용) ------------------------
@router.get("/debug")
def debug_db(
    db: Session = Depends(get_db),
    user_id: int | None = None
):
    """데이터베이스 상태를 빠르게 확인하기 위한 디버그 엔드포인트

    - total_counts: Prediction / PredictionNumber 총 개수
    - sample_predictions / sample_prediction_numbers: DB에 있는 샘플 레코드 (JSON 형식으로 파싱 시도)
    - user_prediction_count: ?user_id 쿼리 파라미터가 있으면 해당 사용자의 예측 수
    """
    total_preds = db.query(Prediction).count()
    total_nums = db.query(PredictionNumber).count()

    sample_preds = db.query(Prediction).limit(5).all()
    sample_nums = db.query(PredictionNumber).limit(5).all()

    def normalize_p(p):
        s = getattr(p, "settings", {}) or {}
        if isinstance(s, str):
            try:
                s = json.loads(s)
            except Exception:
                pass
        return {
            "prediction_id": getattr(p, "prediction_id", None) or getattr(p, "id", None),
            "user_id": getattr(p, "user_id", None),
            "draw_number": getattr(p, "draw_number", None),
            "settings": s,
            "created_at": str(getattr(p, "created_at", None)),
        }

    def normalize_n(n):
        nums = getattr(n, "numbers", None)
        if isinstance(nums, str):
            try:
                nums = json.loads(nums)
            except Exception:
                pass
        return {
            "id": getattr(n, "id", None),
            "prediction_id": getattr(n, "prediction_id", None),
            "numbers": nums,
            "bonus_number": getattr(n, "bonus_number", None),
        }

    sample_preds_norm = [normalize_p(pp) for pp in sample_preds]
    sample_nums_norm = [normalize_n(nn) for nn in sample_nums]

    user_count = None
    if user_id is not None:
        user_count = db.query(Prediction).filter(Prediction.user_id == user_id).count()

    return {
        "total_predictions": total_preds,
        "total_prediction_numbers": total_nums,
        "sample_predictions": sample_preds_norm,
        "sample_prediction_numbers": sample_nums_norm,
        "user_prediction_count": user_count,
    }