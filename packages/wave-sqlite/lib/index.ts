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
  createTableIfNotExist: (collection) => {    
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
  updateDocument: async function (collection, payload: {
    id: string;
    updates: Object;
    nested?: boolean;
  }) {
    const values = Object.values(payload.updates);
    let query = `UPDATE "${collection.name}" SET `;
    const adds: string[] = [];
    for (const key in payload.updates) {
      adds.push(`${key} = ?`);
    }
    query += adds.join(', ');
    query += ` WHERE ${collection.primaryKey}=?`;
    return new Promise((resolve, reject) => {
      db.run(query, [...values, ...[payload.id]], (err) => {
        if (err) return reject(err);
        else return resolve(true);
      });
    });
  },
  deleteDocument: async function (collection, id) {
    const query = `DELETE FROM "${collection.name}" WHERE ${collection.primaryKey} = ?`;
    return new Promise((resolve, reject) => {
      db.run(query, [id], (err) => {
        if (err) return reject(err);
        return resolve(true);
      });
    })
  },
  find: async function (collection, match: any) {
    const [keys, values] = [Object.keys(match), Object.values(match)];
    const query = `SELECT * FROM "${collection.name}" WHERE ${keys.join(' = ?,')} = ?`;
    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) return reject(err);
        return resolve(rows);
      })
    })
  },
  findOne: async function (collection, match: any) {
    const [keys, values] = [Object.keys(match), Object.values(match)];
    const query = `SELECT * FROM "${collection.name}" WHERE ${keys.join(' = ?,')} = ? LIMIT 1`;
    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) return reject(err);
        return resolve(rows[0]);
      })
    })
  },
  findByIndex: async function (collection, payload: {
    index: string;
    value: any;
  }) {
    const query = `SELECT * FROM "${collection.name}" WITH(INDEX("${makeIndexName(collection, payload.index)}")) WHERE ${payload.index} = ?`;
    console.log(query);
    return new Promise((resolve, reject) => {
      db.all(query, [payload.value], (err, rows) => {
        if (err) return reject(err);
        return resolve(rows[0]);
      })
    });
  },
  createIndex: async function (collection, indexKey) {
    const query = `CREATE INDEX IF NOT EXISTS "${makeIndexName(collection, indexKey)}" ON "${collection.name}" (${indexKey}) `;
    return new Promise((resolve, reject) => {
      db.run(query, (err) => {
        if (err) return reject(err);
        return resolve(true);
      });
    });
  }
}

function makeIndexName (collection, indexKey) {
  return `${collection.name}-${indexKey}-wave-index`;
}

export default SqliteStorage;
module.exports = SqliteStorage;