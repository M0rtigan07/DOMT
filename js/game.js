// Atributos del personaje
const player = {
    name: "Héroe",
    health: 100,
    mana: 50,
    gold: 0,
    level: 1,
    inventory: []
};

// Atributos del enemigo (se asignan al iniciar cada combate)
let enemy = {
    name: "",
    health: 0,
    attack: 0
};

// Atributos del caballero acompañante
let companion = {
    active: false,
    name: "Caballero",
    bonus: 10 // Daño extra que aporta en combate
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
            player.level = Math.max(1, player.level - 1);
            logEvent("¡Has perdido 1 nivel!");
            break;
        case "El Sabio":
            player.level += 1;
            logEvent("¡Has subido 1 nivel!");
            break;
        case "La Estrella":
            player.health = Math.min(100, player.health + 20);
            logEvent("¡Tu salud ha aumentado en 20 puntos!");
            break;
        case "El Cráneo":
            iniciarCombate("Esqueleto Guerrero", 40, 15);
            return;
        case "El Troll":
            // Solo aparece si el jugador es nivel 3 o superior
            if (player.level >= 3) {
                iniciarCombate("Troll Gigante", 60, 25);
            } else {
                logEvent("¡El Troll se oculta en las sombras! Necesitas ser nivel 3 para enfrentarlo.");
            }
            return;
        case "El Caballero":
            companion.active = true;
            logEvent("¡Un Caballero se une a tu aventura! Te ayudará en los combates.");
            updateCompanionBox();
            break;
        case "La espada":
            if (!player.inventory.some(item => item.nombre === "Espada")) {
                player.inventory.push({
                    nombre: "Espada",
                    img: "img/cartas/espada.png"
                });
                logEvent("¡Has obtenido una espada! Se ha añadido a tu inventario.");
            }
            break;
        default:
            logEvent(`La carta "${card.name}" no tiene un efecto directo.`);
            break;
    }

    updatePlayerStats();
    updatePlayerInventory();
    checkGameOver();
}

// Iniciar combate contra un enemigo
function iniciarCombate(nombre, salud, ataque) {
    enemy.name = nombre;
    enemy.health = salud;
    enemy.attack = ataque;

    const battleModal = document.getElementById('battle-modal');
    const battleDescription = document.getElementById('battle-description');
    const battleEvents = document.getElementById('battle-events');
    const battleEndBtn = document.getElementById('battle-end-btn');

    battleDescription.textContent = `¡${enemy.name} aparece! Salud: ${enemy.health}`;
    battleEvents.innerHTML = `
        <button class="fantasy-btn" onclick="batallaAtacar()">Atacar</button>
        <button class="fantasy-btn" onclick="batallaDefender()">Defender</button>
    `;
    battleEndBtn.style.display = 'none';

    eventosBatalla = [];
    refrescarEventosBatalla();
    battleModal.style.display = 'flex';
}

// Eventos de batalla
let eventosBatalla = [];

function logBattleEvent(message) {
    eventosBatalla.push(message);
    refrescarEventosBatalla();
}

function refrescarEventosBatalla() {
    const battleEventList = document.getElementById('battle-event-list');
    if (!battleEventList) return;
    battleEventList.innerHTML = '';
    eventosBatalla.forEach(msg => {
        const li = document.createElement('li');
        li.textContent = msg;
        battleEventList.appendChild(li);
    });
    const items = battleEventList.querySelectorAll('li');
    if (items.length) items[items.length - 1].classList.add('last-event');
    battleEventList.scrollTop = battleEventList.scrollHeight;
}

// Acción: Atacar
function batallaAtacar() {
    let danioJugador = 15;
    if (player.inventory.some(item => item.nombre === "Espada")) {
        danioJugador += 10;
        logBattleEvent("¡Usas tu espada para atacar con más fuerza!");
    }
    if (companion.active) {
        danioJugador += companion.bonus;
        logBattleEvent("¡El Caballero ataca junto a ti y suma +" + companion.bonus + " de daño!");
    }
    enemy.health -= danioJugador;
    logBattleEvent(`¡Atacas a ${enemy.name} e infliges ${danioJugador} de daño!`);

    if (enemy.health <= 0) {
        enemy.health = 0;
        logBattleEvent(`¡Has vencido a ${enemy.name}!`);
        finalizarCombate(true);
        return;
    }

    // El enemigo ataca si sigue vivo
    player.health -= enemy.attack;
    logBattleEvent(`${enemy.name} te ataca y te inflige ${enemy.attack} de daño.`);

    updatePlayerStats();
    refrescarEventosTurno && refrescarEventosTurno();

    if (player.health <= 0) {
        player.health = 0;
        logBattleEvent("¡Game Over! Tu salud ha llegado a 0.");
        finalizarCombate(false);
    } else {
        actualizarDescripcionCombate();
    }
}

