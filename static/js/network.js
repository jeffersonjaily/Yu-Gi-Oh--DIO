// static/js/network.js

import { state, log, renderField, DOM, enableButtons, disableButtons } from './state.js';
import { renderField as render } from './render.js';
import { enemyTurn } from './events.js';

import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

let socket;
let roomId;

export function initSocket(onConnected) {
  roomId = prompt("Digite o código da sala:");
  socket = io("http://localhost:3000"); // Ajuste URL do seu servidor

  socket.on('connect', () => {
    log(`Conectado ao servidor. Entrando na sala: ${roomId}`);
    socket.emit('join-room', roomId);
  });

  socket.on('start-game', (players) => {
    log('Jogo multiplayer iniciado!');
    onConnected();
  });

  // Quando o oponente jogar uma carta
  socket.on('opponent-played-card', (card) => {
    log(`Oponente jogou ${card.name}`);
    // Atualiza campo inimigo
    state.enemyField.push(card);
    render(state.enemyField, DOM.enemyFieldDiv, true);
  });

  // Quando o oponente atacar
  socket.on('opponent-attack', (attackData) => {
    // attackData deve conter info dos cards envolvidos
    // Atualize o estado e campos conforme necessário
    log('Oponente atacou!');
    // Pode chamar enemyTurn ou outra lógica para atualizar
  });

  socket.on('disconnect', () => {
    log('Você foi desconectado do servidor.');
    disableButtons();
  });
}

export function sendPlayCard(card) {
  if (!socket || !socket.connected) return;
  socket.emit('play-card', { roomId, card });
}

export function sendAttack(attackData) {
  if (!socket || !socket.connected) return;
  socket.emit('attack', { roomId, ...attackData });
}
