import { NextRequest, NextResponse } from 'next/server'
import { isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'

export interface FolderOption {
  id: string
  name: string
  lists: ListOption[]
}

export interface SpaceOption {
  id: string
  name: string
  folders: FolderOption[]
  lists: ListOption[] // folderless lists
}

export interface ListOption {
  id: string
  name: string
}

const MOCK_SPACES: SpaceOption[] = [
  {
    id: 's1',
    name: 'Tecnologia',
    folders: [
      { id: 'f1', name: 'Backlog', lists: [{ id: '9014388920', name: 'Geral' }, { id: '9014388921', name: 'Sprint Atual' }] },
      { id: 'f2', name: 'Em andamento', lists: [{ id: '9014388922', name: 'Dev' }] },
    ],
    lists: [{ id: '9014388923', name: 'Ideias' }],
  },
  {
    id: 's2',
    name: 'Dados',
    folders: [],
    lists: [{ id: '9014388924', name: 'Projetos' }, { id: '9014388925', name: 'Documentação' }],
  },
]

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId')

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId obrigatório' }, { status: 400 })
  }

  if (isMockMode()) {
    return NextResponse.json({ spaces: MOCK_SPACES })
  }

  try {
    const svc = new ClickUpService()
    const spaces = await svc.getSpaces(workspaceId)

    const result: SpaceOption[] = []

    await Promise.all(
      spaces.map(async (space) => {
        try {
          const [folders, folderless] = await Promise.all([
            svc.getFolders(space.id),
            svc.getFolderlessLists(space.id),
          ])

          const spaceOption: SpaceOption = {
            id: space.id,
            name: space.name,
            folders: [],
            lists: folderless.map((l) => ({ id: l.id, name: l.name })),
          }

          await Promise.all(
            folders.map(async (folder) => {
              try {
                const lists = await svc.getLists(folder.id)
                spaceOption.folders.push({
                  id: folder.id,
                  name: folder.name,
                  lists: lists.map((l) => ({ id: l.id, name: l.name })),
                })
              } catch {
                // skip inaccessible folder
              }
            }),
          )

          spaceOption.folders.sort((a, b) => a.name.localeCompare(b.name))
          result.push(spaceOption)
        } catch {
          // skip inaccessible space
        }
      }),
    )

    result.sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json({ spaces: result })
  } catch (err) {
    console.error('[lists] Failed to fetch ClickUp structure:', err)
    return NextResponse.json({ error: 'Erro ao buscar estrutura do ClickUp' }, { status: 502 })
  }
}
