import { documents, acts } from './story-data.js';
import { stage1Opening, stage1Indoor } from './stage1-data.js';

const titles = { rescueLetter: '艾琳的求救信', catalogueCover: '王室典禮紀錄・封面', scoreClue: '殘缺樂譜', programClue: '舞會節目單' };
export const readableDocuments = new Map(documents.map(doc => [doc.id, { ...doc, title: titles[doc.id] || doc.id, text: doc.sourceText }]));
readableDocuments.set('rescueLetter', { ...stage1Opening.letter, text: stage1Opening.letter.lines.join('\n') });
readableDocuments.set('openingCommand', { id:'openingCommand', title:stage1Indoor.bookTitle, lines:stage1Indoor.bookLines });
readableDocuments.set('catalogueCover', { id: 'catalogueCover', title: titles.catalogueCover, text: '封面寫著《王室典禮紀錄》；後面的空頁夾著艾琳的私人日記。' });
export const itemDetails = { ribbon: { name: '褪色白緞帶', text: '從城堡門旁取得的白緞帶，顏色已經褪去。' } };
export const firstConversation = stage1Indoor.erin.map((text,index)=>({id:'stage1-erin-'+index,speaker:'erin',text}));

// 頁面內的探索紀錄；不預先收錄尚未發現的文件或對話。
export function createJournalSession() {
  const documents = new Set(), items = new Set(), conversations = [];
  return {
    get journal() { return { documents: [...documents], items: [...items], conversations: [...conversations] }; },
    readDocument(id) { if (readableDocuments.has(id)) documents.add(id); },
    collectItem(id) { items.add(id); },
    recordLine(line) { if (!conversations.some(item => item.id === line.id)) conversations.push({ ...line }); },
    reset() { documents.clear(); items.clear(); conversations.length = 0; },
  };
}

export function createGameUI(session, { onPause = () => {}, onResume = () => {} } = {}) {
  const dialog = document.querySelector('#story-dialog');
  const title = document.querySelector('#story-title'), body = document.querySelector('#story-body');
  const actions = document.querySelector('#story-actions'), closeButton = document.querySelector('#story-close');
  let dismissible = true, closed = null, revision = 0;
  const timers = new Set();
  function button(label, action, parent = actions) {
    const element = document.createElement('button'); element.type = 'button'; element.textContent = label;
    const view = revision;
    element.addEventListener('click', () => {
      if (view !== revision || element.disabled || !dialog.open) return;
      if (parent === actions) for (const sibling of actions.querySelectorAll('button')) sibling.disabled = true;
      action();
    }); parent.append(element); return element;
  }
  function paragraph(text, parent = body) { const p = document.createElement('p'); p.textContent = text; parent.append(p); return p; }
  function show({ heading, text, choices = [], allowClose = true, onClose = null, kind = 'document', renderBody, context }) {
    for (const timer of timers) clearTimeout(timer); timers.clear();
    revision++; dismissible = allowClose; closed = onClose; title.textContent = heading;
    body.replaceChildren(); actions.replaceChildren(); dialog.dataset.kind = kind;
    document.querySelector('#story-context').textContent = context || (['opening-letter','entry','restriction'].includes(kind) ? '旁白' : kind==='ceremony-page' ? '典禮冊' : kind.startsWith('ian-') ? '對話 · 伊恩' : kind==='erin-story' ? '對話 · 艾琳' : '午夜之前 · 隨身紀錄');
    closeButton.hidden = !allowClose;
    for (const line of [].concat(text || [])) paragraph(line);
    renderBody?.(body);
    for (const choice of choices) {
      const element = button(choice.label, choice.action); if (choice.id) element.dataset.choice = choice.id;
      if(choice.disabled){element.disabled=true;continue;}
      if(choice.delay&&!matchMedia('(prefers-reduced-motion: reduce)').matches){element.disabled=true;const view=revision;const timer=setTimeout(()=>{timers.delete(timer);if(view===revision&&dialog.open)element.disabled=false;},choice.delay);timers.add(timer);}
    }
    if (!dialog.open) { dialog.showModal(); onPause(); }
    body.scrollTop = 0;
    (actions.querySelector('button:not(:disabled)') || (!closeButton.hidden ? closeButton : body)).focus();
  }
  function close() { if (dialog.open) dialog.close(); }
  dialog.addEventListener('cancel', event => { if (!dismissible) event.preventDefault(); });
  closeButton.addEventListener('click', close);
  dialog.addEventListener('close', () => { const callback = closed; closed = null; callback?.(); onResume(); });
  function readDocument(id, { required = false, onDone, kind = 'document' } = {}) {
    const doc = readableDocuments.get(id); if (!doc) return;
    if(doc.open)return doc.open({fromJournal:true});
    session.readDocument(id);
    show({ heading: doc.title, text: doc.lines || doc.text, kind, allowClose: !required, renderBody:doc.render,
      choices: required ? [{ label: '收好求救信', action() { const view=revision; onDone?.(); if (view===revision) close(); } }] : [{ label: '返回隨身紀錄', action: journal }],
    });
  }
  function journal() {
    show({ heading: '隨身紀錄', text: '已發現的文件、物品與交談會保留在這裡。', kind: 'journal' });
    const snapshot = session.journal;
    for (const [label, entries] of [['文件與證據', snapshot.documents], ['隨身物品', snapshot.items]]) {
      const heading = document.createElement('h3'); heading.textContent = label; body.append(heading);
      if (!entries.length) paragraph('尚未收錄。');
      for (const id of entries) {
        if (label === '文件與證據') button(readableDocuments.get(id)?.title || id, () => readDocument(id), body);
        else {
          const item = itemDetails[id] || { name: id, text: '' };
          button(item.name, () => show({ heading: item.name, text: item.text, choices: [{ label: '返回隨身紀錄', action: journal }] }), body);
        }
      }
    }
    const heading = document.createElement('h3'); heading.textContent = '交談紀錄'; body.append(heading);
    if (!snapshot.conversations.length) paragraph('尚未交談。');
    for (const line of snapshot.conversations) paragraph(`${line.speaker === 'erin' ? '艾琳' : line.speaker === 'ian' ? '伊恩' : line.speaker === 'narrator' ? '旁白' : '訪客'}：${line.text}`);
  }
  function dialogue(lines, { onDone, required = false, finalLabel = '結束交談' } = {}) {
    let index = 0;
    function next() {
      const line = lines[index]; session.recordLine(line);
      show({ heading: line.speaker === 'ian' ? '伊恩' : '艾琳', text: line.text, kind: 'dialogue', allowClose: !required,
        choices: [{ label: index < lines.length - 1 ? '繼續' : finalLabel, action() {
          if (++index < lines.length) next(); else { const view=revision; onDone?.(); if(view===revision)close(); }
        } }],
      });
    }
    if (lines.length) next();
  }
  return { get isOpen() { return dialog.open; }, show, close, journal, readDocument, dialogue,
    handleInteraction(event) {
      if (event.action === 'pickup') session.collectItem(event.id);
      if (event.id === 'book') readDocument(session.hasEvent?.('readCommand')?'openingCommand':'catalogueCover');
      else if (event.id === 'erin') dialogue(firstConversation);
      else if (event.action === 'inspect') show({ heading: event.label, text: event.text });
    },
  };
}
