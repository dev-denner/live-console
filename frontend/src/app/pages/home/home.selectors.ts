import { HomeLive, HomeMusic } from './home.models';

const QUEUE_STATUS = 'em_execucao';
const UPCOMING_STATUSES = new Set(['rascunho', 'fechado', 'em_execucao']);

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  fechado: 'Fechado',
  em_execucao: 'Em execução',
  executado: 'Executada',
  cancelado: 'Cancelada'
};

export function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function parseLiveDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function selectNextLive(lives: readonly HomeLive[], now: Date = new Date()): HomeLive | null {
  const inQueue = lives.find((live) => live.status === QUEUE_STATUS);
  if (inQueue) return inQueue;

  const upcoming = lives
    .filter((live) => UPCOMING_STATUSES.has(live.status))
    .map((live) => ({ live, date: parseLiveDate(live.data) }))
    .filter((entry): entry is { live: HomeLive; date: Date } => entry.date !== null && entry.date.getTime() >= now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return upcoming[0]?.live ?? null;
}

export function selectRecentLives(lives: readonly HomeLive[], limit = 5): HomeLive[] {
  return lives.slice(0, limit);
}

export function selectTopPlayed(musicas: readonly HomeMusic[], limit = 5): HomeMusic[] {
  return musicas
    .filter((music) => music.xEmLives > 0)
    .sort((a, b) => b.xEmLives - a.xEmLives)
    .slice(0, limit);
}
