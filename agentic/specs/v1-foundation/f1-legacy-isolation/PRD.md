# F1 — Isolamento executável do Live Console v0

## Problema e objetivo

O console v0 original, baseado em arquivo JSON, não pode ser confundido com as páginas administrativas atuais. Esta fase oferece esse console em uma única entrada pública `/legacy`, sem alterar regras, dados ou APIs atuais.

## Escopo

Isolamento do asset histórico `index.html` do commit `1f8a2e6`, preservando seleção de JSON, reprodução, letras e interações.

Não há páginas administrativas em `/legacy`, Angular, migration ou mudança de schema. Catálogo, lives, blocos e execução permanecem nas rotas atuais da raiz.

## Usuários e jornadas

Operadores locais usam:

```text
/legacy
```

para carregar um repertório JSON e iniciar a live sem depender do catálogo SQLite.

As páginas administrativas continuam em:

```text
/catalogo
/lives
/blocos
/execucao
```

## Aceitação

- `/legacy` responde com o console histórico baseado em JSON.
- `/legacy/catalogo`, `/legacy/lives`, `/legacy/blocos` e `/legacy/execucao` não são páginas legadas e retornam 404.
- As rotas atuais da raiz continuam funcionando sem redirecionamento para `/legacy`.
- O console legado permite selecionar um JSON, carregar as músicas, exibir letras/interações e iniciar a live.
- Testes automatizados e smoke HTTP passam.
- A validação browser é requisito explícito; se indisponível, a entrega permanece bloqueada.

## Riscos e compatibilidade

O principal risco é duplicar ou reescrever incorretamente o HTML histórico e quebrar leitura de JSON, reprodução, letras ou interações.

O mount deve ser aditivo e reversível. APIs, referências, repertórios, banco e páginas atuais não devem ser normalizados ou migrados.

Rollback: remover a rota `/legacy`, o asset histórico e a cópia correspondente no build, sem tocar no banco ou nas páginas atuais.

## Privacidade

Nenhum dado de catálogo, mídia, SQLite, repertório ou segredo é copiado para o Git ou para memória técnica. `.mcp.json` permanece local e não rastreado.

## Pendência para F2

Executar a jornada completa do console JSON com navegador disponível e manter `/legacy` como superfície de compatibilidade durante a construção da Angular v1.
