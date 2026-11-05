import {it,expect} from 'vitest';
import {Simulation} from '../../src/core/simulation';
import {ROUTES,encounterInstruction} from '../../src/missions/route';
import {onStreet,streetSegments} from '../../src/missions/roads';
import {recordResult,newMissionProgress,updateMission,parseResults,toCsv} from '../../src/missions/model';
import {SCENARIOS} from '../../src/scenarios/catalog';
function drive(id:number,yieldToTraffic=true){const sim=new Simulation();sim.selectMission(id);sim.start();let last=0;
 for(let n=0;n<240*60&&!sim.state.mission!.completed;n++){
  const s=sim.state,m=s.mission!,g=ROUTES[id].points[m.index],v=s.vehicle,e=ROUTES[id].encounters[m.encounterIndex];let desired=4;
  if(yieldToTraffic&&e&&s.scenario){const a=s.actors[0],end=SCENARIOS[e.scenario].actor.route.at(-1)!;const cleared=a&&Math.hypot(a.x-end.x,a.z-(end.z+e.z))<.05;
   if(!cleared)desired=Math.min(desired,Math.sqrt(Math.max(0,v.z-e.z-16)*2));}
  if(g.stop)desired=Math.min(desired,Math.sqrt(Math.max(0,Math.hypot(g.x-v.x,g.z-v.z)-.4)*1.5));
  sim.setInput({throttle:Math.abs(v.speed)<desired-.08,brake:Math.abs(v.speed)>desired+.08,left:false,right:false});sim.step();expect(sim.state.clock).toBeGreaterThan(last);last=sim.state.clock;
 }return sim;
}
it.each([3,4])('M4B missie %i complete rit met fysica en M3-beoordeling',id=>{const sim=drive(id),s=sim.state,m=s.mission!,route=ROUTES[id];expect(m.completed).toBe(true);expect(m.encounterIndex).toBe(route.encounters.length);expect(m.encounters.map(e=>e.id)).toEqual(route.encounters.map(e=>e.id));expect(m.encounters.every(e=>e.finishedAt!==null&&e.finishedAt>e.startedAt)).toBe(true);expect(m.events.filter(e=>e.category==='regel'||e.code.includes('CONTACT_'))).toEqual([]);expect(s.vehicle.speed).toBe(0);expect(m.distance).toBeGreaterThan(id===3?190:260);const p=updateMission(newMissionProgress(id as 3|4,sim.state),{...s,clock:s.clock+1});const record=recordResult(p,s,'2026-11-05');expect(record.encounters).toHaveLength(route.encounters.length);expect(parseResults(JSON.stringify([record]))).toHaveLength(1);expect(toCsv([record])).toContain(route.encounters[0].id);});
it.each([3,4])('M4B missie %i heeft aaneengesloten asfalt voor rijbaan, kruisingen en NPC-routes',id=>{const r=ROUTES[id];for(let z=23;z>r.points.at(-1)!.z-3;z-=.25)expect(onStreet(r,1.55,z)).toBe(true);for(const e of r.encounters)for(const p of SCENARIOS[e.scenario].actor.route){if(e.scenario==='zebra')expect(Math.abs(p.x)).toBeLessThanOrEqual(5.3);else expect(onStreet(r,p.x,p.z+e.z)).toBe(true);}expect(streetSegments(r)).toHaveLength(r.encounters.filter(e=>e.scenario!=='zebra').length+1);});
it('M4B reset wist klok, alle encounters, rapport en afgelegde afstand',()=>{const sim=drive(3);sim.reset();expect(sim.state.clock).toBe(0);expect(sim.state.mission).toMatchObject({id:3,index:0,completed:false,events:[],encounters:[],distance:0});});
it('weigert corrupte encountergegevens bij teruglezen van een rapport',()=>{const sim=new Simulation();sim.selectMission(3);const r=recordResult(newMissionProgress(3,sim.state),sim.state,'2026-11-05');expect(parseResults(JSON.stringify([{...r,encounters:[{}]},{...r,encounters:null}]))).toEqual([]);});
it('beoordeelt herhaald niet voor laten gaan op de echte route afzonderlijk',()=>{const sim=drive(4,false);const events=sim.state.mission!.events.filter(e=>e.category==='regel'&&e.code.endsWith(':GIVE_WAY'));expect(new Set(events.map(e=>e.encounterId)).size).toBeGreaterThanOrEqual(2);expect(events.every(e=>e.time>0&&e.alternative.length>10&&e.ruleIds.length>0)).toBe(true);});
it('uitleg en registratie noemen bij een fietser ook daadwerkelijk de fietser',()=>{for(const r of [ROUTES[3],ROUTES[4]])for(const e of r.encounters.filter(e=>e.actorKind==='fietser')){expect(encounterInstruction(e)).toContain('de fietser');expect(encounterInstruction(e)).not.toContain('de auto');}const sim=new Simulation();sim.selectMission(3);sim.start();sim.step();expect(sim.state.mission!.encounters[0].instruction).toContain('de fietser');expect(sim.state.mission!.events[0]).toMatchObject({encounterId:'m3-rechts-fiets-01',time:0,category:'waarneming'});});
