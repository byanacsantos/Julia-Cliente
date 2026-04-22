/* ============================================
   ESTEVÃO'WINES — script.js
   ============================================ */

'use strict';

/* ===== UTILS ===== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ===== NAVBAR — scroll effect & mobile menu ===== */
(function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  const allLinks  = $$('.nav-link');

  // Scroll → add .scrolled class
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    highlightActiveLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('mobile-open');
    document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('mobile-open');
      document.body.style.overflow = '';
    });
  });

  // Active link highlight based on scroll position
  function highlightActiveLink() {
    const sections = $$('section[id]');
    let currentId  = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) currentId = sec.id;
    });
    allLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === currentId);
    });
  }
})();

/* ===== SMOOTH SCROLL ===== */
window.scrollToSection = function (id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ===== PARTICLES ===== */
(function initParticles() {
  const container = $('#particles');
  if (!container) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * -20}%;
      width:  ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay:    ${Math.random() * -15}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
})();

/* ===== COUNTER ANIMATION (hero stats) ===== */
(function initCounters() {
  const counters   = $$('[data-target]');
  let   animated   = false;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(el => animateCount(el));
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));

  function animateCount(el) {
    const target   = +el.dataset.target;
    const duration = 2000;
    const step     = target / (duration / 16);
    let   current  = 0;

    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();

/* ===== SCROLL REVEAL (fade-in on scroll) ===== */
(function initReveal() {
  const revealEls = $$(
    '.about-card, .wine-card, .exp-card, .contact-item, .testimonial.active'
  );

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
    observer.observe(el);
  });
})();

/* ===== CATALOG FILTER ===== */
(function initFilter() {
  const buttons = $$('.filter-btn');
  const cards   = $$('.wine-card');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (match) {
          card.classList.remove('hidden');
          requestAnimationFrame(() => {
            card.style.opacity   = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => card.classList.add('hidden'), 300);
        }
      });
    });
  });
})();

/* ===== CART ===== */
(function initCart() {
  let cartCount = 0;
  const countEl  = $('#cartCount');
  const bubble   = $('#cartBubble');

  $$('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('added')) return;

      btn.classList.add('added');
      btn.textContent = '✓ Adicionado';

      cartCount++;
      countEl.textContent = cartCount;

      // bump animation
      bubble.classList.remove('bump');
      void bubble.offsetWidth; // reflow
      bubble.classList.add('bump');

      // get wine name from card
      const card     = btn.closest('.wine-card');
      const wineName = card ? card.querySelector('.wine-name')?.textContent : 'Vinho';
      showToast(`🍷 ${wineName} adicionado ao carrinho!`);

      // reset button after a while
      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = '+ Adicionar';
      }, 3000);
    });
  });

  // Cart bubble click → scroll to catalog
  bubble.addEventListener('click', () => scrollToSection('catalog'));
})();

/* ===== TOAST ===== */
function showToast(message, duration = 3000) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), duration);
}
window.showToast = showToast;

/* ===== TESTIMONIAL SLIDER ===== */
(function initTestimonials() {
  const slides  = $$('.testimonial');
  const dots    = $$('.dot');
  let   current = 0;
  let   timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function autoPlay() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      autoPlay();
    });
  });

  autoPlay();
})();

/* ===== CONTACT FORM ===== */
(function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Simple validation
    const name    = $('#name').value.trim();
    const email   = $('#email').value.trim();
    const message = $('#message').value.trim();

    if (!name) { flashField('#name', 'Por favor, insira seu nome.'); return; }
    if (!isValidEmail(email)) { flashField('#email', 'E-mail inválido.'); return; }
    if (!message) { flashField('#message', 'Por favor, escreva uma mensagem.'); return; }

    // Simulate sending
    const submitBtn = $('#submitForm');
    submitBtn.disabled  = true;
    submitBtn.innerHTML = '<span class="btn-text">Enviando...</span><span class="btn-icon">⏳</span>';

    setTimeout(() => {
      form.style.display    = 'none';
      success.style.display = 'block';
      showToast('✅ Mensagem enviada com sucesso!');
    }, 1500);
  });

  function flashField(selector, msg) {
    const el = $(selector);
    el.style.borderColor = '#e53e3e';
    el.style.boxShadow   = '0 0 0 3px rgba(229,62,62,0.15)';
    el.focus();
    showToast(`⚠️ ${msg}`, 2500);
    el.addEventListener('input', () => {
      el.style.borderColor = '';
      el.style.boxShadow   = '';
    }, { once: true });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
})();

/* ===== NEWSLETTER ===== */
(function initNewsletter() {
  const btn   = $('#newsletterBtn');
  const input = $('#newsletterEmail');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.style.borderColor = 'var(--wine-rose)';
      showToast('⚠️ Insira um e-mail válido.', 2500);
      return;
    }
    input.value = '';
    input.style.borderColor = '';
    showToast('🎉 Inscrito com sucesso! Bem-vindo ao clube.');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
})();

/* ===== PHONE MASK ===== */
(function initPhoneMask() {
  const phoneInput = $('#phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', () => {
    let v = phoneInput.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 2 && v.length <= 7)
      v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length > 7)
      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 0)
      v = `(${v}`;
    phoneInput.value = v;
  });
})();

/* ===== PARALLAX — subtle hero orbs ===== */
(function initParallax() {
  const orbs = $$('.hero-orb');
  if (!orbs.length) return;

  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 10;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }, { passive: true });
})();

/* ===== CURSOR GLOW (desktop only) ===== */
(function initCursorGlow() {
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(107,15,43,0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
    top: 0; left: 0;
  `;
  document.body.appendChild(glow);

  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();

/* ===== CARD TILT on hover ===== */
(function initCardTilt() {
  $$('.wine-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ===== EXPERIENCE CARDS — stagger on scroll ===== */
(function initExpCards() {
  const expCards = $$('.exp-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        expCards.forEach((c, i) => {
          setTimeout(() => {
            c.style.opacity   = '1';
            c.style.transform = 'translateY(0)';
          }, i * 120);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  expCards.forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'translateY(30px)';
    c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  if (expCards[0]) observer.observe(expCards[0]);
})();

/* ===== LOG ===== */
console.log('%c🍷 Estevão\'Wines', 'color:#c9963b;font-size:20px;font-weight:bold;font-family:Georgia,serif;');
console.log('%cSite carregado com sucesso!', 'color:#9b1a3a;font-size:12px;');
