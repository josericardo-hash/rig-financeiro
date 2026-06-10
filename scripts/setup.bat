@echo off
echo === RIG Financeiro 2.0 - Setup ===
cd /d "%~dp0.."
echo Subindo banco de dados...
cd infra
docker-compose up -d postgres pgadmin
cd ..
echo Instalando dependencias Python...
cd backend
pip install -r requirements.txt
cd ..
echo Rodando migrations...
cd backend
alembic upgrade head
cd ..
echo Populando empresas...
python scripts/seed_empresas.py
echo === Setup concluido! ===
echo Backend: cd backend && uvicorn main:app --reload --port 8055
echo Frontend: cd frontend && npm install && npm run dev
pause
