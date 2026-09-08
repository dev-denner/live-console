# SPEC — Prepare Daily Live

**ID:** LIVE-SPEC-001  
**Versão:** 0.2  
**Status:** Reusable Template

---

# Objetivo

Preparar uma live diária de Denner Zacarias utilizando dados atuais, Skills especializadas e validação explícita antes de considerar o resultado pronto.

O fluxo deve produzir:

1. repertório final;
2. artefato compatível com o Live Console;
3. texto de divulgação da live;
4. registro claro de warnings ou itens não verificáveis.

Esta Spec é reutilizável.

A execução concreta deve receber o contexto da live atual.

---

# Entrada mínima

- data da live, quando conhecida;
- horário da live, quando conhecido;
- instruções específicas dadas por Denner;
- catálogo atual disponível;
- pedidos/novidades conhecidos.

---

# Defaults atuais

Quando não houver override explícito:

- 30 músicas;
- aproximadamente 2 horas;
- clima prioritariamente alto astral;
- máximo de 2 autorais;
- autorais espaçadas;
- preservação vocal;
- baixa repetição quando houver alternativas adequadas.

---

# Regra permanente — Blocos e Clima

O catálogo pode fornecer as colunas **Bloco** e **Clima**. Ambas devem orientar a construção da sequência.

## Bloco

- Bloco representa um conjunto de músicas que combinam artisticamente e tendem a funcionar próximas na live.
- Ao selecionar uma música de um bloco, procurar formar uma mini-sequência contínua de **2 a 5 músicas** do mesmo bloco, quando houver candidatas adequadas e elegíveis.
- Não é obrigatório tocar todas as cinco músicas cadastradas e não é obrigatório usar um bloco inteiro.
- Evitar espalhar músicas de um mesmo bloco em pontos aleatórios da live sem motivo operacional ou artístico.
- Ao sair de um bloco, respeitar o clima da última música e da próxima, usando uma faixa intermediária quando fizer sentido.
- Não forçar faixa somente para completar bloco: status, preservação vocal, pedidos, histórico e curva geral continuam valendo.

## Clima

Escala ordenada da mais calma para a mais agitada:

1. Saudades
2. Romântica
3. Noite
4. Alegre
5. Energia

A escala não obriga a live inteira a subir sem parar; ela orienta **transições locais**:

- preferir passos vizinhos ou graduais, por exemplo Romântica → Noite → Alegre;
- evitar saltos diretos de dois ou mais níveis, como Saudades → Alegre ou Romântica → Energia, quando houver alternativa intermediária adequada;
- permitir descida gradual quando necessário;
- permitir salto se não houver intermediária viável, registrando justificativa ou warning;
- ordenar as faixas de cada bloco para que o clima tenha sentido musical.

Na ausência das colunas ou de valores preenchidos, não inventar classificação: usar os demais sinais e registrar NOT VERIFIED para bloco/clima.

---

# Regra crítica — versões da mesma música

Uma live pode conter **somente uma versão de cada música**.

- Versão lançada, acústica, ao vivo, somente violão, cover ou outra variação são alternativas da mesma obra, não músicas adicionais.
- A chave canônica é Música base, quando existir; sem ela, é Música normalizada.
- Versão, artista, link e tipo de mídia identificam qual alternativa tocar, mas nunca autorizam duas alternativas da mesma música na mesma live.
- Escolher uma Overkill impede a outra; escolher uma versão de Every Breath You Take impede as demais.
- Duas versões da mesma música na mesma live são FAIL, sem exceção implícita.

---

# Fonte da verdade

Usar as fontes vivas disponíveis na pasta das lives.

Prioridade conceitual:

1. instrução explícita mais recente de Denner;
2. dados atuais do catálogo/planilha;
3. pedidos e novidades atuais;
4. histórico real das lives;
5. feedback recente das lives;
6. regras das Skills;
7. regras da agência;
8. defaults desta Spec.

Nunca usar informação antiga para sobrescrever uma fonte atual.

---

# Regra crítica — fonte musical

Links, arquivos e letras vindos do catálogo são dados operacionais opacos.

Ao produzir o artefato do Live Console:

- copiar `Link` literalmente;
- copiar `Letra` literalmente;
- não normalizar;
- não reconstruir;
- não substituir;
- não alterar parâmetros.

A validação deve confirmar igualdade literal entre catálogo e artefato final.

Divergência:

`FAIL`

---

# Tasks

## 1. Carregar contexto da live

