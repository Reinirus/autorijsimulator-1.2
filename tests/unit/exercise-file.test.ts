import {describe,it,expect} from 'vitest';
import {exportExerciseBundle,parseExerciseBundle,importExerciseBundle,clearExerciseData} from '../../src/progress/exercise-file';
import {RESULTS_KEY} from '../../src/missions/model';
import {STORAGE_KEY as THEORY_KEY} from '../../src/theory/engine';
import {STORAGE_KEY as HAZARD_KEY} from '../../src/hazards/session';
function memory(){
 const map=new Map<string,string>();
 return {getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);},removeItem:(k:string)=>{map.delete(k);}};
}
describe('M5C oefenbestanden voor gedeelde apparaten',()=>{
 it('maakt anoniem exportbestand dat opnieuw te lezen is',()=>{
  const b=exportExerciseBundle(memory());const parsed=parseExerciseBundle(JSON.stringify(b));
  expect(parsed?.kind).toBe('rijsim-anoniem-oefenbestand');expect(parsed?.missions).toEqual([]);expect(parsed?.theory).toBeNull();
 });
 it('weigert onjuiste of extra leerlingdata',()=>{
  const b=exportExerciseBundle(memory());
  expect(parseExerciseBundle(JSON.stringify({...b,missions:[{name:'Leerling',completed:true}]}))).toBeNull();
  expect(parseExerciseBundle('niet json')).toBeNull();
 });
 it('verwijdert onbekende persoonlijke naamvelden uit geïmporteerde oefenbestanden',()=>{
  const b=exportExerciseBundle(memory());
  const original={version:1,missionId:1,date:'2026-11-11',completed:true,durationS:10,distanceM:15,maxSpeedKmh:20,observations:[],trafficEvents:[]};
  const parsed=parseExerciseBundle(JSON.stringify({...b,missions:[{...original,studentName:'Voornaam',email:'leerling@example.org'}]}));
  expect(parsed).not.toBeNull();
  expect(JSON.stringify(parsed)).not.toContain('studentName');
  expect(JSON.stringify(parsed)).not.toContain('leerling@example.org');
 });
 it('importeert uitsluitend in een lege opslag en kan wissen',()=>{
  const origin=memory(),dest=memory();const b=exportExerciseBundle(origin);
  expect(importExerciseBundle(dest,b)).toBe(true);
  expect(dest.getItem(RESULTS_KEY)).toBe('[]');
  expect(importExerciseBundle(dest,b)).toBe(false);
  expect(clearExerciseData(dest)).toBe(true);
  expect(dest.getItem(RESULTS_KEY)).toBeNull();expect(dest.getItem(THEORY_KEY)).toBeNull();expect(dest.getItem(HAZARD_KEY)).toBeNull();
 });
 it('vermengt bestaande resultaten nooit met een ander bestand',()=>{
  const dest=memory();dest.setItem(RESULTS_KEY,'[]');
  expect(importExerciseBundle(dest,exportExerciseBundle(memory()))).toBe(false);
  expect(dest.getItem(RESULTS_KEY)).toBe('[]');
 });
});
