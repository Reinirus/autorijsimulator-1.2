import type {WorldState,Actor,LightState} from '../core/state';
export const cycleLight=(time:number):LightState=>time%21<9?'rood':time%21<18?'groen':'oranje';
export function moveActors(actors:Actor[],dt:number):Actor[]{return actors.map(a=>({...a,x:a.x+Math.sin(a.heading)*a.speed*dt,z:a.z-Math.cos(a.heading)*a.speed*dt}));}
export function advanceTraffic(state:WorldState,dt:number):Pick<WorldState,'actors'|'light'>{return {actors:moveActors(state.actors,dt),light:cycleLight(state.clock)};}
