import {describe,it,expect} from 'vitest';
import {BASE_FACTS,decideTraffic,type TrafficFacts} from '../../src/rules/traffic';
import {RULES} from '../../src/rules/catalog';
import {SCENARIOS} from '../../src/scenarios/catalog';
import {Simulation} from '../../src/core/simulation';
import {scenarioState,scenarioFacts} from '../../src/scenarios/runtime';
import {overlapBodies} from '../../src/traffic/geometry';
import type {ScenarioId} from '../../src/scenarios/model';
import {SnapshotBuffer} from '../../src/displays/sync';
import {DEFAULT_CALIBRATION} from '../../src/displays/config';
const cases:[string,Partial<TrafficFacts>,string][]=[
 ['rechts gaat voor',{otherFromRight:true,conflicting:true},'voorrang'],
 ['links niet automatisch',{otherFromRight:false,conflicting:true},'doorgaan'],
 ['onverhard naar verhard',{egoUnpaved:true,conflicting:true},'voorrang'],
 ['verhard boven onverhard van rechts',{otherFromRight:true,otherUnpaved:true,conflicting:true},'doorgaan'],
 ['beide onverhard van rechts',{egoUnpaved:true,otherUnpaved:true,otherFromRight:true,conflicting:true},'voorrang'],
 ['tram van links',{otherTram:true,conflicting:true},'voorrang'],
 ['B6 ook van links',{sign:'B6',conflicting:true},'voorrang'],
 ['B6 zonder conflict geen verplichte stop',{sign:'B6'},'doorgaan'],
 ['B1 boven rechtsregel',{sign:'B1',otherFromRight:true,conflicting:true},'doorgaan'],
 ['rood boven voorrangsbord',{signalActive:true,light:'rood',sign:'B1'},'stop'],
 ['groen boven B6',{signalActive:true,light:'groen',sign:'B6',conflicting:true},'doorgaan'],
 ['geel met stopruimte',{signalActive:true,light:'oranje',yellowCanStop:true},'stop'],
 ['geel zonder redelijke stopmogelijkheid',{signalActive:true,light:'oranje',yellowCanStop:false},'doorgaan'],
 ['geel onzeker niet overtreding noemen',{signalActive:true,light:'oranje'},'onzeker'],
 ['afslaan fietser zelfde weg',{movement:'rechtsaf',sameRoadCyclist:true,conflicting:true},'voorrang'],
 ['groen heft afslaande plicht niet op',{signalActive:true,light:'groen',movement:'rechtsaf',sameRoadCyclist:true,conflicting:true},'voorrang'],
 ['fietser al gepasseerd',{movement:'rechtsaf',sameRoadCyclist:true,conflicting:false},'doorgaan'],
 ['zebra kenbaar willen oversteken',{pedestrianIntent:true},'voorrang'],
 ['rood voetgangerslicht uitzondering',{pedestrianIntent:true,pedestrianLight:'rood'},'doorgaan'],
 ['bijzondere manoeuvre laat overige verkeer voor',{movement:'wegrijden',conflicting:true},'voorrang'],
 ['wegrijden zonder verkeer',{movement:'wegrijden'},'doorgaan'],
 ['onbekend valt terug zonder juridische conclusie',{known:false,otherFromRight:true,conflicting:true},'onzeker']
];
describe('RVV expliciete feiten en uitzonderingen',()=>{
 it.each(cases)('%s',(_title,facts,action)=>expect(decideTraffic({...BASE_FACTS,...facts}).action).toBe(action));
 it('alle zes situaties hebben bronversie, artikel en open menselijke review',()=>{expect(Object.keys(SCENARIOS)).toHaveLength(6);for(const d of Object.values(SCENARIOS))for(const id of d.rules){expect(RULES[id].article).toContain('RVV');expect(RULES[id].version).toBe('2026-07-01');expect(RULES[id].reviewedByHuman).toBe(false);expect(RULES[id].source).toContain('wetten.overheid.nl');}});
});
function crossing(id:ScenarioId,other:boolean){const sim=new Simulation();sim.selectScenario(id);sim.state.vehicle={...sim.state.vehicle,z:SCENARIOS[id].gateZ+1.6,speed:8};if(!other)sim.state.actors=[];else if(id==='rechts'||id==='haaientanden'){
 const a=sim.state.actors[0],from=id==='rechts'?3:-1,z=id==='rechts'?-1.55:1.55,end=id==='rechts'?-22:22;sim.state.actors=[{...a,x:from,z,speed:5,route:[{x:from,z},{x:end,z}],progress:0,heading:id==='rechts'?-Math.PI/2:Math.PI/2}];}
 sim.start();sim.step();return sim;
}
describe('Scenario-integratie en uitlegbare bewijzen',()=>{
 it.each(['rechts','haaientanden','zebra'] as const)('%s: gevaarlijke passage krijgt feiten, artikel en alternatief',id=>{const sim=crossing(id,true);const event=sim.state.scenario!.events.find(e=>e.code==='GIVE_WAY');expect(event).toBeDefined();expect(event!.category).toBe('regel');expect(event!.facts.length).toBeGreaterThan(2);expect(event!.alternative.length).toBeGreaterThan(15);expect(event!.ruleIds.length).toBeGreaterThan(0);});
 it.each(['rechts','haaientanden','zebra'] as const)('%s: vrije passage zonder verkeer krijgt geen voorrangsafwijking',id=>{const sim=crossing(id,false);expect(sim.state.scenario!.events.some(e=>e.code==='GIVE_WAY')).toBe(false);expect(sim.state.scenario!.events.some(e=>e.code==='CLEAR_PASSAGE')).toBe(true);});
 it('rood beoordeelt daadwerkelijk passeren van de stopstreep',()=>{const sim=crossing('lichten',false);expect(sim.state.scenario!.events.find(e=>e.code==='GIVE_WAY')!.ruleIds).toContain('RED');});
 it('groen levert geen rode-lichtmelding',()=>{const sim=new Simulation();sim.selectScenario('lichten');sim.state.clock=10;sim.state.light='groen';sim.state.actors=[];sim.state.vehicle.z=7.6;sim.state.vehicle.speed=8;sim.start();sim.step();expect(sim.state.scenario!.events.some(e=>e.code==='GIVE_WAY')).toBe(false);});
 it('geen dubbele beoordeling per gebeurtenis',()=>{const sim=crossing('lichten',false);for(let i=0;i<120;i++)sim.step();expect(sim.state.scenario!.events.filter(e=>e.code==='GIVE_WAY')).toHaveLength(1);});
 it('bij geel is de remmodelconclusie alleen advies',()=>{const sim=new Simulation();sim.selectScenario('lichten');sim.state.light='oranje';sim.state.clock=19;sim.state.scenario!.yellowAt={distance:10,speed:3,canStop:true};sim.state.vehicle.z=7.6;sim.state.vehicle.speed=8;sim.state.actors=[];sim.start();sim.step();expect(sim.state.scenario!.events.find(e=>e.code==='GIVE_WAY')!.category).toBe('advies');});
 it('rechts afslaan door fietspad van naastgelegen fietser wordt herkend',()=>{const sim=new Simulation();sim.selectScenario('fietser');sim.state.vehicle={x:2.34,z:2,heading:1,speed:4,steering:0};const a=sim.state.actors[0];sim.state.actors=[{...a,x:3.2,z:3,speed:4,route:[{x:3.2,z:3},{x:3.2,z:-24}],progress:0}];sim.state.indicator='rechts';sim.start();sim.step();expect(sim.state.scenario!.events.find(e=>e.code==='GIVE_WAY')!.ruleIds).toContain('TURN');});
 it('wegrijden kruist verkeer achter de auto en bewaakt richtingaanwijzer',()=>{const sim=new Simulation();sim.selectScenario('wegrijden');sim.state.vehicle={x:5.30,z:20,heading:-.35,speed:2,steering:0};sim.start();sim.step();expect(sim.state.scenario!.events.find(e=>e.code==='GIVE_WAY')!.ruleIds).toContain('MANOEUVRE');});
 it('richtingaanwijzer ontbreekt bij beginnen wegrijden, maar niet bij correct teken',()=>{for(const signal of ['uit','links'] as const){const sim=new Simulation();sim.selectScenario('wegrijden');sim.state.indicator=signal;sim.start();sim.setInput({throttle:true});for(let i=0;i<10;i++)sim.step();expect(sim.state.scenario!.events.some(e=>e.code==='INDICATOR')).toBe(signal==='uit');}});
 it('fysiek contact wordt eenmaal als geometrische observatie gemeld',()=>{const sim=new Simulation();sim.selectScenario('rechts');const a=sim.state.actors[0],v=sim.state.vehicle;sim.state.actors=[{...a,x:v.x,z:v.z,route:[{x:v.x,z:v.z},{x:v.x,z:v.z-20}],speed:0}];sim.start();for(let i=0;i<5;i++)sim.step();const events=sim.state.scenario!.events.filter(e=>e.code.startsWith('CONTACT'));expect(events).toHaveLength(1);expect(events[0].category).toBe('advies');expect(sim.state.vehicle.speed).toBe(0);});
 it('stop en reset bewaren de geselecteerde situatie',()=>{const sim=new Simulation();sim.selectScenario('zebra');sim.start();sim.step();sim.stop();const old=structuredClone(sim.state);sim.step();expect(sim.state).toEqual(old);sim.reset();expect(sim.state.scenario!.id).toBe('zebra');expect(sim.state.clock).toBe(0);expect(sim.state.scenario!.events).toEqual([]);});
 it('een nieuw scenario mengt niet met het vorige schermsnapshot',()=>{const b=new SnapshotBuffer();b.accept({type:'snapshot',epoch:'a',seq:1,sentAt:1000,state:scenarioState('rechts'),calibration:DEFAULT_CALIBRATION});b.accept({type:'snapshot',epoch:'a',seq:2,sentAt:1050,state:scenarioState('zebra'),calibration:DEFAULT_CALIBRATION});expect(b.sample(1100)!.actors[0].kind).toBe('voetganger');expect(b.sample(1100)!.scenario!.id).toBe('zebra');});
});
describe('NPC-interacties en fysieke geometrie',()=>{
 it('parallelle rijstroken veroorzaken geen valse botsing',()=>{const v=scenarioState('rechts').vehicle;expect(overlapBodies({...v,x:-1.55,heading:Math.PI},{...v,x:1.55})).toBe(false);expect(overlapBodies(v,v)).toBe(true);});
 it('NPC stopt voor zijn rode kruislicht en rijdt weer bij groen',()=>{const sim=new Simulation();sim.selectScenario('lichten');sim.state.clock=10;sim.state.light='groen';sim.start();for(let i=0;i<360;i++)sim.step();expect(sim.state.actors[0].x).toBeLessThanOrEqual(-6);expect(sim.state.actors[0].speed).toBeLessThan(.3);sim.state.clock=21;sim.state.light='rood';for(let i=0;i<120;i++)sim.step();expect(sim.state.actors[0].x).toBeGreaterThan(-6);});
 it('voetganger wacht op gestopte auto en steekt daarna over',()=>{const sim=new Simulation();sim.selectScenario('zebra');sim.start();sim.state.vehicle.z=17;for(let i=0;i<600;i++)sim.step();expect(sim.state.actors[0].x).toBeLessThan(-4);expect(sim.state.scenario!.events.some(e=>e.code==='GIVE_WAY')).toBe(false);});
 it('fietser remt bij een voorspeld fysiek conflict',()=>{const sim=new Simulation();sim.selectScenario('fietser');sim.state.vehicle={x:3.2,z:13,heading:0,speed:0,steering:0};const a=sim.state.actors[0];sim.state.actors=[{...a,x:3.2,z:16,speed:3,route:[{x:3.2,z:16},{x:3.2,z:-24}]}];sim.start();sim.step();expect(sim.state.actors[0].mode).toBe('noodrem');expect(sim.state.actors[0].speed).toBeLessThan(3);});
 it.each(Object.keys(SCENARIOS) as ScenarioId[])('%s: reproduceerbare vaste stappen zonder negatieve of NaN-snelheid',id=>{const a=new Simulation(),b=new Simulation();for(const s of [a,b]){s.selectScenario(id);s.start();s.setInput({throttle:true});}for(let i=0;i<600;i++){a.step();b.step();}expect(a.state).toEqual(b.state);expect(Number.isFinite(a.state.vehicle.x)).toBe(true);for(const actor of a.state.actors){expect(Number.isFinite(actor.speed)).toBe(true);expect(actor.speed).toBeGreaterThanOrEqual(0);}expect(scenarioFacts(a.state,SCENARIOS[id]).known).toBe(true);});
});

