@echo off
setlocal enabledelayedexpansion

REM Configuración
set REPO_URL=https://github.com/M0rtigan07/DOMT.git
set FOLDER_NAME=DOMT
set GIT_USER_NAME=Manuel Angel Bravo Lopez
set GIT_USER_EMAIL=tucorreo@ejemplo.com

:MENU
cls
echo ================================
echo       MENU DE OPCIONES
echo ================================
echo 1. Clonar repositorio (si no existe)
echo 2. Configurar Git (usuario y remote)
echo 3. Actualizar repositorio (git pull)
echo 4. Instalar dependencias (npm install)
echo 5. Lanzar servidor local (Python)
echo 6. Abrir navegador en localhost:8000
echo 7. Salir
echo.
set /p option=Selecciona una opcion [1-7]:

if "%option%"=="1" goto CLONAR
if "%option%"=="2" goto CONFIGURAR
if "%option%"=="3" goto ACTUALIZAR
if "%option%"=="4" goto INSTALAR
if "%option%"=="5" goto SERVIDOR
if "%option%"=="6" goto NAVEGADOR
if "%option%"=="7" goto FIN

echo Opcion invalida, intenta de nuevo.
pause
goto MENU

:CLONAR
if exist "%FOLDER_NAME%" (
    echo El repositorio ya existe.
) else (
    echo Clonando repositorio...
    git clone %REPO_URL%
)
pause
goto MENU

:CONFIGURAR
if not exist "%FOLDER_NAME%" (
    echo Primero debes clonar el repositorio.
    pause
    goto MENU
)
cd %FOLDER_NAME%
git config user.name "%GIT_USER_NAME%"
git config user.email "%GIT_USER_EMAIL%"
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
echo Configuracion de Git completada.
pause
cd ..
goto MENU

:ACTUALIZAR
if not exist "%FOLDER_NAME%" (
    echo Primero debes clonar el repositorio.
    pause
    goto MENU
)
cd %FOLDER_NAME%
git pull origin main
pause
cd ..
goto MENU

:INSTALAR
if not exist "%FOLDER_NAME%" (
    echo Primero debes clonar el repositorio.
    pause
    goto MENU
)
cd %FOLDER_NAME%
npm install
pause
cd ..
goto MENU

:SERVIDOR
if not exist "%FOLDER_NAME%" (
    echo Primero debes clonar el repositorio.
    pause
    goto MENU
)
cd %FOLDER_NAME%
echo Iniciando servidor en http://localhost:8000 ...
start /B python -m http.server 8000
pause
cd ..
goto MENU

:NAVEGADOR
start http://localhost:8000
pause
goto MENU

:FIN
echo Gracias, hasta luego!
exit /b
