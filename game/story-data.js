// 依據 BRIEF.md v2 整理。純資料，不執行劇情或推進時間。
export const storySource = {
  "file": "BRIEF.md",
  "version": "v2",
  "updatedAt": "2026-11-03",
  "sha256": "3e1ac4d59fc6554a24226116f4df1b38c29968477fbb12119e8d98275ffbaaad",
  "note": "entries 保留完整八幕非空原文；訪客括號行為保留原文指示，沒有補寫玩家台詞。"
};

export const characters = [
  {
    "id": "visitor",
    "name": "訪客",
    "role": "未登記的外來賓客，不接替旁白"
  },
  {
    "id": "erin",
    "name": "艾琳",
    "role": "自願封存記憶，必須親口撤回誓約"
  },
  {
    "id": "ian",
    "name": "伊恩",
    "role": "協助外逃而死的工匠學徒，亡者聲息待散席解除"
  }
];

export const storyRules = [
  {
    "id": "rule1",
    "sourceText": "《王室典禮紀錄》是執行命令的冊子，私人日記只是夾頁；紅玻璃可辨識原墨、覆印與有效執行印。"
  },
  {
    "id": "rule2",
    "sourceText": "冊子能調度相連的典禮設施，約束已登記者，不控制未登記的外來訪客。"
  },
  {
    "id": "rule3",
    "sourceText": "阻斷銀杯方案只會令冊子改採座椅，不會取消處決。"
  },
  {
    "id": "rule4",
    "sourceText": "阻斷報時只能延後執行；未完成的終典重演。設施復位，冊子與誓約留存；外界不重來。"
  },
  {
    "id": "rule5",
    "sourceText": "國王為阻止艾琳揭露帳冊、放棄繼承而簽署處決；沒有逃婚設定。"
  },
  {
    "id": "rule6",
    "sourceText": "封存伊恩名字與相伴記憶是艾琳自願立下的誓約，必須由她親口撤回；訪客不能替她撤回。"
  },
  {
    "id": "rule7",
    "sourceText": "人偶有穩定心跳、戴冠並閉合扣環時，才可成為有效登記對象。"
  },
  {
    "id": "rule8",
    "sourceText": "有效登記不因停心或取下王冠自行消失；第四關實驗結果保留至第五關，無須先把身分轉回艾琳。"
  },
  {
    "id": "rule9",
    "sourceText": "午夜由報時觸發制動，令已登記人偶停心；冊子確認終典完成後才散席。"
  },
  {
    "id": "rule10",
    "sourceText": "驚嚇依序為第五音與鐘擺、死亡紀錄旁的伊恩近聲、人偶支架與空椅。父王處決令段落不安排驚嚇。"
  },
  {
    "id": "rule11",
    "sourceText": "閱讀、對話與自由探索不推進故事時間；沿用關卡推進時間，不設真實倒數強制失敗。"
  }
];

export const storyObjects = [
  {
    "id": "letter",
    "name": "求救信",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "entrance",
    "name": "城堡大門",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "ribbon",
    "name": "白緞帶",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "dais",
    "name": "高臺",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "chair",
    "name": "高臺座椅",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "flowers",
    "name": "白花",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "banquet",
    "name": "宴會長桌",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "book",
    "name": "王室典禮紀錄",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "diary",
    "name": "私人日記夾頁",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "piano",
    "name": "鋼琴",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "score",
    "name": "殘缺樂譜",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "musicBox",
    "name": "音樂盒",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "program",
    "name": "舞會節目單",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "clock",
    "name": "中央大鐘",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "glass",
    "name": "紅玻璃項鍊",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "repairNote",
    "name": "維修便條",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "cup",
    "name": "銀杯",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "waterworks",
    "name": "送水機關",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "candles",
    "name": "儀式燭臺",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "testPage",
    "name": "工匠舊測試頁",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "oldOrder",
    "name": "被覆印的舊命令",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "portraits",
    "name": "畫像與名字牌",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "map",
    "name": "港口道路地圖",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "relief",
    "name": "城外救濟申請",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "speech",
    "name": "演說稿",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "executionOrder",
    "name": "處決令",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "blackCloth",
    "name": "黑色桌布",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "maintenance",
    "name": "工匠維修紀錄",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "photo",
    "name": "工匠合照",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "pursuit",
    "name": "學徒追捕紀錄",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "deathRecord",
    "name": "伊恩死亡紀錄",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "oath",
    "name": "記憶封存誓約與指印",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "cabinet",
    "name": "工匠櫃",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "research",
    "name": "人偶底座研究筆記與搜查封條",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "dummy",
    "name": "替身人偶",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "heart",
    "name": "發條心臟",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "crown",
    "name": "王冠與扣環",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "brake",
    "name": "制動桿與拉索",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "support",
    "name": "座椅儀式支架",
    "interaction": "待後續步驟實作"
  },
  {
    "id": "emptyChairs",
    "name": "長桌空椅",
    "interaction": "待後續步驟實作"
  }
];

