import type {MissionRoute,RoutePoint} from './route';
// Route proposals only: deliberately not registered in ROUTES or exposed as playable.
// Topology, traffic coverage and full Chromium journeys must pass before promotion.
const point=(x:number,z:number,instruction:string,stop=false):RoutePoint=>({x,z,instruction,stop,radius:stop?1:2});
const straight=(id:number,scenarios:('rechts'|'haaientanden'|'lichten'|'zebra')[]):MissionRoute=>({id,encounters:scenarios.map((scenario,i)=>({id:`m${id}-encounter-${i+1}`,scenario,z:-70*i})),points:[...scenarios.map((_,i)=>point(1.55,-70*i-25,'Volg de weg; controleer het volgende verkeersmoment.')),point(1.55,-70*(scenarios.length-1)-40,'Stop in het eindvak.',true)]});
export const DEVELOPMENT_ROUTES:Readonly<Record<number,MissionRoute>>={
 3:straight(3,['rechts','zebra','rechts']),
 4:straight(4,['rechts','haaientanden','rechts','haaientanden']),
 5:straight(5,['lichten','zebra','lichten']),
 6:{id:6,encounters:[{id:'m6-fietser',scenario:'fietser',z:0}],points:[point(1.55,5,'Laat de fietser passeren. Geef rechts richting aan.'),point(5,1.55,'Volg de bocht rechtsaf.'),point(15,1.55,'Rijd rustig door.'),point(25,1.55,'Stop; bespreek spiegels en dode hoek.',true)]},
 7:{id:7,encounters:[],points:[point(1.55,5,'Nader de rotonde.'),...Array.from({length:12},(_,i)=>{const a=(i+1)*Math.PI/8;return point(12*Math.cos(a),-20+12*Math.sin(a),'Volg de voorgestelde rijstrook.');}),point(-25,-20,'Verlaat de rotonde en stop.',true)]},
 8:{id:8,encounters:[],points:[point(1.55,5,'Rijd naar de buitenweg.'),point(5,-20,'Pas je snelheid aan voor de bocht.'),point(12,-45,'Volg de bocht.'),point(4,-70,'Houd afstand tot de voorganger.'),point(1.55,-95,'Stop in het eindvak.',true)]},
 9:{id:9,encounters:[],points:[point(5,5,'Volg de toerit.'),point(6,-20,'Pas je snelheid aan.'),point(2,-45,'Voeg alleen in bij voldoende ruimte.'),point(2,-95,'Houd afstand.'),point(6,-120,'Volg de afrit.'),point(8,-145,'Rem en stop in het eindvak.',true)]},
 10:straight(10,['rechts','lichten','haaientanden','zebra','rechts'])
};
export type Lane={id:string;center:ReadonlyArray<{x:number;z:number}>;successors:readonly string[];width:number};
export function validateLanes(lanes:readonly Lane[]):string[]{const ids=new Set(lanes.map(l=>l.id)),errors:string[]=[];if(ids.size!==lanes.length)errors.push('Dubbele rijstrook-ID');for(const lane of lanes){if(lane.center.length<2||!Number.isFinite(lane.width)||lane.width<=0||lane.center.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.z)))errors.push(`Ongeldige geometrie: ${lane.id}`);for(const next of lane.successors)if(!ids.has(next))errors.push(`Ontbrekende aansluiting: ${lane.id} -> ${next}`);}return errors;}
