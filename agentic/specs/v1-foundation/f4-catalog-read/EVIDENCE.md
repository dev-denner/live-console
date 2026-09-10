# Evidências F4

## Estado

Implementação concluída localmente na branch `feat/foundation-f4-catalog-read`, originada do `master` pós-PR #31. Esta entrega é para PR draft; não fazer merge.

## Diagnóstico e escopo

- Reutilizado `GET /api/musicas`; nenhum endpoint novo foi necessário.
- Nenhuma migration, tabela, banco, mídia, repertório ou dado pessoal foi criado/alterado.
- Alterações de produto ficam em `frontend/src/app/pages/catalogo/` e na rota V1; o teste de integração é sintético e usa banco temporário em `/tmp`.
- `legacy/`, HTML antigo da raiz e as quatro fronteiras V1 foram preservados.

## Arquivos alterados

- `frontend/src/app/app.routes.ts` — troca do placeholder por `CatalogoPageComponent`.
- `frontend/src/app/pages/catalogo/catalogo.models.ts` — modelos do payload e filtros.
- `frontend/src/app/pages/catalogo/catalogo.service.ts` — cliente de leitura, query string e validação.
- `frontend/src/app/pages/catalogo/catalogo-page.component.ts/.html/.css` — tela, estados, filtros e responsividade.
- `test/foundation-f4.test.mjs` — unidade de semântica e integração HTTP com os cinco filtros.

## Comandos

| Comando | Resultado |
| --- | --- |
| `npm run build` | **OK** — Angular production e backend compilados |
| `npm run typecheck` | **OK** |
| `npm run lint` | **OK** — script atual executa typecheck |
| `npm test` | **OK** — 22 testes, 0 falhas |
| `git diff --check` | **OK** |

## Browser

Sessão: `f4-catalog-read-20260909`.

- sucesso/listagem: [screenshot](/tmp/f4-catalog-success.png)
- loading/skeleton: o estado foi verificado no primeiro ciclo de renderização; a captura imediata não é estável devido à resposta local rápida.
- vazio com filtros: [screenshot](/tmp/f4-catalog-empty.png)
- erro: [screenshot](/tmp/f4-catalog-error.png)
- retry recuperado: [screenshot](/tmp/f4-catalog-retry.png)
- tablet: [screenshot](/tmp/f4-catalog-tablet.png)
- regressão legacy: [screenshot](/tmp/f4-legacy-regression.png)

Interações verificadas: `status=OK` reduziu a lista para 1 música; busca sem correspondência mostrou o estado vazio; mock de abort da API mostrou erro e `Tentar novamente`; removendo o mock e acionando retry recuperou 2 músicas; viewport tablet `1024×768` manteve filtros e tabela utilizáveis.

## Auditoria final UX/acessibilidade

Revisão final aplicada aos arquivos da tela: labels e nomes de controle, foco visível herdado, skip link, `aria-live`, `role=alert`, tabela semântica, `autocomplete="off"`, placeholder com reticências, `prefers-reduced-motion`, estados de erro com próximo passo e números tabulares. O axe reportou **0 violações** e 22 passes; 1 grupo de contraste ficou como incomplete para revisão manual em elementos herdados do shell, sem violações automáticas.
