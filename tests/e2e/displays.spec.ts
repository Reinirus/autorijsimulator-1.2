import {test,expect,type Page} from '@playwright/test';
import {writeFileSync} from 'node:fs';
async function openSides(page:Page){await page.getByRole('button',{name:'Open / herstel zijvensters'}).click();await expect.poll(()=>page.context().pages().length).toBe(3);const sides=page.context().pages().filter(p=>p!==page);for(const p of sides)await expect(p.locator('#connection')).toHaveText('Verbonden met middenvenster');return sides;}

test('breed beeld, kalibratie en terugval behouden de bestaande missie',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start missie'}).click();await page.selectOption('#displayMode','span');
 await expect(page.locator('.screen')).toHaveAttribute('data-mode','span');
 await page.locator('summary').click();await page.locator('#leftAngle').fill('70');await page.locator('#leftAngle').dispatchEvent('change');
 await page.locator('#horizon').fill('8');await page.locator('#horizon').dispatchEvent('change');await page.locator('#guides').check();await page.selectOption('#layout','center');
 await expect(page.locator('body')).toHaveClass(/calibration-on/);await expect(page.locator('body')).toHaveAttribute('data-layout','center');
 await page.screenshot({path:'docs/qa-m2-span.png',fullPage:true});
 await page.getByRole('button',{name:'Terug naar één scherm'}).click();await expect(page.locator('.screen')).toHaveAttribute('data-mode','single');
 await expect(page.getByRole('button',{name:'Stop missie'})).toBeEnabled();await expect(page.locator('#leftMirror')).toBeVisible();
});

test('drie vensters delen klok, kalibratie en bron; zijvenster kan herladen',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start missie'}).click();const sides=await openSides(page);
 await page.bringToFront();await page.keyboard.down('ArrowUp');await page.waitForTimeout(700);await page.keyboard.up('ArrowUp');
 await expect(page.locator('#gas')).toHaveText('uit');
 const clocks=await Promise.all([page.locator('.screen').getAttribute('data-clock'),...sides.map(p=>p.locator('#sideDrive').getAttribute('data-clock'))]);expect(Math.max(...clocks.map(Number))-Math.min(...clocks.map(Number))).toBeLessThan(.3);
 for(const p of sides){await p.keyboard.down('ArrowUp');await p.keyboard.up('ArrowUp');}await expect(page.locator('#gas')).toHaveText('uit');
 await page.locator('summary').click();await page.locator('#guides').check();for(const p of sides)await expect(p.locator('body')).toHaveClass(/calibration-on/);
 await sides[0].reload();await expect(sides[0].locator('#connection')).toHaveText('Verbonden met middenvenster');
 await expect.poll(async()=>Number(await sides[0].locator('#sideDrive').getAttribute('data-clock'))).toBeGreaterThan(1);
 await sides[0].screenshot({path:'docs/qa-m2-side.png'});
 await sides[0].close();await expect(page.locator('.screen')).toHaveAttribute('data-mode','single');
 await expect.poll(()=>page.context().pages().length).toBe(1);
});

test('bronverlies en herstart herstellen zonder tweede simulatie',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start missie'}).click();const sides=await openSides(page);
 let resume!:()=>void;const blocked=new Promise<void>(resolve=>resume=resolve);
 await page.route('**/src/main.ts',async route=>{await blocked;await route.continue();},{times:1});
 const reload=page.reload();for(const p of sides)await expect(p.locator('#lostConnection')).toBeVisible();
 resume();await reload;await expect(page.getByRole('button',{name:'Start missie'})).toBeEnabled();
 for(const p of sides){await expect(p.locator('#lostConnection')).toBeHidden();await expect.poll(async()=>Number(await p.locator('#sideDrive').getAttribute('data-clock'))).toBe(0);}
 await page.getByRole('button',{name:'Start missie'}).click();for(const p of sides)await expect.poll(async()=>Number(await p.locator('#sideDrive').getAttribute('data-clock'))).toBeGreaterThan(.2);
 await page.getByRole('button',{name:'Terug naar één scherm'}).click();await expect.poll(()=>page.context().pages().length).toBe(1);
});

