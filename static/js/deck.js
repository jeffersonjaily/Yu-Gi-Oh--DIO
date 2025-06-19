// static/js/deck.js

import { state } from './state.js';
import { log } from './utils.js';

// URL da API para buscar cartas (monstros normais por padrão)
const API_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?type=normal%20monster';

// Carrega e embaralha o deck a partir da API
export async function loadDeck() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    state.deck = shuffleArray(data.data);
  } catch (err) {
    log("Erro ao carregar cartas do deck.");
    console.error("Erro no loadDeck:", err);
  }
}

// Função de embaralhar (Fisher-Yates)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
