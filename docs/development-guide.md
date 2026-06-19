# Development Guide — Decision Intelligence

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker (opcional, para container)

## Setup Local

```bash
git clone <repo>
cd decision-intelligence

cp .env.example .env.local
# edite .env.local com suas credenciais

npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| ANTHROPIC_API_KEY | Não* | Chave da API Claude |
| ANTHROPIC_MODEL | Não | Modelo (padrão: claude-sonnet-4-6) |
| CLICKUP_API_TOKEN | Não* | Token do ClickUp |
| CLICKUP_WORKSPACE_ID | Não | ID do workspace padrão |
| CLICKUP_DEFAULT_LIST_ID | Não | List padrão para publicação |

*Se vazio, usa dados mock.

## Scripts

```bash
npm run dev         # servidor de desenvolvimento
npm run build       # build de produção
npm run start       # servidor de produção
npm run lint        # ESLint
npm run format      # Prettier (write)
npm run typecheck   # TypeScript sem emit
```

## Adicionando uma Nova Tela

1. Leia `/design/flows/` para entender o fluxo
2. Leia `/design/screens/` para especificação visual
3. Crie `app/(app)/[rota]/page.tsx`
4. Componentes reutilizáveis em `components/ui/`
5. Lógica de negócio: nunca no componente, sempre em `services/`

## Adicionando um Novo Endpoint

1. Leia `/docs/integrations.md`
2. Crie a API route em `app/api/[...]/route.ts`
3. Adicione o método no service correspondente
4. Exporte tipos de `/types/`

## Adicionando um Novo Prompt Claude

1. Documente o contrato de entrada/saída em `/ai/context/output-contracts.md`
2. Escreva o prompt em `/ai/prompts/`
3. Implemente o service em `services/claude/`
4. Retorne sempre JSON puro (sem markdown)

## Docker

```bash
docker compose up --build
# disponível em http://localhost:3000
```

## Padrões de Código

- TypeScript estrito, sem `any`
- Componentes com `'use client'` apenas quando necessário
- Secrets apenas em API routes, nunca em componentes
- Nenhum log de secrets ou dados sensíveis
