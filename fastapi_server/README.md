# OrthoFlow FastAPI Backend

Backend da aplicação OrthoFlow desenvolvido em Python com FastAPI.

## Características

- **Framework:** FastAPI
- **Banco de dados:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrações:** Alembic
- **Autenticação:** JWT (JSON Web Tokens)
- **Documentação:** Swagger UI automática

## Estrutura do Projeto

```
fastapi_server/
├── alembic/                 # Configurações e migrações do banco
│   ├── versions/           # Arquivos de migração
│   ├── env.py             # Configuração do ambiente Alembic
│   └── script.py.mako     # Template para migrações
├── routers/                # Routers da API
│   ├── auth.py            # Autenticação e autorização
│   ├── patients.py        # Gestão de pacientes
│   ├── doctors.py         # Gestão de médicos
│   ├── appointments.py    # Gestão de agendamentos
│   ├── clinic_rooms.py    # Gestão de salas clínicas
│   ├── appointment_types.py # Tipos de consulta
│   └── insurance_plans.py # Planos de saúde
├── main.py                 # Aplicação principal
├── models.py              # Modelos SQLAlchemy
├── schemas.py             # Schemas Pydantic
├── database.py            # Configuração do banco
├── auth.py                # Utilitários de autenticação
├── requirements.txt       # Dependências Python
├── alembic.ini           # Configuração Alembic
└── .env.example          # Exemplo de variáveis de ambiente
```

## Instalação

### Pré-requisitos

- Python 3.8+
- PostgreSQL 12+
- pip

### Passos de Instalação

1. **Clone o repositório:**
   ```bash
   cd C:/Projetos/OrthoFlow/fastapi_server
   ```

2. **Crie um ambiente virtual:**
   ```bash
   python -m venv venv
   ```

3. **Ative o ambiente virtual:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

4. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações.

6. **Configure o banco de dados PostgreSQL:**
   - Crie um banco de dados chamado `orthoflow_db`
   - Atualize a `DATABASE_URL` no arquivo `.env`

7. **Execute as migrações:**
   ```bash
   alembic upgrade head
   ```

## Execução

### Desenvolvimento

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Produção

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

## Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário atual
- `POST /api/auth/refresh` - Renovar token

### Pacientes
- `GET /api/patients/` - Listar pacientes
- `POST /api/patients/` - Criar paciente
- `GET /api/patients/{id}` - Obter paciente
- `PUT /api/patients/{id}` - Atualizar paciente
- `DELETE /api/patients/{id}` - Deletar paciente

### Médicos
- `GET /api/doctors/` - Listar médicos
- `POST /api/doctors/` - Criar médico
- `GET /api/doctors/{id}` - Obter médico
- `PUT /api/doctors/{id}` - Atualizar médico
- `DELETE /api/doctors/{id}` - Deletar médico

### Agendamentos
- `GET /api/appointments/` - Listar agendamentos
- `POST /api/appointments/` - Criar agendamento
- `GET /api/appointments/{id}` - Obter agendamento
- `PUT /api/appointments/{id}` - Atualizar agendamento
- `DELETE /api/appointments/{id}` - Cancelar agendamento

### Salas Clínicas
- `GET /api/clinic-rooms/` - Listar salas
- `POST /api/clinic-rooms/` - Criar sala
- `GET /api/clinic-rooms/{id}` - Obter sala
- `PUT /api/clinic-rooms/{id}` - Atualizar sala
- `DELETE /api/clinic-rooms/{id}` - Deletar sala

### Tipos de Consulta
- `GET /api/appointment-types/` - Listar tipos
- `POST /api/appointment-types/` - Criar tipo
- `GET /api/appointment-types/{id}` - Obter tipo
- `PUT /api/appointment-types/{id}` - Atualizar tipo
- `DELETE /api/appointment-types/{id}` - Deletar tipo

### Planos de Saúde
- `GET /api/insurance-plans/` - Listar planos
- `POST /api/insurance-plans/` - Criar plano
- `GET /api/insurance-plans/{id}` - Obter plano
- `PUT /api/insurance-plans/{id}` - Atualizar plano
- `DELETE /api/insurance-plans/{id}` - Deletar plano

## Migrações do Banco de Dados

### Criar nova migração
```bash
alembic revision --autogenerate -m "Descrição da migração"
```

### Aplicar migrações
```bash
alembic upgrade head
```

### Reverter migração
```bash
alembic downgrade -1
```

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/orthoflow_db` |
| `SECRET_KEY` | Chave secreta para JWT | `your-super-secret-key` |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tempo de expiração do token | `30` |
| `ALLOWED_ORIGINS` | Origins permitidos para CORS | `http://localhost:3000,http://localhost:5173` |

## Desenvolvimento

### Executar testes
```bash
pytest
```

### Verificar código
```bash
flake8 .
black .
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.