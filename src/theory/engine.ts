import {QUESTION_BANK,type Domain,type Question} from './bank';
export type Mode='oefenen'|'oefentoets';
export type Answer={id:string;chosen:number;correct:boolean};
export type Result={version:1;mode:Mode;domain:Domain|'Alle onderwerpen';seed?:number;total:number;correct:number;answers:Answer[];date:string};
export const STORAGE_KEY='rijsim-m5-practice-v1';
const DOMAINS=['Alle onderwerpen','Verkeersregels','Gevaarherkenning','Verkeersinzicht'];
export function shuffled<T>(items:readonly T[],seed:number):T[]{let s=seed>>>0;const out=[...items];for(let i=out.length-1;i>0;i--){s=(Math.imul(s,1664525)+1013904223)>>>0;const j=s%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
export class TheorySession{
 readonly questions:Question[];readonly answers:Answer[]=[];readonly mode:Mode;readonly domain:Domain|'Alle onderwerpen';readonly seed:number;
 constructor(mode:Mode,domain:Domain|'Alle onderwerpen'='Alle onderwerpen',seed=Date.now()){
  if(!['oefenen','oefentoets'].includes(mode)||!DOMAINS.includes(domain))throw Error('Ongeldige oefenkeuze');
  this.mode=mode;this.domain=domain;this.seed=seed>>>0;const pool=QUESTION_BANK.filter(x=>domain==='Alle onderwerpen'||x.domain===domain);
  this.questions=shuffled(pool,this.seed);if(!pool.length)throw Error('Geen vragen');
 }
 get index(){return this.answers.length;}get done(){return this.index>=this.questions.length;}
 get current(){return this.done?null:this.questions[this.index];}
 answer(choice:number,questionId=this.current?.id):{correct:boolean;explanation:string}|null{const q=this.current;if(!q||q.id!==questionId||!Number.isInteger(choice)||choice<0||choice>=q.options.length)return null;const correct=choice===q.correct;this.answers.push({id:q.id,chosen:choice,correct});return {correct,explanation:q.explanation};}
 result(date=new Date().toISOString()):Result{if(!this.done)throw Error('Oefening niet afgerond');return {version:1,mode:this.mode,domain:this.domain,seed:this.seed,total:this.questions.length,correct:this.answers.filter(a=>a.correct).length,answers:this.answers.map(a=>({...a})),date};}
}
function validated(value:unknown):Result|null{
 if(typeof value!=='object'||value===null)return null;const r=value as Partial<Result>;
 if(r.version!==1||!['oefenen','oefentoets'].includes(r.mode??'')||!DOMAINS.includes(r.domain??'')||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date))||!Number.isInteger(r.total)||!Number.isInteger(r.correct)||!Array.isArray(r.answers))return null;
 if(r.seed!==undefined&&(!Number.isInteger(r.seed)||r.seed<0||r.seed>0xffffffff))return null;
 const pool=QUESTION_BANK.filter(q=>r.domain==='Alle onderwerpen'||q.domain===r.domain);if(r.total!==pool.length||r.answers.length!==pool.length||r.correct!<0||r.correct!>r.total!)return null;
 const ids=new Set<string>(),answers:Answer[]=[];for(const a of r.answers){if(!a||typeof a!=='object')return null;const q=pool.find(q=>q.id===a.id);if(!q||ids.has(a.id)||!Number.isInteger(a.chosen)||a.chosen<0||a.chosen>=q.options.length||typeof a.correct!=='boolean'||a.correct!==(a.chosen===q.correct))return null;ids.add(a.id);answers.push({id:a.id,chosen:a.chosen,correct:a.correct});}
 if(answers.filter(a=>a.correct).length!==r.correct)return null;
 return {version:1,mode:r.mode!,domain:r.domain!,...(r.seed===undefined?{}:{seed:r.seed}),total:r.total!,correct:r.correct!,date:r.date,answers};
}
export function saveResult(result:Result,storage?:Pick<Storage,'setItem'>|null):boolean{try{const safe=validated(result);if(!safe)return false;const target=storage===undefined?(typeof window==='undefined'?null:window.localStorage):storage;if(!target)return false;target.setItem(STORAGE_KEY,JSON.stringify(safe));return true;}catch{return false;}}
export function readResult(storage?:Pick<Storage,'getItem'>|null):Result|null{try{const target=storage===undefined?(typeof window==='undefined'?null:window.localStorage):storage;const raw=target?.getItem(STORAGE_KEY);return raw?validated(JSON.parse(raw)):null;}catch{return null;}}
export function toCSV(result:Result):string{const r=validated(result);if(!r)throw Error('Ongeldig oefenresultaat');const quote=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';return ['datum,stand,onderwerp,seed,vraag,antwoordindex,goed',...r.answers.map(a=>[r.date,r.mode,r.domain,r.seed??'',a.id,a.chosen+1,a.correct?'ja':'nee'].map(quote).join(','))].join('\r\n');}
