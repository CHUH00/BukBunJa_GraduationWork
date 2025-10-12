<<<<<<< HEAD
<<<<<<< HEAD
import os
from fastapi import (
    APIRouter, Depends, HTTPException, UploadFile, File, Form
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from ..database import SessionLocal
from ..models_user import User
from ..security import verify_password, hash_password, JWT_SECRET, JWT_ALG

router = APIRouter(prefix="/users", tags=["users"])
bearer = HTTPBearer(auto_error=False)

# 업로드 경로
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ----------------------
# DB 연결
# ----------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------
# 현재 사용자 확인
# ----------------------
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


# ----------------------
# 프로필 수정
# ----------------------
@router.patch("/me")
async def update_me(
    name: str = Form(None),
    password: str = Form(None),
    password_confirm: str = Form(None),
    avatar: UploadFile | None = File(None),
    avatar_reset: bool = Form(False),
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    user = get_current_user(cred, db)

    # 이름 업데이트
    if name is not None:
        user.name = name

    # 비밀번호 업데이트
    if password or password_confirm:
        if not password or not password_confirm:
            raise HTTPException(status_code=400, detail="비밀번호와 확인이 필요합니다.")
        if password != password_confirm:
            raise HTTPException(status_code=400, detail="비밀번호가 일치하지 않습니다.")
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="비밀번호는 8자 이상이어야 합니다.")
        user.password_hash = hash_password(password)

    # 프로필 이미지 초기화
    if avatar_reset:
        user.avatar = None

    # 아바타 업로드 처리
    elif avatar:
        safe_name = os.path.basename(avatar.filename)
        filename = f"{user.id}_{safe_name}"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as f:
            f.write(await avatar.read())
        user.avatar = f"/uploads/{filename}"

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar": user.avatar
    }


# ----------------------
# 회원 탈퇴
# ----------------------
@router.delete("/me")
def delete_me(
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    user = get_current_user(cred, db)
    db.delete(user)
    db.commit()
    return {"ok": True}
||||||| empty tree
=======
from fastapi import APIRouter, Depends, HTTPException
||||||| af82d5f
from fastapi import APIRouter, Depends, HTTPException
=======
import os
from fastapi import (
    APIRouter, Depends, HTTPException, UploadFile, File, Form
)
>>>>>>> 73e5c31d27de940a62cc3611260f0f9cf3a89c15
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from ..database import SessionLocal
from ..models_user import User
from ..security import verify_password, hash_password, JWT_SECRET, JWT_ALG

router = APIRouter(prefix="/users", tags=["users"])
bearer = HTTPBearer(auto_error=False)

# 업로드 경로
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ----------------------
# DB 연결
# ----------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------
# 현재 사용자 확인
# ----------------------
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


# ----------------------
# 프로필 수정
# ----------------------
@router.patch("/me")
async def update_me(
    name: str = Form(None),
    password: str = Form(None),
    password_confirm: str = Form(None),
    avatar: UploadFile | None = File(None),
    avatar_reset: bool = Form(False),
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    user = get_current_user(cred, db)

    # 이름 업데이트
    if name is not None:
        user.name = name

    # 비밀번호 업데이트
    if password or password_confirm:
        if not password or not password_confirm:
            raise HTTPException(status_code=400, detail="비밀번호와 확인이 필요합니다.")
        if password != password_confirm:
            raise HTTPException(status_code=400, detail="비밀번호가 일치하지 않습니다.")
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="비밀번호는 8자 이상이어야 합니다.")
        user.password_hash = hash_password(password)

    # 프로필 이미지 초기화
    if avatar_reset:
        user.avatar = None

    # 아바타 업로드 처리
    elif avatar:
        safe_name = os.path.basename(avatar.filename)
        filename = f"{user.id}_{safe_name}"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as f:
            f.write(await avatar.read())
        user.avatar = f"/uploads/{filename}"

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar": user.avatar
    }


# ----------------------
# 회원 탈퇴
# ----------------------
@router.delete("/me")
def delete_me(
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    user = get_current_user(cred, db)
    db.delete(user)
    db.commit()
    return {"ok": True}
>>>>>>> coolmean
