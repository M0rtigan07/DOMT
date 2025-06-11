// Atributos del personaje
const player = {
    name: "Héroe",
    health: 100,
    mana: 50,
    gold: 0,
    level: 1,
    inventory: [] // Inventario del personaje
};

// Función para actualizar los atributos del personaje en la interfaz
function updatePlayerStats() {
    document.getElementById('playerName').querySelector('span').textContent = player.name;
    document.getElementById('playerHealth').querySelector('span').textContent = player.health;
    document.getElementById('playerMana').querySelector('span').textContent = player.mana;
    document.getElementById('playerGold').querySelector('span').textContent = player.gold;
    document.getElementById('playerLevel').querySelector('span').textContent = player.level;
}

// Función para manejar los efectos de las cartas en el personaje
function handleCardEffect(card) {
    switch (card.name) {
        case "La Gema":
            player.gold += 5000;
            logEvent("¡Has ganado 5000 gp!");
            break;
        case "La Ruina":
            player.gold = 0;
            logEvent("¡Has perdido todo tu oro!");
            break;
        case "El Vacío":
            player.level = Math.max(1, player.level - 1); // No baja de nivel 1
            logEvent("¡Has perdido 1 nivel!");
            break;
        case "El Sabio":
            player.level += 1;
            logEvent("¡Has subido 1 nivel!");
            break;
        case "La Estrella":
            player.health = Math.min(100, player.health + 20); // Salud máxima de 100
            logEvent("¡Tu salud ha aumentado en 20 puntos!");
            break;
        case "El Cráneo":
            if (player.inventory.includes("Espada")) {
                player.health -= 15; // Daño reducido si el jugador tiene una espada
                logEvent("¡Un Eskeleto Guerero te ha atacado! Pero gracias a tu espada, solo pierdes 15 puntos de salud.");
                alert("¡Gracias a tu espada, el daño del Eskeleto se ha reducido a 15 puntos!");
            } else {
                player.health -= 45; // Daño completo si no tiene una espada
                logEvent("¡Un Eskeleto Guerero te ha atacado! Pierdes 45 puntos de salud.");
            }
           
            break;
        case "El Troll":
           
            if (player.inventory.includes("Espada")) {
                player.health -= 20; // Daño reducido si el jugador tiene una espada
                logEvent("¡Un Troll gigante te ha atacado! Pero gracias a tu espada, solo pierdes 40 puntos de salud.");
                alert("¡Gracias a tu espada, el daño del Troll se ha reducido a 40 puntos!");
            } else {
                player.health -= 80; // Daño completo si no tiene una espada
                logEvent("¡Un Troll gigante te ha atacado! Pierdes 80 puntos de salud.");
            }
            break;
        case "La espada":
            player.inventory.push("Espada"); // Añade "Espada" al inventario
            logEvent("¡Has obtenido una espada! Se ha añadido a tu inventario.");
            break;
        default:
            logEvent(`La carta "${card.name}" no tiene un efecto directo.`);
            break;
    }

    // Actualiza los atributos del personaje en la interfaz
    updatePlayerStats();
    updatePlayerInventory();

    // Verifica si el jugador ha perdido
    checkGameOver();
}

function updatePlayerInventory() {
    const inventoryList = document.getElementById('playerInventory');
    inventoryList.innerHTML = ''; // Limpia el contenido actual del inventario en la interfaz

    if (player.inventory.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = "El inventario está vacío.";
        inventoryList.appendChild(emptyMessage);
    } else {
        player.inventory.forEach(item => {
            const inventoryItem = document.createElement('li');
            inventoryItem.textContent = item;
            inventoryList.appendChild(inventoryItem);
        });
    }
}

function checkGameOver() {
    if (player.health <= 0) {
        player.health = 0; // Asegúrate de que no sea menor a 0
        updatePlayerStats(); // Actualiza la interfaz para reflejar la salud en 0
        logEvent("¡Game Over! Tu salud ha llegado a 0.");
        drawCardBtn.disabled = true; // Desactiva el botón de sacar carta
        resetDeckBtn.style.display = 'block'; // Muestra el botón de reiniciar
        alert("¡Game Over! Has perdido la partida.");
    }
}