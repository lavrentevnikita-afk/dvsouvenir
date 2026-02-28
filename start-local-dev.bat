@echo off
REM Запуск локальной разработки фронтенда и бэкенда


REM Запуск бэкенда (через npx nodemon)
start "Backend" cmd /k "cd backend && npx nodemon --watch 'src/**/*.ts' --exec npx ts-node src/main.ts"

REM Запуск фронтенда (только запуск)
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Все процессы запущены в отдельных окнах.
pause
