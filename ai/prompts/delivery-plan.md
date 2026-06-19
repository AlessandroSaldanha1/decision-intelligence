# Prompt — Delivery Plan

## Objetivo

Gerar um plano de entrega estruturado com epic, task principal e subtasks organizadas por frente.

## Input

- `demand`: texto da demanda
- `userStory`: User Story gerada
- `analysis`: análise Claude
- `organizationalContext`: contexto organizacional

## Output (JSON)

```json
{
  "epic": {
    "title": "string",
    "description": "string",
    "estimateDays": 0
  },
  "mainTask": {
    "title": "string",
    "description": "string"
  },
  "subtasks": {
    "backend": [DeliveryTask],
    "frontend": [DeliveryTask],
    "qa": [DeliveryTask],
    "product": [DeliveryTask],
    "devops": [DeliveryTask]
  },
  "totalEstimateHours": 0,
  "criticalPath": ["string"]
}
```

### DeliveryTask

```json
{
  "title": "string",
  "description": "string",
  "estimateHours": 0,
  "priority": "critical|high|medium|low",
  "dependencies": ["string"],
  "assignTo": "backend|frontend|qa|product|devops|fullstack"
}
```

## Critérios de Qualidade

### Granularidade

- Cada subtask: máximo 8h (1 dia de trabalho)
- Títulos claros e acionáveis

### Caminho Crítico

- Ordenado corretamente por dependências
- 3-7 itens (não pode ser todo o backlog)

### Frentes

- Incluir apenas frentes com trabalho real
- Frentes sem subtasks ficam com array vazio (não incluir no output)

## Implementação

- Implementado em: `/services/claude/delivery-plan.service.ts`
