# 📘 Documento 2 – Prompts para Agente de IA

## 🔹 Estrutura
Os prompts são **incrementais**, cada um é focado em uma tarefa. Sugiro que você copie e cole no Replit AI ou outro agente.  
Cada prompt já vem com um campo para você **marcar conclusão** ✅.

---

## **Prompts – Fase 1**

### **1. Setup do Projeto**
```
Você é um agente especializado em desenvolvimento. Configure um projeto chamado OrthoFlow com:

- Backend em Python com FastAPI.
- Banco PostgreSQL com suporte a migrações.
- Frontend React já existente no repositório (https://github.com/thiagoraheem/OrthoFlow).
- Autenticação JWT com cadastro/login de usuários.

Após concluir, descreva os arquivos criados e como rodar o projeto.

[x] Concluído
```

**✅ Implementação realizada:**
- **Backend FastAPI**: Estrutura completa em `fastapi_server/`
- **Banco de dados**: SQLite com Alembic para migrações
- **Autenticação JWT**: Endpoints `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **Frontend integrado**: AuthContext atualizado para usar a API
- **CORS configurado**: Comunicação entre frontend (localhost:5173) e backend (localhost:8000)
- **Modelos implementados**: User, Doctor, Patient, Appointment, etc.
- **Como rodar**: 
  - Backend: `cd fastapi_server && python -m uvicorn main:app --reload`
  - Frontend: `npx vite` (na raiz do projeto)

### **2. Módulo Paciente**
```
Implemente o CRUD de Pacientes no backend FastAPI com PostgreSQL:

- Campos: nome, CPF, data de nascimento, e-mail, telefone, endereço, alergias, convênio_id.
- Criar modelo "PlanoSaude" para associação (id, operadora, nome do plano, vigência).
- Endpoints REST: criar, atualizar, listar, buscar por nome/CPF.
- Validações de CPF e e-mail.
- Testes unitários básicos.

No frontend (React):
- Tela de cadastro de paciente.
- Tela de listagem com busca.

[x] Concluído
```

**✅ Implementação realizada:**
- **Backend**: Modelos Patient e InsurancePlan com relacionamento
- **Endpoints**: CRUD completo em `/api/patients` e `/api/insurance-plans`
- **Validações**: CPF e e-mail implementadas
- **Frontend**: Formulário de cadastro e listagem com busca
- **Funcionalidades**: Filtros por nome, CPF, convênio e status

---

## **Migração PostgreSQL - Janeiro 2025**

### **Configuração realizada**
- **Host**: 54.232.194.197
- **Database**: orthoflow
- **User**: postgres
- **Password**: Blomaq2025$
- **Port**: 5432 (padrão)

### **Alterações implementadas**
1. **Dependências**: psycopg2-binary já estava no requirements.txt
2. **Configuração do banco**: Atualizada em `database.py` e `.env`
3. **Migrações**: Executadas com sucesso via `python -m alembic upgrade head`
4. **Testes**: Autenticação funcionando corretamente (registro, login, /me)
5. **Pool de conexões**: Configurado com `pool_pre_ping=True` e `pool_recycle=300`

### **Status da migração**
✅ **Concluída com sucesso** - Sistema funcionando completamente com PostgreSQL

### **Comandos de migração utilizados**
```bash
# Atualizar configurações
# Editar fastapi_server/.env e database.py

# Executar migrações
cd fastapi_server
python -m alembic upgrade head

