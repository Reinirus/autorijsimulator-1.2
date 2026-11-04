import {test,expect,type Page} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const ids=['rechts','haaientanden','lichten','fietser','zebra','wegrijden'];
async function choose(page:Page,id:string){await page.goto('/');await page.selectOption('#scenarioSelect',id);await page.getByRole('button',{name:'Start missie',exact:true}).click();await expect(page.locator('.screen')).toHaveAttribute('data-scenario',id);}
for(const id of ids)test(`M3 ${id}: scène, cockpit, NPC en drie spiegels`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await choose(page,id);
 await expect(page.locator('#scenarioInstruction')).not.toBeEmpty();await expect(page.locator('#npcStatus')).not.toBeEmpty();
 for(const mirror of ['leftMirror','centerMirror','rightMirror'])await expect.poll(()=>page.locator('#'+mirror).evaluate((canvas:HTMLCanvasElement)=>{const p=canvas.getContext('2d')!.getImageData(0,0,320,190).data;return new Set(Array.from(p)).size;})).toBeGreaterThan(10);
 if(id==='lichten')await expect(page.locator('#signal')).toHaveText('Verkeerslicht: rood');else await expect(page.locator('#signal')).toHaveText('Geen verkeerslicht');
 await page.keyboard.down('ArrowUp');await expect.poll(async()=>Number(await page.locator('#speed').textContent())).toBeGreaterThan(0);await page.keyboard.up('ArrowUp');
 await page.screenshot({path:`docs/qa-m3-${id}.png`,fullPage:true});await page.getByRole('button',{name:'Stop missie',exact:true}).click();expect(errors).toEqual([]);
});
test('M3 roodlichtpassage toont feiten, bron en alternatief',async({page})=>{
 await choose(page,'lichten');await page.keyboard.down('ArrowUp');await expect(page.locator('.traffic-event[data-code="GIVE_WAY"]')).toHaveCount(1,{timeout:12000});await page.keyboard.up('ArrowUp');
 const event=page.locator('.traffic-event[data-code="GIVE_WAY"]');await event.locator('summary').click();await expect(event).toContainText('licht rood');await expect(event).toContainText('Alternatief:');await expect(event.locator('a')).toHaveAttribute('href',/wetten.overheid.nl/);await expect(event.locator('a')).toContainText('artikel 68');
 await page.screenshot({path:'docs/qa-m3-beoordeling.png',fullPage:true});
});
test('M3 wachten op groen en passeren geeft geen rode-lichtafwijking',async({page})=>{
 test.setTimeout(30000);await choose(page,'lichten');await expect(page.locator('#signal')).toHaveText('Verkeerslicht: groen',{timeout:16000});
 await page.keyboard.down('ArrowUp');await expect(page.locator('.traffic-event[data-code="CLEAR_PASSAGE"]')).toHaveCount(1,{timeout:12000});await page.keyboard.up('ArrowUp');await expect(page.locator('.traffic-event[data-code="GIVE_WAY"]')).toHaveCount(0);
});
test('M3 wegrijden zonder richting geeft observatie; reset met richting geeft die niet',async({page})=>{
 await choose(page,'wegrijden');await page.keyboard.down('ArrowUp');await expect(page.locator('[data-code="INDICATOR"]')).toHaveCount(1);await page.keyboard.up('ArrowUp');
 await page.getByRole('button',{name:'Opnieuw',exact:true}).click();await expect(page.locator('#scenarioSelect')).toHaveValue('wegrijden');await page.getByRole('button',{name:'Richting links',exact:true}).click();await page.getByRole('button',{name:'Start missie',exact:true}).click();
 await page.keyboard.down('ArrowUp');await expect.poll(async()=>Number(await page.locator('#speed').textContent())).toBeGreaterThan(1);await page.keyboard.up('ArrowUp');await expect(page.locator('[data-code="INDICATOR"]')).toHaveCount(0);
});
test('M3 situatie en NPC synchroniseren naar zijvensters en breedbeeld blijft werken',async({page})=>{
 await choose(page,'fietser');await page.getByRole('button',{name:'Open / herstel zijvensters'}).click();await expect.poll(()=>page.context().pages().length).toBe(3);
 const sides=page.context().pages().filter(p=>p!==page);for(const p of sides)await expect(p.locator('#sideDrive')).toHaveAttribute('data-scenario','fietser');
 await page.waitForTimeout(3500);const clocks=await Promise.all([page.locator('.screen').getAttribute('data-clock'),...sides.map(p=>p.locator('#sideDrive').getAttribute('data-clock'))]);const spread=Math.max(...clocks.map(Number))-Math.min(...clocks.map(Number));expect(spread).toBeLessThan(.3);
 writeFileSync('docs/qa-m3-performance.json',JSON.stringify({center:await page.locator('#displayMetrics').textContent(),sides:await Promise.all(sides.map(p=>p.locator('#sideMetrics').textContent())),clockSpreadSeconds:spread},null,2));
 await page.selectOption('#scenarioSelect','zebra');await page.getByRole('button',{name:'Start missie',exact:true}).click();for(const p of sides)await expect(p.locator('#sideDrive')).toHaveAttribute('data-scenario','zebra');
 await page.selectOption('#displayMode','span');await expect.poll(()=>page.context().pages().length).toBe(1);await expect(page.locator('.screen')).toHaveAttribute('data-mode','span');await expect(page.locator('.screen')).toHaveAttribute('data-scenario','zebra');
 await page.screenshot({path:'docs/qa-m3-breedbeeld.png',fullPage:true});
});
