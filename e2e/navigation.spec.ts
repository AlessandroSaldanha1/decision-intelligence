import { test, expect } from '@playwright/test'

test.describe('Global Navigation (AppShell)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('shows the Decision Intelligence brand link', async ({ page }) => {
    const brand = page.getByRole('link', { name: /Decision Intelligence/ })
    await expect(brand).toBeVisible()
  })

  test('navigation contains Dashboard link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible()
  })

  test('navigation contains Nova Demanda link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Nova Demanda' })).toBeVisible()
  })

  test('navigation contains Base de Conhecimento link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Base de Conhecimento' })).toBeVisible()
  })

  test('shows Mock Mode badge in the header', async ({ page }) => {
    await expect(page.getByText('Mock Mode')).toBeVisible()
  })

  test('clicking the brand link navigates to /dashboard', async ({ page }) => {
    await page.goto('/demand/new')
    await page.getByRole('link', { name: /Decision Intelligence/ }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('clicking Base de Conhecimento navigates to /knowledge-sources', async ({ page }) => {
    await page.getByRole('link', { name: 'Base de Conhecimento' }).click()
    await expect(page).toHaveURL('/knowledge-sources')
  })

  test('clicking Nova Demanda navigates to /demand/new', async ({ page }) => {
    await page.getByRole('link', { name: 'Nova Demanda' }).click()
    await expect(page).toHaveURL('/demand/new')
  })

  test('active nav item is highlighted on /dashboard', async ({ page }) => {
    // The active link has bg-violet-600/20 text-violet-300 class
    const dashboardNavLink = page.locator('nav').getByRole('link', { name: 'Dashboard' })
    await expect(dashboardNavLink).toHaveClass(/text-violet-300/)
  })
})
