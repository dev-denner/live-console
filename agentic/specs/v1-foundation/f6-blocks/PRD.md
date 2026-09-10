# F6 — Blocos de músicas

## Status

Implementação funcional da primeira versão de blocos, posterior à F5.3. A feature organiza músicas-base em conjuntos ordenados para uso futuro na fabricação de lives.

## Objetivo

Permitir que Denner crie blocos nomeados, defina manualmente suas músicas e preserve exatamente a ordem escolhida, sem transferir para o sistema decisões de clima, vibe ou transição.

## Escopo

Incluído:

- listar, criar, editar e excluir blocos;
- adicionar e remover músicas-base;
- limite de 10 músicas por bloco;
- ordem explícita, alterável por controles de mover para cima/baixo;
- uma música-base pertencendo a no máximo um bloco;
- indicação visual de música inativa ou já pertencente a outro bloco;
- API local, SQLite, tela Angular V1 e compatibilidade com `/legacy`.

Fora do escopo:

- geração automática de repertório;
- clima, vibe, temperatura, objetivo ou quantidade como critérios de seleção;
- inclusão de versões diferentes da mesma música;
- alteração de `xEmLives`;
- alteração de repertórios antigos.

## Decisões de produto

1. O bloco contém músicas-base, nunca uma versão específica.
2. A ordem exibida é a ordem cadastrada pelo usuário.
3. Uma música já vinculada a outro bloco fica indisponível na seleção, com o bloco atual informado.
4. Música inativa não pode ser adicionada a um bloco novo; se já existir em um bloco legado, permanece visível até ser removida.
5. Excluir um bloco exclui somente o bloco e seus vínculos; não exclui músicas nem arquivos.

## Critérios de aceite

- operações de bloco persistem no SQLite e sobrevivem a reabertura;
- tentativas de associar música a outro bloco retornam conflito sem alterar dados;
- o 11º item é rejeitado sem alteração parcial;
- reordenação mantém todos os itens uma única vez;
- a tela mostra estados loading, vazio, erro e sucesso;
- testes, typecheck, lint, build e diff check passam;
- APIs antigas de blocos continuam disponíveis e `/legacy` permanece intacto.
