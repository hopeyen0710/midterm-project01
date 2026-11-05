import castleArtwork from './assets/entry-castle-night.png';
import {stage1Opening} from './stage1-data.js';

document.querySelector('#entry-art-image').src=castleArtwork;
document.querySelector('#entry-letter').textContent=stage1Opening.letter.lines.join('\n');
for(const [buttonId,dialogId] of [['entry-story-button','entry-story-dialog'],['entry-credits-button','entry-credits-dialog']]){
 const button=document.getElementById(buttonId),dialog=document.getElementById(dialogId);
 button.addEventListener('click',()=>dialog.showModal());
 dialog.addEventListener('close',()=>button.focus());
}