it('groen en geel van het kruislicht zijn nooit tegelijk vrijgegeven met de hoofdrichting',async()=>{
 const {crossLight}=await import('../../src/traffic/scenarios');const {cycleLight}=await import('../../src/traffic/engine');
 for(let i=0;i<1260;i++){const t=i/60;if(crossLight(t)!=='rood')expect(cycleLight(t)).toBe('rood');if(cycleLight(t)!=='rood')expect(crossLight(t)).toBe('rood');}
 expect(crossLight(0)).toBe('rood');expect(crossLight(1)).toBe('groen');expect(crossLight(6)).toBe('oranje');expect(crossLight(8)).toBe('rood');
});
it('na een afgemaakte afslag ontstaat geen nieuwe ontbrekende-richtingmelding',()=>{
 const sim=new Simulation();sim.selectScenario('fietser');sim.state.vehicle={x:11,z:0,heading:Math.PI/2,speed:2,steering:0};sim.state.indicator='uit';sim.state.actors=[];sim.start();sim.step();expect(sim.state.scenario!.phase).toBe('afgerond');expect(sim.state.scenario!.events.some(e=>e.code==='INDICATOR')).toBe(false);
});
it('de A1-beoordeling wordt buiten het expliciete naderingswegvak niet doorgetrokken',()=>{
 const sim=new Simulation();sim.selectScenario('fietser');sim.state.vehicle={x:12,z:0,heading:Math.PI/2,speed:10,steering:0};sim.state.actors=[];sim.start();sim.step();expect(sim.state.scenario!.events.some(e=>e.code==='SPEED')).toBe(false);
});

