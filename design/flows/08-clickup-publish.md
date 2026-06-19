# Fluxo 08 — Publicar no ClickUp

## Objetivo

Configurar e confirmar a publicação das tasks no ClickUp.

## Rota

`/demand/[id]/publish`

## Entrada do Usuário

- Seleção da lista de destino (dropdown)
- Revisão do que será criado
- Botão "Publicar Agora"

## Saída Esperada

- Task principal criada no ClickUp
- Subtasks criadas e vinculadas
- Comentário com contexto adicionado
- Redirect para `/demand/[id]/result`

## Estados da Tela

### Default

- Resumo do que será criado
- Seletor de lista
- Aviso de modo demo se sem token

### Publicando

- Progress: "Criando task principal... ✓"
- "Criando 7 subtasks... 3/7"
- "Adicionando comentário..."

### Erro

- Item que falhou com opção de retry
- Possibilidade de publicar parcialmente

## Componentes

- `PublishSummary` — lista do que será criado
- `ListSelector` — dropdown de listas do ClickUp
- `PublishProgress` — progresso de publicação (futuro)

## Observações de UX

- Modo demo deve ser claramente indicado com aviso amarelo
- Usuário deve poder revisar antes de publicar
- Em caso de erro parcial, indicar o que foi e o que não foi criado
