// js/script.js

// Referencias a elementos del DOM
const deckSelector = document.getElementById('deckSelector');
const startGameBtn = document.getElementById('startGameBtn');
const drawCardBtn = document.getElementById('drawCardBtn');
const resetDeckBtn = document.getElementById('resetDeckBtn');
const cardDisplay = document.getElementById('cardDisplay');
const messageDisplay = document.getElementById('messageDisplay');
const restartGameBtn = document.getElementById('restartGameBtn');
const turnInfo = document.getElementById('turnInfo');

// Variables globales para los mazos y armas
let deckOfManyThings = [];
let armasTienda = [];
let opcionesPortal = [];
let majorArcanaTarot = []; // Si quieres cargar el tarot por JSON, hazlo igual

let playableDeck = [];
let drawnCards = [];
let cardsDrawnThisTurn = 0;
const MAX_CARDS_PER_TURN = 2;
const MAX_TURNS = 15;
let turnCounter = 1;
let cardUsageCount = {};
let lastSwordTurn = -10;
let eventosTurnoActual = [];

// --- Cargar los JSON al iniciar ---
async function cargarDatosJuego() {
    // Carga todos los archivos JSON necesarios
    const [mazo, armas, portal] = await Promise.all([
        fetch('data/deck_of_many_things.json').then(r => r.json()),
        fetch('data/armas_tienda.json').then(r => r.json()),
        fetch('data/opciones_portal.json').then(r => r.json())
    ]);
    deckOfManyThings = mazo;
    armasTienda = armas;
    opcionesPortal = portal;
    // Si quieres cargar el tarot por JSON, hazlo aquí también
    // majorArcanaTarot = await fetch('data/tarot.json').then(r => r.json());
    initializeDeck();
}

// --- Inicializa el mazo y los atributos del jugador ---
function initializeDeck() {
    const selectedDeckType = deckSelector.value;

    if (selectedDeckType === 'tarot') {
        playableDeck = [...majorArcanaTarot];
    } else if (selectedDeckType === 'manyThings') {
        playableDeck = [...deckOfManyThings];
    } else {
        playableDeck = [...deckOfManyThings];
        console.warn("Tipo de mazo no reconocido, usando Deck of Many Things por defecto.");
    }

    shuffleDeck(playableDeck);

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
    updateTurnInfo(turnCounter, MAX_TURNS, cardsDrawnThisTurn, MAX_CARDS_PER_TURN);
}

// --- Barajar el mazo ---
function shuffleDeck(deckArray) {
    for (let i = deckArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckArray[i], deckArray[j]] = [deckArray[j], deckArray[i]];
    }
}

// --- Eventos de botones ---
startGameBtn.addEventListener('click', () => {
    startGameBtn.style.display = 'none';
    drawCardBtn.style.display = 'inline-block';
    updateMessage("¡Juego iniciado! Saca tu primera carta.");
    updateTurnInfo(turnCounter, MAX_TURNS, cardsDrawnThisTurn, MAX_CARDS_PER_TURN);
});

deckSelector.addEventListener('change', initializeDeck);

// --- Función para sacar una carta ---
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

    // --- Reinicia y baraja el mazo automáticamente si está vacío ---
    if (playableDeck.length === 0) {
        const selectedDeckType = deckSelector.value;
        if (selectedDeckType === 'tarot') {
            playableDeck = [...majorArcanaTarot];
        } else if (selectedDeckType === 'manyThings') {
            playableDeck = [...deckOfManyThings];
        } else {
            playableDeck = [...deckOfManyThings];
        }
        shuffleDeck(playableDeck);
        logEvent("El mazo se ha reiniciado y barajado automáticamente.");
    }

    if (playableDeck.length === 0) {
        updateMessage("¡No quedan más cartas en el mazo!");
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

        // Ejemplo de restricción: "La espada" solo cada 10 turnos
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

        // Ejemplo de restricción: máximo 2 veces por carta
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
    updateTurnInfo(turnCounter, MAX_TURNS, cardsDrawnThisTurn, MAX_CARDS_PER_TURN);
}

// --- Evento para sacar carta ---
drawCardBtn.addEventListener('click', drawRandomCard);

// --- Evento para pasar al siguiente turno ---
resetDeckBtn.addEventListener('click', siguienteTurno);

// --- Función para pasar al siguiente turno ---
function siguienteTurno() {
    cardsDrawnThisTurn = 0;
    cardDisplay.innerHTML = '';
    drawCardBtn.disabled = false;
    resetDeckBtn.style.display = 'none';
    turnCounter++;

    shuffleDeck(playableDeck);

    eventosTurnoActual = [];
    refrescarEventosTurno();

    if (turnCounter > MAX_TURNS) {
        logEvent("¡Game Over! Has alcanzado el máximo de turnos.");
        mostrarPantallaGameOver();
        drawCardBtn.disabled = true;
        resetDeckBtn.disabled = true;
        return;
    }
    updateMessage(`Turno ${turnCounter}: Saca una carta.`);
    animateTurnInfo();
    mostrarSituacionAleatoria();
    updateTurnInfo(turnCounter, MAX_TURNS, cardsDrawnThisTurn, MAX_CARDS_PER_TURN);
}

