# Integrations — Decision Intelligence

## ClickUp API

**Base URL:** `https://api.clickup.com/api/v2`

**Autenticação:** Header `Authorization: {token}` (não Bearer)

**Endpoints usados:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/team` | Lista workspaces |
| GET | `/team/{id}/space` | Lista spaces do workspace |
| GET | `/space/{id}/folder` | Lista folders do space |
| GET | `/folder/{id}/list` | Lista lists do folder |
| GET | `/list/{id}/task` | Lista tasks da list |
| GET | `/task/{id}/comment` | Lista comentários da task |
| POST | `/list/{id}/task` | Cria task |
| POST | `/task/{id}/comment` | Adiciona comentário |

**Variáveis de ambiente:**
```
CLICKUP_API_TOKEN=pk_xxxx
CLICKUP_WORKSPACE_ID=
CLICKUP_DEFAULT_LIST_ID=
```

**Mock Mode:** Se `CLICKUP_API_TOKEN` estiver vazio, todos os métodos retornam dados mock de `/lib/clickup/mock-data.ts`.

## Claude / Anthropic API

**SDK:** `@anthropic-ai/sdk`

**Modelo padrão:** `claude-sonnet-4-6`

**Endpoints:**
- `messages.create` — para análise, geração de artefatos e plano de entrega

**Variáveis de ambiente:**
```
ANTHROPIC_API_KEY=sk-ant-xxxx
ANTHROPIC_MODEL=claude-sonnet-4-6
```

**Mock Mode:** Se `ANTHROPIC_API_KEY` estiver vazio, os services retornam dados mock hardcoded.

**Estratégia de Prompts:**
- Prompts ficam em `/ai/prompts/`
- Os services injetam os prompts com os dados da demanda e contexto organizacional
- Sempre retornam JSON puro (sem markdown)
