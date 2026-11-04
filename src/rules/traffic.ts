import type {LightState} from '../core/state';
export interface TrafficFacts {
 known:boolean;signalActive:boolean;light:LightState;yellowCanStop:boolean|null;
 movement:'rechtdoor'|'rechtsaf'|'wegrijden';conflicting:boolean;
 otherFromRight:boolean;egoUnpaved:boolean;otherUnpaved:boolean;otherTram:boolean;
 sign:'geen'|'B6'|'B1';pedestrianIntent:boolean;pedestrianLight:'geen'|'rood'|'groen';sameRoadCyclist:boolean;
}
export interface Decision {action:'stop'|'voorrang'|'doorgaan'|'onzeker';ruleIds:string[];reason:string}
export const BASE_FACTS:TrafficFacts={known:true,signalActive:false,light:'groen',yellowCanStop:null,movement:'rechtdoor',conflicting:false,otherFromRight:false,egoUnpaved:false,otherUnpaved:false,otherTram:false,sign:'geen',pedestrianIntent:false,pedestrianLight:'geen',sameRoadCyclist:false};
// Legal applicability is separate from geometric conflict detection and NPC control.
export function decideTraffic(f:TrafficFacts):Decision {
 const d=(action:Decision['action'],ruleIds:string[],reason:string):Decision=>({action,ruleIds,reason});
 if(!f.known)return d('onzeker',[],'De situatie valt buiten het ondersteunde model. Geen automatische juridische beoordeling.');
 if(f.signalActive&&f.light==='rood')return d('stop',['RED'],'Rood: stop vóór de bestemde stopstreep.');
 if(f.signalActive&&f.light==='oranje'){
  if(f.yellowCanStop===null)return d('onzeker',['RED'],'Geel: of stoppen redelijkerwijs mogelijk was, is onvoldoende vastgesteld.');
  if(f.yellowCanStop)return d('stop',['RED'],'Geel: het model stelt vast dat stoppen nog mogelijk is.');
 }
 if(f.movement==='wegrijden'&&f.conflicting)return d('voorrang',['MANOEUVRE'],'Bij wegrijden laat je het overige verkeer voor.');
 if(f.movement==='rechtsaf'&&f.sameRoadCyclist&&f.conflicting)return d('voorrang',['TURN'],'Bij afslaan laat je de rechtdoorgaande fietser op dezelfde weg voor.');
 if(f.pedestrianIntent&&f.pedestrianLight!=='rood')return d('voorrang',['PEDESTRIAN'],'Deze voetganger steekt op de zebra over of staat kennelijk op het punt dat te doen.');
 if(!f.signalActive&&f.conflicting){
  if(f.sign==='B6')return d('voorrang',['YIELD_SIGN'],'B6 / haaientanden: geef bestuurders op de kruisende weg voorrang, ook van links.');
  if(f.sign==='geen'){
   const yieldRequired=f.otherTram||(f.egoUnpaved&&!f.otherUnpaved)||(!f.otherUnpaved&&f.otherFromRight)||(f.egoUnpaved===f.otherUnpaved&&f.otherFromRight);
   if(yieldRequired)return d('voorrang',['PRIORITY'],'Gelijkwaardig kruispunt: verkeer van rechts, met de uitzonderingen voor onverhard/verhard en tram.');
  }
 }
 return d('doorgaan',f.signalActive?['RED','SIGNAL_PRIORITY']:[],'Geen stop- of voorrangsplicht vastgesteld binnen deze afgebakende situatie; blijf controleren of de weg vrij is.');
}
