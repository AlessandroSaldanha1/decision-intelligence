import { DeliveryPlanService } from '@/services/claude/delivery-plan.service'

// ANTHROPIC_API_KEY not set in test env → isClaudeMockMode() = true → mock output.

describe('DeliveryPlanService (mock mode)', () => {
  let service: DeliveryPlanService

  beforeEach(() => {
    service = new DeliveryPlanService()
  })

  const mockInput = {
    demand: 'Implementar autenticação OAuth',
    userStory: {
      title: 'Login com OAuth',
      asA: 'usuário',
      iWant: 'fazer login com Google',
      soThat: 'não precise criar senha',
      acceptanceCriteria: [],
      technicalNotes: [],
    },
    analysis: {
      ambiguities: [],
      risks: [],
      dependencies: [],
      stakeholders: [],
      openQuestions: [],
      riskScore: 50,
      summary: '',
      recommendations: [],
    },
    organizationalContext: 'Contexto de teste',
  }

  describe('generate', () => {
    it('returns an object with all required top-level keys', async () => {
      const result = await service.generate(mockInput)
      expect(result).toHaveProperty('epic')
      expect(result).toHaveProperty('mainTask')
      expect(result).toHaveProperty('subtasks')
      expect(result).toHaveProperty('totalEstimateHours')
      expect(result).toHaveProperty('criticalPath')
    })

    describe('epic', () => {
      it('has title, description and estimateDays', async () => {
        const { epic } = await service.generate(mockInput)
        expect(epic).toHaveProperty('title')
        expect(epic).toHaveProperty('description')
        expect(epic).toHaveProperty('estimateDays')
        expect(typeof epic.estimateDays).toBe('number')
        expect(epic.estimateDays).toBeGreaterThan(0)
      })
    })

    describe('mainTask', () => {
      it('has title and description', async () => {
        const { mainTask } = await service.generate(mockInput)
        expect(mainTask).toHaveProperty('title')
        expect(mainTask).toHaveProperty('description')
        expect(typeof mainTask.title).toBe('string')
        expect(mainTask.title.length).toBeGreaterThan(0)
      })
    })

    describe('subtasks', () => {
      it('has all team categories', async () => {
        const { subtasks } = await service.generate(mockInput)
        expect(subtasks).toHaveProperty('backend')
        expect(subtasks).toHaveProperty('frontend')
        expect(subtasks).toHaveProperty('qa')
        expect(subtasks).toHaveProperty('product')
        expect(subtasks).toHaveProperty('devops')
      })

      it('each subtask has the required fields', async () => {
        const { subtasks } = await service.generate(mockInput)
        const allSubtasks = [
          ...subtasks.backend,
          ...subtasks.frontend,
          ...subtasks.qa,
          ...subtasks.product,
          ...subtasks.devops,
        ]
        expect(allSubtasks.length).toBeGreaterThan(0)
        for (const st of allSubtasks) {
          expect(st).toHaveProperty('title')
          expect(st).toHaveProperty('description')
          expect(st).toHaveProperty('estimateHours')
          expect(st).toHaveProperty('priority')
          expect(st).toHaveProperty('dependencies')
          expect(st).toHaveProperty('assignTo')
          expect(['critical', 'high', 'medium', 'low']).toContain(st.priority)
          expect(typeof st.estimateHours).toBe('number')
          expect(st.estimateHours).toBeGreaterThan(0)
          expect(Array.isArray(st.dependencies)).toBe(true)
        }
      })

      it('backend subtasks all have assignTo = "backend"', async () => {
        const { subtasks } = await service.generate(mockInput)
        for (const st of subtasks.backend) {
          expect(st.assignTo).toBe('backend')
        }
      })

      it('frontend subtasks all have assignTo = "frontend"', async () => {
        const { subtasks } = await service.generate(mockInput)
        for (const st of subtasks.frontend) {
          expect(st.assignTo).toBe('frontend')
        }
      })
    })

    describe('totalEstimateHours', () => {
      it('is a positive number', async () => {
        const { totalEstimateHours } = await service.generate(mockInput)
        expect(typeof totalEstimateHours).toBe('number')
        expect(totalEstimateHours).toBeGreaterThan(0)
      })
    })

    describe('criticalPath', () => {
      it('is a non-empty array of strings', async () => {
        const { criticalPath } = await service.generate(mockInput)
        expect(Array.isArray(criticalPath)).toBe(true)
        expect(criticalPath.length).toBeGreaterThan(0)
        for (const step of criticalPath) {
          expect(typeof step).toBe('string')
        }
      })
    })
  })
})
