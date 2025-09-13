from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
import secrets
import hashlib
from dotenv import load_dotenv

from database import get_db
from models import User, PasswordResetToken
from schemas import User as UserSchema

load_dotenv()

# Configurações JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuração de hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha está correta."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gera hash da senha."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria token JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """Verifica e decodifica o token JWT."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Autentica usuário com email e senha."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Busca usuário por email."""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, email: str, password: str, full_name: str) -> User:
    """Cria novo usuário."""
    hashed_password = get_password_hash(password)
    db_user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency para obter usuário atual autenticado."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        email = verify_token(token)
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency para obter usuário ativo atual."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Funções de recuperação de senha
def generate_reset_token() -> str:
    """Gera um token seguro para recuperação de senha."""
    return secrets.token_urlsafe(32)

def hash_token(token: str) -> str:
    """Gera hash do token para armazenamento seguro."""
    return hashlib.sha256(token.encode()).hexdigest()

def create_password_reset_token(db: Session, user_id: str) -> str:
    """Cria um token de recuperação de senha para o usuário."""
    # Invalidar tokens existentes
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).update({"used": True})
    
    # Gerar novo token
    token = generate_reset_token()
    token_hash = hash_token(token)
    
    # Criar registro no banco
    reset_token = PasswordResetToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(hours=1),  # Expira em 1 hora
        used=False
    )
    
    db.add(reset_token)
    db.commit()
    
    return token

def validate_reset_token(db: Session, token: str) -> Optional[PasswordResetToken]:
    """Valida um token de recuperação de senha."""
    token_hash = hash_token(token)
    
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    return reset_token

def use_reset_token(db: Session, token: str) -> bool:
    """Marca um token de recuperação como usado."""
    reset_token = validate_reset_token(db, token)
    if not reset_token:
        return False
    
    reset_token.used = True
    db.commit()
    return True

def update_user_password(db: Session, user_id: str, new_password: str) -> bool:
    """Atualiza a senha do usuário."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    user.hashed_password = get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    db.commit()
    return True