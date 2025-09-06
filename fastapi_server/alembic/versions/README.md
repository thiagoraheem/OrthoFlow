# Migrações do Banco de Dados

Este diretório contém as migrações do banco de dados geradas pelo Alembic.

## Como usar:

1. **Gerar uma nova migração:**
   ```bash
   alembic revision --autogenerate -m "Descrição da migração"
   ```

2. **Aplicar migrações:**
   ```bash
   alembic upgrade head
   ```

3. **Reverter migração:**
   ```bash
   alembic downgrade -1
   ```

4. **Ver histórico de migrações:**
   ```bash
   alembic history
   ```

5. **Ver migração atual:**
   ```bash
   alembic current
   ```