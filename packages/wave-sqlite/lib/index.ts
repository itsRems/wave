import { join } from 'path';
import { cwd } from 'process';
import sqlite from "sqlite3";

let db: sqlite.Database;

const SqliteStorage = {
  initialize: async function () {
    console.log(`[Wave-Sqlite] Initiliazing !`);
    db = new sqlite.Database(join(`${cwd()}/wavedb.sqlite`));
    db.run(`CREATE TABLE IF NOT EXISTS wave_internal_migrations (
      id INTEGER PRIMARY KEY,
      value TEXT NOT NULL
    )`, (test) => {
      console.log(test);
    });
  },
  createDocument: () => undefined,
  findById: () => undefined,
  findByIndex: () => undefined
}

export default SqliteStorage;
module.exports = SqliteStorage;