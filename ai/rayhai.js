// ai/rayhai.js (module)
// UI orchestration, suggestions, settings (OpenAI key UI), streaming of replies.

import { loadPersona, generateReply, addMemory, setOpenAIKey, getOpenAIKey, clearMemories } from './engine.js';

// safe DOM helpers
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const el = (tag, props={}, children=[]) => {
  const e = document.createElement(tag);
  for(const k in props){
    if(k === 'class') e.className = props[k];
    else if(k === 'html') e.innerHTML = props[k];
    else e.setAttribute(k, props[k]);
  }
  children.forEach(c => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
};

// Ensure container exists
let container = document.getElementById('rayhai-container');
if(!container){
  container = el('div', { id: 'rayhai-container' });
  document.body.appendChild(container);
}

// Build/ensure UI elements (idempotent)
function ensureStructure() {
  if(!$('#rayhai-bubble', container)) {
    container.appendChild(el('div', { id:'rayhai-bubble', 'aria-label':'Ouvrir RayhAI', title:'RayhAI' }, [el('span',{html:'💬'})]));
  }
  if(!$('#rayhai-panel', container)) {
    const panel = el('div', { id:'rayhai-panel', 'aria-hidden':'true' });
    const header = el('div', { class:'rayhai-header' }, [
      el('div', { class:'rayhai-avatar', html: 'R' }),
      el('div', { class:'rayhai-title', html: 'RayhAI' }),
      el('div', { class:'rayhai-sub', html: '' })
    ]);
    // settings (gear) and close
    const settingsBtn = el('button', { class:'btn-ghost', id:'rayhai-settings', title:'Paramètres' }, [document.createTextNode('⚙')]);
    const closeBtn = el('button', { id:'rayhai-close', title:'Fermer' }, [document.createTextNode('×')]);
    header.appendChild(settingsBtn);
    header.appendChild(closeBtn);

    const messages = el('div', { id:'rayhai-messages', role:'log', 'aria-live':'polite' }, []);
    const suggestions = el('div', { class:'rayhai-suggestions', id:'rayhai-suggestions' }, []);
    const inputRow = el('div', { class:'rayhai-input' }, [
      el('input', { id:'rayhai-text', placeholder:'Pose ta question...' }),
      el('div', { class:'rayhai-actions' }, [
        el('button', { class:'btn-ghost', id:'rayhai-voice', title:'Lire la réponse' }, [document.createTextNode('🔊')]),
        el('button', { class:'btn-primary', id:'rayhai-send' }, [document.createTextNode('→')])
      ])
    ]);
    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(suggestions);
    panel.appendChild(inputRow);

    // settings modal (simple)
    const modal = el('div', { id:'rayhai-settings-modal', style:'display:none; position: absolute; right: 28px; bottom: 580px; width: 360px; z-index:100000;' }, [
      el('div', { style:'background:var(--panel); padding:12px; border-radius:12px; box-shadow:var(--shadow);' }, [
        el('h3', { html:'Paramètres RayhAI', style:'margin:0 0 8px 0; font-size:15px;' }),
        el('div', { html:'OpenAI API Key (optionnel — à ne pas publier dans GitHub).', style:'font-size:12px; color:var(--muted); margin-bottom:6px;' }),
        el('input', { id:'rayhai-openai-key', placeholder:'sk-...', type:'text', style:'width:100%; padding:8px; margin-bottom:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background:transparent; color:var(--text);' }),
        el('div', { style:'display:flex; gap:8px; justify-content:flex-end;' }, [
          el('button', { class:'btn-ghost', id:'rayhai-reset-mem' }, [document.createTextNode('Effacer mémoires')]),
          el('button', { class:'btn-primary', id:'rayhai-save-key' }, [document.createTextNode('Enregistrer')])
        ])
      ])
    ]);
    panel.appendChild(modal);

    container.appendChild(panel);
  }
}

ensureStructure();

// Bind elements
const bubble = $('#rayhai-bubble', container);
const panel = $('#rayhai-panel', container);
const closeBtn = $('#rayhai-close', container);
const messagesWrap = $('#rayhai-messages', container);
const inputEl = $('#rayhai-text', container);
const sendBtn = $('#rayhai-send', container);
const suggestionsWrap = $('#rayhai-suggestions', container);
const settingsBtn = $('#rayhai-settings', container);
const settingsModal = $('#rayhai-settings-modal', container);
const saveKeyBtn = $('#rayhai-save-key', container);
const keyInput = $('#rayhai-openai-key', container);
const resetMemBtn = $('#rayhai-reset-mem', container);
const voiceBtn = $('#rayhai-voice', container);

// state
let PERSONA = null;
let openAIAvailable = !!localStorage.getItem('rayhai_openai_key_v1');
let voiceEnabled = false;

// load persona and warm message
(async function init(){
  PERSONA = await loadPersona();
  pushAi(`Salut — je suis RayhAI. Pose-moi une question sur Rayhan (évite les jeux vidéo).`);
  renderSuggestions(['Présentation', 'Compétences', 'Projets', 'Contact', 'Objectif']);
  // put stored key into keyInput for convenience
  keyInput.value = localStorage.getItem('rayhai_openai_key_v1') || '';
})();

// UI helpers
function pushAi(text) {
  appendMessage('ai', text);
  if(voiceEnabled) speak(text);
}
function pushUser(text) {
  appendMessage('user', text);
}
function appendMessage(kind, text) {
  const node = el('div', { class: 'msg ' + (kind==='ai' ? 'ai' : 'user') }, [document.createTextNode(text)]);
  messagesWrap.appendChild(node);
  messagesWrap.scrollTop = messagesWrap.scrollHeight;
}

// toggles
function openPanel() {
  panel.classList.add('active');
  panel.setAttribute('aria-hidden','false');
  inputEl.focus();
}
function closePanel() {
  panel.classList.remove('active');
  panel.setAttribute('aria-hidden','true');
}

// events
bubble.addEventListener('click', ()=> {
  if(panel.classList.contains('active')) closePanel();
  else openPanel();
});
closeBtn.addEventListener('click', closePanel);

// settings
settingsBtn.addEventListener('click', ()=> {
  settingsModal.style.display = settingsModal.style.display === 'none' ? 'block' : 'none';
});
saveKeyBtn.addEventListener('click', ()=> {
  const k = keyInput.value.trim();
  if(!k) {
    // remove key
    localStorage.removeItem('rayhai_openai_key_v1');
    alert('OpenAI key supprimée (local). Utilisation : fallback local actif).');
  } else {
    localStorage.setItem('rayhai_openai_key_v1', k);
    alert('OpenAI key enregistrée localement. Pour production utilisez un proxy serveur.');
  }
  openAIAvailable = !!localStorage.getItem('rayhai_openai_key_v1');
  settingsModal.style.display = 'none';
});
resetMemBtn.addEventListener('click', ()=> {
  if(confirm('Effacer toutes les mémoires locales ?')) {
    clearMemories();
    alert('Mémoires effacées.');
  }
});

// suggestions
function renderSuggestions(arr=[]) {
  suggestionsWrap.innerHTML = '';
  arr.forEach(t => {
    const chip = el('button', { class: 'chip' }, [document.createTextNode(t)]);
    chip.addEventListener('click', ()=> {
      inputEl.value = t;
      onSend();
    });
    suggestionsWrap.appendChild(chip);
  });
}

// send flow
let busy = false;
async function onSend() {
  if(busy) return;
  const txt = (inputEl.value || '').trim();
  if(!txt) return;
  pushUser(txt);
  inputEl.value = '';
  busy = true;

  // typing indicator
  const typing = el('div', { class: 'msg ai' }, [el('div', { class:'typing' })]);
  messagesWrap.appendChild(typing);
  messagesWrap.scrollTop = messagesWrap.scrollHeight;

  try {
    // choose to use OpenAI if user provided a key
    const useOpenAI = !!localStorage.getItem('rayhai_openai_key_v1');
    const reply = await generateReply(txt, { useOpenAIIfAvailable: useOpenAI });
    typing.remove();
    // stream-like reveal
    await streamReveal(reply);
  } catch(err) {
    typing.remove();
    pushAi("Désolé, une erreur est survenue lors de la génération.");
    console.error('rayhai error', err);
  } finally { busy = false; }
}

// streaming reveal (typewriter)
function streamReveal(text) {
  return new Promise(res=> {
    const node = el('div', { class: 'msg ai' }, [el('div', { html: '' })]);
    messagesWrap.appendChild(node);
    const inner = node.firstElementChild;
    let i = 0;
    const speed = 12 + Math.random()*8;
    const id = setInterval(()=>{
      i++;
      inner.textContent = text.slice(0,i);
      messagesWrap.scrollTop = messagesWrap.scrollHeight;
      if(i >= text.length) {
        clearInterval(id);
        res();
      }
    }, speed);
  });
}

// keyboard and button
sendBtn.addEventListener('click', onSend);
inputEl.addEventListener('keydown', (e)=> {
  if(e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
});

// voice read
voiceBtn.addEventListener('click', ()=> {
  voiceEnabled = !voiceEnabled;
  voiceBtn.textContent = voiceEnabled ? '🔇' : '🔊';
});
function speak(text) {
  if(!('speechSynthesis' in window)) return;
  const ut = new SpeechSynthesisUtterance(text);
  ut.lang = 'fr-FR';
  ut.rate = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(ut);
}

// accessibility: close on ESC
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closePanel();
});
