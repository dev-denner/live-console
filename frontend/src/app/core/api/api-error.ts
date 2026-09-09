export interface ApiError {
  code: string;
  message: string;
  status: number | null;
  details?: unknown;
}

export interface HttpFailureShape {
  status?: unknown;
  statusText?: unknown;
  error?: unknown;
  message?: unknown;
  url?: unknown;
}

const statusCodeMap: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  404: 'NOT_FOUND',
  409: 'CONFLICT'
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function statusFrom(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function messageFrom(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function normalizeApiError(input: unknown): ApiError {
  const failure = isRecord(input) ? input as HttpFailureShape : {};
  const status = statusFrom(failure.status);
  const body = failure.error;
  const bodyRecord = isRecord(body) ? body : undefined;
  const bodyError = bodyRecord?.['error'];
  const nestedError = bodyRecord && isRecord(bodyError) ? bodyError : undefined;
  const structured = nestedError ?? bodyRecord;
  const structuredCode = structured ? messageFrom(structured['code']) : undefined;
  const code = structuredCode
    ? structuredCode
    : status === 0
      ? 'NETWORK_ERROR'
      : status !== null && statusCodeMap[status]
        ? statusCodeMap[status]
        : 'INTERNAL_ERROR';
  const structuredMessage = structured ? messageFrom(structured['message']) : undefined;
  const bodyMessage = messageFrom(bodyError);
  const plainBodyMessage = typeof body === 'string' && !/<\/?[a-z][^>]*>/i.test(body) ? messageFrom(body) : undefined;
  const message = structuredMessage
    ?? bodyMessage
    ?? plainBodyMessage
    ?? (status === 0 ? 'Não foi possível conectar ao backend local.' : undefined)
    ?? (status !== null && status > 0 ? `A API respondeu com HTTP ${status}.` : undefined)
    ?? 'Não foi possível concluir a comunicação com o backend local.';
  const details = structured?.['details'] ?? (bodyRecord && !('error' in bodyRecord) ? bodyRecord : undefined);

  return { code, message, status, ...(details === undefined ? {} : { details }) };
}

export function invalidResponseError(message = 'A API retornou um payload inválido.'): ApiError {
  return { code: 'INVALID_RESPONSE', message, status: null };
}
