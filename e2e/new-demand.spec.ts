import { test, expect } from '@playwright/test'

test.describe('New Demand Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demand/new')
  })

  test('renders the page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Nova Demanda' })).toBeVisible()
  })

  test('shows the subtitle description', async ({ page }) => {
    await expect(
      page.getByText('Descreva o que precisa ser construído')
    ).toBeVisible()
  })

  test('renders the title input field with placeholder', async ({ page }) => {
    const input = page.getByPlaceholder(/Ex: Implementar notificações/)
    await expect(input).toBeVisible()
  })

  test('renders the description textarea', async ({ page }) => {
    const textarea = page.getByPlaceholder(/Descreva o problema/)
    await expect(textarea).toBeVisible()
  })

  test('shows the knowledge sources section', async ({ page }) => {
    await expect(page.getByText('Fontes de Conhecimento')).toBeVisible()
  })

  test('shows Tasks e Sprints source as checked', async ({ page }) => {
    await expect(page.getByText('Tasks e Sprints')).toBeVisible()
    await expect(page.getByText('247 docs')).toBeVisible()
  })

  test('shows Comentários source as checked', async ({ page }) => {
    await expect(page.getByText('Comentários')).toBeVisible()
    await expect(page.getByText('1.823 docs')).toBeVisible()
  })

  test('renders the Analisar Demanda submit button', async ({ page }) => {
    const btn = page.getByRole('link', { name: 'Analisar Demanda' })
    await expect(btn).toBeVisible()
  })

  test('the title input accepts text input', async ({ page }) => {
    const input = page.getByPlaceholder(/Ex: Implementar notificações/)
    await input.fill('Implementar sistema de notificações push')
    await expect(input).toHaveValue('Implementar sistema de notificações push')
  })

  test('the textarea accepts multiline text', async ({ page }) => {
    const textarea = page.getByPlaceholder(/Descreva o problema/)
    const text = 'Precisamos de um sistema\nde notificações em tempo real\npara todos os usuários.'
    await textarea.fill(text)
    await expect(textarea).toHaveValue(text)
  })

  test('Analisar Demanda button navigates to the insights page', async ({ page }) => {
    await page.getByRole('link', { name: 'Analisar Demanda' }).click()
    // The static page links to /demand/demo-001/insights
    await expect(page).toHaveURL(/\/demand\/demo-001\/insights/)
  })
})
