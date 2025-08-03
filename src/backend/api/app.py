"""
API da Ouvidoria da Polícia Militar
Backend Flask para gerenciamento de denúncias e notícias
"""

from flask import Flask, request, jsonify, render_template, g
from flask_cors import CORS
import sqlite3
import datetime
import os
import sys
import requests
import json

# Configuração do Flask
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.after_request
def after_request(response):
    """Configuração de CORS para todas as requisições"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Cache-Control,Pragma')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '86400')
    return response

# Configuração do Discord
DISCORD_CONFIG = {
    'guild_id': os.environ.get('DISCORD_GUILD_ID', '1234567890123456789'),
    'bot_token': os.environ.get('DISCORD_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE'),
    'api_base': 'https://discord.com/api/v10'
}

def get_db():
    """Conecta ao banco de dados SQLite"""
    if os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RENDER"):
        db_path = os.path.join('/tmp', 'ouvidoria.db')
    else:
        db_path = os.path.join(os.path.dirname(__file__), '../database/ouvidoria.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.teardown_appcontext
def close_connection(exception):
    """Fecha a conexão com o banco de dados"""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Inicializa o banco de dados com as tabelas necessárias"""
    with app.app_context():
        db = get_db()
        # Tabela de denúncias
        db.execute('''
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
                dataFinalizacao TIMESTAMP
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
        
        # Usa o protocolo enviado pelo frontend ou gera um novo
        protocolo = data.get('protocolo')
        print(f"Protocolo recebido do frontend: {protocolo}")
        
        # Inicializar conexão com banco
        db = get_db()
        
        if not protocolo:
            cur = db.execute('SELECT COUNT(*) FROM denuncias')
            count = cur.fetchone()[0] + 1
            protocolo = str(count).zfill(4)
            print(f"Gerando novo protocolo: {protocolo}")
        else:
            print(f"Usando protocolo do frontend: {protocolo}")
        
        # Insere a denúncia
        print(f"Inserindo denúncia com protocolo: {protocolo}")
        db.execute('''
            INSERT INTO denuncias (protocolo, nome, rg, tipo, descricao, youtube, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (protocolo, data.get('nome'), data.get('rg'), tipo, data.get('descricao'), 
              data.get('youtube'), 'Em Análise'))
        db.commit()
        print(f"Denúncia inserida com sucesso. Protocolo: {protocolo}")
        
        print(f"Retornando protocolo: {protocolo}")
        return jsonify({'protocolo': protocolo, "message": "Denúncia criada com sucesso"}), 201
        
    except sqlite3.IntegrityError:
        return jsonify({"error": "Protocolo já existe"}), 400
    except Exception as e:
        print(f"Erro ao criar denúncia: {e}")
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
            finalizada_em_str = d.get('dataFinalizacao') # Changed from finalizada_em
            
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
            # Buscar dados da denúncia antes de finalizar
            denuncia = db.execute('SELECT * FROM denuncias WHERE protocolo = ?', (protocolo,)).fetchone()
            if not denuncia:
                return jsonify({'error': 'Protocolo não encontrado'}), 404
            
            # Atualizar no banco principal
            finalizada_em = datetime.datetime.utcnow().isoformat()
            db.execute('''
                UPDATE denuncias SET status = ?, dataFinalizacao = ? WHERE protocolo = ?
            ''', (status, finalizada_em, protocolo))
            db.commit()
            
            # Mover para o backend de finalizadas
            try:
                dados_finalizada = {
                    'protocolo': denuncia['protocolo'],
                    'nome': denuncia['nome'],
                    'rg': denuncia['rg'],
                    'tipo': denuncia['tipo'],
                    'descricao': denuncia['descricao'],
                    'youtube': denuncia['youtube'],
                    'data_criacao': denuncia.get('dataCriacao', datetime.datetime.utcnow().isoformat()),
                    'data_finalizacao': finalizada_em,
                    'observacoes': 'Movida automaticamente do sistema principal'
                }
                
                # Tentar enviar para o backend de finalizadas no Render
                response = requests.post('https://ouvidoria-finalizadas.onrender.com/api/finalizadas', 
                                      json=dados_finalizada, timeout=10)
                
                if response.status_code == 201:
                    print(f"✅ Denúncia {protocolo} movida para finalizadas")
                else:
                    print(f"⚠️ Erro ao mover denúncia {protocolo} para finalizadas: {response.status_code}")
                    
            except Exception as e:
                print(f"⚠️ Erro ao conectar com backend de finalizadas: {e}")
                # Continua mesmo se falhar, pois a denúncia já foi finalizada no banco principal
        else:
            db.execute('''
                UPDATE denuncias SET status = ?, dataFinalizacao = NULL WHERE protocolo = ?
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

@app.route('/api/finalizadas', methods=['GET'])
def buscar_finalizadas():
    """Busca denúncias finalizadas no banco local"""
    try:
        db = get_db()
        finalizadas = db.execute('''
            SELECT * FROM denuncias 
            WHERE status = 'Finalizada' 
            ORDER BY dataFinalizacao DESC
        ''').fetchall()
        
        resultado = []
        for denuncia in finalizadas:
            resultado.append(dict(denuncia))
        
        return jsonify(resultado)
        
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar finalizadas: {str(e)}'}), 500

@app.route('/api/finalizadas/<protocolo>', methods=['GET'])
def buscar_finalizada_por_protocolo(protocolo):
    """Busca uma denúncia finalizada por protocolo"""
    try:
        db = get_db()
        denuncia = db.execute('''
            SELECT * FROM denuncias 
            WHERE protocolo = ? AND status = 'Finalizada'
        ''', (protocolo,)).fetchone()
        
        if denuncia:
            return jsonify(dict(denuncia))
        else:
            return jsonify({'error': 'Denúncia finalizada não encontrada'}), 404
            
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar finalizada: {str(e)}'}), 500

@app.route('/api/finalizadas', methods=['POST'])
def adicionar_finalizada():
    """Adiciona uma denúncia finalizada (proxy)"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('protocolo'):
            return jsonify({"error": "Protocolo é obrigatório"}), 400
        
        db = get_db()
        
        # Verificar se já existe
        d = db.execute('SELECT protocolo FROM denuncias WHERE protocolo = ?', (data['protocolo'],)).fetchone()
        
        if d:
            # Atualizar status para Finalizada
            db.execute('''
                UPDATE denuncias 
                SET status = 'Finalizada', dataFinalizacao = ? 
                WHERE protocolo = ?
            ''', (data.get('data_finalizacao', datetime.datetime.utcnow().isoformat()), data['protocolo']))
            db.commit()
            
            return jsonify({
                "message": "Denúncia finalizada atualizada com sucesso",
                "protocolo": data['protocolo']
            }), 200
        else:
            # Inserir nova denúncia finalizada
            db.execute('''
                INSERT INTO denuncias 
                (protocolo, nome, rg, tipo, descricao, youtube, status, dataFinalizacao)
                VALUES (?, ?, ?, ?, ?, ?, 'Finalizada', ?)
            ''', (
                data.get('protocolo'),
                data.get('nome', 'Anônimo'),
                data.get('rg', ''),
                data.get('tipo', ''),
                data.get('descricao', ''),
                data.get('youtube', ''),
                data.get('data_finalizacao', datetime.datetime.utcnow().isoformat())
            ))
            db.commit()
            
            return jsonify({
                "message": "Denúncia finalizada adicionada com sucesso",
                "protocolo": data['protocolo']
            }), 201
            
    except Exception as e:
        print(f"Erro em adicionar_finalizada: {str(e)}")
        return jsonify({"error": str(e)}), 500

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

@app.route('/api/discord/members', methods=['GET'])
def get_discord_members():
    """Endpoint para buscar membros do servidor Discord"""
    try:
        # Verificar se o bot token está configurado
        if DISCORD_CONFIG['bot_token'] == 'YOUR_BOT_TOKEN_HERE':
            # Retornar dados de exemplo se não estiver configurado
            return jsonify([
                {
                    "username": "Comandante Silva",
                    "avatar": None,
                    "status": "online",
                    "roles": ["Comandante Geral"]
                },
                {
                    "username": "Tenente Santos", 
                    "avatar": None,
                    "status": "idle",
                    "roles": ["Ouvidora"]
                },
                {
                    "username": "Sargento Costa",
                    "avatar": None, 
                    "status": "online",
                    "roles": ["Coordenador Técnico"]
                }
            ])
        
        # Fazer requisição para a API do Discord
        headers = {
            'Authorization': f'Bot {DISCORD_CONFIG["bot_token"]}',
            'Content-Type': 'application/json'
        }
        
        # Buscar membros do servidor
        guild_url = f"{DISCORD_CONFIG['api_base']}/guilds/{DISCORD_CONFIG['guild_id']}/members?limit=1000"
        response = requests.get(guild_url, headers=headers)
        
        if response.status_code != 200:
            print(f"Erro ao buscar membros do Discord: {response.status_code}")
            return jsonify([])
        
        members_data = response.json()
        members = []
        
        for member in members_data:
            # Buscar informações do usuário
            user_id = member['user']['id']
            user_url = f"{DISCORD_CONFIG['api_base']}/users/{user_id}"
            user_response = requests.get(user_url, headers=headers)
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                
                # Determinar status (online/offline)
                presence_url = f"{DISCORD_CONFIG['api_base']}/guilds/{DISCORD_CONFIG['guild_id']}/presences"
                presence_response = requests.get(presence_url, headers=headers)
                
                status = "offline"
                if presence_response.status_code == 200:
                    presences = presence_response.json()
                    for presence in presences:
                        if presence['user']['id'] == user_id:
                            status = presence['status']
                            break
                
                # Construir avatar URL
                avatar_url = None
                if user_data.get('avatar'):
                    avatar_url = f"https://cdn.discordapp.com/avatars/{user_id}/{user_data['avatar']}.png"
                
                # Buscar roles
                roles = []
                if member.get('roles'):
                    roles_url = f"{DISCORD_CONFIG['api_base']}/guilds/{DISCORD_CONFIG['guild_id']}/roles"
                    roles_response = requests.get(roles_url, headers=headers)
                    
                    if roles_response.status_code == 200:
                        guild_roles = roles_response.json()
                        for role_id in member['roles']:
                            for role in guild_roles:
                                if role['id'] == role_id:
                                    roles.append(role['name'])
                                    break
                
                members.append({
                    "username": user_data['username'],
                    "avatar": avatar_url,
                    "status": status,
                    "roles": roles
                })
        
        return jsonify(members)
        
    except Exception as e:
        print(f"Erro ao buscar membros do Discord: {e}")
        return jsonify([])

# ============================================================================
# INICIALIZAÇÃO DO SERVIDOR
# ============================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
