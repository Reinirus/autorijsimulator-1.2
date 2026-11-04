export type Rule={id:string;article:string;source:string;version:string;reviewedByHuman:boolean;status:'bron-gecontroleerd'|'te-controleren';summary:string};
export const RVV='https://wetten.overheid.nl/BWBR0004825/2026-07-01/0';
export const RULES:Record<string,Rule>={
 RIGHT:{id:'RIGHT',article:'RVV 1990 artikel 3 lid 1',source:RVV,version:'2026-07-01',reviewedByHuman:false,status:'bron-gecontroleerd',summary:'Bestuurders houden zoveel mogelijk rechts.'},
 PRIORITY:{id:'PRIORITY',article:'RVV 1990 artikel 15',source:RVV,version:'2026-07-01',reviewedByHuman:false,status:'bron-gecontroleerd',summary:'Op een gelijkwaardig kruispunt verleen je in beginsel voorrang aan bestuurders van rechts; wettelijke uitzonderingen gelden.'},
 RED:{id:'RED',article:'RVV 1990 artikel 62 in samenhang met artikel 68',source:RVV,version:'2026-07-01',reviewedByHuman:false,status:'te-controleren',summary:'Een rood driekleurig verkeerslicht betekent stoppen.'},
 SPEED:{id:'SPEED',article:'RVV 1990 artikel 20 en bord A1 / zonebord',source:RVV,version:'2026-07-01',reviewedByHuman:false,status:'te-controleren',summary:'In dit specifiek beborde scenario bedraagt de maximumsnelheid 30 km/u.'}
};
export type JunctionCase={type:'gelijkwaardig'|'voorrangsbord'|'verkeerslicht';fromRight:boolean;signRequiresYield:boolean;light:'rood'|'oranje'|'groen';};
export type RightOfWay={yieldRequired:boolean;reason:string;sourceRule:string|null;automatable:boolean};
export function rightOfWay(c:JunctionCase):RightOfWay {
 if(c.type==='verkeerslicht') return {yieldRequired:false,reason:'Verkeerslichten regelen de doorgang; afzonderlijke stopbeoordeling vereist.',sourceRule:'RED',automatable:false};
 if(c.type==='voorrangsbord') return {yieldRequired:c.signRequiresYield,reason:'Borden regelen voorrang; uitsluitend voor dit expliciete scenario.',sourceRule:'PRIORITY',automatable:false};
 return {yieldRequired:c.fromRight,reason:'Gelijkwaardig kruispunt: bestuurder van rechts; uitzonderingen niet gemodelleerd.',sourceRule:'PRIORITY',automatable:true};
}