// --- Evento para reiniciar el juego ---
restartGameBtn.addEventListener('click', () => {
    location.reload();
});

// --- Función para mostrar una carta ---
function displayCard(card) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.innerHTML = `
        <img src="${card.image}" alt="${card.name}" class="card-image">
        <h3>${card.name}</h3>
    `;
    cardDisplay.appendChild(cardElement);

    // Si es la carta de la tienda, añade evento de click
    if (card.name === "La Tienda") {
        cardElement.style.cursor = "pointer";
        cardElement.title = "Haz clic para abrir la tienda";
        cardElement.addEventListener('click', mostrarModalTienda);
    }

    // Efecto terrorífico para "La Vampira"
    if (card.name === "La Vampira") {
        cardElement.classList.add('vampira-efecto');
        const efecto = document.createElement('div');
        efecto.className = 'vampira-glow';
        cardElement.appendChild(efecto);
        setTimeout(() => {
            if (efecto.parentNode) efecto.parentNode.removeChild(efecto);
            cardElement.classList.remove('vampira-efecto');
        }, 1200);
    }

     // Efecto visual para la carta Victoria
    if (card.name === "Victoria") {
    cardElement.classList.add('victoria-efecto');
    // Efecto de resplandor
    const glow = document.createElement('div');
    glow.className = 'victoria-glow';
    cardElement.appendChild(glow);

    // Laurel animado
    const laurel = document.createElement('div');
    laurel.className = 'victoria-laurel';
    laurel.innerHTML = `
        <svg viewBox="0 0 70 70" width="70" height="70">
            <path d="M35 60 Q15 45 20 25" stroke="#ffe066" stroke-width="6" fill="none"/>
            <path d="M35 60 Q55 45 50 25" stroke="#ffe066" stroke-width="6" fill="none"/>
            <ellipse cx="35" cy="25" rx="15" ry="8" fill="#fffbe6" fill-opacity="0.7"/>
            <ellipse cx="35" cy="25" rx="10" ry="5" fill="#ffe066" fill-opacity="0.7"/>
        </svg>
    `;
    cardElement.appendChild(laurel);

    setTimeout(() => {
        if (glow.parentNode) glow.parentNode.removeChild(glow);
        if (laurel.parentNode) laurel.parentNode.removeChild(laurel);
        cardElement.classList.remove('victoria-efecto');
    }, 1200);
}

    // Efecto para enemigos
    if (["El Cráneo", "El Troll", "La Dama Oscura"].includes(card.name)) {
        setTimeout(() => {
            cardElement.classList.add('card-hit');
            setTimeout(() => cardElement.classList.remove('card-hit'), 600);
        }, 100);
    }

    // Efecto visual para "La Taberna"
    if (card.name === "La Taberna") {
        cardElement.classList.add('taberna-efecto');
        // SVG de jarra de cerveza estilo fantasía
        const jarra = document.createElement('div');
        jarra.className = 'taberna-jarra';
        jarra.innerHTML = `
            <svg viewBox="0 0 64 64" width="64" height="64">
                <ellipse cx="32" cy="18" rx="18" ry="8" fill="#ffe9b3" stroke="#bfa76a" stroke-width="2"/>
                <rect x="14" y="18" width="36" height="28" rx="10" fill="#e2c48d" stroke="#bfa76a" stroke-width="2"/>
                <ellipse cx="32" cy="46" rx="18" ry="8" fill="#ffe9b3" stroke="#bfa76a" stroke-width="2"/>
                <rect x="46" y="24" width="10" height="16" rx="5" fill="#fffbe6" stroke="#bfa76a" stroke-width="2"/>
                <ellipse cx="51" cy="32" rx="5" ry="7" fill="none" stroke="#bfa76a" stroke-width="2"/>
                <ellipse cx="32" cy="18" rx="18" ry="8" fill="#fffbe6" fill-opacity="0.7"/>
                <ellipse cx="32" cy="46" rx="18" ry="8" fill="#fffbe6" fill-opacity="0.3"/>
            </svg>
        `;
        cardElement.appendChild(jarra);
        setTimeout(() => {
            if (jarra.parentNode) jarra.parentNode.removeChild(jarra);
            cardElement.classList.remove('taberna-efecto');
        }, 1100);
    }

    // Efecto visual para "La Tienda": bolsa de monedas animada
    if (card.name === "La Tienda") {
        cardElement.classList.add('tienda-efecto');
        const bolsa = document.createElement('div');
        bolsa.className = 'tienda-bolsa';
        bolsa.innerHTML = `
            <svg viewBox="0 0 64 64" width="60" height="60">
                <!-- Bolsa -->
                <ellipse cx="32" cy="44" rx="18" ry="14" fill="#bfa76a" stroke="#7c4a02" stroke-width="2"/>
                <ellipse cx="32" cy="38" rx="14" ry="10" fill="#e2c48d" stroke="#bfa76a" stroke-width="2"/>
                <ellipse cx="32" cy="32" rx="10" ry="7" fill="#ffe9b3" stroke="#bfa76a" stroke-width="2"/>
                <!-- Cierre de la bolsa -->
                <rect x="26" y="22" width="12" height="10" rx="4" fill="#7c4a02" stroke="#bfa76a" stroke-width="2"/>
                <!-- Cordón -->
                <ellipse cx="32" cy="32" rx="11" ry="2" fill="#a86d1a"/>
                <!-- Monedas -->
                <circle cx="38" cy="50" r="3" fill="#ffe066" stroke="#bfa76a" stroke-width="1"/>
                <circle cx="28" cy="52" r="2.5" fill="#ffe066" stroke="#bfa76a" stroke-width="1"/>
                <circle cx="34" cy="54" r="2" fill="#ffe066" stroke="#bfa76a" stroke-width="1"/>
            </svg>
        `;
        cardElement.appendChild(bolsa);
        setTimeout(() => {
            if (bolsa.parentNode) bolsa.parentNode.removeChild(bolsa);
            cardElement.classList.remove('tienda-efecto');
        }, 900);
    }

    // Efecto visual para "La Loca"
    if (card.name === "La Loca") {
        cardElement.classList.add('loca-efecto');
        // SVG de espiral psicodélica
        const espiral = document.createElement('div');
        espiral.className = 'loca-espiral';
        espiral.innerHTML = `
            <svg viewBox="0 0 54 54" width="54" height="54">
                <path d="M27,27 m-20,0 a20,20 0 1,1 40,0 a20,20 0 1,1 -40,0
                         M27,27 m-14,0 a14,14 0 1,1 28,0 a14,14 0 1,1 -28,0
                         M27,27 m-8,0 a8,8 0 1,1 16,0 a8,8 0 1,1 -16,0"
                      fill="none" stroke="#a86d1a" stroke-width="2.5"/>
            </svg>
        `;
        cardElement.appendChild(espiral);
        setTimeout(() => {
            if (espiral.parentNode) espiral.parentNode.removeChild(espiral);
            cardElement.classList.remove('loca-efecto');
        }, 1100);
    }

    // Efecto visual para "El Caballero"
    if (card.name === "El Caballero") {
        cardElement.classList.add('caballero-efecto');
        // SVG de escudo y espada brillante
        const escudo = document.createElement('div');
        escudo.className = 'caballero-escudo';
        escudo.innerHTML = `
            <svg viewBox="0 0 60 60" width="60" height="60">
                <!-- Escudo -->
                <path d="M30 8 Q50 14 46 38 Q30 54 14 38 Q10 14 30 8 Z"
                      fill="#ffe9b3" stroke="#bfa76a" stroke-width="2"/>
                <!-- Cruz de honor -->
                <rect x="27" y="18" width="6" height="24" rx="2" fill="#a86d1a"/>
                <rect x="18" y="27" width="24" height="6" rx="2" fill="#a86d1a"/>
                <!-- Espada -->
                <rect x="28" y="4" width="4" height="18" rx="1.5" fill="#bfa76a" stroke="#7c4a02" stroke-width="1"/>
                <polygon points="30,2 34,8 26,8" fill="#fffbe6" stroke="#bfa76a" stroke-width="1"/>
            </svg>
        `;
        cardElement.appendChild(escudo);
        setTimeout(() => {
            if (escudo.parentNode) escudo.parentNode.removeChild(escudo);
            cardElement.classList.remove('caballero-efecto');
        }, 1100);
    }
}

