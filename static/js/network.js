// static/js/network.js

import { state } from './state.js';
import { log, disableButtons, enableButtons } from './utils.js';
import { renderField } from './render.js';
import { enemyTurn } from './events.js';

import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

let socket;
let roomId;

const enemyFieldDiv = document.getElementById("enemy-field");

export function initSocket(onConnected) {
  roomId = prompt("Digite o código da sala:");
  socket = io("http://localhost:3000");

  socket.on('connect', () => {
    log(`Conectado ao servidor. Entrando na sala: ${roomId}`);
    socket.emit('join-room', roomId);
  });

  socket.on('start-game', (players) => {
    log('Jogo multiplayer iniciado!');
    onConnected();
  });

  socket.on('opponent-played-card', (card) => {
    log(`Oponente jogou ${card.name}`);
    state.enemyField.push(card);
    renderField(state.enemyField, enemyFieldDiv, true);
  });

  socket.on('opponent-attack', (attackData) => {
    log('Oponente atacou!');
    // Aqui você pode processar o ataque se necessário
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
