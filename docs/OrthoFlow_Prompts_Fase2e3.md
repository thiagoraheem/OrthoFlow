# 📘 Documento 3 – Prompts para Agente de IA (Fase 2 e 3)

## 🔹 Estrutura
Estes prompts complementam os da Fase 1. São focados na **expansão do MVP (Fase 2)** e na **consolidação (Fase 3)**.  
Cada prompt contém checklist de conclusão.

---

## **Prompts – Fase 2 (Expansão)**

### **6. Fluxo DXA (Densitometria Óssea)**
```
Implemente o fluxo de Densitometria (DXA):

- Modelo "Exame" (id, paciente_id, tipo, data, profissional_id, status).
- Modelo "LaudoDXA" (id, exame_id, t_score, z_score, observacoes, arquivo_pdf).
- Endpoints:
  - Criar pedido de exame (associado a paciente e profissional).
  - Agendar exame (associado a agenda).
  - Upload de laudo em PDF.
  - Cadastro dos valores estruturados (T-score, Z-score).
  - Retornar laudo padronizado em JSON.
- Frontend:
  - Tela de agendamento de exame DXA.
  - Tela de upload de laudo (PDF).
  - Visualização do laudo estruturado.

[ ] Concluído
```

### **7. Portal do Paciente**
```
Implemente o Portal do Paciente (área restrita):

- Login com CPF + senha.
- Funcionalidades:
  - Ver consultas agendadas e confirmar presença.
  - Download de documentos (receitas, atestados, laudos PDF).
  - Histórico de exames (com laudos DXA).
- Endpoints:
  - Autenticação paciente.
  - Listar consultas futuras/passadas.
  - Listar documentos disponíveis.
- Frontend:
  - Tela de login do paciente.
  - Dashboard com consultas, documentos e exames.

[ ] Concluído
```

### **8. Faturamento Convênio (TISS)**
```
Implemente exportação de guias TISS:

- Modelos:
  - "Operadora" (id, nome, registro_ans, contato).
  - "GuiaConsulta" (id, paciente_id, profissional_id, plano_id, procedimento_tuss, cid10, data).
  - "GuiaSPSADT" (id, paciente_id, exame_id, plano_id, procedimento_tuss, cid10, data).
- Endpoints:
  - Exportar guia de Consulta em XML TISS válido.
  - Exportar guia SP/SADT em XML TISS válido.
- Validações obrigatórias:
  - Procedimento deve existir na tabela TUSS.
  - CID-10 deve estar associado ao atendimento.
- Frontend:
  - Tela de geração de guias (consulta e exame).
  - Botão para exportar em XML.

[ ] Concluído
```

---

## **Prompts – Fase 3 (Consolidação)**

### **9. Financeiro e Relatórios**
```
Implemente o módulo financeiro:

- Modelos:
  - "Pagamento" (id, fatura_id, tipo, valor, data, status).
  - "RepasseMedico" (id, profissional_id, valor, periodo, status).
  - "Glosa" (id, guia_id, motivo, valor, status).
- Endpoints:
  - Relatórios de receitas (por período, por convênio, particular).
  - Registro e tratamento de glosas.
  - Relatório de repasse médico.
- Frontend:
  - Tela de financeiro com filtros (por convênio, data).
  - Tela de glosas.
  - Tela de repasses médicos.

[ ] Concluído
```

### **10. Integrações externas (TUSS, CID, PACS/DICOM)**
```
Implemente integrações externas:

- Atualização automática da tabela TUSS (importação CSV/XML).
- Integração com API CID-10 (mock inicial com JSON).
- Pré-integração PACS/DICOM:
  - Upload de imagens DICOM associadas a exame.
  - Endpoint para download das imagens armazenadas.
- Frontend:
  - Tela de upload de arquivos DICOM no exame.
  - Tela de visualização básica (miniaturas ou link para download).

[ ] Concluído
```

### **11. Segurança & LGPD**
```
Implemente requisitos de LGPD e segurança:

- Perfis de acesso (médico, recepção, financeiro, admin, paciente).
- Auditoria de acessos (quem acessou qual registro e quando).
- Consentimento digital do paciente (aceite em tela e registro em banco).
- Criptografia de dados sensíveis (em repouso e em trânsito).
- Frontend:
  - Tela de gerenciamento de perfis/usuários.
  - Tela para paciente visualizar e aceitar consentimento.

[ ] Concluído
```
