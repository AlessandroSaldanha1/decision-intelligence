import { NextRequest, NextResponse } from 'next/server'
import { isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'

export interface ListOption {
  id: string
  name: string
  spaceName: string
}

const MOCK_LISTS: ListOption[] = [
  { id: '9014388920', name: 'Backlog', spaceName: 'Tecnologia' },
  { id: '9014388921', name: 'Sprint Atual', spaceName: 'Tecnologia' },
  { id: '9014388922', name: 'Projetos', spaceName: 'Dados' },
]

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId')

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId obrigatório' }, { status: 400 })
  }

  if (isMockMode()) {
    return NextResponse.json({ lists: MOCK_LISTS })
  }

  try {
    const svc = new ClickUpService()
    const spaces = await svc.getSpaces(workspaceId)

    const results: ListOption[] = []

    await Promise.all(
      spaces.map(async (space) => {
        try {
          const [folders, folderless] = await Promise.all([
            svc.getFolders(space.id),
            svc.getFolderlessLists(space.id),
          ])

          for (const list of folderless) {
            results.push({ id: list.id, name: list.name, spaceName: space.name })
          }

          await Promise.all(
            folders.map(async (folder) => {
              try {
                const lists = await svc.getLists(folder.id)
                for (const list of lists) {
                  results.push({ id: list.id, name: `${folder.name} / ${list.name}`, spaceName: space.name })
                }
              } catch {
                // skip inaccessible folder
              }
            }),
          )
        } catch {
          // skip inaccessible space
        }
      }),
    )

    results.sort((a, b) => a.spaceName.localeCompare(b.spaceName) || a.name.localeCompare(b.name))

    return NextResponse.json({ lists: results })
  } catch (err) {
    console.error('[lists] Failed to fetch ClickUp lists:', err)
    return NextResponse.json({ error: 'Erro ao buscar lists do ClickUp' }, { status: 502 })
  }
}
