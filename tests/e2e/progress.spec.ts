import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {QUESTION_BANK} from '../../src/theory/bank';

const panel=(p:Page)=>p.locator('#progressDialog');
const open=(p:Page)=>p.click('#progressOpen');
async function ride(p:Page,id:string){
 await p.selectOption('#missionSelect',id);
 await p.click('#start');
 await p.keyboard.down('w');
 await expect.poll(async()=>Number(await p.locator('#speed').textContent())).toBeGreaterThan(2);
 await p.keyboard.up('w');
 await p.click('#stop');
 await p.click('#missionSave');
}
async function download(p:Page,name:string){
 const pending=p.waitForEvent('download');
 await panel(p).getByRole('button',{name,exact:true}).click();
 const file=await pending;
 expect(await file.failure()).toBeNull();
 return readFile(await file.path());
}
async function clear(p:Page){
 p.once('dialog',d=>d.accept());
 await Promise.all([p.waitForEvent('load'),panel(p).getByRole('button',{name:'Wis resultaten voor de volgende leerling'}).click()]);
 await open(p);
 await expect(panel(p)).toContainText('0 opgeslagen pogingen');
}
for(const actualDownload of [true,false])test(`M5C twee fictieve leerlingen · ${actualDownload?'opgeslagen bestanden':'inhoud van export en import'}`,async({page})=>{
 let p=page;
 test.setTimeout(90000);
 await p.goto('/');
 await ride(p,'1');
 await p.click('#theoryOpen');
 await p.getByRole('button',{name:'Begin oefentoets',exact:true}).click();
 const theory=p.locator('#theoryDialog');
 for(let i=0;i<15;i++){
  const id=await theory.getAttribute('data-question-id');
  const q=QUESTION_BANK.find(item=>item.id===id)!;
  await theory.getByRole('button',{name:(q.correct+1)+'. '+q.options[q.correct],exact:true}).click();
 }
 await theory.getByRole('button',{name:'Sluiten',exact:true}).click();
 await open(p);
 const label='Bewaar mijn oefenbestand (JSON)';
 async function exportFile(name:string){
  if(actualDownload)return download(p,name);
  const contents=await p.evaluate(async label=>{
   const original=URL.createObjectURL;
   let captured:Blob|undefined;
   URL.createObjectURL=blob=>{if(blob instanceof Blob)captured=blob;return original.call(URL,blob);};
   try{
    const button=Array.from(document.querySelectorAll<HTMLButtonElement>('#progressDialog button')).find(b=>b.textContent===label);
    button?.click();
    if(!captured)throw Error('Geen exportinhoud');
    return captured.text();
   }finally{URL.createObjectURL=original;}
  },name);
  return Buffer.from(contents);
 }
 const a=await exportFile(label);
 expect(JSON.parse(a.toString()).theory.answers).toHaveLength(15);
 const csv=await exportFile('Exporteer anoniem docentoverzicht (CSV)');
 expect(csv.toString()).toContain('"Rijmissies";"Missie 1";"0";"1"');
 const context=p.context();
 await p.close();
 p=await context.newPage();
 await p.goto('/');
 await open(p);
 await clear(p);
 await p.keyboard.press('Escape');
 await ride(p,'2');
 await open(p);
 const b=JSON.parse((await exportFile(label)).toString());
 expect(b.missions.map((m:{missionId:number})=>m.missionId)).toEqual([2]);
 const file={name:'fictief-a.json',mimeType:'application/json',buffer:a};
 await p.locator('#exerciseImport').setInputFiles(file);
 await expect(p.locator('#exerciseFileStatus')).toContainText('Wis eerst');
 await clear(p);
 await Promise.all([p.waitForEvent('load'),p.locator('#exerciseImport').setInputFiles(file)]);
 await open(p);
 await panel(p).getByText('Bekijk alle tien missies').click();
 await expect(panel(p).getByText(/Missie 1 · Nog niet afgerond/)).toBeVisible();
 await expect(panel(p).getByText(/Missie 2 · Nog oefenen/)).toBeVisible();
 await expect(panel(p)).toContainText('Verkeersregels: 5 van 5');
 await p.keyboard.press('Escape');
 await ride(p,'3');
 await open(p);
 const continued=JSON.parse((await exportFile(label)).toString());
 expect(continued.missions.map((m:{missionId:number})=>m.missionId)).toEqual([1,3]);
 expect(continued.theory).toEqual(JSON.parse(a.toString()).theory);
});
test('M5C klein scherm, toetsenbord, rijpauze en corrupte JSON',async({page:p})=>{
 await p.setViewportSize({width:375,height:667});
 await p.goto('/');
 await p.click('#start');
 await p.locator('#progressOpen').focus();
 await p.keyboard.press('Space');
 await expect(panel(p)).toBeVisible();
 const clock=await p.locator('.screen').getAttribute('data-clock');
 await p.locator('#exerciseImport').setInputFiles({name:'stuk.json',mimeType:'application/json',buffer:Buffer.from('{stuk')});
 await expect(p.locator('#exerciseFileStatus')).toContainText('Ongeldig oefenbestand');
 expect(await panel(p).evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 expect(await p.locator('.screen').getAttribute('data-clock')).toBe(clock);
 await p.keyboard.press('Escape');
 await p.keyboard.down('w');
 await expect(p.locator('#gas')).toHaveText('aan');
 await p.keyboard.up('w');
 await expect(p.locator('#gas')).toHaveText('uit');
});
test('M5C meldt geblokkeerde opslag bij import',async({page:p})=>{
 await p.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));
 await p.goto('/');
 await open(p);
 await p.locator('#exerciseImport').setInputFiles({name:'leeg.json',mimeType:'application/json',buffer:Buffer.from('{}')});
 await expect(p.locator('#exerciseFileStatus')).toContainText('Lokale opslag is niet beschikbaar');
});
