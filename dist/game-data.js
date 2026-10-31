// 原始依據：plain.md。下列具體答案與操作順序為網站雛形的示範規則。
export const CHAPTERS = [
  { name: '鋼琴', time: '11:30', title: '被留下的旋律', description: '音樂盒還在轉動。聽清楚，再讓琴鍵替你回答。', narrator: '「公主被困在透明鏡室，午夜就會死去。先聽，再彈；記住音樂盒的旋律。」', hint: '播放音樂盒後，依照畫面上的數字順序點擊琴鍵。', art: 0 },
  { name: '日記', time: '11:40', title: '紅色之下的真相', description: '紙上的字，真的是你剛才讀到的樣子嗎？', narrator: '「有些字不該直接看。你口袋裡的那抹紅色，也許能幫上忙。」', hint: '把道具欄的紅玻璃項鍊拖到日記，或按下「使用項鍊」。', art: 1 },
  { name: '畫像', time: '11:45', title: '畫框背後的人', description: '將四片畫像放回原位，再看看它的背面。', narrator: '「別看那張臉……算了。你遲早會知道，我為什麼留在這裡。」', hint: '依序選兩片可交換位置。排成 1、2、3、4 後，再翻到背面。', art: 2 },
  { name: '人偶', time: '11:50', title: '不是血肉的心跳', description: '如果機械也能心跳，王冠會如何選擇？', narrator: '「先讓齒輪咬合，再讓心跳穩定。不要相信我，親自試一次。」', hint: '裝上三個齒輪，將示範節奏調到每分鐘 60 次，再把王冠移到人偶。', art: 3 },
  { name: '午夜', time: '11:55', title: '偷走命運的一分鐘', description: '你無法讓午夜停下，但可以改變它帶走誰。', narrator: '「順序很重要。先讓它活過來，再讓王冠承認它。剩下的……交給午夜。」', hint: '示範順序：11:58 啟動機械心跳；11:59 轉移王冠；00:00 由人偶承受命運。', art: 4 },
];

export const DEMO = {
  melody: [0, 2, 1, 3],
  notes: ['Do', 'Re', 'Mi', 'Sol'],
  frequencies: [261.63, 293.66, 329.63, 392],
  diary: '王冠認定的心跳，將承受午夜的死亡。',
  heartbeat: 60,
  initialPortrait: [2, 0, 3, 1],
  finalEvents: ['啟動機械心跳', '將王冠移至人偶', '由人偶承受命運'],
};

export const ITEMS = [
  { id: 'pendant', name: '紅玻璃項鍊', icon: 'pendant', description: '以紅色玻璃作為濾鏡，可以看穿日記中隱藏的指令。', after: 0 },
  { id: 'key', name: '畫室鑰匙', icon: 'key', description: '從日記關卡取得。它開啟了通往畫室的門。', after: 1 },
  { id: 'crown', name: '王冠線索', icon: 'crown', description: '畫像背面的機關圖提示：王冠可以認定機械心跳。', after: 2 },
];
