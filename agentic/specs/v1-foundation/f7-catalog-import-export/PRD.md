# F7 — Importação e exportação aditiva do catálogo

## Objetivo

Permitir importar e exportar o catálogo local por JSON sem duplicar músicas e sem apagar versões já cadastradas. O fluxo deve ser revisável antes da escrita e deve preservar o contrato legado.

## Contrato de entrada

O JSON é um objeto com `musicas[]`. Cada música usa o contrato V1 canônico (`artista`, `titulo`, `musicaBase`, `status` booleano, `observacoes`, `genero`, `origem`, `autoral`, `xEmLives`, `letraCaminho`) e um array `versoes[]`.

Cada versão é um objeto (`id`, `nome`, `tipo`, `referencia`, `ordem`, `duracao`, `abertura`). `ordem: 1` define a versão principal; não há campo `principal`. A forma legada `fontes[]` continua aceita somente pelo adaptador de transição.

## Regras de merge

- Música existente é identificada por `artista + titulo + musicaBase`, com `musicaBase=titulo` quando ausente.
- Campos recebidos da música atualizam o registro existente; campos omitidos não são apagados.
- Versão existente é identificada por `id`, depois por `tipo + referencia` e, como chave humana de fallback, por `nome`.
- Versões recebidas são mescladas aditivamente. Nenhuma versão existente é removida porque não apareceu no novo arquivo.
- Uma nova versão é acrescentada; uma versão identificada pode atualizar seus campos editáveis.
- `xEmLives` não é incrementado nem reduzido durante a importação.
- URLs, caminhos locais e letras são preservados literalmente.

## Fluxo visual

`/v1/importacao` permite selecionar JSON, validar uma prévia, revisar contagens e confirmar explicitamente. Importação parcial permanece desligada por padrão. Exportação baixa o catálogo pelo endpoint existente.

## Fora de escopo

Excel, fabricação automática de live, alterações em `/legacy` e redesign final do shell.
