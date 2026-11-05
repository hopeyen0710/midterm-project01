const fs=require('node:fs/promises'),path=require('node:path');
const {build}=require('../game/node_modules/esbuild');
exports.buildFixture=async function(output,{realScene=false}={}){
 const root=path.resolve(__dirname,'..');
 const tail=`
window.stage2Fixture={session,stage2,gameUI,reward,getViewer:()=>viewer,async prepare(mode='boundary'){
 ++openRequest;gameUI.close();session.reset();viewer?.dispose();viewer=null;
 if(mode!=='fresh'){
  for(const id of ['letterRead','respondIan','enterHall','erinRestricted'])session.completeEvent(id);
  session.recordIndoorEvent('secondRestriction');session.completeEvent('readCommand');session.recordIndoorEvent('pianoGuidance');session.choosePromise(0);
  if(mode!=='early'){
   for(const key of ['月亮','鳥','王冠','花'])session.appendPianoKey(key);
   for(const id of ['pianoPerformanceStarted','pianoPerformanceFinished','pianoAcknowledged','pianoDrawerOpened','pianoPendantCollected'])session.advancePiano(id);
  }
 }
 await openScene();if(mode==='boundary')await reward.begin();
}};`;
 const result=await build({absWorkingDir:path.join(root,'game'),entryPoints:['main.js'],bundle:true,format:'iife',platform:'browser',target:'es2022',write:false,minify:true,loader:{'.png':'dataurl','.m4a':'dataurl','.jpg':'dataurl','.glb':'dataurl'},plugins:[{name:'stage2-test-checkpoint',setup(b){
  b.onLoad({filter:/[\\/]game[\\/]main\.js$/},async args=>({contents:await fs.readFile(args.path,'utf8')+tail,loader:'js',resolveDir:path.dirname(args.path)}));
  if(!realScene)b.onLoad({filter:/[\\/]game[\\/]scene\.js$/},async()=>({contents:await fs.readFile(path.join(root,'tests/stage2-scene-fixture.js'),'utf8'),loader:'js',resolveDir:path.join(root,'tests')}));
 }}]});
 const template=await fs.readFile(path.join(root,'game/page-template.html'),'utf8'),css=await fs.readFile(path.join(root,'game/styles.css'),'utf8');
 await fs.writeFile(output,template.replace('<!-- INLINE_CSS -->',()=>'<style>'+css+'</style>').replace('<!-- INLINE_JS -->',()=>'<script>'+result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script>'));
};
