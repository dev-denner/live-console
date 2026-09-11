# Prompt de execução para o Codex

Você está trabalhando no repositório do Live Console. A especificação da tarefa está em:

- `agentic/specs/v1-foundation/f7-1-import-visual-verification/PRD.md`
- `agentic/specs/v1-foundation/f7-1-import-visual-verification/TECHNICAL-SPEC.md`
- `agentic/specs/v1-foundation/f7-1-import-visual-verification/EVIDENCE.md`
- `docs/aidd/adr/ADR-002-v1-importacao-runtime-visual.md`
- `agentic/skills/live-console-import-visual-verification/SKILL.md`

## Tarefa

A importação V1 foi implementada no código, mas não aparece visualmente para o usuário. Investigue e corrija a causa real. Não presuma que a existência dos componentes Angular seja suficiente.

### Diagnóstico obrigatório

1. Leia os arquivos de especificação acima e as specs F7 existentes.
2. Verifique `git status`, branch, origem e estado das PRs relacionadas.
3. Inicie ou identifique o servidor local correto.
4. Execute `npm run build` e confirme que o artefato gerado é exatamente o artefato servido em `frontend/dist/live-console-v1/browser`.
5. Abra e verifique no navegador:
   - `/v1`;
   - `/v1/importacao`;
   - refresh direto em `/v1/importacao`.
6. Verifique o item `Importar`, erros de console, erros de rede, chunks, CSS, `base href` e fallback SPA.
7. Registre a causa concreta antes da correção.

### Correção

Corrija a menor camada necessária — fonte Angular, build, servidor, fallback, asset ou inicialização — para que:

- `Importar` apareça no shell V1;
- `/v1/importacao` seja uma rota navegável e recarregável;
- a seleção do JSON, prévia, relatório, confirmação e exportação sejam visíveis;
- os estados de carregamento, erro e sucesso sejam percebidos;
- a API continue usando `/api/importacao/previa`, `/api/importacao/confirmar` e `/api/exportacao`;
- o contrato V1 continue usando `status` booleano, `versoes[]`, duração na versão e merge aditivo;
- `/legacy` permaneça intacto como ponte temporária.

Não crie uma segunda importação no `/legacy`, não troque o contrato V1 para aliases históricos e não resolva o problema apenas alterando testes estáticos.

### Validação

Use uma fixture JSON versionada. Verifique no navegador:

1. abrir `/v1/importacao`;
2. selecionar a fixture;
3. clicar em `Validar prévia`;
4. conferir contagens e versões acrescentadas;
5. confirmar a importação;
6. observar a mensagem de sucesso;
7. recarregar a rota;
8. abrir `/legacy` e confirmar que continua carregando repertório antigo.

Execute:

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

Atualize `EVIDENCE.md` com causa, arquivos, comandos, URL, viewport, resultado e limitações. Adicione ou ajuste testes para evitar regressão do runtime servido.

### GitHub e entrega

Não faça merge.

1. Verifique se a PR F7 existente ainda está aberta. Se estiver, atualize a branch dela somente se esta for a branch correta da implementação; não crie PR duplicada sem necessidade.
2. Se F7 já estiver mergeada, crie uma branch semântica para F7.1 a partir de `master`.
3. Faça commits pequenos e semânticos, incluindo as specs/ADR/skill desta tarefa.
4. Publique a branch no GitHub.
5. Abra ou atualize uma PR draft para `master` e informe número, URL, branch, commits e validações.
6. Não altere `master`, não faça merge e não descarte alterações de usuário.
