# Backlog — Decision Intelligence

## Próximas Implementações

### P0 — Core Product
- [ ] Conectar ClickUp real (substituir mock por chamadas reais)
- [ ] Claude Analysis real (remover mock quando ANTHROPIC_API_KEY presente)
- [ ] Persistência de demandas (banco de dados ou arquivo local)
- [ ] Fluxo completo end-to-end com dados reais

### P1 — RAG Real
- [ ] Integrar vector database (pgvector recomendado)
- [ ] Pipeline de indexação de tasks do ClickUp
- [ ] Embeddings via Anthropic ou OpenAI
- [ ] Busca semântica real substituindo busca textual

### P2 — UX
- [ ] Loading states em todas as telas de processamento
- [ ] Error boundaries e mensagens de erro amigáveis
- [ ] Edição de artefatos gerados antes de publicar
- [ ] Histórico de demandas persistido

### P3 — Produto
- [ ] Autenticação de usuários
- [ ] Multi-workspace
- [ ] Configurações de prompt por time/workspace
- [ ] Analytics de uso (quais insightsforam mais úteis)

## Dívidas Técnicas
- [ ] Adicionar testes (Vitest + Testing Library)
- [ ] Adicionar testes E2E (Playwright)
- [ ] Mover estado das telas para Zustand ou React Query
- [ ] Adicionar rate limiting nas API routes
