# 📘 Documento 1 – Blueprint & Checklist de Desenvolvimento

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
- [ ] **Configuração inicial do projeto**  
  - [ ] Estruturar backend no Replit (API com endpoints básicos).  
  - [ ] Criar frontend (React, já iniciado no OrthoFlow).  
  - [ ] Banco de dados com migrações (PostgreSQL).  
  - [ ] Autenticação de usuários (JWT/OAuth básico).  

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
