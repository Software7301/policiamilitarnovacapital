#!/usr/bin/env python3
"""
Script para migrar o banco de dados existente para a nova estrutura
"""

import sqlite3
import os
import sys
from datetime import datetime

def get_db_path():
    """Determina o caminho do banco de dados"""
    if os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RENDER"):
        db_path = os.path.join('/tmp', 'ouvidoria.db')
    else:
        # Caminho relativo ao script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(script_dir, 'src/backend/database/ouvidoria.db')
    
    return db_path

def migrate_database():
    """Migra o banco de dados existente para a nova estrutura"""
    try:
        db_path = get_db_path()
        print(f"🔧 Migrando banco: {db_path}")
        
        # Verificar se o banco existe
        if not os.path.exists(db_path):
            print("❌ Banco de dados não encontrado!")
            return False
        
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        
        # Verificar estrutura atual
        cursor = conn.execute("PRAGMA table_info(denuncias)")
        columns = [row['name'] for row in cursor.fetchall()]
        print(f"📋 Colunas atuais: {columns}")
        
        # Verificar se precisa migrar
        needs_migration = False
        if 'dataCriacao' not in columns:
            print("⚠️ Coluna 'dataCriacao' não encontrada. Iniciando migração...")
            needs_migration = True
        
        if 'created_at' not in columns:
            print("⚠️ Coluna 'created_at' não encontrada. Iniciando migração...")
            needs_migration = True
        
        if 'updated_at' not in columns:
            print("⚠️ Coluna 'updated_at' não encontrada. Iniciando migração...")
            needs_migration = True
        
        if not needs_migration:
            print("✅ Banco já está atualizado!")
            conn.close()
            return True
        
        # Fazer backup dos dados existentes
        print("📦 Fazendo backup dos dados existentes...")
        denuncias = conn.execute("SELECT * FROM denuncias").fetchall()
        noticias = conn.execute("SELECT * FROM noticias").fetchall()
        
        print(f"📝 {len(denuncias)} denúncias encontradas")
        print(f"📰 {len(noticias)} notícias encontradas")
        
        # Criar nova estrutura
        print("🔧 Criando nova estrutura...")
        
        # Renomear tabela antiga
        conn.execute("ALTER TABLE denuncias RENAME TO denuncias_old")
        
        # Criar nova tabela com estrutura atualizada
        conn.execute('''
            CREATE TABLE denuncias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                protocolo TEXT UNIQUE NOT NULL,
                nome TEXT NOT NULL,
                rg TEXT NOT NULL,
                tipo TEXT NOT NULL,
                descricao TEXT NOT NULL,
                youtube TEXT,
                status TEXT DEFAULT 'Em Análise',
                dataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                dataFinalizacao TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Migrar dados
        print("🔄 Migrando dados...")
        for denuncia in denuncias:
            denuncia_dict = dict(denuncia)
            
            # Determinar data de criação
            data_criacao = datetime.now().isoformat()
            if 'dataCriacao' in denuncia_dict and denuncia_dict['dataCriacao']:
                data_criacao = denuncia_dict['dataCriacao']
            
            # Inserir na nova tabela
            conn.execute('''
                INSERT INTO denuncias 
                (protocolo, nome, rg, tipo, descricao, youtube, status, dataCriacao, dataFinalizacao, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                denuncia_dict.get('protocolo'),
                denuncia_dict.get('nome'),
                denuncia_dict.get('rg'),
                denuncia_dict.get('tipo'),
                denuncia_dict.get('descricao'),
                denuncia_dict.get('youtube', ''),
                denuncia_dict.get('status', 'Em Análise'),
                data_criacao,
                denuncia_dict.get('dataFinalizacao'),
                data_criacao,
                datetime.now().isoformat()
            ))
        
        # Verificar se precisa migrar notícias
        cursor = conn.execute("PRAGMA table_info(noticias)")
        noticias_columns = [row['name'] for row in cursor.fetchall()]
        
        if 'created_at' not in noticias_columns:
            print("🔄 Migrando tabela de notícias...")
            
            # Renomear tabela antiga
            conn.execute("ALTER TABLE noticias RENAME TO noticias_old")
            
            # Criar nova tabela
            conn.execute('''
                CREATE TABLE noticias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titulo TEXT NOT NULL,
                    conteudo TEXT NOT NULL,
                    fotos TEXT,
                    data_publicacao TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Migrar notícias
            for noticia in noticias:
                noticia_dict = dict(noticia)
                conn.execute('''
                    INSERT INTO noticias 
                    (titulo, conteudo, fotos, data_publicacao, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    noticia_dict.get('titulo'),
                    noticia_dict.get('conteudo'),
                    noticia_dict.get('fotos', ''),
                    noticia_dict.get('data_publicacao'),
                    datetime.now().isoformat(),
                    datetime.now().isoformat()
                ))
        
        # Criar índices
        print("🔍 Criando índices...")
        indices = [
            'CREATE INDEX IF NOT EXISTS idx_denuncias_protocolo ON denuncias(protocolo)',
            'CREATE INDEX IF NOT EXISTS idx_denuncias_status ON denuncias(status)',
            'CREATE INDEX IF NOT EXISTS idx_denuncias_data_criacao ON denuncias(dataCriacao)',
            'CREATE INDEX IF NOT EXISTS idx_denuncias_data_finalizacao ON denuncias(dataFinalizacao)',
            'CREATE INDEX IF NOT EXISTS idx_noticias_data_publicacao ON noticias(data_publicacao)',
            'CREATE INDEX IF NOT EXISTS idx_noticias_titulo ON noticias(titulo)'
        ]
        
        for index_sql in indices:
            conn.execute(index_sql)
        
        # Remover tabelas antigas
        print("🗑️ Removendo tabelas antigas...")
        conn.execute("DROP TABLE IF EXISTS denuncias_old")
        conn.execute("DROP TABLE IF EXISTS noticias_old")
        
        conn.commit()
        conn.close()
        
        print("✅ Migração concluída com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro na migração: {e}")
        return False

