@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto sem_node
npm start
goto fim

:sem_node
echo Nao encontrei o Node.js neste computador.
echo Instale o Node.js 20 ou mais recente e tente novamente.
pause

:fim