- [ ] Identificar data da live.
- [ ] Identificar horário da live.
- [ ] Identificar instruções específicas para a live atual.
- [ ] Identificar catálogo/fonte musical atual.
- [ ] Identificar pedidos recentes conhecidos.
- [ ] Identificar músicas novas indicadas para consideração.
- [ ] Identificar restrições ou observações relevantes.
- [ ] Identificar feedback recente que possa influenciar a seleção.
- [ ] Identificar repertórios recentes disponíveis.
- [ ] Identificar regras pertinentes da agência.

### Evidência

Registrar resumidamente quais fontes foram efetivamente consultadas.

Não marcar esta etapa concluída apenas porque alguma informação estava disponível no contexto do chat.

---

# 2. Montar repertório candidato

Executar a Skill:

`build-live-setlist`

- [ ] Selecionar o conjunto de músicas.
- [ ] Ordenar a sequência.
- [ ] Aplicar regras de energia.
- [ ] Aplicar regras de bloco e clima.
- [ ] Incorporar pedidos relevantes.
- [ ] Aplicar regras de autorais.
- [ ] Aplicar regras de esforço vocal.
- [ ] Considerar `x em lives`.
- [ ] Considerar repertórios recentes.
- [ ] Considerar duração quando disponível.
- [ ] Preservar literalmente fontes do catálogo.

### Evidência

Registrar o repertório candidato ou referência inequívoca ao artefato produzido.

---

# 3. Validar repertório

Executar a Skill:

`validate-live-setlist`

- [ ] Verificar quantidade.
- [ ] Verificar duplicatas.
- [ ] Verificar versões da mesma música.
- [ ] Verificar status das músicas.
- [ ] Verificar integridade literal das fontes.
- [ ] Verificar autorais.
- [ ] Verificar esforço vocal.
- [ ] Verificar variedade.
- [ ] Verificar curva de energia.
- [ ] Verificar blocos e transições de clima.
- [ ] Verificar pedidos.
- [ ] Verificar histórico/repetição.
- [ ] Verificar disponibilidade quando possível.
- [ ] Verificar duração quando possível.
- [ ] Verificar riscos operacionais.

### Gate

O resultado precisa ser:

`PASS`

ou

`PASS WITH WARNINGS`

Um resultado:

`FAIL`

bloqueia a conclusão.

---

# 4. Corrigir achados

Se houver `FAIL`:

- [ ] Corrigir repertório ou artefato.
- [ ] Executar `validate-live-setlist` novamente.
- [ ] Repetir até eliminar os FAILs ou registrar bloqueio real.

Não esconder falhas para concluir a tarefa.

Não alterar a fonte original apenas para fazer a validação passar.

---

# 5. Produzir artefato do Live Console

Após aprovação do repertório:

- [ ] Produzir JSON compatível com o Live Console.
- [ ] Usar estrutura vigente dos repertórios anteriores.
- [ ] Copiar literalmente URLs do catálogo.
- [ ] Copiar literalmente caminhos de arquivos locais.
- [ ] Copiar literalmente caminhos de letras.
- [ ] Incluir observações operacionais úteis.
- [ ] Incluir interações adequadas à curva da live.
- [ ] Validar novamente a integridade das fontes após gerar o JSON.

## Nome do arquivo

Usar obrigatoriamente:

`live-YYYY-MM-DD.json`

Exemplo:

`live-2026-08-19.json`

Não usar nomes genéricos como:

- `live.json`
- `repertorio.json`
- `hoje.json`
- `final.json`

---

# 6. Destino do artefato

Quando a execução possuir permissão de escrita:

salvar em:

`repertorios/`

ou na área de repertórios vigente do Live Console.

Não sobrescrever repertório anterior sem necessidade explícita.

Se o arquivo da data já existir e a intenção for atualizar a live daquele mesmo dia, atualizar conscientemente o artefato correspondente.

Quando não houver capacidade de escrita:

- apresentar o JSON completo no chat;
- informar o nome exato que o arquivo deve receber.

---

## 6A. Reconciliar execução real com o catálogo

Após uma live realmente encerrada, quando existir um arquivo live-AAAA-MM-DD-execucao.json:

- [ ] Usar esse registro como fonte de verdade; não usar o JSON planejado como prova de execução.
- [ ] Confirmar que o registro ainda não foi aplicado, usando registroId ou a combinação de data/iniciadaEm.
- [ ] Considerar apenas musicasTocadas.
- [ ] Localizar a música primeiro pela referência literal de execução (Link/arquivo); usar Música base + Versão como apoio.
- [ ] Incrementar x em lives somente nas músicas confirmadas como tocadas.
- [ ] Registrar data/ordem real quando as colunas correspondentes existirem.
- [ ] Não incrementar musicasNaoTocadas.
- [ ] Não cadastrar ou incrementar automaticamente música adicionada fora do catálogo; registrar para revisão.
- [ ] Se houver correspondência ambígua, não alterar o Excel: registrar BLOCKED para decisão de Denner.

