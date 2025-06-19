// static/js/utils.js

import { DOM } from './constants.js';
import { state } from './state.js';

// Exibe mensagens no log
export function log(text) {
  DOM.logElem.textContent = text;
}

// Atualiza os contadores de cartas nos decks
export function updateDeckCount() {
  DOM.playerDeckCountElem.textContent = state.playerDeckCount;
  DOM.enemyDeckCountElem.textContent = state.enemyDeckCount;
}

// Atualiza a exibição de LPs e barras de vida
export function updateLP() {
  DOM.playerLPElem.textContent = state.playerLP;
  DOM.enemyLPElem.textContent = state.enemyLP;

  DOM.playerBarElem.style.width = `${(state.playerLP / state.MAX_LP) * 100}%`;
  DOM.enemyBarElem.style.width = `${(state.enemyLP / state.MAX_LP) * 100}%`;
}

// Animação rápida de zoom ao clicar na carta
export function zoomCard(img) {
  img.classList.add("card-zoomed");
  setTimeout(() => img.classList.remove("card-zoomed"), 700);
}

// Habilita botões de ação (após seleção de carta)
export function enablePlayerActionButtons() {
  DOM.attackBtn.disabled = false;
  DOM.defenseBtn.disabled = false;
  DOM.discardCardBtn.disabled = false;
}

// Desabilita botões de ação
export function disablePlayerActionButtons() {
  DOM.attackBtn.disabled = true;
  DOM.defenseBtn.disabled = true;
  DOM.discardCardBtn.disabled = true;
}

// Habilita botões padrão no início do turno
export function enableButtons() {
  DOM.drawCardBtn.disabled = false;
  disablePlayerActionButtons();
}

// Desabilita todos os botões
export function disableButtons() {
  DOM.drawCardBtn.disabled = true;
  disablePlayerActionButtons();
}