def verify_migration():
    """Verifica se a migração foi bem-sucedida"""
    try:
        db_path = get_db_path()
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        
        # Verificar estrutura das tabelas
        cursor = conn.execute("PRAGMA table_info(denuncias)")
        denuncias_columns = [row['name'] for row in cursor.fetchall()]
        
        cursor = conn.execute("PRAGMA table_info(noticias)")
        noticias_columns = [row['name'] for row in cursor.fetchall()]
        
        print("📊 Verificação da Migração")
        print("=" * 40)
        print(f"📁 Banco: {db_path}")
        print(f"📋 Colunas denúncias: {len(denuncias_columns)}")
        print(f"📋 Colunas notícias: {len(noticias_columns)}")
        
        # Verificar colunas obrigatórias
        required_denuncias = ['dataCriacao', 'created_at', 'updated_at']
        required_noticias = ['created_at', 'updated_at']
        
        missing_denuncias = [col for col in required_denuncias if col not in denuncias_columns]
        missing_noticias = [col for col in required_noticias if col not in noticias_columns]
        
        if missing_denuncias:
            print(f"❌ Colunas faltando em denúncias: {missing_denuncias}")
        else:
            print("✅ Tabela denúncias OK")
            
        if missing_noticias:
            print(f"❌ Colunas faltando em notícias: {missing_noticias}")
        else:
            print("✅ Tabela notícias OK")
        
        # Verificar dados
        denuncias_count = conn.execute("SELECT COUNT(*) FROM denuncias").fetchone()[0]
        noticias_count = conn.execute("SELECT COUNT(*) FROM noticias").fetchone()[0]
        
        print(f"📝 Denúncias: {denuncias_count}")
        print(f"📰 Notícias: {noticias_count}")
        
        conn.close()
        
        if not missing_denuncias and not missing_noticias:
            print("\n✅ Migração verificada com sucesso!")
            return True
        else:
            print("\n❌ Migração incompleta!")
            return False
            
    except Exception as e:
        print(f"❌ Erro na verificação: {e}")
        return False

def main():
    """Função principal"""
    print("🔄 Migrador de Banco de Dados da Ouvidoria")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "migrate":
            print("🔄 Iniciando migração...")
            if migrate_database():
                print("✅ Migração concluída!")
            else:
                print("❌ Migração falhou!")
                
        elif command == "verify":
            print("🔍 Verificando migração...")
            verify_migration()
            
        else:
            print("❌ Comando inválido!")
            print("Comandos disponíveis:")
            print("  python migrate_db.py migrate  - Migrar banco")
            print("  python migrate_db.py verify   - Verificar migração")
    else:
        print("🔄 Iniciando migração...")
        if migrate_database():
            print("✅ Migração concluída!")
            print("\n💡 Use 'python migrate_db.py verify' para verificar")

if __name__ == "__main__":
    main() 