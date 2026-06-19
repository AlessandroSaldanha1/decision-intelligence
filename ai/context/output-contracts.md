# Output Contracts — Claude

Esta é a especificação dos contratos de output esperados do Claude.

**Regra:** Claude deve sempre retornar JSON puro, sem markdown, sem texto adicional, sem ```json```.

## ClaudeAnalysisOutput

```typescript
{
  ambiguities: string[]          // 2-5 itens
  risks: Array<{
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    mitigation: string
  }>                             // 2-5 riscos
  dependencies: Array<{
    name: string
    type: 'technical' | 'team' | 'external' | 'data'
    description: string
  }>                             // 1-4 dependências
  stakeholders: Array<{
    role: string
    involvement: 'responsible' | 'accountable' | 'consulted' | 'informed'
    notes: string
  }>                             // 2-5 stakeholders
  openQuestions: string[]        // 2-4 perguntas
  riskScore: number              // 0-100
  summary: string                // 2-3 frases
  recommendations: string[]      // 2-4 recomendações
}
```

## ArtifactGenerationOutput

```typescript
{
  userStory: {
    title: string
    asA: string                  // sem "Como" — apenas o substantivo
    iWant: string                // sem "eu quero" — apenas a ação
    soThat: string               // sem "para que" — apenas o benefício
    acceptanceCriteria: string[] // mínimo 3, formato "Dado/Quando/Então"
    technicalNotes: string[]     // 1-3 notas técnicas
  }
  bddScenarios: Array<{
    title: string
    given: string[]
    when: string[]
    then: string[]
    tags: string[]
  }>                             // mínimo 2 cenários
  testCases: Array<{
    id: string                   // TC-001, TC-002...
    title: string
    type: 'functional' | 'integration' | 'e2e' | 'edge_case' | 'negative'
    priority: 'critical' | 'high' | 'medium' | 'low'
    steps: string[]
    expectedResult: string
  }>                             // mínimo 3 casos
  definitionOfDone: {
    technical: string[]          // mínimo 2
    quality: string[]            // mínimo 2
    documentation: string[]      // mínimo 1
    deployment: string[]         // mínimo 2
  }
  dependencies: string[]         // lista de dependências identificadas
}
```

## DeliveryPlanOutput

```typescript
{
  epic: {
    title: string
    description: string
    estimateDays: number
  }
  mainTask: {
    title: string
    description: string
  }
  subtasks: {
    backend: DeliveryTask[]
    frontend: DeliveryTask[]
    qa: DeliveryTask[]
    product: DeliveryTask[]
    devops: DeliveryTask[]
  }
  totalEstimateHours: number
  criticalPath: string[]         // 3-7 itens
}

// DeliveryTask
{
  title: string
  description: string
  estimateHours: number          // máximo 8
  priority: 'critical' | 'high' | 'medium' | 'low'
  dependencies: string[]
  assignTo: 'backend' | 'frontend' | 'qa' | 'product' | 'devops' | 'fullstack'
}
```
