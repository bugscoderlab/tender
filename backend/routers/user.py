from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from database.connection import get_db
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv
import os

load_dotenv()

from database.models.user import User
from database.schemas.user import UserSchema, UserListResponse, LoginResponse, RegisterResponse, RegisterRequest, RegisterUpdateRequest
import json
from dependencies import get_current_user

router = APIRouter()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=UserListResponse)
def user_list(session: Session = Depends(get_db)):
    try:
        users = session.query(User).all()
        if users:
            [print(f"Found user: {user.name}") for user in users]
            
            return {"users": [UserSchema.model_validate(user).model_dump() for user in users]}
        else:
            return {"message": "No users found", "users": []}
    except Exception as e:
        print(f"Error retrieving users: {str(e)}")
        return {"error": "Failed to retrieve users", "details": str(e)}
    
@router.post("/login", response_model=LoginResponse)
def login(
    # login_data: LoginRequest, 
    login_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_db)
):
    user = (
        session.query(User)
        .filter(User.email == login_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password 1"
        )

    if not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password 2"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "user": user
    }

@router.post("/register", response_model=RegisterResponse)
def register(
    data: RegisterRequest,
    session: Session = Depends(get_db)
):
    existing_user = (
        session.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        role=data.role
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return new_user

@router.post("/register/update", response_model=RegisterResponse)
def update_register(
    data: RegisterUpdateRequest,
    session: Session = Depends(get_db)
):
    user = (
        session.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    if user.status != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered or invalid status"
        )

    # Update remark and status
    if isinstance(data.remark, dict):
        user.remark = json.dumps(data.remark)
    else:
        user.remark = data.remark
        
    user.status = 1
    
    session.commit()
    session.refresh(user)
    
    return user

