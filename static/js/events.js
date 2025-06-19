// static/js/events.js

import { state } from './state.js';
import { log, disableButtons, enableButtons, enablePlayerActionButtons, disablePlayerActionButtons } from './utils.js';
import { drawCard, playCard, executeAttack, checkVictory } from './play.js';
import { renderField } from './render.js';
import { tryFusion } from './fusion.js';
import { DOM } from './constants.js';

// Controle de seleção para fusão
let selectedFirstIndex = null;
let selectedSecondIndex = null;

// Cria e adiciona botão "Fundir" na UI
const fuseBtn = document.createElement("button");
fuseBtn.textContent = "Fundir";
fuseBtn.classList.add("rpgui-button");
document.querySelector(".rpgui-container.framed-grey").appendChild(fuseBtn);

// Atualiza destaque visual das cartas selecionadas para fusão
function highlightSelectedCards() {
  const cards = [...DOM.playerFieldDiv.querySelectorAll("img")];
  cards.forEach((card, i) => {
    card.classList.toggle("selected", i === selectedFirstIndex || i === selectedSecondIndex);
  });
}

// Clique nas cartas do campo do jogador - seleção para fusão
DOM.playerFieldDiv.onclick = (e) => {
  const cards = [...DOM.playerFieldDiv.querySelectorAll("img")];
  const index = cards.indexOf(e.target);
  if (index < 0) return;

  if (selectedFirstIndex === index) {
    selectedFirstIndex = null;
    selectedSecondIndex = null;
    log("Seleção cancelada.");
  } else if (selectedFirstIndex === null) {
    selectedFirstIndex = index;
    log(`Primeira carta selecionada: ${state.playerField[index].name}`);
  } else if (selectedSecondIndex === null) {
    selectedSecondIndex = index;
    log(`Segunda carta selecionada: ${state.playerField[index].name}`);
  } else {
    // Se já tem duas selecionadas, reseta e seleciona essa
    selectedFirstIndex = index;
    selectedSecondIndex = null;
    log(`Primeira carta selecionada: ${state.playerField[index].name}`);
  }

  highlightSelectedCards();
};

// Clique no botão fundir - executa tentativa de fusão
fuseBtn.onclick = () => {
  if (selectedFirstIndex !== null && selectedSecondIndex !== null) {
    tryFusion(selectedFirstIndex, selectedSecondIndex);
    selectedFirstIndex = null;
    selectedSecondIndex = null;
    highlightSelectedCards();
  } else {
    log("Selecione duas cartas para fundir.");
  }
};

// Turno inimigo
export async function enemyTurn() {
  log("Turno do inimigo...");

  drawCard(state.enemyHand, state.enemyDeck, false);
  playCard(state.enemyHand, state.enemyField, false);

  renderField(state.enemyField, DOM.enemyFieldDiv, true);
  renderField(state.playerField, DOM.playerFieldDiv, false);

  if (state.enemyField.length > 0) {
    const attacker = state.enemyField[0];
    const defender = state.playerField.length > 0 ? state.playerField[0] : null;

    executeAttack(attacker, defender, state.enemyField, state.playerField, false);

    renderField(state.enemyField, DOM.enemyFieldDiv, true);
    renderField(state.playerField, DOM.playerFieldDiv, false);
  }

  if (!checkVictory()) {
    state.currentTurn = 'player';
    enableButtons();
    log("Seu turno! Compre uma carta ou ataque.");
  }
}

// Botões do jogador
DOM.drawCardBtn.onclick = () => {
  if (state.currentTurn !== 'player') return;

  if (drawCard(state.playerHand, state.playerDeck, true)) {
    if (playCard(state.playerHand, state.playerField, true)) {
      renderField(state.playerField, DOM.playerFieldDiv, false);
    }
  }
};

DOM.attackBtn.onclick = () => {
  if (state.currentTurn !== 'player' || state.selectedPlayerCardIndex === null) return;

  const card = state.playerField[state.selectedPlayerCardIndex];
  card.mode = "attack";
  state.attackModeActive = true;

  log(`${card.name} está pronto para atacar. Selecione um inimigo.`);
  disablePlayerActionButtons();
};

DOM.defenseBtn.onclick = () => {
  if (state.currentTurn !== 'player' || state.selectedPlayerCardIndex === null) return;

  const card = state.playerField[state.selectedPlayerCardIndex];
  card.mode = card.mode === "defense" ? "attack" : "defense";

  log(`${card.name} mudou para modo ${card.mode}.`);
  state.selectedPlayerCardIndex = null;

  renderField(state.playerField, DOM.playerFieldDiv, false);
  disablePlayerActionButtons();
};

DOM.discardCardBtn.onclick = () => {
  if (state.currentTurn !== 'player' || state.selectedPlayerCardIndex === null) return;

  const discarded = state.playerField.splice(state.selectedPlayerCardIndex, 1)[0];
  state.playerGraveyard.push(discarded);

  log(`Você descartou ${discarded.name}.`);
  state.selectedPlayerCardIndex = null;

  renderField(state.playerField, DOM.playerFieldDiv, false);
  disablePlayerActionButtons();
};

DOM.passTurnBtn.onclick = () => {
  if (state.currentTurn !== 'player') return;

  state.currentTurn = 'enemy';
  disableButtons();
  log("Passou o turno. Aguardando inimigo...");
  setTimeout(enemyTurn, 1000);
};
