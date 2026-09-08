# Live Console — Agentic Assets

Este diretório contém os ativos agênticos usados para preparar, validar e futuramente analisar as lives de Denner Zacarias.

## Objetivo

Transformar procedimentos recorrentes das lives em processos explícitos e reutilizáveis, reduzindo a dependência de contexto acumulado em conversas.

O chat fornece principalmente:
- a intenção atual;
- pedidos novos;
- músicas novas;
- exceções do dia;
- feedback recente.

As regras permanentes devem viver nas Skills e Specs.

## Estrutura

agentic/
├── skills/
│   ├── build-live-setlist/
│   │   └── SKILL.md
│   └── validate-live-setlist/
│       └── SKILL.md
└── specs/
    └── prepare-daily-live/
        └── SPEC.md

## Fontes de contexto

A pasta raiz das lives contém dados vivos que NÃO devem ser duplicados dentro das Skills:

- `musicas/` — catálogo e arquivos disponíveis;
- `letras/` — letras disponíveis;
- `repertorios/` — repertórios anteriores e resultados gerados;
- `agencia-livestyle/` — orientações e restrições aplicáveis às lives;
- `materiais/` — materiais auxiliares;
- `live-console/` — aplicação e artefatos de execução.

Quando houver planilha, JSON ou outra fonte canônica mais atual, ela deve prevalecer sobre exemplos ou informações antigas presentes nas Skills.

## Princípios

1. Skill define COMO executar bem uma atividade recorrente.
2. Spec define O QUE deve ser executado em um processo concreto.
3. Dados vivos permanecem em suas fontes originais.
4. Não inventar dados ausentes.
5. Não alterar arquivos de origem para facilitar uma execução.
6. Resultado só é considerado concluído após validação.
7. Checkbox concluído significa tarefa executada e verificada, não apenas tentada.
8. Instrução explícita dada por Denner para a live atual prevalece sobre defaults destas Skills.

## Fluxo diário básico

prepare-daily-live
        |
        v
build-live-setlist
        |
        v
validate-live-setlist
        |
        +---- falhou ---> corrigir ---> validar novamente
        |
        v
repertório aprovado
        |
        v
salvar em repertorios/

## Estado

Versão inicial: V0.1

Este conjunto deve evoluir a partir do uso real. Não adicionar complexidade apenas por formalismo.