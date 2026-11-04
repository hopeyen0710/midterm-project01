import atlasURL from './assets/royal-atlas.png';
import {stage3Script} from './stage3-data.js';
let pending;
export function loadPortraitArt(){
 if(!pending)pending=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{try{const images={};for(const p of stage3Script.portraits){const c=document.createElement('canvas');c.width=512;c.height=812;const ctx=c.getContext('2d');ctx.drawImage(image,(p.cell%3)*image.width/3,Math.floor(p.cell/3)*image.height/2,image.width/3,image.height/2,0,0,c.width,c.height);images[p.id]=c.toDataURL('image/jpeg',.92);}resolve(images);}catch(e){reject(e);}};image.onerror=()=>{pending=null;reject(Error('畫像載入失敗'));};image.src=atlasURL;});return pending;
}
