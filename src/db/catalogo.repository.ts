import { eq } from 'drizzle-orm';
import { musicas } from './schema.js';
export const catalogoRepository = { porId: (db: ReturnType<typeof import('./client.js').createDrizzleClient>, id:string) => db.select().from(musicas).where(eq(musicas.id,id)) };
