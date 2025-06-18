const API = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?type=normal%20monster';

const playerFieldDiv = document.getElementById("player-field");
const enemyFieldDiv = document.getElementById("enemy-field");
const logElem = document.getElementById("log");
const playerLPElem = document.getElementById("player-lp");
const playerBarElem = document.getElementById("player-bar");
const enemyLPElem = document.getElementById("enemy-lp");
const enemyBarElem = document.getElementById("enemy-bar");
const drawCardBtn = document.getElementById("draw-card");
const attackBtn = document.getElementById("attack");
const defenseBtn = document.getElementById("defense"); // botão Defend - adicionar no HTML
const discardCardBtn = document.getElementById("discard-card");

const MAX_HAND_SIZE = 5;
const MAX_FIELD_SIZE = 5;
const MAX_LP = 8000;
const cardBackImage = 'static/img/fundo-cartas.jpg';

let deck = [];
let playerDeck = [];
let enemyDeck = [];
let playerHand = [];
let enemyHand = [];
let playerField = [];
let enemyField = [];
let playerGraveyard = [];
let enemyGraveyard = [];
let playerLP = MAX_LP;
let enemyLP = MAX_LP;
let currentTurn = 'player';

let selectedPlayerCardIndex = null;
let selectedEnemyCardIndex = null;

let attackModeActive = false; // true quando clicou em atacar aguardando carta inimiga

