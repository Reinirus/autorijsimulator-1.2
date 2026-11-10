import {shuffled} from '../theory/engine';
import {ACTIONS,HAZARDS,type Decision} from './catalog';
export type HazardMode='leren'|'oefentoets';
export type Step='kijk'|'voorspel'|'beslis'|'feedback'|'klaar';
export type HazardAnswer={id:string;look:number;predict:number;decision:Decision;time:number};
export type HazardResult={version:1;mode:HazardMode;seed:number;date:string;answers:HazardAnswer[]};
export const STORAGE_KEY='rijsim-m5b-anoniem-v1';
export class HazardSession{
 readonly cases;readonly answers:HazardAnswer[]=[];readonly seed:number;
 step:Step='kijk';clock=0;paused=false;private look=-1;private predict=-1;
 constructor(readonly mode:HazardMode,seed=Date.now()){if(!['leren','oefentoets'].includes(mode))throw Error('Ongeldige stand');this.seed=seed>>>0;this.cases=shuffled(HAZARDS,this.seed);}
 get current(){return this.cases[this.answers.length];}
 get watched(){return this.clock>=3;}
 tick(dt:number){if(!this.paused&&this.step!=='klaar'&&this.step!=='feedback'&&Number.isFinite(dt)&&dt>0)this.clock=Math.min(6.2,this.clock+Math.min(dt,.1));}
 replay(){if(this.step==='klaar'||this.step==='feedback')return;this.clock=0;this.paused=false;}
 choose(id:string,step:Step,choice:number):boolean{
  if(id!==this.current?.id||step!==this.step||!this.watched||!Number.isInteger(choice)||choice<0||choice>2)return false;
  if(step==='kijk'){this.look=choice;this.step='voorspel';return true;}
  if(step==='voorspel'){this.predict=choice;this.step='beslis';return true;}
  if(step!=='beslis')return false;
  this.answers.push({id,look:this.look,predict:this.predict,decision:ACTIONS[choice],time:this.clock});
  if(this.mode==='leren')this.step='feedback';else this.advance();return true;
 }
 next(){if(this.step==='feedback')this.advance();}
 private advance(){this.look=-1;this.predict=-1;this.clock=0;this.paused=false;this.step=this.answers.length===this.cases.length?'klaar':'kijk';}
 result():HazardResult{if(this.step!=='klaar')throw Error('Nog niet afgerond');return {version:1,mode:this.mode,seed:this.seed,date:new Date().toISOString(),answers:this.answers.map(a=>({...a}))};}
}
export function correct(a:HazardAnswer){const h=HAZARDS.find(h=>h.id===a.id)!;return {look:a.look===h.look.correct,predict:a.predict===h.predict.correct,decision:a.decision===h.decision};}
function validate(value:unknown):HazardResult|null{
 if(!value||typeof value!=='object')return null;const r=value as Partial<HazardResult>;
 if(r.version!==1||!['leren','oefentoets'].includes(r.mode??'')||!Number.isInteger(r.seed)||r.seed!<0||r.seed!>0xffffffff||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date))||!Array.isArray(r.answers)||r.answers.length!==HAZARDS.length)return null;
 const ids=new Set<string>(),answers:HazardAnswer[]=[];
 for(const a of r.answers){if(!a||!HAZARDS.some(h=>h.id===a.id)||ids.has(a.id)||![a.look,a.predict].every(x=>Number.isInteger(x)&&x>=0&&x<=2)||!ACTIONS.includes(a.decision)||!Number.isFinite(a.time)||a.time<3||a.time>6.2)return null;ids.add(a.id);answers.push({id:a.id,look:a.look,predict:a.predict,decision:a.decision,time:a.time});}
 return {version:1,mode:r.mode!,seed:r.seed!,date:r.date,answers};
}
export function saveHazardResult(r:HazardResult,storage?:Pick<Storage,'setItem'>):boolean{try{const safe=validate(r);if(!safe)return false;(storage??window.localStorage).setItem(STORAGE_KEY,JSON.stringify(safe));return true;}catch{return false;}}
export function readHazardResult(storage?:Pick<Storage,'getItem'>):HazardResult|null{try{const s=(storage??window.localStorage).getItem(STORAGE_KEY);return s?validate(JSON.parse(s)):null;}catch{return null;}}
