@echo off
echo ========================================
echo    Iniciando Backends da Ouvidoria PM NC
echo ========================================
echo.

echo 🚀 Iniciando Backend Principal (Porta 5000)...
start "Backend Principal" cmd /k "cd src/backend/api && python app.py"

echo.
echo ⏳ Aguardando 3 segundos...
timeout /t 3 /nobreak > nul

echo 🚀 Iniciando Backend de Finalizadas (Porta 5001)...
start "Backend Finalizadas" cmd /k "cd src/backend/finalizadas && python app.py"

echo.
echo ✅ Ambos os backends foram iniciados!
echo.
echo 📊 Backend Principal: http://localhost:5000
echo 📋 Backend Finalizadas: http://localhost:5001
echo.
echo 🌐 Frontend: Abra src/frontend/pages/index.html no navegador
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul 