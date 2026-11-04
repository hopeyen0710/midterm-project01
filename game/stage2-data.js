// 第二關新稿資料；尚未接入的段落只供後續步驟使用，不在載入時推進事件。
export const stage2Source={file:'Stage/stage2.md',sha256:'46d76375b906676312cf695c4ec198192ca1cb511540c55c484602f75c1adbea'};
export const stage2Script={
 entryPose:{area:'hall',x:0,z:9.8,lookAt:[0,2.8,-2.6]},
 galleryPose:{area:'hall',x:0,z:-20.2,lookAt:[0,3.2,-26.6]},
 opening:'管道開始發出運轉聲，暗紅色的液體順著銅管流向銀杯。艾琳雙眼無神，右手僵硬地伸向銀杯，左手死死抓住自己的手腕。',
 plea:'快一點……我撐不住！',
 choices:[
  {id:'take-cup',label:'直接用手強行端走銀杯',success:false,text:'典禮冊的約束力強行將銀杯固化在托盤上，無法移開。艾琳的手距離杯緣更近了！'},
  {id:'jam-gear',label:'用鐵桿卡住管道上方的傳動齒輪',success:false,text:'齒輪力量過大，鐵桿被瞬間絞斷！管道內的液體繼續下壓。'},
  {id:'divert-seal',label:'轉動緊急分流閥門，並用銅蓋封堵主管道',success:true,text:'啪嗒！閥門轉動，液體被改道排入下方暗槽。銀杯內保持乾燥。艾琳的手猛然垂下，大口喘氣！'},
  {id:'block-outlet',label:'嘗試用手擋住管道出口',success:false,text:'液體帶有腐蝕性／劇毒！你受到傷害被迫收手，未能及時阻斷水流。'},
 ],
 revision:'第一方案不可執行。修訂：座椅。',
 afterBlock:[{speaker:'erin',text:'呼……呼……阻止了嗎？'},{speaker:'erin',text:'為什麼？我們不是已經阻止它了嗎？'},{speaker:'ian',text:'你阻止的是機關，不是命令。'},{speaker:'erin',text:'那至少讓我知道，我為什麼坐在這裡。'},{speaker:'ian',text:'真正的罪名，不會寫在普通的紙上。紅色的眼睛才能看見它。'}],
 readingChoices:['使用紅玻璃透視典禮冊與周遭紀錄','直接嘗試用手翻閱典禮冊不使用紅玻璃'],
 ordinaryHint:'用肉眼是看不穿這些掩飾的。',
 evidence:{seal:'王室執行印',rule:'典禮冊僅約束登記參與者（艾琳），不作用於外來賓客（玩家）。',attachmentNumber:null,testPageFullText:null,supplementFullText:null,oldOrderFullText:null},
 pendingContent:['工匠舊測試頁全文','紀錄補充全文','被覆印舊命令全文','具體附件編號'],
 candleGuidance:[{speaker:'erin',text:'剛才紙頁上顯示了測試方法……桌上那四根燭臺，是不是就代表著不同的設施？'},{speaker:'ian',text:'典禮冊現在已經把死法修訂成了『座椅』。去動一下代表座椅的燭臺，看看這條殺意命令是不是真的被驅動了。'}],
 candles:[
  {id:'cup',slot:1,name:'銀杯',reply:'不對，那是被阻斷的舊方案。火苗熄滅後沒有再次點燃。'},
  {id:'crown',slot:2,name:'王冠',reply:'沒有反應。王室身分登記目前並未被驅動。'},
  {id:'chair',slot:3,name:'座椅',reply:'燭火熄滅後瞬間重新點燃！高臺座椅內的彈簧再次扣緊——確認目前生效的殺意指令為「座椅」。'},
  {id:'clock',slot:4,name:'報時',reply:'毫無動靜。報時機關目前處於靜止狀態。'},
 ],
 galleryLines:[{speaker:'erin',text:'去找那份附件。我想知道，他們到底說我做了什麼。'},{speaker:'erin',text:'附件……不在這本冊子裡。這上面的編號指向後方的王室畫廊！他們把真正的記錄藏在畫像後面了。'},{speaker:'ian',text:'走吧，去畫廊。'}],
 galleryPrompt:'已解鎖附件指引。高臺後方的王室畫廊大門已開啟，請選擇下一步行動。',
 galleryChoices:['推開鐵門，帶領艾琳進入王室畫廊','嘗試在第二關大廳繼續逗留'],
 stayReply:'這裡已經沒有其他線索了，高臺座椅隨時會再次發動，我們得快點進去畫廊！',
 galleryArrival:'大門緩緩推開，冷風拂過，兩旁掛了三幅巨大肖像。畫像的面容多已被拆開或塗改，名字牌錯置交亂。',
};
