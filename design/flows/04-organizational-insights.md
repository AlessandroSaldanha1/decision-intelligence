# Fluxo 04 — Organizational Insights

## Objetivo
Exibir o conhecimento organizacional relevante recuperado via RAG antes de executar a análise Claude.

## Rota
`/demand/[id]/insights`

## Entrada do Usuário
- Leitura dos insights (tela informativa)
- Botão "Executar Claude Analysis"
- Opcionalmente: descartar insights específicos (futuro)

## Saída Esperada
- Usuário informado sobre o contexto recuperado
- Redirect para `/demand/[id]/analysis`

## Estados da Tela

### Loading
- Spinner com "Buscando conhecimento organizacional..."
- 3-5 segundos esperados

### Com Dados
- Contador de insights encontrados
- Cards de tasks similares com score de similaridade
- Seção de decisões técnicas relacionadas
- Seção de padrões do time
- Seção de riscos históricos
- Resumo em linguagem natural (teamInsights)

### Sem Dados
- Mensagem: "Nenhum conhecimento similar encontrado"
- Explicação: esta é uma área nova para o time
- Botão para continuar mesmo sem contexto

## Componentes
- `InsightCard` — exibe task similar com score
- `DecisionBadge` — decisão técnica com confidence
- `PatternList` — lista de padrões do time
- `RiskWarning` — risco histórico

## Estrutura Visual

```
[Resumo em números: X tasks similares, Y decisões, Z padrões]

[Tasks Similares]
  - Task A  89%
  - Task B  72%

[Decisões Técnicas] | [Riscos Históricos]
  Decision 1             Risk 1
  Decision 2

[Padrões do Time]
  - Padrão 1
  - Padrão 2

[CTA: Executar Claude Analysis]
```

## Observações de UX
- Scores de similaridade devem ser visualmente claros (percentual colorido)
- Seção de riscos deve ter destaque visual (amarelo/âmbar)
- Usuário deve entender que esses dados enriquecerão a análise Claude
