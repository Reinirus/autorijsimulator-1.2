import {test,expect} from '@playwright/test';
test('productie-subpad laadt cockpit, dynamische modules en beide zijvensters',async({page})=>{
 const errors:string[]=[];
 page.context().on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(String(r.status())+' '+r.url());});});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(String(r.status())+' '+r.url());});
 await page.goto('./');await page.getByRole('button',{name:'Start missie'}).click();
 await page.keyboard.down('ArrowUp');await expect.poll(async()=>Number(await page.locator('#speed').textContent())).toBeGreaterThan(0);await page.keyboard.up('ArrowUp');
 await page.getByRole('button',{name:'Open / herstel zijvensters'}).click();await expect.poll(()=>page.context().pages().length).toBe(3);
 for(const p of page.context().pages().filter(p=>p!==page)){expect(new URL(p.url()).pathname).toBe(new URL(page.url()).pathname);expect(new URL(p.url()).searchParams.has('display')).toBe(true);await expect(p.locator('#connection')).toHaveText('Verbonden met middenvenster');}
 await page.screenshot({path:'docs/qa-pages-build.png',fullPage:true});await page.getByRole('button',{name:'Terug naar één scherm'}).click();await expect.poll(()=>page.context().pages().length).toBe(1);expect(errors).toEqual([]);
});
