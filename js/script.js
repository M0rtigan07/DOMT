// js/script.js

// Referencias a elementos del DOM
const deckSelector = document.getElementById('deckSelector');
const startGameBtn = document.getElementById('startGameBtn');
const drawCardBtn = document.getElementById('drawCardBtn');
const resetDeckBtn = document.getElementById('resetDeckBtn');
const cardDisplay = document.getElementById('cardDisplay');
const messageDisplay = document.getElementById('messageDisplay');
const restartGameBtn = document.getElementById('restartGameBtn');

let playableDeck = [];
let drawnCards = [];
let cardsDrawnThisTurn = 0;
const MAX_CARDS_PER_TURN = 4;
const MAX_TURNS = 10;
let turnCounter = 1;
let cardUsageCount = {};
let lastSwordTurn = -10;

// Inicializa el mazo y los atributos del jugador
function initializeDeck() {
    const selectedDeckType = deckSelector.value;

    if (selectedDeckType === 'tarot') {
        playableDeck = [...majorArcanaTarot];
    } else if (selectedDeckType === 'manyThings') {
        playableDeck = [...deckOfManyThings];
    } else {
        playableDeck = [...majorArcanaTarot];
        console.warn("Tipo de mazo no reconocido, usando Tarot por defecto.");
    }

    drawnCards = [];
    cardsDrawnThisTurn = 0;
    cardDisplay.innerHTML = '';
    drawCardBtn.disabled = false;

    // Reinicia los atributos del jugador (usa game.js)
    player.health = 100;
    player.mana = 50;
    player.gold = 0;
    player.level = 1;
    player.inventory = [];

    cardUsageCount = {};
    turnCounter = 1;
    updatePlayerStats();
    updatePlayerInventory();

    // Mostrar solo el botón de inicio
    startGameBtn.style.display = 'inline-block';
    drawCardBtn.style.display = 'none';
    resetDeckBtn.style.display = 'none';
    restartGameBtn.style.display = 'none';
    updateMessage("Selecciona un mazo y pulsa 'Iniciar Juego'.");
}

// Evento para el botón de inicio
startGameBtn.addEventListener('click', () => {
    startGameBtn.style.display = 'none';
    drawCardBtn.style.display = 'inline-block';
    updateMessage("¡Juego iniciado! Saca tu primera carta.");
});

// Evento para cambiar de mazo
deckSelector.addEventListener('change', initializeDeck);

// Función para sacar una carta
function drawRandomCard() {
    if (turnCounter > MAX_TURNS) {
        logEvent("¡Game Over! Has alcanzado el máximo de turnos.");
        mostrarPantallaGameOver();
        return;
    }

    if (cardsDrawnThisTurn === 0) {
        logEvent(`Inicio del Turno ${turnCounter}`);
    }

    if (deckSelector.parentElement.style.display !== 'none') {
        deckSelector.parentElement.style.display = 'none';
    }

    if (playableDeck.length === 0) {
        updateMessage("¡No quedan más cartas en el mazo! Reinicia para volver a jugar.");
        drawCardBtn.disabled = true;
        resetDeckBtn.style.display = 'block';
        return;
    }

    if (cardsDrawnThisTurn >= MAX_CARDS_PER_TURN) {
        updateMessage(`Has sacado el límite de ${MAX_CARDS_PER_TURN} cartas por turno. Siguiente turno.`);
        drawCardBtn.disabled = true;
        resetDeckBtn.style.display = 'block';
        return;
    }

    let drawnCard;
    let attempts = 0;

    do {
        const randomIndex = Math.floor(Math.random() * playableDeck.length);
        drawnCard = playableDeck[randomIndex];

        if (
            drawnCard.name === "La espada" &&
            turnCounter - lastSwordTurn < 10
        ) {
            attempts++;
            if (attempts > 20) {
                logEvent('No se pudo encontrar una carta válida. Intenta reiniciar el mazo.');
                return;
            }
            continue;
        }

        if (cardUsageCount[drawnCard.name] >= 2) {
            attempts++;
            if (attempts > 20) {
                logEvent("No se pudo encontrar una carta válida. Intenta reiniciar el mazo.");
                return;
            }
            continue;
        }

        playableDeck.splice(randomIndex, 1);
        break;
    } while (true);

    if (drawnCard.name === "La espada") {
        lastSwordTurn = turnCounter;
    }

    if (!cardUsageCount[drawnCard.name]) {
        cardUsageCount[drawnCard.name] = 0;
    }
    cardUsageCount[drawnCard.name]++;

    drawnCards.push(drawnCard);

    displayCard(drawnCard);
    handleCardEffect(drawnCard); // Esta función está en game.js
    logEvent(`Has sacado la carta "${drawnCard.name}": ${drawnCard.description}`);
    cardsDrawnThisTurn++;

    if (player.health <= 0) {
        player.health = 0;
        updatePlayerStats();
        logEvent("¡Game Over! Tu salud ha llegado a 0.");
        mostrarPantallaGameOver();
        return;
    }

    if (cardsDrawnThisTurn < MAX_CARDS_PER_TURN) {
        updateMessage(`Turno ${turnCounter}: Cartas sacadas este turno: ${cardsDrawnThisTurn}/${MAX_CARDS_PER_TURN}`);
    } else {
        updateMessage(`Turno ${turnCounter}: Has alcanzado el límite de ${MAX_CARDS_PER_TURN} cartas este turno. Siguiente turno.`);
        drawCardBtn.disabled = true;
        resetDeckBtn.style.display = 'block';
    }
}

// Evento para sacar carta
drawCardBtn.addEventListener('click', drawRandomCard);

// Evento para pasar al siguiente turno
resetDeckBtn.addEventListener('click', () => {
    cardsDrawnThisTurn = 0;
    cardDisplay.innerHTML = '';
    drawCardBtn.disabled = false;
    resetDeckBtn.style.display = 'none';
    turnCounter++;
    if (turnCounter > MAX_TURNS) {
        logEvent("¡Game Over! Has alcanzado el máximo de turnos.");
        mostrarPantallaGameOver();
        return;
    }
    updateMessage(`Turno ${turnCounter}: Saca una carta.`);
});

// Evento para reiniciar el juego
restartGameBtn.addEventListener('click', () => {
    location.reload();
});

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
        messageDisplay.classList.remove('warning', 'final');
        if (turnCounter === MAX_TURNS - 2) {
            messageDisplay.classList.add('warning');
        } else if (turnCounter === MAX_TURNS - 1) {
            messageDisplay.classList.add('final');
        }
    }
}

// Función para registrar eventos
function logEvent(message) {
    const eventList = document.getElementById('eventList');
    const eventItem = document.createElement('li');
    eventItem.textContent = message;
    eventList.appendChild(eventItem);
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initializeDeck();
    updatePlayerStats();
});