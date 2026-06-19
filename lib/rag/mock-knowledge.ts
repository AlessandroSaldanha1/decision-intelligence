import type { KnowledgeDocument, KnowledgeInsight, KnowledgeSource, SimilarityResult } from '@/types/knowledge'

export const mockKnowledgeSources: KnowledgeSource[] = [
  {
    id: 'ks-tasks',
    type: 'tasks',
    name: 'Tasks e Sprints',
    description: 'Histórico de tasks concluídas, em progresso e canceladas',
    enabled: true,
    lastIndexed: new Date(Date.now() - 3600000).toISOString(),
    documentCount: 247,
  },
  {
    id: 'ks-comments',
    type: 'comments',
    name: 'Comentários',
    description: 'Discussões, decisões e observações em tasks',
    enabled: true,
    lastIndexed: new Date(Date.now() - 7200000).toISOString(),
    documentCount: 1823,
  },
  {
    id: 'ks-subtasks',
    type: 'subtasks',
    name: 'Subtasks',
    description: 'Detalhamento técnico e breakdown de implementações',
    enabled: false,
    lastIndexed: null,
    documentCount: 0,
  },
  {
    id: 'ks-docs',
    type: 'docs',
    name: 'Docs',
    description: 'Documentação técnica e de produto',
    enabled: false,
    lastIndexed: null,
    documentCount: 0,
  },
]

export const mockDocuments: KnowledgeDocument[] = [
  {
    id: 'doc-001',
    sourceId: 'ks-tasks',
    sourceType: 'tasks',
    title: 'Implementar autenticação OAuth',
    content:
      'Implementação do fluxo OAuth com Google e GitHub usando NextAuth v5. Decisão de usar httpOnly cookies para armazenar refresh tokens. Rate limiting adicionado no callback endpoint.',
    metadata: {
      projectName: 'Produto Digital',
      spaceName: 'Frontend',
      listName: 'Sprint 2024-Q1',
      taskId: 't-001',
      taskName: 'Implementar autenticação OAuth',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      author: 'maria.silva',
      tags: ['auth', 'oauth', 'security'],
      url: 'https://app.clickup.com/t/t-001',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: 'doc-002',
    sourceId: 'ks-comments',
    sourceType: 'comments',
    title: 'Decisão: NextAuth v5 para auth',
    content:
      'Decidimos usar NextAuth v5 para simplificar a integração com o App Router. Alternativas consideradas: Auth.js, Clerk (descartado por custo), implementação própria (descartada por complexidade).',
    metadata: {
      projectName: 'Produto Digital',
      spaceName: 'Frontend',
      taskId: 't-001',
      taskName: 'Implementar autenticação OAuth',
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z',
      author: 'maria.silva',
    },
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
  {
    id: 'doc-003',
    sourceId: 'ks-tasks',
    sourceType: 'tasks',
    title: 'Refatorar módulo de pagamentos',
    content:
      'Extração da lógica de pagamento para serviço dedicado. Implementação de retry com exponential backoff e Dead Letter Queue no SQS. Padrão Saga para transações distribuídas.',
    metadata: {
      projectName: 'Engenharia',
      spaceName: 'Backend',
      listName: 'Sprint 2024-Q1',
      taskId: 't-002',
      taskName: 'Refatorar módulo de pagamentos',
      createdAt: '2024-01-18T11:00:00Z',
      updatedAt: '2024-01-22T16:00:00Z',
      author: 'ana.costa',
      tags: ['payments', 'refactor', 'sqs', 'saga'],
    },
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-22T16:00:00Z',
  },
]

export const mockInsights: KnowledgeInsight[] = [
  {
    id: 'ins-001',
    title: 'Padrão: httpOnly cookies para tokens sensíveis',
    description:
      'O time adotou o padrão de armazenar tokens sensíveis (refresh tokens, API keys) em httpOnly cookies para prevenir acesso via JavaScript e ataques XSS.',
    type: 'pattern',
    confidence: 0.92,
    sourceDocumentIds: ['doc-001', 'doc-002'],
    tags: ['security', 'auth', 'cookies'],
    createdAt: '2024-01-20T12:00:00Z',
  },
  {
    id: 'ins-002',
    title: 'Risco: integração com SQS requer políticas IAM cuidadosas',
    description:
      'A integração com AWS SQS historicamente gerou problemas de permissão em ambientes novos. Sempre verificar e documentar as políticas IAM necessárias antes de iniciar.',
    type: 'risk',
    confidence: 0.85,
    sourceDocumentIds: ['doc-003'],
    tags: ['aws', 'sqs', 'iam', 'risk'],
    createdAt: '2024-01-22T14:00:00Z',
  },
  {
    id: 'ins-003',
    title: 'Decisão: NextAuth v5 como padrão de autenticação',
    description:
      'NextAuth v5 foi escolhido como biblioteca padrão de autenticação para projetos Next.js após avaliação de Clerk (custo) e implementação própria (complexidade).',
    type: 'decision',
    confidence: 0.98,
    sourceDocumentIds: ['doc-002'],
    tags: ['auth', 'nextauth', 'decision'],
    createdAt: '2024-01-16T10:00:00Z',
  },
]

export function mockSearch(query: string, limit = 5): SimilarityResult[] {
  const queryLower = query.toLowerCase()
  return mockDocuments
    .map((doc) => {
      const titleScore = doc.title.toLowerCase().includes(queryLower) ? 0.9 : 0
      const contentScore = doc.content.toLowerCase().includes(queryLower) ? 0.7 : 0
      const tagScore =
        (doc.metadata.tags ?? []).some((t) => t.toLowerCase().includes(queryLower)) ? 0.8 : 0
      const score = Math.max(titleScore, contentScore, tagScore) + Math.random() * 0.1

      return {
        document: doc,
        score: Math.min(score, 1),
        relevantChunks: [doc.content.slice(0, 200)],
      }
    })
    .filter((r) => r.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
