# Screens — Decision Intelligence

Esta pasta contém especificações visuais detalhadas de telas individuais.

## Convenção de Nomenclatura

`[numero]-[nome-da-tela].md`

Exemplo: `01-onboarding.md`, `05-analysis-page.md`

## O que incluir em cada especificação

```markdown
# Nome da Tela

## Layout

- Largura máxima
- Estrutura geral (header/main/footer)
- Grid/flex utilizado

## Componentes Principais

- Lista de componentes na tela com props esperadas

## Cores e Tokens

- Qualquer desvio do padrão global

## Estados

- Screenshots ou descrição textual de cada estado

## Notas de Acessibilidade

- Labels ARIA necessários
- Ordem de tab
```

## Design Tokens Globais

```css
/* Backgrounds */
bg-gray-950  /* page background */
bg-gray-900  /* card/panel */
bg-gray-800  /* input/elevated */

/* Borders */
border-white/10  /* default */
border-violet-500/50  /* hover/active */

/* Text */
text-white     /* headings */
text-gray-300  /* body */
text-gray-400  /* secondary */
text-gray-500  /* placeholder/hint */

/* Primary */
bg-violet-600  /* CTA button */
text-violet-400  /* accent/link */

/* Status */
text-green-400 bg-green-400/10   /* success */
text-blue-400 bg-blue-400/10     /* info/progress */
text-yellow-400 bg-yellow-400/10 /* warning */
text-red-400 bg-red-400/10       /* error/critical */
text-orange-400 bg-orange-400/10 /* high priority */
```
