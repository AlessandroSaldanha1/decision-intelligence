import { NextRequest, NextResponse } from 'next/server'
import { KnowledgeService } from '@/services/knowledge/knowledge.service'

export async function POST(req: NextRequest) {
  try {
    const { query, limit } = (await req.json()) as { query: string; limit?: number }

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    const service = new KnowledgeService()
    const results = await service.search(query, limit)

    return NextResponse.json(results)
  } catch (error) {
    console.error('[rag/search]', error)
    return NextResponse.json({ error: 'Failed to search knowledge base' }, { status: 500 })
  }
}
