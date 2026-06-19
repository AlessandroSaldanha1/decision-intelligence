# Fluxo 03 — Nova Demanda

## Objetivo
Receber a descrição da nova demanda do usuário e iniciar o processo de análise.

## Rota
`/demand/new`

## Entrada do Usuário
- Título da demanda (campo texto, obrigatório)
- Descrição detalhada (textarea, obrigatório, mínimo 50 caracteres)
- Seleção de fontes de conhecimento (checkboxes, pelo menos 1)
- Botão "Analisar Demanda"

## Saída Esperada
- Demanda criada com ID
- RAG search executado
- Redirect para `/demand/[id]/insights`

## Estados da Tela

### Default
- Formulário vazio com placeholders descritivos

### Preenchendo
- Contador de caracteres na descrição
- Validação em tempo real

### Analisando
- Botão com spinner "Buscando conhecimento organizacional..."
- Campos bloqueados durante processamento

### Erro
- Mensagem de erro com instrução de retry

## Componentes
- Formulário de nova demanda
- Checkboxes de fontes com contagem de documentos

## Regras de Navegação
- Vem de `/dashboard` ou qualquer tela via header
- Vai para `/demand/[id]/insights` após submissão bem-sucedida

## Validações
- Título: obrigatório, máximo 200 caracteres
- Descrição: obrigatório, mínimo 50 caracteres
- Fontes: pelo menos 1 selecionada

## Observações de UX
- Placeholder da descrição deve orientar o usuário sobre o nível de detalhe esperado
- Mostrar quais fontes têm dados disponíveis
- Loading state deve indicar claramente o que está acontecendo
