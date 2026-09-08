---
name: validate-live-setlist
description: Valida um repertório de live de Denner Zacarias antes de considerá-lo pronto, verificando quantidade, disponibilidade, integridade das fontes, duração, variedade, energia, esforço vocal, autorais, pedidos, histórico e riscos operacionais. Use após criar ou modificar um repertório.
version: 0.2
---

# Validate Live Setlist

## Objetivo

Atuar como gate de qualidade do repertório.

A Skill não existe para elogiar a seleção.

Ela deve procurar problemas concretos antes da live.

---

# Entrada

Receber:

- repertório ordenado;
- instruções específicas da live atual;
- catálogo atual;
- histórico disponível;
- fontes necessárias para verificação.

Sempre considerar a instrução explícita mais recente de Denner.

---

# Validações

## 1. Quantidade

Default atual:

- 30 músicas.

Classificar como:

- PASS — possui a quantidade solicitada;
- WARN — diferença explicitamente justificada;
- FAIL — quantidade divergente sem justificativa.

---

## 2. Duplicatas

Verificar:

- mesma música repetida;
- versões diferentes da mesma música quando não intencional;
- entrada duplicada por grafia diferente.

Duplicata não intencional:

`FAIL`

---

## 2A. Exclusão de versões da mesma música

Esta é uma regra crítica.

- Agrupar por Música base quando existir; caso contrário, por Música normalizada.
- Duas entradas com a mesma chave canônica são FAIL, mesmo que tenham artistas, links, arquivos ou Versão diferentes.
- Não aceitar como justificativa que as duas versões sejam boas ou tenham arranjos diferentes.
- Overkill, Every Breath You Take e futuras variantes podem ter no máximo uma entrada por live.

---

## 3. Status

Quando o catálogo informar status:

- `OK` → elegível;
- `ensaiar` → não deve entrar sem override explícito;
- `Baixar tom` → não deve entrar sem override explícito.

Música não elegível inserida sem override:

`FAIL`

---

## 4. Integridade literal da fonte

Esta é uma validação crítica.

Para cada música do repertório:

1. localizar a música correspondente no catálogo atual;
2. comparar a fonte usada no repertório com a fonte do catálogo;
3. comparar letra/caminho quando aplicável.

Para fonte YouTube:

`repertorio.youtube === catalogo.Link`

Para fonte local:

`repertorio.arquivo === catalogo.Link`

Quando houver letra:

`repertorio.letra === catalogo.Letra`

A comparação deve considerar o valor literal.

## Não considerar equivalentes

URLs que levam ao mesmo vídeo mas possuem texto diferente NÃO passam nesta validação.

Exemplo:

Catálogo:

`https://youtu.be/ABC?t=7`

JSON:

`https://www.youtube.com/watch?v=ABC&t=7`

Resultado:

`FAIL`

Motivo:

a fonte foi alterada.

---

## 5. Fonte ausente

Se uma música possui fonte no catálogo mas o repertório não a contém:

`FAIL`

Se o catálogo não possui fonte suficiente:

`NOT VERIFIED`

Não procurar automaticamente substituto para transformar o resultado em PASS.

---

## 6. Disponibilidade operacional

Quando houver fonte suficiente, verificar se cada música possui recurso necessário para execução.

Considerar:

- playback/local;
- YouTube;
- letra quando necessária;
- referência válida.

Não confundir:

- existência da referência no catálogo;
- acessibilidade real do recurso.

Se apenas a referência estiver disponível, validar integridade da referência e registrar acessibilidade como:

`NOT VERIFIED`

quando não for possível testá-la.

---

## 7. Duração

Quando houver dados confiáveis:

- calcular duração total aproximada;
- verificar compatibilidade com cerca de 2 horas;
- considerar tempo adicional de interação.

Se não houver duração suficiente:

`NOT VERIFIED`

Não inventar valores.

---

## 8. Autorais

Por padrão verificar:

- máximo de 2;
- não consecutivas;
- espaçamento adequado;
- não abrir a live;
- contexto de músicas conhecidas ao redor.

Violação relevante:

`FAIL` ou `WARN`, conforme impacto e eventual override explícito.

---

## 9. Esforço vocal

Quando o catálogo marcar uma música como `expressiva`:

- identificar sua posição;
- verificar concentração;
- verificar proximidade com outra música exigente;
- verificar se existe recuperação vocal adequada.

Múltiplas músicas expressivas próximas:

`WARN` ou `FAIL` conforme gravidade.

---

## 10. Curva de energia

Inspecionar a sequência procurando:

- abertura fraca;
- muitas músicas lentas consecutivas;
- blocos longos de baixa energia;
- ausência de recuperação após trecho emocional;
- encerramento fraco;
- concentração de todas as músicas fortes no começo.
- saltos bruscos de clima sem ponte adequada.

Classificar achados e indicar posições.

---

## 10A. Blocos e clima

Quando o catálogo possuir as colunas **Bloco** e **Clima**, verificar:

### Bloco

