import { ArtifactGenerationService } from '@/services/claude/artifact-generation.service'

// ANTHROPIC_API_KEY not set in test env → isClaudeMockMode() = true → mock output.

describe('ArtifactGenerationService (mock mode)', () => {
  let service: ArtifactGenerationService

  beforeEach(() => {
    service = new ArtifactGenerationService()
  })

  const mockInput = {
    demand: 'Implementar autenticação OAuth',
    analysis: {
      ambiguities: [],
      risks: [],
      dependencies: [],
      stakeholders: [],
      openQuestions: [],
      riskScore: 50,
      summary: 'Test summary',
      recommendations: [],
    },
    organizationalContext: 'Contexto de teste',
  }

  describe('generate', () => {
    it('returns an object with all top-level artifact keys', async () => {
      const result = await service.generate(mockInput)
      expect(result).toHaveProperty('userStory')
      expect(result).toHaveProperty('bddScenarios')
      expect(result).toHaveProperty('testCases')
      expect(result).toHaveProperty('definitionOfDone')
      expect(result).toHaveProperty('dependencies')
    })

    describe('userStory', () => {
      it('has all required user story fields', async () => {
        const { userStory } = await service.generate(mockInput)
        expect(userStory).toHaveProperty('title')
        expect(userStory).toHaveProperty('asA')
        expect(userStory).toHaveProperty('iWant')
        expect(userStory).toHaveProperty('soThat')
        expect(userStory).toHaveProperty('acceptanceCriteria')
        expect(userStory).toHaveProperty('technicalNotes')
      })

      it('acceptanceCriteria is a non-empty array of strings', async () => {
        const { userStory } = await service.generate(mockInput)
        expect(Array.isArray(userStory.acceptanceCriteria)).toBe(true)
        expect(userStory.acceptanceCriteria.length).toBeGreaterThan(0)
        for (const c of userStory.acceptanceCriteria) {
          expect(typeof c).toBe('string')
        }
      })

      it('technicalNotes is an array of strings', async () => {
        const { userStory } = await service.generate(mockInput)
        expect(Array.isArray(userStory.technicalNotes)).toBe(true)
        for (const n of userStory.technicalNotes) {
          expect(typeof n).toBe('string')
        }
      })
    })

    describe('bddScenarios', () => {
      it('is a non-empty array', async () => {
        const { bddScenarios } = await service.generate(mockInput)
        expect(Array.isArray(bddScenarios)).toBe(true)
        expect(bddScenarios.length).toBeGreaterThan(0)
      })

      it('each scenario has title, given, when, then and tags', async () => {
        const { bddScenarios } = await service.generate(mockInput)
        for (const scenario of bddScenarios) {
          expect(scenario).toHaveProperty('title')
          expect(Array.isArray(scenario.given)).toBe(true)
          expect(Array.isArray(scenario.when)).toBe(true)
          expect(Array.isArray(scenario.then)).toBe(true)
          expect(Array.isArray(scenario.tags)).toBe(true)
        }
      })
    })

    describe('testCases', () => {
      it('is a non-empty array', async () => {
        const { testCases } = await service.generate(mockInput)
        expect(Array.isArray(testCases)).toBe(true)
        expect(testCases.length).toBeGreaterThan(0)
      })

      it('each test case has required fields with valid enum values', async () => {
        const { testCases } = await service.generate(mockInput)
        const validTypes = ['functional', 'integration', 'e2e', 'edge_case', 'negative']
        const validPriorities = ['critical', 'high', 'medium', 'low']
        for (const tc of testCases) {
          expect(tc).toHaveProperty('id')
          expect(tc).toHaveProperty('title')
          expect(tc).toHaveProperty('type')
          expect(tc).toHaveProperty('priority')
          expect(tc).toHaveProperty('steps')
          expect(tc).toHaveProperty('expectedResult')
          expect(validTypes).toContain(tc.type)
          expect(validPriorities).toContain(tc.priority)
          expect(Array.isArray(tc.steps)).toBe(true)
        }
      })
    })

    describe('definitionOfDone', () => {
      it('has technical, quality, documentation and deployment sections', async () => {
        const { definitionOfDone } = await service.generate(mockInput)
        expect(definitionOfDone).toHaveProperty('technical')
        expect(definitionOfDone).toHaveProperty('quality')
        expect(definitionOfDone).toHaveProperty('documentation')
        expect(definitionOfDone).toHaveProperty('deployment')
      })

      it('all DoD sections are non-empty arrays', async () => {
        const { definitionOfDone } = await service.generate(mockInput)
        expect(definitionOfDone.technical.length).toBeGreaterThan(0)
        expect(definitionOfDone.quality.length).toBeGreaterThan(0)
        expect(definitionOfDone.documentation.length).toBeGreaterThan(0)
        expect(definitionOfDone.deployment.length).toBeGreaterThan(0)
      })
    })

    describe('dependencies', () => {
      it('is an array of strings', async () => {
        const { dependencies } = await service.generate(mockInput)
        expect(Array.isArray(dependencies)).toBe(true)
        for (const d of dependencies) {
          expect(typeof d).toBe('string')
        }
      })
    })
  })
})
