# Prompt — Claude Analysis

## Objetivo
Analisar uma nova demanda de produto com base na descrição e no contexto organizacional recuperado via RAG.

## Input
- `demand`: texto da demanda
- `organizationalContext`: contexto recuperado via RAG (formatted string)
- `additionalContext`: contexto adicional opcional

## Output (JSON)
```json
{
  "ambiguities": ["string"],
  "risks": [
    {
      "description": "string",
      "severity": "low|medium|high|critical",
      "mitigation": "string"
    }
  ],
  "dependencies": [
    {
      "name": "string",
      "type": "technical|team|external|data",
      "description": "string"
    }
  ],
  "stakeholders": [
    {
      "role": "string",
      "involvement": "responsible|accountable|consulted|informed",
      "notes": "string"
    }
  ],
  "openQuestions": ["string"],
  "riskScore": 0,
  "summary": "string",
  "recommendations": ["string"]
}
```

## Template do Prompt

```
Você é um arquiteto de software e product manager sênior analisando uma nova demanda de produto.

## Demanda
{demand}

## Contexto Organizacional
{organizationalContext}

Analise esta demanda considerando:
1. Ambiguidades e pontos que precisam de clareza
2. Riscos técnicos e de produto (com severidade e mitigação)
3. Dependências (técnicas, de times, externas, de dados)
4. Stakeholders e seu envolvimento (modelo RACI)
5. Perguntas em aberto que precisam ser respondidas
6. Score de risco geral (0-100)
7. Sumário executivo
8. Recomendações de próximos passos

Retorne APENAS o JSON válido, sem markdown ou texto adicional.
```

## Instruções para Implementação

- Implementado em: `/services/claude/claude-analysis.service.ts`
- O contexto organizacional é injetado pelo `KnowledgeService.formatContextForClaude()`
- Se `ANTHROPIC_API_KEY` estiver vazio, retornar `MOCK_ANALYSIS` do mesmo arquivo
