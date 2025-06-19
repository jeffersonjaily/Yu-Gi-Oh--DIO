// static/js/play.js

import { state } from './state.js';
import { log, updateDeckCount, updateLP, disableButtons, enableButtons } from './utils.js';
import { renderField } from './render.js';

// Embaralha um array
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Comprar carta
export function drawCard(hand, deck, isPlayer = true) {
  if (hand.length >= state.MAX_HAND_SIZE || deck.length === 0) return false;

  const card = deck.shift();
  hand.push(card);

  if (isPlayer) {
    state.playerDeckCount--;
    if (state.playerDeckCount < 0) {
      state.playerLP = 0;
      log("Você perdeu: sem cartas no deck!");
      disableButtons();
    }
  } else {
    state.enemyDeckCount--;
    if (state.enemyDeckCount < 0) {
      state.enemyLP = 0;
      log("Você venceu! O inimigo ficou sem cartas.");
      disableButtons();
    }
  }

  updateDeckCount();
  return true;
}

// Invocar carta da mão pro campo
export function playCard(hand, field, isPlayer = true) {
  if (hand.length === 0 || field.length >= state.MAX_FIELD_SIZE) return false;

  const card = hand.shift();
  card.mode = "attack";
  field.push(card);
  return true;
}

// Ataque entre monstros ou direto
export function executeAttack(attacker, defender, attackerField, defenderField, attackerIsPlayer) {
  if (!defender) {
    const damage = attacker.atk;
    if (attackerIsPlayer) {
      state.enemyLP = Math.max(0, state.enemyLP - damage);
      log(`Ataque direto! ${damage} de dano ao inimigo.`);
    } else {
      state.playerLP = Math.max(0, state.playerLP - damage);
      log(`Inimigo atacou diretamente. ${damage} de dano.`);
    }
    return;
  }

  if (defender.mode === "defense") {
    if (attacker.atk > defender.def) {
      const damage = attacker.atk - defender.def;
      defenderField.splice(defenderField.indexOf(defender), 1);
      if (attackerIsPlayer) {
        state.enemyLP -= damage;
        log(`Destruiu ${defender.name} (DEF) e causou ${damage} de dano.`);
      } else {
        state.playerLP -= damage;
        log(`Inimigo destruiu ${defender.name} (DEF) e causou ${damage} de dano.`);
      }
    } else if (attacker.atk < defender.def) {
      const damage = defender.def - attacker.atk;
      attackerField.splice(attackerField.indexOf(attacker), 1);
      if (attackerIsPlayer) {
        state.playerLP -= damage;
        log(`Perdeu o ataque. Recebeu ${damage} de dano.`);
      } else {
        state.enemyLP -= damage;
        log(`Inimigo perdeu o ataque e tomou ${damage}.`);
      }
    } else {
      attackerField.splice(attackerField.indexOf(attacker), 1);
      defenderField.splice(defenderField.indexOf(defender), 1);
      log(`Empate! Ambos os monstros foram destruídos.`);
    }
  } else {
    if (attacker.atk > defender.atk) {
      const damage = attacker.atk - defender.atk;
      defenderField.splice(defenderField.indexOf(defender), 1);
      attackerIsPlayer ? state.enemyLP -= damage : state.playerLP -= damage;
      log(`${attacker.name} destruiu ${defender.name} e causou ${damage} de dano.`);
    } else if (attacker.atk < defender.atk) {
      const damage = defender.atk - attacker.atk;
      attackerField.splice(attackerField.indexOf(attacker), 1);
      attackerIsPlayer ? state.playerLP -= damage : state.enemyLP -= damage;
      log(`${attacker.name} perdeu o ataque e levou ${damage} de dano.`);
    } else {
      attackerField.splice(attackerField.indexOf(attacker), 1);
      defenderField.splice(defenderField.indexOf(defender), 1);
      log(`Empate total: ambos destruídos.`);
    }
  }

  updateLP();
}

// Verifica se alguém venceu
export function checkVictory() {
  if (state.playerLP <= 0) {
    log("Você perdeu o duelo!");
    disableButtons();
    return true;
  }
  if (state.enemyLP <= 0) {
    log("Você venceu o duelo!");
    disableButtons();
    return true;
  }
  return false;
}
