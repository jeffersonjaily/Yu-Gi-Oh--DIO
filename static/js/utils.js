import { DOM } from './constants.js';
import { state } from './state.js';

export function log(text) {
  if (DOM.logElem) DOM.logElem.textContent = text;
}

export function updateDeckCount() {
  DOM.playerDeckCountElem.textContent = state.playerDeckCount;
  DOM.enemyDeckCountElem.textContent = state.enemyDeckCount;
}

export function updateLP() {
  DOM.playerLPElem.textContent = state.playerLP;
  DOM.enemyLPElem.textContent = state.enemyLP;

  const playerPercent = Math.max((state.playerLP / 8000) * 100, 0);
  const enemyPercent = Math.max((state.enemyLP / 8000) * 100, 0);

  DOM.playerBarElem.style.width = `${playerPercent}%`;
  DOM.enemyBarElem.style.width = `${enemyPercent}%`;
}

export function disableButtons() {
  DOM.drawCardBtn.disabled = true;
  DOM.passTurnBtn.disabled = true;
  if (DOM.fuseBtn) DOM.fuseBtn.disabled = true;
  disablePlayerActionButtons();
}

export function enableButtons() {
  DOM.drawCardBtn.disabled = false;
  DOM.passTurnBtn.disabled = false;
  if (DOM.fuseBtn) DOM.fuseBtn.disabled = false;
  disablePlayerActionButtons(); // só habilita draw e turn
}

export function enablePlayerActionButtons() {
  DOM.attackBtn.disabled = false;
  DOM.defenseBtn.disabled = false;
  DOM.discardCardBtn.disabled = false;
}

export function disablePlayerActionButtons() {
  DOM.attackBtn.disabled = true;
  DOM.defenseBtn.disabled = true;
  DOM.discardCardBtn.disabled = true;
}
