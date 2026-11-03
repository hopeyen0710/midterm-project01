import {Vector3} from 'three';

const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};

// 原模型沒有骨架。以原頂點做連續姿勢變形，分開處理足部、膝、髖、上身與裙腰。
// 不替換人物外觀；每次演出後精確還原原始頂點與位置。
export function createErinPose(actors){
  const point=new Vector3(),meshes=[];
  for(const actor of actors){actor.updateMatrixWorld(true);actor.traverse(mesh=>{
    if(!mesh.isMesh||!mesh.visible)return;
    mesh.geometry=mesh.geometry.clone();
    const positions=mesh.geometry.attributes.position,rest=new Float32Array(positions.array),world=new Float32Array(rest.length);
    for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);point.toArray(world,i*3);}
    meshes.push({mesh,positions,rest,world,inverse:mesh.matrixWorld.clone().invert(),gown:actor.name==='erin-gown'});
  });}
  return {
    apply(stand,lean){
      for(const {mesh,positions,world,inverse,gown} of meshes){
        for(let i=0;i<positions.count;i++){
          const x=world[i*3],y=world[i*3+1],z=world[i*3+2];
          const upper=smooth((y-2.35)/.7);
          const arm=gown?0:smooth((z+2.6)/.3)*smooth((y-2.35)/.15)*(1-smooth((y-2.9)/.3));
          // 坐姿的膝與髖幾乎等高，須同時以高度、前後位置區分；膝留低，髖升高前移。
          const hip=gown?smooth((y-1.5)/1.05):Math.max(smooth((y-1.7)/.7)*(y>2.55?1:1-smooth((z+2.75)/.6)),arm*.8);
          const forward=gown?0:.65*hip;
          point.set(x+Math.sign(x)*stand*arm*.28,y+stand*(.66*hip-.35*arm)-lean*.12*upper,z+stand*(forward-.3*arm)+lean*.36*upper);
          point.applyMatrix4(inverse);positions.setXYZ(i,point.x,point.y,point.z);
        }
        positions.needsUpdate=true;mesh.geometry.computeBoundingSphere();
      }
    },
    restore(){for(const {positions,rest,mesh} of meshes){positions.array.set(rest);positions.needsUpdate=true;mesh.geometry.computeBoundingSphere();}},
    measure(){let changed=0,maxDelta=0;for(const {positions,rest} of meshes)for(let i=0;i<rest.length;i++){const delta=Math.abs(positions.array[i]-rest[i]);if(delta>1e-5)changed++;maxDelta=Math.max(maxDelta,delta);}return {changedCoordinates:changed,maxDelta};},
  };
}