// Acción: Defender
function batallaDefender() {
    // El jugador se defiende, reduce el daño recibido
    let danioReducido = Math.floor(enemy.attack / 2);
    player.health -= danioReducido;
    logBattleEvent(`¡Te defiendes! Solo recibes ${danioReducido} de daño de ${enemy.name}.`);

    updatePlayerStats();
    refrescarEventosTurno && refrescarEventosTurno();

    if (player.health <= 0) {
        player.health = 0;
        logBattleEvent("¡Game Over! Tu salud ha llegado a 0.");
        finalizarCombate(false);
    } else {
        actualizarDescripcionCombate();
    }
}

// Actualiza la descripción del combate en el modal
function actualizarDescripcionCombate() {
    const battleDescription = document.getElementById('battle-description');
    battleDescription.textContent = `¡${enemy.name} aparece! Salud: ${enemy.health}`;
}

// Añade la carta de victoria (puedes personalizarla)
const cartaVictoria = {
    name: "Victoria",
    image: "img/victoria.jpg",
    description: "¡Has vencido en el combate! Recibes tu recompensa."
};

// Añade la carta de derrota
const cartaDerrota = {
    name: "Derrota",
    image: "img/cartas/derrota.jpg",
    description: "¡Has sido derrotado en el combate! Intenta recuperarte y sigue adelante."
};

// Finaliza el combate: victoria o derrota
function finalizarCombate(victoria) {
    const battleModal = document.getElementById('battle-modal');
    const battleEndBtn = document.getElementById('battle-end-btn');
    const battleEvents = document.getElementById('battle-events');

    if (victoria) {
        // Subida de nivel y recompensa (como antes)
        player.level += 1;
        logBattleEvent("¡Subes de nivel! Ahora eres nivel " + player.level);

        const recompensasBatalla = [
            { tipo: "oro", cantidad: 1000, mensaje: "¡Has encontrado 1000 piezas de oro!" },
            { tipo: "mana", cantidad: 20, mensaje: "¡Recuperas 20 puntos de maná!" },
            { tipo: "objeto", objeto: { nombre: "Poción de curación", img: "img/cartas/pocion.png" }, mensaje: "¡Obtienes una Poción de curación!" },
            { tipo: "objeto", objeto: { nombre: "Anillo mágico", img: "img/cartas/anillo.png" }, mensaje: "¡Encuentras un Anillo mágico!" }
        ];
        const recompensa = recompensasBatalla[Math.floor(Math.random() * recompensasBatalla.length)];
        switch (recompensa.tipo) {
            case "oro":
                player.gold += recompensa.cantidad;
                logBattleEvent(recompensa.mensaje);
                break;
            case "mana":
                player.mana = Math.min(100, player.mana + recompensa.cantidad);
                logBattleEvent(recompensa.mensaje);
                break;
            case "objeto":
                player.inventory.push(recompensa.objeto);
                logBattleEvent(recompensa.mensaje);
                break;
        }

        // Mostrar carta de victoria en el área de cartas
        mostrarCartaVictoria();

        battleEvents.innerHTML = `<span style="color:#7c4a02;font-weight:bold;">¡Has vencido al enemigo!</span>`;
    } else {
        mostrarCartaDerrota();
        battleEvents.innerHTML = `<span style="color:#b22222;font-weight:bold;">¡Has sido derrotado!</span>`;
    }
    battleEndBtn.style.display = 'inline-block';

    battleEndBtn.onclick = () => {
        battleModal.style.display = 'none';
        updatePlayerStats();
        updatePlayerInventory();
        checkGameOver();
    };
}

// Función para mostrar la carta de victoria en el área de cartas
function mostrarCartaVictoria() {
    const cardDisplay = document.getElementById('cardDisplay');
    cardDisplay.innerHTML = `
        <div class="card victoria-efecto">
            <img src="img/victoria.jpeg" alt="${cartaVictoria.name}" class="card-image">
            <h3>${cartaVictoria.name}</h3>
            <p>${cartaVictoria.description}</p>
        </div>
    `;

    // Efecto visual: destello dorado animado
    const efecto = document.createElement('div');
    efecto.className = 'victoria-glow';
    cardDisplay.appendChild(efecto);

    // Elimina el efecto tras 1.5s
    setTimeout(() => {
        if (efecto.parentNode) efecto.parentNode.removeChild(efecto);
    }, 1500);
}

