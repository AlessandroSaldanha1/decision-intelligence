import { KnowledgeService } from '@/services/knowledge/knowledge.service'
import { mockKnowledgeSources, mockInsights } from '@/lib/rag/mock-knowledge'

describe('KnowledgeService', () => {
  let service: KnowledgeService

  beforeEach(() => {
    service = new KnowledgeService()
  })

  // ─── getSources ────────────────────────────────────────────────────────────

  describe('getSources', () => {
    it('returns the full list of mock knowledge sources', async () => {
      const sources = await service.getSources()
      expect(sources).toEqual(mockKnowledgeSources)
    })

    it('returns a non-empty array', async () => {
      const sources = await service.getSources()
      expect(sources.length).toBeGreaterThan(0)
    })
  })

  // ─── search ────────────────────────────────────────────────────────────────

  describe('search', () => {
    it('returns a RAGSearchResult with the correct query', async () => {
      const result = await service.search('autenticação')
      expect(result.query).toBe('autenticação')
    })

    it('includes totalFound equal to results.length', async () => {
      const result = await service.search('autenticação')
      expect(result.totalFound).toBe(result.results.length)
    })

    it('returns searchTime as a non-negative number', async () => {
      const result = await service.search('autenticação')
      expect(result.searchTime).toBeGreaterThanOrEqual(0)
    })

    it('respects the limit parameter', async () => {
      const result = await service.search('a', 1)
      expect(result.results.length).toBeLessThanOrEqual(1)
    })

    it('uses default limit of 5 when not specified', async () => {
      const result = await service.search('autenticação')
      expect(result.results.length).toBeLessThanOrEqual(5)
    })

    it('returns empty results for unmatched query', async () => {
      const result = await service.search('zzzzzzunmatchedxyz999')
      expect(result.results).toEqual([])
      expect(result.totalFound).toBe(0)
    })
  })

  // ─── getInsights ───────────────────────────────────────────────────────────

  describe('getInsights', () => {
    it('returns all insights when called with no tags', async () => {
      const insights = await service.getInsights()
      expect(insights).toEqual(mockInsights)
    })

    it('returns all insights when called with empty array', async () => {
      const insights = await service.getInsights([])
      expect(insights).toEqual(mockInsights)
    })

    it('filters insights by a single tag', async () => {
      const insights = await service.getInsights(['auth'])
      expect(insights.length).toBeGreaterThan(0)
      for (const insight of insights) {
        expect(insight.tags).toContain('auth')
      }
    })

    it('filters insights by multiple tags using OR logic', async () => {
      const insights = await service.getInsights(['auth', 'aws'])
      // Should return insights matching auth OR aws
      expect(insights.length).toBeGreaterThan(0)
    })

    it('returns empty array for a tag that matches nothing', async () => {
      const insights = await service.getInsights(['__nonexistent_tag__'])
      expect(insights).toEqual([])
    })
  })

  // ─── buildOrganizationalContext ────────────────────────────────────────────

  describe('buildOrganizationalContext', () => {
    it('returns context with all required keys', async () => {
      const context = await service.buildOrganizationalContext('autenticação')
      expect(context).toHaveProperty('similarTasks')
      expect(context).toHaveProperty('relatedDecisions')
      expect(context).toHaveProperty('patterns')
      expect(context).toHaveProperty('risks')
      expect(context).toHaveProperty('teamInsights')
    })

    it('relatedDecisions contains only decision-type insights', async () => {
      const context = await service.buildOrganizationalContext('autenticação')
      for (const d of context.relatedDecisions) {
        expect(d.type).toBe('decision')
      }
    })

    it('patterns contains only pattern-type insights', async () => {
      const context = await service.buildOrganizationalContext('autenticação')
      for (const p of context.patterns) {
        expect(p.type).toBe('pattern')
      }
    })

    it('risks contains only risk-type insights', async () => {
      const context = await service.buildOrganizationalContext('autenticação')
      for (const r of context.risks) {
        expect(r.type).toBe('risk')
      }
    })

    it('teamInsights is an array of 4 strings', async () => {
      const context = await service.buildOrganizationalContext('autenticação')
      expect(Array.isArray(context.teamInsights)).toBe(true)
      expect(context.teamInsights).toHaveLength(4)
      for (const insight of context.teamInsights) {
        expect(typeof insight).toBe('string')
      }
    })
  })

  // ─── formatContextForClaude ────────────────────────────────────────────────

  describe('formatContextForClaude', () => {
    it('returns a non-empty string', async () => {
      const context = await service.buildOrganizationalContext('autenticação')
      const formatted = service.formatContextForClaude(context)
      expect(typeof formatted).toBe('string')
      expect(formatted.length).toBeGreaterThan(0)
    })

    it('includes the Contexto Organizacional header', async () => {
      const context = await service.buildOrganizationalContext('autenticação')
      const formatted = service.formatContextForClaude(context)
      expect(formatted).toContain('## Contexto Organizacional')
    })

    it('includes team insights section when teamInsights exist', async () => {
      const context = await service.buildOrganizationalContext('autenticação')
      const formatted = service.formatContextForClaude(context)
      expect(formatted).toContain('### Resumo')
    })

    it('includes similar tasks section when similarTasks exist', async () => {
      const context = await service.buildOrganizationalContext('autenticação')
      if (context.similarTasks.length > 0) {
        const formatted = service.formatContextForClaude(context)
        expect(formatted).toContain('### Tasks Similares no Histórico')
      }
    })

    it('handles an empty context gracefully', () => {
      const emptyContext = {
        similarTasks: [],
        relatedDecisions: [],
        patterns: [],
        risks: [],
        teamInsights: [],
      }
      const formatted = service.formatContextForClaude(emptyContext)
      expect(typeof formatted).toBe('string')
      expect(formatted).toContain('## Contexto Organizacional')
    })
  })
})
