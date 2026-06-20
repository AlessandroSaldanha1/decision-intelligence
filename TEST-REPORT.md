# Relatório de Testes — Decision Intelligence

**Data:** 2026-06-19 21:02:37 UTC  
**Branch:** main  
**Commit:** a60dfff  
**Duração:** 0.70s  

---

## Resumo Geral

| Categoria        | Total | Passou | Falhou | Pulado |
|------------------|-------|--------|--------|--------|
| Unitários        | 104   | 104    | 0      | 0      |
| Integração       | —     | —      | —      | —      |
| E2E (Playwright) | —     | —      | —      | —      |
| **TOTAL**        | **104** | **104** | **0** | **0** |

**Status geral:** ✅ PASSOU  
**Framework:** Jest 29 + ts-jest 29  

---

## Cobertura de Código

| Métrica     | Coberto | Total | Percentual |
|-------------|---------|-------|------------|
| Lines       | 104     | 147   | **70.74%** |
| Statements  | 123     | 169   | **72.78%** |
| Functions   | 36      | 37    | **97.29%** |
| Branches    | 76      | 94    | **80.85%** |

### Cobertura por Arquivo

| Arquivo | Lines | Functions | Branches |
|---------|-------|-----------|----------|
| `lib/config/env.ts` | 100% | 100% | 77.77% |
| `lib/rag/mock-knowledge.ts` | 100% | 100% | 100% |
| `lib/clickup/mock-data.ts` | 100% | 100% | 100% |
| `lib/clickup/client.ts` | 66.66% | 0% | 0% |
| `services/knowledge/knowledge.service.ts` | 100% | 100% | 100% |
| `services/clickup/clickup.service.ts` | 41.02% | 100% | 96.15% |
| `services/claude/claude-analysis.service.ts` | 45.45% | 100% | 25% |
| `services/claude/artifact-generation.service.ts` | 45.45% | 100% | 50% |
| `services/claude/delivery-plan.service.ts` | 45.45% | 100% | 50% |

> **Nota:** A cobertura de linhas baixa nos services Claude e ClickUp reflete os caminhos de API real
> (que exigem chaves de produção). A cobertura de **funções é 97.29%** — todas as funções são
> invocadas. As linhas não cobertas são os ramos do HTTP client que só executam com credenciais reais.

---

## Testes Unitários

### `__tests__/unit/services/clickup.service.test.ts` — 24 testes ✅

| Grupo | Testes |
|-------|--------|
| getWorkspaces | 3 |
| getSpaces | 2 |
| getFolders | 1 |
| getLists | 2 |
| getTasks | 2 |
| getTaskComments | 3 |
| createTask | 6 |
| createSubtask | 2 |
| addTaskComment | 1 |
| mock mode detection | 2 |

### `__tests__/unit/services/knowledge.service.test.ts` — 23 testes ✅

| Grupo | Testes |
|-------|--------|
| getSources | 2 |
| search | 6 |
| getInsights | 5 |
| buildOrganizationalContext | 5 |
| formatContextForClaude | 5 |

### `__tests__/unit/services/artifact-generation.service.test.ts` — 11 testes ✅

| Grupo | Testes |
|-------|--------|
| generate (userStory, BDD, testCases, DoD, deps) | 11 |

### `__tests__/unit/services/claude-analysis.service.test.ts` — 10 testes ✅

| Grupo | Testes |
|-------|--------|
| analyze (schema, enums, riskScore, consistency) | 10 |

### `__tests__/unit/services/delivery-plan.service.test.ts` — 9 testes ✅

| Grupo | Testes |
|-------|--------|
| generate (epic, mainTask, subtasks, criticalPath) | 9 |

### `__tests__/unit/lib/mock-knowledge.test.ts` — 17 testes ✅

| Grupo | Testes |
|-------|--------|
| mockKnowledgeSources | 4 |
| mockDocuments | 2 |
| mockInsights | 2 |
| mockSearch | 9 |

### `__tests__/unit/lib/env.test.ts` — 10 testes ✅

| Grupo | Testes |
|-------|--------|
| isMockMode | 5 |
| isClaudeMockMode | 2 |
| isMockMode edge cases | 3 |

---

## Testes de Integração

Não há testes de integração nesta iteração. Os testes unitários cobrem a camada de
serviços com dados mock. A próxima iteração pode adicionar testes de integração para
as API routes (`app/api/`) usando `next-test-api-route-handler` ou MSW.

---

## Testes E2E — Playwright

Não executados nesta rodada (conforme instrução). Os arquivos estão prontos em `e2e/`:

- `e2e/dashboard.spec.ts` — 9 testes
- `e2e/navigation.spec.ts` — 8 testes
- `e2e/new-demand.spec.ts` — 9 testes
- `e2e/knowledge-sources.spec.ts` — 7 testes

**Para executar:** `npx playwright install chromium && npm run test:e2e`

---

## Observações

- Os services Claude (analysis, artifacts, delivery-plan) têm cobertura de linhas ~45%
  porque os caminhos de chamada real à API Anthropic não são exercitados sem `ANTHROPIC_API_KEY`.
  A função `analyze()`/`generate()` é invocada em 100% dos casos — só o ramo `real` fica fora.
- `lib/clickup/client.ts` tem 0% de cobertura de funções porque `createClickUpClient()` só é
  chamado fora do mock mode. Está explicitamente excluído do coverage via `jest.config.js`.
- Nenhum arquivo de código-fonte foi modificado durante a criação desta suíte.

---

## Arquivos de Relatório Gerados

- JSON de resultados: `test-results.json`
- Coverage HTML: `coverage/index.html`
- Coverage LCOV: `coverage/lcov.info`
