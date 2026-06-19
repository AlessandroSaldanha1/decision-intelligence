# Design — Decision Intelligence

## Como usar esta pasta

Esta pasta contém a especificação visual e de fluxo de cada tela do produto.

**Regra importante:** Antes de implementar ou alterar qualquer tela, leia o arquivo correspondente em `/design/flows/` e `/design/screens/`.

## Estrutura

```
/design
  /flows/          # Especificação de cada fluxo
  /screens/        # Especificação visual de telas específicas
  README.md        # Este arquivo
```

## Como Claude Code deve usar estes arquivos

Quando receber uma instrução do tipo "implemente a tela X":

1. Ler `/design/flows/` — entender o fluxo completo
2. Ler `/design/screens/` — verificar especificação visual
3. Ler `/docs/business-rules.md` — verificar regras de negócio
4. Ler `/ai/context/` — verificar contratos de output do Claude
5. Somente então implementar

## Como especificar uma nova tela

Criar arquivo em `/design/screens/nome-da-tela.md` com:

```markdown
# Nome da Tela

## Objetivo

O que o usuário precisa fazer nesta tela.

## Entrada do Usuário

Quais ações o usuário pode executar.

## Saída Esperada

O que acontece após a interação.

## Estados da Tela

- Loading
- Vazio
- Com dados
- Erro

## Componentes

Lista de componentes necessários.

## Navegação

Para onde o usuário vai após as ações.

## Observações de UX
```

## Consistência Visual

- Background: `bg-gray-950`
- Cards/Panels: `bg-gray-900` com `border-white/10`
- Cor primária: `violet-600` (botões, destaques)
- Textos: `text-white` (títulos), `text-gray-300` (corpo), `text-gray-400/500` (secundário)
- Status: green (publicado), blue (em processo), yellow (rascunho), red (erro)
- Fonte: Geist Sans (variável CSS `--font-geist-sans`)
