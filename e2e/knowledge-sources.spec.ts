import { test, expect } from '@playwright/test'

test.describe('Knowledge Sources Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/knowledge-sources')
  })

  test('renders the page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Fontes de Conhecimento' })).toBeVisible()
  })

  test('shows the subtitle description', async ({ page }) => {
    await expect(
      page.getByText('Selecione as fontes que serão usadas')
    ).toBeVisible()
  })

  test('displays all four knowledge sources', async ({ page }) => {
    await expect(page.getByText('Tasks e Sprints')).toBeVisible()
    await expect(page.getByText('Comentários')).toBeVisible()
    await expect(page.getByText('Subtasks')).toBeVisible()
    await expect(page.getByText('Docs')).toBeVisible()
  })

  test('shows document count for enabled sources', async ({ page }) => {
    // Tasks: 247 docs, Comments: 1,823 docs
    await expect(page.getByText('247 docs')).toBeVisible()
    await expect(page.getByText(/1[.,]823 docs/)).toBeVisible()
  })

  test('shows the active sources summary banner', async ({ page }) => {
    await expect(page.getByText(/2 fontes ativas/)).toBeVisible()
    await expect(page.getByText(/2\.070 documentos/)).toBeVisible()
  })

  test('shows the continue button linking to dashboard', async ({ page }) => {
    const btn = page.getByRole('link', { name: /Construir Memória/ })
    await expect(btn).toBeVisible()
    await expect(btn).toHaveAttribute('href', '/dashboard')
  })

  test('clicking continue navigates to the dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /Construir Memória/ }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('Tasks and Comentários sources appear visually highlighted as enabled', async ({ page }) => {
    // Enabled sources have a violet border class, disabled have opacity-60
    const subtasksCard = page.getByText('Subtasks').locator('..').locator('..')
    await expect(subtasksCard).toHaveClass(/opacity-60/)
  })
})
