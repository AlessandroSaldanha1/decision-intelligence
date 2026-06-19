import { NextRequest, NextResponse } from 'next/server'
import { ClickUpService } from '@/services/clickup/clickup.service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const service = new ClickUpService()
    const spaces = await service.getSpaces(workspaceId)
    return NextResponse.json({ spaces })
  } catch (error) {
    console.error('[clickup/spaces]', error)
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 })
  }
}
