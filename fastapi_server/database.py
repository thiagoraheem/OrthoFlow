from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Configuração do banco de dados - usando SQLite para desenvolvimento
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./orthoflow.db"
)

# Criar engine do SQLAlchemy
engine = create_engine(DATABASE_URL)

# Criar SessionLocal para interações com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

# Dependency para obter sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()