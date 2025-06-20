@echo off
setlocal enabledelayedexpansion

:MENU
cls
echo ================================
echo         MENU GIT BASICO
echo ================================
echo 1. Actualizar repositorio (git pull)
echo 2. Añadir cambios (git add .)
echo 3. Hacer commit
echo 4. Subir cambios (git push)
echo 5. Salir
echo.
set /p option=Selecciona una opcion [1-5]:

if "%option%"=="1" goto PULL
if "%option%"=="2" goto ADD
if "%option%"=="3" goto COMMIT
if "%option%"=="4" goto PUSH
if "%option%"=="5" goto FIN

echo Opcion invalida, intenta de nuevo.
pause
goto MENU

:PULL
git pull origin main
pause
goto MENU

:ADD
git add .
pause
goto MENU

:COMMIT
set /p commitmsg=Escribe el mensaje del commit: 
if "%commitmsg%"=="" (
    echo Mensaje vacio. Commit cancelado.
) else (
    git commit -m "%commitmsg%"
)
pause
goto MENU

:PUSH
git push origin main
pause
goto MENU

:FIN
echo Gracias, hasta luego!
exit /b
