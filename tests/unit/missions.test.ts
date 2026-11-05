import {describe,it,expect} from 'vitest';
import {initialState} from '../../src/core/state';
import {newMissionProgress,updateMission,parseResults,recordResult,toCsv,MISSIONS} from '../../src/missions/model';
import type {WorldState} from '../../src/core/state';

describe('Milestone 4 missies',()=>{
 it('biedt tien losse missies en markeert onvoltooide routes als niet beschikbaar',()=>{expect(MISSIONS).toHaveLength(10);expect(MISSIONS.filter(m=>m.available).map(m=>m.id)).toEqual([1,2,3,4,5,6,7,8]);});
 it('missie 1 vereist werkelijk rijden, remmen en stoppen',()=>{let s=initialState();let p=newMissionProgress(1,s);s={...s,running:true,clock:1,vehicle:{...s.vehicle,z:12,speed:2}};p=updateMission(p,s);expect(p.completed).toBe(false);s={...s,clock:2,input:{...s.input,brake:true},vehicle:{...s.vehicle,z:10,speed:1}};p=updateMission(p,s);expect(p.sawBrake).toBe(true);s={...s,clock:3,vehicle:{...s.vehicle,z:9,speed:0}};p=updateMission(p,s);expect(p.completed).toBe(true);});
 it('telt dezelfde simulatieklok niet dubbel',()=>{const s=initialState();const p=newMissionProgress(1,s);const r=updateMission(p,{...s,running:true,clock:0});expect(r.distanceM).toBe(0);});
 it('missie 2 vereist richting vóór wegrijden en M3-eindpositie',()=>{let s=initialState();let p=newMissionProgress(2,s);s={...s,running:true,clock:1,indicator:'links'};p=updateMission(p,s);expect(p.indicatorBeforeMoving).toBe(true);s={...s,clock:2,scenario:{id:'wegrijden',phase:'afgerond',events:[],decision:{action:'doorgaan',ruleIds:[],reason:''},startedActors:true,crossed:true,contacts:[]}} as WorldState;p=updateMission(p,s);expect(p.completed).toBe(true);});
 it('weigert corrupte lokale opslag',()=>{expect(parseResults('{broken')).toEqual([]);expect(parseResults('[{},null]')).toEqual([]);});
 it('weigert gedeeltelijk geldige rapporten die CSV-export zouden laten crashen',()=>{expect(parseResults(JSON.stringify([{version:1,missionId:1,completed:true,trafficEvents:[]}]))).toEqual([]);const s=initialState(),r=recordResult(newMissionProgress(1,s),s,'2026-11-05');expect(parseResults(JSON.stringify([{...r,durationS:null},{...r,observations:[{}]},{...r,trafficEvents:[null]}]))).toEqual([]);});
 it('anonimiseert rapport en escaped CSV-velden',()=>{const s=initialState();const p=newMissionProgress(1,s);const record=recordResult(p,s,'2026-11-04T12:00:00Z');expect('name' in record).toBe(false);expect(parseResults(JSON.stringify([record]))).toHaveLength(1);expect(toCsv([{...record,observations:['A, "B"']}])).toContain('""B""');});
});
