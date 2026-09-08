# Live Console v1.0 — Requisitos de Retomada e Critérios de Aceite

**ID:** LIVE-CONSOLE-SPEC-002  
**Status:** Proposto — implementação pausada  
**Data:** 20/08/2026  
**Complementa:** `LIVE-CONSOLE-SPEC-001`  

## 1. Decisão de produto

- A evolução experimental do Live Console v0.1 fica pausada.
- O Console antigo, já funcional para condução das lives, permanece como versão operacional.
- Nenhum arquivo da versão funcional deve ser substituído ou alterado durante a pausa.
- Uma retomada ocorrerá como **Live Console v1.0**, guiada por esta SPEC e por marcos pequenos, demonstráveis e aprovados pelo usuário.

## 2. Problemas observados que a v1.0 deve eliminar

1. O gerador automático retornou menos músicas do que a meta solicitada, sem explicar a limitação: pedidos de 30 ou 60 resultaram em cerca de 15 itens.
2. A quantidade de autorais não foi respeitada de forma confiável; o campo aceitou valor acima do limite definido de três.
3. A inclusão manual por texto não mostrou resultados nem confirmou claramente a inclusão.
4. Arquivos internos de áudio e vídeo foram cadastrados como fonte, mas não renderizaram em players utilizáveis.
5. A letra ficou inacessível em cenários com player de vídeo por causa da área central travada.
6. A coluna de condução não teve destaque visual suficiente para uso em live.
7. A taxa de vídeos do YouTube incorporados ficou pior que a do Console antigo, sem diagnóstico por mídia.

Esses fatos devem ser tratados como lacunas de aceite, não como detalhes cosméticos.

## 3. Contrato do gerador de repertório

### 3.1 Quantidade

- Para meta por quantidade `N`, o gerador deve retornar **exatamente `N` músicas** quando houver pelo menos `N` músicas elegíveis e sem conflito de versão.
- Não pode existir limite oculto de 15 itens, nem qualquer outro teto não informado.
- Se não houver músicas elegíveis suficientes, a tela deve exibir: quantidade solicitada, quantidade possível e a causa (por exemplo, status diferente de `OK`, versões conflitantes ou filtro aplicado).
- O resultado não pode ser criado silenciosamente vazio ou parcial.

### 3.2 Duração

- Para meta por duração, a resposta deve mostrar duração-alvo, duração estimada, quantidade selecionada e a diferença estimada.
- Faixas sem duração conhecida não podem ser usadas para alegar precisão. Devem ser sinalizadas ou ficar fora do cálculo, conforme decisão explícita da interface.

### 3.3 Elegibilidade

- Somente músicas com status `OK` podem ser propostas, adicionadas, substituídas ou aceitas como pedido.
- A regra deve existir no banco/API e na interface.

### 3.4 Autorais

- O campo aceita somente números inteiros entre `0` e `3`; a interface deve impedir `4` e a API deve rejeitar valores fora desse intervalo.
- Havendo autorais `OK` suficientes, a proposta contém **exatamente** a quantidade solicitada.
- Havendo menos autorais elegíveis, a proposta informa a indisponibilidade antes da criação.
- Autorais nunca ficam consecutivas na ordem automática.
- Duas versões da mesma obra não coexistem no mesmo repertório.

## 4. Inclusão e edição manual

- “Adicionar música” deve abrir uma busca visível com resultados filtrados, artista, versão e fonte disponível.
- Digitar um texto sem correspondência deve informar claramente que não houve resultado.
- Escolher um resultado deve confirmar a inclusão, atualizar a lista e recalcular quantidade/duração.
- O usuário pode remover pendentes, trocar fonte/versão e reordenar por arrastar e soltar antes e durante a live.

## 5. Mídia e letras

### 5.1 Arquivos internos

