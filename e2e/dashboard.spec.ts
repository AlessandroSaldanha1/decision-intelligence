import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('renders the page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('shows the workspace name', async ({ page }) => {
    await expect(page.getByText('Produto Digital')).toBeVisible()
  })

  test('displays the three KPI stat cards', async ({ page }) => {
    await expect(page.getByText('Demandas Processadas')).toBeVisible()
    await expect(page.getByText('Documentos Indexados')).toBeVisible()
    await expect(page.getByText('Tasks Criadas no ClickUp')).toBeVisible()
  })

  test('shows the "Nova Demanda" button linking to /demand/new', async ({ page }) => {
    const btn = page.getByRole('link', { name: '+ Nova Demanda' })
    await expect(btn).toBeVisible()
    await expect(btn).toHaveAttribute('href', '/demand/new')
  })

  test('shows the recent demands section heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Demandas Recentes' })).toBeVisible()
  })

  test('lists at least one recent demand', async ({ page }) => {
    // The mock data has 3 hardcoded demands
    await expect(page.getByText('Implementar autenticação OAuth')).toBeVisible()
    await expect(page.getByText('Refatorar módulo de pagamentos')).toBeVisible()
    await expect(page.getByText('Dashboard de métricas em tempo real')).toBeVisible()
  })

  test('shows status badges for each demand', async ({ page }) => {
    await expect(page.getByText('Publicado')).toBeVisible()
    await expect(page.getByText('Analisando')).toBeVisible()
    await expect(page.getByText('Rascunho')).toBeVisible()
  })

  test('shows risk score for demands that have one', async ({ page }) => {
    // demand-001 has riskScore 42, demand-002 has 78
    await expect(page.getByText('Risco 42%')).toBeVisible()
    await expect(page.getByText('Risco 78%')).toBeVisible()
  })

  test('demand cards are clickable links', async ({ page }) => {
    const demandLink = page.getByRole('link', { name: /Implementar autenticação OAuth/ })
    await expect(demandLink).toBeVisible()
    await expect(demandLink).toHaveAttribute('href', /\/demand\/demand-001\//)
  })

  test('clicking Nova Demanda navigates to the new demand form', async ({ page }) => {
    await page.getByRole('link', { name: '+ Nova Demanda' }).click()
    await expect(page).toHaveURL('/demand/new')
  })
})
