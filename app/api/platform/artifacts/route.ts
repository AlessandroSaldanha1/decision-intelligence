import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode } from '@/lib/config/env'

const FALLBACK = {
  userStory: 'Como analista de operações, eu quero alterar a vigência de um fundo exigindo justificativa e análise de impacto, para que mudanças sensíveis sejam rastreáveis e não gerem incidentes de PL/Cota.',
  bdd: [
    'Dado um fundo ativo com vigência vigente',
    'Quando o usuário solicita alteração de vigência sem justificativa',
    'Então o sistema bloqueia a operação e exige justificativa obrigatória',
    'E registra autor, data e motivo na trilha de auditoria',
  ],
  testCases: [
    'Bloquear alteração de vigência em fundo encerrado',
    'Exigir justificativa obrigatória antes de confirmar',
    'Exibir análise de impacto em entidades filhas (PL/Cota)',
    'Registrar a alteração na trilha de auditoria',
  ],
  dod: [
    'Justificativa obrigatória validada',
    'Análise de impacto exibida antes da confirmação',
    'Trilha de auditoria completa e testável',
    'Testes de regressão de PL/Cota aprovados',
  ],
  dependencies: ['Serviço de cálculo de PL/Cota', 'Módulo de auditoria', 'Catálogo de entidades filhas'],
  subtasks: [
    'Bloquear fundos encerrados',
    'Campo de justificativa obrigatório',
    'Tela de pré-visualização de impacto',
    'Evento de auditoria de alteração',
  ],
}

export async function POST(req: NextRequest) {
  const { demand } = (await req.json()) as { demand: string }

  if (isClaudeMockMode()) {
    return NextResponse.json(FALLBACK)
  }

  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Com base na demanda "${demand}" e no conhecimento organizacional (mudança de vigência que impactou PL/Cota gerando incidente em produção; ausência de justificativa obrigatória causando falha de auditoria; análise de impacto antes da aplicação reduziu chamados; lições: sempre exigir justificativa, não alterar fundos encerrados, validar impacto em entidades filhas, auditar alterações sensíveis), gere artefatos de especificação enriquecidos.
Responda APENAS com JSON válido, sem markdown, no formato exato:
{"userStory":"Como ... eu quero ... para ...","bdd":["Dado ...","Quando ...","Então ...","E ..."],"testCases":["...","...","...","..."],"dod":["...","...","...","..."],"dependencies":["...","...","..."],"subtasks":["...","...","...","..."]}
Tudo em português. O BDD em Gherkin (Dado/Quando/Então/E). 3 a 5 itens por lista.`

  try {
    const message = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    const data = match ? JSON.parse(match[0]) : null

    if (data && data.userStory && Array.isArray(data.bdd)) {
      return NextResponse.json(data)
    }
    return NextResponse.json(FALLBACK)
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
