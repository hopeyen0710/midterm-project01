import castleBgmURL from './assets/audio/bgm.m4a';

// 門外環境聲與琴音由 Web Audio 合成，使用者提供的城堡配樂內嵌於 HTML。
export function createAmbience(onChange=()=>{}) {
 let context,master,rainGain,insideGain,bgmGain,bgmSource,mode='silent',muted=false;
 let bgmSelected=false,bgmError=null,disposed=false;
 const bgm=new Audio(castleBgmURL.replace(/^data:[^;,]+/,'data:audio/mp4'));
 bgm.preload='auto';bgm.loop=true;
 const sources=[];
 const publish=()=>{if(!disposed)onChange({mode,muted,state:context?.state||'inactive',rainGain:rainGain?.gain.value||0,insideGain:insideGain?.gain.value||0,masterGain:master?.gain.value??0,bgm:{selected:bgmSelected,playing:!bgm.paused,loop:bgm.loop,currentTime:bgm.currentTime,duration:Number.isFinite(bgm.duration)?bgm.duration:null,readyState:bgm.readyState,error:bgmError}});};
 function playBgm(){
  if(disposed||!bgmSelected||mode==='silent'||!bgm.paused)return;
  const playing=bgm.play();
  playing?.then(()=>{if(disposed||!bgmSelected||mode==='silent')bgm.pause();publish();}).catch(error=>{if(bgmSelected&&mode!=='silent'&&!disposed){bgmError=error.message;publish();}});
 }
 for(const event of ['loadedmetadata','canplay','playing','pause','timeupdate','ended'])bgm.addEventListener(event,publish);
 bgm.addEventListener('error',()=>{bgmError=bgm.error?.message||'背景音樂無法播放。';publish();});
 function apply(){
  if(disposed)return;
  if(!context)return publish();const now=context.currentTime;
  master.gain.setTargetAtTime(muted?0:.32,now,.08);
  if(bgmSelected){
   // 點擊回覆後立即停止舊環境聲，不讓雨聲或室內低音與配樂重疊。
   for(const gain of [rainGain,insideGain]){gain.gain.cancelScheduledValues(now);gain.gain.setValueAtTime(0,now);}
  }else{
   rainGain.gain.setTargetAtTime(mode==='outside'?.35:0,now,.25);
   insideGain.gain.setTargetAtTime(mode==='inside'?.09:0,now,.25);
  }
  bgmGain.gain.setValueAtTime(bgmSelected&&mode!=='silent'?.9:0,now);
  if(mode==='silent'||!bgmSelected)bgm.pause();else playBgm();
  publish();
 }
 function ensure(){
  if(context)return;
  const Type=window.AudioContext||window.webkitAudioContext;if(!Type)throw Error('此瀏覽器不支援環境聲。');
  context=new Type();master=context.createGain();master.connect(context.destination);rainGain=context.createGain();rainGain.gain.value=0;rainGain.connect(master);insideGain=context.createGain();insideGain.gain.value=0;insideGain.connect(master);
  bgmGain=context.createGain();bgmGain.gain.value=0;bgmGain.connect(master);bgmSource=context.createMediaElementSource(bgm);bgmSource.connect(bgmGain);
  const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),samples=buffer.getChannelData(0);let seed=73129,last=0;
  for(let i=0;i<samples.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;last=last*.65+((seed>>>0)/4294967296*2-1)*.35;samples[i]=last;}
  const rain=context.createBufferSource();rain.buffer=buffer;rain.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=3200;rain.connect(filter);filter.connect(rainGain);rain.start();sources.push(rain);
  for(const frequency of [110,130.81,164.81]){const oscillator=context.createOscillator();oscillator.type='sine';oscillator.frequency.value=frequency;const gain=context.createGain();gain.gain.value=.12;oscillator.connect(gain);gain.connect(insideGain);oscillator.start();sources.push(oscillator);}
  context.addEventListener('statechange',publish);
 }
 return {
  startBgm(){
   if(disposed||bgmSelected)return;
   bgmSelected=true;bgmError=null;
   // 直接在使用者點擊處呼叫播放，不等待進入大廳或下一段對話。
   try{ensure();context.resume().catch(()=>{});apply();}catch(error){bgmError=error.message;publish();}
  },
  resetBgm(){if(!bgmSelected)return;bgmSelected=false;bgmError=null;bgm.pause();try{bgm.currentTime=0;}catch{}apply();},
  playNote(frequency){
   if(muted||!Number.isFinite(frequency))return;
   try{ensure();context.resume().catch(()=>{});const now=context.currentTime,oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.11,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.4);oscillator.connect(gain);gain.connect(master);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(now);oscillator.stop(now+.42);}catch{/* 聲音不可用時保留琴鍵輸入與文字回饋。 */}
  },
  async activate(){try{ensure();await context.resume();apply();}catch(error){onChange({mode,muted,state:'unavailable',message:error.message});}},
  setMode(value){mode=['outside','inside','silent'].includes(value)?value:'silent';apply();},
  async toggle(){muted=!muted;await this.activate();},
  dispose(){if(disposed)return;disposed=true;bgm.pause();bgmSource?.disconnect();bgmGain?.disconnect();for(const source of sources)source.stop();context?.close().catch(()=>{});bgm.removeAttribute('src');bgm.load();},
 };
}
