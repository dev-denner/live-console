# F5.3 — Aplicação visual do OpenDesign no Catálogo V1

## Objetivo

Aplicar o pacote visual OpenDesign já versionado em `design-systems/live-console/` à tela de Catálogo V1, criando uma superfície consistente, legível em palco e acessível sem alterar o comportamento do produto.

## Problema

A fundação OpenDesign e os tokens já existem, mas a tela de catálogo ainda concentra regras visuais repetidas, valores soltos e estados com hierarquia desigual. Isso dificulta evoluir a interface para blocos e repertórios sem copiar decisões de estilo.

## Escopo

- usar tokens semânticos do pacote OpenDesign no catálogo;
- padronizar filtros, botões, badges, tabela, ações e diálogos;
- manter títulos completos legíveis, com quebra e tooltip acessível;
- manter mídia e versão separadas visualmente como `YouTube · Original`;
- melhorar os estados de carregamento, vazio e erro;
- garantir diálogos iniciando no topo, com cabeçalho visível, Escape e foco preservados;
- manter a experiência responsiva e compatível com redução de movimento;
- registrar testes de contrato visual e evidência de validação.

## Fora de escopo

- alterações na API, SQLite, migrations ou contratos `/legacy`;
- alterações em uploads, letras, versões, exclusão ou `xEmLives`;
- criação de blocos, importação ou fabricação automática de repertórios;
- instalação de dependência externa do OpenDesign;
- redesign das telas de lives, blocos ou execução.

## Critérios de aceite

- catálogo usa os tokens `--lc-*` como fonte visual principal;
- não há gradiente decorativo nem cor hexadecimal solta no CSS do catálogo;
- títulos longos não são truncados sem alternativa acessível;
- estados loading, vazio e erro continuam identificáveis por texto e estrutura;
- filtros e ações continuam funcionando com teclado;
- diálogos permanecem dentro da viewport, começam no topo do scroll e preservam Escape/foco;
- API, persistência, uploads, exclusão, `xEmLives` e `/legacy` permanecem inalterados;
- testes, typecheck, lint, build e validação no navegador passam.
