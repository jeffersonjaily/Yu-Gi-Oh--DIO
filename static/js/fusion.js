// static/js/fusion.js

import { state } from './state.js'; 
import { log } from './utils.js';
import { renderField } from './render.js';

// Chaves devem estar ordenadas alfabeticamente para evitar confusão na busca
const fusionMap = {
  "Red-Eyes B. Dragon+Summoned Skull": { // Note que as chaves estão ordenadas alfabeticamente
    name: "Black Skull Dragon",
    atk: 3200,
    def: 2500,
    type: "Fusion Monster",
    card_images: [
      { image_url: "https://images.ygoprodeck.com/images/cards/37882110.jpg" }
    ]
  }
  // Adicione outras fusões aqui conforme desejar, sempre com a chave em ordem alfabética
};

export function tryFusion(idx1, idx2) {
  const cardA = state.playerField[idx1];
  const cardB = state.playerField[idx2];

  if (!cardA || !cardB) {
    log("Seleção inválida para fusão.");
    return;
  }

  // Ordena os nomes para criar a chave padronizada
  const key = [cardA.name, cardB.name].sort().join("+");

  const fusionResult = fusionMap[key];

  if (!fusionResult) {
    log("Fusão impossível com essas cartas.");
    return;
  }

  // Removendo as cartas originais do campo (maior índice primeiro)
  const indices = [idx1, idx2].sort((a, b) => b - a);
  indices.forEach(i => state.playerField.splice(i, 1));

  // Cria a nova carta de fusão
  const fusionCard = {
    name: fusionResult.name,
    atk: fusionResult.atk,
    def: fusionResult.def,
    type: fusionResult.type,
    card_images: fusionResult.card_images,
    mode: "attack"
  };

  // Adiciona a carta fundida no campo
  state.playerField.push(fusionCard);

  log(`Você fundiu ${cardA.name} e ${cardB.name} em ${fusionResult.name}!`);

  // Atualiza o campo do jogador no DOM
  renderField(state.playerField, document.getElementById("player-field"), false);
}
