# CLAUDE.md — Decision Intelligence

Este arquivo define como Claude Code deve se comportar neste projeto.

---

## Visão do Produto

Decision Intelligence é uma plataforma de Inteligência Organizacional que transforma conhecimento disperso em software entregável.

**Pitch:** "Transformamos conhecimento organizacional em software entregável."

Leia `/docs/product-overview.md` para contexto completo antes de qualquer tarefa.

---

## Stack

- Next.js 16 com App Router
- TypeScript estrito (sem `any`)
- Tailwind CSS v4
- @anthropic-ai/sdk para Claude
- Axios para ClickUp API
- Docker / docker-compose

---

## Regras de Desenvolvimento

### Antes de qualquer tarefa

1. **Leia este arquivo completamente**
2. Para tarefas de UI: leia `/design/flows/` e `/design/screens/` antes de alterar código
3. Para regras de negócio: leia `/docs/business-rules.md`
4. Para integrações: leia `/docs/integrations.md`
5. Para prompts Claude: leia `/ai/context/` e `/ai/prompts/`

### Implementando uma nova tela

```
1. Ler /design/flows/[fluxo].md → entender o fluxo
2. Ler /design/screens/ → verificar especificação visual
3. Ler /docs/business-rules.md → regras de negócio
4. Criar a tela em app/(app)/[rota]/page.tsx
5. Componentes reutilizáveis em components/ui/
6. Nunca colocar lógica de negócio em componentes visuais
```

### Implementando uma integração

```
1. Ler /docs/integrations.md
2. Adicionar o método no service em services/[integration]/
3. Criar API route em app/api/[integration]/route.ts
4. Nunca expor tokens no frontend
5. Manter mock mode funcional (sem token = usa mocks)
```

### Implementando um prompt Claude

```
1. Ler /ai/context/output-contracts.md → contrato de output
2. Ler /ai/prompts/ → ver prompts existentes
3. Implementar no service em services/claude/
4. Sempre retornar JSON puro (sem markdown)
5. Manter mock para quando ANTHROPIC_API_KEY estiver vazio
```

---

## Arquitetura de Pastas

```
/app/(app)/          → Páginas com header/nav
/app/api/            → API routes (server-side ONLY)
/app/onboarding/     → Tela pública de conexão
/components/layout/  → AppShell, Header
/components/ui/      → Componentes base reutilizáveis
/lib/                → Código utilitário (sem estado)
/services/           → Lógica de negócio (serviços)
/types/              → TypeScript interfaces
/docs/               → Documentação técnica e de produto
/design/             → Especificação visual e de fluxo
/ai/                 → Prompts e contexto para Claude
```

---

## Padrões de Código

### TypeScript

- Sem `any` — use tipos específicos ou `unknown`
- Tipos em `/types/` quando usados em mais de 1 arquivo
- Props de componentes: interface inline ou no mesmo arquivo

### Componentes React

- `'use client'` apenas quando usar hooks de browser (useState, useEffect, etc.)
- Server Components por padrão (sem 'use client')
- Sem lógica de negócio em componentes — apenas apresentação

### Segurança

- Tokens e API keys: APENAS em server-side (lib/config/env.ts)
- NUNCA passar `process.env.ANTHROPIC_API_KEY` para o frontend
- NUNCA logar secrets
- API routes são o único ponto de acesso às integrações externas

### Estilos

- Tailwind CSS v4 — sem CSS modules, sem styled-components
- Design tokens: ver `/design/screens/README.md`
- Background padrão: `bg-gray-950`
- Cards: `bg-gray-900` com `border-white/10`
- Primária: `violet-600`

---

## Design System

Antes de criar qualquer componente visual novo, verifique:

1. Existe um componente similar em `/components/ui/`?
2. O padrão visual está descrito em `/design/screens/README.md`?
3. Está consistente com as telas já existentes?

Paleta de cores:

- `bg-gray-950` → fundo geral
- `bg-gray-900` → cards e painéis
- `violet-600` → botão primário, destaques
- `green-400` → sucesso
- `blue-400` → info/processando
- `yellow-400` → aviso/risco médio
- `red-400` → erro/risco crítico

---

## Fluxo de Desenvolvimento com Claude Code

### Para implementar uma nova feature:

```
"Implemente a tela Nova Demanda conforme /design/flows/03-new-demand.md"
```

Claude Code deve:

1. Ler o arquivo de flow especificado
2. Verificar tipos em /types/
3. Verificar se há services existentes
4. Implementar a tela
5. Manter navegação entre telas intacta

### Para conectar uma integração real:

```
"Conecte a integração real do ClickUp substituindo os mocks"
```

Claude Code deve:

1. Ler /docs/integrations.md
2. Verificar /lib/clickup/client.ts
3. Verificar /services/clickup/clickup.service.ts
4. Substituir mocks por chamadas reais
5. Garantir que mock mode ainda funciona sem token

---

## O que NÃO fazer

- Não alterar tipos em `/types/` sem verificar todos os usos
- Não colocar lógica de negócio em componentes React
- Não expor variáveis de ambiente sensíveis ao frontend
- Não misturar mock e real no mesmo service sem usar `isMockMode()`
- Não criar abstrações desnecessárias antes de ter 3+ casos de uso reais
- Não alterar o design system sem consultar `/design/screens/README.md`
- Não criar novas telas sem verificar `/design/flows/` primeiro
- Não ignorar o TypeScript — todos os erros de tipo devem ser corrigidos

---

## Comandos Úteis

```bash
npm run dev        # desenvolvimento local
npm run typecheck  # verificar TypeScript
npm run lint       # verificar ESLint
npm run format     # formatar com Prettier
docker compose up --build  # subir com Docker
```

---

## Referências

- `/docs/product-overview.md` — visão do produto
- `/docs/architecture.md` — arquitetura técnica
- `/docs/business-rules.md` — regras de negócio
- `/docs/integrations.md` — documentação de integrações
- `/docs/rag-strategy.md` — estratégia de RAG
- `/docs/development-guide.md` — guia de desenvolvimento
- `/design/README.md` — como usar a pasta de design
- `/ai/context/product-context.md` — contexto para Claude
- `/ai/context/output-contracts.md` — contratos de output