export const documents = [
  {
    "id": "rescueLetter",
    "actId": "act1",
    "objectId": "letter",
    "sourceEntryId": "act1-line44",
    "sourceText": "「請在午夜以前抵達。 如果大門旁有人叫住你，請回答他。 他已經很久沒有和城堡外的人說話了。 ——艾琳」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "scoreClue",
    "actId": "act2",
    "objectId": "score",
    "sourceEntryId": "act2-line70",
    "sourceText": "【探索】鋼琴旁有殘缺樂譜、音樂盒與舞會節目單。節目單把這場宴會稱作「公主的最後一次公開典禮」。",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "programClue",
    "actId": "act2",
    "objectId": "program",
    "sourceEntryId": "act2-line70",
    "sourceText": "【探索】鋼琴旁有殘缺樂譜、音樂盒與舞會節目單。節目單把這場宴會稱作「公主的最後一次公開典禮」。",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "repairNote",
    "actId": "act2",
    "objectId": "repairNote",
    "sourceEntryId": "act2-line86",
    "sourceText": "便條：「紅玻璃可分辨原墨與後來的王室覆印。第五音是機關回覆，不屬於演奏。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "necklaceInscription",
    "actId": "act2",
    "objectId": "glass",
    "sourceEntryId": "act2-line87",
    "sourceText": "項鍊背面刻著：「給不肯好好坐著的艾琳。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "testPage",
    "actId": "act3",
    "objectId": "testPage",
    "sourceEntryId": "act3-line101",
    "sourceText": "【探索】紅玻璃顯示：部分文字帶有王室執行印，部分只是普通紀錄。燭臺旁有工匠的舊測試頁。訪客可藉由儀式燭臺的熄滅、重燃，驗證只有有效印記下的命令會驅動相連機關。",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "bookScope",
    "actId": "act3",
    "objectId": "book",
    "sourceEntryId": "act3-line102",
    "sourceText": "紀錄補充：「本冊可調度典禮設施，並約束已登記的典禮參與者；不作用於未登記的外來賓客。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "overprintedOrder",
    "actId": "act3",
    "objectId": "oldOrder",
    "sourceEntryId": "act3-line104",
    "sourceText": "紅玻璃另照出一張被覆印的舊命令。原本的公開罪名是「背叛王室」，下面還有被遮去的附件編號。",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "map",
    "actId": "act4",
    "objectId": "map",
    "sourceEntryId": "act4-line111",
    "sourceText": "證據一：艾琳寫滿港口與道路的地圖。旁註：「典禮前，把帳冊帶出去。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "relief",
    "actId": "act4",
    "objectId": "relief",
    "sourceEntryId": "act4-line112",
    "sourceText": "證據二：城外救濟申請，連續遭拒；王室仍要求各地繳納宴會與加冕費用。",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "speech",
    "actId": "act4",
    "objectId": "speech",
    "sourceEntryId": "act4-line113",
    "sourceText": "證據三：艾琳的演說稿。 「我不會接受以這些人的飢餓換來的王冠。今晚，我將公開帳冊，放棄繼承。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "executionOrder",
    "actId": "act4",
    "objectId": "executionOrder",
    "sourceEntryId": "act4-line119",
    "sourceText": "「取消公開加冕，改行閉門終典。午夜鐘響，公主的心跳必須停止。典禮完成，方可散席。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "maintenance",
    "actId": "act4",
    "objectId": "maintenance",
    "sourceEntryId": "act4-line125",
    "sourceText": "訪客找到工匠的維修紀錄：「報時停止，只能延後執行。凡已開始的王室終典，未完成便重演；設施復位，典禮冊與誓約紀錄留存。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "outsideTime",
    "actId": "act4",
    "objectId": "maintenance",
    "sourceEntryId": "act4-line126",
    "sourceText": "附註：「外界不會跟著重來。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "photoBack",
    "actId": "act5",
    "objectId": "photo",
    "sourceEntryId": "act5-line132",
    "sourceText": "背面：「伊恩總是把最後兩音彈反。——艾琳」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "pursuit",
    "actId": "act5",
    "objectId": "pursuit",
    "sourceEntryId": "act5-line135",
    "sourceText": "下一份文件記錄：伊恩是維護城堡機關的工匠學徒，因協助公主外逃遭到追捕。",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "deathRecord",
    "actId": "act5",
    "objectId": "deathRecord",
    "sourceEntryId": "act5-line139",
    "sourceText": "訪客讀完：「報時恢復前，學徒於出口阻擋衛兵，死亡。其身分已載入本次典禮，亡者聲息留於場內，待散席解除。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "oath",
    "actId": "act5",
    "objectId": "oath",
    "sourceEntryId": "act5-line145",
    "sourceText": "「我自願封存伊恩的名字與相伴記憶。若我親口撤回，此誓解除。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "privateMessage",
    "actId": "act5",
    "objectId": "diary",
    "sourceEntryId": "act5-line146",
    "sourceText": "下面另有一句私人留言：「如果我不記得，就不要再告訴我你死了。我不知道自己還能再失去你幾次。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "researchOrigin",
    "actId": "act6",
    "objectId": "research",
    "sourceEntryId": "act6-line165",
    "sourceText": "工匠筆記：「原為試衣與典禮排演而造。偶然加冠，城堡竟向其行禮。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "researchRegistration",
    "actId": "act6",
    "objectId": "research",
    "sourceEntryId": "act6-line166",
    "sourceText": "下一頁：「登記裝置辨識規律心搏，不辨血肉。尚待驗證：如何穩定轉移、如何使午夜判定成立。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "searchSeal",
    "actId": "act6",
    "objectId": "research",
    "sourceEntryId": "act6-line167",
    "sourceText": "最後一頁戛然而止，附著王室的搜查封條。工匠尚未完成研究便被捕，伊恩之後只搶救出部分裝置。",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "doorNotice",
    "actId": "act6",
    "objectId": "entrance",
    "sourceEntryId": "act6-line172",
    "sourceText": "她立即去推大門。門仍關著，門上浮現：「典禮未畢。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "reply",
    "actId": "act8",
    "objectId": "letter",
    "sourceEntryId": "act8-line227",
    "sourceText": "艾琳向訪客要回求救信，在背面補寫：「我已經出來了。——艾琳」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "officialEnding",
    "actId": "act8",
    "objectId": "book",
    "sourceEntryId": "act8-line232",
    "sourceText": "典禮冊的正式紀錄：「公主：已死。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  },
  {
    "id": "privateEnding",
    "actId": "act8",
    "objectId": "diary",
    "sourceEntryId": "act8-line233",
    "sourceText": "日記上補寫的一行字：「艾琳：今天第一次，不必準時入席。」",
    "contentType": "sourceExcerptOrDescription",
    "rereadable": true
  }
];

export const acts = [
  {
    "id": "act1",
    "number": 1,
    "title": "遲到的邀請",
    "sourceHeading": "第一幕：遲到的邀請｜23：30",
    "objectIds": [
      "letter",
      "entrance",
      "ribbon",
      "dais",
      "chair",
      "flowers",
      "banquet",
      "book",
      "diary",
      "cup"
    ],
    "entries": [
      {
        "id": "act1-line42",
        "sourceLine": 42,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【黑畫面】雨聲。紙張展開。",
        "sourceText": "【黑畫面】雨聲。紙張展開。"
      },
      {
        "id": "act1-line43",
        "sourceLine": 43,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "求救信：",
        "sourceText": "求救信："
      },
      {
        "id": "act1-line44",
        "sourceLine": 44,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "「請在午夜以前抵達。 如果大門旁有人叫住你，請回答他。 他已經很久沒有和城堡外的人說話了。 ——艾琳」",
        "sourceText": "「請在午夜以前抵達。 如果大門旁有人叫住你，請回答他。 他已經很久沒有和城堡外的人說話了。 ——艾琳」"
      },
      {
        "id": "act1-line45",
        "sourceLine": 45,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "這張信直接點出時間壓力（午夜以前），並暗示城堡裡有神祕引導者（伊恩）在等候。",
        "sourceText": "這張信直接點出時間壓力（午夜以前），並暗示城堡裡有神祕引導者（伊恩）在等候。"
      },
      {
        "id": "act1-line46",
        "sourceLine": 46,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【畫面】訪客站在荒草覆蓋的石階上。城堡外牆破敗，窗內卻燈火通明，傳出斷斷續續的舞曲。門把上繫著一條褪色白緞帶。",
        "sourceText": "【畫面】訪客站在荒草覆蓋的石階上。城堡外牆破敗，窗內卻燈火通明，傳出斷斷續續的舞曲。門把上繫著一條褪色白緞帶。"
      },
      {
        "id": "act1-line47",
        "sourceLine": 47,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客回應暗處的伊恩，隨後大門開啟。）",
        "sourceText": "（訪客回應暗處的伊恩，隨後大門開啟。）"
      },
      {
        "id": "act1-line48",
        "sourceLine": 48,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【畫面】大門開啟。踏進門後，雨聲消失，門在身後關上。",
        "sourceText": "【畫面】大門開啟。踏進門後，雨聲消失，門在身後關上。"
      },
      {
        "id": "act1-line49",
        "sourceLine": 49,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "大廳中央有高臺與座椅；左邊是鋼琴，後方是畫廊，右側是關閉的工匠櫃。宴會長桌擺滿乾癟的餐點，只有白花新鮮得不自然。",
        "sourceText": "大廳中央有高臺與座椅；左邊是鋼琴，後方是畫廊，右側是關閉的工匠櫃。宴會長桌擺滿乾癟的餐點，只有白花新鮮得不自然。"
      },
      {
        "id": "act1-line50",
        "sourceLine": 50,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "一名穿禮服的女孩坐在高臺邊，正把花束中的白花一朵朵拔出。",
        "sourceText": "一名穿禮服的女孩坐在高臺邊，正把花束中的白花一朵朵拔出。"
      },
      {
        "id": "act1-line51",
        "sourceLine": 51,
        "type": "dialogue",
        "speaker": "erin",
        "text": "你來晚了。",
        "sourceText": "艾琳：「你來晚了。」"
      },
      {
        "id": "act1-line52",
        "sourceLine": 52,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客提及信上的時間約定。）",
        "sourceText": "（訪客提及信上的時間約定。）"
      },
      {
        "id": "act1-line53",
        "sourceLine": 53,
        "type": "dialogue",
        "speaker": "erin",
        "text": "我是說，這場宴會已經過時很久了。",
        "sourceText": "艾琳：「我是說，這場宴會已經過時很久了。」"
      },
      {
        "id": "act1-line54",
        "sourceLine": 54,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "她看見信封，表情改變。",
        "sourceText": "她看見信封，表情改變。"
      },
      {
        "id": "act1-line55",
        "sourceLine": 55,
        "type": "dialogue",
        "speaker": "erin",
        "text": "這是我的字。可我不記得……",
        "sourceText": "艾琳：「這是我的字。可我不記得……」"
      },
      {
        "id": "act1-line56",
        "sourceLine": 56,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客提醒其曾寫過此信。）",
        "sourceText": "（訪客提醒其曾寫過此信。）"
      },
      {
        "id": "act1-line57",
        "sourceLine": 57,
        "type": "dialogue",
        "speaker": "erin",
        "text": "不記得有人真的回來過。",
        "sourceText": "艾琳：「不記得有人真的回來過。」"
      },
      {
        "id": "act1-line58",
        "sourceLine": 58,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "她起身走下高臺。腳伸向最後一階時，身體突然僵住，緩慢轉身，坐回原位。她的雙手死死抓住椅緣。",
        "sourceText": "她起身走下高臺。腳伸向最後一階時，身體突然僵住，緩慢轉身，坐回原位。她的雙手死死抓住椅緣。"
      },
      {
        "id": "act1-line59",
        "sourceLine": 59,
        "type": "dialogue",
        "speaker": "erin",
        "text": "看見了嗎？我不是不想走。",
        "sourceText": "艾琳：「看見了嗎？我不是不想走。」"
      },
      {
        "id": "act1-line60",
        "sourceLine": 60,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【聲音】書桌上的書自行翻開。封面寫著《王室典禮紀錄》；後面的空頁夾著艾琳的私人日記。",
        "sourceText": "【聲音】書桌上的書自行翻開。封面寫著《王室典禮紀錄》；後面的空頁夾著艾琳的私人日記。"
      },
      {
        "id": "act1-line61",
        "sourceLine": 61,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "魔法冊子浮現：",
        "sourceText": "魔法冊子浮現："
      },
      {
        "id": "act1-line62",
        "sourceLine": 62,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "「二十三時三十分。外來賓客入席。」 「午夜鐘響，公主的心跳必須停止。」",
        "sourceText": "「二十三時三十分。外來賓客入席。」 「午夜鐘響，公主的心跳必須停止。」"
      },
      {
        "id": "act1-line63",
        "sourceLine": 63,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "這兩張紙條完美呼應了兩大核心：訪客因「求救信」為拯救艾琳而來，而典禮冊的魔法規定則帶來了「半夜12點公主必須死」的倒數壓力與終極目標，必須在半小時內想辦法用人偶替身破解它。",
        "sourceText": "這兩張紙條完美呼應了兩大核心：訪客因「求救信」為拯救艾琳而來，而典禮冊的魔法規定則帶來了「半夜12點公主必須死」的倒數壓力與終極目標，必須在半小時內想辦法用人偶替身破解它。"
      },
      {
        "id": "act1-line64",
        "sourceLine": 64,
        "type": "dialogue",
        "speaker": "ian",
        "text": "別繼續讀。先去看鋼琴，裡面有一件能幫你的東西。",
        "sourceText": "伊恩：「別繼續讀。先去看鋼琴，裡面有一件能幫你的東西。」"
      },
      {
        "id": "act1-line65",
        "sourceLine": 65,
        "type": "dialogue",
        "speaker": "erin",
        "text": "先答應我一件事。",
        "sourceText": "艾琳：「先答應我一件事。」"
      },
      {
        "id": "act1-line66",
        "sourceLine": 66,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客注視著她。）",
        "sourceText": "（訪客注視著她。）"
      },
      {
        "id": "act1-line67",
        "sourceLine": 67,
        "type": "dialogue",
        "speaker": "erin",
        "text": "如果你發現救不了我，告訴我。不要一直說一定會沒事。",
        "sourceText": "艾琳：「如果你發現救不了我，告訴我。不要一直說一定會沒事。」"
      },
      {
        "id": "act1-line68",
        "sourceLine": 68,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【自由探索開放】訪客可以與艾琳交談、查看出口、桌上銀杯、典禮冊和各區物件。閱讀不推進時間。",
        "sourceText": "【自由探索開放】訪客可以與艾琳交談、查看出口、桌上銀杯、典禮冊和各區物件。閱讀不推進時間。"
      }
    ],
    "requiredEvents": [
      {
        "id": "respondIan",
        "description": "訪客回應門外伊恩，開門"
      },
      {
        "id": "enterHall",
        "description": "入室關門，雨聲中斷"
      },
      {
        "id": "erinRestricted",
        "description": "艾琳下高臺失敗並回座"
      },
      {
        "id": "readCommand",
        "description": "典禮冊宣告午夜停心命令"
      },
      {
        "id": "promiseHonesty",
        "description": "艾琳要求訪客如實告知能否救她"
      },
      {
        "id": "explorationOpened",
        "description": "自由探索開放"
      }
    ],
    "entryConditions": [],
    "completionConditions": [
      "respondIan",
      "enterHall",
      "erinRestricted",
      "readCommand",
      "promiseHonesty",
      "explorationOpened"
    ],
    "scareEventIds": [],
    "allowEmotionalPause": false
  },
  {
    "id": "act2",
    "number": 2,
    "title": "沒有演奏者的鋼琴",
    "sourceHeading": "第二幕：沒有演奏者的鋼琴｜23：30 → 23：40",
    "objectIds": [
      "piano",
      "score",
      "musicBox",
      "program",
      "clock",
      "glass",
      "repairNote"
    ],
    "entries": [
      {
        "id": "act2-line70",
        "sourceLine": 70,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【探索】鋼琴旁有殘缺樂譜、音樂盒與舞會節目單。節目單把這場宴會稱作「公主的最後一次公開典禮」。",
        "sourceText": "【探索】鋼琴旁有殘缺樂譜、音樂盒與舞會節目單。節目單把這場宴會稱作「公主的最後一次公開典禮」。"
      },
      {
        "id": "act2-line71",
        "sourceLine": 71,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "伊恩提供一段旋律，但語氣過分確定。",
        "sourceText": "伊恩提供一段旋律，但語氣過分確定。"
      },
      {
        "id": "act2-line72",
        "sourceLine": 72,
        "type": "dialogue",
        "speaker": "ian",
        "text": "我記得順序。照我說的做。",
        "sourceText": "伊恩：「我記得順序。照我說的做。」"
      },
      {
        "id": "act2-line73",
        "sourceLine": 73,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客依指示操作卻未啟動機關，比對現場資料後發現伊恩把最後兩個位置說反了。）",
        "sourceText": "（訪客依指示操作卻未啟動機關，比對現場資料後發現伊恩把最後兩個位置說反了。）"
      },
      {
        "id": "act2-line74",
        "sourceLine": 74,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客指出錯誤所在。）",
        "sourceText": "（訪客指出錯誤所在。）"
      },
      {
        "id": "act2-line75",
        "sourceLine": 75,
        "type": "dialogue",
        "speaker": "ian",
        "text": "也許這一次……它換過了。",
        "sourceText": "伊恩：「也許這一次……它換過了。」"
      },
      {
        "id": "act2-line76",
        "sourceLine": 76,
        "type": "dialogue",
        "speaker": "erin",
        "text": "還是你不願意說，你其實也不確定？",
        "sourceText": "艾琳：「還是你不願意說，你其實也不確定？」"
      },
      {
        "id": "act2-line77",
        "sourceLine": 77,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【探索補充】音樂盒裡有一小段不同於舞曲的旋律。艾琳下意識用指節敲出前半段，伊恩輕聲接完後半段。",
        "sourceText": "【探索補充】音樂盒裡有一小段不同於舞曲的旋律。艾琳下意識用指節敲出前半段，伊恩輕聲接完後半段。"
      },
      {
        "id": "act2-line78",
        "sourceLine": 78,
        "type": "dialogue",
        "speaker": "erin",
        "text": "你怎麼知道？",
        "sourceText": "艾琳：「你怎麼知道？」"
      },
      {
        "id": "act2-line79",
        "sourceLine": 79,
        "type": "dialogue",
        "speaker": "ian",
        "text": "這裡的音樂，我聽得太多了。",
        "sourceText": "伊恩：「這裡的音樂，我聽得太多了。」"
      },
      {
        "id": "act2-line80",
        "sourceLine": 80,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【劇情節點】訪客完成鋼琴機關。最後一音落下，沒有反應。",
        "sourceText": "【劇情節點】訪客完成鋼琴機關。最後一音落下，沒有反應。"
      },
      {
        "id": "act2-line81",
        "sourceLine": 81,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "一個低音鍵自行下沉。",
        "sourceText": "一個低音鍵自行下沉。"
      },
      {
        "id": "act2-line82",
        "sourceLine": 82,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【第一次驚嚇】第五音從空蕩的琴內響起。中央大鐘的鐘擺突然開始擺動。",
        "sourceText": "【第一次驚嚇】第五音從空蕩的琴內響起。中央大鐘的鐘擺突然開始擺動。"
      },
      {
        "id": "act2-line83",
        "sourceLine": 83,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳手中的花掉在地上。",
        "sourceText": "艾琳手中的花掉在地上。"
      },
      {
        "id": "act2-line84",
        "sourceLine": 84,
        "type": "dialogue",
        "speaker": "erin",
        "text": "它知道你來了。",
        "sourceText": "艾琳：「它知道你來了。」"
      },
      {
        "id": "act2-line85",
        "sourceLine": 85,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "暗格開啟，裡面是紅玻璃項鍊和一張維修便條。",
        "sourceText": "暗格開啟，裡面是紅玻璃項鍊和一張維修便條。"
      },
      {
        "id": "act2-line86",
        "sourceLine": 86,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "便條：「紅玻璃可分辨原墨與後來的王室覆印。第五音是機關回覆，不屬於演奏。」",
        "sourceText": "便條：「紅玻璃可分辨原墨與後來的王室覆印。第五音是機關回覆，不屬於演奏。」"
      },
      {
        "id": "act2-line87",
        "sourceLine": 87,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "項鍊背面刻著：「給不肯好好坐著的艾琳。」",
        "sourceText": "項鍊背面刻著：「給不肯好好坐著的艾琳。」"
      },
      {
        "id": "act2-line88",
        "sourceLine": 88,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳接近高臺邊緣，看著項鍊。",
        "sourceText": "艾琳接近高臺邊緣，看著項鍊。"
      },
      {
        "id": "act2-line89",
        "sourceLine": 89,
        "type": "dialogue",
        "speaker": "erin",
        "text": "有人送我這個。我記得當時很高興，可是……想不起他的臉。",
        "sourceText": "艾琳：「有人送我這個。我記得當時很高興，可是……想不起他的臉。」"
      },
      {
        "id": "act2-line90",
        "sourceLine": 90,
        "type": "dialogue",
        "speaker": "ian",
        "text": "先留著。你會用到。",
        "sourceText": "伊恩：「先留著。你會用到。」"
      },
      {
        "id": "act2-line91",
        "sourceLine": 91,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【鐘面】23：40。",
        "sourceText": "【鐘面】23：40。"
      }
    ],
    "requiredEvents": [
      {
        "id": "hearWrongMelody",
        "description": "伊恩提供最後兩個位置顛倒的旋律"
      },
      {
        "id": "comparePianoEvidence",
        "description": "比對樂譜、音樂盒與節目單"
      },
      {
        "id": "sharedMelody",
        "description": "艾琳敲前半段，伊恩接後半段"
      },
      {
        "id": "solvePiano",
        "description": "訪客完成正確旋律"
      },
      {
        "id": "fifthTone",
        "description": "機關自行響第五音，鐘擺啟動"
      },
      {
        "id": "collectGlass",
        "description": "取得紅玻璃及維修便條"
      }
    ],
    "entryConditions": [
      "explorationOpened"
    ],
    "completionConditions": [
      "hearWrongMelody",
      "comparePianoEvidence",
      "sharedMelody",
      "solvePiano",
      "fifthTone",
      "collectGlass"
    ],
    "scareEventIds": [
      "fifthTone"
    ],
    "allowEmotionalPause": false
  },
  {
    "id": "act3",
    "number": 3,
    "title": "日記正在安排死亡",
    "sourceHeading": "第三幕：日記正在安排死亡｜23：40 → 23：45",
    "objectIds": [
      "book",
      "diary",
      "glass",
      "cup",
      "waterworks",
      "chair",
      "candles",
      "testPage",
      "oldOrder"
    ],
    "entries": [
      {
        "id": "act3-line93",
        "sourceLine": 93,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【畫面】典禮冊浮現：「第一方案：銀杯。」",
        "sourceText": "【畫面】典禮冊浮現：「第一方案：銀杯。」"
      },
      {
        "id": "act3-line94",
        "sourceLine": 94,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳的手不受控制地伸向杯子。她用另一隻手抓住手腕。",
        "sourceText": "艾琳的手不受控制地伸向杯子。她用另一隻手抓住手腕。"
      },
      {
        "id": "act3-line95",
        "sourceLine": 95,
        "type": "dialogue",
        "speaker": "erin",
        "text": "快一點。我撐不住。",
        "sourceText": "艾琳：「快一點。我撐不住。」"
      },
      {
        "id": "act3-line96",
        "sourceLine": 96,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客出手阻斷送水機關，杯子失去用途。艾琳的手垂下，猛然喘氣。）",
        "sourceText": "（訪客出手阻斷送水機關，杯子失去用途。艾琳的手垂下，猛然喘氣。）"
      },
      {
        "id": "act3-line97",
        "sourceLine": 97,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "原句被劃掉：「第一方案不可執行。修訂：座椅。」",
        "sourceText": "原句被劃掉：「第一方案不可執行。修訂：座椅。」"
      },
      {
        "id": "act3-line98",
        "sourceLine": 98,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "高臺座椅內傳來上緊彈簧的聲音。",
        "sourceText": "高臺座椅內傳來上緊彈簧的聲音。"
      },
      {
        "id": "act3-line99",
        "sourceLine": 99,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客察覺威脅形式已然改變。）",
        "sourceText": "（訪客察覺威脅形式已然改變。）"
      },
      {
        "id": "act3-line100",
        "sourceLine": 100,
        "type": "dialogue",
        "speaker": "erin",
        "text": "不是有人猜到我要死……是有人還在安排。",
        "sourceText": "艾琳：「不是有人猜到我要死……是有人還在安排。」"
      },
      {
        "id": "act3-line101",
        "sourceLine": 101,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【探索】紅玻璃顯示：部分文字帶有王室執行印，部分只是普通紀錄。燭臺旁有工匠的舊測試頁。訪客可藉由儀式燭臺的熄滅、重燃，驗證只有有效印記下的命令會驅動相連機關。",
        "sourceText": "【探索】紅玻璃顯示：部分文字帶有王室執行印，部分只是普通紀錄。燭臺旁有工匠的舊測試頁。訪客可藉由儀式燭臺的熄滅、重燃，驗證只有有效印記下的命令會驅動相連機關。"
      },
      {
        "id": "act3-line102",
        "sourceLine": 102,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "紀錄補充：「本冊可調度典禮設施，並約束已登記的典禮參與者；不作用於未登記的外來賓客。」",
        "sourceText": "紀錄補充：「本冊可調度典禮設施，並約束已登記的典禮參與者；不作用於未登記的外來賓客。」"
      },
      {
        "id": "act3-line103",
        "sourceLine": 103,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "這解釋了訪客能自由行動，而艾琳會被操控。典禮冊不是能任意改寫世界的萬能之書。",
        "sourceText": "這解釋了訪客能自由行動，而艾琳會被操控。典禮冊不是能任意改寫世界的萬能之書。"
      },
      {
        "id": "act3-line104",
        "sourceLine": 104,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "紅玻璃另照出一張被覆印的舊命令。原本的公開罪名是「背叛王室」，下面還有被遮去的附件編號。",
        "sourceText": "紅玻璃另照出一張被覆印的舊命令。原本的公開罪名是「背叛王室」，下面還有被遮去的附件編號。"
      },
      {
        "id": "act3-line105",
        "sourceLine": 105,
        "type": "dialogue",
        "speaker": "erin",
        "text": "去找那份附件。我想知道，他們到底說我做了什麼。",
        "sourceText": "艾琳：「去找那份附件。我想知道，他們到底說我做了什麼。」"
      },
      {
        "id": "act3-line106",
        "sourceLine": 106,
        "type": "dialogue",
        "speaker": "ian",
        "text": "知道那些，救不了你。",
        "sourceText": "伊恩：「知道那些，救不了你。」"
      },
      {
        "id": "act3-line107",
        "sourceLine": 107,
        "type": "dialogue",
        "speaker": "erin",
        "text": "那至少讓我知道，我為什麼坐在這裡。",
        "sourceText": "艾琳：「那至少讓我知道，我為什麼坐在這裡。」"
      },
      {
        "id": "act3-line108",
        "sourceLine": 108,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【鐘面】23：45。",
        "sourceText": "【鐘面】23：45。"
      }
    ],
    "requiredEvents": [
      {
        "id": "cupThreat",
        "description": "銀杯方案操控艾琳"
      },
      {
        "id": "blockWater",
        "description": "阻斷送水，改採座椅而非取消處決"
      },
      {
        "id": "verifyStampedCommand",
        "description": "以燭臺測試有效執行印"
      },
      {
        "id": "revealAttachment",
        "description": "紅玻璃顯示舊命令與附件編號"
      }
    ],
    "entryConditions": [
      "collectGlass"
    ],
    "completionConditions": [
      "cupThreat",
      "blockWater",
      "verifyStampedCommand",
      "revealAttachment"
    ],
    "scareEventIds": [],
    "allowEmotionalPause": false
  },
  {
    "id": "act4",
    "number": 4,
    "title": "父王的命令",
    "sourceHeading": "第四幕：父王的命令｜23：45",
    "objectIds": [
      "portraits",
      "map",
      "relief",
      "speech",
      "executionOrder",
      "blackCloth",
      "maintenance"
    ],
    "entries": [
      {
        "id": "act4-line110",
        "sourceLine": 110,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【探索】畫廊中的畫像被拆開，名字牌錯置。相關證據需要交叉比對，才能還原同一晚的事件。訪客能重看每份文件。",
        "sourceText": "【探索】畫廊中的畫像被拆開，名字牌錯置。相關證據需要交叉比對，才能還原同一晚的事件。訪客能重看每份文件。"
      },
      {
        "id": "act4-line111",
        "sourceLine": 111,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "證據一：艾琳寫滿港口與道路的地圖。旁註：「典禮前，把帳冊帶出去。」",
        "sourceText": "證據一：艾琳寫滿港口與道路的地圖。旁註：「典禮前，把帳冊帶出去。」"
      },
      {
        "id": "act4-line112",
        "sourceLine": 112,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "證據二：城外救濟申請，連續遭拒；王室仍要求各地繳納宴會與加冕費用。",
        "sourceText": "證據二：城外救濟申請，連續遭拒；王室仍要求各地繳納宴會與加冕費用。"
      },
      {
        "id": "act4-line113",
        "sourceLine": 113,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "證據三：艾琳的演說稿。 「我不會接受以這些人的飢餓換來的王冠。今晚，我將公開帳冊，放棄繼承。」",
        "sourceText": "證據三：艾琳的演說稿。 「我不會接受以這些人的飢餓換來的王冠。今晚，我將公開帳冊，放棄繼承。」"
      },
      {
        "id": "act4-line114",
        "sourceLine": 114,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳讀完，說話越來越慢。",
        "sourceText": "艾琳讀完，說話越來越慢。"
      },
      {
        "id": "act4-line115",
        "sourceLine": 115,
        "type": "dialogue",
        "speaker": "erin",
        "text": "我不是因為想逃婚……也不是受人蠱惑。",
        "sourceText": "艾琳：「我不是因為想逃婚……也不是受人蠱惑。」"
      },
      {
        "id": "act4-line116",
        "sourceLine": 116,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客理解並點出其公開真相的意圖。）",
        "sourceText": "（訪客理解並點出其公開真相的意圖。）"
      },
      {
        "id": "act4-line117",
        "sourceLine": 117,
        "type": "dialogue",
        "speaker": "erin",
        "text": "我記起來了。他說只要我在典禮上低頭，就可以當作什麼都沒發生。",
        "sourceText": "艾琳：「我記起來了。他說只要我在典禮上低頭，就可以當作什麼都沒發生。」"
      },
      {
        "id": "act4-line118",
        "sourceLine": 118,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【最後文件】處決令。國王的簽名清晰可見。",
        "sourceText": "【最後文件】處決令。國王的簽名清晰可見。"
      },
      {
        "id": "act4-line119",
        "sourceLine": 119,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "「取消公開加冕，改行閉門終典。午夜鐘響，公主的心跳必須停止。典禮完成，方可散席。」",
        "sourceText": "「取消公開加冕，改行閉門終典。午夜鐘響，公主的心跳必須停止。典禮完成，方可散席。」"
      },
      {
        "id": "act4-line120",
        "sourceLine": 120,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳盯著簽名。",
        "sourceText": "艾琳盯著簽名。"
      },
      {
        "id": "act4-line121",
        "sourceLine": 121,
        "type": "dialogue",
        "speaker": "erin",
        "text": "我問過他……如果我不是公主，只是他的女兒，他還會不會簽。",
        "sourceText": "艾琳：「我問過他……如果我不是公主，只是他的女兒，他還會不會簽。」"
      },
      {
        "id": "act4-line122",
        "sourceLine": 122,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客追問國王的回答。）",
        "sourceText": "（訪客追問國王的回答。）"
      },
      {
        "id": "act4-line123",
        "sourceLine": 123,
        "type": "dialogue",
        "speaker": "erin",
        "text": "他叫人替我把王冠戴好。",
        "sourceText": "艾琳：「他叫人替我把王冠戴好。」"
      },
      {
        "id": "act4-line124",
        "sourceLine": 124,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【環境變化】宴會長桌下露出原本藏著的黑色桌布。這不是等待開始的慶典，而是尚未完成的處刑儀式。",
        "sourceText": "【環境變化】宴會長桌下露出原本藏著的黑色桌布。這不是等待開始的慶典，而是尚未完成的處刑儀式。"
      },
      {
        "id": "act4-line125",
        "sourceLine": 125,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "訪客找到工匠的維修紀錄：「報時停止，只能延後執行。凡已開始的王室終典，未完成便重演；設施復位，典禮冊與誓約紀錄留存。」",
        "sourceText": "訪客找到工匠的維修紀錄：「報時停止，只能延後執行。凡已開始的王室終典，未完成便重演；設施復位，典禮冊與誓約紀錄留存。」"
      },
      {
        "id": "act4-line126",
        "sourceLine": 126,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "附註：「外界不會跟著重來。」",
        "sourceText": "附註：「外界不會跟著重來。」"
      },
      {
        "id": "act4-line127",
        "sourceLine": 127,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "原來，工匠當年阻斷了行刑報時，卻無權撤銷國王簽署的命令。城堡只好反覆重演最後半小時。外面的王朝早已消失，城堡仍在執行那道命令。",
        "sourceText": "原來，工匠當年阻斷了行刑報時，卻無權撤銷國王簽署的命令。城堡只好反覆重演最後半小時。外面的王朝早已消失，城堡仍在執行那道命令。"
      },
      {
        "id": "act4-line128",
        "sourceLine": 128,
        "type": "dialogue",
        "speaker": "erin",
        "text": "所以他們都不在了……只有我還在等他改變主意。",
        "sourceText": "艾琳：「所以他們都不在了……只有我還在等他改變主意。」"
      },
      {
        "id": "act4-line129",
        "sourceLine": 129,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【停留】此處不驚嚇。訪客可與艾琳交談，也可繼續探索。",
        "sourceText": "【停留】此處不驚嚇。訪客可與艾琳交談，也可繼續探索。"
      }
    ],
    "requiredEvents": [
      {
        "id": "restorePortraits",
        "description": "還原畫像及名字牌"
      },
      {
        "id": "crossCheckEvidence",
        "description": "交叉比對地圖、救濟申請及演說稿"
      },
      {
        "id": "readExecutionOrder",
        "description": "確認國王為阻止公開帳冊及放棄繼承而簽署處決"
      },
      {
        "id": "revealBlackCloth",
        "description": "顯露黑桌布"
      },
      {
        "id": "readLoopRule",
        "description": "確認報時停止僅延後，終典未完成會重演，外界不重來"
      }
    ],
    "entryConditions": [
      "revealAttachment"
    ],
    "completionConditions": [
      "restorePortraits",
      "crossCheckEvidence",
      "readExecutionOrder",
      "revealBlackCloth",
      "readLoopRule"
    ],
    "scareEventIds": [],
    "allowEmotionalPause": true
  },
  {
    "id": "act5",
    "number": 5,
    "title": "你們不是第一次見面",
    "sourceHeading": "第五幕：你們不是第一次見面｜23：45 → 23：50",
    "objectIds": [
      "photo",
      "pursuit",
      "deathRecord",
      "oath",
      "glass",
      "diary",
      "musicBox"
    ],
    "entries": [
      {
        "id": "act5-line131",
        "sourceLine": 131,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【探索】工匠的合照裡有一名年輕學徒。照片邊緣，艾琳正把手伸向他手裡的音樂盒。",
        "sourceText": "【探索】工匠的合照裡有一名年輕學徒。照片邊緣，艾琳正把手伸向他手裡的音樂盒。"
      },
      {
        "id": "act5-line132",
        "sourceLine": 132,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "背面：「伊恩總是把最後兩音彈反。——艾琳」",
        "sourceText": "背面：「伊恩總是把最後兩音彈反。——艾琳」"
      },
      {
        "id": "act5-line133",
        "sourceLine": 133,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客向暗處質疑伊恩的身分。）",
        "sourceText": "（訪客向暗處質疑伊恩的身分。）"
      },
      {
        "id": "act5-line134",
        "sourceLine": 134,
        "type": "dialogue",
        "speaker": "ian",
        "text": "繼續找出口。照片不重要。",
        "sourceText": "伊恩：「繼續找出口。照片不重要。」"
      },
      {
        "id": "act5-line135",
        "sourceLine": 135,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "下一份文件記錄：伊恩是維護城堡機關的工匠學徒，因協助公主外逃遭到追捕。",
        "sourceText": "下一份文件記錄：伊恩是維護城堡機關的工匠學徒，因協助公主外逃遭到追捕。"
      },
      {
        "id": "act5-line136",
        "sourceLine": 136,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【第二次驚嚇】訪客翻到死亡紀錄時，伊恩的聲音突然從極近處傳來。",
        "sourceText": "【第二次驚嚇】訪客翻到死亡紀錄時，伊恩的聲音突然從極近處傳來。"
      },
      {
        "id": "act5-line137",
        "sourceLine": 137,
        "type": "dialogue",
        "speaker": "ian",
        "text": "別看那一頁！",
        "sourceText": "伊恩：「別看那一頁！」"
      },
      {
        "id": "act5-line138",
        "sourceLine": 138,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "燭火猛然縮小，文件仍保持可讀。沒有突現的臉，也沒有鏡子。",
        "sourceText": "燭火猛然縮小，文件仍保持可讀。沒有突現的臉，也沒有鏡子。"
      },
      {
        "id": "act5-line139",
        "sourceLine": 139,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "訪客讀完：「報時恢復前，學徒於出口阻擋衛兵，死亡。其身分已載入本次典禮，亡者聲息留於場內，待散席解除。」",
        "sourceText": "訪客讀完：「報時恢復前，學徒於出口阻擋衛兵，死亡。其身分已載入本次典禮，亡者聲息留於場內，待散席解除。」"
      },
      {
        "id": "act5-line140",
        "sourceLine": 140,
        "type": "dialogue",
        "speaker": "erin",
        "text": "你以前就認識我。",
        "sourceText": "艾琳：「你以前就認識我。」"
      },
      {
        "id": "act5-line141",
        "sourceLine": 141,
        "type": "dialogue",
        "speaker": "ian",
        "text": "是。",
        "sourceText": "伊恩：「是。」"
      },
      {
        "id": "act5-line142",
        "sourceLine": 142,
        "type": "dialogue",
        "speaker": "erin",
        "text": "那你為什麼一直叫我公主？",
        "sourceText": "艾琳：「那你為什麼一直叫我公主？」"
      },
      {
        "id": "act5-line143",
        "sourceLine": 143,
        "type": "dialogue",
        "speaker": "ian",
        "text": "因為你讓我這麼叫。",
        "sourceText": "伊恩：「因為你讓我這麼叫。」"
      },
      {
        "id": "act5-line144",
        "sourceLine": 144,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【記憶證據】紅玻璃照出日記私人頁上被覆印的誓約。旁邊是艾琳自己的指印。",
        "sourceText": "【記憶證據】紅玻璃照出日記私人頁上被覆印的誓約。旁邊是艾琳自己的指印。"
      },
      {
        "id": "act5-line145",
        "sourceLine": 145,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "「我自願封存伊恩的名字與相伴記憶。若我親口撤回，此誓解除。」",
        "sourceText": "「我自願封存伊恩的名字與相伴記憶。若我親口撤回，此誓解除。」"
      },
      {
        "id": "act5-line146",
        "sourceLine": 146,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "下面另有一句私人留言：「如果我不記得，就不要再告訴我你死了。我不知道自己還能再失去你幾次。」",
        "sourceText": "下面另有一句私人留言：「如果我不記得，就不要再告訴我你死了。我不知道自己還能再失去你幾次。」"
      },
      {
        "id": "act5-line147",
        "sourceLine": 147,
        "type": "dialogue",
        "speaker": "ian",
        "text": "我不是來過一次。我陪你試過很多次。",
        "sourceText": "伊恩：「我不是來過一次。我陪你試過很多次。」"
      },
      {
        "id": "act5-line148",
        "sourceLine": 148,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "「每次回到十一點半，你都問我在哪裡。每次我說不能出來，你就想起門口發生的事。」",
        "sourceText": "「每次回到十一點半，你都問我在哪裡。每次我說不能出來，你就想起門口發生的事。」"
      },
      {
        "id": "act5-line149",
        "sourceLine": 149,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "「後來你求我，讓你忘記。」",
        "sourceText": "「後來你求我，讓你忘記。」"
      },
      {
        "id": "act5-line150",
        "sourceLine": 150,
        "type": "dialogue",
        "speaker": "erin",
        "text": "所以你答應，下次裝作不認識我？",
        "sourceText": "艾琳：「所以你答應，下次裝作不認識我？」"
      },
      {
        "id": "act5-line151",
        "sourceLine": 151,
        "type": "dialogue",
        "speaker": "ian",
        "text": "我以為那樣你會好過一點。",
        "sourceText": "伊恩：「我以為那樣你會好過一點。」"
      },
      {
        "id": "act5-line152",
        "sourceLine": 152,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客指責其刻意隱瞞的作為。）",
        "sourceText": "（訪客指責其刻意隱瞞的作為。）"
      },
      {
        "id": "act5-line153",
        "sourceLine": 153,
        "type": "dialogue",
        "speaker": "ian",
        "text": "我怕她又走回同一條路。",
        "sourceText": "伊恩：「我怕她又走回同一條路。」"
      },
      {
        "id": "act5-line154",
        "sourceLine": 154,
        "type": "dialogue",
        "speaker": "erin",
        "text": "你把所有難過的部分藏起來，也把我們找到過的答案藏起來了。",
        "sourceText": "艾琳：「你把所有難過的部分藏起來，也把我們找到過的答案藏起來了。」"
      },
      {
        "id": "act5-line155",
        "sourceLine": 155,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【艾琳的選擇】她走到高臺最外緣，示意將日記拿近。",
        "sourceText": "【艾琳的選擇】她走到高臺最外緣，示意將日記拿近。"
      },
      {
        "id": "act5-line156",
        "sourceLine": 156,
        "type": "dialogue",
        "speaker": "erin",
        "text": "這次，我想自己決定要記得什麼。",
        "sourceText": "艾琳：「這次，我想自己決定要記得什麼。」"
      },
      {
        "id": "act5-line157",
        "sourceLine": 157,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "她依誓約條文親口撤回封存。覆印消退，音樂盒的旋律完整響起。",
        "sourceText": "她依誓約條文親口撤回封存。覆印消退，音樂盒的旋律完整響起。"
      },
      {
        "id": "act5-line158",
        "sourceLine": 158,
        "type": "dialogue",
        "speaker": "erin",
        "text": "伊恩。那天你說，出去以後要帶我去看海。",
        "sourceText": "艾琳：「伊恩。那天你說，出去以後要帶我去看海。」"
      },
      {
        "id": "act5-line159",
        "sourceLine": 159,
        "type": "dialogue",
        "speaker": "ian",
        "text": "你說城堡畫裡的海太整齊，一定是假的。",
        "sourceText": "伊恩：「你說城堡畫裡的海太整齊，一定是假的。」"
      },
      {
        "id": "act5-line160",
        "sourceLine": 160,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳笑了一下，又哭出來。",
        "sourceText": "艾琳笑了一下，又哭出來。"
      },
      {
        "id": "act5-line161",
        "sourceLine": 161,
        "type": "dialogue",
        "speaker": "erin",
        "text": "我想起來了。",
        "sourceText": "艾琳：「我想起來了。」"
      },
      {
        "id": "act5-line162",
        "sourceLine": 162,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【鐘面】23：50。",
        "sourceText": "【鐘面】23：50。"
      }
    ],
    "requiredEvents": [
      {
        "id": "identifyIan",
        "description": "合照及追捕紀錄揭露學徒身分"
      },
      {
        "id": "readDeathRecord",
        "description": "閱讀死亡紀錄，伊恩近聲、燭火縮小但文件可讀"
      },
      {
        "id": "revealOath",
        "description": "紅玻璃顯示艾琳自願封存的誓約與留言"
      },
      {
        "id": "confrontConcealment",
        "description": "艾琳與伊恩面對隱瞞記憶的後果"
      },
      {
        "id": "erinRevokesOath",
        "description": "艾琳親口撤回誓約，恢復記憶與完整旋律"
      }
    ],
    "entryConditions": [
      "readLoopRule"
    ],
    "completionConditions": [
      "identifyIan",
      "readDeathRecord",
      "revealOath",
      "confrontConcealment",
      "erinRevokesOath"
    ],
    "scareEventIds": [
      "readDeathRecord"
    ],
    "allowEmotionalPause": true
  },
  {
    "id": "act6",
    "number": 6,
    "title": "另一位公主",
    "sourceHeading": "第六幕：另一位公主｜23：50 → 23：55",
    "objectIds": [
      "cabinet",
      "research",
      "dummy",
      "heart",
      "crown",
      "book",
      "dais",
      "entrance"
    ],
    "entries": [
      {
        "id": "act6-line164",
        "sourceLine": 164,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【探索】伊恩指出工匠的研究藏在替身人偶的底座。櫃中是一具穿著試衣布裙的人偶，內部有未完成的發條心臟。",
        "sourceText": "【探索】伊恩指出工匠的研究藏在替身人偶的底座。櫃中是一具穿著試衣布裙的人偶，內部有未完成的發條心臟。"
      },
      {
        "id": "act6-line165",
        "sourceLine": 165,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "工匠筆記：「原為試衣與典禮排演而造。偶然加冠，城堡竟向其行禮。」",
        "sourceText": "工匠筆記：「原為試衣與典禮排演而造。偶然加冠，城堡竟向其行禮。」"
      },
      {
        "id": "act6-line166",
        "sourceLine": 166,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "下一頁：「登記裝置辨識規律心搏，不辨血肉。尚待驗證：如何穩定轉移、如何使午夜判定成立。」",
        "sourceText": "下一頁：「登記裝置辨識規律心搏，不辨血肉。尚待驗證：如何穩定轉移、如何使午夜判定成立。」"
      },
      {
        "id": "act6-line167",
        "sourceLine": 167,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "最後一頁戛然而止，附著王室的搜查封條。工匠尚未完成研究便被捕，伊恩之後只搶救出部分裝置。",
        "sourceText": "最後一頁戛然而止，附著王室的搜查封條。工匠尚未完成研究便被捕，伊恩之後只搶救出部分裝置。"
      },
      {
        "id": "act6-line168",
        "sourceLine": 168,
        "type": "dialogue",
        "speaker": "ian",
        "text": "那天我以為，只要把人偶放上去，就能帶她走。我沒確認登記成功。大門沒有開，衛兵追了過來。",
        "sourceText": "伊恩：「那天我以為，只要把人偶放上去，就能帶她走。我沒確認登記成功。大門沒有開，衛兵追了過來。」"
      },
      {
        "id": "act6-line169",
        "sourceLine": 169,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【劇情必要發現】當運作中的人偶戴冠、扣環閉合，典禮冊上的「公主」圖像轉向人偶。高臺照明也轉向它。艾琳試探著把腳伸下最後一階。",
        "sourceText": "【劇情必要發現】當運作中的人偶戴冠、扣環閉合，典禮冊上的「公主」圖像轉向人偶。高臺照明也轉向它。艾琳試探著把腳伸下最後一階。"
      },
      {
        "id": "act6-line170",
        "sourceLine": 170,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "這次，她踩到了地板。",
        "sourceText": "這次，她踩到了地板。"
      },
      {
        "id": "act6-line171",
        "sourceLine": 171,
        "type": "dialogue",
        "speaker": "erin",
        "text": "我……下來了。",
        "sourceText": "艾琳：「我……下來了。」"
      },
      {
        "id": "act6-line172",
        "sourceLine": 172,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "她立即去推大門。門仍關著，門上浮現：「典禮未畢。」",
        "sourceText": "她立即去推大門。門仍關著，門上浮現：「典禮未畢。」"
      },
      {
        "id": "act6-line173",
        "sourceLine": 173,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "訪客繼續觀察，確認已登記的人偶暫停心跳時，身分並未轉回艾琳。由此確定：新對象必須在有規律心跳時完成登記；登記一旦成立，不因停跳或取下王冠自行消失。",
        "sourceText": "訪客繼續觀察，確認已登記的人偶暫停心跳時，身分並未轉回艾琳。由此確定：新對象必須在有規律心跳時完成登記；登記一旦成立，不因停跳或取下王冠自行消失。"
      },
      {
        "id": "act6-line174",
        "sourceLine": 174,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客點出命令本身的字面盲點。）",
        "sourceText": "（訪客點出命令本身的字面盲點。）"
      },
      {
        "id": "act6-line175",
        "sourceLine": 175,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳看向冊上的文字。",
        "sourceText": "艾琳看向冊上的文字。"
      },
      {
        "id": "act6-line176",
        "sourceLine": 176,
        "type": "dialogue",
        "speaker": "erin",
        "text": "它要的是公主。",
        "sourceText": "艾琳：「它要的是公主。」"
      },
      {
        "id": "act6-line177",
        "sourceLine": 177,
        "type": "dialogue",
        "speaker": "ian",
        "text": "如果午夜停止的是它的心跳……",
        "sourceText": "伊恩：「如果午夜停止的是它的心跳……」"
      },
      {
        "id": "act6-line178",
        "sourceLine": 178,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客確認此為可行解法。）",
        "sourceText": "（訪客確認此為可行解法。）"
      },
      {
        "id": "act6-line179",
        "sourceLine": 179,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【情感停頓】艾琳看著人偶。她想起父王替她戴冠的那一天，也想起畫像下被塗掉的名字。",
        "sourceText": "【情感停頓】艾琳看著人偶。她想起父王替她戴冠的那一天，也想起畫像下被塗掉的名字。"
      },
      {
        "id": "act6-line180",
        "sourceLine": 180,
        "type": "dialogue",
        "speaker": "erin",
        "text": "如果它成了公主，那我呢？",
        "sourceText": "艾琳：「如果它成了公主，那我呢？」"
      },
      {
        "id": "act6-line181",
        "sourceLine": 181,
        "type": "dialogue",
        "speaker": "ian",
        "text": "我收到的第一封信，署名從來不是公主。",
        "sourceText": "伊恩：「我收到的第一封信，署名從來不是公主。」"
      },
      {
        "id": "act6-line182",
        "sourceLine": 182,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳轉身。",
        "sourceText": "艾琳轉身。"
      },
      {
        "id": "act6-line183",
        "sourceLine": 183,
        "type": "dialogue",
        "speaker": "ian",
        "text": "是艾琳。",
        "sourceText": "伊恩：「是艾琳。」"
      },
      {
        "id": "act6-line184",
        "sourceLine": 184,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳把王冠扶正在人偶頭上，退開一步。",
        "sourceText": "艾琳把王冠扶正在人偶頭上，退開一步。"
      },
      {
        "id": "act6-line185",
        "sourceLine": 185,
        "type": "dialogue",
        "speaker": "erin",
        "text": "那就讓公主留在這裡。",
        "sourceText": "艾琳：「那就讓公主留在這裡。」"
      },
      {
        "id": "act6-line186",
        "sourceLine": 186,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "「帶艾琳出去。」",
        "sourceText": "「帶艾琳出去。」"
      },
      {
        "id": "act6-line187",
        "sourceLine": 187,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【鐘面】23：55。",
        "sourceText": "【鐘面】23：55。"
      }
    ],
    "requiredEvents": [
      {
        "id": "readResearch",
        "description": "讀工匠未完成研究及伊恩未確認登記的舊錯誤"
      },
      {
        "id": "stabilizeHeart",
        "description": "完成心臟並使心跳穩定"
      },
      {
        "id": "registerDummy",
        "description": "穩定心跳、戴冠及扣環閉合後有效登記"
      },
      {
        "id": "erinStepsDown",
        "description": "冊子及照明轉向人偶，艾琳下高臺"
      },
      {
        "id": "doorStillLocked",
        "description": "大門顯示典禮未畢"
      },
      {
        "id": "testRegistrationPersists",
        "description": "實驗登記後停心或取冠不取消身分"
      },
      {
        "id": "chooseErin",
        "description": "艾琳選擇讓公主留下、帶艾琳出去"
      }
    ],
    "entryConditions": [
      "erinRevokesOath"
    ],
    "completionConditions": [
      "readResearch",
      "stabilizeHeart",
      "registerDummy",
      "erinStepsDown",
      "doorStillLocked",
      "testRegistrationPersists",
      "chooseErin"
    ],
    "scareEventIds": [],
    "allowEmotionalPause": true
  },
  {
    "id": "act7",
    "number": 7,
    "title": "最後一次典禮",
    "sourceHeading": "第七幕：最後一次典禮｜23：55 → 00：00",
    "objectIds": [
      "dummy",
      "heart",
      "crown",
      "clock",
      "brake",
      "support",
      "emptyChairs",
      "book",
      "entrance"
    ],
    "entries": [
      {
        "id": "act7-line189",
        "sourceLine": 189,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【自由探索保留】訪客回看全部證據、準備報時與制動裝置。艾琳協助移動人偶、辨認典禮流程；伊恩說明當年的錯誤。",
        "sourceText": "【自由探索保留】訪客回看全部證據、準備報時與制動裝置。艾琳協助移動人偶、辨認典禮流程；伊恩說明當年的錯誤。"
      },
      {
        "id": "act7-line190",
        "sourceLine": 190,
        "type": "dialogue",
        "speaker": "erin",
        "text": "這根拉索接的是哪裡？",
        "sourceText": "艾琳：「這根拉索接的是哪裡？」"
      },
      {
        "id": "act7-line191",
        "sourceLine": 191,
        "type": "dialogue",
        "speaker": "ian",
        "text": "我不確定。以前我沒有拆到這裡。",
        "sourceText": "伊恩：「我不確定。以前我沒有拆到這裡。」"
      },
      {
        "id": "act7-line192",
        "sourceLine": 192,
        "type": "dialogue",
        "speaker": "erin",
        "text": "那就一起確認。",
        "sourceText": "艾琳：「那就一起確認。」"
      },
      {
        "id": "act7-line193",
        "sourceLine": 193,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【故事上的必要條件】人偶產生穩定心跳、有效登記為公主，最後由午夜報時觸發制動，使它的心臟停止。",
        "sourceText": "【故事上的必要條件】人偶產生穩定心跳、有效登記為公主，最後由午夜報時觸發制動，使它的心臟停止。"
      },
      {
        "id": "act7-line194",
        "sourceLine": 194,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【啟動前】大廳安靜下來。",
        "sourceText": "【啟動前】大廳安靜下來。"
      },
      {
        "id": "act7-line195",
        "sourceLine": 195,
        "type": "dialogue",
        "speaker": "erin",
        "text": "你還記得我一開始請你答應的事嗎？",
        "sourceText": "艾琳：「你還記得我一開始請你答應的事嗎？」"
      },
      {
        "id": "act7-line196",
        "sourceLine": 196,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客回應當初的承諾。）",
        "sourceText": "（訪客回應當初的承諾。）"
      },
      {
        "id": "act7-line197",
        "sourceLine": 197,
        "type": "dialogue",
        "speaker": "erin",
        "text": "現在呢？",
        "sourceText": "艾琳：「現在呢？」"
      },
      {
        "id": "act7-line198",
        "sourceLine": 198,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客給予信任與決心的回應。）",
        "sourceText": "（訪客給予信任與決心的回應。）"
      },
      {
        "id": "act7-line199",
        "sourceLine": 199,
        "type": "dialogue",
        "speaker": "erin",
        "text": "好。那就不要再等了。",
        "sourceText": "艾琳：「好。那就不要再等了。」"
      },
      {
        "id": "act7-line200",
        "sourceLine": 200,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【正式推進】人偶在高臺上規律敲擊。典禮冊顯示當前登記對象，艾琳站在身旁。",
        "sourceText": "【正式推進】人偶在高臺上規律敲擊。典禮冊顯示當前登記對象，艾琳站在身旁。"
      },
      {
        "id": "act7-line201",
        "sourceLine": 201,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "23：59。鐘錘升起。",
        "sourceText": "23：59。鐘錘升起。"
      },
      {
        "id": "act7-line202",
        "sourceLine": 202,
        "type": "dialogue",
        "speaker": "ian",
        "text": "這次別把她往門口拉。等命令結束。",
        "sourceText": "伊恩：「這次別把她往門口拉。等命令結束。」"
      },
      {
        "id": "act7-line203",
        "sourceLine": 203,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "00：00。第一記鐘聲。制動桿落下，人偶心跳停止。",
        "sourceText": "00：00。第一記鐘聲。制動桿落下，人偶心跳停止。"
      },
      {
        "id": "act7-line204",
        "sourceLine": 204,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "全部燈火熄滅。",
        "sourceText": "全部燈火熄滅。"
      },
      {
        "id": "act7-line205",
        "sourceLine": 205,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "典禮冊自行亮起：「午夜鐘響，公主的心跳必須停止。」",
        "sourceText": "典禮冊自行亮起：「午夜鐘響，公主的心跳必須停止。」"
      },
      {
        "id": "act7-line206",
        "sourceLine": 206,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "文字停住。",
        "sourceText": "文字停住。"
      },
      {
        "id": "act7-line207",
        "sourceLine": 207,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "隨後改為：「午夜鐘響，公主的心跳已停止。」",
        "sourceText": "隨後改為：「午夜鐘響，公主的心跳已停止。」"
      },
      {
        "id": "act7-line208",
        "sourceLine": 208,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【第三次驚嚇】典禮機關做出最後一次確認：人偶被座椅內的儀式支架猛然拉直，頭部垂向訪客。長桌兩側的空椅同時後退，發出刺耳的起立聲。人偶胸口的心跳標記保持熄滅。",
        "sourceText": "【第三次驚嚇】典禮機關做出最後一次確認：人偶被座椅內的儀式支架猛然拉直，頭部垂向訪客。長桌兩側的空椅同時後退，發出刺耳的起立聲。人偶胸口的心跳標記保持熄滅。"
      },
      {
        "id": "act7-line209",
        "sourceLine": 209,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳伸手握住訪客的手臂。",
        "sourceText": "艾琳伸手握住訪客的手臂。"
      },
      {
        "id": "act7-line210",
        "sourceLine": 210,
        "type": "dialogue",
        "speaker": "erin",
        "text": "我在這裡。",
        "sourceText": "艾琳：「我在這裡。」"
      },
      {
        "id": "act7-line211",
        "sourceLine": 211,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "燈光恢復。人偶仍戴著王冠，毫無聲息。",
        "sourceText": "燈光恢復。人偶仍戴著王冠，毫無聲息。"
      },
      {
        "id": "act7-line212",
        "sourceLine": 212,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "典禮冊蓋下最後的印章：「終典完成。准予散席。」",
        "sourceText": "典禮冊蓋下最後的印章：「終典完成。准予散席。」"
      },
      {
        "id": "act7-line213",
        "sourceLine": 213,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "大門開啟。雨後的風第一次吹進大廳。",
        "sourceText": "大門開啟。雨後的風第一次吹進大廳。"
      }
    ],
    "requiredEvents": [
      {
        "id": "prepareMechanism",
        "description": "回看證據，共同確認報時及制動連接"
      },
      {
        "id": "readyForFinale",
        "description": "人偶心跳穩定且有效登記，報時及制動已備妥"
      },
      {
        "id": "recallPromise",
        "description": "回應最初誠實承諾"
      },
      {
        "id": "startFinale",
        "description": "訪客主動啟動終典"
      },
      {
        "id": "midnightBrake",
        "description": "午夜報時觸發制動，人偶停心"
      },
      {
        "id": "bookConfirmsStopped",
        "description": "典禮冊確認公主心跳已停止"
      },
      {
        "id": "finalScare",
        "description": "人偶支架拉直與空椅後退，心跳標記不亮"
      },
      {
        "id": "ceremonyComplete",
        "description": "冊子蓋章終典完成、准予散席"
      },
      {
        "id": "doorOpens",
        "description": "完成後大門開啟"
      }
    ],
    "entryConditions": [
      "chooseErin"
    ],
    "completionConditions": [
      "prepareMechanism",
      "readyForFinale",
      "recallPromise",
      "startFinale",
      "midnightBrake",
      "bookConfirmsStopped",
      "finalScare",
      "ceremonyComplete",
      "doorOpens"
    ],
    "scareEventIds": [
      "finalScare"
    ],
    "allowEmotionalPause": false
  },
  {
    "id": "act8",
    "number": 8,
    "title": "不是公主的明天",
    "sourceHeading": "第八幕：不是公主的明天",
    "objectIds": [
      "letter",
      "entrance",
      "musicBox",
      "dummy",
      "crown",
      "book",
      "diary"
    ],
    "entries": [
      {
        "id": "act8-line215",
        "sourceLine": 215,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳走向門口，又停下來。",
        "sourceText": "艾琳走向門口，又停下來。"
      },
      {
        "id": "act8-line216",
        "sourceLine": 216,
        "type": "dialogue",
        "speaker": "erin",
        "text": "伊恩？",
        "sourceText": "艾琳：「伊恩？」"
      },
      {
        "id": "act8-line217",
        "sourceLine": 217,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "伊恩的聲音越來越輕。",
        "sourceText": "伊恩的聲音越來越輕。"
      },
      {
        "id": "act8-line218",
        "sourceLine": 218,
        "type": "dialogue",
        "speaker": "ian",
        "text": "外面……天亮了嗎？",
        "sourceText": "伊恩：「外面……天亮了嗎？」"
      },
      {
        "id": "act8-line219",
        "sourceLine": 219,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳看向門外。",
        "sourceText": "艾琳看向門外。"
      },
      {
        "id": "act8-line220",
        "sourceLine": 220,
        "type": "dialogue",
        "speaker": "erin",
        "text": "還沒有。可是快了。",
        "sourceText": "艾琳：「還沒有。可是快了。」"
      },
      {
        "id": "act8-line221",
        "sourceLine": 221,
        "type": "dialogue",
        "speaker": "ian",
        "text": "那就好。你先走。別等我。",
        "sourceText": "伊恩：「那就好。你先走。別等我。」"
      },
      {
        "id": "act8-line222",
        "sourceLine": 222,
        "type": "dialogue",
        "speaker": "erin",
        "text": "我不會再把你忘掉。",
        "sourceText": "艾琳：「我不會再把你忘掉。」"
      },
      {
        "id": "act8-line223",
        "sourceLine": 223,
        "type": "dialogue",
        "speaker": "ian",
        "text": "那就夠了。",
        "sourceText": "伊恩：「那就夠了。」"
      },
      {
        "id": "act8-line224",
        "sourceLine": 224,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "音樂盒旋律響起，不再中斷。曲終，伊恩的聲音消失. 留下的亡者獲准離席。",
        "sourceText": "音樂盒旋律響起，不再中斷。曲終，伊恩的聲音消失. 留下的亡者獲准離席。"
      },
      {
        "id": "act8-line225",
        "sourceLine": 225,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳站了一會兒，才跨出門檻。",
        "sourceText": "艾琳站了一會兒，才跨出門檻。"
      },
      {
        "id": "act8-line226",
        "sourceLine": 226,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【城堡外】天空泛白。城堡恢復荒廢的模樣，窗內再也看不到宴會燈火。",
        "sourceText": "【城堡外】天空泛白。城堡恢復荒廢的模樣，窗內再也看不到宴會燈火。"
      },
      {
        "id": "act8-line227",
        "sourceLine": 227,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳向訪客要回求救信，在背面補寫：「我已經出來了。——艾琳」",
        "sourceText": "艾琳向訪客要回求救信，在背面補寫：「我已經出來了。——艾琳」"
      },
      {
        "id": "act8-line228",
        "sourceLine": 228,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "（訪客詢問接下來的動向。）",
        "sourceText": "（訪客詢問接下來的動向。）"
      },
      {
        "id": "act8-line229",
        "sourceLine": 229,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "艾琳看向遠處。",
        "sourceText": "艾琳看向遠處。"
      },
      {
        "id": "act8-line230",
        "sourceLine": 230,
        "type": "dialogue",
        "speaker": "erin",
        "text": "先找一條真的通往海邊的路。",
        "sourceText": "艾琳：「先找一條真的通往海邊的路。」"
      },
      {
        "id": "act8-line231",
        "sourceLine": 231,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "【最後畫面】空蕩的大廳。人偶坐在高臺上，王冠覆著晨光。",
        "sourceText": "【最後畫面】空蕩的大廳。人偶坐在高臺上，王冠覆著晨光。"
      },
      {
        "id": "act8-line232",
        "sourceLine": 232,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "典禮冊的正式紀錄：「公主：已死。」",
        "sourceText": "典禮冊的正式紀錄：「公主：已死。」"
      },
      {
        "id": "act8-line233",
        "sourceLine": 233,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "日記上補寫的一行字：「艾琳：今天第一次，不必準時入席。」",
        "sourceText": "日記上補寫的一行字：「艾琳：今天第一次，不必準時入席。」"
      },
      {
        "id": "act8-line234",
        "sourceLine": 234,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "畫面淡出。",
        "sourceText": "畫面淡出。"
      },
      {
        "id": "act8-line235",
        "sourceLine": 235,
        "type": "directionOrDocument",
        "speaker": null,
        "text": "「結局：公主今晚已死，艾琳擁有明天。」",
        "sourceText": "「結局：公主今晚已死，艾琳擁有明天。」"
      }
    ],
    "requiredEvents": [
      {
        "id": "farewellIan",
        "description": "艾琳承諾不忘記，伊恩道別"
      },
      {
        "id": "releaseIan",
        "description": "完整旋律曲終，伊恩聲音消失，獲准離席"
      },
      {
        "id": "erinLeaves",
        "description": "艾琳跨出門檻，城堡恢復荒廢"
      },
      {
        "id": "letterReply",
        "description": "求救信背面補寫已經出來"
      },
      {
        "id": "finalRecords",
        "description": "呈現公主已死與艾琳擁有明天的紀錄"
      }
    ],
    "entryConditions": [
      "doorOpens"
    ],
    "completionConditions": [
      "farewellIan",
      "releaseIan",
      "erinLeaves",
      "letterReply",
      "finalRecords"
    ],
    "scareEventIds": [],
    "allowEmotionalPause": true
  }
];

export const stages = [
  {
    "id": "opening",
    "title": "開場",
    "actIds": [
      "act1"
    ],
    "storyTimeAtEntry": "23:30",
    "storyTimeAtCompletion": "23:30",
    "entryConditions": [],
    "completionConditions": [
      "respondIan",
      "enterHall",
      "erinRestricted",
      "readCommand",
      "promiseHonesty",
      "explorationOpened"
    ],
    "timeAdvanceEventId": null
  },
  {
    "id": "piano",
    "title": "第一關：鋼琴",
    "actIds": [
      "act2"
    ],
    "storyTimeAtEntry": "23:30",
    "storyTimeAtCompletion": "23:40",
    "entryConditions": [
      "explorationOpened"
    ],
    "completionConditions": [
      "hearWrongMelody",
      "comparePianoEvidence",
      "sharedMelody",
      "solvePiano",
      "fifthTone",
      "collectGlass"
    ],
    "timeAdvanceEventId": "collectGlass"
  },
  {
    "id": "ceremonyBook",
    "title": "第二關：典禮冊",
    "actIds": [
      "act3"
    ],
    "storyTimeAtEntry": "23:40",
    "storyTimeAtCompletion": "23:45",
    "entryConditions": [
      "collectGlass"
    ],
    "completionConditions": [
      "cupThreat",
      "blockWater",
      "verifyStampedCommand",
      "revealAttachment"
    ],
    "timeAdvanceEventId": "revealAttachment"
  },
  {
    "id": "gallery",
    "title": "第三關：畫廊與記憶",
    "actIds": [
      "act4",
      "act5"
    ],
    "storyTimeAtEntry": "23:45",
    "storyTimeAtCompletion": "23:50",
    "entryConditions": [
      "revealAttachment"
    ],
    "completionConditions": [
      "restorePortraits",
      "crossCheckEvidence",
      "readExecutionOrder",
      "revealBlackCloth",
      "readLoopRule",
      "identifyIan",
      "readDeathRecord",
      "revealOath",
      "confrontConcealment",
      "erinRevokesOath"
    ],
    "timeAdvanceEventId": "erinRevokesOath"
  },
  {
    "id": "dummy",
    "title": "第四關：人偶",
    "actIds": [
      "act6"
    ],
    "storyTimeAtEntry": "23:50",
    "storyTimeAtCompletion": "23:55",
    "entryConditions": [
      "erinRevokesOath"
    ],
    "completionConditions": [
      "readResearch",
      "stabilizeHeart",
      "registerDummy",
      "erinStepsDown",
      "doorStillLocked",
      "testRegistrationPersists",
      "chooseErin"
    ],
    "timeAdvanceEventId": "chooseErin"
  },
  {
    "id": "finale",
    "title": "第五關：終典",
    "actIds": [
      "act7"
    ],
    "storyTimeAtEntry": "23:55",
    "storyTimeAtCompletion": "00:00",
    "entryConditions": [
      "chooseErin"
    ],
    "completionConditions": [
      "prepareMechanism",
      "readyForFinale",
      "recallPromise",
      "startFinale",
      "midnightBrake",
      "bookConfirmsStopped",
      "finalScare",
      "ceremonyComplete",
      "doorOpens"
    ],
    "timeAdvanceEventId": "doorOpens"
  },
  {
    "id": "ending",
    "title": "結局",
    "actIds": [
      "act8"
    ],
    "storyTimeAtEntry": "00:00",
    "storyTimeAtCompletion": "after-midnight-before-dawn",
    "entryConditions": [
      "doorOpens"
    ],
    "completionConditions": [
      "farewellIan",
      "releaseIan",
      "erinLeaves",
      "letterReply",
      "finalRecords"
    ],
    "timeAdvanceEventId": "finalRecords"
  }
];

