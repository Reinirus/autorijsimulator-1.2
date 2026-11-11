import {parseResults,RESULTS_KEY,type SavedResult} from '../missions/model';
import {readResult,STORAGE_KEY as THEORY_KEY,type Result} from '../theory/engine';
import {readHazardResult,STORAGE_KEY as HAZARD_KEY,correct,type HazardResult} from '../hazards/session';
import {QUESTION_BANK} from '../theory/bank';

export type DomainSummary={name:string;good:number;total:number;advice:string};
export type LocalSummary={missionAttempts:number;completedMissions:number;uniqueMissions:number;missionEvents:number;theory:DomainSummary[];hazard:DomainSummary[];hasTheory:boolean;hasHazard:boolean;warnings:string[]};
export type LocalData={missions:SavedResult[];theory:Result|null;hazard:HazardResult|null};
export const sourceKeys=[RESULTS_KEY,THEORY_KEY,HAZARD_KEY] as const;
export const NO_IDENTITY='Alle gegevens blijven lokaal. Zonder leerlingidentificatie zijn resultaten van verschillende gebruikers op hetzelfde apparaat niet van elkaar te onderscheiden.';
export function readLocalData(storage:Pick<Storage,'getItem'>|null):LocalData{
 if(!storage)return {missions:[],theory:null,hazard:null};
 try{return {missions:parseResults(storage.getItem(RESULTS_KEY)),theory:readResult(storage),hazard:readHazardResult(storage)};}
 catch{return {missions:[],theory:null,hazard:null};}
}
function advice(good:number,total:number,theme:string):string{
 if(total===0)return 'Maak eerst een oefening.';
 if(good===total)return 'Goed geoefend. Herhaal met een andere situatie.';
 return 'Oefen '+theme+' opnieuw en lees de uitleg bij je keuzes.';
}
export function summarize(data:LocalData):LocalSummary{
 const missions=data.missions;
 const domains=['Verkeersregels','Gevaarherkenning','Verkeersinzicht'];
 const theory=domains.map(name=>{
  const ids=new Set(QUESTION_BANK.filter(q=>q.domain===name).map(q=>q.id));
  const answers=data.theory?.answers.filter(a=>ids.has(a.id))??[];
  const good=answers.filter(a=>a.correct).length;
  return {name,good,total:answers.length,advice:advice(good,answers.length,name.toLowerCase())};
 });
 const hazardDimensions=[{name:'Kijken',key:'look'},{name:'Voorspellen',key:'predict'},{name:'Beslissen',key:'decision'}] as const;
 const hazard=hazardDimensions.map(d=>{
  const answers=data.hazard?.answers??[];
  const good=answers.filter(a=>correct(a)[d.key]).length;
  return {name:d.name,good,total:answers.length,advice:advice(good,answers.length,d.name.toLowerCase())};
 });
 const warnings=[NO_IDENTITY,'De resultaten zijn oefenfeedback, geen officiële of juridisch gevalideerde rijbeoordeling.'];
 if(!data.theory)warnings.push('Geen volledig theorieresultaat op dit apparaat.');
 if(!data.hazard)warnings.push('Geen volledig gevaarherkenningsresultaat op dit apparaat.');
 return {missionAttempts:missions.length,completedMissions:missions.filter(m=>m.completed).length,uniqueMissions:new Set(missions.filter(m=>m.completed).map(m=>m.missionId)).size,missionEvents:missions.reduce((n,m)=>n+m.trafficEvents.length,0),theory,hazard,hasTheory:!!data.theory,hasHazard:!!data.hazard,warnings};
}
function csvCell(value:unknown):string{
 const v=String(value??'');
 return '"'+(/^[\s]*[=+@-]/.test(v)?"'"+v:v).replaceAll('"','""')+'"';
}
export function teacherCSV(data:LocalData):string{
 const s=summarize(data);
 const rows:(string|number)[][]=[
 ['onderdeel','meting','goed','totaal','advies'],
 ['Rijmissies','Bewaarde pogingen',s.completedMissions,s.missionAttempts,'Voltooide oefendoelen zijn geen officiële slagingsscores.'],
 ['Rijmissies','Verschillende voltooide missies',s.uniqueMissions,10,'Bekijk de afzonderlijke oefenrapporten voor details.'],
 ['Rijmissies','Vastgelegde verkeersmeldingen',s.missionEvents,s.missionEvents,'Het aantal meldingen is geen foutscore.'],
 ...s.theory.map(d=>['Theorie',d.name,d.good,d.total,d.advice]),
 ...s.hazard.map(d=>['Gevaarherkenning',d.name,d.good,d.total,d.advice])
 ];
 return '\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
