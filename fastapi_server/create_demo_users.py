import asyncio
import bcrypt
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from models import User, Base
import os
from dotenv import load_dotenv
import uuid

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do banco de dados
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Blomaq2025$@54.232.194.197/orthoflow"
)

# Criar engine e sessão
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def hash_password(password: str) -> str:
    """Hash da senha usando bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_demo_users():
    """Criar usuários de demonstração"""
    db = SessionLocal()
    
    try:
        # Dados dos usuários de demonstração
        demo_users = [
            {
                "email": "admin@orthoflow.com",
                "password": "admin123",
                "full_name": "Administrador",
                "is_superuser": True
            },
            {
                "email": "medico@orthoflow.com",
                "password": "medico123",
                "full_name": "Médico",
                "is_superuser": False
            },
            {
                "email": "atendente@orthoflow.com",
                "password": "atendente123",
                "full_name": "Atendente",
                "is_superuser": False
            },
            {
                "email": "controlador@orthoflow.com",
                "password": "controlador123",
                "full_name": "Controlador",
                "is_superuser": False
            }
        ]
        
        for user_data in demo_users:
            # Verificar se o usuário já existe
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing_user:
                print(f"Usuário {user_data['email']} já existe. Atualizando senha...")
                # Atualizar senha do usuário existente
                existing_user.hashed_password = hash_password(user_data["password"])
                existing_user.full_name = user_data["full_name"]
                existing_user.is_superuser = user_data["is_superuser"]
                existing_user.is_active = True
            else:
                print(f"Criando usuário {user_data['email']}...")
                # Criar novo usuário
                new_user = User(
                    id=uuid.uuid4(),
                    email=user_data["email"],
                    hashed_password=hash_password(user_data["password"]),
                    full_name=user_data["full_name"],
                    is_active=True,
                    is_superuser=user_data["is_superuser"]
                )
                db.add(new_user)
        
        # Salvar alterações
        db.commit()
        print("\n✅ Usuários de demonstração criados/atualizados com sucesso!")
        
        # Listar usuários criados
        print("\n📋 Usuários disponíveis:")
        users = db.query(User).all()
        for user in users:
            print(f"  - {user.email} ({user.full_name}) - Ativo: {user.is_active}")
            
    except Exception as e:
        print(f"❌ Erro ao criar usuários: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Criando usuários de demonstração...")
    create_demo_users()
    print("\n✨ Processo concluído!")