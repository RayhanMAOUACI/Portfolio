// ai/engine.js
// Exporte un moteur simple : loadPersona(), generateReply(text, options)
// Usage: import { loadPersona, generateReply, setOpenAIKey } from './engine.js'

let PERSONA = null;
let MEMORIES = []; // simple local memory stored in localStorage
const MEM_KEY = 'rayhai_memories_v1';
const OPENAI_KEY_STORAGE = 'rayhai_openai_key_v1';

export async function loadPersona(path = 'ai/persona.json') {
  try {
    const r = await fetch(path, { cache: 'no-store' });
    if (!r.ok) throw new Error('no persona');
    PERSONA = await r.json();
    // load memories
    const mem = localStorage.getItem(MEM_KEY);
    MEMORIES = mem ? JSON.parse(mem) : [];
    return PERSONA;
  } catch (err) {
    // fallback persona minimal
    PERSONA = {
      name: "Rayhan",
      short: "Étudiant en Terminale Bac Pro CIEL, passionné par l'informatique.",
      facts: ["18 ans", "Toulon", "Bac Pro CIEL", "Objectif : BTS SIO"],
      tone: "professionnel"
    };
    return PERSONA;
  }
}

export function addMemory(text) {
  MEMORIES.unshift({ text, ts: Date.now() });
  if (MEMORIES.length > 30) MEMORIES.pop();
  localStorage.setItem(MEM_KEY, JSON.stringify(MEMORIES));
}

export function clearMemories() {
  MEMORIES = [];
  localStorage.removeItem(MEM_KEY);
}

function textTokens(s) {
  return s.toLowerCase().split(/\W+/).filter(Boolean);
}
function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = new Set([...A].filter(x => B.has(x)));
  const union = new Set([...A, ...B]);
  return inter.size / union.size;
}

function findBestFAQ(query){
  if(!PERSONA || !PERSONA.faq) return null;
  const qt = textTokens(query);
  let best = null, score = 0;
  for(const f of PERSONA.faq){
    const st = textTokens(f.q + ' ' + (f.a||''));
    const s = jaccard(qt, st);
    if(s>score){ score=s; best=f; }
  }
  return score>0.12 ? best : null;
}

// OPTIONAL: OpenAI call if user set a key
export function setOpenAIKey(key){
  if(key) localStorage.setItem(OPENAI_KEY_STORAGE, key);
  else localStorage.removeItem(OPENAI_KEY_STORAGE);
}

async function getOpenAIKey(){
  return localStorage.getItem(OPENAI_KEY_STORAGE) || null;
}

async function callOpenAI(prompt){
  const key = await getOpenAIKey();
  if(!key) throw new Error('NoKey');
  // simple fetch to Chat Completions (gpt-4o etc) - user must enable CORS/host or use server proxy.
  const body = {
    model: "gpt-4o-mini", // example, may vary
    messages: [{role:'system', content: PERSONA ? PERSONA.instructions || `Parle comme ${PERSONA.name}` : 'Répond professionnellement.'},
               {role:'user', content: prompt}],
    max_tokens: 500,
    temperature: 0.3
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers: { "Content-Type":"application/json", "Authorization":`Bearer ${key}` },
    body: JSON.stringify(body)
  });
  if(!res.ok) throw new Error('openai_error');
  const json = await res.json();
  return json.choices?.[0]?.message?.content || null;
}

export async function generateReply(userText, opts = { useOpenAIIfAvailable:false }) {
  userText = (userText || '').trim();
  if(!userText) return "Je n'ai rien reçu — peux-tu préciser ta demande ?";
  // 1) FAQ match
  const faq = findBestFAQ(userText);
  if(faq) return faq.a;

  // 2) Simple pattern rules
  const t = userText.toLowerCase();
  if(/bonjour|salut|hello|hi/.test(t)) return `Salut — je suis ${PERSONA?.name || 'RayhAI'}. ${PERSONA?.short || ''}`;
  if(/email|contact/.test(t)) return "Tu peux me contacter via ray.maouaci@gmail.com.";
  if(/compétences|compétence|skills|cybersécurité|réseau/.test(t)) return "Compétences : cybersécurité, réseaux, matériel, HTML/CSS basique. Actuellement en Bac Pro CIEL, objectif BTS SIO.";
  if(/age|ans|âge/.test(t)) return PERSONA?.facts?.find(f=>/\d{2}/.test(f)) ? PERSONA.facts.find(f=>/\d{2}/.test(f)).replace(/\D/g,'') + ' ans' : '18 ans';
  if(/projet|portfolio|site/.test(t)) return "Mon portfolio présente mes projets personnels, stages et travaux pratiques. Dis-moi lequel tu veux voir en détail.";

  // 3) Memory-aware short search: return a memory if it matches
  const qt = textTokens(userText);
  for(const m of MEMORIES){
    const score = jaccard(qt, textTokens(m.text));
    if(score > 0.4) return `Je me souviens: ${m.text}`;
  }

  // 4) If user enabled OpenAI, call it
  if(opts.useOpenAIIfAvailable){
    try{
      const resp = await callOpenAI(userText);
      if(resp) return resp;
    }catch(e){
      // ignore and fallback to local
    }
  }

  // 5) Fallback: short synthesis from persona + heuristics
  return `${PERSONA?.short || 'Je suis Rayhan.'} ${PERSONA?.facts?.slice(0,3).join(' · ')} — demande plus de détails si tu veux.`;
}