// Función para mostrar la carta de derrota en el área de cartas
function mostrarCartaDerrota() {
    const cardDisplay = document.getElementById('cardDisplay');
    cardDisplay.innerHTML = `
        <div class="card derrota-efecto">
            <img src="${cartaDerrota.image}" alt="${cartaDerrota.name}" class="card-image">
            <h3>${cartaDerrota.name}</h3>
            <p>${cartaDerrota.description}</p>
        </div>
    `;

    // Efecto visual: destello rojo animado
    const efecto = document.createElement('div');
    efecto.className = 'derrota-glow';
    cardDisplay.appendChild(efecto);

    setTimeout(() => {
        if (efecto.parentNode) efecto.parentNode.removeChild(efecto);
    }, 1500);
}

// Función para actualizar el inventario y mostrar el caballero si acompaña
function updatePlayerInventory() {
    const inventoryList = document.getElementById('playerInventory');
    inventoryList.innerHTML = '';

    // Mapeo de iconos por nombre de objeto
    const iconos = {
        "Espada": "🗡️",
        "Poción de curación": "🧪",
        "Anillo mágico": "💍",
        "Escudo": "🛡️",
        "Llave": "🗝️",
        "Pergamino": "📜"
    };

    // Mostrar el caballero antes del inventario si acompaña
    if (companion.active) {
        const companionItem = document.createElement('li');
        companionItem.innerHTML = `<span style="font-size:1.5em; margin-right:8px;">⚔️🛡️</span><span>${companion.name} (te acompaña)</span>`;
        companionItem.style.color = "#1a4d1a";
        companionItem.style.fontWeight = "bold";
        inventoryList.appendChild(companionItem);
    }

    if (player.inventory.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = "El inventario está vacío.";
        emptyMessage.className = "empty-inventory";
        inventoryList.appendChild(emptyMessage);
    } else {
        player.inventory.forEach((item, idx) => {
            const inventoryItem = document.createElement('li');
            let nombre = typeof item === "string" ? item : item.nombre;
            let icono = iconos[nombre] || "🎲";

            // Si es poción de curación, añade botón para usarla
            if (nombre === "Poción de curación") {
                inventoryItem.innerHTML = `
                    <span style="font-size:1.5em; margin-right:8px;">${icono}</span>
                    <span>${nombre}</span>
                    <button class="usar-pocion-btn" style="margin-left:12px; font-size:0.95em; padding:2px 10px; border-radius:6px; border:1px solid #bfa76a; background:#ffe9b3; color:#7c4a02; cursor:pointer;">
                        Usar
                    </button>
                    <span class="item-type" style="margin-left:8px; color:#4d2e00; font-style:italic;">(usable)</span>
                `;
                // Añade el evento al botón
                setTimeout(() => {
                    const btn = inventoryItem.querySelector('.usar-pocion-btn');
                    if (btn) {
                        btn.onclick = () => usarPocion(idx);
                    }
                }, 0);
            } else {
                inventoryItem.innerHTML = `<span style="font-size:1.5em; margin-right:8px;">${icono}</span><span>${nombre}</span>`;
                if (typeof item === "object" && item.tipo) {
                    const typeSpan = document.createElement('span');
                    typeSpan.className = "item-type";
                    typeSpan.textContent = item.tipo;
                    inventoryItem.appendChild(typeSpan);
                }
            }

            inventoryList.appendChild(inventoryItem);
        });
    }
}

// Función para usar la poción curativa
function usarPocion(index) {
    // Elimina la poción del inventario
    player.inventory.splice(index, 1);
    // Cura al jugador (por ejemplo, 30 puntos, sin pasar de 100)
    const curacion = 30;
    player.health = Math.min(100, player.health + curacion);
    logEvent("¡Has usado una Poción de curación y recuperado " + curacion + " puntos de salud!");
    updatePlayerStats();
    updatePlayerInventory();
}

// Función para comprobar si el jugador ha perdido
function checkGameOver() {
    if (player.health <= 0) {
        player.health = 0;
        updatePlayerStats();
        logEvent("¡Game Over! Tu salud ha llegado a 0.");
        mostrarPantallaGameOver();
    }
}

