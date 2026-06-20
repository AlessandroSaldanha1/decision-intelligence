import Anthropic from '@anthropic-ai/sdk'

const MAX_DIRECT_CHARS = 4000

/**
 * If the cleaned transcript is short enough, returns it as-is.
 * If it's long, uses Claude to extract a structured summary (decisions, requirements, pain points, actors).
 * This keeps downstream prompts focused and under ~1000 tokens of context.
 */
export async function getTranscriptContext(
  transcript: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const trimmed = transcript.trim()

  if (trimmed.length <= MAX_DIRECT_CHARS) {
    return trimmed
  }

  const client = new Anthropic({ apiKey })

  const prompt = `Você é um analista que extrai requisitos de transcrições de reuniões.

Transcrição:
"""
${trimmed.slice(0, 80000)}
"""

Extraia e retorne APENAS um resumo estruturado em português com as seguintes seções (sem markdown extra, apenas texto):

DECISÕES TOMADAS:
- [lista as decisões explícitas]

REQUISITOS IDENTIFICADOS:
- [lista os requisitos funcionais e de UX mencionados]

PROBLEMAS / DOR:
- [lista problemas, reclamações ou pontos de atenção]

ATORES ENVOLVIDOS:
- [lista os perfis de usuário, times ou stakeholders mencionados]

CONTEXTO GERAL:
[1-2 frases descrevendo o tema central da reunião]

Seja direto e objetivo. Máximo 400 palavras.`

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    return text.trim() || trimmed.slice(0, MAX_DIRECT_CHARS)
  } catch (err) {
    console.error('[summarize-transcript] Claude summarization failed:', err)
    // Fallback: send just the first MAX_DIRECT_CHARS chars
    return trimmed.slice(0, MAX_DIRECT_CHARS)
  }
}
