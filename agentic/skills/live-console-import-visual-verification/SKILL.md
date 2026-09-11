---
name: live-console-import-visual-verification
description: Verifica e corrige a disponibilidade visual da importação V1 no runtime Angular servido pelo Live Console.
version: 1.0
---

# Skill — Importação V1 visível no runtime

## Quando usar

Use quando a tela de importação existe no código, mas não aparece no navegador, ou quando a rota `/v1/importacao` não é comprovadamente servida.

## Procedimento

1. Ler `agentic/rules/live-console-v1.md`, a spec F7 e `ADR-002-v1-importacao-runtime-visual.md`.
2. Verificar branch, status, build Angular, servidor em execução e URL real.
3. Reproduzir a falha em `/v1`, `/v1/importacao` e após refresh direto.
4. Inspecionar console, rede, DOM, base href, chunks, CSS e fallback SPA.
5. Corrigir a causa mínima na fonte, build ou servidor.
6. Não duplicar a tela no `/legacy` e não alterar o contrato V1 para contornar a falha.
7. Rodar testes, typecheck, lint, build e `git diff --check`.
8. Validar no navegador a seleção, prévia e confirmação de um JSON fixture.
9. Atualizar `EVIDENCE.md` com a causa, comandos, URL, viewport e resultado.
10. Fazer commit semântico, publicar a branch e abrir uma PR draft para revisão humana.

## Critério de parada

Não declarar concluído se a tela apenas existir no código. É obrigatório comprovar que o bundle recém-gerado é o bundle servido e que o operador visualiza `Importar` e `/v1/importacao`.
