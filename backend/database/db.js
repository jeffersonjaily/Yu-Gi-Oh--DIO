import pkg from 'pg';
const { Pool } = pkg;

// Substitua pela sua string do Render (PostgreSQL)
const pool = new Pool({
  connectionString: 'postgresql://yu_gi_oh_dio_user:vozIPh9HGOBb1dJmcNRa7Qc0jefMowZi@dpg-d1c3ah6r433s73826upg-a/yu_gi_oh_dio',
  ssl: {
    rejectUnauthorized: false // Importante para conexões externas como Render
  }
});

// Inicializa a tabela de usuários
export async function initializeDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        deck TEXT DEFAULT '[]'
      );
    `);
    console.log('Banco de dados PostgreSQL conectado e tabela pronta!');
  } catch (err) {
    console.error('Erro ao inicializar o banco:', err);
  }
}

export default pool;
