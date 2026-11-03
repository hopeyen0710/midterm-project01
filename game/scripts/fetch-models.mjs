import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const destination=fileURLToPath(new URL('../assets/models/',import.meta.url));
await mkdir(destination,{recursive:true});
async function get(url,json=false){const r=await fetch(url);if(!r.ok)throw Error(`${r.status} ${url}`);return json?r.json():Buffer.from(await r.arrayBuffer());}
const catalogue=await get('https://api.polyhaven.com/assets?t=models',true);
const picks=[['ArmChair_01','2k'],['WoodenChair_01','1k'],['GothicCabinet_01','2k'],['ClassicConsole_01','2k'],['Chandelier_03','1k'],['fancy_picture_frame_02','2k'],['gothic_statue','1k'],['lion_head','1k'],['brass_candleholders','1k'],['vintage_grandfather_clock_01','2k'],['antique_ceramic_vase_01','1k']];
const credits=[];
function pack(document,resources){
  const chunks=[];let length=0;
  function append(buffer){const offset=length;chunks.push(buffer);length+=buffer.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}return offset;}
  const starts=document.buffers.map(buffer=>append(resources.get(buffer.uri)));
  for(const view of document.bufferViews||[]){view.byteOffset=(view.byteOffset||0)+starts[view.buffer];view.buffer=0;}
  document.bufferViews ||= [];
  for(const img of document.images||[]){
    if(!img.uri)continue;const bytes=resources.get(img.uri);const offset=append(bytes);
    img.bufferView=document.bufferViews.length;document.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length});
    img.mimeType=/\.png$/i.test(img.uri)?'image/png':'image/jpeg';delete img.uri;
  }
  document.buffers=[{byteLength:length}];
  const raw=Buffer.from(JSON.stringify(document)),json=Buffer.alloc(Math.ceil(raw.length/4)*4,32);raw.copy(json);
  const bin=Buffer.concat(chunks),out=Buffer.alloc(12+8+json.length+8+bin.length);
  out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
  out.writeUInt32LE(json.length,12);out.writeUInt32LE(0x4e4f534a,16);json.copy(out,20);
  out.writeUInt32LE(bin.length,20+json.length);out.writeUInt32LE(0x004e4942,24+json.length);bin.copy(out,28+json.length);return out;
}
for(const [id,resolution] of picks){
  if(!catalogue[id]){console.log('NOT FOUND '+id);continue;}
  const output=path.join(destination,id+'.glb');let bytes;
  try{bytes=await readFile(output);}catch{
    const files=await get('https://api.polyhaven.com/files/'+id,true);
    const gltf=files.gltf?.[resolution]?.gltf||files.gltf?.['1k']?.gltf;
    if(!gltf)throw Error('Missing glTF '+id);
    const doc=await get(gltf.url,true),resources=new Map();
    for(const [name,file] of Object.entries(gltf.include))resources.set(name,await get(file.url));
    bytes=pack(doc,resources);await writeFile(output,bytes);
  }
  credits.push({id,name:catalogue[id].name,authors:Object.keys(catalogue[id].authors),source:'https://polyhaven.com/a/'+id,license:'CC0-1.0',resolution,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),triangles:catalogue[id].polycount});
  console.log(`SAVED ${id} ${(bytes.length/1048576).toFixed(2)} MB`);
}
const pianoURL='https://files.innerscene.com/library/grand-piano-open-lid-b0c88240/ecfa815e672e6eb2d9bf/grand-piano-open-lid.glb';
const pianoPath=path.join(destination,'grand-piano.glb');let piano;
try{piano=await readFile(pianoPath);}catch{piano=await get(pianoURL);await writeFile(pianoPath,piano);}
credits.push({id:'grand-piano',name:'Grand piano - open lid',authors:['Innerscene'],source:'https://www.innerscene.com/tools/library/3d-parts/grand-piano-open-lid-b0c88240',license:'CC0-1.0',bytes:piano.length,sha256:createHash('sha256').update(piano).digest('hex')});
for(const [id,slug,authors] of [
  ['seated-woman','taylor-3d-person-woman-seated-on-chair-b792e2dc',['Innerscene','MakeHuman/MPFB']],
  ['mannequin','standing-mannequin-original-retail-fixture-84ea17f0',['Innerscene']],
]){
  const output=path.join(destination,id+'.glb');let bytes;
  try{bytes=await readFile(output);}catch{bytes=await get('https://www.innerscene.com/api/library/'+slug+'/download');await writeFile(output,bytes);}
  credits.push({id,name:id,authors,source:'https://www.innerscene.com/tools/library/3d-parts/'+slug,license:'CC0-1.0',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
  console.log(`SAVED ${id} ${(bytes.length/1048576).toFixed(2)} MB`);
}
await writeFile(path.join(destination,'sources.json'),JSON.stringify({retrievedAt:new Date().toISOString(),assets:credits},null,2));
console.log(`COMPLETE ${credits.length} models`);
