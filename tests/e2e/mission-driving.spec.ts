import {test,expect} from '@playwright/test';
import {ROUTES} from '../../src/missions/route';
for(const id of [1,2])test('M4 missie '+id+': volledige browserrit via toetsenbordevenementen, bewaren, export en herstart',async({page})=>{
 test.setTimeout(180000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.selectOption('#missionSelect',String(id));await page.locator('#missionSelect').blur();await page.click('#start');
 // Read-only telemetry; no state mutation or clock acceleration. Drive actual
 // browser keyboard handlers every frame, avoiding remote key-hold jitter.
 const outcome=await page.evaluate(async({points,id})=>new Promise<{completed:boolean;clock:number;vehicle:unknown}>(resolve=>{
  const held=new Set<string>();let lastIndex=-1;const started=performance.now();
  const key=(name:string,on:boolean)=>{if(on===held.has(name))return;window.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{key:name,bubbles:true}));if(on)held.add(name);else held.delete(name);};
  const frame=()=>{const screen=document.querySelector<HTMLElement>('.screen')!,v=JSON.parse(screen.dataset.vehicle!),m=JSON.parse(screen.dataset.mission!),clock=Number(screen.dataset.clock);if(m.completed||performance.now()-started>145000){for(const name of held)window.dispatchEvent(new KeyboardEvent('keyup',{key:name,bubbles:true}));resolve({completed:m.completed,clock,vehicle:v});return;}
   const g=points[m.index];if(id===2&&m.index!==lastIndex){lastIndex=m.index;document.querySelector<HTMLButtonElement>(m.index<1?'#indicatorLeft':'#indicatorRight')!.click();}
   const gear=document.querySelector<HTMLSelectElement>('#missionGear')!;if(g.reverse&&gear.value!=='R'){for(const name of [...held])key(name,false);gear.value='R';gear.dispatchEvent(new Event('change',{bubbles:true}));}
   const distance=Math.hypot(g.x-v.x,g.z-v.z),reverse=Boolean(g.reverse),alpha=Math.atan2(Math.sin(Math.atan2(g.x-v.x,-(g.z-v.z))-v.heading-(reverse?Math.PI:0)),Math.cos(Math.atan2(g.x-v.x,-(g.z-v.z))-v.heading-(reverse?Math.PI:0))),steer=(reverse?-1:1)*Math.atan2(5*Math.sin(alpha),Math.max(1,distance));const desired=id===2&&clock<8?0:g.stop?Math.min(2,Math.sqrt(Math.max(0,distance-.4)*1.5)):2;
   key('ArrowUp',Math.abs(v.speed)<desired-.08);key('ArrowDown',Math.abs(v.speed)>desired+.08);key('ArrowLeft',steer<v.steering-.02);key('ArrowRight',steer>v.steering+.02);requestAnimationFrame(frame);
  };requestAnimationFrame(frame);
 }),{points:ROUTES[id].points,id});
 expect(outcome).toMatchObject({completed:true});await expect(page.locator('#missionProgress')).toContainText('Oefendoel bereikt');await expect(page.locator('#speed')).toHaveText('0');await page.screenshot({path:'docs/qa-m4-missie-'+id+'.png',fullPage:true});await page.click('#missionSave');const report=await page.evaluate(()=>JSON.parse(localStorage.getItem('nederlandse-autorijsimulator-m4-anoniem-v1')!));expect(report.at(-1).completed).toBe(true);expect(report.at(-1).missionId).toBe(id);const download=page.waitForEvent('download');await page.click('#missionJson');expect((await download).suggestedFilename()).toBe('rijmissies-anoniem.json');await page.click('#reset');await expect(page.locator('#missionProgress')).toContainText('Oefendoel nog niet bereikt');await expect(page.locator('#clock')).toHaveText('0:00');expect(errors).toEqual([]);
});
