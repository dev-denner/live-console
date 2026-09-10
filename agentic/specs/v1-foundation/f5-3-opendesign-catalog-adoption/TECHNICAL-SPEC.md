# Especificação técnica — F5.3

## Arquivos

- `design-systems/live-console/tokens.css`: amplia tokens semânticos para linhas, scrims e diálogos.
- `frontend/src/app/pages/catalogo/catalogo-page.component.css`: aplica o sistema visual ao catálogo, sem valores de cor locais.
- `frontend/src/app/pages/catalogo/catalogo-page.component.html`: melhora semântica da tabela, estados, ações e contagem.
- `frontend/src/app/layout/app-shell.component.css`: remove o gradiente do shell para respeitar o anti-padrão OpenDesign.
- `frontend/src/styles.css`: usa o token de tipografia do pacote no corpo global.
- `test/f5-3-opendesign-catalog.test.mjs`: valida o contrato visual por inspeção estática.

## Regras visuais

1. Componentes consomem variáveis `--lc-*`; novos valores devem entrar primeiro em `tokens.css`.
2. Amber representa ação deliberada, teal representa estado saudável, coral representa falha ou destruição.
3. Estado nunca é comunicado apenas por cor: badges e mensagens exibem texto explícito.
4. A tabela deve permitir leitura horizontal em telas estreitas, sem destruir o conteúdo.
5. Títulos e referências usam quebra de linha; não usar `text-overflow: ellipsis` no catálogo.
6. Diálogos usam um container rolável com cabeçalho sticky no topo, evitando o corte do título e do botão de fechar.
7. `prefers-reduced-motion` desliga transições e pulso do skeleton.
8. A mudança não deve alterar chamadas HTTP ou modelos de negócio.

## Verificação

O teste de contrato verifica a presença dos tokens e dos seletores críticos, além da ausência de `linear-gradient`, `radial-gradient` e cores hexadecimais no CSS do catálogo. A validação visual final deve ser feita no navegador com catálogo vazio, catálogo populado, diálogo de música, diálogo de versão, erro e viewport móvel.
