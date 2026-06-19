# Glossary — Decision Intelligence

## Termos do Produto

**Demanda**: Descrição de uma funcionalidade, melhoria ou problema que o time precisa resolver. Input principal do fluxo.

**Organizational Insights**: Conhecimento recuperado do histórico organizacional do time via RAG. Inclui tasks similares, decisões técnicas, padrões e riscos.

**Memória Organizacional**: Base de conhecimento construída a partir das fontes do ClickUp (tasks, comentários, docs). Indexada e disponível para busca semântica.

**RAG (Retrieval Augmented Generation)**: Técnica de busca semântica no conhecimento indexado para enriquecer o contexto enviado ao Claude.

**Análise (Claude Analysis)**: Output do Claude com ambiguidades, riscos, dependências, stakeholders, perguntas em aberto e score de risco.

**Artefatos**: Documentos gerados pelo Claude: User Story, cenários BDD, casos de teste, Definition of Done e dependências.

**Plano de Entrega**: Breakdown estruturado por frente de trabalho (Backend, Frontend, QA, Produto, DevOps) com estimativas e caminho crítico.

**Score de Risco**: Número de 0 a 100 indicando o nível de risco da demanda. Calculado com base em complexidade, integrações, dependências e ambiguidades.

## Termos Técnicos

**KnowledgeDocument**: Unidade de conhecimento indexada (task, comentário, doc).
**KnowledgeChunk**: Fragmento de um documento para busca vetorial.
**SimilarityResult**: Resultado de busca com documento e score de similaridade.
**KnowledgeInsight**: Padrão, risco, decisão ou oportunidade extraída da base de conhecimento.

## ClickUp

**Workspace**: Organização no ClickUp (nível mais alto).
**Space**: Área de trabalho dentro do workspace.
**Folder**: Agrupador de lists dentro de um space.
**List**: Conjunto de tasks.
**Task**: Unidade de trabalho no ClickUp.
**Subtask**: Task filha de outra task.
