export type KnowledgeSourceType = 'tasks' | 'comments' | 'subtasks' | 'docs' | 'decisions'

export interface KnowledgeSource {
  id: string
  type: KnowledgeSourceType
  name: string
  description: string
  enabled: boolean
  lastIndexed: string | null
  documentCount: number
}

export interface KnowledgeDocument {
  id: string
  sourceId: string
  sourceType: KnowledgeSourceType
  title: string
  content: string
  metadata: {
    projectId?: string
    projectName?: string
    spaceId?: string
    spaceName?: string
    listId?: string
    listName?: string
    taskId?: string
    taskName?: string
    createdAt: string
    updatedAt: string
    author?: string
    tags?: string[]
    url?: string
  }
  embedding?: number[]
  createdAt: string
  updatedAt: string
}

export interface KnowledgeChunk {
  id: string
  documentId: string
  content: string
  embedding?: number[]
  startOffset: number
  endOffset: number
}

export interface KnowledgeInsight {
  id: string
  title: string
  description: string
  type: 'pattern' | 'risk' | 'opportunity' | 'decision' | 'dependency'
  confidence: number
  sourceDocumentIds: string[]
  tags: string[]
  createdAt: string
}

export interface SimilarityResult {
  document: KnowledgeDocument
  score: number
  relevantChunks: string[]
}

export interface RAGSearchResult {
  query: string
  results: SimilarityResult[]
  totalFound: number
  searchTime: number
}

export interface OrganizationalContext {
  similarTasks: SimilarityResult[]
  relatedDecisions: KnowledgeInsight[]
  patterns: KnowledgeInsight[]
  risks: KnowledgeInsight[]
  teamInsights: string[]
}
