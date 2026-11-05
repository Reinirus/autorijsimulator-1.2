import {test,expect} from '@playwright/test';

test('missiemenu toont twee beschikbare missies en acht nog in ontwikkeling',async({page})=>{
 await page.goto('/');
 const select=page.locator('#missionSelect');
 await expect(select).toBeVisible();
 await expect(select.locator('option')).toHaveCount(11);
 await expect(select.locator('option:disabled')).toHaveCount(8);
 await select.selectOption('1');
 await expect(page.locator('#missionScope')).toContainText('Vooruitrijden');
 await expect(page.locator('#missionProgress')).toContainText('Oefendoel nog niet bereikt');
 await select.selectOption('2');
 await expect(page.locator('#missionScope')).toContainText('achteruit naar het parkeervak');
});
