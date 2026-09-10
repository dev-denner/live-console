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
export const musicRegistrationVersionSchema = z.object({
  id: z.string().uuid().optional(), nome: z.string().trim().min(1), ordem: z.number().int().positive(),
  tipo: z.enum(['youtube', 'audio', 'video']), referencia: z.string().min(1), stagingId: z.string().uuid().optional(),
  duracao: z.number().int().nonnegative().nullable().optional(), abertura: z.boolean().default(false)
}).strict();
export const musicRegistrationSchema = z.object({
  id: z.string().uuid().optional(), titulo: z.string().trim().min(1), artista: z.string().trim().min(1),
  genero: z.string().trim().nullable().optional(), origem: z.string().trim().nullable().optional(),
  observacoes: z.string().nullable().optional(), autoral: z.boolean().default(false), ativo: z.boolean().default(true),
  letraMarkdown: z.string().nullable().optional(), letraCaminho: z.string().nullable().optional(),
  versoes: z.array(musicRegistrationVersionSchema).default([])
}).strict();
export type MusicRegistrationInput = z.infer<typeof musicRegistrationSchema>;
export const blocoSchema=z.object({id:z.string().uuid().optional(),nome:z.string().trim().min(1),descricao:z.string().nullable().optional()}).strict();
export const blocoPatchSchema=blocoSchema.partial().omit({id:true});
export const blocoMusicSchema=z.object({musicaId:z.string().uuid()}).strict();
export const orderSchema=z.object({ids:z.array(z.string().uuid()).min(1)}).strict();
export const montagemSchema=z.object({quantidade:z.number().int().positive(),autorais:z.number().int().nonnegative(),vibe:z.string().trim().min(1).optional(),clima:z.string().trim().min(1).optional(),objetivo:z.string().trim().min(1).optional(),blocoIds:z.array(z.string().uuid()).optional()}).strict().refine(x=>x.autorais<=x.quantidade,{message:'autorais não pode exceder quantidade',path:['autorais']});
export const execucaoActionSchema=z.object({acao:z.enum(['tocada','pulada','pendente']),idempotencyKey:z.string().uuid(),posicaoReal:z.number().int().positive().optional(),observacao:z.string().nullable().optional(),referencia:z.string().min(1).optional(),tipo:z.enum(['youtube','audio','video']).optional()}).strict();
export const idempotencySchema=z.object({idempotencyKey:z.string().uuid()}).strict();

export function messageForValidation(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'corpo'}: ${issue.message}`).join('; ');
}
