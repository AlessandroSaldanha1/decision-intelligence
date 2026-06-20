import { mockSearch, mockKnowledgeSources, mockDocuments, mockInsights } from '@/lib/rag/mock-knowledge'

describe('mockKnowledgeSources', () => {
  it('returns an array with 4 sources', () => {
    expect(mockKnowledgeSources).toHaveLength(4)
  })

  it('each source has required fields', () => {
    for (const source of mockKnowledgeSources) {
      expect(source).toHaveProperty('id')
      expect(source).toHaveProperty('type')
      expect(source).toHaveProperty('name')
      expect(source).toHaveProperty('enabled')
      expect(source).toHaveProperty('documentCount')
    }
  })

  it('tasks and comments sources are enabled by default', () => {
    const tasks = mockKnowledgeSources.find((s) => s.type === 'tasks')
    const comments = mockKnowledgeSources.find((s) => s.type === 'comments')
    expect(tasks?.enabled).toBe(true)
    expect(comments?.enabled).toBe(true)
  })

  it('subtasks and docs sources are disabled by default', () => {
    const subtasks = mockKnowledgeSources.find((s) => s.type === 'subtasks')
    const docs = mockKnowledgeSources.find((s) => s.type === 'docs')
    expect(subtasks?.enabled).toBe(false)
    expect(docs?.enabled).toBe(false)
  })
})

describe('mockDocuments', () => {
  it('returns a non-empty array', () => {
    expect(mockDocuments.length).toBeGreaterThan(0)
  })

  it('each document has required fields', () => {
    for (const doc of mockDocuments) {
      expect(doc).toHaveProperty('id')
      expect(doc).toHaveProperty('title')
      expect(doc).toHaveProperty('content')
      expect(doc).toHaveProperty('metadata')
    }
  })
})

describe('mockInsights', () => {
  it('contains pattern, risk and decision types', () => {
    const types = mockInsights.map((i) => i.type)
    expect(types).toContain('pattern')
    expect(types).toContain('risk')
    expect(types).toContain('decision')
  })

  it('each insight has confidence between 0 and 1', () => {
    for (const insight of mockInsights) {
      expect(insight.confidence).toBeGreaterThanOrEqual(0)
      expect(insight.confidence).toBeLessThanOrEqual(1)
    }
  })
})

describe('mockSearch', () => {
  it('returns results for a query matching document title', () => {
    const results = mockSearch('autenticação')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns results for a query matching document content', () => {
    const results = mockSearch('oauth')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns results for a query matching document tags', () => {
    const results = mockSearch('auth')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns empty array for a completely unmatched query', () => {
    // Score without any match is 0 + Math.random()*0.1 (max 0.1 < 0.3)
    const results = mockSearch('zzzzzzzzzzz_nomatch_xyzabc123')
    expect(results).toEqual([])
  })

  it('respects the limit parameter', () => {
    const limit = 1
    const results = mockSearch('a', limit)
    expect(results.length).toBeLessThanOrEqual(limit)
  })

  it('returns results sorted by descending score', () => {
    const results = mockSearch('autenticação', 10)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  it('each result has document, score and relevantChunks', () => {
    const results = mockSearch('pagamento')
    for (const r of results) {
      expect(r).toHaveProperty('document')
      expect(r).toHaveProperty('score')
      expect(r).toHaveProperty('relevantChunks')
      expect(typeof r.score).toBe('number')
      expect(Array.isArray(r.relevantChunks)).toBe(true)
    }
  })

  it('all returned scores are <= 1', () => {
    const results = mockSearch('autenticação', 10)
    for (const r of results) {
      expect(r.score).toBeLessThanOrEqual(1)
    }
  })

  it('all returned scores are > 0.3 (filter threshold)', () => {
    const results = mockSearch('autenticação', 10)
    for (const r of results) {
      expect(r.score).toBeGreaterThan(0.3)
    }
  })
})
