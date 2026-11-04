// 新版第一關資料；來源文字與待實作流程分離，不在載入時推進劇情。
export const stage1Source = {
  file: 'Stage/stage1.md',
  sha256: '0c50b473892ddf52fe487fd1217bd7ccf8f22ed574cd3cb8054962bb287e1746',
  characterAlias: { '艾玲': '艾琳' },
};
export const stage1Opening = {
  time: '23:30',
  letter: {
    id: 'rescueLetter', title: '一封求救信',
    lines: ['「請在午夜以前抵達。', '如果大門旁有人叫住你，請回答他。', '他已經很久沒有和城堡外的人說話了。」', '——艾琳'],
  },
  question: '你是……從外面來的人？',
  choices: [
    { id: 'letter', label: '我收到艾琳的信。', reply: '她真的把信送出去了……進來吧。', admits: true },
    { id: 'identity', label: '你是誰？', reply: '伊恩。你是來找艾琳的吧？', admits: true },
    { id: 'silence', label: '……', reply: '你沒聽見嗎？她信上不是請你回答？', admits: false },
  ],
};
// 下列台詞與線索先整理成資料，實際事件於 plan.v2 步驟 10～13 接入。
export const stage1Indoor = {
  erin: ['你來晚了。', '我是說，這場宴會已經過時很久了。', '這是我的字。可我不記得……', '不記得有人真的回來過。', '拜託，帶我出去'],
  leaveChoice: '跟我走，我帶妳出去。',
  firstRestriction: '看見了嗎？我不是不想走。', retryChoice: '再試一次',
  secondRestriction: '沒用的。只要我跨過那一步，身體就會自己回來。',
  bookTitle: '王室典禮紀錄',
  bookLines: ['二十三時三十分。外來賓客入席。', '午夜鐘響，公主的心跳必須停止。'],
  ian: ['別繼續讀。先去看鋼琴，裡面有一件能幫你的東西。', '我記得那裡藏著一件東西。你要知道這本冊子做過什麼，就得先找到它。'],
  request: ['(玩家名字)，先答應我一件事。', '如果你發現救不了我，告訴我。不要一直說一定會沒事。'],
  promiseChoices: ['我答應妳。我不會隱瞞。', '我會盡力，但我不能保證。', '妳一定會沒事的。'],
};
export const stage1Piano = {
  note: '國王的聲音，不屬於賓客的合唱。只有賓客的四聲，才能喚醒沉睡的樂章。',
  box: [
    { slot: 1, voice: '賓', symbol: '☾', name: '月亮' },
    { slot: 2, voice: '王', symbol: '♛', name: '王冠' },
    { slot: 3, voice: '賓', symbol: '♧', name: '鳥' },
    { slot: 4, voice: '王', symbol: '✿', name: '花' },
    { slot: 5, voice: '賓', symbol: '✿', name: '花' },
    { slot: 6, voice: '王', symbol: '☾', name: '月亮' },
    { slot: 7, voice: '賓', symbol: '♛', name: '王冠' },
    { slot: 8, voice: '王', symbol: '♧', name: '鳥' },
  ],
  hintSequence: ['月亮', '鳥', '花', '王冠'],
  hint: { speaker: 'erin', text: '伊恩總是把最後兩音彈反。' },
  solution: ['月亮', '鳥', '王冠', '花'],
  performanceLine: '它知道你來了。',
  pendant: { name: '紅玻璃吊墜', description: '一枚深紅色玻璃吊墜。背面刻著：給不肯好好坐著的艾琳。' },
  afterReward: [
    { speaker: 'ian', text: '紅玻璃可分辨原墨與後來的王室覆印。' },
    { speaker: 'erin', text: '有人送我這個。我記得當時很高興，可是……想不起他的臉。' },
    { speaker: 'ian', text: '先留著。你會用到。' },
  ],
};
