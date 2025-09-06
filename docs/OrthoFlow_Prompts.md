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

[ ] Concluído
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
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=sqlite:///./orthoflow.db
```

### **Comandos úteis**
```bash
# Iniciar backend
cd fastapi_server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Iniciar frontend
npx vite

# Criar usuário de teste
python -c "from database import SessionLocal; from auth import create_user; db = SessionLocal(); user = create_user(db, 'admin@orthocare.com', 'admin123', 'Administrador'); print(f'Usuário criado: {user.email}'); db.close()"
```

### **3. Agenda**
```
Implemente o módulo de Agenda:

- Modelo "Profissional" (id, nome, especialidade, CRM/COREN/etc.).
- Modelo "Agendamento" (id, paciente_id, profissional_id, data/hora, status).
- Endpoints: criar, listar por profissional/data, remarcar, cancelar.
- No frontend: tela de calendário semanal com agendamentos por profissional.

[ ] Concluído
```

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
