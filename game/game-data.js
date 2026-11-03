// 依據 BRIEF.md v2 整理。純資料，不執行劇情或推進時間。
export const prototypeSettings = {
  "status": "provisional",
  "source": "BRIEF.md／雛形仍採用的示範規則",
  "canonicalStoryRule": false,
  "piano": {
    "inputCount": 4,
    "exactNotes": null,
    "correctSequence": null,
    "ianHint": "最後兩個位置顛倒",
    "fifthToneIsPlayerInput": false
  },
  "gallery": {
    "pieceCount": 4,
    "operation": "swap",
    "initialLayout": null,
    "solution": null
  },
  "heart": {
    "gearCount": 3,
    "stableBeatsPerMinute": 60,
    "gearSizes": null
  },
  "eventCards": {
    "stageCount": 3,
    "labels": [
      "穩定心跳",
      "有效登記",
      "午夜報時觸發制動"
    ]
  }
};

export const storyMechanics = {
  "clockMode": "stage-events-only",
  "realTimeFailureCountdown": false,
  "readingAdvancesTime": false,
  "dialogueAdvancesTime": false,
  "explorationAdvancesTime": false,
  "registration": {
    "initialSubject": "erin",
    "replacementSubject": "dummy",
    "requires": [
      "stableHeartbeat",
      "crownWorn",
      "claspClosed"
    ],
    "persistsWhenHeartStops": true,
    "persistsWhenCrownRemoved": true,
    "resetToErinBeforeFinale": false
  },
  "oath": {
    "voluntary": true,
    "revoker": "erin",
    "visitorCanRevoke": false
  },
  "book": {
    "scope": [
      "connectedCeremonyFacilities",
      "registeredParticipants"
    ],
    "controlsUnregisteredVisitor": false
  },
  "cupBlockedResult": "chair",
  "loop": {
    "stoppingClock": "delayOnly",
    "unfinishedCeremony": "repeats",
    "facilitiesReset": true,
    "bookAndOathPersist": true,
    "outsideWorldResets": false
  },
  "finale": {
    "requires": [
      "stableHeartbeat",
      "dummyRegistered",
      "clockReady",
      "brakeConnected"
    ],
    "stopHeartTrigger": "midnightChime",
    "releaseAfter": "ceremonyComplete"
  },
  "scareEventOrder": [
    "fifthTone",
    "readDeathRecord",
    "finalScare"
  ],
  "executionOrderScare": false
};

export const unresolvedDesign = {
  "note": "原稿未定義的具體值保留 null，待相關製作步驟決定，不冒充劇本設定。",
  "interactionDistance": 3,
  "pianoNotes": null,
  "portraitSolution": null,
  "gearSizes": null
};


// 場景互動距離僅為實作參數，可調整，不屬劇本規則。
export const interactionSettings = {
  "maxDistance": 3,
  "includeBoundary": true,
  "epsilon": 1e-06,
  "metric": "camera-to-nearest-visible-mesh-surface",
  "status": "provisional"
};
