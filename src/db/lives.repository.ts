import { eq } from 'drizzle-orm';
import { lives } from './schema.js';
export const livesRepository = { porId: (db: ReturnType<typeof import('./client.js').createDrizzleClient>, id:string) => db.select().from(lives).where(eq(lives.id,id)) };
