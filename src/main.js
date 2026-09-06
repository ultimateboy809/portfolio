/**
 * NIKHIL.DEV — 3D Creative Developer Portfolio
 * Main Application Engine
 * Integrates: Lenis Smooth Scroll, GSAP ScrollTrigger, Hero Canvas Mesh, Custom Cursor, and Form Logic
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// 1. LENIS SMOOTH SCROLL & GSAP TICKER SYNC
// ==========================================================================
let lenis;

function initSmoothScroll() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  });

  // Synchronize Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Smooth Anchor Navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        lenis.scrollTo(targetElement, {
          offset: -40,
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        // Close mobile nav if open
        const navMenu = document.getElementById('nav-menu');
        const mobileToggle = document.getElementById('mobile-toggle');
        if (navMenu && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          mobileToggle.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
}

// ==========================================================================
// 2. HERO LIGHTWEIGHT ANIMATED CANVAS (High Performance Constellation)
// ==========================================================================
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height, dpr;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };
  let animationFrameId;
  let isTabActive = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.parentElement.offsetWidth;
    height = canvas.parentElement.offsetHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);
    createParticles();
  }

  function createParticles() {
    particles = [];
    // Dynamic density: fewer particles on mobile for ultra-light memory
    const count = width < 768 ? 40 : 85;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1,
        baseAlpha: Math.random() * 0.5 + 0.25,
        depth: Math.random() * 0.8 + 0.2, // 3D depth simulation factor
      });
    }
  }

  function render() {
    if (!isTabActive) return;

    ctx.clearRect(0, 0, width, height);

    // Draw connecting mesh lines between close particles
    const maxDistance = width < 768 ? 100 : 145;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    // Update & draw particles with mouse interaction
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Interactive mouse repulsion/gravitation
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          // Soft repel
          p.x -= Math.cos(angle) * force * 1.5;
          p.y -= Math.sin(angle) * force * 1.5;
        }
      }

      p.x += p.vx * p.depth;
      p.y += p.vy * p.depth;

      // Wrap-around edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Draw particle node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.depth, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${p.baseAlpha})`;
      ctx.fill();

      // Subtle cyan glow halo for select particles
      if (p.depth > 0.7) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${p.baseAlpha * 0.15})`;
        ctx.fill();
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // Event Listeners
  window.addEventListener('resize', resize);
  
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Pause when tab is out of focus for battery/efficiency
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    if (isTabActive) {
      render();
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  });

  resize();
  render();
}

// ==========================================================================
// 3. CUSTOM CURSOR
// ==========================================================================
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Check if device supports fine hover
  if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) {
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot tracks mouse instantly
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Smooth lag for outer ring
  function updateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Hover detection on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, input, select, textarea, .skill-pill, .project-card, .process-step-card');
  hoverTargets.forEach((elem) => {
    elem.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    elem.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Window exit / entry
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '0.6';
  });
}

// ==========================================================================
// 4. GSAP SCROLLTRIGGER REVEAL ANIMATIONS
// ==========================================================================
function initScrollAnimations() {
  // Check for prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Hero section staggered entrance on load
  const heroElements = document.querySelectorAll('#hero [data-reveal]');
  gsap.from(heroElements, {
    y: 35,
    opacity: 0,
    duration: 1.1,
    stagger: 0.14,
    ease: 'power3.out',
    delay: 0.2,
  });

  // Section Headers & Titles
  const sectionLabels = document.querySelectorAll('.section-label, .section-title, .section-subtitle');
  sectionLabels.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
    });
  });

  // Staggered reveal for Project Cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 84%',
        toggleActions: 'play none none none',
      },
      y: 50,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out',
      delay: index % 2 === 0 ? 0 : 0.1,
    });
  });

  // About Section elements
  gsap.from('.about-bio', {
    scrollTrigger: {
      trigger: '.about-bio',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  });

  gsap.from('.about-skills', {
    scrollTrigger: {
      trigger: '.about-skills',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 40,
    opacity: 0,
    duration: 1,
    delay: 0.15,
    ease: 'power3.out',
  });

  // Process Step Cards staggered reveal
  gsap.from('.process-step-card', {
    scrollTrigger: {
      trigger: '.process-steps-grid',
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 40,
    opacity: 0,
    duration: 0.9,
    stagger: 0.18,
    ease: 'power3.out',
  });

  // Contact Box reveal
  gsap.from('.contact-box', {
    scrollTrigger: {
      trigger: '.contact-box',
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
    y: 45,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
  });
}

// ==========================================================================
// 5. NAVBAR BEHAVIOR & MOBILE DRAWER
// ==========================================================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
}

// ==========================================================================
// 6. CONTACT FORM HANDLING & VALIDATION
// ==========================================================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const feedback = document.getElementById('form-feedback');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let hasError = false;

    // Reset error classes
    document.querySelectorAll('.form-group').forEach((g) => g.classList.remove('has-error'));
    feedback.className = 'form-feedback';
    feedback.style.display = 'none';

    // Validate Name
    if (!nameInput.value.trim()) {
      nameInput.closest('.form-group').classList.add('has-error');
      hasError = true;
    }

    // Validate Email
    if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
      emailInput.closest('.form-group').classList.add('has-error');
      hasError = true;
    }

    // Validate Message
    if (!messageInput.value.trim()) {
      messageInput.closest('.form-group').classList.add('has-error');
      hasError = true;
    }

    if (hasError) {
      feedback.textContent = 'Please complete all required fields correctly.';
      feedback.classList.add('error');
      feedback.style.display = 'block';
      return;
    }

    // Loading State
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Form submission processing via Web3Forms
    try {
      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      object.access_key = '40495ed9-e150-4c42-b413-74ef97989fa5';
      object.subject = `New Portfolio Inquiry from ${nameInput.value.trim()}`;
      object.from_name = `${nameInput.value.trim()} via Nikhil Portfolio`;

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(object),
      });

      const result = await response.json();

      if (response.status === 200 && result.success) {
        feedback.innerHTML = `✓ Thank you, <strong>${nameInput.value.trim()}</strong>! Your message has been sent successfully. Nikhil will get back to you within 24 hours.`;
        feedback.classList.add('success');
        feedback.style.display = 'block';
        form.reset();
      } else {
        feedback.textContent = result.message || 'Something went wrong. Please email directly at hello.nikhilweb@gmail.com.';
        feedback.classList.add('error');
        feedback.style.display = 'block';
      }
    } catch (err) {
      feedback.textContent = 'Network error. Please email directly at hello.nikhilweb@gmail.com.';
      feedback.classList.add('error');
      feedback.style.display = 'block';
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}

// ==========================================================================
// 7. INITIALIZATION BOOTSTRAP
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initHeroCanvas();
  initCustomCursor();
  initScrollAnimations();
  initNavbar();
  initContactForm();
});
