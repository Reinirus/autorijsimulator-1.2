export type ScenarioId='rechts'|'haaientanden'|'lichten'|'fietser'|'zebra'|'wegrijden';
export type Movement='rechtdoor'|'rechtsaf'|'wegrijden';
export interface Point{x:number;z:number}
export interface ScenarioDefinition{
 id:ScenarioId;title:string;objective:string;instruction:string;movement:Movement;rules:string[];
 spawn:{x:number;z:number;heading:number};gateZ:number;signal:boolean;sign:'geen'|'B6';zebra:boolean;
 actor:{id:string;kind:'auto'|'fietser'|'voetganger';route:Point[];speed:number};
}
export interface TrafficEvidence {time:number;scenarioId:ScenarioId|'rotonde'|'buitenweg';encounterId?:string;code:string;category:'regel'|'advies'|'waarneming';ruleIds:string[];message:string;facts:string[];alternative:string}
export interface ScenarioRuntime {id:ScenarioId;phase:'naderen'|'wachten'|'oversteken'|'afgerond';events:TrafficEvidence[];decision:{action:'stop'|'voorrang'|'doorgaan'|'onzeker';ruleIds:string[];reason:string};crossLight?:'rood'|'oranje'|'groen';pedestrianLight?:'rood'|'groen';hazardTriggered?:boolean;description?:Pick<ScenarioDefinition,'title'|'instruction'|'objective'|'rules'>;startedActors:boolean;crossed:boolean;contacts:string[];yellowAt?:{canStop:boolean|null;speed:number;distance:number;stoppingDistance?:number;stopTime?:number;reason?:string}}
