import { NextRequest, NextResponse } from 'next/server'
import { ClickUpService } from '@/services/clickup/clickup.service'

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId') ?? ''

  try {
    const service = new ClickUpService()
    const stats = await service.getWorkspaceStats(workspaceId)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('[clickup/stats]', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
