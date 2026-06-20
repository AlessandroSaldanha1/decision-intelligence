import { createClickUpClient } from '@/lib/clickup/client'
import {
  mockComments,
  mockFolders,
  mockLists,
  mockSpaces,
  mockTasks,
  mockWorkspaces,
} from '@/lib/clickup/mock-data'
import type {
  ClickUpComment,
  ClickUpCreateTaskPayload,
  ClickUpFolder,
  ClickUpList,
  ClickUpSpace,
  ClickUpTask,
  ClickUpWorkspace,
} from '@/types/clickup'
import { env, isMockMode } from '@/lib/config/env'

export class ClickUpService {
  private token: string

  constructor(token?: string) {
    this.token = token ?? env.clickup.apiToken
  }

  private get mock() {
    return isMockMode(this.token)
  }

  async getWorkspaces(): Promise<ClickUpWorkspace[]> {
    if (this.mock) return mockWorkspaces

    const client = createClickUpClient(this.token)
    const { data } = await client.get('/team')
    return data.teams
  }

  async getSpaces(workspaceId: string): Promise<ClickUpSpace[]> {
    if (this.mock) return mockSpaces

    const client = createClickUpClient(this.token)
    const { data } = await client.get(`/team/${workspaceId}/space?archived=false`)
    return data.spaces
  }

  async getFolders(spaceId: string): Promise<ClickUpFolder[]> {
    if (this.mock) return mockFolders

    const client = createClickUpClient(this.token)
    const { data } = await client.get(`/space/${spaceId}/folder?archived=false`)
    return data.folders
  }

  async getLists(folderId: string): Promise<ClickUpList[]> {
    if (this.mock) return mockLists

    const client = createClickUpClient(this.token)
    const { data } = await client.get(`/folder/${folderId}/list?archived=false`)
    return data.lists
  }

  async getTasks(listId: string): Promise<ClickUpTask[]> {
    if (this.mock) return mockTasks

    const client = createClickUpClient(this.token)
    const { data } = await client.get(`/list/${listId}/task?archived=false&subtasks=true`)
    return data.tasks
  }

  async getTaskComments(taskId: string): Promise<ClickUpComment[]> {
    if (this.mock) return mockComments[taskId] ?? []

    const client = createClickUpClient(this.token)
    const { data } = await client.get(`/task/${taskId}/comment`)
    return data.comments
  }

  async createTask(listId: string, payload: ClickUpCreateTaskPayload): Promise<ClickUpTask> {
    if (this.mock) {
      return {
        id: `mock-${Date.now()}`,
        name: payload.name,
        description: payload.description ?? null,
        status: { id: 's1', status: 'To Do', color: '#d3d3d3', orderindex: 0, type: 'open' },
        orderindex: '99',
        date_created: String(Date.now()),
        date_updated: String(Date.now()),
        creator: { id: 1, username: 'mock-user', email: 'mock@example.com', profilePicture: null },
        assignees: [],
        tags: [],
        parent: payload.parent ?? null,
        priority: null,
        due_date: payload.due_date ? String(payload.due_date) : null,
        start_date: null,
        points: null,
        time_estimate: null,
        url: `https://app.clickup.com/t/mock-${Date.now()}`,
        list: { id: listId, name: 'Mock List', access: true },
        folder: { id: 'f-001', name: 'Mock Folder', hidden: false, access: true },
        space: { id: 'sp-001' },
      }
    }

    const client = createClickUpClient(this.token)
    const { data } = await client.post(`/list/${listId}/task`, payload)
    return data
  }

  async createSubtask(parentTaskId: string, listId: string, payload: ClickUpCreateTaskPayload): Promise<ClickUpTask> {
    return this.createTask(listId, { ...payload, parent: parentTaskId })
  }

  async addTaskComment(taskId: string, comment: string): Promise<void> {
    if (this.mock) return

    const client = createClickUpClient(this.token)
    await client.post(`/task/${taskId}/comment`, {
      comment_text: comment,
      notify_all: false,
    })
  }

  async searchTasks(workspaceId: string, query: string): Promise<ClickUpTask[]> {
    if (this.mock) {
      return mockTasks.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase().slice(0, 10))
      )
    }
    const client = createClickUpClient(this.token)
    const { data } = await client.get(
      `/team/${workspaceId}/task?text=${encodeURIComponent(query)}&subtasks=true&include_closed=true&page=0`
    )
    return (data.tasks ?? []) as ClickUpTask[]
  }

  async getWorkspaceStats(workspaceId: string): Promise<{ spaces: number; lists: number; tasks: number }> {
    if (this.mock) return { spaces: 12, lists: 43, tasks: 1284 }

    const client = createClickUpClient(this.token)

    const spacesRes = await client.get(`/team/${workspaceId}/space?archived=false`)
    const spaces: ClickUpSpace[] = spacesRes.data.spaces ?? []

    let listsCount = 0
    for (const space of spaces.slice(0, 5)) {
      try {
        const fl = await client.get(`/space/${space.id}/list?archived=false`)
        listsCount += (fl.data.lists ?? []).length
      } catch { /* ok */ }
      try {
        const fd = await client.get(`/space/${space.id}/folder?archived=false`)
        for (const folder of fd.data.folders ?? []) {
          listsCount += (folder.lists ?? []).length
        }
      } catch { /* ok */ }
    }

    let tasksCount = 0
    try {
      const tr = await client.get(`/team/${workspaceId}/task?page=0&subtasks=false&include_closed=true`)
      tasksCount = (tr.data.tasks ?? []).length
    } catch { /* ok */ }

    return { spaces: spaces.length, lists: listsCount, tasks: tasksCount }
  }
}
