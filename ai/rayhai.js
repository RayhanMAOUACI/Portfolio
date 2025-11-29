// ai/rayhai.js (type="module")
import { loadPersona, generateReply, addMemory, setOpenAIKey, loadPersona as lp } from './engine.js';

const container = document.getElementById('rayhai-container') || createContainer();
const bubble = ensureEl('rayhai-bubble', container, `<span>💬</span>`);
const panel = ensureEl('rayhai-panel', container);
const messages = ensureChild('rayhai-messages', panel);
const closeBtn = ensureChild('rayhai-close', panel, null, true);
const input = ensureChild('rayhai-text', panel, null, true);
const sendBtn = ensureChild('rayhai-send', panel, null, true);
const suggestionsArea = ensureSuggestionsArea(panel);

let persona = null;
let openAIPromptEnabled = false;

async function init(){
  persona = await loadPersona();
  // warm welcome
  pushAi(`Salut — je suis RayhAI. Pose-moi une question sur Rayhan (évite les jeux vidéo).`);
  // render suggestion chips
  renderSuggestions(["Présentation", "Compétences", "Projets", "Contact", "Mon objectif"]);
}
init();

/* ---------- helpers ---------- */
function createContainer(){
  const c = document.createElement('div'); c.id = 'rayhai-container';
  document.body.appendChild(c);
  return c;
}
function ensureEl(id, parent, html=null){
  let e = document.getElementById(id);
  if(!e){
    e = document.createElement('div'); e.id = id;
    if(html) e.innerHTML = html;
    parent.appendChild(e);
  }
  return e;
}
function ensureChild(id, parent, html=null, asInput=false){
  let el = parent.querySelector('#'+id);
  if(!el){
    if(asInput){
      if(id === 'rayhai-text'){
        el = document.createElement('input'); el.id = id; el.placeholder = 'Pose ta question...';
      } else if(id === 'rayhai-send'){
        el = document.createElement('button'); el.id = id; el.textContent = '→';
      } else if(id === 'rayhai-close'){
        el = document.createElement('button'); el.id = id; el.textContent = '×';
      }
    } else {
      el = document.createElement('div'); el.id = id; if(html) el.innerHTML = html;
    }
    parent.appendChild(el);
  }
  return el;
}
function ensureSuggestionsArea(parent){
  let s = parent.querySelector('.rayhai-suggestions');
  if(!s){ s = document.createElement('div'); s.className = 'rayhai-suggestions'; parent.appendChild(s); }
  return s;
}

function pushAi(text){ appendMessage('ai', text); }
function pushUser(text){ appendMessage('user', text); addMemory(text); }

function appendMessage(kind, text){
  const node = document.createElement('div'); node.className = 'msg ' + (kind==='ai' ? 'ai' : 'user');
  // basic markdown-ish: links
  node.innerHTML = sanitizeAndLinkify(text);
  messages.appendChild(node);
  messages.scrollTop = messages.scrollHeight;
}

function sanitizeAndLinkify(s){
  const t = String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return t.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

/* ---------- UI wiring ---------- */
bubble.addEventListener('click', ()=> togglePanel(true));
closeBtn.addEventListener('click', ()=> togglePanel(false));
sendBtn.addEventListener('click', onSend);
input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') onSend(); });

// suggestion chips handler
function renderSuggestions(arr){
  suggestionsArea.innerHTML = '';
  arr.forEach(t=>{
    const chip = document.createElement('button'); chip.className='chip'; chip.textContent = t;
    chip.addEventListener('click', ()=> {
      input.value = t;
      onSend();
    });
    suggestionsArea.appendChild(chip);
  });
}

/* ---------- send flow ---------- */
let pending = false;
async function onSend(){
  if(pending) return;
  const text = (input.value||'').trim();
  if(!text) return;
  pushUser(text);
  input.value = ''; pending = true;
  // show typing indicator
  const typing = document.createElement('div'); typing.className='msg ai'; typing.innerHTML = '<div class="typing"></div>';
  messages.appendChild(typing); messages.scrollTop = messages.scrollHeight;
  try {
    const reply = await generateReply(text, { useOpenAIIfAvailable: openAIPromptEnabled });
    typing.remove();
    // stream-like reveal
    await streamReveal(reply);
  } catch(e){
    typing.remove();
    pushAi("Désolé, une erreur est survenue lors de la génération.");
    console.error(e);
  } finally { pending=false; }
}

function streamReveal(text){
  return new Promise(res=>{
    const node = document.createElement('div'); node.className='msg ai'; const inner = document.createElement('div'); node.appendChild(inner);
    messages.appendChild(node);
    let i=0; const speed = 12;
    const id = setInterval(()=> {
      i++; inner.textContent = text.slice(0,i);
      messages.scrollTop = messages.scrollHeight;
      if(i>=text.length){ clearInterval(id); res(); }
    }, speed);
  });
}

/* ---------- panel toggle + keyboard accessibility ---------- */
function togglePanel(open){
  if(open){
    panel.classList.add('active');
    input.focus();
  } else {
    panel.classList.remove('active');
  }
}

/* ---------- voice synthesis (toggleable) ---------- */
export function speak(text){
  if(!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  u.rate = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* ---------- admin helpers (set OpenAI key from UI) ---------- */
window.RayhAI = {
  setOpenAIKey: (k) => { setOpenAIKey(k); openAIPromptEnabled = !!k; alert('OpenAI key enregistrée localement.'); },
  clearMemories: ()=>{ if(confirm('Effacer les mémoires locales ?')) { localStorage.removeItem('rayhai_memories_v1'); alert('Mémoires effacées.'); } }
};
