# Fluxo 07 — Plano de Entrega

## Objetivo

Exibir o plano de entrega estruturado por frente de trabalho, com estimativas e caminho crítico.

## Rota

`/demand/[id]/delivery-plan`

## Estrutura do Plano

1. **Epic**: título, descrição, estimativa em dias
2. **Task Principal**: título e descrição da task ClickUp
3. **Subtasks por frente**: Backend, Frontend, QA, Produto, DevOps
4. **Estimativa total**: em horas
5. **Caminho Crítico**: sequência de dependências críticas

## Estados da Tela

### Loading

- "Gerando plano de entrega..."

### Com Plano

- Epic no topo com badge de estimativa
- Seções colapsáveis por frente
- Each subtask: título, horas, prioridade

### Erro

- Retry disponível

## Estrutura Visual

```
[Epic] — 5 dias — 22h total

[Caminho Crítico]
  1. → 2. → 3. → 4. → 5.

[BACKEND]
  [critical] Configurar NextAuth  4h
  [high] Rate limiting             2h

[FRONTEND]
  [critical] Criar tela de login  4h

[QA]
  [high] Testes E2E               6h

[PRODUTO] [DEVOPS]
  ...

[CTA: Publicar no ClickUp]
```

## Observações de UX

- Caminho crítico deve ser visualmente destacado (chips conectados)
- Prioridade por cor: critical=vermelho, high=laranja, medium=amarelo, low=cinza
- Estimativas em horas devem ser proeminentes
- Frentes sem subtasks não devem ser exibidas
