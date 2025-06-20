#!/bin/bash

# === CONFIGURACIÓN ===
REPO_URL="https://github.com/M0rtigan07/DOMT.git"
FOLDER_NAME="DOMT"
GIT_USER_NAME="M0rtigan07"
GIT_USER_EMAIL="manuelangelbravo.mab@gmail.com"

function clonar() {
    if [ -d "$FOLDER_NAME" ]; then
        echo "El repositorio ya existe."
    else
        echo "Clonando el repositorio..."
        git clone "$REPO_URL"
    fi
    read -rp "Presiona Enter para continuar..."
}

function configurar() {
    if [ ! -d "$FOLDER_NAME" ]; then
        echo "Primero debes clonar el repositorio."
        read -rp "Presiona Enter para continuar..."
        return
    fi
    cd "$FOLDER_NAME" || return
    git config user.name "$GIT_USER_NAME"
    git config user.email "$GIT_USER_EMAIL"
    git remote remove origin 2>/dev/null
    git remote add origin "$REPO_URL"
    echo "Configuración de Git completada."
    cd ..
    read -rp "Presiona Enter para continuar..."
}

function actualizar() {
    if [ ! -d "$FOLDER_NAME" ]; then
        echo "Primero debes clonar el repositorio."
        read -rp "Presiona Enter para continuar..."
        return
    fi
    cd "$FOLDER_NAME" || return
    git pull origin main
    cd ..
    read -rp "Presiona Enter para continuar..."
}

function instalar() {
    if [ ! -d "$FOLDER_NAME" ]; then
        echo "Primero debes clonar el repositorio."
        read -rp "Presiona Enter para continuar..."
        return
    fi
    cd "$FOLDER_NAME" || return
    npm install
    cd ..
    read -rp "Presiona Enter para continuar..."
}

function servidor() {
    if [ ! -d "$FOLDER_NAME" ]; then
        echo "Primero debes clonar el repositorio."
        read -rp "Presiona Enter para continuar..."
        return
    fi
    cd "$FOLDER_NAME" || return
    echo "Iniciando servidor en http://localhost:8000 ..."
    python3 -m http.server 8000 &
    sleep 1
    xdg-open http://localhost:8000
    fg
    cd ..
    read -rp "Presiona Enter para continuar..."
}

while true; do
    clear
    echo "==============================="
    echo "         MENÚ DE OPCIONES      "
    echo "==============================="
    echo "1) Clonar repositorio (si no existe)"
    echo "2) Configurar Git (usuario y remote)"
    echo "3) Actualizar repositorio (git pull)"
    echo "4) Instalar dependencias (npm install)"
    echo "5) Lanzar servidor local (Python y abrir navegador)"
    echo "6) Salir"
    echo
    read -rp "Selecciona una opción [1-6]: " opcion

    case $opcion in
        1) clonar ;;
        2) configurar ;;
        3) actualizar ;;
        4) instalar ;;
        5) servidor ;;
        6) echo "¡Hasta luego!"; exit 0 ;;
        *) echo "Opción inválida. Intenta de nuevo." ; read -rp "Presiona Enter para continuar..." ;;
    esac
done
