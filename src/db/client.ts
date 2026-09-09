import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema.js';

/** Adapter incremental: Drizzle consulta o mesmo DatabaseSync e as migrations SQL continuam autoridade. */
export function createDrizzleClient(sqlite: { prepare(sql:string): { all(...p:unknown[]): unknown[]; get(...p:unknown[]): unknown; run(...p:unknown[]): unknown } }) {
  return drizzle(async (sql, params, method) => {
    const statement=sqlite.prepare(sql);
    if(method==='all'||method==='values') return { rows: statement.all(...params) };
    if(method==='get') { const row=statement.get(...params); return { rows: row?[row]:[] }; }
    statement.run(...params); return { rows: [] };
  }, { schema });
}
