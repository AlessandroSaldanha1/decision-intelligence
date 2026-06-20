import { ClickUpService } from '@/services/clickup/clickup.service'
import {
  mockWorkspaces,
  mockSpaces,
  mockFolders,
  mockLists,
  mockTasks,
  mockComments,
} from '@/lib/clickup/mock-data'

// Force mock mode by constructing service with an empty token.
// No network calls are made in mock mode.
describe('ClickUpService (mock mode)', () => {
  let service: ClickUpService

  beforeEach(() => {
    service = new ClickUpService('')
  })

  // ─── getWorkspaces ─────────────────────────────────────────────────────────

  describe('getWorkspaces', () => {
    it('returns mock workspaces', async () => {
      const result = await service.getWorkspaces()
      expect(result).toEqual(mockWorkspaces)
    })

    it('returns at least one workspace', async () => {
      const result = await service.getWorkspaces()
      expect(result.length).toBeGreaterThan(0)
    })

    it('each workspace has id, name and members', async () => {
      const result = await service.getWorkspaces()
      for (const ws of result) {
        expect(ws).toHaveProperty('id')
        expect(ws).toHaveProperty('name')
        expect(ws).toHaveProperty('members')
      }
    })
  })

  // ─── getSpaces ────────────────────────────────────────────────────────────

  describe('getSpaces', () => {
    it('returns mock spaces regardless of workspaceId', async () => {
      const result = await service.getSpaces('any-id')
      expect(result).toEqual(mockSpaces)
    })

    it('returns spaces with statuses arrays', async () => {
      const result = await service.getSpaces('ws-001')
      for (const space of result) {
        expect(Array.isArray(space.statuses)).toBe(true)
      }
    })
  })

  // ─── getFolders ───────────────────────────────────────────────────────────

  describe('getFolders', () => {
    it('returns mock folders', async () => {
      const result = await service.getFolders('sp-001')
      expect(result).toEqual(mockFolders)
    })
  })

  // ─── getLists ─────────────────────────────────────────────────────────────

  describe('getLists', () => {
    it('returns mock lists', async () => {
      const result = await service.getLists('f-001')
      expect(result).toEqual(mockLists)
    })

    it('each list has id and name', async () => {
      const result = await service.getLists('f-001')
      for (const list of result) {
        expect(list).toHaveProperty('id')
        expect(list).toHaveProperty('name')
      }
    })
  })

  // ─── getTasks ─────────────────────────────────────────────────────────────

  describe('getTasks', () => {
    it('returns mock tasks', async () => {
      const result = await service.getTasks('l-001')
      expect(result).toEqual(mockTasks)
    })

    it('each task has id, name and status', async () => {
      const result = await service.getTasks('l-001')
      for (const task of result) {
        expect(task).toHaveProperty('id')
        expect(task).toHaveProperty('name')
        expect(task).toHaveProperty('status')
      }
    })
  })

  // ─── getTaskComments ──────────────────────────────────────────────────────

  describe('getTaskComments', () => {
    it('returns comments for a known taskId', async () => {
      const result = await service.getTaskComments('t-001')
      expect(result).toEqual(mockComments['t-001'])
    })

    it('returns comments for task t-002', async () => {
      const result = await service.getTaskComments('t-002')
      expect(result).toEqual(mockComments['t-002'])
    })

    it('returns empty array for an unknown taskId', async () => {
      const result = await service.getTaskComments('unknown-task-id')
      expect(result).toEqual([])
    })
  })

  // ─── createTask ───────────────────────────────────────────────────────────

  describe('createTask', () => {
    it('returns a mock task with the given name', async () => {
      const payload = { name: 'Test Task' }
      const result = await service.createTask('l-001', payload)
      expect(result.name).toBe('Test Task')
    })

    it('returns a task with a non-empty id', async () => {
      const payload = { name: 'Another Task' }
      const result = await service.createTask('l-001', payload)
      expect(result.id).toBeTruthy()
      expect(typeof result.id).toBe('string')
    })

    it('returns a task with a url', async () => {
      const payload = { name: 'Task with URL' }
      const result = await service.createTask('l-001', payload)
      expect(result.url).toContain('clickup.com')
    })

    it('includes the description when provided', async () => {
      const payload = { name: 'Task', description: 'Some description' }
      const result = await service.createTask('l-001', payload)
      expect(result.description).toBe('Some description')
    })

    it('sets description to null when not provided', async () => {
      const payload = { name: 'No Desc Task' }
      const result = await service.createTask('l-001', payload)
      expect(result.description).toBeNull()
    })

    it('binds to the correct listId', async () => {
      const payload = { name: 'Task' }
      const result = await service.createTask('l-custom', payload)
      expect(result.list.id).toBe('l-custom')
    })
  })

  // ─── createSubtask ────────────────────────────────────────────────────────

  describe('createSubtask', () => {
    it('creates a task with the parent set', async () => {
      const payload = { name: 'Subtask' }
      const result = await service.createSubtask('t-001', 'l-001', payload)
      expect(result.parent).toBe('t-001')
    })

    it('retains the name from the payload', async () => {
      const payload = { name: 'Backend Subtask' }
      const result = await service.createSubtask('t-001', 'l-001', payload)
      expect(result.name).toBe('Backend Subtask')
    })
  })

  // ─── addTaskComment ───────────────────────────────────────────────────────

  describe('addTaskComment', () => {
    it('resolves without throwing in mock mode', async () => {
      await expect(
        service.addTaskComment('t-001', 'This is a test comment')
      ).resolves.toBeUndefined()
    })
  })
})

describe('ClickUpService (mock mode detection)', () => {
  it('enters mock mode when constructed with an empty token', () => {
    const svc = new ClickUpService('')
    // Verify mock mode by checking that getWorkspaces doesn't make HTTP calls
    // (it resolves synchronously with mock data instead of throwing network error)
    return expect(svc.getWorkspaces()).resolves.toEqual(mockWorkspaces)
  })

  it('enters mock mode when constructed without a token', () => {
    // No CLICKUP_API_TOKEN in test env → defaults to '' → mock mode
    const svc = new ClickUpService(undefined)
    return expect(svc.getWorkspaces()).resolves.toBeDefined()
  })
})