it('feitelijke onderbouwing noemt geen verkeerslicht in een lichtloze situatie',()=>{
 const sim=crossing('rechts',true);const e=sim.state.scenario!.events.find(e=>e.code==='GIVE_WAY')!;expect(e.facts).toContain('geen verkeerslicht in deze situatie');expect(e.facts).not.toContain('licht rood');
});
it('rechtsaf bewaakt de richtingaanwijzer bij het begin van afslaan',()=>{
 for(const indicator of ['uit','rechts'] as const){const sim=new Simulation();sim.selectScenario('fietser');sim.state.vehicle={x:1.55,z:5,heading:.1998,speed:4,steering:.3};sim.state.indicator=indicator;sim.setInput({right:true});sim.start();sim.step();expect(sim.state.scenario!.events.some(e=>e.code==='INDICATOR')).toBe(indicator==='uit');}
});
it('de geparkeerde startauto staat volledig buiten de rijbaan',()=>{
 const v=scenarioState('wegrijden').vehicle;const edge=v.x-.8*Math.abs(Math.cos(v.heading))-1.58*Math.abs(Math.sin(v.heading));expect(edge).toBeGreaterThan(4);
});

function pilot(sim:Simulation,steer:'left'|'right'|'none'='none',speed=3){sim.setInput({throttle:sim.state.vehicle.speed<speed,brake:false,left:steer==='left',right:steer==='right'});sim.step();}
function until(sim:Simulation,condition:()=>boolean,steer:'left'|'right'|'none'='none',speed=3,limit=2400){for(let i=0;i<limit&&!condition();i++)pilot(sim,steer,speed);expect(condition()).toBe(true);}
function wait(sim:Simulation,seconds:number){sim.setInput({throttle:false,brake:true,left:false,right:false});for(let i=0;i<seconds*60;i++)sim.step();sim.setInput({brake:false});}
function expectClean(sim:Simulation){expect(sim.state.scenario!.phase).toBe('afgerond');expect(sim.state.scenario!.events.filter(e=>e.category==='regel')).toEqual([]);expect(sim.state.scenario!.events.some(e=>e.code.startsWith('CONTACT'))).toBe(false);}
describe('Zes volledig gereden correcte oefenritten met echte voertuigfysica',()=>{
 it.each(['rechts','haaientanden','lichten','zebra'] as const)('%s: naderen, stoppen, verkeer laten passeren, verder rijden en afronden',id=>{
  const sim=new Simulation();sim.selectScenario(id);sim.start();until(sim,()=>sim.state.vehicle.z<19.2);wait(sim,8);
  until(sim,()=>sim.state.scenario!.phase==='afgerond','none',4);expectClean(sim);
 });
 it('fietser: wachten, rechts richting aangeven en een fysieke bocht rijden',()=>{
  const sim=new Simulation();sim.selectScenario('fietser');sim.start();wait(sim,8);sim.state.indicator='rechts';until(sim,()=>sim.state.vehicle.z<6.5,'none',2);
  until(sim,()=>sim.state.vehicle.heading>Math.PI/2-.08,'right',2);
  until(sim,()=>Math.abs(sim.state.vehicle.steering)<.001,'none',2);
  until(sim,()=>sim.state.scenario!.phase==='afgerond','none',2);expectClean(sim);
 });
 it('wegrijden: achteropkomende auto laten passeren, links teken geven en invoegen',()=>{
  const sim=new Simulation();sim.selectScenario('wegrijden');sim.start();wait(sim,8);sim.state.indicator='links';until(sim,()=>sim.state.vehicle.heading<-.3,'left',2);
  until(sim,()=>Math.abs(sim.state.vehicle.steering)<.001,'none',2);until(sim,()=>sim.state.vehicle.x<2.7,'none',2);
  until(sim,()=>sim.state.vehicle.heading>-.04,'right',2);until(sim,()=>Math.abs(sim.state.vehicle.steering)<.001,'none',2);
  until(sim,()=>sim.state.scenario!.phase==='afgerond','none',2);expectClean(sim);
 });
});
it('een eenmaal afgeronde situatie blijft afgerond bij verder rijden',()=>{
 const sim=new Simulation();sim.selectScenario('fietser');sim.state.actors=[];sim.state.vehicle={x:11,z:0,heading:Math.PI/2,speed:2,steering:0};sim.start();sim.step();expect(sim.state.scenario!.phase).toBe('afgerond');sim.state.vehicle.z=8;sim.step();expect(sim.state.scenario!.phase).toBe('afgerond');expect(sim.state.scenario!.events.filter(e=>e.code==='COMPLETE')).toHaveLength(1);
});
