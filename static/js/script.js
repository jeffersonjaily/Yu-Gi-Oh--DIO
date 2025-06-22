// constants e elements DOM
const API = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?type=normal%20monster';

const playerFieldDiv = document.getElementById("player-field");
const enemyFieldDiv = document.getElementById("enemy-field");
const logElem = document.getElementById("log");

const playerLPElem = document.getElementById("player-lp");
const playerBarElem = document.getElementById("player-bar");
const enemyLPElem = document.getElementById("enemy-lp");
const enemyBarElem = document.getElementById("enemy-bar");

const playerDeckCountElem = document.getElementById("player-deck-count");
const enemyDeckCountElem = document.getElementById("enemy-deck-count");

const drawCardBtn = document.getElementById("draw-card");
const attackBtn = document.getElementById("attack");
const defenseBtn = document.getElementById("defense");
const discardCardBtn = document.getElementById("discard-card");
const passTurnBtn = document.getElementById("pass-turn");

const MAX_HAND_SIZE = 5;
const MAX_FIELD_SIZE = 5;
const MAX_LP = 8000;
const cardBackImage = '/static/img/fundo-cartas.jpg';

// variates de escudo do jogo
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

let playerDeckCount = 60;
let enemyDeckCount = 60;

let currentTurn = 'player';

let selectedPlayerCardIndex = null;
let selectedEnemyCardIndex = null;
let attackModeActive = false;

// -----------------------------
// Funções auxiliares
// -----------------------------
function tryFusion(selectedIndexes) {
  if (selectedIndexes.length !== 2) {
    log("Selecione exatamente duas cartas para fusão.");
    return false;
  }

  const card1 = playerField[selectedIndexes[0]];
  const card2 = playerField[selectedIndexes[1]];

  if (!card1 || !card2) {
    log("Cartas inválidas para fusão.");
    return false;
  }

  // Tenta encontrar uma receita que combine os dois nomes (ordem indiferente)
  const fusion = fusionRecipes.find(recipe => {
    const comps = recipe.components;
    return (comps.includes(card1.name) && comps.includes(card2.name));
  });

  if (!fusion) {
    log("Fusão inválida para essas cartas.");
    return false;
  }

  // Remove as cartas do campo (comece pelo maior índice para evitar bugs)
  const sortedIndexes = selectedIndexes.slice().sort((a,b) => b - a);
  sortedIndexes.forEach(i => playerField.splice(i, 1));

  // alicia a cart fusão no campo
  playerField.push(fusion.result);

  log(`fuse realizada! Você criou ${fusion.result.name}.`);

  renderField(playerField, playerFieldDiv, false);
  disablePlayerActionButtons();

  return true;
}

// Log no console do jodo
function log(text) {
  logElem.textContent = text;
}

// Embaralha um array (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Atualiza contagem de cartas restantes nos decks
function updateDeckCount() {
  playerDeckCountElem.textContent = playerDeckCount;
  enemyDeckCountElem.textContent = enemyDeckCount;
}

// Atualiza a exibição dos Pontos de Vida e barras
function updateLP() {
  playerLPElem.textContent = playerLP;
  enemyLPElem.textContent = enemyLP;

  playerBarElem.style.width = `${(playerLP / MAX_LP) * 100}%`;
  enemyBarElem.style.width = `${(enemyLP / MAX_LP) * 100}%`;
}

// Zoom visual para as cartas clicadas
function zoomCard(img) {
  img.classList.add("card-zoomed");
  setTimeout(() => {
    img.classList.remove("card-zoomed");
  }, 700);
}

// -----------------------------
// Funções de jogo
// -----------------------------

// Comprar carta do deck para a mão
function drawCard(hand, deck, isPlayer = true) {
  if (hand.length >= MAX_HAND_SIZE || deck.length === 0) return false;

  const card = deck.shift();
  hand.push(card);

  if (isPlayer) {
    playerDeckCount--;
    if (playerDeckCount < 0) {
      playerLP = 0;
      log("Você tentou comprar carta e perdeu por falta de cartas no deck!");
      disableButtons();
      return true; 
    }
  } else {
    enemyDeckCount--;
    if (enemyDeckCount < 0) {
      enemyLP = 0;
      log("Inimigo perdeu por falta de cartas no deck!");
      disableButtons();
      return true;
    }
  }

  updateDeckCount();
  return true;
}

// Coloca carta da mão para o campo (modo ataque por padrão)
function playCard(hand, field, isPlayer = true) {
  if (hand.length === 0 || field.length >= MAX_FIELD_SIZE) return false;

  const card = hand.shift();
  if (isPlayer) card.mode = "attack";

  field.push(card);
  return true;
}

