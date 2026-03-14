import { test, expect } from '@playwright/test'

test.describe('OllamaPlay', () => {
  test('renders header with brand and nav tabs', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('ollamaplay')).toBeVisible()
    await expect(page.getByRole('button', { name: 'chat', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'playground', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'models', exact: true })).toBeVisible()
  })

  test('navigates to Models view and shows hardware banner', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'models', exact: true }).click()
    // Hardware banner should appear (may show "Detecting..." initially)
    await expect(page.getByText('GPU', { exact: true })).toBeVisible()
    await expect(page.getByText('RAM', { exact: true })).toBeVisible()
  })

  test('theme toggle switches between dark and light', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
    await page.getByRole('button', { name: /toggle theme/i }).click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('chat view shows empty state when no model selected', async ({ page }) => {
    await page.goto('/')
    // If no models installed, empty state should show
    const emptyState = page.getByText(/no model selected/i)
    const chatPlaceholder = page.getByPlaceholder(/message/i)
    // Either we see the empty state or the chat input — both are valid
    await expect(emptyState.or(chatPlaceholder)).toBeVisible()
  })
})
