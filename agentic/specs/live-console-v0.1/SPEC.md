# SPEC — Live Console v0.1

**ID:** LIVE-CONSOLE-SPEC-001  
**Versão:** 0.3-draft  
**Status:** Proposto para implementação local  
**Escopo:** aplicação local; sem repositório GitHub nesta fase.

---

# 1. Objetivo

Evoluir o Live Console de um leitor de repertórios JSON para uma aplicação local com cadastro reutilizável de músicas e criação/execução rastreável de lives.

O sistema deve permitir importar o catálogo a partir da planilha Excel usada hoje, preparar uma live, conduzi-la em tela e registrar com fidelidade quais músicas foram efetivamente executadas.

# 2. Princípios e limites

- O Excel é a fonte de entrada do catálogo até sua adaptação para o Live Console v0.1. A estrutura final da planilha e o mapeamento de importação serão definidos no próximo marco.
- O cadastro local passa a ser a fonte operacional do Console; a importação deve reportar inclusões, atualizações, ignorados e conflitos, sem alterar o Excel.
- O usuário sempre seleciona uma cópia descartável. O Console move essa cópia para seu armazenamento interno; arquivos originais ficam fora do fluxo e não são tocados.
- Não armazenar mídia no GitHub. Esta versão não exige repositório remoto.
- Nenhuma música entra no histórico por constar no repertório ou ser marcada durante a sessão. O histórico só é consolidado ao encerrar a live.
- **Elegibilidade obrigatória:** somente músicas cujo status de repertório seja `OK` podem entrar em uma live — seja por geração automática, inclusão manual, substituição, pedido ou importação de uma lista pronta. Itens com status `ensaiar` ou `Baixar tom` permanecem no catálogo, mas não podem ser selecionados até que o usuário os altere para `OK`.

# 3. Decisão técnica confirmada

O Live Console v0.1 usará **Node.js + SQLite local**. O banco será um arquivo local da aplicação, acessado pelo ecossistema Node.js.

Diretrizes:

- manter e evoluir o ecossistema Node.js do Console;
- o banco SQLite e as mídias internas pertencem ao diretório de dados local da aplicação e não são publicados no GitHub;
- a aplicação deve inicializar o esquema SQLite automaticamente e oferecer backup/exportação local em evolução futura;
- alterações futuras de stack só ocorrem por decisão explícita de Denner.

# 4. Modelo de dados mínimo

## Artista

- `id`
- `nome` (único, normalizado para evitar duplicidade)
- `criado_em`, `atualizado_em`

## Gênero

- `id`
- `nome` (único)

## Música

- `id`
- `titulo`
- `artista_id`
- `genero_id` (opcional)
- `origem`: nacional | internacional (controle informativo; não cria regra automática de seleção)
- `autoral` (sim | não)
- `duracao_segundos` (obrigatória para seleção por tempo quando conhecida)
- `status_operacional` (ativa, inativa, indisponível)
- `status_repertorio`: `OK` | `ensaiar` | `Baixar tom` (define a elegibilidade para lives)
- `origem_catalogo` / chave de importação do Excel
- `letra_md_path` (opcional; arquivo Markdown interno)
- `observacoes`
- timestamps

## Versão da música

Uma música representa a obra/repertório; versões representam execuções distintas dessa mesma música.

- `id`, `musica_id`
- `nome` (ex.: original, acústica, ao vivo, versão de [artista])
- `duracao_segundos` (quando a duração variar da música-base)
- `status` e `observacoes`

Um repertório usa uma versão específica. Duas versões da mesma música não podem coexistir no mesmo repertório, salvo regra futura explícita.

## Mídia da versão

Uma versão pode ter mais de uma fonte. Cada fonte possui:

- `id`, `versao_id`
- `tipo`: `audio_interno` | `video_interno` | `youtube` | `externo`
- `url_ou_caminho`
- `nome_original`, `nome_armazenado` quando arquivo interno
- `ordem` e `ativa`

Regra de execução: uma fonte interna de áudio abre player de áudio; vídeo interno ou link de vídeo abre player de vídeo incorporado quando suportado; link externo sem player compatível abre como fonte externa claramente identificada.

## Live

- `id`, `titulo`, `data_hora`
- `objetivo`, `vibe`
- `modo_criacao`: aleatória | objetivo | vibe | customizada
- `alvo_tipo`: duração | quantidade
- `alvo_valor`
- `status`: rascunho | pronta | em_andamento | encerrada
- `iniciada_em` (nulo até o início confirmado)
- `encerrada_em` (nulo até o encerramento confirmado)
- `observacoes`

## Repertório e execução

- `live_musicas`: `live_id`, `musica_id`, `versao_id`, `ordem`, `fonte_midia_id`, duração prevista, observação opcional e estado `marcada_como_feita`.
- `execucoes_live`: `live_musica_id`, `executada_em`.

Durante a live, `marcada_como_feita` é apenas o estado de sessão reversível. Ao acionar **Terminar live**, o sistema cria `execucoes_live` somente para os itens marcados, em uma única transação, e encerra a live. Uma execução é única por item do repertório.

