import type {Encounter} from './route';
import type {WorldState,Actor,VehicleState} from '../core/state';
import {SCENARIOS} from '../scenarios/catalog';
import {scenarioState} from '../scenarios/runtime';
import type {ScenarioDefinition,Point} from '../scenarios/model';
export function definitionFor(e:Encounter):ScenarioDefinition {
 const base=SCENARIOS[e.scenario];let def={...base,actor:{...base.actor,kind:e.actorKind??base.actor.kind,route:base.actor.route.map(p=>({...p}))}};
 if(e.actorKind==='fietser')def.instruction=def.instruction.replaceAll('de auto','de fietser');
 if(e.signalPedestrian)def={...def,title:'Geregelde voetgangersoversteek',objective:'Stop voor rood en laat de oversteek vrij.',instruction:'Let op het autolicht én de voetganger. Stop vóór de stopstreep bij rood en beoordeel geel op de werkelijke stopmogelijkheid. Rijd bij groen alleen door als de oversteek vrij is.',gateZ:14,zebra:true,rules:['RED','SIGNAL_PRIORITY','PEDESTRIAN'],actor:{id:e.id+'-voetganger',kind:'voetganger',speed:1.4,route:[{x:4.6,z:10},{x:-5,z:10}]}};
 if(e.signalWithYield)def={...def,title:'Verkeerslicht met B6',sign:'B6',rules:['RED','SIGNAL_PRIORITY','YIELD_SIGN'],instruction:'Volg het werkende verkeerslicht; dit regelt de voorrang boven B6. Blijf controleren of de kruising vrij is.'};
 if(e.hazardSeed!==undefined)def={...def,title:'Onverwachte voetganger bij beperkt zicht',objective:'Anticipeer op een voetganger achter de geparkeerde bestelbus.',instruction:'Nader de bestelbus langzaam en wees klaar om te remmen. Een voetganger kan onverwacht de weg oplopen. De reactie wordt als veiligheidsobservatie geregistreerd, niet als automatische juridische schuld.',zebra:false,signal:false,rules:[],actor:{id:e.id+'-voetganger',kind:'voetganger',speed:1.4,route:[{x:4.6,z:10},{x:-5,z:10}]}};
 return def;
}
export function hazardRevealZ(seed:number):number{return 26+((Math.imul(seed,1664525)+1013904223)>>>0)%3;}
export function worldPoint(e:Encounter,p:Point):Point {const h=e.heading??0,c=Math.cos(h),s=Math.sin(h);return {x:(e.x??0)+c*p.x-s*p.z,z:e.z+s*p.x+c*p.z};}
export function localPoint(e:Encounter,p:Point):Point {const h=e.heading??0,c=Math.cos(h),s=Math.sin(h),x=p.x-(e.x??0),z=p.z-e.z;return {x:c*x+s*z,z:-s*x+c*z};}
function transform(state:WorldState,e:Encounter,world:boolean):WorldState {
 const point=world?worldPoint:localPoint,h=(world?1:-1)*(e.heading??0),pose=<T extends VehicleState|Actor>(a:T):T=>({...a,...point(e,a),heading:a.heading+h});
 return {...state,vehicle:pose(state.vehicle),actors:state.actors.map(a=>({...pose(a),route:a.route?.map(p=>point(e,p))}))};
}
export const toWorld=(s:WorldState,e:Encounter)=>transform(s,e,true);
export const toLocal=(s:WorldState,e:Encounter)=>transform(s,e,false);
export function createEncounter(e:Encounter):WorldState {const s=scenarioState(e.scenario),def=definitionFor(e),route=def.actor.route;return {...s,actors:[{id:def.actor.id,kind:def.actor.kind,route:structuredClone(route),progress:0,x:route[0].x,z:route[0].z,heading:Math.atan2(route[1].x-route[0].x,-(route[1].z-route[0].z)),speed:0,desiredSpeed:def.actor.speed,mode:'wachten'}]};}
