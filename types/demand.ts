import type { ArtifactGenerationOutput, ClaudeAnalysisOutput, DeliveryPlanOutput } from './claude'
import type { OrganizationalContext } from './knowledge'

export type DemandStatus =
  | 'draft'
  | 'analyzing'
  | 'analyzed'
  | 'generating'
  | 'generated'
  | 'publishing'
  | 'published'
  | 'error'

export interface Demand {
  id: string
  title: string
  description: string
  status: DemandStatus
  selectedSources: string[]
  workspaceId: string
  projectId?: string
  listId?: string
  organizationalContext?: OrganizationalContext
  analysis?: ClaudeAnalysisOutput
  artifacts?: ArtifactGenerationOutput
  deliveryPlan?: DeliveryPlanOutput
  publishedTaskId?: string
  publishedTaskUrl?: string
  createdAt: string
  updatedAt: string
}
