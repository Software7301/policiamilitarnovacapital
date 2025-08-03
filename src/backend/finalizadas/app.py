from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
DATABASE = 'finalizadas.db'

def init_db():
    """Inicializa o banco de dados"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS denuncias_finalizadas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            protocolo TEXT UNIQUE NOT NULL,
            nome TEXT,
            rg TEXT,
            tipo TEXT,
            descricao TEXT,
            youtube TEXT,
            status TEXT DEFAULT 'Finalizada',
            data_criacao TEXT,
            data_finalizacao TEXT,
            observacoes TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/')
def home():
    """Página inicial"""
    return jsonify({
        "message": "API de Denúncias Finalizadas - Ouvidoria PM NC",
        "status": "online",
        "endpoints": {
            "GET /api/finalizadas": "Lista todas as denúncias finalizadas",
            "POST /api/finalizadas": "Adiciona uma denúncia finalizada",
            "GET /api/finalizadas/<protocolo>": "Busca denúncia finalizada por protocolo",
            "DELETE /api/finalizadas/<protocolo>": "Remove denúncia finalizada"
        }
    })

@app.route('/api/finalizadas', methods=['GET'])
def listar_finalizadas():
    """Lista todas as denúncias finalizadas"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM denuncias_finalizadas 
            ORDER BY data_finalizacao DESC
        ''')
        
        denuncias = cursor.fetchall()
        
        # Converter para lista de dicionários
        resultado = []
        for denuncia in denuncias:
            resultado.append({
                'id': denuncia[0],
                'protocolo': denuncia[1],
                'nome': denuncia[2],
                'rg': denuncia[3],
                'tipo': denuncia[4],
                'descricao': denuncia[5],
                'youtube': denuncia[6],
                'status': denuncia[7],
                'data_criacao': denuncia[8],
                'data_finalizacao': denuncia[9],
                'observacoes': denuncia[10]
            })
        
        conn.close()
        return jsonify(resultado)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/finalizadas', methods=['POST'])
def adicionar_finalizada():
    """Adiciona uma denúncia finalizada"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('protocolo'):
            return jsonify({"error": "Protocolo é obrigatório"}), 400
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Verificar se já existe
        cursor.execute('SELECT protocolo FROM denuncias_finalizadas WHERE protocolo = ?', 
                      (data['protocolo'],))
        
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Protocolo já existe"}), 409
        
        # Inserir nova denúncia finalizada
        cursor.execute('''
            INSERT INTO denuncias_finalizadas 
            (protocolo, nome, rg, tipo, descricao, youtube, status, data_criacao, data_finalizacao, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('protocolo'),
            data.get('nome', 'Anônimo'),
            data.get('rg', ''),
            data.get('tipo', ''),
            data.get('descricao', ''),
            data.get('youtube', ''),
            'Finalizada',
            data.get('data_criacao', datetime.now().isoformat()),
            data.get('data_finalizacao', datetime.now().isoformat()),
            data.get('observacoes', '')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "Denúncia finalizada adicionada com sucesso",
            "protocolo": data['protocolo']
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/finalizadas/<protocolo>', methods=['GET'])
def buscar_finalizada(protocolo):
    """Busca uma denúncia finalizada por protocolo"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM denuncias_finalizadas 
            WHERE protocolo = ?
        ''', (protocolo,))
        
        denuncia = cursor.fetchone()
        conn.close()
        
        if denuncia:
            return jsonify({
                'id': denuncia[0],
                'protocolo': denuncia[1],
                'nome': denuncia[2],
                'rg': denuncia[3],
                'tipo': denuncia[4],
                'descricao': denuncia[5],
                'youtube': denuncia[6],
                'status': denuncia[7],
                'data_criacao': denuncia[8],
                'data_finalizacao': denuncia[9],
                'observacoes': denuncia[10]
            })
        else:
            return jsonify({"error": "Denúncia finalizada não encontrada"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/finalizadas/<protocolo>', methods=['DELETE'])
def remover_finalizada(protocolo):
    """Remove uma denúncia finalizada"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM denuncias_finalizadas WHERE protocolo = ?', (protocolo,))
        
        if cursor.rowcount > 0:
            conn.commit()
            conn.close()
            return jsonify({"message": "Denúncia finalizada removida com sucesso"})
        else:
            conn.close()
            return jsonify({"error": "Denúncia finalizada não encontrada"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/finalizadas/<protocolo>', methods=['PATCH'])
def atualizar_finalizada(protocolo):
    """Atualiza uma denúncia finalizada"""
    try:
        data = request.get_json()
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Verificar se existe
        cursor.execute('SELECT protocolo FROM denuncias_finalizadas WHERE protocolo = ?', (protocolo,))
        
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Denúncia finalizada não encontrada"}), 404
        
        # Atualizar campos
        campos = []
        valores = []
        
        for campo in ['nome', 'rg', 'tipo', 'descricao', 'youtube', 'observacoes']:
            if campo in data:
                campos.append(f"{campo} = ?")
                valores.append(data[campo])
        
        if campos:
            valores.append(protocolo)
            query = f"UPDATE denuncias_finalizadas SET {', '.join(campos)} WHERE protocolo = ?"
            cursor.execute(query, valores)
            conn.commit()
        
        conn.close()
        return jsonify({"message": "Denúncia finalizada atualizada com sucesso"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stats')
def estatisticas():
    """Retorna estatísticas das denúncias finalizadas"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Total de denúncias finalizadas
        cursor.execute('SELECT COUNT(*) FROM denuncias_finalizadas')
        total = cursor.fetchone()[0]
        
        # Por tipo
        cursor.execute('''
            SELECT tipo, COUNT(*) 
            FROM denuncias_finalizadas 
            GROUP BY tipo
        ''')
        por_tipo = dict(cursor.fetchall())
        
        # Por mês (últimos 12 meses)
        cursor.execute('''
            SELECT strftime('%Y-%m', data_finalizacao) as mes, COUNT(*)
            FROM denuncias_finalizadas
            WHERE data_finalizacao >= date('now', '-12 months')
            GROUP BY mes
            ORDER BY mes DESC
        ''')
        por_mes = dict(cursor.fetchall())
        
        conn.close()
        
        return jsonify({
            "total_finalizadas": total,
            "por_tipo": por_tipo,
            "por_mes": por_mes
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    print("🚔 Backend de Denúncias Finalizadas iniciado!")
    print("📊 Banco de dados inicializado")
    print("🌐 Servidor rodando em http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True) 