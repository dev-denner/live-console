# Diagnóstico e evolução v1.1 local

## Estado atual verificado

O diagnóstico anterior descrevia o baseline inicial e já não correspondia ao
repositório. Hoje a aplicação é uma migração incremental com:

- Node.js ESM/TypeScript estrito, Fastify e validação de fronteira com Zod;
- SQLite local com migrations SQL e repositórios Drizzle em `src/db/`;
- catálogo, importação/exportação, uploads, blocos, lives, rascunhos e execução
  implementados no backend;
- frontend Angular separado em `frontend/`, com shell V1 em `/v1` e console
  legado preservado em `/legacy`;
- 61 testes automatizados cobrindo catálogo, compatibilidade, blocos, lives,
  importação e execução.

O contrato de compatibilidade continua sendo relevante: URLs e caminhos são
opacos, o formato legado preserva `youtube`, `arquivo`, `letra`, `observacao` e
`interacoes`, e `xEmLives` só muda no encerramento confirmado da execução.

## Evidência da revisão

Em 2026-09-19, após instalar as dependências locais, `npm test` executou 61
testes: 59 passaram e 2 não chegaram às asserções porque o sandbox bloqueou a
abertura de `127.0.0.1` com `listen(2)`. O `tsc --noEmit` do backend passou. O
typecheck do frontend não concluiu porque o ambiente abortou ao iniciar o
binário nativo do `esbuild`; isso é uma limitação de validação do ambiente e
deve ser repetido em uma máquina com os scripts de instalação permitidos.

## Melhorias prioritárias

1. **Desbloquear a validação executável.** Tornar os testes HTTP capazes de
   usar `app.inject()` ou um transporte de teste, evitando depender de uma
   porta local. Repetir também o build/typecheck Angular em ambiente com
   `esbuild` funcional. Isso aumenta a confiabilidade da regressão sem mudar o
   contrato de produção.
2. **Manter evidência de navegador para a V1.** As specs exigem jornada real
   no browser; smoke HTTP isolado não prova estados loading, vazio, erro,
   acessibilidade e edição. Cada nova tela deve atualizar sua `EVIDENCE.md`.
3. **Reduzir deriva documental.** Este arquivo deve ser atualizado junto de
   mudanças de fase; as specs históricas continuam sendo evidência do momento
   em que foram produzidas e não devem ser reinterpretadas como estado atual.
4. **Revisar tipagem do servidor por fatias.** Há pontos legados com tipos
   amplos (`any`) em mapeadores de resposta. Removê-los gradualmente, com
   testes de contrato, é preferível a uma refatoração transversal.

## Melhorias aplicadas nesta revisão

Foi corrigido somente este diagnóstico para refletir o estado real, registrar
as limitações de validação observadas e ordenar os próximos passos. Nenhuma
configuração externa, dado local, migration, regra de domínio ou código de
produção foi alterado.
