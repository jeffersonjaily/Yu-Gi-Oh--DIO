// static/js/main.js

import { startSinglePlayerGame } from './gameLogic.js';
import { renderField } from './render.js';
import { DOM } from './state.js';
import { initSocket } from './network.js';

// Limpa e renderiza os campos vazios inicialmente
renderField([], DOM.enemyFieldDiv, true);
renderField([], DOM.playerFieldDiv, false);

async function startGame() {
  const modo = prompt("Digite 1 para Single Player ou 2 para Multiplayer:");

  if (modo === "2") {
    // Multiplayer: inicia socket e depois o jogo multiplayer
    initSocket(() => {
      startSinglePlayerGame(false); // falso = multiplayer
    });
  } else {
    // Single Player contra IA
    startSinglePlayerGame(true);  // true = singleplayer/IA
  }
}

startGame();
