// 步驟 06 的互動入口與簡短回饋；正式文件、對話及謎題仍依後續步驟加入。
export const actionLabels = { inspect: '查看', talk: '交談', pickup: '拾取', operate: '操作' };
import {pianoClueTargets} from './piano-clue-data.js';
export const interactionTargets = [{"id":"gallery-notice","label":"畫廊入口告示","action":"inspect","area":"hall","prefixes":["gallery-notice-"],"focus":[-2.8,2.5,-18.5],"approach":[-2.8,-20.5],"message":"三幅肖像封存著終典開始前的真相。"},
  {
    "id": "door",
    "label": "城堡大門",
    "action": "operate",
    "area": "both",
    "prefixes": [
      "closed-door",
      "door-seam"
    ],
    "focus": [
      0,
      2.9,
      11.73
    ],
    "approach": [
      0,
      9.8
    ],
    "message": "大門仍然緊閉，門上的機關沒有鬆開。"
  },
  {
    "id": "piano",
    "label": "鋼琴",
    "action": "operate",
    "area": "hall",
    "prefixes": [
      "piano-",
      "white-key",
      "black-key"
    ],
    "focus": [
      -19.0,
      1.78,
      -1.35
    ],
    "approach": [
      -19.0,
      0.8
    ],
    "message": "鋼琴上的符號，似乎與周圍的線索有關。"
  },
  {
    "id": "book",
    "label": "王室典禮紀錄",
    "action": "inspect",
    "area": "hall",
    "prefixes": [
      "book-"
    ],
    "focus": [
      6.7,
      2.21,
      4
    ],
    "approach": [
      6.8,
      6
    ],
    "message": "書桌上放著《王室典禮紀錄》，後方夾著艾琳的私人日記。"
  },
  {
    "id": "cup",
    "label": "銀杯",
    "action": "inspect",
    "area": "hall",
    "prefixes": [
      "silver-cup"
    ],
    "focus": [
      7.8,
      2.2,
      4
    ],
    "approach": [
      7.8,
      6
    ],
    "message": "書桌旁的銀杯連著典禮設施。"
  },
  {
    "id": "workshop-mannequin",
    "label": "典禮人偶",
    "action": "inspect",
    "area": "repair",
    "prefixes": [
      "workshop-mannequin"
    ],
    "focus": [
      33.92,
      2.35,
      -3
    ],
    "approach": [
      32.6,
      -3
    ],
    "message": "一具用來排演典禮的人偶，胸前裝著尚未完成的發條機關。"
  },
  {
    "id": "cabinet",
    "label": "工匠櫃",
    "action": "operate",
    "area": "hall",
    "prefixes": [
      "cabinet"
    ],
    "focus": [
      21.73,
      2.3,
      -3.7
    ],
    "approach": [
      21,
      -4.7
    ],
    "message": "工匠櫃仍然鎖著，現在無法打開。"
  },
  {
    "id": "throne",
    "label": "高臺與座椅",
    "action": "inspect",
    "area": "hall",
    "prefixes": [
      "dais",
      "throne-"
    ],
    "focus": [
      1.9,
      1,
      -0.9
    ],
    "approach": [
      1.9,
      0.2
    ],
    "message": "座椅位於高臺中央，扶手與底座藏著典禮機關。"
  },
  {
    "id": "erin",
    "label": "艾琳",
    "action": "talk",
    "area": "hall",
    "prefixes": [
      "erin-"
    ],
    "focus": [
      0,
      2.8,
      -2.6
    ],
    "approach": [
      0,
      -0.5
    ],
    "message": "艾琳坐在高臺的座椅上，手裡握著白花。"
  },
  {
    "id": "gallery",
    "label": "王室畫像",
    "action": "inspect",
    "area": "hall",
    "prefixes": [
      "portrait-"
    ],
    "focus": [
      0,
      3.4,
      -26.54
    ],
    "approach": [
      0,
      -24.4
    ],
    "message": "三幅破碎的畫像，封存著終典開始前的真相。"
  },
  {
    "id": "banquet",
    "label": "四根儀式燭臺／宴會長桌",
    "action": "inspect",
    "area": "hall",
    "prefixes": [
      "banquet-",
      "tablecloth",
      "flower-",
      "withered-food"
    ],
    "focus": [
      -4,
      2.03,
      7.8
    ],
    "approach": [
      -1.3,
      8.5
    ],
    "message": "餐點已經乾癟，桌上的白花卻仍然新鮮。"
  },
  {
    "id": "clock",
    "label": "中央大鐘",
    "action": "inspect",
    "area": "hall",
    "prefixes": [
      "clock-",
      "pendulum-",
      "minute-hand",
      "hour-hand"
    ],
    "focus": [
      4.5,
      2.85,
      -13.4
    ],
    "approach": [
      4.5,
      -11
    ],
    "message": "鐘面停在二十三時三十分，鐘擺尚未啟動。"
  },
  {
    "id": "ribbon",
    "label": "褪色白緞帶",
    "action": "pickup",
    "area": "outside",
    "prefixes": [
      "white-ribbon"
    ],
    "focus": [
      0.35,
      2.4,
      12.34
    ],
    "approach": [
      0.35,
      13.7
    ],
    "message": "已收起門把上的褪色白緞帶。"
  },
  {
    "id": "music-door",
    "label": "音樂室木門",
    "doorId": "music-door",
    "action": "operate",
    "area": "hall",
    "prefixes": [
      "room-door-music-door"
    ],
    "focus": [
      -14,
      2.3,
      0
    ],
    "approach": [
      -12.1,
      0
    ],
    "message": "按 F 開啟或關閉這扇門。"
  },
  {
    "id": "workshop-door",
    "label": "工坊木門",
    "doorId": "workshop-door",
    "action": "operate",
    "area": "hall",
    "prefixes": [
      "room-door-workshop-door"
    ],
    "focus": [
      14,
      2.3,
      0
    ],
    "approach": [
      12.1,
      0
    ],
    "message": "按 F 開啟或關閉這扇門。"
  },
  {
    "id": "gallery-door",
    "label": "畫廊木門",
    "doorId": "gallery-door",
    "action": "operate",
    "area": "hall",
    "prefixes": [
      "room-door-gallery-door"
    ],
    "focus": [
      0,
      2.3,
      -18
    ],
    "approach": [
      0,
      -16.1
    ],
    "message": "按 F 開啟或關閉這扇門。"
  }
];

interactionTargets.push(...pianoClueTargets);
interactionTargets.push(
 {id:'repair-base',label:'人偶底座暗格',action:'inspect',area:'repair',prefixes:['repair-base'],focus:[33.13,.86,-3],approach:[32.3,-3],message:'底座藏著一道暗格。'},
 {id:'repair-parts',label:'零件桌',action:'operate',area:'repair',prefixes:['repair-table','repair-parts'],focus:[36.5,2.03,2.7],approach:[36.5,.8],message:'三顆齒輪、發條與維修圖。'},
 {id:'repair-crown',label:'王室典禮王冠展示架',action:'operate',area:'repair',prefixes:['repair-crown'],focus:[37.8,2.5,-3],approach:[37.8,-.9],message:'展示架上放著王室典禮王冠。'},
 {id:'repair-exit',label:'返回東側工坊',action:'operate',area:'repair',prefixes:['repair-exit'],focus:[30.3,2.3,5.78],approach:[30.3,4],message:'沿原路返回大廳東側的工坊。'},
);
