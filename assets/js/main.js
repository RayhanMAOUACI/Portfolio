/* ============================================
   PORTFOLIO PROFESSIONNEL RayhanOS
   Fonctionnalités Avancées 2025
============================================ */

'use strict';

// ============================================
// UTILITIES
// ============================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

const throttle = (fn, delay) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
};

// ============================================
// THEME MANAGER
// ============================================

class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'dark';
    this.toggle = $('#theme-toggle');
    this.init();
  }

  init() {
    this.apply();
    this.toggle?.addEventListener('click', () => this.switch());
    
    // Détection système
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.theme = e.matches ? 'dark' : 'light';
          this.apply();
        }
      });
    }
  }

  apply() {
    document.body.setAttribute('data-theme', this.theme);
    
    const meta = $('meta[name="theme-color"]');
    if (meta) {
      meta.content = this.theme === 'dark' ? '#000000' : '#ffffff';
    }
  }

  switch() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    this.apply();
  }
}

// ============================================
// NAVIGATION
// ============================================

class Navigation {
  constructor() {
    this.header = $('#header');
    this.burger = $('#burger');
    this.menu = $('#mobile-menu');
    this.links = $$('.nav-link, .mobile-link');
    this.isOpen = false;
    this.init();
  }

  init() {
    // Burger toggle
    this.burger?.addEventListener('click', () => this.toggleMenu());
    
    // Close on link click
    this.links.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isOpen) this.closeMenu();
        this.smoothScroll(link);
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menu.contains(e.target) && !this.burger.contains(e.target)) {
        this.closeMenu();
      }
    });
    
    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.closeMenu();
    });
    
    // Scroll handling
    window.addEventListener('scroll', throttle(() => this.handleScroll(), 100), { passive: true });
    
    // Active section
    this.updateActiveLink();
    window.addEventListener('scroll', throttle(() => this.updateActiveLink(), 100), { passive: true });
  }

  toggleMenu() {
    this.isOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    this.isOpen = true;
    this.burger.classList.add('active');
    this.menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.isOpen = false;
    this.burger.classList.remove('active');
    this.menu.classList.remove('open');
    document.body.style.overflow = '';
  }

  smoothScroll(link) {
    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) return;
    
    const target = $(href);
    if (!target) return;
    
    const headerHeight = this.header.offsetHeight;
    const targetPos = target.offsetTop - headerHeight - 20;
    
    window.scrollTo({
      top: targetPos,
      behavior: 'smooth'
    });
  }

  handleScroll() {
    if (window.scrollY > 20) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
  }

  updateActiveLink() {
    const sections = $$('section[id]');
    const scrollPos = window.scrollY + this.header.offsetHeight + 100;
    
    let currentSection = '';
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = section.id;
      }
    });
    
    this.links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }
}

// ============================================
// CUSTOM CURSOR
// ============================================

class CustomCursor {
  constructor() {
    if (window.innerWidth < 1024) return;
    
    this.cursor = $('.custom-cursor');
    this.dot = $('.cursor-dot');
    
    if (!this.cursor || !this.dot) return;
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    
    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      // Point central suit immédiatement
      this.dot.style.left = this.mouseX + 'px';
      this.dot.style.top = this.mouseY + 'px';
    }, { passive: true });

    this.animate();

    // Hover effects
    const hoverables = 'a, button, .card, .stat-item, .nav-link, .mobile-link';
    $$(hoverables).forEach(el => {
      el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
    });
  }

  animate() {
    // Curseur extérieur suit avec délai
    this.cursorX += (this.mouseX - this.cursorX) * 0.15;
    this.cursorY += (this.mouseY - this.cursorY) * 0.15;
    this.cursor.style.left = this.cursorX + 'px';
    this.cursor.style.top = this.cursorY + 'px';
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// SCROLL PROGRESS
// ============================================

class ScrollProgress {
  constructor() {
    this.bar = $('.scroll-progress');
    if (!this.bar) return;
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      this.bar.style.width = Math.min(scrolled, 100) + '%';
    }, { passive: true });
  }
}

// ============================================
// SKILL BARS
// ============================================

