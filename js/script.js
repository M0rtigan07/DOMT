// js/script.js

// Obtenemos una referencia al nuevo selector de mazo
const deckSelector = document.getElementById('deckSelector');
const drawCardBtn = document.getElementById('drawCardBtn');
const resetDeckBtn = document.getElementById('resetDeckBtn');
const cardDisplay = document.getElementById('cardDisplay');
const messageDisplay = document.getElementById('messageDisplay');

let playableDeck = [];
let drawnCards = [];
let cardsDrawnThisTurn = 0;
const MAX_CARDS_PER_TURN = 4;
const MAX_TURNS = 10; // Cambia este valor al límite de turnos que desees
let turnCounter = 0; // Contador de turnos
let cardUsageCount = {}; // Objeto para rastrear cuántas veces ha salido cada carta

// Función para inicializar el mazo y el turno
function initializeDeck() {
    const selectedDeckType = deckSelector.value;

    if (selectedDeckType === 'tarot') {
        playableDeck = [...majorArcanaTarot];
    } else if (selectedDeckType === 'manyThings') {
        playableDeck = [...deckOfManyThings];
    } else {
        playableDeck = [...majorArcanaTarot]; // Por defecto, usa el Tarot
        console.warn("Tipo de mazo no reconocido, usando Tarot por defecto.");
    }

    drawnCards = [];
    cardsDrawnThisTurn = 0;
    cardDisplay.innerHTML = '';
    drawCardBtn.disabled = false;

    // Reinicia los atributos del jugador, pero NO el inventario
    player.health = 100;
    player.mana = 50;
    player.gold = 0;
    player.level = 1;

    // Reinicia el contador de uso de cartas
    cardUsageCount = {};

    updatePlayerStats();
    updatePlayerInventory();

    // Oculta el botón de reiniciar
    resetDeckBtn.style.display = 'none';

    // Actualiza el mensaje inicial
    updateMessage("Selecciona un mazo y saca tu primera carta.");
}

// Función para sacar una carta
function drawRandomCard() {
    if (turnCounter >= MAX_TURNS) {
        updateMessage(`¡Has alcanzado el máximo de ${MAX_TURNS} turnos! El juego ha terminado.`);
        drawCardBtn.disabled = true;
        resetDeckBtn.style.display = 'block';
        return;
    }

    if (cardsDrawnThisTurn === 0) {
        turnCounter++; // Incrementa el contador de turnos solo al inicio del turno
        logEvent(`Inicio del Turno ${turnCounter}`); // Registra el inicio del turno
    }

    if (deckSelector.parentElement.style.display !== 'none') {
        deckSelector.parentElement.style.display = 'none';
    }

    if (playableDeck.length === 0) {
        updateMessage("¡No quedan más cartas en el mazo! Reinicia para volver a jugar.");
        drawCardBtn.disabled = true;
        resetDeckBtn.style.display = 'block'; // Muestra el botón de reiniciar
        return;
    }

    if (cardsDrawnThisTurn >= MAX_CARDS_PER_TURN) {
        updateMessage(`Has sacado el límite de ${MAX_CARDS_PER_TURN} cartas por turno. Reinicia el mazo.`);
        drawCardBtn.disabled = true;
        resetDeckBtn.style.display = 'block'; // Muestra el botón de reiniciar
        return;
    }

    let drawnCard;
    let attempts = 0; // Para evitar un bucle infinito si todas las cartas posibles ya están restringidas

    do {
        const randomIndex = Math.floor(Math.random() * playableDeck.length);
        drawnCard = playableDeck[randomIndex];

        // Verificar si la carta ha alcanzado su límite de repeticiones
        if (cardUsageCount[drawnCard.name] >= 2) { // Límite de 2 para "La Estrella"
            attempts++;
            if (attempts > 10) {
                logEvent("No se pudo encontrar una carta válida. Intenta reiniciar el mazo.");
                return;
            }
            continue;
        }

        // Si la carta es válida, elimínala del mazo y continúa
        playableDeck.splice(randomIndex, 1);
        break;
    } while (true);

    // Incrementar el contador de uso de la carta
    if (!cardUsageCount[drawnCard.name]) {
        cardUsageCount[drawnCard.name] = 0;
    }
    cardUsageCount[drawnCard.name]++;

    drawnCards.push(drawnCard);

    displayCard(drawnCard);
    handleCardEffect(drawnCard); // Aplica los efectos de la carta
    logEvent(`Has sacado la carta "${drawnCard.name}": ${drawnCard.description}`);
    cardsDrawnThisTurn++;

    if (cardsDrawnThisTurn < MAX_CARDS_PER_TURN) {
        updateMessage(`Turno ${turnCounter}: Cartas sacadas este turno: ${cardsDrawnThisTurn}/${MAX_CARDS_PER_TURN}`);
    } else {
        updateMessage(`Turno ${turnCounter}: Has alcanzado el límite de ${MAX_CARDS_PER_TURN} cartas este turno. Reinicia el mazo.`);
        drawCardBtn.disabled = true;
        resetDeckBtn.style.display = 'block'; // Muestra el botón de reiniciar
    }
}

// Función para mostrar una carta
function displayCard(card) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.innerHTML = `
        <img src="${card.image}" alt="${card.name}" class="card-image">
        <h3>${card.name}</h3>
       
    `;
    cardDisplay.appendChild(cardElement);
}

// Función para actualizar el mensaje
function updateMessage(message) {
    if (messageDisplay) {
        messageDisplay.textContent = message;
    }
}

function updatePlayerStats(name, health, mana) {
    document.getElementById('playerName').querySelector('span').textContent = name;
    document.getElementById('playerHealth').querySelector('span').textContent = health;
    document.getElementById('playerMana').querySelector('span').textContent = mana;
}

function logEvent(message) {
    const eventList = document.getElementById('eventList');
    const eventItem = document.createElement('li');
    eventItem.textContent = message;
    eventList.appendChild(eventItem);
}

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
            player.health -= 30;
            logEvent("¡Un enemigo te ha atacado! Pierdes 30 puntos de salud.");
            break;
        case "El Troll":
            if (player.inventory.includes("Espada")) {
                player.health -= 40; // Daño reducido si el jugador tiene una espada
                logEvent("¡Un Troll gigante te ha atacado! Pero gracias a tu espada, solo pierdes 40 puntos de salud.");
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
    updatePlayerInventory(); // Asegúrate de que esta función se llame aquí
}

// Event Listeners
drawCardBtn.addEventListener('click', drawRandomCard);
resetDeckBtn.addEventListener('click', () => {
    initializeDeck();
    resetDeckBtn.style.display = 'none'; // Oculta el botón después de reiniciar
});

// Añadimos un listener para que el mazo se reinicie automáticamente al cambiar la selección
deckSelector.addEventListener('change', initializeDeck); 

document.addEventListener('DOMContentLoaded', () => {
    turnCounter = 0; // Reinicia el contador de turnos al cargar la página
    initializeDeck();
    
    // Ejemplo: Actualizar atributos del personaje
    updatePlayerStats('Héroe', 80, 40);
    
    // Ejemplo: Registrar un evento
    //logEvent('Has sacado la carta "El Mago".');
   // logEvent('Tu salud ha disminuido en 10 puntos.');
});