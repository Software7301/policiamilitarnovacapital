from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime
import os
import sys
try:
    print("Iniciando app.py", file=sys.stderr)
except Exception as e:
    print(f"Erro ao iniciar app.py: {e}", file=sys.stderr)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '86400')
    return response

def get_db():
    if os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RENDER"):
        db_path = os.path.join('/tmp', 'ouvidoria.db')
    else:
        db_path = os.path.join(os.path.dirname(__file__), 'ouvidoria.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as db:
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
init_db()

@app.route('/')
def home():
    return "API da Ouvidoria da Polícia Militar está online!"

@app.route('/test')
def test():
    return "Test OK"

@app.route('/api/denuncias', methods=['POST'])
def criar_denuncia():
    data = request.json
    
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
    
    db = get_db()
    cur = db.execute('SELECT COUNT(*) FROM denuncias')
    count = cur.fetchone()[0] + 1
    protocolo = str(count).zfill(4)
    
    db.execute('INSERT INTO denuncias (protocolo, nome, rg, tipo, descricao, youtube, status, finalizada_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
               (protocolo, data.get('nome'), data.get('rg'), tipo, data.get('descricao'), data.get('youtube'), 'Em análise', None))
    db.commit()
    return jsonify({'protocolo': protocolo}), 201

@app.route('/api/denuncias', methods=['GET'])
def listar_denuncias():
    db = get_db()
    denuncias = db.execute('SELECT * FROM denuncias').fetchall()
    result = []
    now = datetime.datetime.utcnow()
    for d in denuncias:
        d = dict(d)
        status = d.get('status')
        finalizada_em_str = d.get('finalizada_em')
        if status == 'Finalizada' and finalizada_em_str:
            try:
                finalizada_em = datetime.datetime.fromisoformat(finalizada_em_str)
            except Exception:
                continue
            if (now - finalizada_em).total_seconds() > 4:
                continue
        result.append(d)
    return jsonify(result)

@app.route('/api/denuncias/<protocolo>', methods=['PATCH', 'PUT', 'OPTIONS'])
def atualizar_status(protocolo):
    if request.method == 'OPTIONS':
        return '', 200
    
    status = request.json.get('status')
    db = get_db()
    if status == 'Finalizada':
        finalizada_em = datetime.datetime.utcnow().isoformat()
        db.execute('UPDATE denuncias SET status = ?, finalizada_em = ? WHERE protocolo = ?', (status, finalizada_em, protocolo))
    else:
        db.execute('UPDATE denuncias SET status = ?, finalizada_em = NULL WHERE protocolo = ?', (status, protocolo))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/denuncias/<protocolo>', methods=['GET'])
def buscar_por_protocolo(protocolo):
    db = get_db()
    d = db.execute('SELECT * FROM denuncias WHERE protocolo = ?', (protocolo,)).fetchone()
    if d:
        return jsonify(dict(d))
    return jsonify({'error': 'Protocolo não encontrado'}), 404

@app.route('/api/denuncias/<protocolo>', methods=['DELETE'])
def deletar_denuncia(protocolo):
    db = get_db()
    # Verifica se a denúncia existe
    d = db.execute('SELECT * FROM denuncias WHERE protocolo = ?', (protocolo,)).fetchone()
    if not d:
        return jsonify({'error': 'Protocolo não encontrado'}), 404
    
    # Deleta a denúncia
    db.execute('DELETE FROM denuncias WHERE protocolo = ?', (protocolo,))
    db.commit()
    return jsonify({'ok': True, 'message': 'Denúncia deletada com sucesso'})

# Endpoints para notícias
@app.route('/api/noticias', methods=['GET'])
def listar_noticias():
    db = get_db()
    noticias = db.execute('SELECT * FROM noticias ORDER BY data_publicacao DESC').fetchall()
    return jsonify([dict(n) for n in noticias])

@app.route('/api/noticias', methods=['POST'])
def criar_noticia():
    try:
        print("=== INICIANDO CRIAÇÃO DE NOTÍCIA ===", file=sys.stderr)
        
        # Verificar se há dados JSON
        if not request.is_json:
            print("Erro: Não é JSON", file=sys.stderr)
            return jsonify({'error': 'Content-Type deve ser application/json'}), 400
        
        data = request.get_json()
        print(f"Dados recebidos: {data}", file=sys.stderr)
        
        # Validar dados obrigatórios
        titulo = data.get('titulo', '').strip()
        conteudo = data.get('conteudo', '').strip()
        
        if not titulo or not conteudo:
            print(f"Erro: Título='{titulo}', Conteúdo='{conteudo}'", file=sys.stderr)
            return jsonify({'error': 'Título e conteúdo são obrigatórios'}), 400
        
        # Processar fotos de forma segura
        fotos = data.get('fotos')
        if fotos:
            print(f"Fotos recebidas: {fotos}", file=sys.stderr)
        else:
            fotos = None
            print("Nenhuma foto fornecida", file=sys.stderr)
        
        # Conectar ao banco
        db = get_db()
        
        # Inserir notícia
        cursor = db.execute('''
            INSERT INTO noticias (titulo, conteudo, fotos, data_publicacao) 
            VALUES (?, ?, ?, ?)
        ''', (titulo, conteudo, fotos, datetime.datetime.utcnow().isoformat()))
        
        # Commit da transação
        db.commit()
        
        # Obter ID da notícia criada
        noticia_id = cursor.lastrowid
        
        print(f"Notícia criada com sucesso! ID: {noticia_id}", file=sys.stderr)
        
        return jsonify({
            'ok': True, 
            'message': 'Notícia criada com sucesso',
            'id': noticia_id
        }), 201
        
    except Exception as e:
        print(f"ERRO CRÍTICO ao criar notícia: {e}", file=sys.stderr)
        import traceback
        print(f"Stack trace completo: {traceback.format_exc()}", file=sys.stderr)
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/noticias/<int:noticia_id>', methods=['DELETE'])
def deletar_noticia(noticia_id):
    db = get_db()
    # Verifica se a notícia existe
    noticia = db.execute('SELECT * FROM noticias WHERE id = ?', (noticia_id,)).fetchone()
    if not noticia:
        return jsonify({'error': 'Notícia não encontrada'}), 404
    
    # Deleta a notícia
    db.execute('DELETE FROM noticias WHERE id = ?', (noticia_id,))
    db.commit()
    return jsonify({'ok': True, 'message': 'Notícia deletada com sucesso'})

@app.route('/test-noticias')
def test_noticias():
    try:
        db = get_db()
        
        # Verificar se a tabela existe
        cursor = db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='noticias'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            return jsonify({'error': 'Tabela noticias não existe'}), 500
        
        # Verificar estrutura da tabela
        cursor = db.execute("PRAGMA table_info(noticias)")
        columns = cursor.fetchall()
        
        # Tentar inserir uma notícia de teste
        cursor = db.execute('''
            INSERT INTO noticias (titulo, conteudo, fotos, data_publicacao) 
            VALUES (?, ?, ?, ?)
        ''', ('Teste', 'Conteúdo teste', None, datetime.datetime.utcnow().isoformat()))
        
        db.commit()
        noticia_id = cursor.lastrowid
        
        return jsonify({
            'ok': True,
            'message': 'Teste bem-sucedido',
            'table_exists': True,
            'columns': [dict(col) for col in columns],
            'test_noticia_id': noticia_id
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'table_exists': table_exists if 'table_exists' in locals() else False
        }), 500

@app.route('/debug-noticias')
def debug_noticias():
    try:
        print("=== DEBUG NOTÍCIAS ===", file=sys.stderr)
        
        db = get_db()
        
        # Verificar estrutura da tabela
        cursor = db.execute("PRAGMA table_info(noticias)")
        columns = cursor.fetchall()
        print(f"Colunas da tabela: {columns}", file=sys.stderr)
        
        # Verificar dados existentes
        cursor = db.execute("SELECT * FROM noticias ORDER BY id DESC LIMIT 5")
        noticias = cursor.fetchall()
        print(f"Notícias existentes: {noticias}", file=sys.stderr)
        
        return jsonify({
            'ok': True,
            'columns': [dict(col) for col in columns],
            'noticias': [dict(noticia) for noticia in noticias]
        })
        
    except Exception as e:
        print(f"ERRO no debug: {e}", file=sys.stderr)
        import traceback
        print(f"Stack trace: {traceback.format_exc()}", file=sys.stderr)
        return jsonify({'error': str(e)}), 500

@app.route('/check-table')
def check_table():
    try:
        db = get_db()
        
        # Verificar se a tabela existe
        cursor = db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='noticias'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            return jsonify({'error': 'Tabela noticias não existe'}), 500
        
        # Verificar estrutura da tabela
        cursor = db.execute("PRAGMA table_info(noticias)")
        columns = cursor.fetchall()
        
        # Verificar dados existentes
        cursor = db.execute("SELECT COUNT(*) FROM noticias")
        count = cursor.fetchone()[0]
        
        return jsonify({
            'ok': True,
            'table_exists': True,
            'columns': [dict(col) for col in columns],
            'total_noticias': count
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