O processamento é idempotente: aplicar o mesmo registro duas vezes não pode incrementar x em lives duas vezes.

---

# 7. Produzir texto de divulgação

Depois que o repertório estiver aprovado, produzir automaticamente um texto pronto para copiar e colar.

O texto deve:

- informar que haverá live;
- informar o horário real;
- transmitir clima positivo;
- refletir características gerais do repertório;
- convidar para cantar, conversar e fazer pedidos;
- ser curto o suficiente para redes sociais/mensagens;
- não listar todo o repertório;
- evitar promessas falsas;
- respeitar regras vigentes da agência.

## Exemplo estrutural

> Hoje tem live!
>
> Às **19h**, nosso encontro está marcado com muita música boa, nostalgia e aquela energia gostosa pra deixar a noite mais leve.
>
> Preparei um repertório bem variado. Chega junto, canta comigo e manda seus pedidos.
>
> **Hoje, às 19h. Te espero!**

O texto concreto deve utilizar horário e contexto reais da live.

---

# 8. Produzir resultado final

- [ ] Produzir repertório final ordenado.
- [ ] Confirmar quantidade final.
- [ ] Confirmar autorais.
- [ ] Confirmar músicas expressivas, quando houver.
- [ ] Confirmar pedido incorporado.
- [ ] Registrar warnings restantes.
- [ ] Produzir JSON do Live Console.
- [ ] Confirmar nome do arquivo.
- [ ] Produzir texto de divulgação.

---

# 9. Fechamento

Antes de concluir:

- [ ] Todas as tasks obrigatórias foram executadas.
- [ ] Não existem FAILs abertos.
- [ ] Itens `NOT VERIFIED` estão explicitamente identificados.
- [ ] Exceções dadas por Denner estão registradas.
- [ ] O resultado corresponde à live solicitada.
- [ ] O repertório final está acessível.
- [ ] O artefato do Live Console está acessível.
- [ ] O texto de divulgação está disponível.

---

# Status final

Registrar:

**Status:** PASS | PASS WITH WARNINGS | BLOCKED

**Data:**  
**Horário:**  
**Quantidade:**  
**Duração aproximada:**  
**Autorais:**  
**Expressivas:**  
**Blocos e clima:**  
**Pedidos incorporados:**  
**Warnings:**  
**Itens não verificáveis:**  
**Artefato final:**  
**Texto de divulgação:** produzido | não produzido

---

# Ciclo pós-live

A preparação da próxima live deve utilizar o histórico das lives efetivamente realizadas.

Após uma live concluída, quando solicitado ou quando fizer parte do workflow:

1. identificar o JSON efetivamente utilizado;
2. considerar aquelas músicas como utilizadas;
3. atualizar `x em lives` no catálogo;
4. preservar demais dados da planilha;
5. usar essa nova contagem na próxima execução.

## Importante

Não incrementar `x em lives` apenas porque um repertório foi criado.

A contagem só deve mudar depois que a live correspondente tiver realmente ocorrido.

Se uma música programada tiver sido pulada e houver registro confiável disso, não contabilizá-la como executada.

Na ausência desse registro, declarar que a contagem representa presença no repertório executado, não comprovação absoluta de performance.

---

# Regras de execução

1. Checkbox `[x]` significa executado e verificado.
2. Não marcar antecipadamente tarefas.
3. Não transformar `NOT VERIFIED` em PASS.
4. Não inventar dado ausente.
5. Não alterar fontes originais para fazer a validação passar.
6. Não reconstruir URLs.
7. Não substituir links silenciosamente.
8. Se uma instrução explícita da live conflitar com um default, seguir a instrução e registrar o override.
9. Evitar burocracia que não aumente qualidade ou rastreabilidade.
10. O JSON deve ser derivado do repertório aprovado, nunca de uma seleção paralela.

---

# Critério de sucesso

A Spec está concluída quando existe:

- repertório executável para a live solicitada;
- validação concluída sem FAILs ocultos;
- fontes preservadas literalmente;
- JSON compatível com o Live Console;
- nome do artefato definido por data;
- texto de divulgação pronto;
- limitações conhecidas explicitadas.

Fluxo final esperado:

contexto atual  
→ `build-live-setlist`  
→ repertório candidato  
→ `validate-live-setlist`  
→ correções  
→ repertório aprovado  
→ JSON `live-YYYY-MM-DD.json`  
→ validação de integridade do JSON  
→ texto de divulgação  
→ conclusão

