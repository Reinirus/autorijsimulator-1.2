export type Side='links'|'midden'|'rechts';
export type DisplayMode='single'|'span'|'windows';
export interface Calibration {leftAngle:number;rightAngle:number;fov:number;horizon:number;layout:'equal'|'center';bezel:number;pixelRatio:number;guides:boolean}
export const DEFAULT_CALIBRATION:Calibration={leftAngle:55,rightAngle:55,fov:72,horizon:0,layout:'equal',bezel:0,pixelRatio:1,guides:false};
export function calibrate(value:Partial<Calibration>):Calibration {
 const c={...DEFAULT_CALIBRATION,...value};
 const clamp=(n:number,min:number,max:number,fallback:number)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
 return {leftAngle:clamp(c.leftAngle,20,100,55),rightAngle:clamp(c.rightAngle,20,100,55),fov:clamp(c.fov,30,110,72),horizon:clamp(c.horizon,-20,20,0),layout:c.layout==='center'?'center':'equal',bezel:clamp(c.bezel,0,40,0),pixelRatio:clamp(c.pixelRatio,.5,1.5,1),guides:!!c.guides};
}
export const yawOffset=(side:Side,c:Calibration)=>(side==='links'?c.leftAngle:side==='rechts'?-c.rightAngle:0)*Math.PI/180;
export function panels(width:number,c:Calibration):{side:Side;x:number;width:number}[]{
 const a=Math.floor(width*(c.layout==='center'?.25:1/3)),b=width-2*a;
 return [{side:'links',x:0,width:a},{side:'midden',x:a,width:b},{side:'rechts',x:a+b,width:a}];
}
export class FrameMetrics {
 private since=0;private frames=0;private cost=0;fps=0;renderMs=0;
 record(now:number,cost:number){if(!this.since)this.since=now;this.frames++;this.cost+=cost;if(now-this.since>=1000){this.fps=this.frames*1000/(now-this.since);this.renderMs=this.cost/this.frames;this.frames=0;this.cost=0;this.since=now;}}
}
