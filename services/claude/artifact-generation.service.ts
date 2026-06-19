import { getAnthropicClient } from '@/lib/claude/client'
import { env, isClaudeMockMode } from '@/lib/config/env'
import type { ArtifactGenerationInput, ArtifactGenerationOutput } from '@/types/claude'

const MOCK_ARTIFACTS: ArtifactGenerationOutput = {
  userStory: {
    title: 'Implementar fluxo de autenticação com OAuth',
    asA: 'usuário da plataforma',
    iWant: 'poder fazer login usando minha conta Google ou GitHub',
    soThat: 'eu não precise criar e lembrar uma senha separada',
    acceptanceCriteria: [
      'Dado que o usuário está na tela de login, quando ele clicar em "Entrar com Google", então ele deve ser redirecionado para o fluxo OAuth do Google',
      'Dado que o OAuth foi completado com sucesso, quando o usuário retornar para a plataforma, então ele deve estar autenticado e ver o dashboard',
      'Dado que o usuário já está autenticado, quando ele acessar qualquer rota protegida, então ele deve ter acesso sem ser redirecionado para login',
      'Dado que o token de sessão expirou, quando o usuário tentar acessar uma rota protegida, então ele deve ser redirecionado para a tela de login',
    ],
    technicalNotes: [
      'Usar NextAuth v5 para gerenciar sessão e providers OAuth',
      'Armazenar refresh token de forma segura (httpOnly cookie)',
      'Implementar rate limiting no endpoint de callback',
    ],
  },
  bddScenarios: [
    {
      title: 'Login bem-sucedido com Google',
      given: ['o usuário está na tela de login', 'o usuário possui uma conta Google válida'],
      when: [
        'o usuário clica no botão "Entrar com Google"',
        'o usuário autoriza o acesso na tela do Google',
      ],
      then: [
        'o usuário é redirecionado para o dashboard',
        'uma sessão é criada com os dados do perfil Google',
      ],
      tags: ['@auth', '@oauth', '@google', '@happy-path'],
    },
    {
      title: 'Tentativa de login com permissão negada',
      given: ['o usuário está na tela de login'],
      when: ['o usuário clica em "Entrar com Google"', 'o usuário cancela ou nega a permissão'],
      then: [
        'o usuário retorna para a tela de login',
        'uma mensagem de erro informativa é exibida',
        'nenhuma sessão é criada',
      ],
      tags: ['@auth', '@oauth', '@error-handling'],
    },
  ],
  testCases: [
    {
      id: 'TC-001',
      title: 'Login OAuth Google — fluxo happy path',
      type: 'e2e',
      priority: 'critical',
      steps: [
        'Acessar /login',
        'Clicar em "Entrar com Google"',
        'Inserir credenciais válidas no popup do Google',
        'Autorizar o acesso',
        'Aguardar redirect para /dashboard',
      ],
      expectedResult: 'Usuário logado e na página /dashboard com dados do perfil visíveis',
    },
    {
      id: 'TC-002',
      title: 'Sessão expirada redireciona para login',
      type: 'functional',
      priority: 'high',
      steps: ['Acessar uma rota protegida sem sessão ativa', 'Verificar redirect para /login'],
      expectedResult: 'Usuário redirecionado para /login com parâmetro callbackUrl',
    },
    {
      id: 'TC-003',
      title: 'Rate limiting no endpoint de callback',
      type: 'negative',
      priority: 'high',
      steps: [
        'Enviar mais de 10 requests para /api/auth/callback/google em 1 minuto',
        'Verificar resposta HTTP',
      ],
      expectedResult: 'Resposta 429 Too Many Requests após exceder o limite',
    },
  ],
  definitionOfDone: {
    technical: [
      'Código revisado por pelo menos 1 pessoa do time',
      'Cobertura de testes >= 80% nas funções críticas',
      'TypeScript sem erros de tipo',
      'ESLint sem warnings críticos',
    ],
    quality: [
      'Todos os cenários BDD passando',
      'Testes E2E executados em ambiente de staging',
      'Testado nos principais browsers (Chrome, Firefox, Safari)',
    ],
    documentation: [
      'Fluxo de autenticação documentado no confluence',
      'Variáveis de ambiente documentadas no .env.example',
      'Decisões técnicas registradas como ADR',
    ],
    deployment: [
      'Deploy realizado em staging e validado',
      'Feature flag configurada para rollout gradual',
      'Monitoramento de erros configurado (Sentry)',
      'Runbook atualizado',
    ],
  },
  dependencies: [
    'Configuração dos OAuth Apps no Google Console e GitHub',
    'Variáveis de ambiente configuradas em todos os ambientes',
    'Banco de dados com tabela de sessions criada',
    'Alinhamento com time de segurança sobre política de sessões',
  ],
}

export class ArtifactGenerationService {
  async generate(input: ArtifactGenerationInput): Promise<ArtifactGenerationOutput> {
    if (isClaudeMockMode()) return MOCK_ARTIFACTS

    const client = getAnthropicClient()

    const prompt = `Você é um engenheiro de software e product manager sênior gerando artefatos de desenvolvimento.

## Demanda
${input.demand}

## Análise Prévia
${JSON.stringify(input.analysis, null, 2)}

## Contexto Organizacional
${input.organizationalContext}

Gere artefatos completos de desenvolvimento. Retorne um JSON válido com:
{
  "userStory": {
    "title": "string",
    "asA": "string",
    "iWant": "string",
    "soThat": "string",
    "acceptanceCriteria": ["string"],
    "technicalNotes": ["string"]
  },
  "bddScenarios": [{"title":"string","given":["string"],"when":["string"],"then":["string"],"tags":["string"]}],
  "testCases": [{"id":"string","title":"string","type":"functional|integration|e2e|edge_case|negative","priority":"critical|high|medium|low","steps":["string"],"expectedResult":"string"}],
  "definitionOfDone": {
    "technical": ["string"],
    "quality": ["string"],
    "documentation": ["string"],
    "deployment": ["string"]
  },
  "dependencies": ["string"]
}

Retorne APENAS o JSON.`

    const message = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

    return JSON.parse(content.text) as ArtifactGenerationOutput
  }
}
