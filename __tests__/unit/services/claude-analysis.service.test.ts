import { ClaudeAnalysisService } from '@/services/claude/claude-analysis.service'

// In the test environment ANTHROPIC_API_KEY is not set → isClaudeMockMode() returns true.
// All tests run against the mock output without making real API calls.

describe('ClaudeAnalysisService (mock mode)', () => {
  let service: ClaudeAnalysisService

  beforeEach(() => {
    service = new ClaudeAnalysisService()
  })

  const mockInput = {
    demand: 'Implementar sistema de notificações push',
    organizationalContext: 'Contexto de teste',
  }

  describe('analyze', () => {
    it('returns an object with all required top-level keys', async () => {
      const result = await service.analyze(mockInput)
      expect(result).toHaveProperty('ambiguities')
      expect(result).toHaveProperty('risks')
      expect(result).toHaveProperty('dependencies')
      expect(result).toHaveProperty('stakeholders')
      expect(result).toHaveProperty('openQuestions')
      expect(result).toHaveProperty('riskScore')
      expect(result).toHaveProperty('summary')
      expect(result).toHaveProperty('recommendations')
    })

    it('ambiguities is a non-empty array of strings', async () => {
      const result = await service.analyze(mockInput)
      expect(Array.isArray(result.ambiguities)).toBe(true)
      expect(result.ambiguities.length).toBeGreaterThan(0)
      for (const a of result.ambiguities) {
        expect(typeof a).toBe('string')
      }
    })

    it('risks contains objects with description, severity and mitigation', async () => {
      const result = await service.analyze(mockInput)
      expect(Array.isArray(result.risks)).toBe(true)
      for (const risk of result.risks) {
        expect(risk).toHaveProperty('description')
        expect(risk).toHaveProperty('severity')
        expect(risk).toHaveProperty('mitigation')
        expect(['low', 'medium', 'high', 'critical']).toContain(risk.severity)
      }
    })

    it('dependencies contains objects with name, type and description', async () => {
      const result = await service.analyze(mockInput)
      expect(Array.isArray(result.dependencies)).toBe(true)
      for (const dep of result.dependencies) {
        expect(dep).toHaveProperty('name')
        expect(dep).toHaveProperty('type')
        expect(dep).toHaveProperty('description')
        expect(['technical', 'team', 'external', 'data']).toContain(dep.type)
      }
    })

    it('stakeholders contains objects with role, involvement and notes', async () => {
      const result = await service.analyze(mockInput)
      expect(Array.isArray(result.stakeholders)).toBe(true)
      for (const s of result.stakeholders) {
        expect(s).toHaveProperty('role')
        expect(s).toHaveProperty('involvement')
        expect(s).toHaveProperty('notes')
        expect(['responsible', 'accountable', 'consulted', 'informed']).toContain(s.involvement)
      }
    })

    it('openQuestions is an array of strings', async () => {
      const result = await service.analyze(mockInput)
      expect(Array.isArray(result.openQuestions)).toBe(true)
      for (const q of result.openQuestions) {
        expect(typeof q).toBe('string')
      }
    })

    it('riskScore is a number between 0 and 100', async () => {
      const result = await service.analyze(mockInput)
      expect(typeof result.riskScore).toBe('number')
      expect(result.riskScore).toBeGreaterThanOrEqual(0)
      expect(result.riskScore).toBeLessThanOrEqual(100)
    })

    it('summary is a non-empty string', async () => {
      const result = await service.analyze(mockInput)
      expect(typeof result.summary).toBe('string')
      expect(result.summary.length).toBeGreaterThan(0)
    })

    it('recommendations is a non-empty array of strings', async () => {
      const result = await service.analyze(mockInput)
      expect(Array.isArray(result.recommendations)).toBe(true)
      expect(result.recommendations.length).toBeGreaterThan(0)
      for (const r of result.recommendations) {
        expect(typeof r).toBe('string')
      }
    })

    it('returns the same mock result regardless of input', async () => {
      const result1 = await service.analyze(mockInput)
      const result2 = await service.analyze({
        demand: 'Outra demanda completamente diferente',
        organizationalContext: '',
      })
      expect(result1).toEqual(result2)
    })
  })
})
