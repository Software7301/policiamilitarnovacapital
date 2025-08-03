#!/usr/bin/env python3
"""
Script de inicialização do banco de dados da Ouvidoria
Pode ser executado independentemente para criar/atualizar o banco
"""

import sqlite3
import os
import sys
import logging
from datetime import datetime

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_path():
    """Determina o caminho do banco de dados"""
    if os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RENDER"):
        db_path = os.path.join('/tmp', 'ouvidoria.db')
    else:
        # Caminho relativo ao script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(script_dir, 'ouvidoria.db')
    
    return db_path

def create_connection():
    """Cria conexão com o banco de dados"""
    try:
        db_path = get_db_path()
        
        # Garantir que o diretório existe
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        
        # Configurar para melhor performance
        conn.execute('PRAGMA journal_mode=WAL')
        conn.execute('PRAGMA synchronous=NORMAL')
        conn.execute('PRAGMA cache_size=10000')
        conn.execute('PRAGMA temp_store=MEMORY')
        conn.execute('PRAGMA foreign_keys=ON')
        
        logger.info(f"Conectado ao banco: {db_path}")
        return conn
        
    except Exception as e:
        logger.error(f"Erro ao conectar com banco de dados: {e}")
        raise

def init_database():
    """Inicializa o banco de dados com todas as tabelas e índices"""
    try:
        conn = create_connection()
        
        # Tabela de denúncias
        conn.execute('''
            CREATE TABLE IF NOT EXISTS denuncias (
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
        
        # Tabela de notícias
        conn.execute('''
            CREATE TABLE IF NOT EXISTS noticias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                conteudo TEXT NOT NULL,
                fotos TEXT,
                data_publicacao TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Criar índices para melhor performance
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
        
        conn.commit()
        logger.info("Banco de dados inicializado com sucesso")
        
        return conn
        
    except Exception as e:
        logger.error(f"Erro ao inicializar banco de dados: {e}")
        raise

def check_database():
    """Verifica o status do banco de dados"""
    try:
        conn = create_connection()
        
        # Verificar tabelas
        tables = conn.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            ORDER BY name
        """).fetchall()
        
        print("📊 Status do Banco de Dados")
        print("=" * 40)
        print(f"📁 Caminho: {get_db_path()}")
        print(f"📋 Tabelas encontradas: {len(tables)}")
        
        for table in tables:
            table_name = table['name']
            count = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
            print(f"   📄 {table_name}: {count} registros")
        
        # Verificar índices
        indices = conn.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='index' 
            ORDER BY name
        """).fetchall()
        
        print(f"\n🔍 Índices encontrados: {len(indices)}")
        for index in indices:
            print(f"   📌 {index['name']}")
        
        conn.close()
        print("\n✅ Verificação concluída!")
        
    except Exception as e:
        logger.error(f"Erro ao verificar banco de dados: {e}")
        print(f"❌ Erro: {e}")

def insert_sample_data():
    """Insere dados de exemplo para teste"""
    try:
        conn = create_connection()
        
        # Dados de exemplo para denúncias
        sample_denuncias = [
            {
                'protocolo': '0001',
                'nome': 'João Silva',
                'rg': '12345678',
                'tipo': 'Denúncia',
                'descricao': 'Denúncia de exemplo para teste do sistema',
                'youtube': '',
                'status': 'Em Análise'
            },
            {
                'protocolo': '0002',
                'nome': 'Maria Santos',
                'rg': '87654321',
                'tipo': 'Elogio',
                'descricao': 'Elogio de exemplo para teste do sistema',
                'youtube': '',
                'status': 'Finalizada'
            }
        ]
        
        # Dados de exemplo para notícias
        sample_noticias = [
            {
                'titulo': 'Sistema de Ouvidoria Lançado',
                'conteudo': 'A Polícia Militar lançou seu novo sistema de ouvidoria digital.',
                'fotos': '',
                'data_publicacao': datetime.now().isoformat()
            },
            {
                'titulo': 'Melhorias no Atendimento',
                'conteudo': 'Novas funcionalidades foram implementadas para melhorar o atendimento.',
                'fotos': '',
                'data_publicacao': datetime.now().isoformat()
            }
        ]
        
        # Inserir denúncias de exemplo
        for denuncia in sample_denuncias:
            try:
                conn.execute('''
                    INSERT INTO denuncias (protocolo, nome, rg, tipo, descricao, youtube, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    denuncia['protocolo'],
                    denuncia['nome'],
                    denuncia['rg'],
                    denuncia['tipo'],
                    denuncia['descricao'],
                    denuncia['youtube'],
                    denuncia['status']
                ))
                print(f"✅ Denúncia {denuncia['protocolo']} inserida")
            except sqlite3.IntegrityError:
                print(f"⚠️ Denúncia {denuncia['protocolo']} já existe")
        
        # Inserir notícias de exemplo
        for noticia in sample_noticias:
            try:
                conn.execute('''
                    INSERT INTO noticias (titulo, conteudo, fotos, data_publicacao)
                    VALUES (?, ?, ?, ?)
                ''', (
                    noticia['titulo'],
                    noticia['conteudo'],
                    noticia['fotos'],
                    noticia['data_publicacao']
                ))
                print(f"✅ Notícia '{noticia['titulo']}' inserida")
            except sqlite3.IntegrityError:
                print(f"⚠️ Notícia '{noticia['titulo']}' já existe")
        
        conn.commit()
        conn.close()
        print("\n✅ Dados de exemplo inseridos com sucesso!")
        
    except Exception as e:
        logger.error(f"Erro ao inserir dados de exemplo: {e}")
        print(f"❌ Erro: {e}")

def main():
    """Função principal"""
    print("🗄️ Inicializador do Banco de Dados da Ouvidoria")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "init":
            print("🔧 Inicializando banco de dados...")
            init_database()
            print("✅ Banco inicializado!")
            
        elif command == "check":
            print("🔍 Verificando banco de dados...")
            check_database()
            
        elif command == "sample":
            print("📝 Inserindo dados de exemplo...")
            init_database()  # Garantir que o banco existe
            insert_sample_data()
            
        elif command == "reset":
            print("🔄 Resetando banco de dados...")
            db_path = get_db_path()
            if os.path.exists(db_path):
                os.remove(db_path)
                print(f"🗑️ Banco removido: {db_path}")
            init_database()
            insert_sample_data()
            print("✅ Banco resetado com dados de exemplo!")
            
        else:
            print("❌ Comando inválido!")
            print("Comandos disponíveis:")
            print("  python init_db.py init    - Inicializar banco")
            print("  python init_db.py check   - Verificar banco")
            print("  python init_db.py sample  - Inserir dados de exemplo")
            print("  python init_db.py reset   - Resetar banco com dados de exemplo")
    else:
        print("🔧 Inicializando banco de dados...")
        init_database()
        print("✅ Banco inicializado!")
        print("\n💡 Use 'python init_db.py check' para verificar o status")

if __name__ == "__main__":
    main() 