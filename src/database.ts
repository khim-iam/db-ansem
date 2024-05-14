// import sqlite3 from 'sqlite3';

// const db = new sqlite3.Database('./punches.db');

// db.serialize(() => {
//   db.run(`CREATE TABLE IF NOT EXISTS punch_slots (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     walletAddress TEXT,
//     punches INTEGER,
//     used BOOLEAN DEFAULT FALSE,
//     transactionSignature TEXT UNIQUE
//   )`);
// });

// export default db;

import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./punches.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS punch_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    walletAddress TEXT,
    punches INTEGER,
    used BOOLEAN DEFAULT FALSE,
    transactionSignature TEXT UNIQUE
  )`);
});

export default db;