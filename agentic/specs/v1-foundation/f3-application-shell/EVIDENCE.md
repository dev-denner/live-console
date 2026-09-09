# Evidências F3

## Estado

- **PLANEJADO** — spec aprovada; implementação ainda não iniciada.
- **Branch de documentação:** `docs/foundation-f3-application-shell`.
- **Escopo:** AppShell, navegação V1 e contrato HTTP tipado; sem funcionalidades de catálogo.

## Evidências exigidas

- build frontend e backend;
- `npm install`;
- typecheck;
- lint;
- todos os testes;
- `git diff --check`;
- smoke HTTP de `/`, páginas atuais, `/legacy` e `/v1`;
- browser para:
  - `/v1`;
  - `/v1/catalogo`;
  - `/v1/lives`;
  - `/v1/blocos`;
  - `/v1/execucao`;
  - estado de sucesso e erro do health check;
  - regressão do console v0 com fixture JSON;
- confirmação de que não foram versionados banco, mídias, repertórios pessoais, exports ou segredos.

## Resultado

A ser preenchido durante a implementação da F3.

## Riscos conhecidos

- Vulnerabilidades transitivas do npm registradas na F2 continuam como manutenção separada.
- A navegação V1 não deve ser confundida com as páginas legadas da raiz.
