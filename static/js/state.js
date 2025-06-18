const MAX_HAND_SIZE = 5;
const MAX_FIELD_SIZE = 5;
const MAX_LP = 8000;
const cardBackImage = 'static/img/fundo-cartas.jpg';

let playerDeck = [], enemyDeck = [], playerHand = [], enemyHand = [];
let playerField = [], enemyField = [];
let playerGraveyard = [], enemyGraveyard = [];
let playerLP = MAX_LP, enemyLP = MAX_LP;
let playerDeckCount = 60, enemyDeckCount = 60;
let currentTurn = 'player';
let selectedPlayerCardIndex = null, selectedEnemyCardIndex = null;
let attackModeActive = false;
