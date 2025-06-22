// backend/models/User.js
import { getDB } from '../database/db.js';
import bcrypt from 'bcrypt';

export class User {
  static async create(username, password) {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = await db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      return { id: result.lastID, username };
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        throw new Error('Usuário já existe');
      }
      throw err;
    }
  }

  static async findByUsername(username) {
    const db = getDB();
    return await db.get('SELECT * FROM users WHERE username = ?', [username]);
  }

  static async validatePassword(username, password) {
    const user = await User.findByUsername(username);
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
  }
}
