/* ═══════════════════════════════════════════════════════════ */
/* Main Application — KART RP                                */
/* ═══════════════════════════════════════════════════════════ */

import { initTrack3D } from './track3d.js';

// ──────────────────────────────────────────────────────────
// INTERSECTION OBSERVER — Scroll Animations
// ──────────────────────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ──────────────────────────────────────────────────────────
// NAVBAR — Scroll Effect and Mobile Toggle
// ──────────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (toggle) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });
  }

  // Close menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle?.classList.remove('active');
    });
  });
}

// ──────────────────────────────────────────────────────────
// COUNTER ANIMATION — Stats
// ──────────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = Math.floor(eased * target);
    el.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

// ──────────────────────────────────────────────────────────
// VIEW TABS — Camera Views System
// ──────────────────────────────────────────────────────────
function initViewTabs() {
  const tabs = document.querySelectorAll('.view-tab');
  const panels = document.querySelectorAll('.view-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const viewId = tab.dataset.view;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `view-${viewId}`) {
          panel.classList.add('active');
        }
      });
    });
  });
}

// ──────────────────────────────────────────────────────────
// HERO PARTICLES — Canvas Animation
// ──────────────────────────────────────────────────────────
function initHeroParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = (Math.random() - 0.5) * 0.8;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.85 ? '#e60012' : '#ffffff';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width ||
        this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function createParticles() {
    const count = Math.min(Math.floor(canvas.width * canvas.height / 8000), 150);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(230, 0, 18, ${0.05 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    animationId = requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}

// ──────────────────────────────────────────────────────────
// LIVE DASHBOARD — Simulated Telemetry Updates
// ──────────────────────────────────────────────────────────
function initLiveDashboard() {
  const speedEl = document.getElementById('live-speed');
  const lapEl = document.getElementById('live-lap');
  const gforceLat = document.getElementById('gforce-lat');
  const gforceLon = document.getElementById('gforce-lon');

  if (!speedEl) return;

  function updateSpeed() {
    const speed = Math.floor(55 + Math.random() * 40);
    speedEl.textContent = speed;

    const ring = document.querySelector('.speed-fill');
    if (ring) {
      ring.style.setProperty('--speed', speed);
    }
  }

  function updateLap() {
    const seconds = 47 + Math.random() * 5;
    const mins = 0;
    lapEl.textContent = `${mins}:${seconds.toFixed(3)}`;
  }

  function updateGForce() {
    const lat = (Math.random() * 1.5).toFixed(1);
    const lon = (Math.random() * 0.8).toFixed(1);
    gforceLat.textContent = `${lat}G`;
    gforceLon.textContent = `${lon}G`;
  }

  setInterval(updateSpeed, 1200);
  setInterval(updateLap, 3000);
  setInterval(updateGForce, 1500);
}

// ──────────────────────────────────────────────────────────
// SMOOTH SCROLL
// ──────────────────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ──────────────────────────────────────────────────────────
// REVENUE BAR ANIMATION
// ──────────────────────────────────────────────────────────
function initRevenueBars() {
  const bars = document.querySelectorAll('.rev-fill');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.style.getPropertyValue('--width');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => {
    const targetWidth = bar.style.getPropertyValue('--width');
    bar.style.width = '0%';
    bar.dataset.targetWidth = targetWidth;
    observer.observe(bar);
  });
}

// ──────────────────────────────────────────────────────────
// INITIALIZATION
// ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initCounters();
  initViewTabs();
  initHeroParticles();
  initLiveDashboard();
  initSmoothScroll();
  initRevenueBars();

  // Initialize Three.js 3D Track
  const canvas3D = document.getElementById('track-3d-canvas');
  if (canvas3D) {
    initTrack3D(canvas3D);
  }
});
