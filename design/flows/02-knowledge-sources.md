# Fluxo 02 — Fontes de Conhecimento

## Objetivo

Permitir que o usuário configure quais fontes do ClickUp serão indexadas para construir a memória organizacional.

## Rota

`/knowledge-sources`

## Entrada do Usuário

- Toggle em cada fonte (Tasks, Comentários, Subtasks, Docs)
- Botão "Construir Memória e Continuar"

## Saída Esperada

- Fontes selecionadas salvas na sessão
- Indexação iniciada (ou mock confirmado)
- Redirect para `/dashboard`

## Estados da Tela

### Default

- Lista de fontes disponíveis com toggles
- Fontes com dados mostram contagem de documentos
- Fontes sem dados (Subtasks, Docs) aparecem desabilitadas/acinzentadas

### Loading/Indexando

- Progress indicator por fonte
- "Indexando Tasks... 247/247"
- Pode ser assíncrono — usuário pode continuar

### Pronto

- Confirmar: "2.070 documentos indexados"
- Botão habilitado para continuar

## Componentes

- `KnowledgeSourceCard` — card de cada fonte com toggle e metadados
- `IndexingProgress` — progresso de indexação (futuro)

## Regras de Navegação

- Vem de `/workspace`
- Vai para `/dashboard`

## Observações de UX

- Fontes sem dados devem ser claramente indicadas como "não disponível ainda"
- Explicar brevemente o que cada fonte indexa
- Mostrar quando foi a última indexação
