import Database from "better-sqlite3";

// This creates (or opens) a file called bookshelf.db
const db = new Database("bookshelf.db");

// Create our books table if it doesn't exist yet
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    isFinished INTEGER DEFAULT 0
  )
`);

// Create the authors table
db.exec(`
  CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )
`);

// Add authorId column to books (links a book to an author)
// Wrapped in try/catch because it errors if the column already exists
try {
  db.exec(`ALTER TABLE books ADD COLUMN authorId INTEGER`);
} catch (e) {
  // Column already exists — safe to ignore
}

export default db;