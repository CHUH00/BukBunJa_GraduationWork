import os
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET", "change-me")
ALGORITHM = os.getenv("JWT_ALG", "HS256")
ACCESS_TOKEN_EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MIN", "1440"))

MAX_BCRYPT_BYTES = 72

def hash_password(pw: str) -> str:
    """
    Hashes the given password after truncating it to the maximum allowed bcrypt byte length.
    """
    truncated_pw = pw.encode("utf-8")[:MAX_BCRYPT_BYTES].decode("utf-8", errors="ignore")
    return pwd_ctx.hash(truncated_pw)

def verify_password(plain: str, hashed: str) -> bool:
    """
    Verifies a plain password against the given hashed password, truncating the plain password as needed.
    """
    truncated_plain = plain.encode("utf-8")[:MAX_BCRYPT_BYTES].decode("utf-8", errors="ignore")
    return pwd_ctx.verify(truncated_plain, hashed)

def create_access_token(subject: str) -> str:
    """
    Creates a JWT access token with the given subject identifier and expiration.
    
    Args:
        subject (str): The subject identifier (usually user ID) to include in the token.
    
    Returns:
        str: Encoded JWT access token.
    """
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MIN)
    return jwt.encode({"sub": subject, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

JWT_SECRET = SECRET_KEY
JWT_ALG = ALGORITHM