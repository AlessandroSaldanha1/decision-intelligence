# Fluxo 06 — Artefatos

## Objetivo

Exibir os artefatos de produto e engenharia gerados pelo Claude.

## Rota

`/demand/[id]/artifacts`

## Artefatos Gerados

1. **User Story** (Como / Eu quero / Para que + Critérios de Aceite)
2. **Cenários BDD** (Given/When/Then com tags)
3. **Casos de Teste** (ID, tipo, prioridade, passos, resultado esperado)
4. **Definition of Done** (técnico, qualidade, documentação, deploy)
5. **Dependências** (lista de dependências identificadas)

## Estados da Tela

### Loading

- "Gerando artefatos com Claude..."
- Skeleton por seção de artefato

### Com Artefatos

- Tabs ou seções para cada artefato
- Cada artefato com opção de copiar (futuro)

### Erro

- Erro claro por artefato que falhou

## Estrutura Visual

```
[Contadores: X BDD, Y Test Cases, Z DoD items]

[User Story — card principal]
  Como [persona]
  eu quero [ação]
  para que [benefício]

  Critérios de Aceite:
  ✓ Critério 1
  ✓ Critério 2

[Definition of Done — por categoria]
  Técnico | Qualidade | Docs | Deploy

[CTA: Gerar Plano de Entrega]
```

## Observações de UX

- User Story é o artefato principal e mais visível
- DoD deve ser exibida como checklist
- Artefatos devem ser facilmente copiáveis (botão de cópia)
- Indicar que BDD e casos de teste estão disponíveis mesmo se não exibidos inline
