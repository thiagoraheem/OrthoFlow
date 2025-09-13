from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from database import get_db
from schemas import (
    UserCreate, UserLogin, Token, User as UserSchema,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ValidateResetTokenRequest, ValidateResetTokenResponse,
    ResetPasswordRequest, ResetPasswordResponse
)
from auth import (
    authenticate_user, create_user, get_current_user, get_current_active_user, create_access_token,
    get_user_by_email, create_password_reset_token, validate_reset_token,
    use_reset_token, update_user_password, ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta
from models import User
from email_service import email_service

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Endpoint para cadastro de novos usuários."""
    
    # Verificar se usuário já existe
    existing_user = get_user_by_email(db, email=user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Criar novo usuário
    try:
        user = create_user(
            db=db,
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )
    
    # Criar token de acesso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserSchema.from_orm(user)
    }

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Endpoint para login de usuários."""
    
    # Autenticar usuário
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar se usuário está ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Criar token de acesso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserSchema.from_orm(user)
    }

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: UserSchema = Depends(get_current_active_user)):
    """Endpoint para obter dados do usuário atual."""
    return current_user

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: UserSchema = Depends(get_current_active_user)):
    """Endpoint para renovar token de acesso."""
    
    # Criar novo token de acesso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": current_user
    }

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Endpoint para solicitar recuperação de senha."""
    
    # Verificar se usuário existe
    user = get_user_by_email(db, email=request.email)
    if not user:
        # Por segurança, sempre retornar sucesso mesmo se email não existir
        return ForgotPasswordResponse(
            message="Se o email estiver cadastrado, você receberá um link de recuperação.",
            success=True
        )
    
    # Verificar se usuário está ativo
    if not user.is_active:
        return ForgotPasswordResponse(
            message="Se o email estiver cadastrado, você receberá um link de recuperação.",
            success=True
        )
    
    try:
        # Criar token de recuperação
        reset_token = create_password_reset_token(db, str(user.id))
        
        # Enviar email com o token
        try:
            email_sent = email_service.send_password_reset_email(
                to_email=user.email,
                reset_token=reset_token,
                user_name=user.full_name
            )
            
            if email_sent:
                print(f"Email de recuperação enviado para {request.email}")
            else:
                print(f"Falha ao enviar email para {request.email}. Token: {reset_token}")
                
        except Exception as e:
            print(f"Erro ao enviar email: {e}. Token: {reset_token}")
        
        return ForgotPasswordResponse(
            message="Se o email estiver cadastrado, você receberá um link de recuperação.",
            success=True
        )
    except Exception as e:
        print(f"Error creating reset token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/validate-reset-token", response_model=ValidateResetTokenResponse)
async def validate_reset_token_endpoint(request: ValidateResetTokenRequest, db: Session = Depends(get_db)):
    """Endpoint para validar token de recuperação de senha."""
    
    # Validar token
    reset_token = validate_reset_token(db, token=request.token)
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    # Buscar usuário
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return ValidateResetTokenResponse(
        valid=True,
        message="Token válido",
        email=user.email
    )

@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Endpoint para redefinir senha usando token de recuperação."""
    
    # Validar token
    reset_token = validate_reset_token(db, token=request.token)
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    # Buscar usuário
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Atualizar senha
    success = update_user_password(db, str(user.id), request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar senha"
        )
    
    # Marcar token como usado
    use_reset_token(db, request.token)
    
    return ResetPasswordResponse(
        message="Senha redefinida com sucesso",
        success=True
    )