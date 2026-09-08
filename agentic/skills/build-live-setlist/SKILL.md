---
name: build-live-setlist
description: Monta o repertório de uma live de Denner Zacarias usando o catálogo e o histórico reais, priorizando alto astral, pedidos recentes, variedade, segurança vocal, baixa repetição e uma curva de energia adequada. Use quando for solicitado criar, montar, preparar, atualizar ou reorganizar o repertório de uma live.
version: 0.2
---

# Build Live Setlist

## Objetivo

Montar um repertório executável para uma live de Denner Zacarias utilizando as fontes atuais disponíveis na pasta das lives.

O repertório deve funcionar como uma experiência contínua para o público, não como uma seleção aleatória de músicas.

A seleção deve considerar não apenas gosto musical, mas também:

- energia da live;
- retenção percebida;
- variedade;
- capacidade vocal;
- histórico de uso;
- pedidos recentes;
- disponibilidade operacional;
- segurança das fontes utilizadas pelo Live Console.

---

# Regra padrão atual

Na ausência de instrução diferente para a live atual:

- selecionar 30 músicas;
- planejar aproximadamente 2 horas de live;
- priorizar músicas de clima alto astral;
- usar no máximo 2 músicas autorais;
- espaçar as autorais;
- considerar pedidos recentes do público;
- favorecer músicas que já funcionaram bem;
- favorecer músicas pouco utilizadas quando forem adequadas;
- evitar repetição excessiva de músicas usadas recentemente;
- evitar músicas ou sequências associadas a queda perceptível de energia ou audiência;
- manter variedade de artistas, décadas e estilos compatíveis com a proposta da live;
- preservar blocos compatíveis e transições graduais de clima;
- preservar a capacidade vocal ao longo da execução.

Uma instrução explícita dada por Denner para a live atual prevalece sobre estes defaults.

---

# Fontes

Antes de selecionar músicas, procurar as fontes atuais disponíveis na estrutura das lives.

Usar, quando aplicável:

1. catálogo/planilha atual de músicas;
2. arquivos existentes em `musicas/`;
3. repertórios anteriores em `repertorios/`;
4. letras disponíveis em `letras/`;
5. pedidos recentes registrados;
6. feedback das lives anteriores;
7. materiais e observações fornecidos para a live atual;
8. regras pertinentes em `agencia-livestyle/`.

Não presumir que uma música existe apenas porque ela seria adequada.

Não usar lembrança antiga se uma fonte atual contradiz essa informação.

---

# Regra crítica — integridade da fonte

Os valores de execução de uma música são dados operacionais e devem ser tratados como **opacos**.

Quando uma música for selecionada:

- copiar literalmente do catálogo o valor de `Link`;
- copiar literalmente do catálogo o valor de `Letra`, quando existir;
- preservar caminhos locais exatamente como cadastrados;
- preservar URLs exatamente como cadastradas.

## É proibido

- reconstruir URL do YouTube;
- trocar `youtu.be` por `youtube.com`;
- trocar `youtube.com` por `youtu.be`;
- remover parâmetros;
- acrescentar parâmetros;
- alterar `t=`;
- alterar query string;
- extrair e remontar video ID;
- procurar automaticamente outro vídeo equivalente;
- substituir um link funcional por outro;
- corrigir silenciosamente um caminho local;
- inventar link inexistente.

Se o catálogo contiver:

`https://youtu.be/ABC?si=123&t=7`

o repertório deve receber exatamente:

`https://youtu.be/ABC?si=123&t=7`

Nenhuma transformação é permitida.

---

# Processo

## 1. Descobrir o universo disponível

Identificar as músicas que realmente podem ser utilizadas.

Para cada candidata, considerar quando os dados existirem:

- música;
- artista;
- status;
- duração;
- playback/local/YouTube;
- disponibilidade de letra;
- estilo primário;
- estilo secundário;
- energia;
- bloco;
- clima;
- histórico de uso;
- `x em lives`;
- pedidos;
- observações;
- esforço vocal;
- desempenho percebido em lives anteriores;
- se é autoral.

---

## 2. Status operacional

Por padrão:

### `OK`

Pode ser considerada para a live.

### `ensaiar`

Não selecionar, salvo override explícito de Denner.

### `Baixar tom`

Não selecionar, salvo override explícito de Denner após preparação adequada.

Outros estados devem ser tratados de acordo com sua semântica explícita no catálogo.

---

## 3. Esforço vocal

Quando a coluna de observação indicar `expressiva`, considerar a música vocalmente exigente.

Regras:

