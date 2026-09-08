import { openDatabase } from './db.mjs';
import { resolve } from 'node:path';
const db = openDatabase(resolve('data/live-console.sqlite'));
db.close();
console.log('Migrations aplicadas.');
