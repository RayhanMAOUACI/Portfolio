
/* =========================================
   ANNÉE DYNAMIQUE
========================================= */
document.getElementById("year").textContent = new Date().getFullYear();


/* =========================================
   THEME CLAIR / SOMBRE
========================================= */
const body = document.body;
const toggleBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  body.setAttribute("data-theme", theme);
  toggleBtn.textContent = theme === "dark" ? "🌙 Mode sombre" : "☀️ Mode clair";
}

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

toggleBtn.addEventListener("click", () => {
  const current = body.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});


/* =========================================
   ANIMATION AU SCROLL
========================================= */
const revealElements = document.querySelectorAll('.reveal');

function handleScroll() {
  const triggerBottom = window.innerHeight * 0.85;
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < triggerBottom) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);


/* =========================================
   FOND ANIMÉ – POINTS CONNECTÉS (CANVAS)
========================================= */

// Canvas
const canvas = document.getElementById("bg-particles");
const ctx = canvas.getContext("2d");

let particles = [];
const numParticles = 80;     
const connectDistance = 150;

// Ajuste la taille aux dimensions de la fenêtre
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// Classe Particule
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = (Math.random() - 0.5) * 0.7;
    this.radius = 2;
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;

    // Rebonds
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56,189,248,0.9)"; // Cyan
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(56,189,248,1)";
    ctx.fill();
  }
}


// Initialisation
function initParticles() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }
}
initParticles();


// Animation principale
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Lignes entre particules proches
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectDistance) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(56,189,248, ${1 - dist / connectDistance})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // Mouvements + dessin
  particles.forEach(p => {
    p.move();
    p.draw();
  });

  requestAnimationFrame(animate);
}

