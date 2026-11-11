import {describe,it,expect} from 'vitest';
import {missionOverview,summarize,teacherCSV,readLocalData,NO_IDENTITY} from '../../src/progress/model';
import type {LocalData} from '../../src/progress/model';
import {HAZARDS} from '../../src/hazards/catalog';
describe('M5C lokaal en anoniem overzicht',()=>{
 const empty:LocalData={missions:[],theory:null,hazard:null};
 it('geeft leeg overzicht zonder verzonnen voortgang',()=>{const r=summarize(empty);expect(r.uniqueMissions).toBe(0);expect(r.missionAttempts).toBe(0);expect(r.theory.every(x=>x.total===0)).toBe(true);expect(r.hazard.every(x=>x.total===0)).toBe(true);});
 it('telt afgeronde missies en verkeersmeldingen apart',()=>{const m={version:1,missionId:1,date:'2026-11-11',completed:true,durationS:10,distanceM:20,maxSpeedKmh:14,observations:[],trafficEvents:[{time:2,category:'advies',message:'Let op',ruleIds:[]}]};const r=summarize({...empty,missions:[m,m] as LocalData['missions']});expect(r.missionAttempts).toBe(2);expect(r.completedMissions).toBe(2);expect(r.uniqueMissions).toBe(1);expect(r.missionEvents).toBe(2);});
 it('leest niets als opslag ontbreekt',()=>expect(readLocalData(null)).toEqual(empty));
 it('faalt veilig als opslag geblokkeerd is',()=>expect(readLocalData({getItem(){throw Error('blocked');}})).toEqual(empty));
 it('maakt anonieme CSV met UTF-8 BOM en zonder identiteit',()=>{const x=teacherCSV(empty);expect(x.charCodeAt(0)).toBe(0xfeff);expect(x).toContain('Verkeersinzicht');expect(x).not.toContain('leerlingnaam');expect(NO_IDENTITY).toContain('lokaal');});
 it('onderscheidt tien missies, afgeronde pogingen en onvoltooide ritten in de CSV',()=>{
  const missions=missionOverview(empty).map(({id})=>({
   version:1 as const,missionId:id,date:'2026-11-11',completed:id%2===0,
   durationS:10,distanceM:20,maxSpeedKmh:14,observations:[],trafficEvents:[]
  }));
  const data={...empty,missions};
  expect(missionOverview(data)).toHaveLength(10);
  expect(summarize(data).completedMissions).toBe(5);
  const csv=teacherCSV(data);
  expect(csv).toContain('"Rijmissies";"Missie 1";"0";"1"');
  expect(csv).toContain('"Rijmissies";"Missie 10";"1";"1"');
 });
 it('rapporteert tien bewegende situaties per vaardigheid met gericht oefenadvies',()=>{
  const hazard:NonNullable<LocalData['hazard']>={
   version:1,mode:'leren',seed:1,date:'2026-11-11',
   answers:HAZARDS.map((h,i)=>({
    id:h.id,look:i===0?(h.look.correct+1)%3:h.look.correct,
    predict:h.predict.correct,decision:h.decision,time:3
   }))
  };
  const result=summarize({...empty,hazard});
  expect(result.hazard.map(({good,total})=>[good,total])).toEqual([[9,10],[10,10],[10,10]]);
  expect(result.hazard[0].advice).toContain('randen van de weg');
 });
});
