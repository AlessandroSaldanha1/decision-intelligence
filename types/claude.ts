export interface ClaudeAnalysisInput {
  demand: string
  selectedSources: string[]
  organizationalContext: string
  additionalContext?: string
}

export interface ClaudeAnalysisOutput {
  ambiguities: string[]
  risks: Array<{
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    mitigation: string
  }>
  dependencies: Array<{
    name: string
    type: 'technical' | 'team' | 'external' | 'data'
    description: string
  }>
  stakeholders: Array<{
    role: string
    involvement: 'responsible' | 'accountable' | 'consulted' | 'informed'
    notes: string
  }>
  openQuestions: string[]
  riskScore: number
  summary: string
  recommendations: string[]
}

export interface ArtifactGenerationInput {
  demand: string
  analysis: ClaudeAnalysisOutput
  organizationalContext: string
  projectName?: string
}

export interface UserStory {
  title: string
  asA: string
  iWant: string
  soThat: string
  acceptanceCriteria: string[]
  technicalNotes: string[]
}

export interface BDDScenario {
  title: string
  given: string[]
  when: string[]
  then: string[]
  tags: string[]
}

export interface TestCase {
  id: string
  title: string
  type: 'functional' | 'integration' | 'e2e' | 'edge_case' | 'negative'
  priority: 'critical' | 'high' | 'medium' | 'low'
  steps: string[]
  expectedResult: string
}

export interface DefinitionOfDone {
  technical: string[]
  quality: string[]
  documentation: string[]
  deployment: string[]
}

export interface ArtifactGenerationOutput {
  userStory: UserStory
  bddScenarios: BDDScenario[]
  testCases: TestCase[]
  definitionOfDone: DefinitionOfDone
  dependencies: string[]
}

export interface DeliveryPlanInput {
  demand: string
  userStory: UserStory
  analysis: ClaudeAnalysisOutput
  organizationalContext: string
}

export interface DeliveryTask {
  title: string
  description: string
  estimateHours: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  dependencies: string[]
  assignTo: 'backend' | 'frontend' | 'qa' | 'product' | 'devops' | 'fullstack'
}

export interface DeliveryPlanOutput {
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
  criticalPath: string[]
}