// Renderiza cartas no campo (com visual diferente para inimigo)
function renderField(field, container, isEnemy = false) {
  container.innerHTML = "";

  field.forEach((card, index) => {
    const img = document.createElement("img");
    img.src = (isEnemy && !attackModeActive) ? cardBackImage : card.card_images[0].image_url;
    img.title = `${card.name}\nATK: ${card.atk} / DEF: ${card.def}\nModo: ${card.mode || "attack"}`;
    img.style.cursor = "pointer";
    img.classList.remove("card-zoomed");

    if (isEnemy) {
      img.onclick = () => {
        if (currentTurn !== 'player' || !attackModeActive || selectedPlayerCardIndex === null) return;

        const attacker = playerField[selectedPlayerCardIndex];
        const defender = enemyField[index];

        zoomCard(img);
        zoomCard(playerFieldDiv.querySelectorAll("img")[selectedPlayerCardIndex]);

        setTimeout(() => {
          executeAttack(attacker, defender, playerField, enemyField, true);
          attackModeActive = false;
          selectedPlayerCardIndex = null;
          disablePlayerActionButtons();
          renderField(playerField, playerFieldDiv, false);
          renderField(enemyField, enemyFieldDiv, true);
          updateLP();

          if (!checkVictory()) {
            currentTurn = 'enemy';
            disableButtons();
            setTimeout(enemyTurn, 1500);
            log("Turno inimigo...");
          }
        }, 800);
      };
    } else {
      img.onclick = () => {
        if (currentTurn !== 'player' || attackModeActive) return;

        if (selectedPlayerCardIndex === index) {
          selectedPlayerCardIndex = null;
          disablePlayerActionButtons();
          log("Nenhuma carta selecionada.");
        } else {
          selectedPlayerCardIndex = index;
          enablePlayerActionButtons();
          log(`Carta ${card.name} selecionada. Escolha Atacar, Defender ou Descartar.`);
        }
        renderField(playerField, playerFieldDiv, false);
      };
    }

    if (!isEnemy && selectedPlayerCardIndex === index) {
      img.classList.add("selected");
    }

    container.appendChild(img);
  });
}

// Executa o ataque entre cartas ou opaque direto
function executeAttack(attacker, defender, attackerField, defenderField, attackerIsPlayer) {
  if (!defender) {
    const damage = attacker.atk;
    if (attackerIsPlayer) {
      enemyLP = Math.max(0, enemyLP - damage);
      log(`Você atacou diretamente e caus ${damage} de dano.`);
    } else {
      playerLP = Math.max(0, playerLP - damage);
      log(`Inimigo atacou diretamente e causou ${damage} de dano.`);
    }
    return;
  }

  if (defender.mode === "defense") {
    if (attacker.atk > defender.def) {
      const damage = attacker.atk - defender.def;
      defenderField.splice(defenderField.indexOf(defender), 1);
      if (attackerIsPlayer) {
        enemyLP = Math.max(0, enemyLP - damage);
        log(`Você destruiu ${defender.name} em defesa e causou ${damage} de dado.`);
      } else {
        playerLP = Math.max(0, playerLP - damage);
        log(`Inimigo destruiu ${defender.name} em defesa e causou ${damage} de dano.`);
      }
    } else if (attacker.atk < defender.def) {
      const damage = defender.def - attacker.atk;
      attackerField.splice(attackerField.indexOf(attacker), 1);
      if (attackerIsPlayer) {
        playerLP = Math.max(0, playerLP - damage);
        log(`Você perdeu o ataque e recebeu ${damage} de dano.`);
      } else {
        enemyLP = Math.max(0, enemyLP - damage);
        log(`Inimigo perdeu o ataque e recebeu ${damage} de dano.`);
      }
    } else {
      defenderField.splice(defenderField.indexOf(defender), 1);
      attackerField.splice(attackerField.indexOf(attacker), 1);
      log("Empate! Ambas as cartas foram destruídas.");
    }
  } else {
    if (attacker.atk > defender.atk) {
      const damage = attacker.atk - defender.atk;
      defenderField.splice(defenderField.indexOf(defender), 1);
      if (attackerIsPlayer) {
        enemyLP = Math.max(0, enemyLP - damage);
        log(`Você destruiu ${defender.name} e causou ${damage} de dano.`);
      } else {
        playerLP = Math.max(0, playerLP - damage);
        log(`Inimigo destruiu ${defender.name} e causou ${damage} de dano.`);
      }
    } else if (attacker.atk < defender.atk) {
      const damage = defender.atk - attacker.atk;
      attackerField.splice(attackerField.indexOf(attacker), 1);
      if (attackerIsPlayer) {
        playerLP = Math.max(0, playerLP - damage);
        log(`Você perdeu o ataque e recebeu ${damage} de dano.`);
      } else {
        enemyLP = Math.max(0, enemyLP - damage);
        log(`Inimigo perdeu o ataque e recebeu ${damage} de dano.`);
      }
    } else {
      defenderField.splice(defenderField.indexOf(defender), 1);
      attackerField.splice(attackerField.indexOf(attacker), 1);
      log("Empate! Ambas as cartas foram destruídas.");
    }
  }
}