document.querySelectorAll('header nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("header nav a");

function updateActiveLink() {
  let current = "";

  sections.forEach(section => {
    const top = section.offsetTop - 150;
    const height = section.offsetHeight;

    if (scrollY >= top && scrollY < top + height) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
}



/* ============================================
   EFFET RIPPLE NEON — VERSION ULTRA FIABLE
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".category-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", function (e) {

            // Supprimer les anciens ripple
            const oldRipple = this.querySelector(".ripple");
            if (oldRipple) oldRipple.remove();

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const ripple = document.createElement("span");
            ripple.classList.add("ripple");
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            // Animation auto-clean
            ripple.addEventListener("animationend", () => {
                ripple.remove();
            });
        });
    });
});


/* =========================================
   HEADER – SHRINK ON SCROLL
========================================= */

const header = document.querySelector("header");

function handleHeaderShrink() {
  if (window.scrollY > 60) {
    header.classList.add("shrink");
  } else {
    header.classList.remove("shrink");
  }
}

/* script.js — RayhAI (amélioré)
   - NLU plus robuste (multiple keywords, synonyms)
   - short conversation memory (last 6 messages)
   - modern UI hooks (ripple, typing)
   - header shows "Bac Pro CIEL - Terminale" and "Assistant — Infos publiques"
   - compatible with HTML IDs:
     ai-bubble, ai-panel, ai-header-avatar (img), ai-header-text (.name .role), ai-messages, ai-input, ai-send
*/

/* =========================
   Profil utilisateur (données)
   ========================= */
const R = {
  displayName: "Rayhan",
  age: "18 ans",
  city: "Toulon",
  studies: "Bac Pro CIEL - Terminale",
  roleLabel: "Assistant — Infos publiques",
  interests: ["Informatique","Cybersécurité","Réseau","Musculation"],
  favouriteGames: ["Valorant"],
  gamingLevel: "Très bon de manière générale",
  defaultDescription: "Rayhan, 18 ans, étudiant en Terminale CIEL — passionné par l'informatique, la cybersécurité et les réseaux. Crée des projets web, bots et outils d'automatisation. Rigoureux et ambitieux.",
  availability: "Généralement disponible en soirée (18:00–23:30).",
  projects: ["Portfolio perso", "Bots & automatisations", "Scripts réseaux"],
  qualities: ["Rigoureux","Curieux","Logique"],
  flaws: ["Perfectionnisme","Ego peek en jeu"],
  privacy: {
    forbid: ["adresse","numéro","téléphone","phone","mail privé","email privé","iban","mdp"]
  }
};

/* =========================
   Small conversation memory
   ========================= */
const memory = []; // store { who: 'user'|'ai', text, ts }
function pushMemory(who, text){
  const entry = { who, text, ts: Date.now() };
  memory.push(entry);
  if(memory.length > 12) memory.shift(); // keep last 12
}

/* =========================
   Helpers & NLU
   ========================= */
function norm(s){ return (s||"").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s]/g,' ').trim(); }
function containsAny(source, arr){
  const s = norm(source);
  return arr.some(a => s.includes(a));
}
function containsSensitive(q){
  return R.privacy.forbid.some(f => norm(q).includes(f));
}

/* improved intent detection: score keywords, synonyms */
const INTENTS = [
  { id:"greeting", keys:["salut","bonjour","hey","yo","wesh","hello"], reply: (q)=> `Salut — ${R.displayName} ici. ${R.defaultDescription.split('.')[0]}.` },
  { id:"howareyou", keys:["ca va","ça va","comment vas","tu vas","tu vas bien"], reply: ()=> "Ça va bien, merci ! Et toi ?" },
  { id:"who", keys:["qui est","qui es","tu es qui","presentation","presente","c est qui"], reply: ()=> R.defaultDescription },
  { id:"age", keys:["age","âge","ans"], reply: ()=> `Il a ${R.age}.` },
  { id:"city", keys:["ville","habite","ou habite","toulon","ou habites"], reply: ()=> `Il habite à ${R.city}.` },
  { id:"studies", keys:["bac","terminale","ciel","etude","formation","lycee"], reply: ()=> R.studies },
  { id:"interests", keys:["passion","aime","centre d","interet","hobby","loisir","musculation"], reply: ()=> `Centres d'intérêt : ${R.interests.join(', ')}.` },
  { id:"skills", keys:["competence","competences","skill","html","css","js","python","reseau","reseaux","cyber"], reply: ()=> `Compétences principales : ${R.interests.slice(0,3).join(', ')}. Technique web & IA.` },
  { id:"projects", keys:["projet","portfolio","site","bot","automation","automatisation"], reply: ()=> `Projets : ${R.projects.join(' • ')}.` },
  { id:"games", keys:["valorant","jeu","jeux","rank","elo","niveau","aim"], reply: ()=> `Jeux favoris : ${R.favouriteGames.join(', ')} — niveau : ${R.gamingLevel}.` },
  { id:"availability", keys:["disponible","disponibilite","horaire","heure"], reply: ()=> R.availability },
  { id:"qualities", keys:["qualite","defaut","caractere","personnalite","personnalite"], reply: ()=> `Qualités : ${R.qualities.join(', ')}. Défauts : ${R.flaws.join(', ')}.` },
  { id:"contact", keys:["contact","discord","email","mail","telephone"], reply: ()=> "Pour contact public, consulte la page contact du portfolio. Je ne fournis pas d'informations privées." }
];

function detectIntent(q){
  const s = norm(q);
  if(!s) return { id:'empty', score:0 };

  // quick exact matches (short messages)
  if(["salut","bonjour","hey","yo"].includes(s)) return { id:'greeting', score:1 };

  // scoring
  let best = { id:'fallback', score:0, matchCount:0 };
  for(const it of INTENTS){
    let count = 0;
    for(const k of it.keys){
      if(s.includes(k)) count++;
    }
    if(count>0){
      const score = count / it.keys.length;
      if(score > best.score){
        best = { id: it.id, score, matchCount: count };
      }
    }
  }
  return best;
}

/* =========================
   Answer generator
   ========================= */
function generateAnswer(question){
  if(!question || question.trim()==='') return "Pose-moi une question.";
  if(containsSensitive(question)) return "Désolé, je ne peux pas divulguer cette information.";

  const intent = detectIntent(question);

  // direct intents
  const found = INTENTS.find(i => i.id === intent.id);
  if(found && typeof found.reply === 'function'){
    return found.reply(question);
  }

  // fallback: try keyword heuristics
  const s = norm(question);
  if(s.includes('rayhan')) return R.defaultDescription;
  if(/que fais|tu fais|travaille/.test(s)) return "Rayhan réalise des projets web, automatise des tâches, travaille la cybersécurité et développe des outils IA/monitoring.";
  if(/parle de toi|presentes toi|parle/.test(s)) return R.defaultDescription;
  // context-aware small attempt: if recent memory has user asked about X, try to expand
  const lastUser = [...memory].reverse().find(m => m.who==='user' && m.text);
  if(lastUser && /précise|développe|explique/.test(s)) return "Voici plus de détails : " + R.defaultDescription + " Pour plus précis, demande une section (compétences / projets / disponibilité).";

  return "Je n'ai pas assez d'informations pour répondre exactement. Peux-tu préciser ta question ?";
}

/* =========================
   UI bindings & typing effect
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const bubble = document.getElementById('ai-bubble');
  const panel = document.getElementById('ai-panel');
  const headerName = document.querySelector('#ai-header-text .name');
  const headerRole = document.querySelector('#ai-header-text .role');
  const headerAvatarImg = document.querySelector('#ai-header-avatar img');
  const messagesEl = document.getElementById('ai-messages');
  const inputEl = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');

  // Fill header values reliably
  if(headerName) headerName.textContent = `${R.displayName} • ${R.age}`;
  if(headerRole) headerRole.textContent = R.roleLabel || "Assistant — Infos publiques";
  if(headerAvatarImg){
    headerAvatarImg.src = headerAvatarImg.src || "rayhai.jpg";
    headerAvatarImg.alt = R.displayName;
  }

  // open/close panel with ripple
  bubble.addEventListener('click', (e) => {
    // create ripple centered on bubble
    const rect = bubble.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'bubble-ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
    bubble.appendChild(ripple);
    setTimeout(()=> ripple.remove(), 700);

    panel.classList.toggle('open');
    if(panel.classList.contains('open')){
      inputEl.focus();
      // show welcome only once
      if(messagesEl.children.length === 0){
        pushMemory('ai', 'welcome');
        typeAndAppend("Bonjour — je suis RayhAI. Pose une question sur Rayhan (études, compétences, projets, jeux).");
      }
    }
  });

  // send message (user)
  function sendCurrent(){
    const txt = (inputEl.value || '').trim();
    if(!txt) return;
    appendUser(txt);
    pushMemory('user', txt);
    inputEl.value = '';
    // compute answer
    const ans = generateAnswer(txt);
    setTimeout(()=> { pushMemory('ai', ans); typeAndAppend(ans); }, 220);
  }

  sendBtn.addEventListener('click', sendCurrent);
  inputEl.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){ e.preventDefault(); sendCurrent(); }
    if(e.key === 'Escape'){ panel.classList.remove('open'); }
  });

  // append user message
  function appendUser(text){
    const d = document.createElement('div'); d.className = 'message user'; d.textContent = text; messagesEl.appendChild(d); messagesEl.scrollTo({top:messagesEl.scrollHeight, behavior:'smooth'});
  }

  // typing + append AI
  async function typeAndAppend(text){
    const d = document.createElement('div'); d.className = 'message ai'; messagesEl.appendChild(d);
    messagesEl.scrollTo({top:messagesEl.scrollHeight, behavior:'smooth'});
    // type effect
    const speed = 16; // ms per char
    for(let i=0;i<=text.length;i++){
      d.textContent = text.slice(0,i);
      messagesEl.scrollTo({top:messagesEl.scrollHeight, behavior:'smooth'});
      await new Promise(r => setTimeout(r, speed));
    }
  }

  // expose debug
  window.RayhAI = { R, memory, generateAnswer, detectIntent, pushMemory };
});


window.addEventListener("scroll", handleHeaderShrink);
window.addEventListener("load", handleHeaderShrink);

animate();