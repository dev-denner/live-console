---
name: execute-live-repertoire
description: Implementa e valida a execução operacional de repertórios de lives, mantendo planejamento imutável após fechamento, fila dinâmica, registro da ordem real e reconciliação idempotente de xEmLives.
version: 0.1
---

# Execute Live Repertoire

## Fonte de verdade

Leia primeiro a PRD, a especificação técnica, os critérios de aceite, o layout e as regras da F9. Não invente estados ou transições incompatíveis.

## Invariantes

- múltiplos repertórios coexistem;
- somente `rascunho` é editável;
- fechado/executado é duplicável, não reabrível;
- abertura é sempre a primeira posição;
- uma música por `musicaId` em cada repertório;
- adição entra no final;
- músicas presentes não aparecem no seletor;
- execução não remove itens;
- pular não equivale a remover;
- `Marcar tocada` exige `Play`;
- desfazer tocada exige confirmação e auditoria;
- blocos não limitam reordenação durante execução;
- histórico registra ordem real, não ordem planejada;
- `xEmLives` muda somente no encerramento idempotente.

## Método

1. Inspecionar branch, instruções e estado da working tree.
2. Trabalhar em branch de feature baseada em `origin/master`.
3. Implementar domínio/API antes de acoplar a UI.
4. Cobrir transições inválidas e concorrência no servidor.
5. Testar duplicação com itens removidos do catálogo.
6. Testar execução fora da ordem, adição durante execução, skip, undo e encerramento repetido.
7. Validar URLs e caminhos literalmente.
8. Executar browser verification e registrar evidências.

## Não fazer

- não remover músicas durante execução;
- não reabrir repertório fechado;
- não duplicar por título, artista, link ou versão;
- não incrementar `xEmLives` em planejamento ou play;
- não inventar término do YouTube;
- não reconstruir referências de mídia;
- não alterar `/legacy` sem necessidade de compatibilidade.
