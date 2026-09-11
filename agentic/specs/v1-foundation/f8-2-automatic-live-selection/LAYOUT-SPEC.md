# F8.2 — Layout e interação

## Entrada da geração

Na área de Lives, oferecer uma ação **Gerar seleção automática**.

Formulário mínimo:

- **Quantidade de referência**, preenchida com 30;
- **Autorais desejadas**, preenchida com 0 ou com o valor configurado pelo usuário;
- abertura opcional, com opção “escolher automaticamente”;
- botão **Gerar rascunho**.

Não exibir campos de vibe, clima ou objetivo.

## Resultado

Após a geração, abrir o mesmo compositor da F8.1.

No topo:

\`\`\`text
Referência automática: 30 músicas
Selecionadas: 28 músicas
Autorais: 2 desejadas · 2 selecionadas
\`\`\`

A referência não bloqueia adições ou remoções manuais.

## Avisos

Quando o resultado ficar abaixo da referência, exibir uma mensagem acessível:

> Foram solicitadas 30 músicas e geradas 28. Não foi encontrada uma combinação válida com 29 ou 30.

Quando a quantidade total for atingida, mas a quantidade de autorais não for:

> A quantidade de músicas foi atingida, mas a meta de autorais não foi totalmente alcançada.

## Composição

A tela continua mostrando:

- abertura fixa;
- blocos como unidades;
- músicas individuais;
- \`xEmLives\` em cada item;
- quantidade de músicas;
- duração informativa;
- controles da F8.1 para mover e remover.

Não mostrar seletor de versão no gerador automático.

## Regeneração

Oferecer **Gerar novamente**. A ação pode usar nova \`seed\`, preservando os mesmos parâmetros.

A regeneração não deve destruir silenciosamente um rascunho editado. Solicitar confirmação ou criar novo rascunho.

## Acessibilidade

- formulário navegável por teclado;
- mensagens com \`role="status"\` ou \`role="alert"\`;
- foco no resultado após gerar;
- nenhuma ação depender somente de arrastar;
- manter controles existentes da F8.1.
