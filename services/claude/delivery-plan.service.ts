import { getAnthropicClient } from '@/lib/claude/client'
import { env, isClaudeMockMode } from '@/lib/config/env'
import type { DeliveryPlanInput, DeliveryPlanOutput } from '@/types/claude'

const MOCK_DELIVERY_PLAN: DeliveryPlanOutput = {
  epic: {
    title: 'Autenticação OAuth — Google e GitHub',
    description: 'Implementar fluxo completo de autenticação OAuth com suporte a Google e GitHub, incluindo gerenciamento de sessão seguro e experiência de usuário fluida.',
    estimateDays: 5,
  },
  mainTask: {
    title: 'Implementar autenticação OAuth',
    description: 'Configurar NextAuth v5 com providers Google e GitHub, gerenciar sessões e proteger rotas da aplicação.',
  },
  subtasks: {
    backend: [
      {
        title: 'Configurar NextAuth com providers OAuth',
        description: 'Instalar e configurar NextAuth v5, adicionar providers Google e GitHub, configurar callbacks de sessão.',
        estimateHours: 4,
        priority: 'critical',
        dependencies: [],
        assignTo: 'backend',
      },
      {
        title: 'Implementar rate limiting no callback',
        description: 'Adicionar middleware de rate limiting no endpoint /api/auth/callback para prevenir abuso.',
        estimateHours: 2,
        priority: 'high',
        dependencies: ['Configurar NextAuth com providers OAuth'],
        assignTo: 'backend',
      },
      {
        title: 'Configurar proteção de rotas no middleware',
        description: 'Criar middleware Next.js para verificar sessão e redirecionar usuários não autenticados.',
        estimateHours: 2,
        priority: 'high',
        dependencies: ['Configurar NextAuth com providers OAuth'],
        assignTo: 'backend',
      },
    ],
    frontend: [
      {
        title: 'Criar tela de login',
        description: 'Implementar página /login com botões de OAuth, estados de loading e mensagens de erro.',
        estimateHours: 4,
        priority: 'critical',
        dependencies: [],
        assignTo: 'frontend',
      },
      {
        title: 'Adicionar UserMenu no header',
        description: 'Exibir avatar e opção de logout para usuários autenticados no header da aplicação.',
        estimateHours: 2,
        priority: 'medium',
        dependencies: ['Criar tela de login'],
        assignTo: 'frontend',
      },
    ],
    qa: [
      {
        title: 'Escrever testes E2E do fluxo de login',
        description: 'Implementar testes Playwright cobrindo happy path e cenários de erro.',
        estimateHours: 6,
        priority: 'high',
        dependencies: ['Criar tela de login', 'Configurar NextAuth com providers OAuth'],
        assignTo: 'qa',
      },
    ],
    product: [
      {
        title: 'Configurar OAuth Apps em Google Console e GitHub',
        description: 'Criar e configurar as aplicações OAuth nos portais dos providers, obter client ID e secret.',
        estimateHours: 1,
        priority: 'critical',
        dependencies: [],
        assignTo: 'product',
      },
    ],
    devops: [
      {
        title: 'Configurar variáveis de ambiente nos ambientes',
        description: 'Adicionar GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_ID, GITHUB_SECRET e NEXTAUTH_SECRET em staging e produção.',
        estimateHours: 1,
        priority: 'critical',
        dependencies: ['Configurar OAuth Apps em Google Console e GitHub'],
        assignTo: 'devops',
      },
    ],
  },
  totalEstimateHours: 22,
  criticalPath: [
    'Configurar OAuth Apps em Google Console e GitHub',
    'Configurar variáveis de ambiente nos ambientes',
    'Configurar NextAuth com providers OAuth',
    'Criar tela de login',
    'Escrever testes E2E do fluxo de login',
  ],
}

export class DeliveryPlanService {
  async generate(input: DeliveryPlanInput): Promise<DeliveryPlanOutput> {
    if (isClaudeMockMode()) return MOCK_DELIVERY_PLAN

    const client = getAnthropicClient()

    const prompt = `Você é um tech lead e engineering manager gerando um plano de entrega detalhado.

## Demanda
${input.demand}

## User Story
${JSON.stringify(input.userStory, null, 2)}

## Análise
${JSON.stringify(input.analysis, null, 2)}

## Contexto Organizacional
${input.organizationalContext}

Gere um plano de entrega completo com subtasks por frente. Retorne um JSON válido:
{
  "epic": {"title":"string","description":"string","estimateDays":number},
  "mainTask": {"title":"string","description":"string"},
  "subtasks": {
    "backend": [{"title":"string","description":"string","estimateHours":number,"priority":"critical|high|medium|low","dependencies":["string"],"assignTo":"backend"}],
    "frontend": [...],
    "qa": [...],
    "product": [...],
    "devops": [...]
  },
  "totalEstimateHours": number,
  "criticalPath": ["string"]
}

Retorne APENAS o JSON.`

    const message = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

    return JSON.parse(content.text) as DeliveryPlanOutput
  }
}
