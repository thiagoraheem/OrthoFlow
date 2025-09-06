# 📘 Documento 1 – Blueprint & Checklist de Desenvolvimento

## 🔹 Status Atual do Projeto
**Última atualização**: Janeiro 2025  
**Fase atual**: MVP v1 - Configuração inicial concluída  

### ✅ Implementado
- **Backend FastAPI**: Estrutura completa com routers organizados
- **Autenticação JWT**: Endpoints de login, registro e verificação de token
- **Banco de dados**: PostgreSQL com Alembic para migrações (migrado do SQLite)
- **Frontend React**: Integração com backend via AuthContext atualizado
- **CORS configurado**: Comunicação frontend-backend funcionando
- **Modelos de dados**: User, Doctor, Patient, Appointment, etc.
- **Infraestrutura**: Configuração PostgreSQL em produção (Host: 54.232.194.197)

### 🔄 Em desenvolvimento
- Módulos de pacientes, agenda e prontuário ortopédico

---

## 🔹 Visão Geral (Blueprint)
- **Nome do Projeto**: OrthoFlow  
- **Escopo Inicial (MVP)**: Gestão de pacientes, agenda, prontuário eletrônico ortopédico, fluxo de densitometria (DXA), convênios/planos, faturamento particular e via TISS (Consulta e SP/SADT).  
- **Tecnologias sugeridas**:  
  - **Backend**: Python (FastAPI) ou Node.js (NestJS/Express).  
  - **Frontend**: React (ou Next.js).  
  - **Banco**: PostgreSQL (com migrações).  
  - **Infra**: Docker + deploy em nuvem (Heroku, Railway, AWS ou Render).  
  - **Integrações futuras**: TUSS, TISS, CID-10/11, DICOM/PACS.  

---

## 🔹 Checklist de Desenvolvimento (Prioridades)

### **Fase 1 – Núcleo (MVP v1)**
- [x] **Configuração inicial do projeto**  
  - [x] Estruturar backend FastAPI com endpoints básicos.  
  - [x] Integrar frontend React existente com o backend.  
  - [x] Banco de dados SQLite com migrações (Alembic).  
  - [x] Autenticação JWT implementada (login, registro, verificação de token).  

- [ ] **Módulo Paciente**  
  - [ ] CRUD de paciente (dados pessoais, convênio, alergias, contatos).  
  - [ ] Associação paciente → plano de saúde.  
  - [ ] Busca com filtros.  

- [ ] **Agenda**  
  - [ ] CRUD de profissionais.  
  - [ ] Agenda multi-profissional (slots, bloqueios, encaixes).  
  - [ ] Confirmação de agendamento (simulado via e-mail/WhatsApp).  

- [ ] **Prontuário Ortopédico**  
  - [ ] Templates ortopédicos (anamnese, exame físico).  
  - [ ] Cadastro de diagnósticos (CID-10).  
  - [ ] Receituário simples + atestados.  

- [ ] **Faturamento Particular**  
  - [ ] Emissão de fatura/recibo.  
  - [ ] Integração com gateway de pagamento (PIX/Stripe/Pagar.me).  

---

### **Fase 2 – Expansão (MVP v2)**
- [ ] **Fluxo DXA (densitometria)**  
  - [ ] Pedido → agendamento → realização → upload de laudo PDF.  
  - [ ] Cadastro estruturado: T-score, Z-score, observações.  
  - [ ] Template de laudo padronizado.  

- [ ] **Portal do Paciente**  
  - [ ] Acesso ao histórico de consultas.  
  - [ ] Download de documentos/laudos.  
  - [ ] Confirmação online de consultas.  

- [ ] **Faturamento Convênio (TISS)**  
  - [ ] Cadastro de operadoras e planos.  
  - [ ] Exportação de guias de Consulta.  
  - [ ] Exportação de guias SP/SADT (densitometria).  
  - [ ] Validações básicas TUSS/TISS.  

---

### **Fase 3 – Consolidação (MVP v3)**
- [ ] **Financeiro**  
  - [ ] Relatórios (receitas, convênios, particular).  
  - [ ] Repasse médico.  
  - [ ] Glosas (registro e tratamento).  

- [ ] **Integrações externas**  
  - [ ] Atualização automática da tabela TUSS.  
  - [ ] API de CID-10 (OMS ou base local).  
  - [ ] Pré-integração PACS/DICOM (upload de imagens).  

- [ ] **Segurança & LGPD**  
  - [ ] Perfis de acesso (médico, recepção, financeiro).  
  - [ ] Auditoria de acessos.  
  - [ ] Consentimento digital do paciente.
