// static/js/render.js

import { state } from './state.js';
import { DOM } from './constants.js';
import {
  log,
  enablePlayerActionButtons,
  disablePlayerActionButtons,
  updateLP,
  disableButtons,
  enableButtons
} from './utils.js';
import { executeAttack, checkVictory } from './play.js';
import { enemyTurn } from './events.js';

export function renderField(field, container, isEnemy = false) {
  container.innerHTML = '';

  field.forEach((card, index) => {
    const img = document.createElement("img");
    img.src = isEnemy && !state.attackModeActive
      ? state.cardBackImage
      : card.card_images[0].image_url;

    img.title = `${card.name}\nATK: ${card.atk} / DEF: ${card.def}\nModo: ${card.mode || "attack"}`;
    img.style.cursor = "pointer";
    img.classList.remove("card-zoomed");

    if (isEnemy) {
      img.onclick = () => {
        if (
          state.currentTurn !== 'player' ||
          !state.attackModeActive ||
          state.selectedPlayerCardIndex === null
        ) return;

        const attacker = state.playerField[state.selectedPlayerCardIndex];
        const defender = state.enemyField[index];

        zoomCard(img);
        zoomCard(DOM.playerFieldDiv.querySelectorAll("img")[state.selectedPlayerCardIndex]);

        setTimeout(() => {
          executeAttack(attacker, defender, state.playerField, state.enemyField, true);
          state.attackModeActive = false;
          state.selectedPlayerCardIndex = null;
          disablePlayerActionButtons();
          renderField(state.playerField, DOM.playerFieldDiv, false);
          renderField(state.enemyField, DOM.enemyFieldDiv, true);
          updateLP();

          if (!checkVictory()) {
            state.currentTurn = 'enemy';
            disableButtons();
            setTimeout(enemyTurn, 1500);
            log("Turno inimigo...");
          }
        }, 800);
      };
    } else {
      img.onclick = () => {
        if (state.currentTurn !== 'player' || state.attackModeActive) return;

        if (state.selectedPlayerCardIndex === index) {
          state.selectedPlayerCardIndex = null;
          disablePlayerActionButtons();
          log("Nenhuma carta selecionada.");
        } else {
          state.selectedPlayerCardIndex = index;
          enablePlayerActionButtons();
          log(`Carta ${card.name} selecionada. Escolha Atacar, Defender ou Descartar.`);
        }
        renderField(state.playerField, DOM.playerFieldDiv, false);
      };
    }

    if (!isEnemy && state.selectedPlayerCardIndex === index) {
      img.classList.add("selected");
    }

    container.appendChild(img);
  });
}
