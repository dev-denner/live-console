# ADR-004 — Seleção automática como pré-seleção de rascunho

- Status: aceito
- Data: 2026-09-11
- Escopo: Live Console V1 / F8.2

## Contexto

A F8.1 permite montar manualmente um rascunho de live. A próxima necessidade é reduzir o trabalho inicial sem transformar a seleção automática em execução ou em decisão irreversível.

O catálogo atual usa \`ativo\`, IDs estáveis, blocos, versões e \`xEmLives\`. Os antigos campos de vibe, clima e objetivo não fazem parte do fluxo V1.

## Decisão

A seleção automática:

1. gera um rascunho compatível com a F8.1;
2. usa quantidade de referência, padrão 30;
3. tenta alcançar a quantidade sem ultrapassá-la;
4. se não encontrar combinação exata, escolhe a maior quantidade inferior possível;
5. usa \`musicaId\` como identidade;
6. trata blocos como unidades indivisíveis;
7. preserva a abertura na primeira posição;
8. prefere menor \`xEmLives\`;
9. escolhe abertura não usada na live anterior quando houver histórico;
10. não escolhe versões;
11. não usa vibe, clima ou objetivo;
12. não altera o catálogo nem \`xEmLives\`.

## Alternativas rejeitadas

### Quantidade obrigatória

Rejeitada porque a live pode ser encerrada com uma quantidade diferente. O número é apenas orientação do automatizador.

### Seleção por duração

Rejeitada nesta etapa porque a versão tocada só será escolhida no momento da execução e pode alterar a duração.

### Seleção por \`musicaBase\`

Rejeitada como identidade operacional. A música é uma entidade única e o ID estável é suficiente; duplicidade de artista/título deve ser tratada no cadastro.

### Seleção por vibe/clima/objetivo

Rejeitada porque esses campos não fazem parte do catálogo V1 atual.

### Preferência por YouTube

Rejeitada. Qualquer mídia local ou YouTube válida tem o mesmo peso de disponibilidade.

## Consequências

- o algoritmo é previsível e explicável;
- blocos podem fazer a quantidade ficar abaixo da referência;
- o usuário mantém controle total após a geração;
- seleção de versão continua sendo uma preocupação da execução;
- o histórico da live anterior melhora apenas a escolha da abertura quando estiver disponível.
