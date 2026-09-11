# F7.1 — Especificação técnica

## Fronteiras de runtime

- Fonte Angular: `frontend/src/app/pages/importacao/`.
- Rota Angular: `importacao`, sob o shell V1.
- URL pública esperada: `/v1/importacao`.
- Base href do bundle: `/v1/`.
- Artefato servido: `frontend/dist/live-console-v1/browser`.
- Fallback do servidor: qualquer rota `/v1/*` sem arquivo estático deve receber o `index.html` V1.
- APIs: `/api/importacao/previa`, `/api/importacao/confirmar`, `/api/exportacao`.
- Compatibilidade: `/legacy` permanece isolado e usa o HTML/JavaScript legado.

## Diagnóstico obrigatório

O Codex deve verificar antes de editar:

1. `git status`, branch e commit em execução;
2. existência e conteúdo do bundle em `frontend/dist/live-console-v1/browser`;
3. se `npm run build` foi executado depois das alterações F7;
4. resposta HTTP de `/v1`, `/v1/importacao`, `/v1/main.js` ou equivalente e dos assets CSS;
5. console do navegador e erros de rede ao abrir `/v1/importacao`;
6. existência do item `Importar` no DOM e no CSS visível;
7. comportamento de refresh direto em `/v1/importacao`;
8. se o servidor em execução está usando o mesmo worktree e o mesmo artefato recém-gerado.

O diagnóstico deve identificar a causa concreta. Não aceitar como correção apenas alterar o texto de um teste estático.

## Regras de implementação

- Preferir corrigir a cadeia fonte → build → servidor antes de duplicar páginas ou criar atalhos.
- Se houver erro no fallback, manter o `index.html` V1 como resposta para rotas de cliente dentro de `/v1`.
- Não mover a tela para `/legacy`.
- Não expor `ativo`, `principal` ou os campos históricos no contrato V1.
- Manter `status` booleano, `versoes[]`, duração dentro da versão e merge aditivo.
- Se o componente já estiver correto, corrigir o motivo de o artefato servido estar desatualizado e documentar o comando necessário.

## Testes exigidos

- teste unitário/integração confirmando a rota Angular e o item de navegação;
- teste de servidor/build confirmando que `/v1/importacao` recebe o shell V1;
- smoke test HTTP após build;
- jornada real no navegador: abrir `/v1`, clicar `Importar`, selecionar fixture, validar prévia, confirmar e observar sucesso;
- refresh direto em `/v1/importacao`;
- regressão de `/legacy`;
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` e `git diff --check`.

## Evidência mínima

Registrar URL, viewport, commit/build servido, passos executados, resultado observado e eventuais limitações. Uma captura ou inspeção de DOM deve provar que a página ficou visível; código-fonte sozinho não é evidência suficiente.
