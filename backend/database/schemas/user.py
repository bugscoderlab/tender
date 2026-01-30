from pydantic import BaseModel, EmailStr, Json
from typing import List, Optional

class UserSkillSchema(BaseModel):
    id: int
    name: Optional[str] = None
    level: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserSchema(BaseModel):
    id: int
    name: str
    email: str
    role: str
    remark: Optional[str] = None
    status: int
    
    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    users: List[UserSchema]
    message: str = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginUser(BaseModel):
    id: int
    name: str | None
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: LoginUser

class RegisterRequest(BaseModel):
    name: str | None = None
    email: EmailStr
    password: str
    role: str = "jmb"

class RegisterUpdateRequest(BaseModel):
    email: EmailStr
    remark: dict | str

class RegisterResponse(BaseModel):
    id: int
    name: str | None
    email: EmailStr
    role: str
    remark: Optional[Json] = None

    class Config:
        from_attributes = True