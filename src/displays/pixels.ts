// Copy whole RGBA pixels; reverse both axes for the WebGL readback/mirror convention.
export function copyMirrorPixels(source:Uint8Array,target:Uint8ClampedArray,width:number,height:number):void {
 const input=new Uint32Array(source.buffer,source.byteOffset,width*height);
 const output=new Uint32Array(target.buffer,target.byteOffset,width*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)output[y*width+x]=input[(height-1-y)*width+(width-1-x)];
}
