#!/usr/bin/env python3
"""
Script de teste para a API da Ouvidoria no Render
Testa todos os endpoints principais
"""

import requests
import json
import time
from datetime import datetime

# Configuração
BASE_URL = "https://policiamilitarnovacapital.onrender.com"  # Altere para sua URL
LOCAL_URL = "http://localhost:5000"

def test_endpoint(url, method="GET", data=None, expected_status=200):
    """Testa um endpoint específico"""
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        elif method == "PATCH":
            response = requests.patch(url, json=data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, timeout=10)
        
        print(f"✅ {method} {url}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == expected_status:
            print(f"   ✅ Status correto ({expected_status})")
        else:
            print(f"   ❌ Status incorreto. Esperado: {expected_status}, Recebido: {response.status_code}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                response_data = response.json()
                print(f"   📄 Resposta: {json.dumps(response_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"   📄 Resposta: {response.text[:200]}...")
        else:
            print(f"   📄 Resposta: {response.text[:200]}...")
        
        return response.status_code == expected_status
        
    except requests.exceptions.RequestException as e:
        print(f"❌ {method} {url}")
        print(f"   ❌ Erro de conexão: {e}")
        return False

def main():
    """Executa todos os testes"""
    print("🧪 Testando API da Ouvidoria")
    print("=" * 50)
    
    # Escolher URL base
    use_local = input("Testar local (localhost:5000) ou Render? (l/r): ").lower().startswith('l')
    base_url = LOCAL_URL if use_local else BASE_URL
    
    print(f"🔗 URL base: {base_url}")
    print()
    
    # Testes básicos
    print("📋 Testes Básicos")
    print("-" * 30)
    
    # Teste de status
    test_endpoint(f"{base_url}/")
    
    # Teste de health check
    test_endpoint(f"{base_url}/health")
    
    # Teste de conectividade
    test_endpoint(f"{base_url}/test")
    
    print()
    
    # Testes de denúncias
    print("📝 Testes de Denúncias")
    print("-" * 30)
    
    # Listar denúncias
    test_endpoint(f"{base_url}/api/denuncias")
    
    # Criar denúncia de teste
    denuncia_teste = {
        "nome": "Teste Automático",
        "rg": "123456789",
        "tipo": "1",
        "descricao": "Teste automático do sistema",
        "youtube": ""
    }
    
    response = requests.post(f"{base_url}/api/denuncias", json=denuncia_teste, timeout=10)
    if response.status_code == 201:
        protocolo = response.json().get('protocolo')
        print(f"✅ Denúncia criada com protocolo: {protocolo}")
        
        # Buscar denúncia criada
        test_endpoint(f"{base_url}/api/denuncias/{protocolo}")
        
        # Atualizar status
        test_endpoint(f"{base_url}/api/denuncias/{protocolo}", "PATCH", {"status": "Em Análise"})
        
        # Deletar denúncia de teste
        test_endpoint(f"{base_url}/api/denuncias/{protocolo}", "DELETE")
    else:
        print(f"❌ Erro ao criar denúncia: {response.status_code}")
    
    print()
    
    # Testes de notícias
    print("📰 Testes de Notícias")
    print("-" * 30)
    
    # Listar notícias
    test_endpoint(f"{base_url}/api/noticias")
    
    # Criar notícia de teste
    noticia_teste = {
        "titulo": "Teste de Notícia",
        "conteudo": "Esta é uma notícia de teste criada automaticamente.",
        "fotos": ""
    }
    
    response = requests.post(f"{base_url}/api/noticias", json=noticia_teste, timeout=10)
    if response.status_code == 201:
        noticia_id = response.json().get('id')
        print(f"✅ Notícia criada com ID: {noticia_id}")
        
        # Deletar notícia de teste
        test_endpoint(f"{base_url}/api/noticias/{noticia_id}", "DELETE")
    else:
        print(f"❌ Erro ao criar notícia: {response.status_code}")
    
    print()
    
    # Testes de finalizadas
    print("✅ Testes de Finalizadas")
    print("-" * 30)
    
    test_endpoint(f"{base_url}/api/finalizadas")
    
    print()
    
    # Testes de diagnóstico
    print("🔧 Testes de Diagnóstico")
    print("-" * 30)
    
    test_endpoint(f"{base_url}/debug-noticias")
    test_endpoint(f"{base_url}/check-table")
    
    print()
    
    # Testes de Discord
    print("🎮 Testes de Discord")
    print("-" * 30)
    
    test_endpoint(f"{base_url}/api/discord/members")
    
    print()
    print("🏁 Testes concluídos!")
    print(f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 