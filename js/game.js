// Atributos del personaje
const player = {
    name: "Héroe",
    health: 100,
    mana: 50,
    gold: 0,
    level: 1,
    inventory: [],
    companion: null // o false, según tu estructura
};

// Opciones de la tienda con iconos (puedes usar emojis o rutas a imágenes)
const tiendaOpciones = [
    { nombre: "Poción de curación", precio: 200, descripcion: "Recupera 30 de salud.", icono: "🧉" },
    { nombre: "Anillo mágico", precio: 500, descripcion: "Aumenta tu maná máximo.", icono: "💍" },
    { nombre: "Espada Larga", precio: 800, descripcion: "Una espada larga de acero afilado.", icono: "🗡️", carta: "Espada Larga" }
];

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



// ...resto de tu código...

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
        case "La Ruina":
            player.gold = 0;
            logEvent("¡Has perdido todo tu oro!");
            break;
        case "La Tienda":
            // Mostrar opciones de la tienda
            logEvent("Te encuentras en un mercado .");
            break;
        case "El Vacío":
            if (player.level > 6) {
                player.level -= 1;
                logEvent("¡Has perdido 1 nivel!");
            }
            else {
                logEvent("¡Consigues escapar del vacío!");
            }
            break;
           
            break;
        case "El Sabio":
            player.level += 1;
            logEvent("¡Has subido 1 nivel!");
            break;
        case "El Cráneo":
            iniciarCombate("Esqueleto Guerrero", 40, 15);
            resolverCombate({ nombre: "Esqueleto", fuerza: 20 });
            return;
        case "El Troll":
            // Solo aparece si el jugador es nivel 3 o superior
            if (player.level >= 3) {
                iniciarCombate("Troll Gigante", 60, 25);
                 resolverCombate({ nombre: "Troll", fuerza: 30 });
            } else {
                logEvent("¡El Troll se oculta en las sombras! Necesitas ser nivel 3 para enfrentarlo.");
            }
            return;
        case "La Dama Oscura":
            // Solo aparece si el jugador es nivel 5 o superior
            if (player.level >= 4) {
                iniciarCombate("Dama Oscura", 80, 30);
                resolverCombate({ nombre: "Dama Oscura", fuerza: 40 });
            } else {
                logEvent("¡La Dama Oscura se retira! Necesitas ser nivel 4 para enfrentarte a ella.");
            }
            return;
        case "La Taberna":
            // El jugador pierde salud al emborracharse
            const danioEmborracharse = Math.floor(Math.random() * 20) + 1; // Daño aleatorio entre 1 y 20
            player.health -= danioEmborracharse;
            logEvent(`¡Te emborrachas en la taberna y pierdes ${danioEmborracharse} de salud!`);
            if (player.health <= 0) {
                player.health = 0;  
                logEvent("¡Game Over! Tu salud ha llegado a 0.");
                mostrarPantallaGameOver();
                return;
            }
            break;
        case "La Vampira":
             //Una vampira muerde al jugador y le quita salud
            // Daño aleatorio entre 10 y 30
            const danioVampira = Math.floor(Math.random() * 21) + 10;
            player.health = Math.max(0, player.health - danioVampira);
            logEvent(`¡La Vampira te ataca y te causa ${danioVampira} puntos de daño!`);
            updatePlayerStats();
            break;                  
                case "El Banquete":
            if( player.health < 100) {
                 // El jugador recupera salud al disfrutar del banquete
            const saludRecuperada = Math.floor(Math.random() * 20) + 1; // Recupera entre 1 y 20 de salud
            player.health = Math.min(100, player.health + saludRecuperada);
                logEvent("¡Disfrutas de un banquete y recuperas salud!");
            } 
           
            logEvent(`¡Has comido mucho y te sienta mal la comida! Por tus malos modales la dama se marcha`);
            break;
        case "El Caballero":
            player.companion = "caballero";
            logEvent("¡El Caballero te acompaña y luchará a tu lado!");
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
            <img src="img/cartas/victoria.jpeg" alt="${cartaVictoria.name}" class="card-image">
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
    const inv = document.getElementById('playerInventory');
    inv.innerHTML = '';
    player.inventory.forEach((item, idx) => {
        const li = document.createElement('li');
        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.nombre;
            img.style.width = "28px";
            img.style.verticalAlign = "middle";
            img.style.marginRight = "6px";
            li.appendChild(img);
        }
        li.appendChild(document.createTextNode(item.nombre));
        // Si el objeto es usable, muestra botón
        if (item.usable) {
            const btn = document.createElement('button');
            btn.textContent = "Usar";
            btn.className = "fantasy-btn";
            btn.style.marginLeft = "8px";
            btn.onclick = () => usarObjetoInventario(idx);
            li.appendChild(btn);
        }
        inv.appendChild(li);
    });
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
    const box = document.getElementById('companionBox');
    if (player.companion === "caballero") {
        box.innerHTML = `
            <div class="companion-card">
                <span class="companion-icon">🛡️</span>
                <span class="companion-text">El Caballero te acompaña</span>
            </div>
        `;
    } else {
        box.innerHTML = '';
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

function drawCard() {
    const MIN_GOLD_FOR_RUINA = 1000; // Oro mínimo para que salga "La Ruina"
    let cardIndex = -1;
    let intentos = 0;
    let cartaValida = false;

    while (!cartaValida && intentos < playableDeck.length) {
        cardIndex = 0; // Siempre miramos la primera carta del mazo
        const card = playableDeck[cardIndex];

        // Control para "La Ruina"
        if (card.name === "La Ruina" && player.gold < MIN_GOLD_FOR_RUINA) {
            playableDeck.push(playableDeck.shift()); // Mueve la carta al final
        }
        // Control para "La Tienda"
        else if (card.name === "La Tienda" && player.gold <= 0) {
            playableDeck.push(playableDeck.shift()); // Mueve la carta al final
        }
        // Si la carta es válida
        else {
            cartaValida = true;
        }
        intentos++;
    }

    // Si después de recorrer el mazo no hay carta válida, saca la primera (para evitar bucles infinitos)
    const card = playableDeck.shift();
    displayCard(card);
    handleCardEffect(card);
    cardsDrawnThisTurn++;
    updateTurnInfo(turnCounter, MAX_TURNS, cardsDrawnThisTurn, MAX_CARDS_PER_TURN);
    if (cardsDrawnThisTurn >= MAX_CARDS_PER_TURN) {
        document.getElementById('drawCardBtn').disabled = true;
        document.getElementById('resetDeckBtn').style.display = 'block';
    }
}



// Mostrar modal de tienda mejorado
function mostrarModalTienda() {
    let html = `<h2>Tienda de Objetos</h2><ul style="list-style:none;padding:0;">`;
    tiendaOpciones.forEach((obj, idx) => {
        html += `
            <li>
                <span class="tienda-icono">${obj.icono}</span>
                <div class="tienda-info">
                    <div class="tienda-nombre">${obj.nombre}</div>
                    <div class="tienda-descripcion">${obj.descripcion}</div>
                    <div class="tienda-precio"><b>${obj.precio}</b> <span style="color:#bfa76a;">🪙 oro</span></div>
                    <button class="fantasy-btn" onclick="comprarObjetoTienda(${idx})" ${player.gold < obj.precio ? 'disabled' : ''}>
                        Comprar
                    </button>
                </div>
            </li>
        `;
    });
    html += `</ul>
        <button class="fantasy-btn" onclick="cerrarModalTienda()">Cerrar</button>
    `;
    document.getElementById('modal-tienda-content').innerHTML = html;
    document.getElementById('modal-tienda').style.display = 'flex';
}

function cerrarModalTienda() {
    document.getElementById('modal-tienda').style.display = 'none';
}

function comprarObjetoTienda(idx) {
    const obj = tiendaOpciones[idx];
    if (player.gold >= obj.precio) {
        player.gold -= obj.precio;
        // Si es un arma, añade la carta de arma al inventario
        if (obj.carta) {
            const cartaArma = armasTienda.find(a => a.name === obj.carta);
            if (cartaArma) {
                player.inventory.push({ 
                    nombre: cartaArma.name, 
                    image: cartaArma.image, 
                    tipo: "arma", 
                    usable: true 
                });
            } else {
                player.inventory.push({ nombre: obj.nombre, tipo: "objeto", usable: true });
            }
        } else {
            // Si es poción o anillo, marca como usable
            player.inventory.push({ nombre: obj.nombre, tipo: "objeto", usable: true });
        }
        logEvent(`Has comprado ${obj.nombre} por ${obj.precio} oro.`);
        updatePlayerStats();
        updatePlayerInventory();
        mostrarModalTienda();
    } else {
        logEvent("No tienes suficiente oro para comprar este objeto.");
        mostrarModalTienda();
    }
}

// Función para usar un objeto del inventario
function usarObjetoInventario(idx) {
    const item = player.inventory[idx];
    if (!item.usable) {
        logEvent("Este objeto no se puede usar.");
        return;
    }
    switch (item.nombre) {
        case "Poción de curación":
            player.health = Math.min(100, player.health + 30);
            logEvent("Usaste una Poción de curación y recuperaste 30 de salud.");
            player.inventory.splice(idx, 1); // Elimina la poción usada
            break;
        case "Anillo mágico":
            player.mana = Math.min(100, player.mana + 20);
            logEvent("Usaste el Anillo mágico y recuperaste 20 de maná.");
            player.inventory.splice(idx, 1); // Elimina el anillo usado
            break;
        case "Espada Larga":
            logEvent("Equipaste la Espada Larga. ¡Tu daño aumenta!");
            item.usable = false; // Solo se puede equipar una vez
            break;
        // Puedes añadir más casos para otros objetos
        default:
            logEvent("Este objeto no tiene un uso especial.");
    }
    updatePlayerStats();
    updatePlayerInventory();
}

// Función para resolver un combate contra un enemigo
function resolverCombate(enemigo) {
    let ayudaCaballero = 0;
    if (player.companion === "caballero") {
        ayudaCaballero = 15;
        logEvent("El Caballero interviene en la batalla y te protege (+15 defensa).");
        const battleEvents = document.getElementById('battle-event-list');
        if (battleEvents) {
            const eventItem = document.createElement('li');
            eventItem.textContent = "El Caballero interviene en la batalla y te protege (+15 defensa).";
            battleEvents.appendChild(eventItem);
            battleEvents.scrollTop = battleEvents.scrollHeight;
        }
    }
    const danioRecibido = Math.max(0, enemigo.fuerza - ayudaCaballero);

    // Si el jugador gana (por ejemplo, si danioRecibido es 0)
    if (danioRecibido === 0) {
        logEvent(`¡Has vencido a ${enemigo.nombre}!`);
        // Busca la carta de victoria en tu mazo
        const cartaVictoria = deckOfManyThings.find(c => c.name === "Victoria");
        if (cartaVictoria) {
            displayCard(cartaVictoria);
        } else {
            // Si no tienes una carta de victoria, muestra un mensaje
            updateMessage("¡Victoria! Has ganado el combate.");
        }
        return;
    }

    player.health = Math.max(0, player.health - danioRecibido);
    logEvent(`Has recibido ${danioRecibido} puntos de daño en el combate contra ${enemigo.nombre}.`);
    updatePlayerStats();
}