# Reiniciar servidor
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Testar funcionalidades
# Registro, login e endpoints funcionando normalmente
```

---

## **Configurações Técnicas Implementadas**

### **Backend FastAPI**
- **Estrutura de pastas**: `fastapi_server/` com routers organizados
- **Banco de dados**: SQLite (`orthoflow.db`) com Alembic para migrações
- **Autenticação**: JWT com bcrypt para hash de senhas
- **CORS**: Configurado para `localhost:5173` e `localhost:3000`
- **Endpoints principais**:
  - `POST /api/auth/register` - Cadastro de usuários
  - `POST /api/auth/login` - Login com email/senha
  - `GET /api/auth/me` - Dados do usuário autenticado
  - `POST /api/auth/refresh` - Renovação de token

### **Frontend React**
- **AuthContext**: Integrado com API FastAPI
- **Token storage**: localStorage com chave `orthocare_token`
- **API client**: Configurado em `lib/queryClient.ts` com headers de autorização
- **URL base**: `http://localhost:8000/api`

### **Variáveis de ambiente**
```env
# fastapi_server/.env
SECRET_KEY=orthoflow-super-secret-key-change-in-production-2024
DATABASE_URL=postgresql://postgres:Blomaq2025$@54.232.194.197/orthoflow
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### **Comandos úteis**
```bash
# Iniciar backend
cd fastapi_server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Iniciar frontend
npx vite

# Executar migrações (PostgreSQL)
cd fastapi_server
python -m alembic upgrade head

# Criar usuário via API
curl -X POST "http://localhost:8000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@orthoflow.com", "password": "admin123", "full_name": "Administrador"}'

# Testar login
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@orthoflow.com", "password": "admin123"}'
```

### **3. Agenda**
```
Implemente o módulo de Agenda:

- Modelo "Profissional" (id, nome, especialidade, CRM/COREN/etc.).
- Modelo "Agendamento" (id, paciente_id, profissional_id, data/hora, status).
- Endpoints: criar, listar por profissional/data, remarcar, cancelar.
- No frontend: tela de calendário semanal com agendamentos por profissional.

[x] Concluído
```

**✅ Implementação realizada:**
- **Backend**: Modelos Doctor, Appointment, AppointmentType e ClinicRoom
- **Endpoints**: CRUD completo em `/api/doctors`, `/api/appointments`, `/api/appointment-types`, `/api/clinic-rooms`
- **Funcionalidades**: Agendamento com validação de conflitos, status de consulta
- **Frontend**: Interface de agendamentos com formulário e listagem
- **Recursos**: Filtros por médico, paciente, data e status

### **4. Prontuário Ortopédico**
```
Crie o módulo de Prontuário Ortopédico:

- Modelo "Prontuario" (id, paciente_id, profissional_id, data, anamnese, exame_fisico, cid10, prescricoes, atestados).
- Integração com tabela CID-10 (mock inicial em JSON).
- Endpoints: criar, atualizar, listar por paciente.
- Frontend: tela com formulário e campos estruturados.

[ ] Concluído
```

### **5. Faturamento Particular**
```
Implemente faturamento para atendimentos particulares:

- Modelo "Fatura" (id, paciente_id, valor, data, status).
- Integração com Stripe ou Pagar.me (simulação inicial).
- Endpoint: gerar fatura e atualizar status após pagamento.
- Frontend: tela de geração de fatura e status de pagamento.

[ ] Concluído
```

---

## **Correções e Melhorias Implementadas**

### **Correção de Campos da API (Janeiro 2025)**
```
Corrigir incompatibilidade entre campos camelCase (frontend) e snake_case (backend):

- Problema: Campos como roomNumber, roomType, isAvailable não existiam na API
- Solução: Atualizar frontend para usar room_number, room_type, is_available
- Arquivos corrigidos: rooms.tsx, appointment-form.tsx
- Validação: Função getRoomTypeColor com tratamento de campos indefinidos

[x] Concluído
```

### **Correção de SelectItem com Value Vazio (Janeiro 2025)**
```
Resolver erro do plugin runtime-error-plugin com SelectItem value="":

- Problema: SelectItem não pode ter prop value com string vazia
- Solução: Substituir value="" por value="none" em formulários
- Arquivos corrigidos: patient-form.tsx, appointment-form.tsx
- Lógica: Conversão de "none" para null antes de enviar para API

[x] Concluído
```

```
