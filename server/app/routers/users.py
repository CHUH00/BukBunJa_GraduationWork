from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from ..database import SessionLocal
from ..models_user import User
from ..security import verify_password, hash_password, JWT_SECRET, JWT_ALG

router = APIRouter(prefix="/users", tags=["users"])
bearer = HTTPBearer(auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(cred: HTTPAuthorizationCredentials | None, db: Session) -> User:
    if cred is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        email = jwt.decode(cred.credentials, JWT_SECRET, algorithms=[JWT_ALG]).get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.patch("/me")
def update_me(
    body: dict,
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    user = get_current_user(cred, db)

    name = body.get("name")
    if name is not None:
        user.name = name

    password = body.get("password")
    password_confirm = body.get("password_confirm")
    if password or password_confirm:
        if not password or not password_confirm:
            raise HTTPException(status_code=400, detail="비밀번호와 확인이 필요합니다.")
        if password != password_confirm:
            raise HTTPException(status_code=400, detail="비밀번호가 일치하지 않습니다.")
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="비밀번호는 8자 이상이어야 합니다.")
        user.password_hash = hash_password(password)

    db.add(user); db.commit(); db.refresh(user)
    return {"ok": True}

@router.delete("/me")
def delete_me(
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    user = get_current_user(cred, db)
    db.delete(user)
    db.commit()
    return {"ok": True}