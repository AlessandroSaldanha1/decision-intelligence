import { NextResponse } from 'next/server'
import { ClickUpService } from '@/services/clickup/clickup.service'

export async function GET() {
  try {
    const service = new ClickUpService()
    const workspaces = await service.getWorkspaces()
    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error('[clickup/workspaces]', error)
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 })
  }
}
