import { mockInsights, mockKnowledgeSources, mockSearch } from '@/lib/rag/mock-knowledge'
import type {
  KnowledgeInsight,
  KnowledgeSource,
  OrganizationalContext,
  RAGSearchResult,
} from '@/types/knowledge'

export class KnowledgeService {
  async getSources(): Promise<KnowledgeSource[]> {
    return mockKnowledgeSources
  }

  async search(query: string, limit = 5): Promise<RAGSearchResult> {
    const start = Date.now()
    const results = mockSearch(query, limit)

    return {
      query,
      results,
      totalFound: results.length,
      searchTime: Date.now() - start,
    }
  }

  async getInsights(tags?: string[]): Promise<KnowledgeInsight[]> {
    if (!tags || tags.length === 0) return mockInsights

    return mockInsights.filter((insight) => tags.some((tag) => insight.tags.includes(tag)))
  }

  async buildOrganizationalContext(demand: string): Promise<OrganizationalContext> {
    const searchResults = await this.search(demand, 5)
    const allInsights = await this.getInsights()

    const patterns = allInsights.filter((i) => i.type === 'pattern')
    const risks = allInsights.filter((i) => i.type === 'risk')
    const decisions = allInsights.filter((i) => i.type === 'decision')

    const teamInsights = [
      `${searchResults.results.length} tasks similares encontradas no histórico organizacional`,
      `${decisions.length} decisões técnicas relacionadas identificadas`,
      `${patterns.length} padrões do time que devem ser respeitados`,
      `${risks.length} riscos históricos identificados nessa área`,
    ]

    return {
      similarTasks: searchResults.results,
      relatedDecisions: decisions,
      patterns,
      risks,
      teamInsights,
    }
  }

  formatContextForClaude(context: OrganizationalContext): string {
    const lines: string[] = []

    lines.push('## Contexto Organizacional\n')

    if (context.teamInsights.length > 0) {
      lines.push('### Resumo')
      context.teamInsights.forEach((i) => lines.push(`- ${i}`))
      lines.push('')
    }

    if (context.similarTasks.length > 0) {
      lines.push('### Tasks Similares no Histórico')
      context.similarTasks.slice(0, 3).forEach((r) => {
        lines.push(`**${r.document.title}** (similaridade: ${(r.score * 100).toFixed(0)}%)`)
        lines.push(r.document.content.slice(0, 300))
        lines.push('')
      })
    }

    if (context.relatedDecisions.length > 0) {
      lines.push('### Decisões Técnicas Relevantes')
      context.relatedDecisions.forEach((d) => {
        lines.push(`**${d.title}**`)
        lines.push(d.description)
        lines.push('')
      })
    }

    if (context.patterns.length > 0) {
      lines.push('### Padrões do Time')
      context.patterns.forEach((p) => {
        lines.push(`- **${p.title}**: ${p.description}`)
      })
      lines.push('')
    }

    if (context.risks.length > 0) {
      lines.push('### Riscos Históricos')
      context.risks.forEach((r) => {
        lines.push(`- **${r.title}**: ${r.description}`)
      })
    }

    return lines.join('\n')
  }
}
