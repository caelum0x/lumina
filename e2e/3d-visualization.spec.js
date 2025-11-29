const {test, expect} = require('@playwright/test')

test.describe('3D Visualization', () => {
    test('should load 3D galaxy view', async ({page}) => {
        await page.goto('/graph/3d/public')
        
        // Wait for canvas to load
        await expect(page.locator('canvas')).toBeVisible({timeout: 10000})
        
        // Check overlay is present
        await expect(page.locator('.three-galaxy-overlay')).toBeVisible()
        
        // Check stats panel
        await expect(page.locator('.overlay-stats')).toBeVisible()
        await expect(page.locator('.stat-label:has-text("Transactions")')).toBeVisible()
    })

    test('should show connection status', async ({page}) => {
        await page.goto('/graph/3d/public')
        
        // Wait for connection
        await expect(page.locator('.connection-status')).toBeVisible()
        
        // Should eventually connect
        await expect(page.locator('.connection-status:has-text("Connected")')).toBeVisible({timeout: 15000})
    })

    test('should toggle controls', async ({page}) => {
        await page.goto('/graph/3d/public')
        
        // Toggle whale leaderboard
        await page.click('button:has-text("Hide Whales")')
        await expect(page.locator('.overlay-whales')).not.toBeVisible()
        
        await page.click('button:has-text("Show Whales")')
        await expect(page.locator('.overlay-whales')).toBeVisible()
    })

    test('should toggle filters', async ({page}) => {
        await page.goto('/graph/3d/public')
        
        await page.click('button:has-text("Filters")')
        await expect(page.locator('.overlay-filters')).toBeVisible()
        
        // Check filter checkboxes
        await expect(page.locator('input[type="checkbox"]').first()).toBeChecked()
    })

    test('should toggle AI insights', async ({page}) => {
        await page.goto('/graph/3d/public')
        
        await page.click('button:has-text("AI")')
        await expect(page.locator('.overlay-ai-insights')).toBeVisible()
    })

    test('should switch to topology view', async ({page}) => {
        await page.goto('/graph/3d/public')
        
        await page.click('button:has-text("Topology")')
        await expect(page.locator('button:has-text("Galaxy")')).toBeVisible()
    })

    test('should clear transactions', async ({page}) => {
        await page.goto('/graph/3d/public')
        
        // Wait for some transactions
        await page.waitForTimeout(3000)
        
        await page.click('button:has-text("Clear")')
        
        // Stats should reset
        const txCount = await page.locator('.stat-label:has-text("Transactions") + .stat-value').textContent()
        expect(txCount).toBe('0')
    })
})
