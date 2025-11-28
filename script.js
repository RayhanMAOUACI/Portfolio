
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

// ================================
// RAYHAI — ASSISTANT INTELLIGENT
// ================================

// Elements
const bubble = document.getElementById("rayhai-bubble");
const panel = document.getElementById("rayhai-panel");
const messages = document.getElementById("rayhai-messages");
const input = document.getElementById("rayhai-input");
const send = document.getElementById("rayhai-send");

let rayhaiOpenedOnce = false;
let isTyping = false;

// ------------------------------------
// OUVERTURE / FERMETURE DE LA BULLE
//-------------------------------------
bubble.addEventListener("click", () => {
    panel.classList.toggle("open");

    // Effet d'onde neon
    createRipple(bubble);

    if (!rayhaiOpenedOnce) {
        setTimeout(() => {
            rayhaiSendMessage("Bonjour, je suis RayhAI. Pose-moi une question me concernant.");
        }, 350);
        rayhaiOpenedOnce = true;
    }
});

// Ripple neon
function createRipple(element) {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// ------------------------------------
// ENVOI DE MESSAGE
//-------------------------------------
send.addEventListener("click", sendUserMessage);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendUserMessage();
});

function sendUserMessage() {
    const text = input.value.trim();
    if (text === "") return;

    addMessage(text, "user");
    input.value = "";

    setTimeout(() => {
        processRayhaiAI(text);
    }, 250);
}

// ------------------------------------
// AJOUT MESSAGE
//-------------------------------------
function addMessage(text, sender) {
    const div = document.createElement("div");
    div.classList.add("msg", sender);
    div.innerText = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// ------------------------------------
// TYPING EFFECT
//-------------------------------------
function rayhaiSendMessage(text) {
    if (isTyping) return;

    isTyping = true;

    const typingDiv = document.createElement("div");
    typingDiv.classList.add("msg", "rayhai");
    typingDiv.innerHTML = "<span class='typing-dots'><span>.</span><span>.</span><span>.</span></span>";

    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;

    let i = 0;
    setTimeout(() => {
        typingDiv.innerHTML = "";
        const interval = setInterval(() => {
            typingDiv.innerText = text.substring(0, i);
            i++;
            messages.scrollTop = messages.scrollHeight;

            if (i > text.length) {
                clearInterval(interval);
                isTyping = false;
            }
        }, 20);
    }, 600);
}

// ------------------------------------
// INTENTIONS — IA LOCALE AMÉLIORÉE
//-------------------------------------
function processRayhaiAI(question) {
    const q = question.toLowerCase();

    // Intentions simples
    if (["salut", "bonjour", "yo", "wesh"].some(x => q.includes(x)))
        return rayhaiSendMessage("Salut ! Comment puis-je t'aider ?");

    if (q.includes("ça va") || q.includes("tu vas bien"))
        return rayhaiSendMessage("Je vais parfaitement, merci. Prêt à t’aider quand tu veux.");

    if (q.includes("t'es qui") || q.includes("qui es tu") || q.includes("c'est quoi rayhai"))
        return rayhaiSendMessage("Je suis RayhAI, l’assistant personnel de Rayhan. Je réponds à toutes les questions publiques sur lui.");

    // Infos personnelles
    const data = {
        age: "Rayhan a 18 ans.",
        ville: "Rayhan habite à Toulon.",
        etudes: "Rayhan est en Bac Pro CIEL, Terminale.",
        interets: "Il s'intéresse à l'informatique, la cybersécurité, le réseau et la musculation.",
        jeux: "Son jeu favori est Valorant.",
        niveau: "Il possède un très bon niveau sur la plupart des jeux, particulièrement Valorant."
    };

    if (q.includes("âge") || q.includes("age") || q.includes("ans"))
        return rayhaiSendMessage(data.age);

    if (q.includes("ville") || q.includes("habite") || q.includes("où il vit"))
        return rayhaiSendMessage(data.ville);

    if (q.includes("étude") || q.includes("ecole") || q.includes("bac") || q.includes("ciel"))
        return rayhaiSendMessage(data.etudes);

    if (q.includes("intérêt") || q.includes("passion") || q.includes("loisir"))
        return rayhaiSendMessage(data.interets);

    if (q.includes("jeu") || q.includes("favori") || q.includes("val"))
        return rayhaiSendMessage(data.jeux);

    if (q.includes("niveau") || q.includes("fort") || q.includes("skill"))
        return rayhaiSendMessage(data.niveau);

    // Fallback
    rayhaiSendMessage("Je ne suis pas certain d'avoir compris, mais je peux répondre à tout ce qui concerne Rayhan.");
}


window.addEventListener("scroll", handleHeaderShrink);
window.addEventListener("load", handleHeaderShrink);

animate();