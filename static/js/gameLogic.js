// static/js/gameLogic.js

import { state } from './state.js';
import { log, updateLP, enableButtons, disableButtons } from './utils.js';
import { renderField } from './render.js';
import { DOM } from './constants.js';
import { drawCard, playCard, executeAttack, checkVictory } from './play.js';
import { enemyTurn } from './events.js';
import { sendPlayCard, sendAttack } from './network.js';

export async function startSinglePlayerGame(isSinglePlayer = true) {
  log("Carregando cartas...");

  try {
    const response = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?type=normal%20monster');
    const data = await response.json();

    state.deck = data.data;
    shuffle(state.deck);

    // Divide o deck entre player e inimigo
    state.playerDeck = state.deck.slice(0, Math.floor(state.deck.length / 2));
    state.enemyDeck = state.deck.slice(Math.floor(state.deck.length / 2));

    state.playerDeckCount = state.playerDeck.length;
    state.enemyDeckCount = state.enemyDeck.length;

    updateDeckCount();

    // Comprar 5 cartas para cada
    for (let i = 0; i < 5; i++) {
      drawCard(state.playerHand, state.playerDeck, true);
      drawCard(state.enemyHand, state.enemyDeck, false);
    }

    // Jogar cartas automaticamente no campo enquanto possível
    while (playCard(state.playerHand, state.playerField, true)) {}
    while (playCard(state.enemyHand, state.enemyField, false)) {}

    renderField(state.playerField, DOM.playerFieldDiv, false);
    renderField(state.enemyField, DOM.enemyFieldDiv, true);

    updateLP();

    log("Jogo iniciado! Seu turno.");
    enableButtons();

    if (!isSinglePlayer) {
      disableButtons();
      log("Esperando oponente...");
    }
  } catch (e) {
    log("Erro ao carregar cartas da API.");
    console.error(e);
  }
}

// Modo multiplayer
export function jogarCartaMultiplayer(card) {
  playCard(state.playerHand, state.playerField, true);
  renderField(state.playerField, DOM.playerFieldDiv, false);
  sendPlayCard(card);
  log(`Você jogou ${card.name} no campo.`);
}

export function atacarMultiplayer(attackData) {
  executeAttack(attackData.attacker, attackData.defender, state.playerField, state.enemyField, true);
  renderField(state.enemyField, DOM.enemyFieldDiv, true);
  renderField(state.playerField, DOM.playerFieldDiv, false);
  sendAttack(attackData);
  log("Você realizou um ataque.");
}

// Embaralhar deck
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Atualiza contadores de cartas
function updateDeckCount() {
  DOM.playerDeckCountElem.textContent = state.playerDeckCount;
  DOM.enemyDeckCountElem.textContent = state.enemyDeckCount;
}
