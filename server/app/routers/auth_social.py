from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from urllib.parse import urlencode
from jose import jwt, JWTError
import os, secrets, httpx

from ..database import SessionLocal
from ..models_user import User
from ..security import hash_password, create_access_token, JWT_SECRET, JWT_ALG

router = APIRouter(prefix="/auth", tags=["auth-social"])
bearer = HTTPBearer(auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

def get_user_from_app_token(app_token: str | None, db: Session) -> User | None:
    if not app_token:
        return None
    try:
        payload = jwt.decode(app_token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
        return None
    email = payload.get("sub")
    if not email:
        return None
    return db.query(User).filter(User.email == email).first()

@router.get("/social/status")
def social_status(
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
        raise HTTPException(status_code=401, detail="User not found")

    rows = db.execute(
        text("SELECT provider FROM SocialAccount WHERE user_id = :uid"),
        {"uid": user.id},
    ).fetchall()
    providers = {row[0] for row in rows}
    return {"naver": "naver" in providers, "kakao": "kakao" in providers}

@router.delete("/social/{provider}")
def unlink_social(
    provider: str,
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    if provider not in {"naver", "kakao"}:
        raise HTTPException(status_code=400, detail="Invalid provider")

    if cred is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        email = jwt.decode(cred.credentials, JWT_SECRET, algorithms=[JWT_ALG]).get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    social_count = db.execute(
        text("SELECT COUNT(*) FROM SocialAccount WHERE user_id=:uid"),
        {"uid": user.id},
    ).scalar()

    if social_count <= 1:
        raise HTTPException(status_code=400, detail="최소 1개의 로그인 수단은 남아 있어야 합니다.")

    db.execute(
        text("DELETE FROM SocialAccount WHERE user_id = :uid AND provider = :p"),
        {"uid": user.id, "p": provider},
    )
    db.commit()
    return {"ok": True}

def _state_token(link: int, app_token: str | None) -> str:
    return jwt.encode({"link": int(link), "app_token": app_token or ""}, JWT_SECRET, algorithm=JWT_ALG)

def _parse_state(state: str) -> tuple[int, str | None]:
    try:
        data = jwt.decode(state, JWT_SECRET, algorithms=[JWT_ALG])
        return int(data.get("link") or 0), data.get("app_token")
    except JWTError:
        return 0, None

@router.get("/naver/login")
def naver_login(
    link: int = Query(0),
    app_token: str | None = Query(None),
):
    cid = os.getenv("NAVER_CLIENT_ID")
    redirect_uri = os.getenv("NAVER_REDIRECT_URI")
    state = _state_token(link, app_token)
    url = "https://nid.naver.com/oauth2.0/authorize?" + urlencode(
        {
            "response_type": "code",
            "client_id": cid,
            "redirect_uri": redirect_uri,
            "state": state,
        }
    )
    return {"auth_url": url}

@router.get("/naver/callback")
async def naver_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    cid = os.getenv("NAVER_CLIENT_ID")
    csec = os.getenv("NAVER_CLIENT_SECRET")

    token_url = "https://nid.naver.com/oauth2.0/token?" + urlencode(
        {
            "grant_type": "authorization_code",
            "client_id": cid,
            "client_secret": csec,
            "code": code,
            "state": state,
        }
    )

    async with httpx.AsyncClient() as client:
        t_res = await client.get(token_url, timeout=10)
        t_res.raise_for_status()
        access_token = t_res.json().get("access_token")

        p_res = await client.get(
            "https://openapi.naver.com/v1/nid/me",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        p_res.raise_for_status()
        profile = p_res.json()["response"]

    link, app_token = _parse_state(state)
    provider_uid = profile["id"]
    email = profile.get("email")
    name = profile.get("name") or "네이버사용자"

    if link:
        current = get_user_from_app_token(app_token, db)
        if not current:
            raise HTTPException(status_code=400, detail="link mode requires valid app_token")

        exists = db.execute(
            text("SELECT 1 FROM SocialAccount WHERE provider=:p AND provider_uid=:u LIMIT 1"),
            {"p": "naver", "u": provider_uid},
        ).first()
        if not exists:
            db.execute(
                text("INSERT INTO SocialAccount (user_id, provider, provider_uid) VALUES (:uid, :p, :u)"),
                {"uid": current.id, "p": "naver", "u": provider_uid},
            )
            db.commit()
        return RedirectResponse(url=f"{FRONTEND_ORIGIN}/mypage/account?linked=naver", status_code=302)

    user = upsert_social_user(
        db=db,
        provider="naver",
        provider_uid=provider_uid,
        email=email,
        name=name,
    )
    token = create_access_token(user.email)
    return RedirectResponse(url=f"{FRONTEND_ORIGIN}/login?token={token}", status_code=302)

@router.get("/kakao/login")
def kakao_login(
    link: int = Query(0),
    app_token: str | None = Query(None),
):
    rest_key = os.getenv("KAKAO_REST_KEY")
    redirect_uri = os.getenv("KAKAO_REDIRECT_URI")
    state = _state_token(link, app_token)
    url = "https://kauth.kakao.com/oauth/authorize?" + urlencode(
        {
            "response_type": "code",
            "client_id": rest_key,
            "redirect_uri": redirect_uri,
            "state": state,
        }
    )
    return {"auth_url": url}

@router.get("/kakao/callback")
async def kakao_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    rest_key = os.getenv("KAKAO_REST_KEY")
    secret = os.getenv("KAKAO_CLIENT_SECRET", "")
    redirect_uri = os.getenv("KAKAO_REDIRECT_URI")

    async with httpx.AsyncClient() as client:
        data = {
            "grant_type": "authorization_code",
            "client_id": rest_key,
            "redirect_uri": redirect_uri,
            "code": code,
        }
        if secret:
            data["client_secret"] = secret

        t_res = await client.post("https://kauth.kakao.com/oauth/token", data=data, timeout=10)
        t_res.raise_for_status()
        access_token = t_res.json()["access_token"]

        p_res = await client.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        p_res.raise_for_status()
        p = p_res.json()
        acc = p.get("kakao_account", {})

    link, app_token = _parse_state(state)
    provider_uid = str(p["id"])
    email = acc.get("email")
    name = (acc.get("profile") or {}).get("nickname") or "카카오사용자"

    if link:
        current = get_user_from_app_token(app_token, db)
        if not current:
            raise HTTPException(status_code=400, detail="link mode requires valid app_token")

        exists = db.execute(
            text("SELECT 1 FROM SocialAccount WHERE provider=:p AND provider_uid=:u LIMIT 1"),
            {"p": "kakao", "u": provider_uid},
        ).first()
        if not exists:
            db.execute(
                text("INSERT INTO SocialAccount (user_id, provider, provider_uid) VALUES (:uid, :p, :u)"),
                {"uid": current.id, "p": "kakao", "u": provider_uid},
            )
            db.commit()
        return RedirectResponse(url=f"{FRONTEND_ORIGIN}/mypage/account?linked=kakao", status_code=302)

    user = upsert_social_user(
        db=db,
        provider="kakao",
        provider_uid=provider_uid,
        email=email,
        name=name,
    )
    token = create_access_token(user.email)
    return RedirectResponse(url=f"{FRONTEND_ORIGIN}/login?token={token}", status_code=302)

def upsert_social_user(
    db: Session, provider: str, provider_uid: str, email: str | None, name: str
):
    row = db.execute(
        text(
            """
            SELECT user_id
              FROM SocialAccount
             WHERE provider = :p AND provider_uid = :u
             LIMIT 1
            """
        ),
        {"p": provider, "u": provider_uid},
    ).first()

    if row:
        user_id = row[0] if isinstance(row, tuple) else getattr(row, "user_id", None)
        return db.query(User).filter(User.id == user_id).first()

    if email:
        u = db.query(User).filter(User.email == email).first()
        if u:
            db.execute(
                text(
                    """
                    INSERT INTO SocialAccount (user_id, provider, provider_uid)
                    VALUES (:uid, :p, :u)
                    """
                ),
                {"uid": u.id, "p": provider, "u": provider_uid},
            )
            db.commit()
            return u

    dummy_hash = hash_password(secrets.token_urlsafe(32))
    placeholder_email = email or f"{provider}_{provider_uid}@noreply.social"

    u = User(
        email=placeholder_email,
        password_hash=dummy_hash,
        name=name,
        phone=None,
        marketing_agree=0,
        privacy_agree=1,
    )
    db.add(u)
    db.commit()
    db.refresh(u)

    db.execute(
        text(
            """
            INSERT INTO SocialAccount (user_id, provider, provider_uid)
            VALUES (:uid, :p, :u)
            """
        ),
        {"uid": u.id, "p": provider, "u": provider_uid},
    )
    db.commit()
    return u