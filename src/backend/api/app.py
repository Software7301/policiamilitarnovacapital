"""
API da Ouvidoria da Polícia Militar
Backend Flask para gerenciamento de denúncias e notícias
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime
import os
import sys

# Configuração do Flask
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.after_request
def after_request(response):
    """Configuração de CORS para todas as requisições"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '86400')
    return response

def get_db():
    """Conecta ao banco de dados SQLite"""
    if os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RENDER"):
        db_path = os.path.join('/tmp', 'ouvidoria.db')
    else:
        db_path = os.path.join(os.path.dirname(__file__), '../database/ouvidoria.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa o banco de dados com as tabelas necessárias"""
    with get_db() as db:
        # Tabela de denúncias
        db.execute('''
            CREATE TABLE IF NOT EXISTS denuncias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                protocolo TEXT UNIQUE,
                nome TEXT,
                rg TEXT,
                tipo TEXT,
                descricao TEXT,
                youtube TEXT,
                status TEXT,
                finalizada_em TEXT
            )
        ''')
        
        # Tabela de notícias
        db.execute('''
            CREATE TABLE IF NOT EXISTS noticias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                conteudo TEXT NOT NULL,
                fotos TEXT,
                data_publicacao TEXT NOT NULL
            )
        ''')
        db.commit()

# Inicializa o banco de dados
init_db()

# ============================================================================
# ROTAS PRINCIPAIS
# ============================================================================

@app.route('/')
def home():
    """Página inicial da API"""
    return "API da Ouvidoria da Polícia Militar está online!"

@app.route('/test')
def test():
    """Endpoint de teste"""
    return "Test OK"

# ============================================================================
# ENDPOINTS DE DENÚNCIAS
# ============================================================================

@app.route('/api/denuncias', methods=['POST'])
def criar_denuncia():
    """Cria uma nova denúncia"""
    try:
        data = request.json
        
        # Mapeamento de tipos
        tipo_input = data.get('tipo', '').strip()
        tipo_mapping = {
            '1': 'Denúncia',
            '2': 'Elogio', 
            '3': 'Sugestão',
            'denúncia': 'Denúncia',
            'elogio': 'Elogio',
            'sugestão': 'Sugestão',
            'sugestao': 'Sugestão'
        }
        
        tipo = tipo_mapping.get(tipo_input.lower(), tipo_input)
        
        # Gera protocolo único
        db = get_db()
        cur = db.execute('SELECT COUNT(*) FROM denuncias')
        count = cur.fetchone()[0] + 1
        protocolo = str(count).zfill(4)
        
        # Insere a denúncia
        db.execute('''
            INSERT INTO denuncias (protocolo, nome, rg, tipo, descricao, youtube, status, finalizada_em) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (protocolo, data.get('nome'), data.get('rg'), tipo, data.get('descricao'), 
              data.get('youtube'), 'Em análise', None))
        db.commit()
        
        return jsonify({'protocolo': protocolo}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/denuncias', methods=['GET'])
def listar_denuncias():
    """Lista todas as denúncias"""
    try:
        db = get_db()
        denuncias = db.execute('SELECT * FROM denuncias ORDER BY id DESC').fetchall()
        result = []
        
        now = datetime.datetime.utcnow()
        for d in denuncias:
            d = dict(d)
            status = d.get('status')
            finalizada_em_str = d.get('finalizada_em')
            
            # Filtra denúncias finalizadas há mais de 4 segundos
            if status == 'Finalizada' and finalizada_em_str:
                try:
                    finalizada_em = datetime.datetime.fromisoformat(finalizada_em_str)
                    if (now - finalizada_em).total_seconds() > 4:
                        continue
                except Exception:
                    continue
            result.append(d)
            
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/denuncias/<protocolo>', methods=['PATCH', 'PUT', 'OPTIONS'])
def atualizar_status(protocolo):
    """Atualiza o status de uma denúncia"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        status = request.json.get('status')
        db = get_db()
        
        if status == 'Finalizada':
            finalizada_em = datetime.datetime.utcnow().isoformat()
            db.execute('''
                UPDATE denuncias SET status = ?, finalizada_em = ? WHERE protocolo = ?
            ''', (status, finalizada_em, protocolo))
        else:
            db.execute('''
                UPDATE denuncias SET status = ?, finalizada_em = NULL WHERE protocolo = ?
            ''', (status, protocolo))
            
        db.commit()
        return jsonify({'ok': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/denuncias/<protocolo>', methods=['GET'])
def buscar_por_protocolo(protocolo):
    """Busca uma denúncia por protocolo"""
    try:
        db = get_db()
        d = db.execute('SELECT * FROM denuncias WHERE protocolo = ?', (protocolo,)).fetchone()
        if d:
            return jsonify(dict(d))
        return jsonify({'error': 'Protocolo não encontrado'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/denuncias/<protocolo>', methods=['DELETE'])
def deletar_denuncia(protocolo):
    """Deleta uma denúncia"""
    try:
        db = get_db()
        
        # Verifica se a denúncia existe
        d = db.execute('SELECT * FROM denuncias WHERE protocolo = ?', (protocolo,)).fetchone()
        if not d:
            return jsonify({'error': 'Protocolo não encontrado'}), 404
        
        # Deleta a denúncia
        db.execute('DELETE FROM denuncias WHERE protocolo = ?', (protocolo,))
        db.commit()
        
        return jsonify({'ok': True, 'message': 'Denúncia deletada com sucesso'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# ENDPOINTS DE NOTÍCIAS
# ============================================================================

@app.route('/api/noticias', methods=['GET'])
def listar_noticias():
    """Lista todas as notícias"""
    try:
        db = get_db()
        noticias = db.execute('SELECT * FROM noticias ORDER BY data_publicacao DESC').fetchall()
        return jsonify([dict(n) for n in noticias])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/noticias', methods=['POST'])
def criar_noticia():
    """Cria uma nova notícia"""
    try:
        data = request.get_json()
        
        # Valida dados obrigatórios
        titulo = data.get('titulo', '').strip()
        conteudo = data.get('conteudo', '').strip()
        
        if not titulo or not conteudo:
            return jsonify({'error': 'Título e conteúdo são obrigatórios'}), 400
        
        # Processa fotos
        fotos = data.get('fotos')
        
        # Insere a notícia
        db = get_db()
        cursor = db.execute('''
            INSERT INTO noticias (titulo, conteudo, fotos, data_publicacao) 
            VALUES (?, ?, ?, ?)
        ''', (titulo, conteudo, fotos, datetime.datetime.utcnow().isoformat()))
        
        db.commit()
        noticia_id = cursor.lastrowid
        
        return jsonify({
            'ok': True, 
            'message': 'Notícia criada com sucesso',
            'id': noticia_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/noticias/<int:noticia_id>', methods=['DELETE'])
def deletar_noticia(noticia_id):
    """Deleta uma notícia"""
    try:
        db = get_db()
        
        # Verifica se a notícia existe
        noticia = db.execute('SELECT * FROM noticias WHERE id = ?', (noticia_id,)).fetchone()
        if not noticia:
            return jsonify({'error': 'Notícia não encontrada'}), 404
        
        # Deleta a notícia
        db.execute('DELETE FROM noticias WHERE id = ?', (noticia_id,))
        db.commit()
        
        return jsonify({'ok': True, 'message': 'Notícia deletada com sucesso'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# ENDPOINTS DE DIAGNÓSTICO
# ============================================================================

@app.route('/debug-noticias')
def debug_noticias():
    """Endpoint para debug das notícias"""
    try:
        db = get_db()
        
        # Verifica estrutura da tabela
        cursor = db.execute("PRAGMA table_info(noticias)")
        columns = cursor.fetchall()
        
        # Verifica dados existentes
        cursor = db.execute("SELECT * FROM noticias ORDER BY id DESC LIMIT 5")
        noticias = cursor.fetchall()
        
        return jsonify({
            'ok': True,
            'columns': [dict(col) for col in columns],
            'noticias': [dict(noticia) for noticia in noticias]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/check-table')
def check_table():
    """Verifica se as tabelas existem"""
    try:
        db = get_db()
        
        # Verifica tabela de notícias
        cursor = db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='noticias'")
        noticias_exists = cursor.fetchone()
        
        # Verifica tabela de denúncias
        cursor = db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='denuncias'")
        denuncias_exists = cursor.fetchone()
        
        # Conta registros
        cursor = db.execute("SELECT COUNT(*) FROM noticias")
        noticias_count = cursor.fetchone()[0]
        
        cursor = db.execute("SELECT COUNT(*) FROM denuncias")
        denuncias_count = cursor.fetchone()[0]
        
        return jsonify({
            'ok': True,
            'noticias_table_exists': bool(noticias_exists),
            'denuncias_table_exists': bool(denuncias_exists),
            'total_noticias': noticias_count,
            'total_denuncias': denuncias_count
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# INICIALIZAÇÃO DO SERVIDOR
# ============================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='127.0.0.1', port=port)
