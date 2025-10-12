<<<<<<< HEAD
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)
    name: str
    phone: str | None = None
    privacy_agree: bool
    marketing_agree: bool = False


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str
    phone: str | None = None
    marketing_agree: bool
    privacy_agree: bool
    avatar: str | None = None 
||||||| empty tree
=======
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)
    name: str
    phone: str | None = None
    privacy_agree: bool
    marketing_agree: bool = False


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str
    phone: str | None = None
    marketing_agree: bool
<<<<<<< HEAD
    privacy_agree: bool
>>>>>>> coolmean
||||||| af82d5f
    privacy_agree: bool
=======
    privacy_agree: bool
    avatar: str | None = None 
>>>>>>> 73e5c31d27de940a62cc3611260f0f9cf3a89c15
