# Business Rules — Decision Intelligence

## Regras de Análise

### Risco Score
- 0–39: baixo risco (verde)
- 40–69: risco médio (amarelo)
- 70–100: alto risco (vermelho)

Calculado por Claude com base em: complexidade técnica, integrações externas, dependências de times, ambiguidades na demanda.

### Fontes de Conhecimento
- Apenas fontes com `enabled: true` são usadas na busca RAG
- Uma demanda pode usar múltiplas fontes simultaneamente
- As fontes mais recentes têm maior peso na similaridade

### Geração de Artefatos
- Artefatos só são gerados após a análise Claude ser concluída
- O contexto organizacional recuperado pelo RAG é sempre injetado no prompt
- O plano de entrega é gerado a partir da User Story + Análise

## Regras de Publicação no ClickUp

### Estrutura de Tasks
- 1 task principal com título e descrição da User Story
- Subtasks prefixadas com `[BACKEND]`, `[FRONTEND]`, `[QA]`, `[PRODUTO]`, `[DEVOPS]`
- Tags `decision-intelligence` e `generated` adicionadas automaticamente
- Comentário com contexto da demanda original adicionado à task principal

### Prioridade
- critical → Urgente (1)
- high → Alta (2)
- medium → Normal (3)
- low → Baixa (4)

## Regras de Segurança

- `CLICKUP_API_TOKEN` nunca é exposto ao frontend
- `ANTHROPIC_API_KEY` nunca é exposto ao frontend
- Tokens são lidos apenas em `lib/config/env.ts` (server-side)
- API routes são o único ponto de acesso às integrações
- Logs nunca devem incluir valores de secrets
