    import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function initializeDB() {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      deck TEXT DEFAULT '[]'
    )
  `);

  console.log('Banco de dados inicializado.');
}

export function getDB() {
  if (!db) throw new Error('Database not initialized.');
  return db;
}
