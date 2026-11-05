import {it,expect} from 'vitest';
import {Simulation} from '../../src/core/simulation';
import {ROUTES} from '../../src/missions/route';
import {DEVELOPMENT_ROUTES,validateLanes} from '../../src/missions/development';
it('historische routevoorstellen blijven expliciet buiten de speelbare registratie',()=>{expect(Object.keys(DEVELOPMENT_ROUTES)).toHaveLength(6);expect(Object.keys(ROUTES)).toEqual(['1','2','3','4','5','6','7','8']);for(const r of Object.values(DEVELOPMENT_ROUTES)){expect(r.points.at(-1)!.stop).toBe(true);expect(new Set(r.encounters.map(e=>e.id)).size).toBe(r.encounters.length);}});
it('valideert rijstrookgeometrie en aansluitingen vóór routevrijgave',()=>{expect(validateLanes([{id:'a',width:3,center:[{x:0,z:0},{x:0,z:-10}],successors:['a']}])).toEqual([]);expect(validateLanes([{id:'a',width:0,center:[],successors:['missing']}])).toHaveLength(2);});
it('herhaalde verkeersmomenten behouden klok en afzonderlijke gebeurtenis-ID’s',()=>{
 // Deliberate boundary injection verifies the encounter adapter, not a full journey.
 ROUTES[99]={id:99,points:[{x:1.55,z:-160,radius:1,stop:true,instruction:'stop'}],encounters:[{id:'first',scenario:'lichten',z:0},{id:'second',scenario:'lichten',z:-70}]};
 try{const sim=new Simulation();sim.selectMission(99);sim.start();sim.step();for(const [z,id] of [[0,'first'],[-70,'second']] as const){if(z!==0){sim.state.vehicle.z=z+23;sim.step();}sim.state.vehicle.z=z+7.7;sim.state.vehicle.speed=2;sim.setInput({throttle:true});for(let i=0;i<20;i++)sim.step();expect(sim.state.mission!.events.some(e=>e.code===id+':GIVE_WAY')).toBe(true);sim.state.vehicle.z=z-9;sim.step();}
 const m=sim.state.mission!;expect(m.encounterIndex).toBe(2);expect(m.events.filter(e=>e.code.endsWith(':GIVE_WAY'))).toHaveLength(2);const times=m.events.map(e=>e.time);expect(times).toEqual([...times].sort((a,b)=>a-b));expect(sim.state.clock).toBeGreaterThan(.6);
 }finally{delete ROUTES[99];}
});
