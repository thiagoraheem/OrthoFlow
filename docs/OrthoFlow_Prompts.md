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
- Dockerfile para backend e frontend.
- Autenticação JWT com cadastro/login de usuários.

Após concluir, descreva os arquivos criados e como rodar o projeto.

[ ] Concluído
```

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
