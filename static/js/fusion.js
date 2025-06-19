// static/js/fusion.js

import { state } from "./state.js";
import { log } from "./utils.js";
import { renderField } from "./render.js";

// Definição de fusões válidas
const fusionMap = {
  "Summoned Skull+Red-Eyes B. Dragon": {
    name: "Black Skull Dragon",
    atk: 3200,
    def: 2500,
    image: "https://images.ygoprodeck.com/images/cards/11901678.jpg"
  }
};

export function tryFusion(index1, index2) {
  const a = state.playerField[index1];
  const b = state.playerField[index2];

  if (!a || !b) {
    log("Selecione 2 monstros para fundir.");
    return;
  }

  const key = [a.name, b.name].sort().join("+");
  const fusion = fusionMap[key];

  if (fusion) {
    // Remove os monstros fundidos
    state.playerField.splice(Math.max(index1, index2), 1);
    state.playerField.splice(Math.min(index1, index2), 1);

    const fusionMonster = {
      name: fusion.name,
      atk: fusion.atk,
      def: fusion.def,
      type: "Fusion Monster",
      mode: "attack",
      card_images: [{ image_url: fusion.image }]
    };

    state.playerField.push(fusionMonster);
    log(`Fundiu ${a.name} e ${b.name} em ${fusion.name}!`);
    renderField(state.playerField, document.getElementById("player-field"), false);
  } else {
    log("Essas cartas não podem ser fundidas.");
  }
}
// static/js/fusion.js

import { state, log, renderField } from './state.js';

const fusionMap = {
  "Summoned Skull+Red-Eyes B. Dragon": {
    name: "Black Skull Dragon",
    atk: 3200,
    def: 2500,
    type: "Fusion Monster",
    card_images: [
      { image_url: "https://images.ygoprodeck.com/images/cards/37882110.jpg" }
    ]
  }
  // Adicione outras fusões aqui conforme desejar
};

export function tryFusion(idx1, idx2) {
  const cardA = state.playerField[idx1];
  const cardB = state.playerField[idx2];
  if (!cardA || !cardB) {
    log("Seleção inválida para fusão.");
    return;
  }

  // Ordena os nomes para evitar problema de ordem na chave
  const key = [cardA.name, cardB.name].sort().join("+");

  const fusionResult = fusionMap[key];
  if (!fusionResult) {
    log("Fusão impossível com essas cartas.");
    return;
  }

  // Remove as cartas originais do campo
  // Removendo índice maior primeiro para não desordenar
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

  // Atualiza visual do campo
  renderField(state.playerField, document.getElementById("player-field"), false);
}
