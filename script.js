/* ============================================================
   ANNÉE DYNAMIQUE
============================================================ */
document.getElementById("year").textContent = new Date().getFullYear();


/* ============================================================
   THEME CLAIR / SOMBRE
============================================================ */
const body = document.body;
const toggleBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  body.dataset.theme = theme;
  toggleBtn.textContent = theme === "dark" ? "🌙 Mode sombre" : "☀️ Mode clair";
}

applyTheme(localStorage.getItem("theme") || "dark");

toggleBtn.addEventListener("click", () => {
  const next = body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});


/* ============================================================
   ANIMATION SCROLL (REVEAL)
============================================================ */
const revealElements = document.querySelectorAll('.reveal');

function handleScrollReveal() {
  const trigger = window.innerHeight * 0.85;
  revealElements.forEach(el => {
    if (el.getBoundingClientRect().top < trigger) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', handleScrollReveal);
window.addEventListener('load', handleScrollReveal);


/* ============================================================
   CANVAS BACKGROUND – PARTICLES CONNECTÉS
============================================================ */
const canvas = document.getElementById("bg-particles");
const ctx = canvas.getContext("2d");
let particles = [];
const PARTICLE_COUNT = 80;
const LINK_DISTANCE = 150;

function resizeCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = (Math.random() - 0.5) * 0.7;
    this.radius = 2;
  }
  move() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56,189,248,0.9)";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(56,189,248,1)";
    ctx.fill();
  }
}

function initParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
}
initParticles();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < LINK_DISTANCE) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(56,189,248, ${1 - dist / LINK_DISTANCE})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  particles.forEach(p => {
    p.move();
    p.draw();
  });

  requestAnimationFrame(animate);
}
animate();


/* ============================================================
   NAVIGATION – SCROLL FLUIDE
============================================================ */
document.querySelectorAll("header nav a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});


/* ============================================================
   NAVIGATION – ACTIVE LINK
============================================================ */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("header nav a");

function updateActiveLink() {
  let current = "";
  sections.forEach(section => {
    const top = section.offsetTop - 150;
    const height = section.offsetHeight;
    if (scrollY >= top && scrollY < top + height) {
      current = section.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
}

addEventListener("scroll", updateActiveLink);
addEventListener("load", updateActiveLink);


/* ============================================================
   RIPPLE EFFECT – ULTRA CLEAN
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", e => {

      const prev = btn.querySelector(".ripple");
      if (prev) prev.remove();

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");

      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });
});


/* ============================================================
   HEADER – SHRINK EFFECT
============================================================ */
const header = document.querySelector("header");

function handleHeaderShrink() {
  header.classList.toggle("shrink", scrollY > 60);
}

addEventListener("scroll", handleHeaderShrink);
addEventListener("load", handleHeaderShrink);
