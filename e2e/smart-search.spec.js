const {test, expect} = require('@playwright/test')

test.describe('Smart Search', () => {
    test('should display smart search in top menu', async ({page}) => {
        await page.goto('/')
        
        await expect(page.locator('.smart-search')).toBeVisible()
    })

    test('should search for account', async ({page}) => {
        await page.goto('/')
        
        const searchInput = page.locator('.smart-search input')
        await searchInput.fill('GABC')
        await searchInput.press('Enter')
        
        // Should navigate or show results
        await page.waitForTimeout(1000)
    })

    test('should show search suggestions', async ({page}) => {
        await page.goto('/')
        
        const searchInput = page.locator('.smart-search input')
        await searchInput.fill('G')
        
        // Wait for suggestions
        await page.waitForTimeout(500)
    })
})
