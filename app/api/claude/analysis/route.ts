import { NextRequest, NextResponse } from 'next/server'
import { ClaudeAnalysisService } from '@/services/claude/claude-analysis.service'
import { KnowledgeService } from '@/services/knowledge/knowledge.service'
import type { ClaudeAnalysisInput } from '@/types/claude'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Omit<ClaudeAnalysisInput, 'organizationalContext'>

    const knowledgeService = new KnowledgeService()
    const orgContext = await knowledgeService.buildOrganizationalContext(body.demand)
    const organizationalContext = knowledgeService.formatContextForClaude(orgContext)

    const analysisService = new ClaudeAnalysisService()
    const analysis = await analysisService.analyze({ ...body, organizationalContext })

    return NextResponse.json({ analysis, organizationalContext: orgContext })
  } catch (error) {
    console.error('[claude/analysis]', error)
    return NextResponse.json({ error: 'Failed to run Claude analysis' }, { status: 500 })
  }
}
