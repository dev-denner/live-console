# Prompt de implementação — F9

Você está trabalhando no repositório `dev-denner/live-console`.

Implemente a F9 conforme `PRD.md`, `TECHNICAL-SPEC.md`, `ACCEPTANCE.md`, `LAYOUT-SPEC.md`, `agentic/rules/live-console-v1.md` e `agentic/skills/execute-live-repertoire/SKILL.md`.

## Fluxo Git obrigatório

1. Execute `git status`, `git branch --show-current` e `git fetch origin`.
2. Não descarte, resete ou sobrescreva mudanças locais existentes.
3. Se a working tree estiver suja com mudanças não relacionadas, use um worktree separado.
4. Parta sempre de `origin/master` atualizado.
5. Crie ou utilize a branch `feat/f9-live-execution`.
6. Não implemente diretamente em `master`.
7. Faça commits pequenos e semânticos.
8. Execute testes, lint, typecheck, build e browser verification.
9. Publique a branch e abra uma PR para `master`.
10. Só faça merge depois de revisar a PR, corrigir falhas e confirmar todos os critérios de aceite.

## Escopo de implementação

- suportar múltiplos repertórios;
- permitir edição somente em `rascunho`;
- fechar e congelar o planejamento;
- duplicar repertórios fechados/executados com revalidação do catálogo;
- manter abertura fixa na primeira posição;
- impedir músicas duplicadas por `musicaId`;
- esconder no seletor músicas já presentes;
- permitir adição ao final;
- executar sem permitir remoção estrutural;
- permitir pular, tocar, desfazer “tocada” com confirmação e reordenar;
- permitir adicionar durante execução;
- registrar apenas a ordem real tocada;
- usar o instante do `Play` como início;
- reconciliar `xEmLives` somente ao encerrar, de forma idempotente.

Não implemente seleção automática nova, mídia externa arbitrária ou migração destrutiva do catálogo.

Ao final, informe SHA, branch, PR, arquivos alterados, comandos executados, testes, limitações e riscos restantes.