function log(text) {
  logElem.textContent = text;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function playCard(hand, field, isPlayer = true) {
  if (hand.length === 0 || field.length >= MAX_FIELD_SIZE) return false;
  const card = hand.shift();
  if (isPlayer) {
    card.mode = "attack"; // padrão ao jogar a carta
  }
  field.push(card);
  return card;
}

function updateLP() {
  playerLPElem.textContent = playerLP;
  enemyLPElem.textContent = enemyLP;
  playerBarElem.style.width = `${(playerLP / MAX_LP) * 100}%`;
  enemyBarElem.style.width = `${(enemyLP / MAX_LP) * 100}%`;
}

function renderField(field, container, isEnemy = false) {
  container.innerHTML = "";
  field.forEach((card, index) => {
    const img = document.createElement("img");

    if (isEnemy) {
      // mostrar carta inimiga de acordo com situação:
      if (attackModeActive) {
        // revelar carta inimiga durante modo ataque para selecionar
        img.src = card.card_images[0].image_url;
        img.title = `${card.name}\nATK: ${card.atk} / DEF: ${card.def}\nModo: ${card.mode || "attack"}`;
        img.style.cursor = "pointer";

        img.onclick = () => {
          if (currentTurn !== 'player' || !attackModeActive) return;

          const attacker = playerField[selectedPlayerCardIndex];
          const defender = enemyField[index];

          executeAttack(attacker, defender, playerField, enemyField, true);

          attackModeActive = false;
          selectedPlayerCardIndex = null;

          attackBtn.disabled = true;
          defenseBtn.disabled = true;

          renderField(playerField, playerFieldDiv, false);
          renderField(enemyField, enemyFieldDiv, true);
          updateLP();

          if (checkVictory()) return;

          currentTurn = 'enemy';
          disableButtons();
          setTimeout(enemyTurn, 1500);
          log("Turno inimigo...");
        };
      } else {
        // carta inimiga oculta (quando não estiver em modo ataque)
        img.src = cardBackImage;
        img.title = "Carta inimiga oculta";
        img.style.cursor = "default";
      }
    } else {
      // cartas do jogador
      img.src = card.card_images[0].image_url;
      img.title = `${card.name}\nATK: ${card.atk} / DEF: ${card.def}\nModo: ${card.mode || "attack"}`;
      img.style.cursor = "pointer";

      img.onclick = () => {
        if (currentTurn !== 'player' || attackModeActive) return;

        if (selectedPlayerCardIndex === index) {
          // deselecionar
          selectedPlayerCardIndex = null;
          attackBtn.disabled = true;
          defenseBtn.disabled = true;
          log("Nenhuma carta selecionada.");
        } else {
          selectedPlayerCardIndex = index;
          attackBtn.disabled = false;
          defenseBtn.disabled = false;
          log(`Carta ${card.name} selecionada. Escolha Atacar ou Defender.`);
        }
        renderField(playerField, playerFieldDiv, false);
      };
    }

    if (!isEnemy && selectedPlayerCardIndex === index) img.classList.add("selected");
    container.appendChild(img);
  });
}

function drawCard(hand, deck) {
  if (hand.length >= MAX_HAND_SIZE || deck.length === 0) return null;
  const card = deck.shift();
  hand.push(card);
  return card;
}

function disableButtons() {
  drawCardBtn.disabled = true;
  attackBtn.disabled = true;
  defenseBtn.disabled = true;
  discardCardBtn.disabled = true;
}

function enableButtons() {
  drawCardBtn.disabled = false;
  attackBtn.disabled = selectedPlayerCardIndex !== null;
  defenseBtn.disabled = selectedPlayerCardIndex !== null;
  discardCardBtn.disabled = true; // só habilitar quando quiser
}

function checkVictory() {
  if (playerLP <= 0) {
    log("Você perdeu o duelo!");
    disableButtons();
    return true;
  }
  if (enemyLP <= 0) {
    log("Você venceu o duelo!");
    disableButtons();
    return true;
  }
  return false;
}

function executeAttack(attacker, defender, attackerField, defenderField, attackerIsPlayer) {
  if (!defender) {
    // ataque direto
    if (attackerIsPlayer) {
      enemyLP -= attacker.atk;
      enemyLP = Math.max(enemyLP, 0);
      log(`Você atacou diretamente e causou ${attacker.atk} de dano.`);
    } else {
      playerLP -= attacker.atk;
      playerLP = Math.max(playerLP, 0);
      log(`Inimigo atacou diretamente e causou ${attacker.atk} de dano.`);
    }
  } else {
    // ataque contra carta
    if (defender.mode === "defense") {
      // Carta defensiva — dano é ao LD do atacante se perder
      if (attacker.atk > defender.def) {
        let damage = attacker.atk - defender.def;
        defenderField.splice(defenderField.indexOf(defender), 1);
        if (attackerIsPlayer) {
          enemyLP -= damage;
          enemyLP = Math.max(enemyLP, 0);
          log(`Você destruiu ${defender.name} em defesa e causou ${damage} de dano ao oponente.`);
        } else {
          playerLP -= damage;
          playerLP = Math.max(playerLP, 0);
          log(`Inimigo destruiu ${defender.name} em defesa e causou ${damage} de dano a você.`);
        }
      } else if (attacker.atk < defender.def) {
        let damage = defender.def - attacker.atk;
        if (attackerIsPlayer) {
          playerLP -= damage;
          playerLP = Math.max(playerLP, 0);
          attackerField.splice(attackerField.indexOf(attacker), 1);
          log(`Seu ataque falhou contra a defesa. Você perdeu a carta e recebeu ${damage} de dano.`);
        } else {
          enemyLP -= damage;
          enemyLP = Math.max(enemyLP, 0);
          attackerField.splice(attackerField.indexOf(attacker), 1);
          log(`Inimigo falhou no ataque e recebeu ${damage} de dano.`);
        }
      } else {
        // empate
        defenderField.splice(defenderField.indexOf(defender), 1);
        attackerField.splice(attackerField.indexOf(attacker), 1);
        log(`Ambas as cartas foram destruídas em defesa.`);
      }
    } else {
      // defender modo ataque (modo clássico)
      if (attacker.atk > defender.atk) {
        let damage = attacker.atk - defender.atk;
        defenderField.splice(defenderField.indexOf(defender), 1);
        if (attackerIsPlayer) {
          enemyLP -= damage;
          enemyLP = Math.max(enemyLP, 0);
          log(`Você atacou ${defender.name} e causou ${damage} de dano.`);
        } else {
          playerLP -= damage;
          playerLP = Math.max(playerLP, 0);
          log(`Inimigo atacou ${defender.name} e causou ${damage} de dano.`);
        }
      } else if (attacker.atk < defender.atk) {
        let damage = defender.atk - attacker.atk;
        attackerField.splice(attackerField.indexOf(attacker), 1);
        if (attackerIsPlayer) {
          playerLP -= damage;
          playerLP = Math.max(playerLP, 0);
          log(`Você atacou mas perdeu e recebeu ${damage} de dano.`);
        } else {
          enemyLP -= damage;
          enemyLP = Math.max(enemyLP, 0);
          log(`Inimigo atacou mas perdeu e recebeu ${damage} de dano.`);
        }
      } else {
        // empate
        defenderField.splice(defenderField.indexOf(defender), 1);
        attackerField.splice(attackerField.indexOf(attacker), 1);
        log(`Ambas as cartas foram destruídas.`);
      }
    }
  }
}

async function enemyTurn() {
  log("Turno do inimigo...");
  drawCard(enemyHand, enemyDeck);
  playCard(enemyHand, enemyField);
  renderField(enemyField, enemyFieldDiv, true);
  updateLP();

  if (enemyField.length > 0) {
    const attacker = enemyField[0];
    const defender = playerField.length > 0 ? playerField[0] : null;
    executeAttack(attacker, defender, enemyField, playerField, false);
  }

  renderField(playerField, playerFieldDiv, false);
  renderField(enemyField, enemyFieldDiv, true);
  updateLP();

  if (checkVictory()) return;

  currentTurn = 'player';
  enableButtons();
  log("Seu turno! Compre uma carta ou ataque.");
}

// Eventos dos botões

drawCardBtn.onclick = () => {
  if (currentTurn !== 'player') {
    log("Não é seu turno!");
    return;
  }
  if (drawCard(playerHand, playerDeck)) {
    log("Você comprou uma carta.");
    if (playCard(playerHand, playerField)) {
      log("Você posicionou uma carta no campo.");
      renderField(playerField, playerFieldDiv, false);
    }
  } else {
    log("Não foi possível comprar carta (mão cheia ou deck vazio).");
  }
};

attackBtn.onclick = () => {
  if (currentTurn !== 'player') {
    log("Não é seu turno!");
    return;
  }
  if (selectedPlayerCardIndex === null) {
    log("Selecione uma carta para atacar.");
    return;
  }
  let card = playerField[selectedPlayerCardIndex];
  card.mode = "attack"; // força modo ataque
  attackModeActive = true;
  log(`${card.name} está pronto para atacar. Clique em uma carta inimiga para atacar.`);
  attackBtn.disabled = true;
  defenseBtn.disabled = true;
};

defenseBtn.onclick = () => {
  if (currentTurn !== 'player') {
    log("Não é seu turno!");
    return;
  }
  if (selectedPlayerCardIndex === null) {
    log("Selecione uma carta para mudar para defesa.");
    return;
  }
  let card = playerField[selectedPlayerCardIndex];
  card.mode = (card.mode === "defense") ? "attack" : "defense";
  log(`${card.name} mudou para modo ${card.mode === "attack" ? "Ataque" : "Defesa"}.`);
  renderField(playerField, playerFieldDiv, false);
  attackBtn.disabled = true;
  defenseBtn.disabled = true;
  selectedPlayerCardIndex = null;
};

discardCardBtn.onclick = () => {
  if (currentTurn !== 'player') {
    log("Não é seu turno!");
    return;
  }
  if (selectedPlayerCardIndex === null) {
    log("Selecione a carta do seu campo para descartar.");
    return;
  }
  const discarded = playerField.splice(selectedPlayerCardIndex, 1)[0];
  playerGraveyard.push(discarded);
  log(`Você descartou a carta ${discarded.name} para o cemitério.`);
  selectedPlayerCardIndex = null;
  renderField(playerField, playerFieldDiv, false);
};

async function startGame() {
  log("Carregando cartas...");
  try {
    const response = await fetch(API);
    const data = await response.json();
    deck = data.data;
    shuffle(deck);

    playerDeck = deck.slice(0, Math.floor(deck.length / 2));
    enemyDeck = deck.slice(Math.floor(deck.length / 2));

    for (let i = 0; i < 5; i++) {
      drawCard(playerHand, playerDeck);
      drawCard(enemyHand, enemyDeck);
    }

    while (playCard(playerHand, playerField)) {}
    while (playCard(enemyHand, enemyField)) {}

    renderField(playerField, playerFieldDiv, false);
    renderField(enemyField, enemyFieldDiv, true);
    updateLP();

    log("Jogo iniciado! Seu turno.");
    enableButtons();
  } catch (e) {
    log("Erro ao carregar cartas da API.");
    console.error(e);
  }
}

// Inicializa a renderização e o jogo
renderField(enemyField, enemyFieldDiv, true);
renderField(playerField, playerFieldDiv, false);
startGame();
