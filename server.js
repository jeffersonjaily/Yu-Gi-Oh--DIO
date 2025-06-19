// server.js
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Ajuste para seu domínio/localhost
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Armazena estado simples das salas (você pode ampliar)
const rooms = {};

// Quando um cliente conecta
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    console.log(`${socket.id} entrou na sala ${roomId}`);
    socket.join(roomId);

    // Cria sala se não existir
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: []
      };
    }

    // Registra jogador na sala
    if (!rooms[roomId].players.includes(socket.id)) {
      rooms[roomId].players.push(socket.id);
    }

    // Se a sala tiver 2 jogadores, inicia o jogo
    if (rooms[roomId].players.length === 2) {
      io.to(roomId).emit('start-game', rooms[roomId].players);
      console.log(`Sala ${roomId} iniciando jogo para 2 jogadores`);
    }
  });

  socket.on('play-card', ({ roomId, card }) => {
    console.log(`Jogador ${socket.id} jogou carta na sala ${roomId}`);
    // Repasse para o oponente (broadcast exceto quem enviou)
    socket.to(roomId).emit('opponent-played-card', card);
  });

  socket.on('attack', ({ roomId, ...attackData }) => {
    console.log(`Jogador ${socket.id} atacou na sala ${roomId}`);
    socket.to(roomId).emit('opponent-attack', attackData);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
    // Remove jogador de todas as salas
    for (const roomId in rooms) {
      const players = rooms[roomId].players;
      const index = players.indexOf(socket.id);
      if (index !== -1) {
        players.splice(index, 1);
        io.to(roomId).emit('player-disconnected', socket.id);
        // Se sala vazia, remove
        if (players.length === 0) {
          delete rooms[roomId];
        }
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
