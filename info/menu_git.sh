#!/bin/bash

function actualizar() {
    echo "Actualizando repositorio (git pull)..."
    git pull origin main
    read -rp "Presiona Enter para continuar..."
}

function agregar() {
    echo "Añadiendo todos los cambios (git add .)..."
    git add .
    read -rp "Presiona Enter para continuar..."
}

function commitear() {
    read -rp "Escribe el mensaje del commit: " msg
    if [ -z "$msg" ]; then
        echo "Mensaje vacío. Commit cancelado."
    else
        git commit -m "$msg"
        echo "Commit realizado."
    fi
    read -rp "Presiona Enter para continuar..."
}

function subir() {
    echo "Subiendo cambios a GitHub (git push)..."
    git push origin main
    read -rp "Presiona Enter para continuar..."
}

while true; do
    clear
    echo "==============================="
    echo "         MENÚ GIT BÁSICO       "
    echo "==============================="
    echo "1) Actualizar repositorio (git pull)"
    echo "2) Añadir cambios (git add .)"
    echo "3) Hacer commit"
    echo "4) Subir cambios (git push)"
    echo "5) Salir"
    echo
    read -rp "Selecciona una opción [1-5]: " opcion

    case $opcion in
        1) actualizar ;;
        2) agregar ;;
        3) commitear ;;
        4) subir ;;
        5) echo "¡Hasta luego!"; exit 0 ;;
        *) echo "Opción inválida. Intenta de nuevo." ; read -rp "Presiona Enter para continuar..." ;;
    esac
done
