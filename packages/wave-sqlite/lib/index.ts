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
    )`);
  },
  createTable: (collection) => {    
    let query = `CREATE TABLE IF NOT EXISTS "${collection.name}" `;
    const params: string[] = [];
    for (const key in collection._model) {
      const value = collection._model[key];
      const p = value[0];
      const type = p === String ? 'TEXT' : p === Number ? 'INTEGER' : 'TEXT';
      let built = `${key} ${type}`;
      if (value.includes('PrimaryKey')) built += " PRIMARY KEY";
      params.push(built);
    }
    query += `(${params.join(', ')})`;
    return new Promise((resolve, reject) => {
      db.run(query, (err) => {
        if (err) return reject(err);
        else return resolve(true);
      });
    });
  },
  createDocument: (collection, payload: Object) => {
    const keys = Object.keys(payload);
    const values = Object.values(payload);
    let query = `INSERT INTO "${collection.name}" (${keys.join(', ')}) VALUES (`;
    values.forEach(() => query += query.endsWith('?') ? ',?' : '?');
    query += ')';
    return new Promise((resolve, reject) => {
      db.run(query, values, (err) => {
        if (err) return reject(err);
        else return resolve(true);
      });
    });
  },
  findById: async function (collection, id) {
    let query = `SELECT * from "${collection.name}" WHERE "${collection.primaryKey}"=?`;
    return new Promise((resolve, reject) => {
      db.all(query, [id], (err, rows) => {
        if (err) return reject(err);
        else return resolve(rows[0]);
      });
    });
  },
  findByIndex: () => undefined
}

export default SqliteStorage;
module.exports = SqliteStorage;