import { NextRequest, NextResponse } from 'next/server'
import { ClickUpService } from '@/services/clickup/clickup.service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const listId = searchParams.get('listId')

    if (!listId) {
      return NextResponse.json({ error: 'listId is required' }, { status: 400 })
    }

    const service = new ClickUpService()
    const tasks = await service.getTasks(listId)
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('[clickup/tasks]', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}
