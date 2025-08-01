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

# Configuração adicional do CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
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
        
        # Nova tabela para interessados no COE
        db.execute('''
            CREATE TABLE IF NOT EXISTS interessados_coe (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                protocolo TEXT UNIQUE,
                nome TEXT,
                rg TEXT,
                telefone TEXT,
                horario TEXT,
                motivo TEXT,
                data_cadastro TEXT,
                status TEXT DEFAULT 'Pendente'
            )
        ''')
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
    
    # Processar tipo de solicitação
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

@app.route('/api/interessados-coe', methods=['POST'])
def criar_interessado_coe():
    data = request.json
    db = get_db()
    cur = db.execute('SELECT COUNT(*) FROM interessados_coe')
    count = cur.fetchone()[0] + 1
    protocolo = f"COE{str(count).zfill(4)}"
    data_cadastro = datetime.datetime.utcnow().isoformat()
    
    db.execute('''
        INSERT INTO interessados_coe (protocolo, nome, rg, telefone, horario, motivo, data_cadastro, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (protocolo, data.get('nome'), data.get('rg'), data.get('telefone'), 
          data.get('horario'), data.get('motivo'), data_cadastro, 'Pendente'))
    db.commit()
    return jsonify({'protocolo': protocolo}), 201

@app.route('/api/interessados-coe', methods=['GET'])
def listar_interessados_coe():
    db = get_db()
    interessados = db.execute('SELECT * FROM interessados_coe ORDER BY data_cadastro DESC').fetchall()
    result = []
    for i in interessados:
        result.append(dict(i))
    return jsonify(result)

@app.route('/api/interessados-coe/<protocolo>', methods=['PATCH'])
def atualizar_status_interessado(protocolo):
    status = request.json.get('status')
    db = get_db()
    db.execute('UPDATE interessados_coe SET status = ? WHERE protocolo = ?', (status, protocolo))
    db.commit()
    return jsonify({'ok': True})

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

@app.route('/api/denuncias/<protocolo>', methods=['PATCH'])
def atualizar_status(protocolo):
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
