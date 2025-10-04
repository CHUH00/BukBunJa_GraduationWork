from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..security import get_current_user
from ..database import SessionLocal

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdateIn(BaseModel):
    name: str | None = None
    phone: str | None = None
    marketing_agree: bool | None = None

@router.post("/update")
def update_profile(payload: ProfileUpdateIn, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        if payload.name is not None:
            user.name = payload.name
        if payload.phone is not None:
            user.phone = payload.phone
        if payload.marketing_agree is not None:
            user.marketing_agree = 1 if payload.marketing_agree else 0
        db.add(user); db.commit(); db.refresh(user)
        return {"ok": True}
    finally:
        db.close()