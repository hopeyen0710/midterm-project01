// 使用 Web Audio 合成環境聲，不下載或引用外部音訊。
export function createAmbience(onChange=()=>{}) {
 let context,master,rainGain,insideGain,mode='silent',muted=false;
 const sources=[];
 const publish=()=>onChange({mode,muted,state:context?.state||'inactive',rainGain:rainGain?.gain.value||0,insideGain:insideGain?.gain.value||0});
 function apply(){
  if(!context)return publish();const now=context.currentTime;
  master.gain.setTargetAtTime(muted?0:.32,now,.08);
  rainGain.gain.setTargetAtTime(mode==='outside'?.35:0,now,.25);
  insideGain.gain.setTargetAtTime(mode==='inside'?.09:0,now,.25);publish();
 }
 function ensure(){
  if(context)return;
  const Type=window.AudioContext||window.webkitAudioContext;if(!Type)throw Error('此瀏覽器不支援環境聲。');
  context=new Type();master=context.createGain();master.connect(context.destination);rainGain=context.createGain();rainGain.gain.value=0;rainGain.connect(master);insideGain=context.createGain();insideGain.gain.value=0;insideGain.connect(master);
  const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),samples=buffer.getChannelData(0);let seed=73129,last=0;
  for(let i=0;i<samples.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;last=last*.65+((seed>>>0)/4294967296*2-1)*.35;samples[i]=last;}
  const rain=context.createBufferSource();rain.buffer=buffer;rain.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=3200;rain.connect(filter);filter.connect(rainGain);rain.start();sources.push(rain);
  for(const frequency of [110,130.81,164.81]){const oscillator=context.createOscillator();oscillator.type='sine';oscillator.frequency.value=frequency;const gain=context.createGain();gain.gain.value=.12;oscillator.connect(gain);gain.connect(insideGain);oscillator.start();sources.push(oscillator);}
  context.addEventListener('statechange',publish);
 }
 return {
  playNote(frequency){
   if(muted||!Number.isFinite(frequency))return;
   try{ensure();context.resume().catch(()=>{});const now=context.currentTime,oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.11,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.4);oscillator.connect(gain);gain.connect(master);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(now);oscillator.stop(now+.42);}catch{/* 聲音不可用時保留琴鍵輸入與文字回饋。 */}
  },
  async activate(){try{ensure();await context.resume();apply();}catch(error){onChange({mode,muted,state:'unavailable',message:error.message});}},
  setMode(value){mode=['outside','inside','silent'].includes(value)?value:'silent';apply();},
  async toggle(){muted=!muted;await this.activate();},
  dispose(){for(const source of sources)source.stop();context?.close().catch(()=>{});},
 };
}
