// 九片可任意交換，所有排列均可解。排除只在原行／原列小幅挪動的排列。
export function shufflePortrait(previous=null,random=Math.random){
 const mixed=tiles=>tiles.filter((n,i)=>n!==i).length>=8&&tiles.filter((n,i)=>Math.floor(n/3)!==Math.floor(i/3)).length>=6&&tiles.filter((n,i)=>n%3!==i%3).length>=6&&(!previous||tiles.some((n,i)=>n!==previous[i]));
 for(let attempt=0;attempt<64;attempt++){
  const tiles=Array.from({length:9},(_,i)=>i);
  for(let i=8;i>0;i--){const j=Math.floor(random()*(i+1));[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
  if(mixed(tiles))return tiles;
 }
 // 隨機來源無變化時仍可結束，並保證與上次排列不同。
 const fallback=[8,6,7,2,0,1,5,3,4];
 return mixed(fallback)?fallback:[4,5,3,7,8,6,1,2,0];
}
