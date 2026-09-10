# F5.2 — Especificação técnica

## Fronteiras

Alterações permitidas:

- `design-systems/live-console/`;
- `frontend/src/styles.css`;
- testes do contrato OpenDesign;
- esta pasta de especificação;
- atualização mínima do índice da foundation.

Não alterar `legacy/`, páginas HTML da raiz, `server.ts`, `src/`, migrations, SQLite, contratos de catálogo ou comportamento de `/legacy`.

## Contrato do pacote

O diretório deve conter exatamente os arquivos canônicos mínimos:

```text
design-systems/live-console/
  manifest.json
  DESIGN.md
  tokens.css
```

`manifest.id` deve ser `live-console`; os caminhos declarados são relativos e devem existir. O pacote é local e sua proveniência deve dizer que deriva do sistema visual V1 do Live Console.

`DESIGN.md` deve conter decisões substantivas sobre tema, papéis de cor, tipografia, composição, componentes, motion, acessibilidade, limites de produto e anti-padrões. Não usar o documento como prompt para alterar backend.

`tokens.css` é a fonte canônica dos tokens `--lc-*`. A folha global Angular deve importá-lo; não copiar novamente o bloco `:root` para `frontend/src/styles.css`.

## Integração Angular

Em `frontend/src/styles.css`, importar `../../design-systems/live-console/tokens.css` antes das camadas `reset`, `tokens` e `base`, ou ajustar o caminho equivalente comprovado pelo build. As regras globais continuam usando os tokens existentes. Se o builder não aceitar import fora de `sourceRoot`, mover o pacote para uma localização equivalente e documentar o vínculo, sem criar duas fontes de verdade.

## Verificações automatizadas

Adicionar teste que:

- lê e valida JSON do manifest;
- verifica a existência de `DESIGN.md` e `tokens.css`;
- conta pelo menos sete headings H2 substantivos em `DESIGN.md`;
- verifica tokens essenciais (`--lc-stage`, `--lc-ink`, `--lc-amber`, `--lc-teal`, `--lc-focus`, `--lc-content-width`, `--lc-motion-enter`, `--lc-motion-exit`);
- confirma que `frontend/src/styles.css` importa o pacote;
- não exige rede, OpenDesign instalado ou Supabase disponível.

## Validação manual

Executar build e abrir `/v1/catalogo`, `/v1/lives`, `/v1/blocos`, `/v1/execucao` e `/legacy`. Confirmar que o visual permanece estável, que diálogos iniciam no topo e que a folha canônica não altera contratos de dados.
