import {test,expect} from '@playwright/test';

test('bediening, loslaten, focusverlies en vraagpauze',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.getByRole('button',{name:'Start missie'}).click();
 await page.keyboard.down('w');await expect(page.locator('#gas')).toHaveText('aan');
 await expect.poll(async()=>Number(await page.locator('#speed').textContent())).toBeGreaterThan(0);
 await page.keyboard.up('w');await expect(page.locator('#gas')).toHaveText('uit');
 await page.keyboard.down('a');await expect(page.locator('#wheel')).toHaveText('↶');
 await page.keyboard.up('a');await expect(page.locator('#wheel')).toHaveText('◯');
 await page.keyboard.down('d');await expect(page.locator('#wheel')).toHaveText('↷');
 await page.keyboard.up('d');await expect(page.locator('#wheel')).toHaveText('◯');
 await page.keyboard.down('w');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 await expect(page.locator('#gas')).toHaveText('uit');await page.keyboard.up('w');
 await page.keyboard.down(' ');await expect(page.locator('#brake')).toHaveText('aan');
 await expect(page.locator('#speed')).toHaveText('0');await page.keyboard.up(' ');
 await expect(page.locator('#brake')).toHaveText('uit');
 await page.getByRole('button',{name:'Inzichtvraag'}).click();
 const clock=await page.locator('#clock').textContent();await page.waitForTimeout(1100);
 await expect(page.locator('#clock')).toHaveText(clock!);await page.getByRole('button',{name:'Sluiten',exact:true}).click();
 await page.getByRole('button',{name:'Stop missie'}).click();expect(errors).toEqual([]);
});

test('zichtbare cockpit en drie levende spiegelbeelden',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start missie'}).click();
 await expect(page.locator('#status')).toContainText('Missie gestart');
 for(const id of ['leftMirror','centerMirror','rightMirror']){
  await expect.poll(()=>page.locator('#'+id).evaluate((c:HTMLCanvasElement)=>{
   const p=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;return new Set(Array.from(p)).size;
  })).toBeGreaterThan(10);
 }
 const before=await page.locator('#centerMirror').evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(1200);await page.keyboard.up('ArrowUp');
 await expect.poll(()=>page.locator('#centerMirror').evaluate((c:HTMLCanvasElement)=>c.toDataURL())).not.toBe(before);
 await page.screenshot({path:'docs/qa-cockpit.png',fullPage:true});
});

test('verkeerslicht toont rood, groen, oranje en opnieuw rood',async({page})=>{
 test.setTimeout(45000);await page.goto('/');await page.getByRole('button',{name:'Start missie'}).click();
 await expect(page.locator('#signal')).toHaveText('Verkeerslicht: rood');
 await expect(page.locator('#signal')).toHaveText('Verkeerslicht: groen',{timeout:20000});
 await expect(page.locator('#signal')).toHaveText('Verkeerslicht: oranje',{timeout:20000});
 await expect(page.locator('#signal')).toHaveText('Verkeerslicht: rood',{timeout:10000});
});

test('echte rendercamera’s zien achterobjecten aan de juiste zijde, ook na sturen',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async()=>{
  // @ts-expect-error Browser imports are resolved by Vite.
  const THREE=await import('/node_modules/three/build/three.module.js');
  // @ts-expect-error Browser imports are resolved by Vite.
  const {DrivingView}=await import('/src/renderer/scene.ts');
  // @ts-expect-error Browser imports are resolved by Vite.
  const {initialState}=await import('/src/core/state.ts');
  const canvas=document.createElement('canvas');canvas.style.cssText='width:640px;height:400px';document.body.append(canvas);
  const view=new DrivingView(canvas);const state=initialState();state.vehicle={x:0,z:0,heading:0,speed:0,steering:0};
  view.scene.clear();view.scene.background=new THREE.Color('black');
  const mirrors=Object.fromEntries(['links','rechts','binnen'].map(n=>[n,document.createElement('canvas')]));
  for(const c of Object.values(mirrors)){c.width=320;c.height=190;}
  const positions=[[-4,1.45,10,'red'],[0,1.45,10,'lime'],[4,1.45,10,'blue']];
  const cubes=positions.map(([x,y,z,color])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color}));m.position.set(x,y,z);view.scene.add(m);return m;});
  const sample=()=>Object.fromEntries(Object.entries(mirrors).map(([n,c])=>{
   const d=c.getContext('2d')!.getImageData(0,0,320,190).data;const xs:number[][]=[[],[],[]];
   for(let y=0;y<190;y++)for(let x=0;x<320;x++){const i=(y*320+x)*4;for(let k=0;k<3;k++)if(d[i+k]>200&&d[i+(k+1)%3]<30&&d[i+(k+2)%3]<30)xs[k].push(x);}
   return [n,xs.map(a=>({count:a.length,x:a.reduce((s,x)=>s+x,0)/a.length}))];
  }));
  view.render(state,mirrors);const straight=sample();
  state.vehicle.heading=Math.PI/2;
  for(const c of cubes){const x=c.position.x,z=c.position.z;c.position.set(-z,1.45,x);}
  view.render(state,mirrors);const turned=sample();view.dispose();canvas.remove();return {straight,turned};
 });
 for(const images of [results.straight,results.turned]){
  expect(images.links[0].count).toBeGreaterThan(100);expect(images.rechts[2].count).toBeGreaterThan(100);
  expect(images.binnen[1].count).toBeGreaterThan(100);
  expect(images.binnen[0].x).toBeLessThan(images.binnen[1].x);
  expect(images.binnen[1].x).toBeLessThan(images.binnen[2].x);
 }
});