- se músicas selecionadas do mesmo bloco ficaram próximas quando isso era viável;
- se cada passagem pelo bloco forma preferencialmente mini-sequência de 2 a 5 músicas;
- se uma faixa isolada de bloco possui justificativa operacional ou artística;
- se faixas do mesmo bloco foram espalhadas sem necessidade.

Não reprovar apenas porque nem todas as cinco músicas de um bloco entraram na live.

### Clima

Escala: Saudades (1) → Romântica (2) → Noite (3) → Alegre (4) → Energia (5).

- identificar transições consecutivas que pulam dois ou mais níveis;
- confirmar se existe faixa intermediária elegível que deveria ter sido usada;
- aceitar subidas e descidas graduais;
- classificar salto brusco sem justificativa como WARN;
- classificar como INFO salto justificado por curva, pedido ou ausência de ponte;
- marcar NOT VERIFIED se faltarem dados de bloco/clima; nunca inventar valores.

---

## 11. Variedade

Verificar concentração excessiva de:

- artista;
- estilo;
- década;
- tipo de música.

Não exigir diversidade artificial.

Sinalizar apenas concentração que prejudique a experiência.

---

## 12. Pedidos recentes

Quando pedidos forem conhecidos:

- verificar se foram considerados;
- confirmar que pelo menos um pedido prioritário foi incorporado quando viável;
- apontar pedido relevante ignorado sem justificativa.

---

## 13. Novidades

Quando houver músicas novas explicitamente indicadas:

- verificar se foram avaliadas;
- não obrigar inclusão apenas por serem novas;
- registrar a razão quando uma novidade prioritária não entrar.

---

## 14. Histórico de desempenho

Quando houver informação disponível:

- sinalizar música associada a queda relevante de audiência;
- sinalizar repetição excessiva;
- observar `x em lives`;
- identificar repetição em repertórios recentes;
- favorecer consciência sobre músicas que funcionaram muito bem.

Não inventar métricas inexistentes.

Uma música repetida não é automaticamente erro.

Repetição deve ser avaliada considerando sua função.

---

## 15. Risco operacional

Procurar:

- fonte ausente;
- fonte divergente do catálogo;
- caminho local alterado;
- falta de letra quando necessária;
- arquivo inexistente quando verificável;
- referência ambígua;
- música que exige preparação ainda não feita;
- dependência que possa interromper a live.

---

## 16. Regras da agência

Quando aplicável, verificar incompatibilidades com orientações existentes em:

`agencia-livestyle/`

Esta Skill valida principalmente repertório.

Regras de fala e comportamento não devem invalidar uma música sem relação direta com ela.

---

## 17. Registro de execução e reconciliação

Quando houver arquivo de execução disponível, verificar:

- se ele informa iniciadaEm, terminadaEm, musicasTocadas e musicasNaoTocadas;
- se cada música tocada traz título, artista e referência literal;
- se o registro pode ser associado de forma única ao catálogo;
- se o registro não foi aplicado anteriormente ao x em lives.

Regras:

- incrementar x em lives apenas para musicasTocadas confirmadas;
- não usar JSON planejado para incrementar histórico;
- correspondência ambígua, registro sem referência ou música adicionada fora do catálogo: NOT VERIFIED ou BLOCKED, nunca atualização automática;
- aplicação repetida do mesmo registro: FAIL de idempotência.

---

# Saída

Produzir:

## Status geral

Um de:

- `PASS`
- `PASS WITH WARNINGS`
- `FAIL`

---

## Checklist

Exemplo:

- [x] Quantidade
- [x] Sem duplicatas
- [x] Status das músicas
- [x] Integridade literal das fontes
- [x] Autorais
- [x] Variedade
- [x] Curva de energia
- [x] Blocos e transições de clima
- [x] Esforço vocal
- [x] Pedidos considerados
- [ ] Duração completamente verificável
- [ ] Acessibilidade externa completamente verificável

Usar `[x]` somente quando efetivamente verificado.

Quando não houver dados suficientes:

`NOT VERIFIED`

e explicar o motivo.

---

# Achados

Para cada problema:

- severidade: FAIL / WARN / INFO;
- posição/música afetada;
- descrição;
- fonte esperada;
- valor encontrado, quando pertinente;
- correção sugerida.

---

# Regra de conclusão

Um repertório com `FAIL` não pode ser chamado de final.

Fluxo obrigatório:

repertório  
→ validar  
→ encontrar FAIL  
→ corrigir  
→ validar novamente  
→ PASS / PASS WITH WARNINGS  
→ concluir

---

# Não fazer

- Não transformar ausência de informação em PASS.
- Não inventar métricas.
- Não considerar duas URLs diferentes como equivalentes.
- Não corrigir silenciosamente o catálogo.
- Não procurar outra fonte para fazer a validação passar.
- Não alterar regras apenas para aprovar o repertório.
- Não considerar checkbox marcado anteriormente como prova suficiente.
- Não aprovar apenas porque o repertório parece musicalmente agradável.

