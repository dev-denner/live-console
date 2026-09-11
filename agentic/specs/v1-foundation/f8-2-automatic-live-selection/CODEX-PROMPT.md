# Prompt para o Codex — F8.2

Você está trabalhando no repositório do Live Console.

Implemente a F8.2 conforme os arquivos:

- \`agentic/specs/v1-foundation/f8-2-automatic-live-selection/PRD.md\`;
- \`TECHNICAL-SPEC.md\`;
- \`LAYOUT-SPEC.md\`;
- \`docs/aidd/adr/ADR-004-automatic-live-selection-as-draft.md\`;
- \`agentic/skills/generate-automatic-live-draft/SKILL.md\`.

## Primeiro passo obrigatório

Antes de alterar código:

\`\`\`bash
git status
git fetch origin
git switch master
git pull --ff-only origin master
\`\`\`

Depois, crie ou atualize a branch de trabalho baseada no \`origin/master\`. Não faça \`reset --hard\`, não descarte mudanças do usuário e não faça push direto em \`master\`.

Confirme que a implementação da F8.1 está disponível no \`master\`. Se a PR da F8.1 ainda não estiver incorporada, informe a dependência e não duplique a implementação anterior.

## Escopo

Implemente apenas a seleção automática que gera um rascunho editável pela F8.1.

Parâmetros:

- quantidade de referência, padrão 30;
- autorais desejadas;
- abertura opcional ou escolha automática.

Não implemente vibe, clima, objetivo, duração-alvo, execução, histórico completo, exportação Legacy ou seleção automática de versão.

## Regras essenciais

- usar \`ativo = true\`;
- usar \`musicaId\` para impedir repetição;
- não usar \`status = OK\`;
- não usar \`musicaBase\` como chave operacional;
- blocos são unidades indivisíveis;
- ordem interna dos blocos é preservada;
- músicas individuais e blocos não possuem prioridade fixa;
- YouTube, áudio e vídeo válidos são equivalentes;
- a abertura fica primeiro, fora da contagem;
- preferir abertura não usada na live anterior quando houver histórico;
- selecionar músicas, não versões;
- não alterar \`xEmLives\`.

O algoritmo deve ser finito. Nunca execute tentativas aleatórias indefinidas. Se não encontrar a quantidade solicitada, gerar a maior quantidade possível abaixo dela e exibir aviso. O usuário poderá editar o rascunho e ultrapassar a referência manualmente.

## Entrega

Inclua testes unitários/integrados e verificação browser. Atualize \`EVIDENCE.md\`, abra uma PR draft na branch de implementação e não faça merge. O corpo da PR deve usar Markdown real, com quebras de linha reais, sem sequências literais de \`\\n\`.

Antes de finalizar, execute:

\`\`\`bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
\`\`\`

Retorne o SHA do commit, a branch, a PR, os resultados dos testes e eventuais pendências.
