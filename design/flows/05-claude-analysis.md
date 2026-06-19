# Fluxo 05 — Claude Analysis

## Objetivo
Exibir a análise inteligente gerada pelo Claude com base na demanda e no contexto organizacional.

## Rota
`/demand/[id]/analysis`

## Entrada do Usuário
- Leitura da análise (tela informativa)
- Botão "Gerar Artefatos"

## Saída Esperada
- Usuário entende os riscos, ambiguidades e dependências da demanda
- Redirect para `/demand/[id]/artifacts`

## Estrutura da Análise

1. **Risk Score**: número de 0 a 100, colorido por severidade
2. **Sumário**: parágrafo de síntese da análise
3. **Ambiguidades**: pontos que precisam ser clarificados
4. **Riscos**: lista com severidade (critical/high/medium/low) e mitigação
5. **Dependências**: técnicas, de time e externas
6. **Stakeholders**: com modelo RACI
7. **Perguntas em Aberto**: questões que precisam de resposta antes de iniciar

## Estados da Tela

### Loading
- "Executando análise com Claude..."
- Skeleton loading nos cards

### Com Análise
- Score bem visível no topo
- Seções colapsáveis (futuro)

### Erro
- Retry automático 1x, depois exibir erro
- Opção de tentar novamente

## Componentes
- `RiskScoreGauge` — indicador visual do score
- `AmbiguityCard` — ponto de ambiguidade
- `RiskCard` — risco com severidade e mitigação
- `DependencyBadge` — dependência por tipo

## Observações de UX
- Risco crítico (≥70) deve ter fundo vermelho suave no card de score
- Ambiguidades são amarelas, riscos têm cor por severidade
- Não exibir análise vazia se Claude retornou erro — mostrar estado de erro claro
