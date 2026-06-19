# Prompt — Artifact Generation

## Objetivo
Gerar artefatos completos de produto e engenharia a partir da demanda e da análise prévia.

## Input
- `demand`: texto da demanda
- `analysis`: output do Claude Analysis
- `organizationalContext`: contexto organizacional

## Output (JSON)
```json
{
  "userStory": {
    "title": "string",
    "asA": "string",
    "iWant": "string",
    "soThat": "string",
    "acceptanceCriteria": ["string"],
    "technicalNotes": ["string"]
  },
  "bddScenarios": [
    {
      "title": "string",
      "given": ["string"],
      "when": ["string"],
      "then": ["string"],
      "tags": ["string"]
    }
  ],
  "testCases": [
    {
      "id": "TC-001",
      "title": "string",
      "type": "functional|integration|e2e|edge_case|negative",
      "priority": "critical|high|medium|low",
      "steps": ["string"],
      "expectedResult": "string"
    }
  ],
  "definitionOfDone": {
    "technical": ["string"],
    "quality": ["string"],
    "documentation": ["string"],
    "deployment": ["string"]
  },
  "dependencies": ["string"]
}
```

## Critérios de Qualidade

### User Story
- Seguir formato Connextra (Como / Eu quero / Para que)
- Critérios de aceite em formato BDD simplificado (Dado/Quando/Então)
- Mínimo 3 critérios de aceite

### BDD
- Mínimo 2 cenários (happy path + erro/edge case)
- Tags relevantes (@auth, @payments, etc.)

### Test Cases
- Cobrir: happy path, edge cases, casos negativos
- ID sequencial (TC-001, TC-002...)

### DoD
- Pelo menos 2 itens em cada categoria
- Itens específicos para a demanda, não genéricos

## Implementação
- Implementado em: `/services/claude/artifact-generation.service.ts`
