import {ACTIONS,HAZARDS,REVIEW,type Hazard} from './catalog';
import {HazardSession,correct,readHazardResult,saveHazardResult,type HazardAnswer,type HazardMode} from './session';
import {HazardView} from './view';

export class HazardPanel{
 private dialog:HTMLDialogElement;private session:HazardSession|null=null;private view:HazardView|null=null;
 private canvas:HTMLCanvasElement|null=null;private controls:HTMLElement|null=null;private shown='';private enabled=false;
 constructor(private beforeOpen:()=>void){
  const button=this.el('button','Gevaarherkenning in beweging');button.id='hazardOpen';document.querySelector('.actions')!.append(button);
  this.dialog=document.createElement('dialog');this.dialog.id='hazardDialog';this.dialog.setAttribute('aria-label','Gevaarherkenning in beweging');document.body.append(this.dialog);
  button.addEventListener('click',()=>{if(this.openNow)return;this.beforeOpen();this.home();this.dialog.showModal();});
  this.dialog.addEventListener('close',()=>this.dispose());
 }
 get openNow(){return this.dialog.open;}
 private el<K extends keyof HTMLElementTagNameMap>(tag:K,text:string){const e=document.createElement(tag);e.textContent=text;return e;}
 private button(parent:HTMLElement,text:string,click:()=>void){const b=this.el('button',text);b.type='button';b.addEventListener('click',click);parent.append(b);return b;}
 private heading(){this.dialog.append(this.el('h2','Gevaarherkenning in beweging'),this.el('p','DEMO — NIET CBR-GECERTIFICEERD'),this.el('p',REVIEW));}
 private dispose(){this.view?.dispose();this.view=null;this.session=null;this.canvas=null;this.controls=null;}
 private home(){this.dispose();this.dialog.replaceChildren();this.dialog.dataset.step='home';delete this.dialog.dataset.case;this.heading();this.dialog.append(this.el('p','Tien bewegende situaties. Kijk, voorspel en kies een actie. Je bedient hier niet de auto. De rijmissie wacht.'));
  const old=readHazardResult();if(old)this.dialog.append(this.el('p',`Vorig anoniem resultaat: ${old.answers.length} situaties (${old.mode}).`));
  this.button(this.dialog,'Begin leerstand',()=>this.begin('leren'));this.button(this.dialog,'Begin oefentoets',()=>this.begin('oefentoets'));this.button(this.dialog,'Sluiten',()=>this.dialog.close());
 }
 private begin(mode:HazardMode){
  this.dispose();this.session=new HazardSession(mode);this.shown='';this.dialog.replaceChildren();this.heading();
  this.canvas=document.createElement('canvas');this.canvas.id='hazardFilm';this.canvas.setAttribute('aria-label','Bewegende 3D-verkeerssituatie. Kies daarna wat je ziet.');this.dialog.append(this.canvas);
  this.controls=document.createElement('section');this.controls.id='hazardControls';this.dialog.append(this.controls);
  try{this.view=new HazardView(this.canvas);this.renderStage();}catch{this.dispose();this.dialog.append(this.el('p','De bewegende 3D-oefening kan niet starten. WebGL is nodig. Er wordt geen stilstaande vervanging of resultaat gemaakt.'));this.button(this.dialog,'Terug',()=>this.home());}
 }
 frame(dt:number){if(!this.openNow||!this.session||!this.view||document.hidden)return;const s=this.session;s.tick(dt);if(s.step==='klaar'||s.step==='feedback')return;this.view.render(s.clock,s.seed);const time=this.dialog.querySelector('#hazardTime');if(time)time.textContent=`Film: ${s.clock.toFixed(1)} s / 6,2 s`;
  if(s.watched&&!this.enabled){this.enabled=true;this.controls?.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(b=>b.disabled=false);const p=this.dialog.querySelector('#hazardWatch');if(p)p.textContent='Kies je antwoord. Je kunt de film opnieuw bekijken.';}
 }
 private renderStage(){
  const s=this.session!,parent=this.controls!;if(s.step==='klaar'){this.finish();return;}
  parent.replaceChildren();this.dialog.dataset.step=s.step;this.dialog.dataset.mode=s.mode;this.enabled=s.watched;
  if(s.step==='feedback'){const a=s.answers.at(-1)!,h=HAZARDS.find(h=>h.id===a.id)!;this.dialog.dataset.case=a.id;parent.append(this.el('h3','Uitleg bij deze situatie'));this.feedback(parent,h,a);this.button(parent,s.answers.length===10?'Bekijk eindrapport':'Volgende situatie',()=>{s.next();this.renderStage();});}
  else{
   const h=s.current;this.dialog.dataset.case=h.id;if(this.shown!==h.id){this.shown=h.id;this.view!.load(h);}
   const count=s.answers.length+1;parent.append(this.el('h3',`Situatie ${count} van ${s.cases.length} · ${s.mode==='leren'?h.title:'Oefentoets'}`));
   if(h.id==='GHV-03')parent.append(this.el('p','Je wilt bij deze zijweg rechtsaf.'));
   const label=s.step==='kijk'?'1. Kijk: wat gebeurt er?':s.step==='voorspel'?'2. Voorspel: welk gevaar kan ontstaan?':'3. Beslis: wat doe je nu?';parent.append(this.el('h4',label));
   const watch=this.el('p',s.watched?'Kies je antwoord.':'Bekijk eerst minstens drie seconden van de film.');watch.id='hazardWatch';watch.setAttribute('role','status');parent.append(watch);const time=this.el('p','Film: 0,0 s / 6,2 s');time.id='hazardTime';parent.append(time);
   const options=s.step==='kijk'?h.look.options:s.step==='voorspel'?h.predict.options:ACTIONS;const step=s.step;
   options.forEach((text,i)=>{const b=this.button(parent,text,()=>{if(s.choose(h.id,step,i))this.renderStage();});b.dataset.choice=String(i);b.disabled=!s.watched;});
   const tools=this.el('div','');tools.className='hazard-tools';parent.append(tools);
   this.button(tools,'Film opnieuw',()=>{s.replay();this.renderStage();});
   if(s.mode==='leren')this.button(tools,s.paused?'Verder kijken':'Pauze',()=>{s.paused=!s.paused;this.renderStage();});
   this.view!.render(s.clock,s.seed);
  }
  this.button(parent,'Stoppen zonder nieuw resultaat',()=>this.home());this.button(parent,'Sluiten',()=>this.dialog.close());parent.querySelector<HTMLElement>('h3')?.setAttribute('tabindex','-1');parent.querySelector<HTMLElement>('h3')?.focus({preventScroll:true});
 }
 private feedback(parent:HTMLElement,h:Hazard,a:HazardAnswer){
  const c=correct(a);parent.append(this.el('p',`Kijk: ${c.look?'passend':'oefen verder'} · Voorspel: ${c.predict?'passend':'oefen verder'} · Beslis: ${c.decision?'passend':'oefen verder'}`),this.el('p',`Jij zag: ${h.look.options[a.look]}`),this.el('p',`Jij voorspelde: ${h.predict.options[a.predict]}`),this.el('p',`Jouw actie: ${a.decision}`),this.el('p',`In deze film: ${h.look.options[h.look.correct]} ${h.predict.options[h.predict.correct]}`),this.el('p',`Oefenadvies: ${h.advice}`),this.el('p',`Film-ID ${a.id} · keuzemoment ${a.time.toFixed(2)} s · ${REVIEW}`));
 }
 private finish(){
  const s=this.session!,r=s.result(),saved=saveHazardResult(r);this.view?.dispose();this.view=null;this.canvas?.remove();this.controls=null;this.dialog.replaceChildren();this.dialog.dataset.step='klaar';delete this.dialog.dataset.case;this.heading();this.dialog.append(this.el('h3','Eindrapport · geen officiële slaaggrens'),this.el('p',saved?'Tien situaties anoniem op dit apparaat bewaard.':'Niet opgeslagen. Opslag is niet beschikbaar.'));
  for(const a of r.answers){const h=HAZARDS.find(h=>h.id===a.id)!,item=document.createElement('details');item.append(this.el('summary',`${a.id} · ${h.title}`));this.feedback(item,h,a);this.dialog.append(item);}
  this.button(this.dialog,'Opnieuw kiezen',()=>this.home());this.button(this.dialog,'Sluiten',()=>this.dialog.close());
 }
}
