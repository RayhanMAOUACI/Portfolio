
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

/* =========================================
   EFFET VISUEL AU CLICK – RIPPLE NEON
========================================= */

document.querySelectorAll('header nav a').forEach(link => {
  link.addEventListener('click', function(e) {

    // Supprime les anciens ripples
    const oldRipple = this.querySelector('.ripple');
    if (oldRipple) oldRipple.remove();

    // Coordonnées du clic
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    // Crée un nouveau ripple
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Ajoute le ripple dans le lien
    this.appendChild(ripple);

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

/* script.js — RayhAI personnalisé pour Rayhan
   - Intégration locale, pas d'API
   - Typing effect, protection des données sensibles
   - Basé sur le profil fourni par l'utilisateur
   - S'attend aux éléments HTML : ai-bubble, ai-panel, ai-messages, ai-input, ai-send, ai-header-avatar, ai-header-text
*/

/* ==========================
   PROFIL (modifiable)
   ========================== */
const RAYHAN = {
  displayName: "Rayhan",
  age: "18 ans",
  city: "Toulon",
  studies: "Bac Pro CIEL — Terminale",
  interests: ["Informatique", "Cybersécurité", "Réseau", "Musculation"],
  favouriteGames: ["Valorant"],
  gamingLevel: "Très bon de manière générale",
  defaultDescription:
    "Rayhan, 18 ans, étudiant en Terminale CIEL. Passionné par l'informatique, la cybersécurité et les réseaux. Crée des projets web et des outils IA. Ambitieux, rigoureux et compétent en technique.",
  availability: "Généralement disponible en soirée, entre 18h00 et 23h30.",
  projects: [
    "Portfolio personnel (site web)",
    "Bots et automatisations",
    "Scripts et outils réseaux",
  ],
  qualities: ["Rigoureux", "Curieux", "Logique"],
  flaws: ["Perfectionnisme", "Ego peek en jeu"],
  // règles : éléments à ne jamais divulguer / réponses standardisées
  privacy: {
    forbid: ["adresse", "numéro", "téléphone", "phone", "mail privé", "email privé"],
    refusalMessage: "Désolé, je ne peux pas divulguer cette information."
  }
};

/* ==========================
   UTILITAIRES
   ========================== */
function normalizeText(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^\w\s-]/g, " ")
    .trim();
}

/* retourne true si question contient un mot interdit */
function containsSensitive(text) {
  const t = normalizeText(text);
  return RAYHAN.privacy.forbid.some(f => t.includes(f));
}

/* typing effect : écrit le texte lettre par lettre dans node */
function typeWrite(node, text, ms = 18) {
  return new Promise(resolve => {
    node.textContent = "";
    let i = 0;
    const timer = setInterval(() => {
      node.textContent += text.charAt(i);
      i++;
      node.parentElement.scrollTop = node.parentElement.scrollHeight;
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, ms);
  });
}

/* Ajoute un message utilisateur dans la timeline */
function appendUserMessage(text) {
  const messages = document.getElementById("ai-messages");
  const d = document.createElement("div");
  d.className = "message user";
  d.textContent = text;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

/* Ajoute un message IA avec typing */
async function appendAIMessage(text) {
  const messages = document.getElementById("ai-messages");
  const d = document.createElement("div");
  d.className = "message ai";
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
  await typeWrite(d, text, 18);
}

/* Ajoute rapidement un message IA (sans typing) */
function appendAIQuick(text) {
  const messages = document.getElementById("ai-messages");
  const d = document.createElement("div");
  d.className = "message ai";
  d.textContent = text;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

/* ==========================
   NLU : détection d'intention simple mais robuste
   retourne { intent, score, entities }
   ========================== */
function detectIntent(query) {
  const q = normalizeText(query);

  // intents définis (mots-clés / patterns)
  const patterns = [
    { id: "greeting", keywords: ["salut", "bonjour", "yo", "hey", "wesh"] },
    { id: "howareyou", keywords: ["ca va", "ça va", "comment vas", "tu vas"] },
    { id: "who", keywords: ["qui est", "qui es tu", "tu es qui", "présente"] },
    { id: "about_default", keywords: ["parle", "parles", "parle de toi", "présente toi", "c'est qui"] },
    { id: "age", keywords: ["age", "âge", "ans"] },
    { id: "city", keywords: ["ville", "ou habite", "habite"] },
    { id: "studies", keywords: ["étude", "etude", "lycée", "bac", "ciel", "formation"] },
    { id: "interests", keywords: ["passion", "aime", "hobby", "centre d interet", "centre d'interet", "intérêt"] },
    { id: "skills", keywords: ["compétence", "competence", "sait faire", "skill", "skills"] },
    { id: "projects", keywords: ["projet", "projects", "portfolio", "site"] },
    { id: "games", keywords: ["valorant", "jeu", "jeux", "rank", "niveau"] },
    { id: "availability", keywords: ["disponible", "disponibilite", "horaire", "heures"] },
    { id: "qualities", keywords: ["qualité", "qualite", "défaut", "defaut", "caractère"] },
    { id: "goal", keywords: ["objectif", "avenir", "futur", "projet pro"] },
    { id: "contact", keywords: ["contact", "discord", "mail", "email", "telephone", "téléphone"] }
  ];

  // score simple : proportion de keywords présents
  let best = { intent: "unknown", score: 0, entities: [] };

  for (const p of patterns) {
    let s = 0;
    const found = [];
    for (const k of p.keywords) {
      if (q.includes(k)) {
        s += 1;
        found.push(k);
      }
    }
    if (s > 0) {
      const score = s / p.keywords.length;
      if (score > best.score) {
        best = { intent: p.id, score, entities: found };
      }
    }
  }

  // special-case : very short messages like 'salut', 'ça va', 'tu vois'
  if (q.length <= 6) {
    if (["salut", "hey", "yo"].includes(q)) best = { intent: "greeting", score: 1, entities: [] };
    if (["cava", "ça va", "ca va"].includes(q)) best = { intent: "howareyou", score: 1, entities: [] };
    if (q.includes("tu vois") || q.includes("me vois")) best = { intent: "visual", score: 1, entities: [] };
  }

  return best;
}

/* ==========================
   GENERATEUR DE RÉPONSES
   Utilise la base RAYHAN et l'intent détecté
   ========================== */
function generateAnswer(rawQuestion) {
  const q = String(rawQuestion || "").trim();
  if (!q) return "Pose-moi une question.";

  // protection données sensibles
  if (containsSensitive(q)) {
    return RAYHAN.privacy.refusalMessage;
  }

  const detected = detectIntent(q);
  const intent = detected.intent;

  // réponses par intent
  switch (intent) {
    case "greeting":
      return "Salut ! " + RAYHAN.defaultDescription.split(".")[0] + ". Tu veux savoir quoi précisément ?";
    case "howareyou":
      return "Ça va — opérationnel. Et toi ?";
    case "who":
    case "about_default":
      return RAYHAN.defaultDescription;
    case "age":
      return `Il a ${RAYHAN.age}.`;
    case "city":
      return `Il vit à ${RAYHAN.city}.`;
    case "studies":
      return `${RAYHAN.studies}.`;
    case "interests":
      return `Centres d'intérêt : ${RAYHAN.interests.join(", ")}.`;
    case "skills":
      // réponse plus détaillée
      return `Compétences techniques : ${RAYHAN.interests
        .filter(i => ["Informatique", "Cybersécurité", "Réseau"].includes(i))
        .join(", ")}. Autres compétences : web, IA, maintenance.`;
    case "projects":
      return `Projets notables : ${RAYHAN.projects.join(" • ")}.`;
    case "games":
      return `Jeux favoris : ${RAYHAN.favouriteGames.join(", ")} — niveau : ${RAYHAN.gamingLevel}.`;
    case "availability":
      return `${RAYHAN.availability}`;
    case "qualities":
      return `Qualités : ${RAYHAN.qualities.join(", ")}. Défauts : ${RAYHAN.flaws.join(", ")}.`;
    case "goal":
      return `Objectifs : ${RAYHAN.projects.length ? RAYHAN.projects[0] + " et évoluer dans l'IA / cybersécurité." : "Travailler en informatique / cybersécurité."}`;
    case "contact":
      return `Pour le contact public, consulte le portfolio / page contact. Je ne fournis pas d'informations privées ici.`;
    default:
      // fallback intelligent : tenter extraction de mot-clé
      const nq = normalizeText(q);
      // si mention du prénom : répondre par description
      if (nq.includes("rayhan")) return RAYHAN.defaultDescription;
      // si demande ouverte "que fais-tu" ou "quoi" etc.
      if (nq.match(/\b(que fais|tu fais|travaille|faites)\b/)) {
        return "Rayhan réalise des projets web, automatise des tâches, travaille la cybersécurité et développe des outils IA/monitoring.";
      }
      // sinon réponse générique invitant à préciser
      return "Je n'ai pas assez d'informations pour répondre exactement à cela. Peux-tu préciser ta question ?";
  }
}

/* ==========================
   UI : connexion avec DOM
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("ai-bubble");
  const panel = document.getElementById("ai-panel");
  const messages = document.getElementById("ai-messages");
  const input = document.getElementById("ai-input");
  const sendBtn = document.getElementById("ai-send");
  const headerTextName = document.querySelector("#ai-header-text .name");
  const headerTextRole = document.querySelector("#ai-header-text .role");
  const headerAvatar = document.querySelector("#ai-header-avatar img");

  // fill header fields from profile
  if (headerTextName) headerTextName.textContent = RAYHAN.displayName + (RAYHAN.age ? ` • ${RAYHAN.age}` : "");
  if (headerTextRole) headerTextRole.textContent = RAYHAN.studies;
  if (headerAvatar) headerAvatar.src = headerAvatar.src || "rayhai.jpg";

  // open/close panel
  bubble.addEventListener("click", () => {
    // animation onde
    const wave = document.createElement("div");
    wave.className = "shockwave";
    bubble.appendChild(wave);
    setTimeout(() => wave.remove(), 620);

    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      input.focus();
      // première ouverture : message de bienvenue si vide
      if (!messages.hasChildNodes()) {
        appendAIQuick("Bonjour — je suis RayhAI. Demande-moi quelque chose sur Rayhan.");
      }
    }
  });

  // send action
  function sendCurrent() {
    const val = (input.value || "").trim();
    if (!val) return;
    appendUserMessage(val);
    input.value = "";
    // compute answer
    const answer = generateAnswer(val);
    // small delay then typing
    setTimeout(() => appendAIMessage(answer), 220);
  }

  sendBtn.addEventListener("click", sendCurrent);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendCurrent();
    if (e.key === "Escape") {
      // close panel on Esc
      panel.classList.remove("open");
    }
  });

  // expose API for debug or future updates
  window.RayhAI = {
    profile: RAYHAN,
    generateAnswer,
    detectIntent,
    appendAIMessage,
    appendUserMessage,
    setProfile: (newProfile) => {
      Object.assign(RAYHAN, newProfile);
      if (headerTextName) headerTextName.textContent = RAYHAN.displayName + (RAYHAN.age ? ` • ${RAYHAN.age}` : "");
      if (headerTextRole) headerTextRole.textContent = RAYHAN.studies;
    }
  };
});



window.addEventListener("scroll", handleHeaderShrink);
window.addEventListener("load", handleHeaderShrink);

animate();