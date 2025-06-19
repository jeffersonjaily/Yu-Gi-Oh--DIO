// static/js/state.js

export const MAX_HAND_SIZE = 5;
export const MAX_FIELD_SIZE = 5;
export const MAX_LP = 8000;
export const cardBackImage = 'static/img/fundo-cartas.jpg';

export const state = {
  deck: [],
  playerDeck: [],
  enemyDeck: [],
  playerHand: [],
  enemyHand: [],
  playerField: [],
  enemyField: [],
  playerGraveyard: [],
  enemyGraveyard: [],

  playerLP: MAX_LP,
  enemyLP: MAX_LP,

  playerDeckCount: 60,
  enemyDeckCount: 60,

  currentTurn: 'player',

  selectedPlayerCardIndex: null,
  selectedEnemyCardIndex: null,

  attackModeActive: false,

  isMultiplayer: false, // Para controle se é contra IA ou jogador
  socket: null,
  roomId: null
};
