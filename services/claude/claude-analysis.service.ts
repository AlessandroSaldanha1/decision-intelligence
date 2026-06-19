import { getAnthropicClient } from '@/lib/claude/client'
import { env, isClaudeMockMode } from '@/lib/config/env'
import type { ClaudeAnalysisInput, ClaudeAnalysisOutput } from '@/types/claude'

const MOCK_ANALYSIS: ClaudeAnalysisOutput = {
  ambiguities: [
    'O escopo de "notificações" não está claro — push, email ou ambos?',
    'Qual é o volume esperado de usuários simultâneos?',
    'Existe integração com sistemas legados que precisa ser considerada?',
  ],
  risks: [
    {
      description: 'Complexidade de integração com APIs externas',
      severity: 'high',
      mitigation: 'Criar camada de abstração e circuit breaker para chamadas externas',
    },
    {
      description: 'Performance com grande volume de dados históricos',
      severity: 'medium',
      mitigation: 'Implementar paginação e cache na camada de consulta',
    },
    {
      description: 'Falta de especificação de edge cases de autenticação',
      severity: 'low',
      mitigation: 'Revisar fluxo de auth com time de produto antes de implementar',
    },
  ],
  dependencies: [
    {
      name: 'Serviço de autenticação',
      type: 'technical',
      description: 'Depende do módulo de auth para validar permissões de acesso',
    },
    {
      name: 'Time de dados',
      type: 'team',
      description: 'Necessário alinhamento sobre schema do banco e migração',
    },
    {
      name: 'API de pagamentos externa',
      type: 'external',
      description: 'Integração com gateway de pagamento para processar transações',
    },
  ],
  stakeholders: [
    {
      role: 'Product Manager',
      involvement: 'accountable',
      notes: 'Responsável por validar os critérios de aceite',
    },
    {
      role: 'Tech Lead',
      involvement: 'responsible',
      notes: 'Responsável pela implementação técnica',
    },
    {
      role: 'QA Engineer',
      involvement: 'consulted',
      notes: 'Precisa ser envolvido na definição dos casos de teste',
    },
    {
      role: 'DevOps',
      involvement: 'informed',
      notes: 'Informar sobre mudanças de infraestrutura necessárias',
    },
  ],
  openQuestions: [
    'Qual é o prazo esperado de entrega?',
    'Existe algum constraint de tecnologia que precisa ser respeitado?',
    'Como será o rollout — feature flag, deploy gradual?',
  ],
  riskScore: 65,
  summary:
    'A demanda é viável tecnicamente mas requer clareza em alguns pontos de escopo antes de iniciar o desenvolvimento. Os principais riscos estão relacionados a integrações externas e volume de dados.',
  recommendations: [
    'Realizar refinamento com stakeholders para clarificar os pontos de ambiguidade antes de iniciar',
    'Criar spike técnico para validar integração com APIs externas',
    'Definir contrato de dados com time de backend antes de iniciar frontend',
  ],
}

export class ClaudeAnalysisService {
  async analyze(input: ClaudeAnalysisInput): Promise<ClaudeAnalysisOutput> {
    if (isClaudeMockMode()) return MOCK_ANALYSIS

    const client = getAnthropicClient()

    const prompt = `Você é um arquiteto de software e product manager sênior analisando uma nova demanda de produto.

## Demanda
${input.demand}

## Contexto Organizacional
${input.organizationalContext}

${input.additionalContext ? `## Contexto Adicional\n${input.additionalContext}` : ''}

Analise esta demanda e retorne um JSON válido com a seguinte estrutura:
{
  "ambiguities": ["string"],
  "risks": [{"description": "string", "severity": "low|medium|high|critical", "mitigation": "string"}],
  "dependencies": [{"name": "string", "type": "technical|team|external|data", "description": "string"}],
  "stakeholders": [{"role": "string", "involvement": "responsible|accountable|consulted|informed", "notes": "string"}],
  "openQuestions": ["string"],
  "riskScore": number (0-100),
  "summary": "string",
  "recommendations": ["string"]
}

Retorne APENAS o JSON, sem markdown ou texto adicional.`

    const message = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

    return JSON.parse(content.text) as ClaudeAnalysisOutput
  }
}
