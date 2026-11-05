import type {WorldState} from '../core/state';
import {DEFAULT_CALIBRATION,calibrate,FrameMetrics,type Calibration,type DisplayMode,type Side} from './config';
import {SnapshotBuffer,type Snapshot} from './sync';
type Peer={seq:number;clock:number;seen:number;age:number;fps:number};
export class DisplayController {
 mode:DisplayMode='single';calibration:Calibration={...DEFAULT_CALIBRATION};readonly buffer=new SnapshotBuffer();readonly metrics=new FrameMetrics();
 private channel:BroadcastChannel|null=null;private windows:Partial<Record<Side,Window>>={};private peers:Partial<Record<Side,Peer>>={};private seq=0;private epoch=crypto.randomUUID();private openedAt=0;
 private session:string;private timer:number;private message='Eén scherm actief.';
 constructor(private getState:()=>WorldState){
  let id:string|null=null;try{id=sessionStorage.getItem('autosim-session');if(!id){id=crypto.randomUUID();sessionStorage.setItem('autosim-session',id);}}catch{id=crypto.randomUUID();}this.session=id;
  try{this.channel=new BroadcastChannel('autosim-'+id);this.channel.onmessage=event=>{const m=event.data;if(m?.type==='hello'){this.publish();}if(m?.type==='ack'&&(m.side==='links'||m.side==='rechts'))this.peers[m.side as Side]={seq:m.seq,clock:m.clock,seen:Date.now(),age:m.age,fps:m.fps};};}catch{this.message='Venstersynchronisatie niet beschikbaar. Gebruik één scherm of breed beeld.';}
  const panel=document.createElement('section');panel.className='display-settings';panel.innerHTML=`<h2>Beeldschermen · Milestone 2</h2><p>Milestone 1 blijft open voor hardware- en duurtests. Verplaats vensters handmatig naar je schermen. Bestuur vanuit het middenvenster.</p>
 <label>Weergave <select id="displayMode"><option value="single">Eén scherm</option><option value="span">Breed beeld: links / midden / rechts</option><option value="windows">Drie vensters: links / midden / rechts</option></select></label>
 <button id="openDisplays">Open / herstel zijvensters</button><button id="singleDisplay">Terug naar één scherm</button><button id="placeDisplays">Verdeel over gedetecteerde schermen</button>
 <details><summary>Schermkalibratie</summary><div class="calibration-fields">
 <label>Linker kijkhoek (°) <input id="leftAngle" type="number" min="20" max="100" value="55"></label><label>Rechter kijkhoek (°) <input id="rightAngle" type="number" min="20" max="100" value="55"></label>
 <label>Verticaal gezichtsveld (°) <input id="fov" type="number" min="30" max="110" value="72"></label><label>Horizon / kanteling (°) <input id="horizon" type="number" min="-20" max="20" value="0"></label>
 <label>Indeling <select id="layout"><option value="equal">Drie gelijke delen</option><option value="center">Breed midden (25 / 50 / 25)</option></select></label>
 <label>Randruimte per deel (px) <input id="bezel" type="number" min="0" max="40" value="0"></label><label>Max. pixelschaal <input id="pixelRatio" type="number" min="0.5" max="1.5" step="0.25" value="1"></label>
 <label><input id="guides" type="checkbox"> Kalibratiekruis en horizonlijn</label><button id="resetCalibration">Herstel kalibratie</button></div><p>Stel kijkhoeken af op de fysieke schermhoeken. Horizon is camera-kanteling; randruimte is een eenvoudige opening tussen beeldvlakken, geen optische bezelkalibratie. Spreid voor breed beeld het browservenster zelf over je schermen.</p></details>
 <p id="displayStatus" role="status"></p><output id="displayMetrics"></output>`;
  document.querySelector('.sim')!.append(panel);
  const mode=document.querySelector<HTMLSelectElement>('#displayMode')!;
  mode.addEventListener('change',()=>{if(mode.value==='windows'){this.message='Klik op Open / herstel zijvensters.';mode.value=this.mode;return;}this.setMode(mode.value as DisplayMode);});
  document.querySelector('#singleDisplay')!.addEventListener('click',()=>this.setMode('single'));
  document.querySelector('#openDisplays')!.addEventListener('click',()=>this.open());
  document.querySelector('#placeDisplays')!.addEventListener('click',()=>void this.place());
  for(const key of ['leftAngle','rightAngle','fov','horizon','layout','bezel','pixelRatio','guides'] as const){document.getElementById(key)!.addEventListener('change',()=>{const e=document.getElementById(key) as HTMLInputElement;this.calibration=calibrate({...this.calibration,[key]:key==='guides'?e.checked:key==='layout'?e.value:Number(e.value)});this.updateClasses();this.publish();});}
  document.querySelector('#resetCalibration')!.addEventListener('click',()=>{this.calibration={...DEFAULT_CALIBRATION};for(const [key,value] of Object.entries(this.calibration)){const e=document.getElementById(key) as HTMLInputElement;if(key==='guides')e.checked=!!value;else e.value=String(value);}this.updateClasses();this.publish();});
  try{const saved=JSON.parse(sessionStorage.getItem('autosim-displays')??'null');if(saved){this.calibration=calibrate(saved.calibration);this.mode=saved.mode==='windows'&&this.channel?'windows':saved.mode==='span'?'span':'single';mode.value=this.mode;for(const [key,value] of Object.entries(this.calibration)){const e=document.getElementById(key) as HTMLInputElement;if(key==='guides')e.checked=!!value;else e.value=String(value);}this.openedAt=Date.now();this.updateClasses();}}catch{/* Defaults remain usable when storage is unavailable. */}
  this.timer=window.setInterval(()=>{this.publish();this.health();},50);this.publish();
  window.addEventListener('beforeunload',()=>{clearInterval(this.timer);this.channel?.postMessage({type:'offline'});this.channel?.close();});
 }
 private updateClasses(){document.body.classList.toggle('span-mode',this.mode==='span');document.body.classList.toggle('calibration-on',this.calibration.guides);document.body.dataset.layout=this.calibration.layout;}
 setMode(mode:DisplayMode){if(mode!=='windows')this.channel?.postMessage({type:'shutdown'});this.mode=mode;if(mode!=='windows'){for(const w of Object.values(this.windows))w?.close();this.windows={};this.peers={};}document.querySelector<HTMLSelectElement>('#displayMode')!.value=mode;this.message=mode==='single'?'Eén scherm actief.':mode==='span'?'Breed beeld actief. Spreid dit venster handmatig over de schermen.':'Middenvenster bestuurt; zijvensters ontvangen alleen beeld.';this.updateClasses();this.publish();}
 open(){
  if(!this.channel){this.setMode('single');this.message='Synchronisatie ontbreekt. Eén scherm blijft actief.';return;}
  for(const side of ['links','rechts'] as const){if(this.windows[side]&&!this.windows[side]!.closed)continue;const url=new URL(location.href);url.search='';url.searchParams.set('display',side);url.searchParams.set('session',this.session);this.windows[side]=window.open(url,`autosim-${this.session}-${side}`,'popup,width=800,height=650')??undefined;}
  if(!this.windows.links||!this.windows.rechts){this.setMode('single');this.message='Zijvenster geblokkeerd. Sta pop-ups toe of gebruik breed beeld.';return;}
  this.openedAt=Date.now();this.setMode('windows');this.publish();
 }
 private async place(){
  if(this.mode!=='windows'){this.message='Open eerst beide zijvensters. Handmatig verplaatsen werkt altijd.';return;}
  type ScreenInfo={availLeft:number;availTop:number;availWidth:number;availHeight:number};
  const api=window as Window&{getScreenDetails?:()=>Promise<{screens:ScreenInfo[]}>};
  if(!api.getScreenDetails){this.message='Automatische schermplaatsing ontbreekt. Sleep de vensters handmatig.';return;}
  try{const {screens}=await api.getScreenDetails();const sorted=[...screens].sort((a,b)=>a.availLeft-b.availLeft);if(sorted.length<3){this.message='Minder dan drie schermen gevonden. Gebruik handmatige plaatsing of breed beeld.';return;}
   for(const [i,side] of (['links','midden','rechts'] as const).entries()){const w=side==='midden'?window:this.windows[side];const s=sorted[i];w?.moveTo(s.availLeft,s.availTop);w?.resizeTo(s.availWidth,s.availHeight);}this.message='Plaatsing aangevraagd. Controleer de volgorde links / midden / rechts.';
  }catch{this.message='Schermtoegang niet verleend. Sleep de vensters handmatig.';}
 }
 private publish(){try{sessionStorage.setItem('autosim-displays',JSON.stringify({mode:this.mode,calibration:this.calibration}));}catch{/* Storage is optional. */}const p:Snapshot={type:'snapshot',epoch:this.epoch,seq:++this.seq,sentAt:Date.now(),state:structuredClone(this.getState()),calibration:{...this.calibration}};this.buffer.accept(p);if(this.mode==='windows')this.channel?.postMessage(p);}
 private health(){
  if(this.mode==='windows')for(const side of ['links','rechts'] as const){if(this.windows[side]?.closed){this.setMode('single');this.message='Zijvenster gesloten. Teruggevallen naar één scherm; heropen wanneer gewenst.';break;}if(Date.now()-this.openedAt>3000&&(!this.peers[side]||Date.now()-this.peers[side]!.seen>2000))this.message='Zijvenster reageert niet. Controleer het venster of kies één scherm.';}
  const peers=Object.entries(this.peers).map(([side,p])=>`${side}: pakket ${p.seq}, klok ${p.clock.toFixed(2)} s, ouderdom ${Math.round(p.age)} ms, ${p.fps.toFixed(1)} FPS`).join(' | ');
  document.querySelector('#displayStatus')!.textContent=this.message;
  document.querySelector('#displayMetrics')!.textContent=`Midden: ${this.metrics.fps.toFixed(1)} FPS · render ${this.metrics.renderMs.toFixed(1)} ms. ${peers}`;
 }
 renderState(){return this.mode==='windows'?(this.buffer.sample(Date.now())??this.getState()):this.getState();}
 stamp(state:WorldState){const screen=document.querySelector<HTMLElement>('.screen')!;screen.dataset.vehicle=JSON.stringify(state.vehicle);screen.dataset.mission=JSON.stringify(state.mission?{id:state.mission.id,index:state.mission.index,completed:state.mission.completed,encounterId:state.mission.encounterId,encounterIndex:state.mission.encounterIndex}:null);screen.dataset.traffic=JSON.stringify({scenarioId:state.scenario?.id,decision:state.scenario?.decision,actors:state.actors});screen.dataset.clock=String(state.clock);screen.dataset.seq=String(this.buffer.latest?.seq??0);screen.dataset.mode=this.mode;screen.dataset.scenario=state.scenario?.id??'demo';}
}
