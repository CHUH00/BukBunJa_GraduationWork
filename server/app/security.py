<<<<<<< HEAD
import os
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
ACCESS_TOKEN_EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MIN", "1440"))

MAX_BCRYPT_BYTES = 72

def hash_password(pw: str) -> str:
    if len(pw.encode("utf-8")) > MAX_BCRYPT_BYTES:
        raise ValueError("비밀번호는 최대 72바이트까지만 가능합니다.")
    return pwd_ctx.hash(pw)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain[:MAX_BCRYPT_BYTES], hashed)

def create_access_token(sub: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MIN)
    return jwt.encode({"sub": sub, "exp": exp}, JWT_SECRET, algorithm=JWT_ALG)
||||||| empty tree
=======
import os
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
ACCESS_TOKEN_EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MIN", "1440"))

MAX_BCRYPT_BYTES = 72

def hash_password(pw: str) -> str:
    if len(pw.encode("utf-8")) > MAX_BCRYPT_BYTES:
        raise ValueError("비밀번호는 최대 72바이트까지만 가능합니다.")
    return pwd_ctx.hash(pw)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain[:MAX_BCRYPT_BYTES], hashed)

def create_access_token(sub: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MIN)
    return jwt.encode({"sub": sub, "exp": exp}, JWT_SECRET, algorithm=JWT_ALG)
>>>>>>> coolmean
