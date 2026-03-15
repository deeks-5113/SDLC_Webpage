import Database from 'better-sqlite3';
import path from 'path';

// Connect to SQLite database
// The db file will be created in the project root if it doesn't exist
const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'sdlc_auditor.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize database schema
export const initDb = () => {
  // Create Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);

  // Create AssessmentResults table
  db.exec(`
    CREATE TABLE IF NOT EXISTS AssessmentResults (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      phase_1_score INTEGER DEFAULT 0,
      phase_2_score INTEGER DEFAULT 0,
      phase_3_score INTEGER DEFAULT 0,
      phase_4_score INTEGER DEFAULT 0,
      phase_5_score INTEGER DEFAULT 0,
      friction_feedback TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id)
    );
  `);
};

// Initialize schema on module load
initDb();

export default db;