// Función para mostrar la pantalla de fin de juego (modal)
function mostrarPantallaGameOver() {
    document.getElementById('drawCardBtn').disabled = true;
    document.getElementById('resetDeckBtn').disabled = true;
    document.getElementById('restartGameBtn').disabled = true;
    document.getElementById('gameover-modal').style.display = 'flex';
}

// Botón de reinicio en el modal de Game Over
document.getElementById('restartGameBtnModal').addEventListener('click', () => {
    location.reload();
});

function updateCompanionBox() {
    const companionBox = document.getElementById('companionBox');
    if (companion.active) {
        companionBox.innerHTML = `
            <span class="knight-icon">⚔️🛡️</span>
            <span>${companion.name} te acompaña (+${companion.bonus} daño en combate)</span>
        `;
        companionBox.style.display = 'flex';
    } else {
        companionBox.style.display = 'none';
    }
}

// Por ejemplo, en initializeDeck o función de reinicio:
companion.active = false;
updateCompanionBox();

function mostrarSituacion() {
    const situationModal = document.getElementById('situation-modal');
    const situationDescription = document.getElementById('situation-description');
    const situationOptions = document.getElementById('situation-options');

    // Ejemplo de situación y opciones
    situationDescription.textContent = "Te encuentras en una encrucijada. ¿Qué camino eliges?";
    situationOptions.innerHTML = `
        <button class="fantasy-btn" onclick="elegirOpcionSituacion('bosque')">Camino del bosque 🌲</button>
        <button class="fantasy-btn" onclick="elegirOpcionSituacion('pueblo')">Ir al pueblo 🏘️</button>
    `;

    situationModal.style.display = 'flex';
}

// Función para gestionar la elección del jugador
function elegirOpcionSituacion(opcion) {
    const situationModal = document.getElementById('situation-modal');
    situationModal.style.display = 'none';

    switch(opcion) {
        case 'bosque':
            logEvent("Has elegido adentrarte en el bosque. Puede que encuentres peligros... o tesoros.");
            player.health = Math.max(1, player.health - 10);
            player.gold += 500;
            logEvent("Pierdes 10 puntos de salud pero encuentras 500 piezas de oro entre los árboles.");
            break;
        case 'pueblo':
            logEvent("Decides ir al pueblo. Allí puedes descansar y reponer fuerzas.");
            player.health = Math.min(100, player.health + 20);
            logEvent("Recuperas 20 puntos de salud tras descansar en la posada.");
            break;
        case 'pocion':
            if (player.gold >= 200) {
                player.gold -= 200;
                player.inventory.push({ nombre: "Poción de curación" });
                logEvent("Compras una poción y la añades a tu inventario.");
            } else {
                logEvent("No tienes suficiente oro para comprar la poción.");
            }
            break;
        case 'rechazar':
            logEvent("Rechazas la oferta del mercader y sigues tu camino.");
            break;
        // ...más casos...
    }
    updatePlayerStats();
    updatePlayerInventory();
}

const situaciones = [
    {
        descripcion: "Te encuentras en una encrucijada. ¿Qué camino eliges?",
        opciones: [
            { texto: "Camino del bosque 🌲", id: "bosque" },
            { texto: "Ir al pueblo 🏘️", id: "pueblo" }
        ]
    },
    {
        descripcion: "Un mercader ambulante te ofrece un trato.",
        opciones: [
            { texto: "Comprar una poción (pierdes 200 oro, ganas una poción)", id: "pocion" },
            { texto: "Rechazar la oferta", id: "rechazar" }
        ]
    }
    // Puedes añadir más situaciones aquí
];

function mostrarSituacionAleatoria() {
    const situacion = situaciones[Math.floor(Math.random() * situaciones.length)];
    const situationModal = document.getElementById('situation-modal');
    const situationDescription = document.getElementById('situation-description');
    const situationOptions = document.getElementById('situation-options');

    situationDescription.textContent = situacion.descripcion;
    situationOptions.innerHTML = situacion.opciones.map(op =>
        `<button class="fantasy-btn" onclick="elegirOpcionSituacion('${op.id}')">${op.texto}</button>`
    ).join('');

    situationModal.style.display = 'flex';
}

resetDeckBtn.addEventListener('click', () => {
    // ...código de cambio de turno...
    mostrarSituacionAleatoria();
});