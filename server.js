// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDB } from './backend/database/db.js';
import authRoutes from './backend/routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App e servidor
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());

// ---------- Banco ----------
initializeDB();

// ---------- Rotas API ----------
app.use('/api/auth', authRoutes);
app.get('/api', (req, res) => res.send('API do jogo está funcionando!'));

// ---------- Rotas estáticas ----------
app.use(express.static(path.join(__dirname, 'public')));

// HTMLs (login, dashboard)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'dashboard.html'));
});

// ---------- Socket.io ----------
const rooms = {};

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = { players: [] };
    if (!rooms[roomId].players.includes(socket.id)) {
      rooms[roomId].players.push(socket.id);
    }

    if (rooms[roomId].players.length === 2) {
      io.to(roomId).emit('start-game', rooms[roomId].players);
    }
  });

  socket.on('play-card', ({ roomId, card }) => {
    socket.to(roomId).emit('opponent-played-card', card);
  });

  socket.on('attack', ({ roomId, ...attackData }) => {
    socket.to(roomId).emit('opponent-attack', attackData);
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const index = rooms[roomId].players.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomId].players.splice(index, 1);
        io.to(roomId).emit('player-disconnected', socket.id);
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        }
      }
    }
  });
});

// ---------- Inicia servidor ----------
httpServer.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
