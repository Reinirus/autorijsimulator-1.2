import {describe,it,expect} from 'vitest';
import {summarize,teacherCSV,readLocalData,NO_IDENTITY} from '../../src/progress/model';
import type {LocalData} from '../../src/progress/model';
describe('M5C lokaal en anoniem overzicht',()=>{
 const empty:LocalData={missions:[],theory:null,hazard:null};
 it('geeft leeg overzicht zonder verzonnen voortgang',()=>{const r=summarize(empty);expect(r.uniqueMissions).toBe(0);expect(r.missionAttempts).toBe(0);expect(r.theory.every(x=>x.total===0)).toBe(true);expect(r.hazard.every(x=>x.total===0)).toBe(true);});
 it('telt afgeronde missies en verkeersmeldingen apart',()=>{const m={version:1,missionId:1,date:'2026-11-11',completed:true,durationS:10,distanceM:20,maxSpeedKmh:14,observations:[],trafficEvents:[{time:2,category:'advies',message:'Let op',ruleIds:[]}]};const r=summarize({...empty,missions:[m,m] as LocalData['missions']});expect(r.missionAttempts).toBe(2);expect(r.completedMissions).toBe(2);expect(r.uniqueMissions).toBe(1);expect(r.missionEvents).toBe(2);});
 it('leest niets als opslag ontbreekt',()=>expect(readLocalData(null)).toEqual(empty));
 it('faalt veilig als opslag geblokkeerd is',()=>expect(readLocalData({getItem(){throw Error('blocked');}})).toEqual(empty));
 it('maakt anonieme CSV met UTF-8 BOM en zonder identiteit',()=>{const x=teacherCSV(empty);expect(x.charCodeAt(0)).toBe(0xfeff);expect(x).toContain('Verkeersinzicht');expect(x).not.toContain('leerlingnaam');expect(NO_IDENTITY).toContain('lokaal');});
});
