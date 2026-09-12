# Layout operacional — referência F9

O desenho de referência organiza a tela em três áreas:

1. **Repertório**, à esquerda: lista numerada, abertura fixa, estado visual da música e duração.
2. **Execução**, no centro: versões, player, controles anterior/próxima, `Marcar tocada` e letra.
3. **Adicionar música**, à direita: busca no catálogo, somente músicas ainda ausentes no repertório, inclusão ao final.

Regras visuais:

- música atual fica destacada;
- música tocada fica inativa;
- música pulada permanece visível e identificada;
- música adicionada durante execução recebe indicação própria;
- a abertura não oferece mover ou remover;
- reordenação durante execução não é limitada pelo bloco;
- encerrar live exige confirmação.

O layout é uma referência comportamental. A implementação deve preservar as regras de domínio mesmo que a composição visual seja refinada.
