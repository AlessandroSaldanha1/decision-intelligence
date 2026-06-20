import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode } from '@/lib/config/env'

const FALLBACK: { sections: { q: string; a: string }[] } = {
  sections: [
    { q: 'O que estamos esquecendo?', a: 'A justificativa obrigatória e o impacto em entidades filhas. Em casos similares (91%), a vigência alterou o cálculo de PL/Cota a jusante.' },
    { q: 'O que pode dar errado?', a: 'Recálculo indevido de PL/Cota em produção e alteração de fundos encerrados — exatamente o incidente registrado no projeto Atlas Fundos.' },
    { q: 'Quem será impactado?', a: 'Operação e Compliance (trilha de auditoria), além de Produto e Engenharia no recálculo de cotas e validações.' },
    { q: 'Quais erros já aconteceram antes?', a: 'Incidente em produção no Atlas Fundos e falha de auditoria na Previdência pela ausência de justificativa obrigatória.' },
    { q: 'Quais soluções já funcionaram?', a: 'A análise de impacto antes da aplicação, usada no projeto Cadastro, reduziu chamados; auditar alterações sensíveis sustentou a conformidade.' },
  ],
}

export async function POST(req: NextRequest) {
  const { demand } = (await req.json()) as { demand: string }

  if (isClaudeMockMode()) {
    return NextResponse.json(FALLBACK)
  }

  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista sênior de uma plataforma de Inteligência Organizacional.
Demanda nova: "${demand}".
Conhecimento organizacional encontrado:
- Projeto Atlas Fundos (similaridade 91%): Mudança de vigência impactou PL/Cota → Incidente em produção.
- Projeto Previdência (84%): Ausência de justificativa obrigatória → Falha de auditoria.
- Projeto Cadastro (79%): Análise de impacto antes da aplicação → Redução de chamados.
Lições aprendidas: Sempre exigir justificativa; Não alterar fundos encerrados; Validar impacto em entidades filhas; Auditar alterações sensíveis.
Times impactados: Operação, Compliance, Produto, Engenharia.

Produza uma análise de contexto. Responda APENAS com JSON válido, sem markdown, no formato exato:
{"sections":[{"q":"O que estamos esquecendo?","a":"..."},{"q":"O que pode dar errado?","a":"..."},{"q":"Quem será impactado?","a":"..."},{"q":"Quais erros já aconteceram antes?","a":"..."},{"q":"Quais soluções já funcionaram?","a":"..."}]}
Cada "a" deve ter 1-2 frases específicas em português, fundamentadas no conhecimento acima.`

  try {
    const message = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    const data = match ? JSON.parse(match[0]) : null

    if (data && Array.isArray(data.sections) && data.sections.length) {
      return NextResponse.json(data)
    }
    return NextResponse.json(FALLBACK)
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
