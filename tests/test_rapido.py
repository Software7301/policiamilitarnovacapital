#!/usr/bin/env python3
"""
Teste rápido para verificar o status do sistema da Ouvidoria
"""

import requests
import os
import sys

def test_backend_rapido():
    """Teste rápido do backend"""
    print("🔧 Testando Backend...")
    
    try:
        # Teste básico
        response = requests.get("http://127.0.0.1:5000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend principal funcionando!")
            print(f"📄 Resposta: {response.text}")
            return True
        else:
            print(f"❌ Backend retornou status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no backend: {e}")
        return False

def test_api_endpoints():
    """Teste rápido dos endpoints"""
    print("\n🔗 Testando Endpoints...")
    
    endpoints = [
        ("/api/denuncias", "Denúncias"),
        ("/api/noticias", "Notícias"),
        ("/test", "Teste")
    ]
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"http://127.0.0.1:5000{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {name} - OK")
            else:
                print(f"❌ {name} - Status {response.status_code}")
        except Exception as e:
            print(f"❌ {name} - Erro: {e}")

def test_frontend_files():
    """Teste rápido dos arquivos frontend"""
    print("\n🌐 Testando Frontend...")
    
    files = [
        "src/frontend/pages/index.html",
        "src/frontend/pages/denunciar.html", 
        "src/frontend/pages/noticias.html",
        "src/frontend/styles/style.css",
        "src/frontend/scripts/script.js",
        "src/frontend/components/admin/admin.html"
    ]
    
    missing = []
    for file in files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - FALTANDO")
            missing.append(file)
    
    if not missing:
        print("✅ Todos os arquivos frontend estão presentes!")
    else:
        print(f"⚠️ {len(missing)} arquivos estão faltando")

def main():
    """Função principal"""
    print("🚀 TESTE RÁPIDO DO SISTEMA")
    print("=" * 40)
    
    # Teste do backend
    backend_ok = test_backend_rapido()
    
    if backend_ok:
        # Teste dos endpoints
        test_api_endpoints()
    
    # Teste do frontend
    test_frontend_files()
    
    print("\n" + "=" * 40)
    if backend_ok:
        print("🎉 SISTEMA FUNCIONANDO!")
        print("🌐 Backend: http://127.0.0.1:5000")
        print("📱 Frontend: Abra src/frontend/pages/index.html no navegador")
    else:
        print("🚨 PROBLEMA NO BACKEND!")
        print("💡 Execute: cd src/backend/api && python app.py")

if __name__ == "__main__":
    main() 