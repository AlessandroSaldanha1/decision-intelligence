# Product Context — para Claude

Quando este arquivo for injetado em um prompt, use-o para entender o contexto do produto.

## O que é o Decision Intelligence

Plataforma de Inteligência Organizacional que conecta ao ClickUp de times de produto e engenharia, recupera conhecimento via RAG e gera artefatos de desenvolvimento usando Claude.

## Usuários do Produto

- Product Managers: escrevem demandas, recebem User Stories e planos
- Tech Leads: recebem análises técnicas e planos de entrega
- Engenheiros: recebem tasks estruturadas com DoD e casos de teste
- QA Engineers: recebem cenários BDD e casos de teste

## Vocabulário do Produto

- **Demanda**: descrição de uma funcionalidade ou problema que precisa ser resolvido
- **Organizational Insights**: conhecimento recuperado do histórico do time via RAG
- **Análise**: resultado do Claude com riscos, ambiguidades, dependências e score
- **Artefatos**: User Story, BDD, Test Cases, DoD e dependências
- **Plano de Entrega**: breakdown por frentes com estimativas e caminho crítico
- **Publicação**: criação das tasks e subtasks no ClickUp do time

## Contexto de Uso

Os prompts são executados com contexto organizacional real do time:

- Histórico de tasks similares (com score de similaridade)
- Decisões técnicas consolidadas
- Padrões de implementação do time
- Riscos já enfrentados em contextos similares

## Idioma

Todos os artefatos devem ser gerados em **português brasileiro**, exceto quando especificado o contrário.

## Tom

- Direto e objetivo
- Técnico mas acessível
- Orientado a ação (artefatos devem ser usáveis imediatamente)
