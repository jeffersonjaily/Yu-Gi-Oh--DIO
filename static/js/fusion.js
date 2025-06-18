// fusion.js
// Lógica para fusão de cartas

import { playerField } from './state.js';

const fusionMap = {
  "Red-Eyes B. Dragon+Summoned Skull": {
    name: "Black Skull Dragon",
    atk: 3200,
    def: 2500,
    image: "https://ygoprodeck.com/pics/14493787.jpg"
  }
};

export function tryFusion(idx1, idx2) {
  const a = playerField[idx1];
  const b = playerField[idx2];
  if (!a || !b) return false;

  const key = [a.name, b.name].sort().join("+");
  const fusionResult = fusionMap[key];

  if (fusionResult) {
    playerField.splice(Math.max(idx1, idx2), 1);
    playerField.splice(Math.min(idx1, idx2), 1);
    const newMonster = {
      name: fusionResult.name,
      atk: fusionResult.atk,
      def: fusionResult.def,
      type: "Fusion Monster",
      card_images: [{ image_url: fusionResult.image }],
      mode: "attack"
    };
    playerField.push(newMonster);
    return `Fundiu ${a.name} e ${b.name} em ${fusionResult.name}!`;
  }
  return "Fusão impossível.";
}