// --- Función para actualizar el mensaje ---
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

// --- Función para registrar eventos ---
function logEvent(message) {
    eventosTurnoActual.push(message);
    refrescarEventosTurno();
}

// --- Función para limpiar eventos ---
function limpiarEventos() {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';
}

// --- Función para refrescar eventos del turno ---
function refrescarEventosTurno() {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';
    eventosTurnoActual.forEach(msg => {
        const eventItem = document.createElement('li');
        eventItem.textContent = msg;
        eventList.appendChild(eventItem);
    });
    // Resalta el último evento
    const items = eventList.querySelectorAll('li');
    if (items.length) items[items.length - 1].classList.add('last-event');
}

// --- Función para actualizar la información del turno ---
function updateTurnInfo(turnCounter, maxTurns, cardsDrawnThisTurn, maxCardsPerTurn) {
    if (!turnInfo) return;
    turnInfo.innerHTML = `
        <span>Turno <b>${turnCounter}</b> de <b>${maxTurns}</b></span>
        &nbsp;|&nbsp;
        <span>Cartas este turno: <b>${cardsDrawnThisTurn}</b> / ${maxCardsPerTurn}</span>
    `;
}

// --- Función para animar la información del turno ---
function animateTurnInfo() {
    if (!turnInfo) return;
    turnInfo.classList.remove('turn-animate');
    void turnInfo.offsetWidth; // Forzar reflow
    turnInfo.classList.add('turn-animate');
}

// --- Inicializar al cargar la página ---
window.addEventListener('DOMContentLoaded', cargarDatosJuego);