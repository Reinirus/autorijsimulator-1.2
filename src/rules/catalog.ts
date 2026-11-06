export type Rule={id:string;article:string;source:string;version:string;reviewedByHuman:boolean;status:'bron-gecontroleerd'|'te-controleren';summary:string;checkedAt?:string};
export const RVV='https://wetten.overheid.nl/BWBR0004825/2026-07-01/0';
export const RULES:Record<string,Rule>={
 RIGHT:{id:'RIGHT',article:'RVV 1990 artikel 3 lid 1',source:RVV,version:'2026-07-01',reviewedByHuman:false,status:'bron-gecontroleerd',summary:'Bestuurders houden zoveel mogelijk rechts.'},
 PRIORITY:{id:'PRIORITY',article:'RVV 1990 artikel 15',source:RVV,version:'2026-07-01',reviewedByHuman:false,status:'bron-gecontroleerd',summary:'Op een gelijkwaardig kruispunt verleen je in beginsel voorrang aan bestuurders van rechts; wettelijke uitzonderingen gelden.'},
 RED:{id:'RED',article:'RVV 1990 artikel 68 lid 1 en artikel 79',source:RVV,version:'2026-07-01',checkedAt:'2026-11-04',reviewedByHuman:false,status:'bron-gecontroleerd',summary:'Rood betekent stoppen; geel betekent stoppen tenzij dat redelijkerwijs niet meer mogelijk is. Stop vóór de bestemde stopstreep.'},
 SPEED:{id:'SPEED',article:'RVV 1990 artikelen 62, 63 en bijlage 1 bord A1',source:RVV,version:'2026-07-01',reviewedByHuman:false,status:'te-controleren',summary:'In deze oefensituatie geldt bord A1 met 30 km/u; een A1-bord is geen zonebord.'}
};
const verified=(id:string,article:string,summary:string):Rule=>({id,article,summary,source:RVV,version:'2026-07-01',checkedAt:'2026-11-04',reviewedByHuman:false,status:'bron-gecontroleerd'});
Object.assign(RULES,{
 YIELD_SIGN:verified('YIELD_SIGN','RVV 1990 artikelen 62, 63, 80 en bijlage 1 B6','Bij B6 en haaientanden moeten bestuurders voorrang verlenen aan bestuurders op de kruisende weg.'),
 SIGNAL_PRIORITY:verified('SIGNAL_PRIORITY','RVV 1990 artikel 64','Verkeerslichten gaan boven verkeerstekens die de voorrang regelen.'),
 TURN:verified('TURN','RVV 1990 artikel 18 lid 1 en lid 3','Afslaande bestuurders laten verkeer op dezelfde weg naast, dicht achter en tegemoet voor; de trambestuurder is uitgezonderd.'),
 PEDESTRIAN:verified('PEDESTRIAN','RVV 1990 artikel 49 leden 2–4','Laat voetgangers op of kennelijk op het punt van oversteken bij de zebra voor; wettelijke uitzonderingen gelden.'),
 MANOEUVRE:verified('MANOEUVRE','RVV 1990 artikel 54','Bij een bijzondere manoeuvre zoals wegrijden laat de bestuurder het overige verkeer voor.'),
 INDICATOR:verified('INDICATOR','RVV 1990 artikel 55','Bij wegrijden en belangrijke zijdelingse verplaatsingen geeft een automobilist richting aan.'),
 TURN_SIGNAL:verified('TURN_SIGNAL','RVV 1990 artikel 17 lid 2','Een bestuurder geeft richting aan wanneer hij wil afslaan.')
});
for(const rule of Object.values(RULES)){rule.checkedAt='2026-11-04';rule.status='bron-gecontroleerd';}
// Legacy M1 demonstration API; M3 uses decideTraffic with explicit facts and exceptions.
export type JunctionCase={type:'gelijkwaardig'|'voorrangsbord'|'verkeerslicht';fromRight:boolean;signRequiresYield:boolean;light:'rood'|'oranje'|'groen';};
export type RightOfWay={yieldRequired:boolean;reason:string;sourceRule:string|null;automatable:boolean};
export function rightOfWay(c:JunctionCase):RightOfWay {
 if(c.type==='verkeerslicht') return {yieldRequired:false,reason:'Verkeerslichten regelen de doorgang; afzonderlijke stopbeoordeling vereist.',sourceRule:'RED',automatable:false};
 if(c.type==='voorrangsbord') return {yieldRequired:c.signRequiresYield,reason:'Borden regelen voorrang; uitsluitend voor dit expliciete scenario.',sourceRule:'PRIORITY',automatable:false};
 return {yieldRequired:c.fromRight,reason:'Gelijkwaardig kruispunt: bestuurder van rechts; uitzonderingen niet gemodelleerd.',sourceRule:'PRIORITY',automatable:true};
}

Object.assign(RULES,{VISIBILITY:{id:'VISIBILITY',article:'RVV 1990 artikel 19',source:RVV,version:'2026-07-01',checkedAt:'2026-11-05',reviewedByHuman:false,status:'bron-gecontroleerd',summary:'Kunnen stoppen binnen de overzienbare en vrije afstand. Een modelwaarschuwing bewijst dit niet voor een echte rit.'},ROUND_DIRECTION:{id:'ROUND_DIRECTION',article:'RVV 1990 artikel 62 en bijlage 1 D1',source:RVV,version:'2026-07-01',checkedAt:'2026-11-05',reviewedByHuman:false,status:'bron-gecontroleerd',summary:'D1 geeft de verplichte rijrichting aan; voorrang volgt afzonderlijk uit aanwezige borden en markeringen.'}});
