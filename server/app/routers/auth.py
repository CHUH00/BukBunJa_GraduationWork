from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from pydantic import BaseModel, field_validator

from ..database import SessionLocal
from ..models_user import User
from ..schemas_auth import RegisterIn, LoginIn, UserOut
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    JWT_SECRET,
    JWT_ALG,
    MAX_BCRYPT_BYTES,
)

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=UserOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    if not payload.privacy_agree:
        raise HTTPException(status_code=400, detail="개인정보 수집 및 이용에 동의해야 합니다.")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

    if len(payload.password.encode("utf-8")) > MAX_BCRYPT_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"비밀번호는 최대 {MAX_BCRYPT_BYTES}바이트까지만 가능합니다."
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        phone=payload.phone,
        marketing_agree=1 if payload.marketing_agree else 0,
        privacy_agree=1 if payload.privacy_agree else 0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

    try:
        if not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=400, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"비밀번호는 최대 {MAX_BCRYPT_BYTES}바이트까지만 가능합니다."
        )

    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    if cred is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(cred.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


class SetPasswordIn(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("비밀번호는 8자 이상이어야 합니다.")
        if len(v.encode("utf-8")) > MAX_BCRYPT_BYTES:
            raise ValueError(f"비밀번호는 최대 {MAX_BCRYPT_BYTES}바이트까지만 가능합니다.")
        return v


@router.post("/set-password")
def set_password(
    payload: SetPasswordIn,
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    if cred is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        email = jwt.decode(cred.credentials, JWT_SECRET, algorithms=[JWT_ALG]).get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.password)
    db.add(user)
    db.commit()
    return {"ok": True}