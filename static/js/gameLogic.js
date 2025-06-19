// static/js/gameLogic.js

import { state, log, updateLP, renderField, DOM, enableButtons, disableButtons } from './state.js';
import { drawCard, playCard, executeAttack, checkVictory } from './play.js';
import { enemyTurn } from './events.js';
import { sendPlayCard, sendAttack } from './network.js';

export async function startSinglePlayerGame(isSinglePlayer = true) {
  log("Carregando cartas...");

  try {
    const response = await fetch(state.API);
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
    while (playCard(state.playerHand, state.playerField, true)) { }
    while (playCard(state.enemyHand, state.enemyField, false)) { }

    renderField(state.playerField, DOM.playerFieldDiv, false);
    renderField(state.enemyField, DOM.enemyFieldDiv, true);

    updateLP();

    log("Jogo iniciado! Seu turno.");
    enableButtons();

    if (!isSinglePlayer) {
      // No multiplayer, aguarda ações via rede
      disableButtons();
      log("Esperando oponente...");
    }
  } catch (e) {
    log("Erro ao carregar cartas da API.");
    console.error(e);
  }
}

// Modifique os eventos de jogar carta, ataque e etc para enviar via rede se multiplayer

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

// Inclua outras funções específicas para IA, multiplayer, etc.

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function updateDeckCount() {
  DOM.playerDeckCountElem.textContent = state.playerDeckCount;
  DOM.enemyDeckCountElem.textContent = state.enemyDeckCount;
}
