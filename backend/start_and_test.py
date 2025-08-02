import subprocess
import time
import requests
import sys
import os

def start_server():
    """Inicia o servidor Flask em background"""
    print("🚀 Iniciando servidor Flask...")
    
    # Inicia o servidor em background
    process = subprocess.Popen([
        sys.executable, "app.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Aguarda um pouco para o servidor inicializar
    time.sleep(3)
    
    return process

def test_server():
    """Testa se o servidor está funcionando"""
    print("🧪 Testando servidor...")
    
    try:
        # Teste básico
        response = requests.get("http://127.0.0.1:5000/", timeout=5)
        if response.status_code == 200:
            print("✅ Servidor está respondendo!")
            print(f"📄 Resposta: {response.text}")
            return True
        else:
            print(f"❌ Servidor retornou status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao servidor")
        return False
    except Exception as e:
        print(f"❌ Erro ao testar servidor: {e}")
        return False

def test_api_endpoints():
    """Testa os endpoints da API"""
    print("\n🔧 Testando endpoints da API...")
    
    try:
        # Teste do endpoint de denúncias
        response = requests.get("http://127.0.0.1:5000/api/denuncias", timeout=5)
        if response.status_code == 200:
            print("✅ Endpoint /api/denuncias funcionando")
        else:
            print(f"❌ Endpoint /api/denuncias retornou {response.status_code}")
        
        # Teste do endpoint de notícias
        response = requests.get("http://127.0.0.1:5000/api/noticias", timeout=5)
        if response.status_code == 200:
            print("✅ Endpoint /api/noticias funcionando")
        else:
            print(f"❌ Endpoint /api/noticias retornou {response.status_code}")
        
        # Teste do endpoint de teste
        response = requests.get("http://127.0.0.1:5000/test", timeout=5)
        if response.status_code == 200:
            print("✅ Endpoint /test funcionando")
        else:
            print(f"❌ Endpoint /test retornou {response.status_code}")
            
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar endpoints: {e}")
        return False

def main():
    """Função principal"""
    print("🎯 INICIANDO TESTE COMPLETO DO BACKEND")
    print("=" * 50)
    
    # Inicia o servidor
    process = start_server()
    
    try:
        # Testa o servidor
        if test_server():
            # Testa os endpoints
            test_api_endpoints()
            
            print("\n" + "=" * 50)
            print("✅ BACKEND FUNCIONANDO CORRETAMENTE!")
            print("🌐 Servidor rodando em: http://127.0.0.1:5000")
            print("📝 Para parar o servidor, pressione Ctrl+C")
            print("=" * 50)
            
            # Mantém o servidor rodando
            try:
                process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Parando servidor...")
                process.terminate()
                
        else:
            print("\n❌ FALHA NO TESTE DO BACKEND")
            process.terminate()
            
    except Exception as e:
        print(f"\n❌ Erro durante o teste: {e}")
        process.terminate()

if __name__ == "__main__":
    main() 