- A importação de áudio, vídeo e letra deve mover a cópia selecionada para o armazenamento interno antes de gravar a referência no banco.
- A importação deve falhar de forma atômica: referência no banco e arquivo movido existem juntos, ou nenhum dos dois existe.
- O Console não pode depender da letra de unidade usada pelo Google Drive.
- Se for necessário usar uma pasta de biblioteca externa temporariamente, sua raiz deve ser configurada uma vez pela interface/configuração, não codificada em caminhos individuais.
- Áudio interno deve abrir um player HTML nativo; vídeo interno, um player HTML nativo; letra `.md`, texto legível dentro do Console.
- Cada player deve ser testado com pelo menos um MP3, um MP4 e um arquivo `.md` reais antes da entrega.

### 5.2 YouTube e links externos

- O Console deve preservar o comportamento comprovadamente funcional do Console antigo antes de qualquer alteração no player.
- Um vídeo só deve ser classificado como não incorporável quando houver evidência de bloqueio pelo proprietário ou falha explícita do player; não atribuir o problema a CORS sem evidência.
- Quando a incorporação for bloqueada pelo proprietário, mostrar o motivo e uma ação clara para abrir o link externo.
- Criar uma amostra de validação com os links reais do catálogo: quantidade testada, quantidade incorporada e links bloqueados devem ser registrados antes de liberar uma versão.

## 6. Layout de execução

- O layout de três colunas deve usar a largura disponível, mas a página ou a área central precisa permitir chegar à letra abaixo do player.
- Nenhum `overflow: hidden` pode esconder letra, botões ou conteúdo necessário durante a live.
- A coluna de condução deve diferenciar visualmente `frase`, `dica` e `observação`, com contraste suficiente para leitura rápida.
- A experiência deve ser testada na resolução real usada por Denner na live, não apenas em tela reduzida de desenvolvimento.

## 7. Estratégia de implementação econômica

1. Criar uma cópia isolada do Console antigo; nunca trabalhar por cima da versão operacional.
2. Implementar e validar um único marco por vez.
3. Antes de gerar pacote/ZIP, executar os testes de aceite daquele marco e registrar o resultado.
4. Só entregar para teste humano quando os critérios daquele marco estiverem aprovados internamente.
5. Não iniciar uma nova frente visual enquanto os fluxos de geração, mídia e inclusão manual não estiverem funcionando.

## 8. Marcos sugeridos para v1.0

### M0 — Base e diagnóstico

- Inventário da versão antiga funcional.
- Casos de teste reais: catálogo, 30 músicas, 60 músicas, 0–3 autorais, MP3, MP4, letra MD e amostra de YouTube.
- Critérios de comparação registrados.

### M1 — Gerador confiável

- Metas por quantidade e duração.
- Limite de autorais e regras de elegibilidade.
- Retorno explicável e sem limites ocultos.

### M2 — Edição manual confiável

- Busca, adição, remoção, troca de versão/fonte e drag-and-drop.

### M3 — Mídia e letra

- Importação/movimentação de cópias, players internos, letra MD e tratamento de YouTube.

### M4 — Layout e condução

- Três colunas acessíveis, letra visível, cartões de condução e teste na tela de live.

## 9. Critérios de aceite da retomada

- [ ] Solicitar 30 músicas retorna 30, se houver 30 elegíveis.
- [ ] Solicitar 60 músicas retorna 60, se houver 60 elegíveis.
- [ ] Solicitar 0, 1, 2 ou 3 autorais respeita exatamente o número; 4 é recusado.
- [ ] O sistema explica por que uma meta não pode ser atendida.
- [ ] Adicionar música por busca funciona e tem confirmação visível.
- [ ] MP3 interno toca; MP4 interno toca; letra MD aparece.
- [ ] A letra permanece acessível durante vídeo.
- [ ] A tela de condução é legível rapidamente durante a live.
- [ ] A amostra de links do YouTube é comparada ao Console antigo antes de qualquer substituição.
- [ ] A versão antiga continua intacta até a aprovação humana da v1.0.