## Frases e dicas da live

- `live_notas`: `live_id`, `tipo` (frase | dica | observação), `texto`, `ordem`.

Elas pertencem à **live**, não à música. O cadastro deve permitir criar manualmente e importar uma lista de frases/dicas para uma live, sem duplicação acidental.

# 5. Importação e gestão de arquivos

## Importar do Excel

O sistema deve oferecer prévia da importação, mapeamento explícito de colunas e relatório final.

Campos esperados quando presentes: título, artista, gênero, origem (nacional/internacional), autoral, versão, duração, letra, link externo/YouTube, local de mídia, status de repertório e observações. Campos ausentes não podem ser inventados.

Na importação, o status de repertório deve ser preservado. O relatório deve indicar músicas não elegíveis; o Console não pode promovê-las automaticamente para `OK`.

Critério inicial de deduplicação: título + artista normalizados. Conflitos devem ser apresentados ao usuário para escolher manter, atualizar ou pular.

## Importar mídia interna

1. Usuário seleciona uma cópia do arquivo.
2. Sistema valida extensão e identifica áudio ou vídeo.
3. Sistema move a cópia selecionada para diretório interno organizado, por exemplo `data/media/audio/` ou `data/media/video/`.
4. Sistema gera nome seguro/único e grava a referência no banco.
5. Origem permanece intacta.

Falha no movimento não pode criar referência quebrada no banco. Não há exclusão automática de arquivos internos já importados.

## Importar letra

- O formato oficial de letras do v0.1 é **Markdown (`.md`)**.
- Usuário seleciona uma cópia `.md`; o Console move o arquivo para `data/lyrics/`, gera nome interno seguro e grava `letra_md_path` na música.
- Uma letra é compartilhada pelas versões da mesma música, salvo evolução futura explicitamente necessária.
- Arquivos com outra extensão não são importados como letra no v0.1; devem ser convertidos/revisados antes da importação.

# 6. Experiência de execução — layout de três colunas

## Coluna 1 — repertório (máximo 25% da largura)

- lista ordenada com título e artista;
- destaque da música atual, executadas e pendentes;
- clique em item muda a música atual sem marcar execução;
- rolagem independente.

## Coluna 2 — área principal

- para áudio interno: controlador no topo; letra abaixo, grande, legível e com rolagem;
- para vídeo interno ou vídeo externo suportado: player no topo; letra abaixo quando existir;
- para fonte sem letra: usar o espaço com estado claro de “letra não cadastrada”; 
- players entram pausados por padrão; nenhuma mídia toca automaticamente;
- fonte, título e artista devem permanecer visíveis.

## Coluna 3 — condução da live (máximo 20% da largura)

- frases, dicas e observações associadas à live atual;
- visualização ordenada e fácil de ler durante a transmissão;
- inclusão, edição, remoção e importação dentro do modo de preparação, não durante o uso concentrado da live.

O layout deve permanecer utilizável em resoluções comuns de notebook e, em telas estreitas, reorganizar-se sem esconder controles essenciais.

# 7. Controlador, ordenação e registro real

## Iniciar live

Uma live construída permanece em modo de preparação (`rascunho` ou `pronta`): o repertório pode ser revisado, mas os controles de execução ficam inativos.

O botão **Iniciar live** deve:

1. pedir confirmação do repertório e das informações básicas;
2. registrar `iniciada_em`;
3. alterar o status para `em_andamento`;
4. habilitar os controles de execução e a marcação de músicas feitas.

`iniciada_em` e `encerrada_em` permitem calcular a duração real da transmissão. Uma live não pode ser encerrada sem ter sido iniciada.

Controles obrigatórios:

`[← anterior]  [Feita + próxima]  [próxima →]`

- **Anterior**: seleciona o item anterior; não altera execução.
- **Próxima**: seleciona o item seguinte; não altera execução.
- **Feita + próxima**: marca a música atual como feita **na sessão** e avança para a próxima.
- Se a música atual já estiver marcada como feita, clicar novamente desfaz a marcação e não avança. A interface deve deixar esse estado inequívoco (por exemplo, “Desfazer feita”).
- Nenhum clique nesses controles cria histórico definitivo nem incrementa contagem de lives.

## Reordenar repertório

- A lista deve permitir arrastar e soltar músicas para qualquer posição, tanto na preparação quanto durante a live.
- A ordem alterada deve ser gravada imediatamente no repertório da live e refletida no controlador.
- Reordenar não marca nem desmarca uma música como feita.

## Editar a lista proposta

Independentemente de a live ter sido criada de modo aleatório, por objetivo, por vibe ou customizado, o usuário pode antes ou durante a live:

- adicionar uma música/versão elegível;
- remover uma música ainda não marcada como feita;
- substituir uma música por outra;
- trocar a versão ou a fonte de mídia; e
- reordenar por arrastar e soltar.

O sistema deve recalcular quantidade e duração estimada após cada alteração e impedir que duas versões da mesma música coexistam no repertório.

## Terminar live

O botão **Terminar live** deve:

