from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def get_db():
    conn = sqlite3.connect('ouvidoria.db')
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
init_db()

@app.route('/api/denuncias', methods=['POST'])
def criar_denuncia():
    data = request.json
    db = get_db()
    cur = db.execute('SELECT COUNT(*) FROM denuncias')
    count = cur.fetchone()[0] + 1
    protocolo = str(count).zfill(4)
    db.execute('INSERT INTO denuncias (protocolo, nome, rg, tipo, descricao, youtube, status, finalizada_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
               (protocolo, data.get('nome'), data.get('rg'), data.get('tipo'), data.get('descricao'), data.get('youtube'), 'Em análise', None))
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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
