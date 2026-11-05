export type RuralFacts={known:boolean;speedKmh:number;signedLimit:number;headway:number|null;visibleDistance:number;modelStoppingDistance:number};
export function ruralFindings(f:RuralFacts):{code:string;category:'regel'|'advies';ruleIds:string[];message:string;advice:string}[]{
 if(!f.known)return [];
 const out:{code:string;category:'regel'|'advies';ruleIds:string[];message:string;advice:string}[]=[];
 if(f.speedKmh>f.signedLimit+1e-6)out.push({code:'SPEED',category:'regel',ruleIds:['SPEED'],message:`Snelheid boven de met A1 aangegeven ${f.signedLimit} km/u.`,advice:'Verlaag snelheid tot de beborde limiet en pas verder aan de omstandigheden aan.'});
 if(f.headway!==null&&f.headway<2)out.push({code:'HEADWAY',category:'advies',ruleIds:[],message:'Volgafstand korter dan het twee-secondenadvies.',advice:'Vergroot de volgafstand. Twee seconden is veiligheidsadvies, geen zelfstandige wettelijke norm.'});
 if(f.modelStoppingDistance>f.visibleDistance)out.push({code:'VISIBILITY',category:'advies',ruleIds:['VISIBILITY'],message:'De modelremweg is groter dan de ingestelde vrije zichtafstand.',advice:'Verminder snelheid vóór beperkt zicht. Dit is een modelwaarschuwing bij artikel 19, geen automatische juridische vaststelling.'});return out;
}
