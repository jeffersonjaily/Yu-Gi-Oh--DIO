// Arquivo: static/js/constants.js
export const API = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?type=normal%20monster';

export const MAX_HAND_SIZE = 5;
export const MAX_FIELD_SIZE = 5;
export const MAX_LP = 8000;
export const cardBackImage = 'static/img/fundo-cartas.jpg';

export const DOM = {
  playerFieldDiv: document.getElementById("player-field"),
  enemyFieldDiv: document.getElementById("enemy-field"),
  logElem: document.getElementById("log"),
  playerLPElem: document.getElementById("player-lp"),
  playerBarElem: document.getElementById("player-bar"),
  enemyLPElem: document.getElementById("enemy-lp"),
  enemyBarElem: document.getElementById("enemy-bar"),
  playerDeckCountElem: document.getElementById("player-deck-count"),
  enemyDeckCountElem: document.getElementById("enemy-deck-count"),
  drawCardBtn: document.getElementById("draw-card"),
  attackBtn: document.getElementById("attack"),
  defenseBtn: document.getElementById("defense"),
  discardCardBtn: document.getElementById("discard-card"),
  passTurnBtn: document.getElementById("pass-turn")
};
