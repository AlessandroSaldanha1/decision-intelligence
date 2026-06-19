import { NextRequest, NextResponse } from 'next/server'
import { ArtifactGenerationService } from '@/services/claude/artifact-generation.service'
import { KnowledgeService } from '@/services/knowledge/knowledge.service'
import type { ArtifactGenerationInput } from '@/types/claude'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Omit<ArtifactGenerationInput, 'organizationalContext'>

    const knowledgeService = new KnowledgeService()
    const orgContext = await knowledgeService.buildOrganizationalContext(body.demand)
    const organizationalContext = knowledgeService.formatContextForClaude(orgContext)

    const artifactService = new ArtifactGenerationService()
    const artifacts = await artifactService.generate({ ...body, organizationalContext })

    return NextResponse.json({ artifacts })
  } catch (error) {
    console.error('[claude/artifacts]', error)
    return NextResponse.json({ error: 'Failed to generate artifacts' }, { status: 500 })
  }
}
