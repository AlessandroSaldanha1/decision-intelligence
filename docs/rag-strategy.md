# RAG Strategy — Decision Intelligence

## Visão Geral

O RAG (Retrieval Augmented Generation) é o coração do diferencial do produto. Ele permite que Claude tenha acesso ao conhecimento organizacional acumulado pelo time ao longo do tempo.

## Arquitetura Atual (Mock)

A busca atual é textual simples, implementada em `/lib/rag/mock-knowledge.ts`.

- **KnowledgeDocument**: documento indexado (task, comentário, doc)
- **KnowledgeChunk**: fragmento de um documento
- **SimilarityResult**: documento + score de similaridade
- **KnowledgeInsight**: padrão, risco, decisão ou oportunidade extraída

## Arquitetura Futura (Vector DB)

```
Indexação:
ClickUp Task → chunking → embedding (Claude/OpenAI) → pgvector/Pinecone

Busca:
query → embedding → similaridade coseno → top-k chunks → contexto para Claude
```

**Opções de Vector DB:**
- **pgvector**: extensão do PostgreSQL, boa para começar
- **Pinecone**: managed, sem infra, escalável
- **Qdrant**: self-hosted, open source, performático

## Tipos de Conhecimento Indexado

1. **Tasks**: título, descrição, tags, status, assignees
2. **Comentários**: texto, autor, data, task relacionada
3. **Subtasks**: similar às tasks, mas com contexto hierárquico
4. **Docs**: conteúdo de documentação técnica e de produto
5. **Decisões**: ADRs e decisões técnicas registradas

## Estratégia de Chunking

- Tasks: 1 chunk por task (geralmente curtas)
- Docs: chunks de 500 tokens com overlap de 50 tokens
- Comentários: 1 chunk por comentário

## Enriquecimento do Contexto

Além dos documentos similares, o RAG também extrai:
- **Padrões**: comportamentos recorrentes do time
- **Riscos**: problemas que já ocorreram em contextos similares
- **Decisões**: escolhas técnicas consolidadas
- **Insights do time**: resumo em linguagem natural

## Interface do KnowledgeService

```typescript
service.getSources()              // lista fontes disponíveis
service.search(query, limit)      // busca semântica
service.getInsights(tags)         // insights por tags
service.buildOrganizationalContext(demand)  // contexto completo
service.formatContextForClaude(context)     // formata para injeção no prompt
```
