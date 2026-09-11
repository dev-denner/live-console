import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeApiError } from '../frontend/src/app/core/api/api-error.ts';
import { v1Navigation } from '../frontend/src/app/layout/navigation.ts';

test('F3 normaliza erros HTTP estruturados e respostas textuais', () => {
  assert.deepEqual(normalizeApiError({ status: 422, error: { error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos.', details: { campo: 'titulo' } } } }), {
    code: 'VALIDATION_ERROR', status: 422, message: 'Dados inválidos.', details: { campo: 'titulo' }
  });
  assert.deepEqual(normalizeApiError({ status: 404, error: 'Não encontrado' }), {
    code: 'NOT_FOUND', status: 404, message: 'Não encontrado'
  });
  assert.deepEqual(normalizeApiError({ status: 500, error: '<html>falha</html>' }), {
    code: 'INTERNAL_ERROR', status: 500, message: 'A API respondeu com HTTP 500.'
  });
  assert.deepEqual(normalizeApiError({ status: 0, message: 'Failed to fetch' }), {
    code: 'NETWORK_ERROR', status: 0, message: 'Não foi possível conectar ao backend local.'
  });
});

test('V1 publica as fronteiras de navegação do shell', () => {
  assert.deepEqual(v1Navigation.map((item) => item.path), [
    'catalogo', 'lives', 'blocos', 'importacao', 'execucao'
  ]);
  assert.deepEqual(v1Navigation.map((item) => item.label), ['Catálogo', 'Lives', 'Blocos', 'Importar', 'Execução']);
});