// Verifica vitória e finaliza o jogo se necessário
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

// -----------------------------
// Turnos e ações
// -----------------------------

// Turno inimigo: comprar carta, jogar, atacar
async function enemyTurn() {
  log("Turno do inimigo...");
  drawCard(enemyHand, enemyDeck, false);
  playCard(enemyHand, enemyField, false);
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

  if (!checkVictory()) {
    currentTurn = 'player';
    enableButtons();
    log("Seu turno! Compre uma carta ou ataque.");
  }
}

// Passar turno (botão)
passTurnBtn.onclick = () => {
  if (currentTurn !== 'player') return;

  disableButtons();
  currentTurn = 'enemy';
  log("Turno inimigo...");

  setTimeout(enemyTurn, 500);
};

// -----------------------------
// Botões do jogador
// -----------------------------

drawCardBtn.onclick = () => {
  if (currentTurn !== 'player') return;
  if (drawCard(playerHand, playerDeck, true)) {
    if (playCard(playerHand, playerField, true)) {
      renderField(playerField, playerFieldDiv, false);
    }
  }
};

attackBtn.onclick = () => {
  if (currentTurn !== 'player' || selectedPlayerCardIndex === null) return;

  const card = playerField[selectedPlayerCardIndex];
  card.mode = "attack";
  attackModeActive = true;
  log(`${card.name} está pronto para atacar. Selecione um inimigo.`);
  disablePlayerActionButtons();
};

defenseBtn.onclick = () => {
  if (currentTurn !== 'player' || selectedPlayerCardIndex === null) return;

  const card = playerField[selectedPlayerCardIndex];
  card.mode = (card.mode === "defense") ? "attack" : "defense";
  log(`${card.name} mudou para modo ${card.mode}.`);
  selectedPlayerCardIndex = null;
  renderField(playerField, playerFieldDiv, false);
  disablePlayerActionButtons();
};

discardCardBtn.onclick = () => {
  if (currentTurn !== 'player' || selectedPlayerCardIndex === null) return;

  const discarded = playerField.splice(selectedPlayerCardIndex, 1)[0];
  playerGraveyard.push(discarded);
  log(`Você descartou ${discarded.name}.`);
  selectedPlayerCardIndex = null;
  renderField(playerField, playerFieldDiv, false);
  disablePlayerActionButtons();
};

// Habilita botões de ação para o jogador (quando uma carta está selecionada)
function enablePlayerActionButtons() {
  attackBtn.disabled = false;
  defenseBtn.disabled = false;
  discardCardBtn.disabled = false;
}

// Desabilita botões de ação do jogador (quando nenhuma carta está selecionada ou durante ataque)
function disablePlayerActionButtons() {
  attackBtn.disabled = true;
  defenseBtn.disabled = true;
  discardCardBtn.disabled = true;
}

// Desabilita todos os botões do jogador
function disableButtons() {
  drawCardBtn.disabled = true;
  disablePlayerActionButtons();
}

// Habilita botões do jogador, porém desabilita ação enquanto nenhuma carta selecionada
function enableButtons() {
  drawCardBtn.disabled = false;
  attackBtn.disabled = true;
  defenseBtn.disabled = true;
  discardCardBtn.disabled = true;
}

// -----------------------------
// Inicialização do jogo
// -----------------------------

async function startGame() {
  log("Carregando cartas...");
  try {
    const response = await fetch(API);
    const data = await response.json();
    deck = data.data;
    shuffle(deck);

    // Dividir deck entre jogador e inimigo
    playerDeck = deck.slice(0, Math.floor(deck.length / 2));
    enemyDeck = deck.slice(Math.floor(deck.length / 2));

    playerDeckCount = playerDeck.length;
    enemyDeckCount = enemyDeck.length;

    updateDeckCount();

    // Comprar 5 cartas para cada
    for (let i = 0; i < 5; i++) {
      drawCard(playerHand, playerDeck, true);
      drawCard(enemyHand, enemyDeck, false);
    }

    // Jogar cartas para o campo automaticamente enquanto possível
    while (playCard(playerHand, playerField, true)) {}
    while (playCard(enemyHand, enemyField, false)) {}

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

// Renderiza os campos e inicia o jogo
renderField(enemyField, enemyFieldDiv, true);
renderField(playerField, playerFieldDiv, false);
startGame();
