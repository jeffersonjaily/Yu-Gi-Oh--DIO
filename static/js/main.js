import { startSinglePlayerGame } from './gameLogic.js';
import { initSocket } from './network.js';
import { DOM } from './constants.js';
import { renderField } from './render.js';

// Referências DOM
const modeSelectDiv = document.getElementById('mode-select');
const gameContainerDiv = document.getElementById('game-container');
const btnSingle = document.getElementById('btn-single');
const btnMulti = document.getElementById('btn-multi');

function initGameUI() {
  renderField([], DOM.enemyFieldDiv, true);
  renderField([], DOM.playerFieldDiv, false);
}

// Iniciar jogo Single Player
btnSingle.onclick = () => {
  modeSelectDiv.style.display = 'none';
  gameContainerDiv.style.display = 'block';
  initGameUI();
  startSinglePlayerGame(true);
};

// Iniciar jogo Multiplayer
btnMulti.onclick = () => {
  modeSelectDiv.style.display = 'none';
  gameContainerDiv.style.display = 'block';
  initGameUI();
  initSocket(() => {
    startSinglePlayerGame(false);
  });
};

// Caso queira iniciar direto no modo single player, pode usar:
// initGameUI();
// startSinglePlayerGame(true);