class SkillBars {
  constructor() {
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fills = entry.target.querySelectorAll('.skill-bar-fill');
          fills.forEach(fill => {
            setTimeout(() => {
              const width = fill.getAttribute('data-width');
              fill.style.width = width + '%';
            }, 300);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    $$('.skill-bars').forEach(el => observer.observe(el));
  }
}

// ============================================
// CARD ANIMATIONS
// ============================================

class CardAnimations {
  constructor() {
    if (window.innerWidth < 1024) return;
    this.cards = $$('.card, .stat-item');
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.handleMove(card, e));
      card.addEventListener('mouseleave', () => this.handleLeave(card));
    });
  }

  handleMove(card, e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;
    
    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-4px)
      scale3d(1.02, 1.02, 1.02)
    `;
  }

  handleLeave(card) {
    card.style.transform = '';
  }
}

// ============================================
// SCROLL REVEAL
// ============================================

class ScrollReveal {
  constructor() {
    this.elements = $$('.section, .card');
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    this.elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.28, 0.11, 0.32, 1), transform 0.8s cubic-bezier(0.28, 0.11, 0.32, 1)';
      observer.observe(el);
    });
  }
}

// ============================================
// FAB MENU
// ============================================

class FabMenu {
  constructor() {
    this.fab = $('#fab');
    this.menu = $('#fab-menu');
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.fab || !this.menu) return;

    this.fab.addEventListener('click', () => this.toggle());
    
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.fab.contains(e.target) && !this.menu.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menu.classList.add('open');
    this.fab.textContent = '✕';
  }

  close() {
    this.isOpen = false;
    this.menu.classList.remove('open');
    this.fab.textContent = '✨';
  }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

class KeyboardShortcuts {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K : Ouvrir le menu FAB
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const fab = $('#fab');
        if (fab) fab.click();
      }
      
      // Ctrl/Cmd + / : Afficher les raccourcis
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.showShortcuts();
      }
      
      // ESC : Fermer tout
      if (e.key === 'Escape') {
        const menu = $('#mobile-menu');
        const fabMenu = $('#fab-menu');
        
        if (menu?.classList.contains('open')) {
          $('#burger')?.click();
        }
        
        if (fabMenu?.classList.contains('open')) {
          $('#fab')?.click();
        }
      }
    });
  }

  showShortcuts() {
    const shortcuts = [
      'Ctrl/Cmd + K : Menu rapide',
      'Ctrl/Cmd + / : Afficher les raccourcis',
      'ESC : Fermer les menus'
    ];
    
    console.log('⌨️ Raccourcis clavier disponibles :');
    shortcuts.forEach(s => console.log('  ' + s));
  }
}

// ============================================
// PERFORMANCE MONITOR
// ============================================

class PerformanceMonitor {
  constructor() {
    this.init();
  }

  init() {
    if (!window.performance) return;
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perf = window.performance.timing;
        const loadTime = perf.loadEventEnd - perf.navigationStart;
        
        if (loadTime > 0) {
          console.log(`⚡ Page chargée en ${(loadTime / 1000).toFixed(2)}s`);
        }
      }, 0);
    });
  }
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================

window.scrollToTop = function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const fabMenu = $('#fab-menu');
  const fab = $('#fab');
  if (fabMenu && fab) {
    fabMenu.classList.remove('open');
    fab.textContent = '✨';
  }
};

window.showEasterEgg = function() {
  const modal = $('#easter-modal');
  if (modal) modal.classList.add('show');
};

window.closeEasterEgg = function() {
  const modal = $('#easter-modal');
  if (modal) modal.classList.remove('show');
};

// ============================================
// UTILITIES
// ============================================

function setCurrentYear() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function improveAccessibility() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  console.log('🎨 Portfolio RayhanOS - Version Professionnelle');
  console.log('🌊 Fond : Vagues Dynamiques');
  
  // Core
  new ThemeManager();
  new Navigation();
  new ScrollProgress();
  
  // Visuals
  new CustomCursor();
  new ScrollReveal();
  
  // Interactions
  new SkillBars();
  new CardAnimations();
  new FabMenu();
  
  // Features
  new KeyboardShortcuts();
  new PerformanceMonitor();
  
  // Utils
  setCurrentYear();
  improveAccessibility();
  
  console.log('💡 Raccourcis : Ctrl/Cmd + K pour menu, Ctrl/Cmd + / pour aide');
}

// ============================================
// LAUNCH
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
  console.error('⚠️ Erreur:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('⚠️ Promise rejetée:', e.reason);
});