test('geblokkeerde pop-ups vallen terug naar één scherm',async({page})=>{
 await page.addInitScript(()=>{window.open=()=>null;});await page.goto('/');await page.getByRole('button',{name:'Open / herstel zijvensters'}).click();await expect(page.locator('#displayStatus')).toContainText('geblokkeerd');await expect(page.locator('.screen')).toHaveAttribute('data-mode','single');
});

test('korte prestatiemeting in alle drie modi',async({page})=>{
 test.setTimeout(60000);await page.goto('/');await page.getByRole('button',{name:'Start missie'}).click();
 const results:Record<string,unknown>={};
 for(const mode of ['single','span','windows']){
  const sides=mode==='windows'?await openSides(page):[];if(mode!=='windows')await page.selectOption('#displayMode',mode);
  await page.waitForTimeout(3500);const clocks=await Promise.all([page.locator('.screen').getAttribute('data-clock'),...sides.map(p=>p.locator('#sideDrive').getAttribute('data-clock'))]);results[mode]={clockSpreadSeconds:Math.max(...clocks.map(Number))-Math.min(...clocks.map(Number)),center:await page.locator('#displayMetrics').textContent(),sides:await Promise.all(sides.map(p=>p.locator('#sideMetrics').textContent()))};
 }
 writeFileSync('docs/qa-m2-performance.json',JSON.stringify({environment:'Windows headless Chromium, korte steekproef, geen hardwarebenchmark',results},null,2));
 console.log('M2_METRICS '+JSON.stringify(results));await page.getByRole('button',{name:'Terug naar één scherm'}).click();
});

test('tijdelijk pakketverlies bevriest het zijbeeld en herstelt automatisch',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start missie'}).click();const sides=await openSides(page);const side=sides[0];
 await side.addInitScript(`const NativeChannel=window.BroadcastChannel;window.__dropFrames=false;window.BroadcastChannel=class extends NativeChannel {set onmessage(handler){super.onmessage=event=>{if(!window.__dropFrames)handler(event);};}};`);
 await side.reload();await expect(side.locator('#connection')).toHaveText('Verbonden met middenvenster');
 await side.evaluate('window.__dropFrames=true');await expect(side.locator('#lostConnection')).toBeVisible({timeout:5000});
 const frozen=await side.locator('#sideDrive').getAttribute('data-clock');await page.waitForTimeout(400);await expect(side.locator('#sideDrive')).toHaveAttribute('data-clock',frozen!);
 await side.evaluate('window.__dropFrames=false');await expect(side.locator('#lostConnection')).toBeHidden();
 await expect.poll(async()=>Number(await side.locator('#sideDrive').getAttribute('data-clock'))).toBeGreaterThan(Number(frozen));
 await page.getByRole('button',{name:'Terug naar één scherm'}).click();
});

test('ontbrekende scherm-API houdt handmatige plaatsing beschikbaar',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'getScreenDetails',{value:undefined,configurable:true});});
 await page.goto('/');await openSides(page);await page.getByRole('button',{name:'Verdeel over gedetecteerde schermen'}).click();
 await expect(page.locator('#displayStatus')).toContainText('Sleep de vensters handmatig');
 await page.getByRole('button',{name:'Terug naar één scherm'}).click();
});

test('kalibratievelden gebruiken pijltjestoetsen zonder de auto te bedienen',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start missie'}).click();await page.locator('summary').click();await page.locator('#fov').focus();await page.keyboard.press('ArrowUp');
 await expect(page.locator('#fov')).toHaveValue('73');await expect(page.locator('#gas')).toHaveText('uit');await expect(page.locator('#speed')).toHaveText('0');
});
