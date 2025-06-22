// backend/routes/auth.js
import express from 'express';
import { User } from '../models/User.js';
import pg from 'pg';
import { sendPinEmail } from '../utils/emailService.js';

const router = express.Router();

// Conexão com PostgreSQL (Render)
const db = new pg.Client({
  connectionString: 'postgresql://yu_gi_oh_dio_user:vozIPh9HGOBb1dJmcNRa7Qc0jefMowZi@dpg-d1c3ah6r433s73826upg-a/yu_gi_oh_dio',
  ssl: { rejectUnauthorized: false }
});
await db.connect();

// Rota de cadastro local (com username/senha)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });

  try {
    const newUser = await User.create(username, password);
    res.status(201).json({ message: 'Usuário criado com sucesso!', user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rota de login local
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });

  const isValid = await User.validatePassword(username, password);
  if (!isValid)
    return res.status(401).json({ error: 'Credenciais inválidas.' });

  const user = await User.findByUsername(username);
  res.json({ message: 'Login bem-sucedido!', user: { id: user.id, username: user.username } });
});

// Rota para envio de PIN por e-mail
router.post('/send-pin', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail é obrigatório.' });

  const pin = Math.floor(100000 + Math.random() * 900000); // 6 dígitos

  try {
    await db.query(`
      INSERT INTO email_verification (email, pin, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
      ON CONFLICT (email) DO UPDATE
      SET pin = EXCLUDED.pin, expires_at = EXCLUDED.expires_at;
    `, [email, pin]);

    await sendPinEmail(email, pin);
    res.json({ message: 'PIN enviado para seu e-mail.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar PIN.' });
  }
});

// Rota para verificação de PIN
router.post('/verify-pin', async (req, res) => {
  const { email, pin } = req.body;

  if (!email || !pin)
    return res.status(400).json({ error: 'E-mail e PIN são obrigatórios.' });

  try {
    const result = await db.query(`
      SELECT * FROM email_verification
      WHERE email = $1 AND pin = $2 AND expires_at > NOW();
    `, [email, pin]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'PIN inválido ou expirado.' });
    }

    res.json({ success: true, message: 'Verificado com sucesso!', email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao verificar PIN.' });
  }
});



// Check nick availability
router.post('/check-nick', async (req, res) => {
  const { nick } = req.body;
  const user = await User.findByNick(nick); // sua função para buscar usuário pelo nick
  res.json({ available: !user });
});

// Check email availability
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  const user = await User.findByEmail(email);
  res.json({ available: !user });
});


export default router;
