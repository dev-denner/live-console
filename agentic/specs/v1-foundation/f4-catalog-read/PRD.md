# F4 — Leitura do catálogo

## Status

Implementação em branch `feat/foundation-f4-catalog-read`, iniciada a partir do `master` após o merge da PR #31 (`b9c5726`).

## Objetivo

Entregar a primeira tela de trabalho da V1 em `/v1/catalogo`: consultar músicas do catálogo local, encontrar uma música por título ou artista e reduzir a lista por status, autoral, bloco e clima.

## Problema

O shell V1 já possui navegação, mas o catálogo ainda é um placeholder. A equipe precisa ler os dados existentes com rapidez, sem criar uma segunda fonte de verdade nem expor as telas legadas.

## Resultado esperado

- listagem ordenada por artista e título;
- busca por título/artista;
- filtros de status, autoral, bloco e clima;
- leitura de artista, título, status, mídia, versão, música-base e xEmLives;
- loading, sucesso, vazio, erro e retry claros;
- uso confortável em notebook e tablet;
- `/v1/lives`, `/v1/blocos`, `/v1/execucao` e `/legacy` preservados.

## Escopo incluído

- componente Angular standalone de catálogo;
- cliente HTTP e modelos TypeScript strict;
- consumo do `GET /api/musicas` somente leitura já existente;
- testes unitário, integração HTTP e browser;
- evidências com screenshots.

## Fora do escopo

Cadastro, edição, exclusão, upload, importação, exportação, geração automática, reprodução de mídia, migração de framework, mudanças em `legacy/`, HTML antigo da raiz, schema, migrations ou dados locais.

## Critérios de aceite

1. `/v1/catalogo` lista o retorno real da API e não contém fixture pessoal.
2. Cada filtro é enviado ao endpoint sem normalizar destrutivamente o contrato.
3. Os cinco estados são distinguíveis e o erro permite retry.
4. A API permanece somente leitura e as quatro rotas V1 existentes continuam navegáveis.
5. Build, typecheck, lint, testes, `git diff --check`, browser e regressão `/legacy` passam.