1. mostrar uma confirmação com músicas marcadas como feitas, pendentes, ordem final e duração real;
2. ao confirmar, registrar em `execucoes_live` apenas as músicas marcadas;
3. registrar data/hora de encerramento e mudar o status para `encerrada`;
4. preservar a ordem final e disponibilizar o resumo pós-live;
5. impedir nova consolidação acidental da mesma live.

O histórico e os relatórios devem usar apenas `execucoes_live`; posição na lista ou marcação de sessão não são evidência definitiva de performance.

# 8. Criador de lives

O criador deve iniciar uma live com data/hora, objetivo e um dos modos abaixo.

## Aleatória

Seleciona somente músicas com status de repertório `OK`, de forma aleatória, obedecendo filtros, disponibilidade de mídia, duração/quantidade e restrições definidas. Deve priorizar, como critério de desempate, músicas com menor número de execuções em lives encerradas.

## Por objetivo

Usuário informa o objetivo (ex.: animar, nostalgia, romântica, interação/pedidos). O sistema aplica as regras/tags cadastradas e explica os critérios utilizados.

## Por vibe

Usuário escolhe uma vibe cadastrada. O sistema prioriza gêneros, energia, observações e/ou tags compatíveis que existirem no catálogo.

## Customizada

Usuário escolhe manualmente músicas, ordem e fonte de mídia.

## Autorais

Ao criar a live, o usuário pode informar a quantidade desejada de autorais: `0`, `1`, `2` ou `3`.

- O gerador deve selecionar apenas músicas marcadas como `autoral`.
- Autorais devem ser distribuídas ao longo do repertório, nunca em posições consecutivas nesta versão.
- O limite padrão do v0.1 é três autorais. Exceções não fazem parte desta versão.
- A seleção final continua editável pelo usuário, respeitando a regra de não repetir versões da mesma música.

## Meta do repertório

Em qualquer modo, o usuário escolhe:

- duração alvo; ou
- quantidade de músicas.

Quando a meta é duração, usar somente músicas com duração conhecida para o cálculo principal, exibir total estimado e diferença para a meta. Quando houver músicas sem duração, mostrar o aviso e não fingir precisão.

O resultado é sempre editável antes de marcar a live como pronta, inclusive por arrastar e soltar. Na proposta automática, o sistema deve exibir que considerou o histórico consolidado de execuções e priorizou músicas menos tocadas quando existirem alternativas compatíveis.

# 9. Fechamento e divulgação

Ao finalizar o planejamento, o sistema deve gerar uma sugestão curta de post de divulgação com:

- dia/data da live;
- objetivo ou vibe da live;
- convite coerente com o clima.

Não mencionar quantidade de músicas nem duração, salvo instrução manual do usuário.

Exemplo estrutural: “Nesta [data], tem live com uma vibe [objetivo/vibe]. Vem cantar e deixar a noite mais leve comigo!”

# 10. Critérios de aceite

- [ ] Importo músicas do Excel e vejo relatório de cada resultado.
- [ ] Músicas `ensaiar` ou `Baixar tom` aparecem no catálogo, mas não entram em uma live por nenhum fluxo; somente `OK` é elegível.
- [ ] Cadastro música, artista e gênero sem duplicações involuntárias.
- [ ] Registro origem nacional/internacional e flag autoral no cadastro de música.
- [ ] Cadastro versões e uso apenas uma versão de cada música por repertório.
- [ ] Registro duração por música e o criador calcula repertório por duração de forma transparente.
- [ ] Associo áudio interno, vídeo interno e link externo/YouTube a uma música.
- [ ] Mídias e letras `.md` selecionadas como cópias são movidas para o armazenamento interno sem tocar nos originais.
- [ ] Executo uma live no layout de três colunas com letra e mídia conforme o tipo.
- [ ] Frases/dicas aparecem por live e não por música.
- [ ] Marco uma música como feita e desfaço a marcação em caso de engano, sem criar histórico prematuro.
- [ ] Ao terminar a live, apenas músicas marcadas são registradas como execução uma única vez.
- [ ] Inicio uma live e o sistema registra o horário; encerro-a e o sistema registra o término e a duração real.
- [ ] Crio repertório aleatório, por objetivo, por vibe ou manualmente e ajusto a ordem por arrastar e soltar antes ou durante a live.
- [ ] Propostas automáticas priorizam músicas menos tocadas com base em lives encerradas.
- [ ] Posso pedir de zero a três autorais e elas não entram consecutivamente no repertório.
- [ ] Recebo sugestão de post contendo data e objetivo/vibe, sem duração nem quantidade.

# 11. Fora do escopo de v0.1

- sincronização automática com Google Drive;
- compartilhamento multiusuário;
- publicação/integração com TikTok, YouTube ou redes sociais;
- upload de mídia para nuvem;
- análise automática de desempenho e recomendação por IA;
- publicação em GitHub.

# 12. Próximo marco

Com Node.js + SQLite confirmado e a consolidação pós-live definida, o próximo passo é adaptar o Excel ao catálogo do v0.1; depois detalhar o plano de implementação/migração do Console atual.
