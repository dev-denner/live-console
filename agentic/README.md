# Live Console — Agentic Assets

`agentic/` é a casa canônica, independente de ferramenta, para os ativos que orientam pessoas e agentes no Live Console. Nenhuma regra permanente deve depender apenas do histórico de uma conversa ou de um agente específico.

## Quem usa

- pessoas que especificam, revisam ou validam;
- Codex, GitHub Copilot, Claude Code e outros agentes;
- automações locais futuras.

Um adaptador de ferramenta pode apontar para estes arquivos, mas não deve duplicar a autoridade.

## Estrutura

```text
agentic/
  README.md
  rules/                 # regras permanentes e verificáveis
  skills/                # procedimentos reutilizáveis
    aidd-feature/
    live-console-domain/
    build-live-setlist/
    validate-live-setlist/
  context/               # síntese factual e ponte entre specs
  specs/                 # PRDs, specs técnicas e evidências por feature
    v0.1/                # material histórico preservado
    v1-foundation/       # primeira spec da reconstrução
```

## Princípios

1. Skill define como realizar uma atividade recorrente.
2. Rule define uma restrição permanente.
3. Spec define o que uma entrega concreta deve fazer.
4. Context resume o estado conhecido, com links para a evidência canônica.
5. Dados pessoais, catálogo, mídia, letras, repertórios, SQLite, exports, caminhos e segredos não entram aqui.
6. Instrução explícita mais recente de Denner prevalece sobre defaults, desde que não viole segurança ou privacidade.
7. Nenhuma UI é considerada entregue apenas porque a rota responde: o caminho clicável deve ser testado no navegador.

## V0 e V1

O material histórico permanece em `specs/v0.1/`. A reconstrução usa `skills/aidd-feature`, `skills/live-console-domain`, `rules/live-console-v1.md` e specs em `specs/v1-foundation/`.

Durante a foundation, v0 ficará acessível em `/legacy`. V1 será especificada e validada página a página antes de substituir qualquer fluxo operacional.