- evitar concentração de músicas `expressiva`;
- preferir no máximo uma quando não houver motivo para usar mais;
- quando houver duas, separá-las amplamente;
- colocar músicas vocalmente mais confortáveis entre elas;
- não usar `expressiva` como abertura;
- evitar `expressiva` perto de outro trecho vocalmente exigente;
- preservar voz suficiente para a reta final.

---

## 4. Histórico e `x em lives`

Usar `x em lives` como sinal de repetição histórica.

A contagem não deve ser uma regra absoluta.

Priorizar, quando musicalmente adequado:

1. músicas `OK` com poucas ou nenhuma utilização;
2. músicas que funcionaram bem mesmo com alguma repetição;
3. músicas muito repetidas somente quando tiverem função clara.

Exemplos de funções que podem justificar repetição:

- abertura forte;
- recuperação após autoral;
- ponte entre estilos;
- grande potencial de interação;
- encerramento comprovadamente eficiente;
- pedido recorrente.

Evitar repetir apenas por familiaridade do processo.

---

## 5. Incorporar novidades

Antes de montar a ordem:

- identificar músicas adicionadas recentemente;
- identificar pedidos do público ainda não atendidos;
- identificar instruções específicas de Denner para a live;
- identificar músicas que devem ser evitadas naquele dia.

Pedidos recentes têm prioridade relevante, mas não podem destruir a coerência do repertório.

---

## Histórico de execução real

Quando houver registros live-AAAA-MM-DD-execucao.json disponíveis:

- usar musicasTocadas como histórico efetivo;
- não considerar musicasNaoTocadas como executadas;
- usar a referência literal gravada no registro para distinguir versões;
- considerar x em lives já reconciliado como sinal auxiliar;
- não inferir que uma música planejada foi tocada sem registro.

---

## 6. Selecionar o conjunto

Selecionar 30 músicas por padrão.

A escolha deve equilibrar:

- reconhecimento;
- capacidade vocal;
- energia;
- variedade;
- pedidos;
- novidades;
- histórico;
- baixa repetição;
- duração;
- segurança operacional.

Não escolher músicas apenas para preencher quantidade.

Não escolher música somente porque possui `x em lives = 0`.

Uma música pouco utilizada continua precisando ser adequada à live.

---

# Blocos e Clima do catálogo

As colunas **Bloco** e **Clima** são sinais de curadoria fornecidos por Denner e devem orientar tanto a seleção quanto a ordem.

## Bloco

- Um bloco agrupa músicas que combinam e têm potencial de tocar próximas.
- Ao escolher uma música de um bloco, buscar mini-sequência contínua de **2 a 5 faixas** do mesmo bloco, quando adequado.
- Não tocar cinco por obrigação e não forçar faixa só para completar bloco.
- Evitar separar músicas do mesmo bloco por várias faixas desconexas sem justificativa.
- Pode haver mais de uma entrada no mesmo bloco se a curva geral justificar; a preferência é manter cada passagem coesa.

## Escala de clima

Saudades (1) → Romântica (2) → Noite (3) → Alegre (4) → Energia (5)

A escala guia transições consecutivas e a ordem interna do bloco:

- preferir transições de um nível por vez;
- Romântica → Noite → Alegre é preferível a Romântica → Energia;
- subidas e descidas são permitidas; não é uma escada obrigatória para a live inteira;
- salto de dois ou mais níveis só ocorre sem intermediária elegível/adequada ou por motivo artístico claro; registrar na observação;
- ao mudar de bloco, procurar uma faixa-ponte de clima igual ou adjacente antes de salto maior.

Se Bloco ou Clima estiverem ausentes no catálogo, não inferir. Registrar NOT VERIFIED para esta dimensão e usar os demais critérios.

---

# Versões: uma música, uma escolha

Tratar variantes como alternativas da mesma música.

1. Formar a chave canônica por Música base, quando preenchida; caso contrário, por Música normalizada.
2. Escolher no máximo **uma** candidata por chave canônica.
3. Escolher a versão mais adequada por status OK, disponibilidade, clima, bloco, histórico e objetivo.
4. Versão, artista ou URL diferente não tornam a segunda variante elegível.
5. Nunca incluir duas versões da mesma música, inclusive quando atribuídas a artistas diferentes.

Exemplos: uma Overkill por live; uma Every Breath You Take por live.

---

# Construção da curva da live

## Abertura

As primeiras músicas devem:

- funcionar rapidamente;
- estabelecer clima positivo;
- ter baixo risco;
- evitar começo lento;
- não exigir que o público já esteja emocionalmente conectado.

Não abrir com autoral.

Não abrir com música marcada como `expressiva`.

---

## Desenvolvimento

Alternar adequadamente:

- artistas;
- décadas;
- estilos;
- níveis de energia.

