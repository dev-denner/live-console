# ADR-002 — A importação V1 deve ser uma rota real do bundle servido

## Status

Aceita para F7.1

## Contexto

O código-fonte da tela de importação pode existir sem estar presente no artefato Angular que o servidor local entrega. Isso cria uma falsa sensação de implementação concluída: testes que leem arquivos passam, mas o operador não vê a funcionalidade.

O Live Console possui dois mundos temporários: a V1 em `/v1` e o console antigo em `/legacy`. A V1 precisa ser validada no runtime real, enquanto o legado permanece isolado.

## Decisão

1. A tela canônica de importação fica em `/v1/importacao`.
2. O servidor deve servir o build Angular de `frontend/dist/live-console-v1/browser` para essa rota e para refresh direto.
3. O item `Importar` deve ser parte da navegação do shell V1.
4. A validação de F7.1 exige navegador após build, não apenas inspeção de fonte.
5. `/legacy` permanece somente como adaptador temporário dos repertórios antigos e não recebe a tela V1.

## Consequências

- Mudanças no frontend exigem rebuild antes da validação visual.
- O diagnóstico precisa distinguir erro de código, erro de build, artefato obsoleto e servidor incorreto.
- Será possível remover `/legacy` futuramente sem migrar seus campos para o contrato V1.

## Alternativas rejeitadas

- Criar uma segunda página de importação no HTML legado.
- Considerar a existência do arquivo Angular como prova de disponibilidade ao usuário.
- Corrigir somente testes estáticos sem comprovar a rota servida.
