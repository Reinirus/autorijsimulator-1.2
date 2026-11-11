import {parseResults,RESULTS_KEY} from '../missions/model';
import {readResult,STORAGE_KEY as THEORY_KEY} from '../theory/engine';
import {readHazardResult,STORAGE_KEY as HAZARD_KEY} from '../hazards/session';
import {readLocalData,type LocalData} from './model';

export const BUNDLE_TYPE='rijsim-anoniem-oefenbestand';
export type ExerciseBundle={kind:typeof BUNDLE_TYPE;version:1;createdAt:string;missions:LocalData['missions'];theory:LocalData['theory'];hazard:LocalData['hazard']};
const KEYS=[RESULTS_KEY,THEORY_KEY,HAZARD_KEY] as const;
type LocalStore=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export function exportExerciseBundle(storage:Pick<Storage,'getItem'>):ExerciseBundle{
 const data=readLocalData(storage);
 return {kind:BUNDLE_TYPE,version:1,createdAt:new Date().toISOString(),...data};
}
export function parseExerciseBundle(raw:string):ExerciseBundle|null{
 if(raw.length>2_000_000)return null;
 try{
  const value:unknown=JSON.parse(raw);
  if(!value||typeof value!=='object')return null;
  const b=value as Partial<ExerciseBundle>;
  if(b.kind!==BUNDLE_TYPE||b.version!==1||typeof b.createdAt!=='string'||!Number.isFinite(Date.parse(b.createdAt))||!Array.isArray(b.missions)||b.missions.length>100)return null;
  const missions=parseResults(JSON.stringify(b.missions));
  if(missions.length!==b.missions.length)return null;
  if(b.theory!==null&&b.theory!==undefined&&!readResult({getItem:()=>JSON.stringify(b.theory)}))return null;
  if(b.hazard!==null&&b.hazard!==undefined&&!readHazardResult({getItem:()=>JSON.stringify(b.hazard)}))return null;
  if(b.theory===undefined||b.hazard===undefined)return null;
  return {kind:BUNDLE_TYPE,version:1,createdAt:b.createdAt,missions,theory:b.theory===null?null:readResult({getItem:()=>JSON.stringify(b.theory)}),hazard:b.hazard===null?null:readHazardResult({getItem:()=>JSON.stringify(b.hazard)})};
 }catch{return null;}
}
export function importExerciseBundle(storage:LocalStore,bundle:ExerciseBundle):boolean{
 // Never silently combine two pupils' results or overwrite an existing session.
 try{
  if(KEYS.some(k=>storage.getItem(k)!==null))return false;
  const validated=parseExerciseBundle(JSON.stringify(bundle));if(!validated)return false;
  const values=[JSON.stringify(validated.missions),validated.theory===null?null:JSON.stringify(validated.theory),validated.hazard===null?null:JSON.stringify(validated.hazard)];
  try{KEYS.forEach((key,i)=>{if(values[i]===null)storage.removeItem(key);else storage.setItem(key,values[i]!);});}
  catch{KEYS.forEach(key=>{try{storage.removeItem(key);}catch{/* Storage blocked; report failure. */}});return false;}
  return true;
 }catch{return false;}
}
export function clearExerciseData(storage:LocalStore):boolean{
 try{KEYS.forEach(key=>storage.removeItem(key));return KEYS.every(key=>storage.getItem(key)===null);}catch{return false;}
}
