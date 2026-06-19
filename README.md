# Decision Intelligence

> Transformamos conhecimento organizacional em software entregável.

Decision Intelligence é uma plataforma de Inteligência Organizacional que conecta ao ClickUp, recupera conhecimento via RAG e usa Claude para gerar artefatos de produto e engenharia de alta qualidade.

---

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Anthropic SDK** — Claude para análise e geração
- **Axios** — integração com ClickUp API
- **Docker** + docker-compose

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker (opcional)

---

## Como rodar local

```bash
cp .env.example .env.local
# edite .env.local com suas credenciais
npm install
npm run dev
```

Acesse **http://localhost:3000**

> **Sem credenciais?** O sistema funciona em modo demo com dados mock.

---

## Como rodar com Docker

```bash
cp .env.example .env
docker compose up --build
```

---

## Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| ANTHROPIC_API_KEY | Não* | Chave Claude API |
| ANTHROPIC_MODEL | Não | Padrão: claude-sonnet-4-6 |
| CLICKUP_API_TOKEN | Não* | Token ClickUp (Settings → Apps → API) |
| CLICKUP_WORKSPACE_ID | Não | ID do workspace |
| CLICKUP_DEFAULT_LIST_ID | Não | List padrão para publicação |

*Se vazio, usa dados mock.

---

## Fluxo do Produto

```
/onboarding → /workspace → /knowledge-sources → /dashboard
  → /demand/new
  → /demand/[id]/insights      (RAG: contexto organizacional)
  → /demand/[id]/analysis      (Claude Analysis)
  → /demand/[id]/artifacts     (User Story, BDD, Test Cases, DoD)
  → /demand/[id]/delivery-plan (Plano por frente)
  → /demand/[id]/publish       (Publicar no ClickUp)
  → /demand/[id]/result
```

---

## Comandos

```bash
npm run dev         # Desenvolvimento
npm run build       # Build produção
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run format      # Prettier
docker compose up --build  # Docker
```

---

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `CLAUDE.md` | Regras para Claude Code |
| `docs/product-overview.md` | Visão do produto |
| `docs/architecture.md` | Arquitetura técnica |
| `docs/business-rules.md` | Regras de negócio |
| `docs/integrations.md` | Integrações ClickUp e Claude |
| `docs/rag-strategy.md` | Estratégia de RAG |
| `design/flows/` | Especificação de cada fluxo |
| `ai/prompts/` | Prompts do Claude |
