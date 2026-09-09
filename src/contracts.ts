import { z } from 'zod';

export const sourceSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().trim().min(1),
  tipo: z.enum(['youtube', 'audio', 'video']),
  referencia: z.string().min(1),
  principal: z.boolean().optional(),
  ordem: z.number().int().positive().optional(),
  duracao: z.number().int().nonnegative().nullable().optional()
});

export const musicSchema = z.object({
  id: z.string().uuid().optional(),
  artista: z.string().trim().min(1),
  titulo: z.string().trim().min(1),
  musicaBase: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  generoPrimario: z.string().nullable().optional(),
  generoSecundario: z.string().nullable().optional(),
  xEmLives: z.number().int().nonnegative().optional(),
  origem: z.string().nullable().optional(),
  autoral: z.boolean().optional(),
  duracao: z.number().int().nonnegative().nullable().optional(),
  vibePrincipal: z.string().nullable().optional(),
  vibeSecundaria: z.string().nullable().optional(),
  temperaturaDePalco: z.string().nullable().optional(),
  bloco: z.string().nullable().optional(),
  clima: z.string().nullable().optional(),
  letra: z.string().nullable().optional(),
  fontes: z.array(sourceSchema).optional()
}).strict();

export const musicPatchSchema = musicSchema.partial().omit({ id: true, fontes: true });
export type MusicInput = z.infer<typeof musicSchema>;
export type MusicPatch = z.infer<typeof musicPatchSchema>;
export type SourceInput = z.infer<typeof sourceSchema>;
export const blocoSchema=z.object({id:z.string().uuid().optional(),nome:z.string().trim().min(1),descricao:z.string().nullable().optional()}).strict();
export const blocoPatchSchema=blocoSchema.partial().omit({id:true});
export const blocoMusicSchema=z.object({musicaId:z.string().uuid()}).strict();
export const orderSchema=z.object({ids:z.array(z.string().uuid()).min(1)}).strict();

export function messageForValidation(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'corpo'}: ${issue.message}`).join('; ');
}
