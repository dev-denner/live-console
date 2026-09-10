# F5.2 — OpenDesign visual foundation

## Status

Proposta de integração local, anterior à F6. Esta fase formaliza o sistema visual V1 como um pacote consumível por agentes e por componentes Angular; não altera regras de catálogo nem cria dependência de nuvem.

## Objetivo

Transformar a direção visual já validada em F3 em um contrato OpenDesign versionável, para que redesigns e novas telas do Live Console mantenham a mesma linguagem visual, acessibilidade e comportamento de diálogo.

## Registro de contexto

A decisão foi conferida no projeto Supabase pessoal `denner-memory-chat` (`dzkbkdqlwgknrrlbqhun`), na memória **“OpenDesign — referência para evolução visual do Live Console”**. O registro define OpenDesign como capacidade candidata para redesign, Design System e component specs; não como autoridade do produto. A implementação local segue essa fronteira e mantém revisão humana obrigatória.

## Resultado esperado

- pacote `design-systems/live-console/` com `manifest.json`, `DESIGN.md` e `tokens.css`;
- documentação explícita de cores, tipografia, espaçamento, estados, acessibilidade e anti-padrões;
- tokens consumidos pela folha global do frontend, sem duplicação de valores;
- teste automatizado que detecta pacote incompleto ou divergência de tokens essenciais;
- evidência de que `/legacy`, APIs, SQLite, mídia e `xEmLives` permanecem intactos.

## Escopo

Incluído:

- contrato local inspirado no formato de Design System Project do OpenDesign;
- ligação dos tokens canônicos ao Angular V1;
- documentação para uso por agentes e revisão humana;
- testes de estrutura e build.

Fora do escopo:

- instalar ou hospedar o aplicativo OpenDesign;
- enviar código, catálogo, letras ou mídia para serviços externos;
- redesenhar F6, blocos ou montagem de lives;
- alterar contratos de API, migrations, legado ou lógica de negócio;
- aceitar qualquer saída gerada por agente sem validação humana.

## Critérios de aceite

1. O pacote OpenDesign possui manifest válido, `DESIGN.md` substantivo e tokens canônicos.
2. O frontend continua compilando e usa os tokens do pacote.
3. Acessibilidade e regras de diálogo documentadas em F3 continuam explícitas.
4. Testes, typecheck, lint, build e `git diff --check` passam.
5. Nenhum arquivo pessoal, banco, mídia ou segredo entra no diff.

## Referências

- OpenDesign: [Design Systems authoring guide](https://github.com/nexu-io/open-design/blob/main/docs/design-systems.md).
- OpenDesign: [design-system package contract](https://github.com/nexu-io/open-design/tree/main/design-systems).