Usar estilo secundário como ponte quando isso produzir uma transição mais natural.

Evitar blocos longos com sensação de repetição.

Músicas consecutivas do mesmo artista devem ser exceção consciente.

---

## Picos

Distribuir músicas de forte reconhecimento e alto potencial de interação ao longo da live.

Não gastar todas as músicas mais fortes no início.

---

## Momentos de respiro

Músicas mais emocionais ou lentas podem existir, mas devem ser posicionadas conscientemente.

Após um bloco de menor energia, planejar recuperação.

Evitar várias músicas de baixa energia em sequência.

---

## Encerramento

As últimas músicas devem transmitir sensação clara de fechamento positivo.

Preferir uma sequência crescente ou celebrativa.

Evitar terminar por acidente com uma música fraca apenas porque era a última restante.

Músicas que comprovadamente funcionaram muito bem como encerramento podem ser reutilizadas conscientemente.

---

# Autorais

Por padrão:

- máximo de 2 autorais;
- não colocar próximas uma da outra;
- posicioná-las entre músicas conhecidas;
- evitar usar autoral como abertura;
- evitar autoral imediatamente antes de música de baixo reconhecimento;
- considerar o histórico real de retenção.

Se o desempenho recente sugerir melhor resultado com apenas uma autoral, isso pode ser preferível.

O objetivo é apresentar o trabalho autoral sem sacrificar a experiência global da live.

---

# Pedidos

Quando Denner informar explicitamente que determinada música ou artista foi pedido:

- tratar como sinal forte;
- tentar incluir pelo menos um pedido relevante;
- verificar antes se a música está disponível e adequada;
- não incluir cegamente se houver impedimento operacional.

Se existirem vários pedidos incompatíveis com a duração, priorizar os mais recentes, recorrentes ou relevantes para aquela live.

---

# Evitar concentração

Evitar, salvo justificativa:

- músicas consecutivas do mesmo artista;
- muitas músicas da mesma década em sequência;
- blocos excessivos do mesmo estilo;
- várias músicas lentas consecutivas;
- músicas de risco concentradas;
- autorais concentradas;
- músicas `expressiva` concentradas;
- excesso de músicas muito repetidas.

---

# Duração

Quando houver duração confiável das faixas, calcular a duração aproximada.

Considerar que uma live inclui também:

- fala;
- interação;
- intervalos;
- pedidos;
- pequenos ajustes;
- possíveis mudanças de ordem.

Não preencher artificialmente exatamente 120 minutos de áudio.

A meta é um repertório compatível com aproximadamente 2 horas.

Se as durações não estiverem disponíveis de forma confiável, registrar:

`NOT VERIFIED`

Não inventar duração.

---

# Resultado

Produzir uma lista ordenada contendo, no mínimo:

1. posição;
2. música;
3. artista.

Quando as fontes permitirem, incluir também:

- fonte;
- link ou arquivo;
- letra;
- duração;
- estilo;
- observação relevante;
- pedido;
- autoral;
- histórico de uso.

---

# Resultado para Live Console

Quando solicitado produzir JSON para o Live Console:

- usar a estrutura do Live Console vigente;
- copiar `youtube`, `arquivo` e `letra` literalmente do catálogo;
- nunca reconstruir fontes;
- manter interações adequadas à posição da música;
- incluir observações úteis para execução;
- não adicionar campos arbitrários incompatíveis com o formato vigente.

---

# Validação obrigatória

Após montar o repertório, NÃO declarar conclusão imediatamente.

Executar a Skill:

`validate-live-setlist`

Se a validação encontrar problema crítico:

1. corrigir;
2. validar novamente;
3. só então apresentar como repertório final.

---

# Critério de sucesso

O repertório está pronto quando:

- possui a quantidade esperada ou exceção explicitamente justificada;
- utiliza músicas realmente disponíveis;
- possui boa distribuição de energia;
- incorpora adequadamente pedidos e novidades;
- respeita as regras das autorais;
- respeita as restrições vocais;
- não apresenta concentração injustificada;
- evita repetição excessiva sem motivo;
- mantém integridade literal das fontes;
- passou pela validação.

---

# Não fazer

- Não inventar música inexistente no catálogo.
- Não inventar duração.
- Não inventar pedido do público.
- Não marcar uma faixa como disponível sem evidência.
- Não modificar URL do catálogo.
- Não modificar caminho local do catálogo.
- Não procurar fonte alternativa silenciosamente.
- Não reproduzir automaticamente a ordem de uma live anterior.
- Não usar apenas preferência musical abstrata ignorando o histórico real.
- Não alterar arquivos-fonte sem que isso faça parte da solicitação.

