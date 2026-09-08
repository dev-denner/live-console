import { DatabaseSync } from 'node:sqlite';
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) throw new Error('Live Console requer Node.js 22.13.0 ou superior para node:sqlite.');
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE runtime_check (ok INTEGER)');
db.close();
