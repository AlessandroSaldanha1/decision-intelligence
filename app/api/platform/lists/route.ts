import { NextRequest, NextResponse } from 'next/server'
import { env, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import { createClickUpClient } from '@/lib/clickup/client'
import type { ClickUpTask } from '@/types/clickup'

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

/** Enumerate all accessible lists by scanning task pages — works with restricted tokens. */
async function discoverListsFromTasks(workspaceId: string): Promise<SpaceOption[]> {
  const client = createClickUpClient(env.clickup.apiToken)

  const folders = new Map<string, { id: string; name: string; lists: Map<string, ListOption> }>()
  const rootLists = new Map<string, ListOption>()

  for (let page = 0; page < 6; page++) {
    try {
      const { data } = await client.get(
        `/team/${workspaceId}/task?page=${page}&subtasks=false&include_closed=true`,
      )
      const tasks: ClickUpTask[] = data.tasks ?? []
      if (!tasks.length) break

      for (const t of tasks) {
        if (!t.list?.id) continue
        const listOpt: ListOption = { id: t.list.id, name: t.list.name }

        if (t.folder?.id && !t.folder.hidden) {
          if (!folders.has(t.folder.id)) {
            folders.set(t.folder.id, { id: t.folder.id, name: t.folder.name, lists: new Map() })
          }
          folders.get(t.folder.id)!.lists.set(t.list.id, listOpt)
        } else {
          rootLists.set(t.list.id, listOpt)
        }
      }

      if (tasks.length < 100) break
    } catch {
      break
    }
  }

  if (!folders.size && !rootLists.size) return []

  const folderOptions: FolderOption[] = [...folders.values()]
    .map((f) => ({ id: f.id, name: f.name, lists: [...f.lists.values()] }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return [
    {
      id: workspaceId,
      name: 'Workspace',
      folders: folderOptions,
      lists: [...rootLists.values()].sort((a, b) => a.name.localeCompare(b.name)),
    },
  ]
}

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId')

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId obrigatório' }, { status: 400 })
  }

  if (isMockMode()) {
    return NextResponse.json({ spaces: MOCK_SPACES })
  }

  // Attempt 1 — proper spaces hierarchy (requires elevated token permissions)
  try {
    const svc = new ClickUpService()
    const spaces = await svc.getSpaces(workspaceId)

    if (spaces.length) {
      const result: SpaceOption[] = []

      await Promise.all(
        spaces.map(async (space) => {
          try {
            const [foldersData, folderless] = await Promise.all([
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
              foldersData.map(async (folder) => {
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
      if (result.length) return NextResponse.json({ spaces: result })
    }
  } catch {
    // Spaces endpoint restricted — fall through to task-based discovery
  }

  // Attempt 2 — task enumeration fallback (works with guest/limited member tokens)
  try {
    console.log('[lists] Falling back to task enumeration for workspace', workspaceId)
    const discovered = await discoverListsFromTasks(workspaceId)
    return NextResponse.json({ spaces: discovered })
  } catch (err) {
    console.error('[lists] Task enumeration also failed:', err)
    return NextResponse.json({ error: 'Erro ao buscar estrutura do ClickUp' }, { status: 502 })
  }
}
