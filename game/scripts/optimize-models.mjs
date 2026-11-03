import {readFile,writeFile,mkdir}from'node:fs/promises';
import {createRequire}from'node:module';
import {createHash}from'node:crypto';
import {fileURLToPath}from'node:url';
import path from'node:path';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE_PATH||'C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=fileURLToPath(new URL('../assets/models/',import.meta.url)),out=path.join(root,'runtime');await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile(path.join(root,'sources.json'),'utf8'));
for(const asset of manifest.assets){
  const data=await readFile(path.join(root,asset.id+'.glb')),jsonLength=data.readUInt32LE(12),doc=JSON.parse(data.subarray(20,20+jsonLength));
  const binary=data.subarray(28+jsonLength),chunks=[];let length=0;
  function push(bytes){const offset=length;chunks.push(bytes);length+=bytes.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}return offset;}
  const imageViews=new Map((doc.images||[]).map(image=>[image.bufferView,image]));
  for(let i=0;i<(doc.bufferViews||[]).length;i++){
    const view=doc.bufferViews[i];let bytes=binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
    if(imageViews.has(i)){
      const image=imageViews.get(i),size=asset.id==='seated-woman'?2048:1024;
      const processing=sharp(bytes).resize({width:size,height:size,fit:'inside',withoutEnlargement:true});
      const opaque=(await sharp(bytes).stats()).isOpaque;
      bytes=await(!opaque?processing.png({compressionLevel:9}):processing.removeAlpha().jpeg({quality:84,mozjpeg:true})).toBuffer();
      image.mimeType=opaque?'image/jpeg':'image/png';
    }
    view.byteOffset=push(bytes);view.byteLength=bytes.length;
  }
  for(const image of doc.images||[]){
    if(!image.uri?.startsWith('data:'))continue;
    const original=Buffer.from(image.uri.slice(image.uri.indexOf(',')+1),'base64');
    const processor=sharp(original).resize({width:asset.id==='seated-woman'?2048:1024,height:asset.id==='seated-woman'?2048:1024,fit:'inside',withoutEnlargement:true});
    const meta=await sharp(original).metadata();
    const bytes=await(meta.hasAlpha?processor.png({compressionLevel:9}):processor.jpeg({quality:84,mozjpeg:true})).toBuffer();
    image.mimeType=meta.hasAlpha?'image/png':'image/jpeg';image.bufferView=doc.bufferViews.length;
    doc.bufferViews.push({buffer:0,byteOffset:push(bytes),byteLength:bytes.length});delete image.uri;
  }
  doc.buffers=[{byteLength:length}];const raw=Buffer.from(JSON.stringify(doc)),json=Buffer.alloc(Math.ceil(raw.length/4)*4,32);raw.copy(json);const bin=Buffer.concat(chunks),result=Buffer.alloc(28+json.length+bin.length);
  result.writeUInt32LE(0x46546c67,0);result.writeUInt32LE(2,4);result.writeUInt32LE(result.length,8);result.writeUInt32LE(json.length,12);result.writeUInt32LE(0x4e4f534a,16);json.copy(result,20);result.writeUInt32LE(bin.length,20+json.length);result.writeUInt32LE(0x004e4942,24+json.length);bin.copy(result,28+json.length);
  await writeFile(path.join(out,asset.id+'.glb'),result);
  asset.runtime={bytes:result.length,sha256:createHash('sha256').update(result).digest('hex'),modifications:'Embedded texture images resized to 1k (woman: 2k); geometry retained.'};
  console.log(`${asset.id}: ${(data.length/1048576).toFixed(2)} -> ${(result.length/1048576).toFixed(2)} MB`);
}
await writeFile(path.join(root,'sources.json'),JSON.stringify(manifest,null,2));
