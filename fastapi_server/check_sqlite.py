import sqlite3
import os

# Verificar se o arquivo SQLite existe
if os.path.exists('orthoflow.db'):
    conn = sqlite3.connect('orthoflow.db')
    cursor = conn.cursor()
    
    # Listar todas as tabelas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print('Tabelas encontradas:', tables)
    
    # Contar registros em cada tabela
    for table in tables:
        cursor.execute(f'SELECT COUNT(*) FROM {table[0]}')
        count = cursor.fetchone()[0]
        print(f'{table[0]}: {count} registros')
        
        # Se houver dados, mostrar alguns exemplos
        if count > 0:
            cursor.execute(f'SELECT * FROM {table[0]} LIMIT 3')
            rows = cursor.fetchall()
            print(f'  Exemplos de {table[0]}:', rows)
    
    conn.close()
else:
    print('Arquivo orthoflow.db não encontrado')