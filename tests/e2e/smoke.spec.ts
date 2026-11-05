import {test,expect} from '@playwright/test';
test('start, missie en stop',async({page})=>{
 await page.goto('./');await expect(page.getByText('DEMO — NIET CBR-GECERTIFICEERD')).toBeVisible();
 await page.getByRole('button',{name:'Start missie'}).click();
 await expect(page.getByRole('button',{name:'Stop missie'})).toBeEnabled();
 await expect(page.getByText('Missie gestart.')).toBeVisible();
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(700);await page.keyboard.up('ArrowUp');
 await expect(page.locator('#speed')).not.toHaveText('0');
 await page.getByRole('button',{name:'Stop missie'}).click();await expect(page.getByText('Missie gestopt.')).toBeVisible();
 await page.getByRole('button',{name:'Inzichtvraag'}).click();await expect(page.getByText('NIET JURIDISCH GEVALIDEERD')).toBeVisible();
});
