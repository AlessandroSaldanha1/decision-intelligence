# Architecture — Decision Intelligence

## Stack

- **Next.js 16** com App Router
- **TypeScript** estrito
- **Tailwind CSS v4**
- **Anthropic SDK** (@anthropic-ai/sdk)
- **Axios** para chamadas HTTP ao ClickUp
- **Docker** + **docker-compose**

## Estrutura de Pastas

```
/app                    # Next.js App Router
  /(app)               # Layout com header/nav
    /dashboard
    /workspace
    /knowledge-sources
    /demand/[id]       # Fluxo por demanda
      /insights
      /analysis
      /artifacts
      /delivery-plan
      /publish
      /result
  /api                 # API routes (server-side only)
    /clickup/...
    /claude/...
    /rag/...
  /onboarding          # Tela pública de conexão

/components             # Componentes React
  /layout              # AppShell, Header, etc
  /ui                  # Componentes base reutilizáveis
  /decision-intelligence  # Componentes de domínio
  /clickup
  /rag
  /artifacts

/lib                   # Código utilitário
  /clickup/client.ts   # HTTP client do ClickUp
  /clickup/mock-data.ts
  /claude/client.ts    # Anthropic client singleton
  /rag/mock-knowledge.ts
  /config/env.ts       # Variáveis de ambiente tipadas

/services              # Lógica de negócio
  /clickup/clickup.service.ts
  /claude/claude-analysis.service.ts
  /claude/artifact-generation.service.ts
  /claude/delivery-plan.service.ts
  /knowledge/knowledge.service.ts

/types                 # TypeScript types
  /clickup.ts
  /claude.ts
  /knowledge.ts
  /demand.ts
```

## Decisões Arquiteturais

### Server-Side Only para Integrações

Todas as chamadas para ClickUp e Claude são feitas via API routes do Next.js. O token da API nunca é exposto ao frontend.

### Mock Mode

Se `CLICKUP_API_TOKEN` ou `ANTHROPIC_API_KEY` estiverem vazios, o sistema usa dados mock. Isso permite desenvolvimento e demo sem credenciais reais.

### Sem State Management Global

O estado das demandas é mantido localmente nas páginas durante o fluxo. Futuro: adicionar Zustand ou React Query para persistência.

### Sem Vector Database (por enquanto)

A busca RAG atual usa busca textual simples em dados mock. A arquitetura está preparada para adicionar um vector database (pgvector, Pinecone, Qdrant) sem quebrar a interface.
