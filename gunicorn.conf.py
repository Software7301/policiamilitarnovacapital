# Configuração do Gunicorn para o Render
# Arquivo: gunicorn.conf.py

import os
import multiprocessing

# Configurações básicas
bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"
workers = 2  # Otimizado para o Render
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50

# Timeouts
timeout = 120
keepalive = 2
graceful_timeout = 30

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Performance
preload_app = True
worker_tmp_dir = "/dev/shm"  # Usar memória compartilhada se disponível

# Configurações específicas para produção
if os.environ.get("RENDER"):
    # Configurações otimizadas para o Render
    workers = 2
    max_requests = 500
    timeout = 120
    
    # Logs mais detalhados em produção
    loglevel = "info"
    
    # Configurações de segurança
    limit_request_line = 4094
    limit_request_fields = 100
    limit_request_field_size = 8190

# Configurações de desenvolvimento
if os.environ.get("FLASK_ENV") == "development":
    workers = 1
    reload = True
    loglevel = "debug"

def when_ready(server):
    """Callback executado quando o servidor está pronto"""
    server.log.info("🚀 Servidor Gunicorn iniciado e pronto para receber conexões")

def on_starting(server):
    """Callback executado quando o servidor está iniciando"""
    server.log.info("🔧 Iniciando servidor Gunicorn...")

def worker_int(worker):
    """Callback executado quando um worker é interrompido"""
    worker.log.info("🔄 Worker interrompido")

def worker_abort(worker):
    """Callback executado quando um worker é abortado"""
    worker.log.info("❌ Worker abortado")

def pre_fork(server, worker):
    """Callback executado antes de criar um worker"""
    server.log.info(f"🔧 Criando worker {worker.pid}")

def post_fork(server, worker):
    """Callback executado após criar um worker"""
    server.log.info(f"✅ Worker {worker.pid} criado com sucesso")

def post_worker_init(worker):
    """Callback executado após inicializar um worker"""
    worker.log.info(f"🚀 Worker {worker.pid} inicializado")

def worker_exit(server, worker):
    """Callback executado quando um worker sai"""
    server.log.info(f"👋 Worker {worker.pid} finalizado")

def on_exit(server):
    """Callback executado quando o servidor é finalizado"""
    server.log.info("🛑 Servidor Gunicorn finalizado") 