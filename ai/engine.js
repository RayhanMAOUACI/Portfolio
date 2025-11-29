// ai/engine.js
// Moteur : loadPersona(), generateReply(userText, options)
// - fallback local (rapide)
// - option d'appel OpenAI (via key directe ou proxy).
//
// Sécurité : mettre OPENAI_PROXY_URL pour production (recommandé).
// Pour tests locaux, la clé peut être stockée en localStorage via RayhAI.setKey().

const MEM_KEY = 'rayhai_mem_v1';
const OPENAI_KEY_STORAGE = 'rayhai_openai_key_v1';
// Si tu as un proxy (recommandé pour production), place son URL ici (ex: '/api/openai').
const OPENAI_PROXY_URL = null; // <-- mettre la route de ton proxy si tu as un serveur

let PERSONA = null;
let MEMORIES = [];

// utilitaires
const tokenize = s => (s||'').toLowerCase().split(/\W+/).filter(Boolean);
const jaccard = (a,b) => {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter(x=>B.has(x)).length;
  const uni = new Set([...A,...B]).size;
  return uni === 0 ? 0 : inter / uni;
};

export async function loadPersona(path='ai/persona.json') {
  try {
    const r = await fetch(path, {cache:'no-store'});
    if(!r.ok) throw new Error('persona fetch failed');
    PERSONA = await r.json();
  } catch(e) {
    PERSONA = {
      name: "Rayhan",
      short: "Étudiant en Terminale Bac Pro CIEL, passionné par l'informatique.",
      facts: ["18 ans","Toulon","Bac Pro CIEL"],
      instructions: "Réponds professionnellement et concis."
    };
    console.warn('engine: persona fallback used', e);
  }
  // load memory
  const m = localStorage.getItem(MEM_KEY);
  MEMORIES = m ? JSON.parse(m) : [];
  return PERSONA;
}

export function addMemory(text) {
  if(!text) return;
  MEMORIES.unshift({text, ts: Date.now()});
  if(MEMORIES.length > 40) MEMORIES.length = 40;
  localStorage.setItem(MEM_KEY, JSON.stringify(MEMORIES));
}

export function clearMemories() {
  MEMORIES = [];
  localStorage.removeItem(MEM_KEY);
}

export function setOpenAIKey(key) {
  if(!key) { localStorage.removeItem(OPENAI_KEY_STORAGE); return; }
  localStorage.setItem(OPENAI_KEY_STORAGE, key);
}

export function getOpenAIKey() {
  return localStorage.getItem(OPENAI_KEY_STORAGE) || null;
}

// internal small local generator (fast heuristics)
function localHeuristicsReply(q) {
  const t = q.toLowerCase();
  if(/^(qui|qui es-tu|présente|présente-toi)/i.test(t) || /parle de toi/i.test(t)) {
    return `${PERSONA.short} ${PERSONA.facts.join(' · ')}.`;
  }
  if(/age|ans|âge/i.test(t)) {
    const f = PERSONA.facts.find(x=>/\d{2}/.test(x));
    return f ? `J'ai ${f.replace(/\D/g,'')} ans.` : `J'ai 18 ans.`;
  }
  if(/mail|email|contact|contacter|adresse/i.test(t)) {
    return `Tu peux me contacter à ray.maouaci@gmail.com.`;
  }
  if(/projet|portfolio|site/i.test(t)) {
    return `Mon portfolio contient mes projets personnels, stages et travaux pratiques. Dis-moi lequel tu veux détailler.`;
  }
  if(/compétences|cybersécurité|réseau|réseaux|skill/i.test(t)) {
    return `Compétences : cybersécurité, réseaux, maintenance matériel, HTML/CSS de base. Je vise un BTS SIO.`;
  }
  if(/bonjour|salut|hello|hey/i.test(t)) {
    return `Salut ! Comment puis-je t'aider ?`;
  }
  if(q.length < 4) return `Peux-tu préciser ta question ?`;

  // memory-aware quick match
  const qt = tokenize(q);
  for(const m of MEMORIES) {
    const score = jaccard(qt, tokenize(m.text));
    if(score > 0.45) return `Je me souviens : ${m.text}`;
  }

  return `${PERSONA.short} Si tu veux plus de détails sur un point précis, demande-moi.`;
}

// OpenAI wrapper: tries proxy if configured; otherwise direct call (dangerous in production)
async function callOpenAIDirect(prompt) {
  const key = getOpenAIKey();
  if(!key) throw new Error('NoOpenAIKey');

  // Chat Completions
  const body = {
    model: "gpt-4o-mini", // ajustable selon disponibilité
    messages: [
      {role:'system', content: PERSONA.instructions || `Parle comme ${PERSONA.name}`},
      {role:'user', content: prompt}
    ],
    max_tokens: 600,
    temperature: 0.25
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:'POST',
    headers: {
      "Content-Type":"application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });
  if(!res.ok) {
    const txt = await res.text().catch(()=>null);
    throw new Error('OpenAI error: ' + (txt || res.status));
  }
  const json = await res.json();
  return (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || null;
}

async function callOpenAIProxy(prompt) {
  // Expect the proxy to accept POST {prompt} and return {text}
  const res = await fetch(OPENAI_PROXY_URL, {
    method: 'POST',
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ prompt })
  });
  if(!res.ok) {
    const txt = await res.text().catch(()=>null);
    throw new Error('Proxy error: ' + (txt || res.status));
  }
  const json = await res.json();
  return json.text || null;
}

/**
 * generateReply(userText, options)
 * options = { useOpenAIIfAvailable: boolean, preferProxy: boolean }
 */
export async function generateReply(userText, options = {}) {
  const text = (userText||'').trim();
  if(!text) return "Je n'ai rien reçu — peux-tu préciser ta demande ?";

  // 1) FAQ fuzzy match
  if(PERSONA && PERSONA.faq && PERSONA.faq.length) {
    const qt = tokenize(text);
    let best=null,score=0;
    for(const f of PERSONA.faq) {
      const s = jaccard(qt, tokenize(f.q + ' ' + (f.a||'')));
      if(s>score){score=s;best=f;}
    }
    if(score > 0.14) return best.a;
  }

  // 2) local heuristics quick
  const quick = localHeuristicsReply(text);
  // If quick is generic fallback, continue; else return quick for short queries
  const isGeneric = quick.includes('Si tu veux') || quick.includes('Si tu veux plus');
  if(!isGeneric) {
    // also add to memory
    addMemory(text);
    return quick;
  }

  // 3) If OpenAI requested and available, try remote
  if(options.useOpenAIIfAvailable) {
    try {
      const preferProxy = !!options.preferProxy;
      let out = null;
      if(preferProxy && OPENAI_PROXY_URL) {
        out = await callOpenAIProxy(text);
      } else if(OPENAI_PROXY_URL) {
        // prefer proxy if configured
        try { out = await callOpenAIProxy(text); } catch(e) { /* continue to direct */ }
      }
      if(!out) {
        out = await callOpenAIDirect(text);
      }
      if(out) {
        addMemory(text);
        return out.trim();
      }
    } catch(err) {
      console.warn('engine: openai call failed, falling back to local', err);
    }
  }

  // 4) final fallback synthesis
  addMemory(text);
  return quick;
}
