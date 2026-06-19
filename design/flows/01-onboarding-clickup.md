# Fluxo 01 — Onboarding / Conectar ClickUp

## Objetivo
Primeiro contato do usuário com o produto. Conectar o ClickUp para habilitar o acesso ao workspace.

## Rota
`/onboarding`

## Entrada do Usuário
- ClickUp API Token (campo de texto, tipo password)
- Botão "Conectar e Continuar" (valida token)
- Botão "Continuar no modo demo" (pula conexão, usa mocks)

## Saída Esperada
- Token válido → redirecionar para `/workspace`
- Token inválido → exibir mensagem de erro inline
- Modo demo → redirecionar para `/workspace` com flag mock

## Estados da Tela

### Default
- Formulário com campo de token vazio
- Botão de conectar habilitado

### Loading
- Botão com spinner e texto "Conectando..."
- Campo desabilitado

### Erro
- Mensagem de erro em vermelho abaixo do campo
- "Token inválido. Verifique e tente novamente."

### Sucesso
- Animação de sucesso breve
- Redirect automático para /workspace

## Componentes
- `OnboardingForm` — formulário de conexão
- Instrução com link para onde encontrar o token

## Regras de Navegação
- Acesso via `/` (redirect automático)
- Se já conectado, redirecionar para `/dashboard`

## Observações de UX
- Campo de token deve ser type="password" para não expor o valor
- Link de ajuda deve abrir em nova aba
- Modo demo deve ser visualmente menos proeminente que o botão principal
- Explicar brevemente o que o produto faz antes do form
