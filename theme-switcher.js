/**
 * theme-switcher.js — RATHAN KESHAV BYREE Portfolio
 * Chunk 1: Cinematic Loader Logic + Navbar Behavior
 */

'use strict';

/* ─────────────────────────────────────────────
   CINEMATIC LOADER
───────────────────────────────────────────── */
(function initLoader() {
  const loader    = document.getElementById('loader');
  const core      = document.getElementById('loaderCore');
  const statusEl  = document.getElementById('loaderStatus');
  const progressEl = document.getElementById('loaderProgress');
  const stage     = loader ? loader.querySelector('.loader__stage') : null;
  const body      = document.body;

  if (!loader || !core) return;

  body.classList.add('is-loading');

  // Status messages with timing (ms from start)
  const messages = [
    { text: 'Initializing Portfolio...',  at: 0,    progress: 0  },
    { text: 'Loading Assets...',          at: 900,  progress: 45 },
    { text: 'Preparing Experience...',    at: 1700, progress: 80 },
    { text: 'Ready.',                     at: 2300, progress: 100 },
  ];

  // Schedule status text updates
  messages.forEach(({ text, at, progress }) => {
    setTimeout(() => {
      if (statusEl) {
        statusEl.style.opacity = '0';
        setTimeout(() => {
          statusEl.textContent  = text;
          statusEl.style.opacity = '1';
        }, 150);
      }
      if (progressEl) {
        progressEl.style.width = `${progress}%`;
      }
    }, at);
  });

  /** Reveal main content */
  function revealContent() {
    body.classList.remove('is-loading');
    const els = [
      document.getElementById('main-content'),
      document.querySelector('.navbar'),
      document.querySelector('.footer'),
    ];
    els.forEach(el => {
      if (!el) return;
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(16px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      void el.offsetHeight;
      requestAnimationFrame(() => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  }

  /** Fire the shoot sequence */
  function shootAndHide() {
    // Fade out rings + orbit + scan line
    if (stage) {
      const rings  = stage.querySelectorAll('.loader__ring');
      const orbit  = stage.querySelector('.loader__orbit');
      const scan   = document.getElementById('loaderScan');
      const textWrap = loader.querySelector('.loader__text-wrap');

      [orbit, scan, textWrap].forEach(el => {
        if (el) { el.style.transition = 'opacity 0.3s ease'; el.style.opacity = '0'; }
      });
      rings.forEach(r => {
        r.style.transition = 'opacity 0.3s ease';
        r.style.opacity    = '0';
      });
    }

    // Short pause then shoot core
    setTimeout(() => {
      core.classList.add('is-shooting');

      // After shoot, hide loader and reveal content
      const hideTimer = setTimeout(() => {
        loader.classList.add('is-hidden');
        revealContent();
      }, 600);

      core.addEventListener('animationend', function onEnd() {
        core.removeEventListener('animationend', onEnd);
        clearTimeout(hideTimer);
        loader.classList.add('is-hidden');
        revealContent();
      });
    }, 350);
  }

  // Reduced motion: skip animation, just hide after brief pause
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (progressEl) progressEl.style.width = '100%';
    if (statusEl)   statusEl.textContent   = 'Ready.';
    setTimeout(() => {
      loader.classList.add('is-hidden');
      revealContent();
    }, 800);
    return;
  }

  // Normal: shoot after ~2.6s
  setTimeout(shootAndHide, 2600);
})();


/* ─────────────────────────────────────────────
   NAVBAR — scroll opacity + hamburger menu
───────────────────────────────────────────── */
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu
    ? mobileMenu.querySelectorAll('.navbar__mobile-link')
    : [];

  if (!navbar) return;

  /* ── Scroll: add is-scrolled class ── */
  let lastScrollY = 0;
  let ticking     = false;

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (lastScrollY > 20) {
          navbar.classList.add('is-scrolled');
        } else {
          navbar.classList.remove('is-scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Hamburger toggle ── */
  function closeMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  // Close mobile menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close mobile menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMobileMenu();
    }
  });
})();


/**
 * Chunk 2: Active Navigation Highlighting + Intersection Observer Reveals
 */

/* ─────────────────────────────────────────────
   ACTIVE NAV LINK — highlight on scroll
───────────────────────────────────────────── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.navbar__link');
  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72',
    10
  );

  if (!sections.length || !navLinks.length) return;

  function setActiveLink(id) {
    navLinks.forEach(link => {
      link.classList.remove('navbar__link--active');
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('navbar__link--active');
      }
    });
  }

  // Use IntersectionObserver for section tracking
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: `-${navHeight}px 0px -60% 0px`,
      threshold: 0,
    }
  );

  sections.forEach(section => sectionObserver.observe(section));
})();


/* ─────────────────────────────────────────────
   INTERSECTION OBSERVER — reveal animations
───────────────────────────────────────────── */
(function initRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Unobserve after reveal to save resources
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach(el => revealObserver.observe(el));
})();


/* ─────────────────────────────────────────────
   SKILLS GRID — reveal + animate skill bars
───────────────────────────────────────────── */
(function initSkillsObserver() {
  const skillsGrid = document.querySelector('.skills__grid');
  const skillFills = document.querySelectorAll('.skill-card__fill');

  if (!skillsGrid) return;

  let barsAnimated = false;

  function animateBars() {
    if (barsAnimated) return;
    barsAnimated = true;

    skillFills.forEach((fill, i) => {
      const targetWidth = fill.getAttribute('data-width') || '0';
      // Stagger each bar slightly
      setTimeout(() => {
        fill.style.width = `${targetWidth}%`;
      }, i * 80);
    });
  }

  const skillsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animateBars();
          skillsObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  skillsObserver.observe(skillsGrid);
})();


/**
 * Chunk 3: Stat Counters, Contact Form Validation, Utilities
 */

/* ─────────────────────────────────────────────
   ABOUT STAT COUNTERS — count-up animation
───────────────────────────────────────────── */
(function initStatCounters() {
  const statNumbers = document.querySelectorAll('.about__stat-number[data-target]');

  if (!statNumbers.length) return;

  /**
   * Animate a number from 0 to target
   * @param {HTMLElement} el
   * @param {number} target
   * @param {number} duration ms
   */
  function countUp(el, target, duration) {
    const start     = performance.now();
    const startVal  = 0;

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(startVal + (target - startVal) * eased);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  let countersStarted = false;

  const aboutSection = document.querySelector('.about');
  if (!aboutSection) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          statNumbers.forEach(el => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            countUp(el, target, 1800);
          });
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counterObserver.observe(aboutSection);
})();


/* ─────────────────────────────────────────────
   CONTACT FORM — validation + submission
───────────────────────────────────────────── */
(function initContactForm() {
  const form        = document.getElementById('contactForm');
  const successMsg  = document.getElementById('formSuccess');

  if (!form) return;

  const fields = {
    name:    { el: document.getElementById('name'),    error: document.getElementById('nameError') },
    email:   { el: document.getElementById('email'),   error: document.getElementById('emailError') },
    subject: { el: document.getElementById('subject'), error: document.getElementById('subjectError') },
    message: { el: document.getElementById('message'), error: document.getElementById('messageError') },
  };

  /**
   * Validate a single field
   * @param {string} key
   * @returns {boolean}
   */
  function validateField(key) {
    const { el, error } = fields[key];
    if (!el || !error) return true;

    const value = el.value.trim();
    let msg = '';

    if (!value) {
      msg = 'This field is required.';
    } else if (key === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        msg = 'Please enter a valid email address.';
      }
    } else if (key === 'name' && value.length < 2) {
      msg = 'Name must be at least 2 characters.';
    } else if (key === 'message' && value.length < 10) {
      msg = 'Message must be at least 10 characters.';
    }

    if (msg) {
      error.textContent = msg;
      el.classList.add('is-error');
      return false;
    } else {
      error.textContent = '';
      el.classList.remove('is-error');
      return true;
    }
  }

  // Live validation on blur
  Object.keys(fields).forEach(key => {
    const { el } = fields[key];
    if (el) {
      el.addEventListener('blur', () => validateField(key));
      el.addEventListener('input', () => {
        if (el.classList.contains('is-error')) validateField(key);
      });
    }
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const allValid = Object.keys(fields).map(validateField).every(Boolean);

    if (!allValid) return;

    // Simulate async submission
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';
    }

    setTimeout(() => {
      form.reset();
      Object.keys(fields).forEach(key => {
        const { el } = fields[key];
        if (el) el.classList.remove('is-error');
      });

      if (successMsg) {
        successMsg.textContent = '✓ Message sent! I\'ll get back to you soon.';
        setTimeout(() => { successMsg.textContent = ''; }, 5000);
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
      }
    }, 1500);
  });
})();


/* ─────────────────────────────────────────────
   SMOOTH SCROLL — override for nav links
───────────────────────────────────────────── */
(function initSmoothScroll() {
  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72',
    10
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─────────────────────────────────────────────
   FOOTER — dynamic year
───────────────────────────────────────────── */
(function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();


/* ─────────────────────────────────────────────
   ABOUT IMAGE — fallback placeholder
───────────────────────────────────────────── */
(function initImageFallback() {
  const profileImg = document.querySelector('.about__image');
  if (!profileImg) return;

  profileImg.addEventListener('error', () => {
    // Replace with a styled placeholder div
    const frame = profileImg.closest('.about__image-frame');
    if (!frame) return;

    profileImg.style.display = 'none';

    const placeholder = document.createElement('div');
    placeholder.setAttribute('aria-label', 'Profile photo placeholder');
    placeholder.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      font-size: 5rem;
      color: var(--red-primary);
    `;
    placeholder.innerHTML = '<i class="fa-solid fa-user" aria-hidden="true"></i>';
    frame.appendChild(placeholder);
  });
})();


/**
 * Chunk 4: Global Background — Particle Generator
 */

/* ─────────────────────────────────────────────
   BACKGROUND PARTICLES — JS-generated dots
───────────────────────────────────────────── */
(function initParticles() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const container = document.getElementById('bgParticles');
  if (!container) return;

  // Fewer particles on mobile for performance
  const isMobile  = window.innerWidth < 768;
  const isTablet  = window.innerWidth < 1024;
  const COUNT     = isMobile ? 18 : isTablet ? 32 : 50;

  /**
   * Random number between min and max
   */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Create a single particle element
   */
  function createParticle() {
    const dot = document.createElement('div');
    dot.className = 'bg-particle';

    // Random size: 1–4px, weighted toward small
    const size = rand(1, 4);

    // Color: mostly white-ish, occasionally red
    const isRed   = Math.random() < 0.3;
    const opacity = rand(0.15, 0.55);
    const color   = isRed
      ? `rgba(255, ${Math.floor(rand(30, 80))}, ${Math.floor(rand(60, 100))}, ${opacity})`
      : `rgba(255, 255, 255, ${opacity * 0.7})`;

    // Random starting position
    const startX = rand(0, 100);   // vw %
    const startY = rand(10, 100);  // vh %

    // Drift direction
    const driftX = rand(-40, 40);  // px
    const driftY = rand(-60, -120); // px (upward)

    // Duration and delay
    const duration = rand(8, 22);  // seconds
    const delay    = rand(0, 15);  // seconds

    // Animation type: rise or drift
    const animType = Math.random() < 0.6 ? 'particleRise' : 'particleDrift';

    dot.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${startX}%;
      top: ${startY}%;
      background: ${color};
      --drift-x: ${driftX}px;
      --drift-y: ${driftY}px;
      box-shadow: ${isRed ? `0 0 ${size * 3}px rgba(255,45,85,0.4)` : 'none'};
      animation: ${animType} ${duration}s ${delay}s ease-in-out infinite;
    `;

    return dot;
  }

  // Build fragment for performance (single DOM insertion)
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < COUNT; i++) {
    fragment.appendChild(createParticle());
  }
  container.appendChild(fragment);

  // Recreate on significant resize (orientation change etc.)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newMobile = window.innerWidth < 768;
      // Only rebuild if crossing mobile/desktop boundary
      if (newMobile !== isMobile) {
        container.innerHTML = '';
        const newCount = newMobile ? 18 : 50;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < newCount; i++) {
          frag.appendChild(createParticle());
        }
        container.appendChild(frag);
      }
    }, 400);
  });
})();


/**
 * Chunk 5: Social Icon Ripple on Click
 */
(function initSocialRipple() {
  const socialBtns = document.querySelectorAll('.hero__social-btn');

  socialBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      // Remove any existing ripple
      const existing = btn.querySelector('.social-ripple');
      if (existing) existing.remove();

      const size   = Math.max(btn.offsetWidth, btn.offsetHeight);
      const ripple = document.createElement('span');
      ripple.className = 'social-ripple';
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${e.offsetX - size / 2}px;
        top:  ${e.offsetY - size / 2}px;
      `;
      btn.appendChild(ripple);

      // Clean up after animation
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();


/**
 * Chunk 6: Hero Visual Wrapper Tilt — card + badges move as one unit
 *          About Image Tilt — independent
 */
(function init3DTilt() {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const isTouch  = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const isMobile = () => window.innerWidth < 768;

  /* ─────────────────────────────────────────────
     Shared lerp utility
  ───────────────────────────────────────────── */
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ─────────────────────────────────────────────
     HERO VISUAL WRAPPER — card + badges unified
  ───────────────────────────────────────────── */
  (function initHeroVisual() {
    const visual  = document.getElementById('heroVisual');
    if (!visual) return;

    const gloss   = visual.querySelector('.editor__gloss');
    const header  = visual.querySelector('.editor__header');
    const body    = visual.querySelector('.editor__body');

    const MAX_Y   = 10;   // rotateY degrees
    const MAX_X   = 8;    // rotateX degrees
    const LERP_F  = 0.10; // smoothing (lower = smoother/slower)

    let tRX = 0, tRY = 0;   // targets
    let cRX = 0, cRY = 0;   // current interpolated values
    let rafId = null;
    let active = false;

    function tick() {
      cRX = lerp(cRX, tRX, LERP_F);
      cRY = lerp(cRY, tRY, LERP_F);

      const dist  = Math.sqrt(cRX * cRX + cRY * cRY);
      const scale = 1 + dist * 0.0025;

      // Apply to the wrapper — card AND badges rotate together
      visual.style.transform =
        `rotateX(${cRX.toFixed(3)}deg) rotateY(${cRY.toFixed(3)}deg) scale(${scale.toFixed(4)})`;

      // Parallax: header and body shift slightly inside the card
      if (header) {
        const tx = (cRY / MAX_Y) * 5;
        const ty = -(cRX / MAX_X) * 4;
        header.style.transform = `translateZ(8px) translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      }
      if (body) {
        const tx = (cRY / MAX_Y) * 9;
        const ty = -(cRX / MAX_X) * 7;
        body.style.transform = `translateZ(16px) translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      }

      // Keep looping until settled
      const settled =
        Math.abs(cRX - tRX) < 0.005 &&
        Math.abs(cRY - tRY) < 0.005;

      if (!settled) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Snap to exact target to avoid float drift
        cRX = tRX; cRY = tRY;
        visual.style.transform =
          `rotateX(${cRX}deg) rotateY(${cRY}deg) scale(${tRX === 0 && tRY === 0 ? 1 : scale})`;
        if (header) header.style.transform = 'translateZ(8px) translate(0px, 0px)';
        if (body)   body.style.transform   = 'translateZ(16px) translate(0px, 0px)';
        rafId = null;
      }
    }

    function startTick() {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function onMove(e) {
      if (isMobile() || isTouch) return;

      const rect = visual.getBoundingClientRect();
      // Use a slightly larger hit zone so badges at edges still register
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      // Clamp dx/dy to [-1, 1] even if cursor is outside the rect
      const dx   = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width  / 2)));
      const dy   = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));

      tRY =  dx * MAX_Y;
      tRX = -dy * MAX_X;

      if (!active) {
        active = true;
        visual.classList.add('is-tracking');
      }

      // Gloss beam follows cursor X
      if (gloss) {
        const pct = ((dx * 0.5) + 0.5) * 100;
        gloss.style.setProperty('--gx', `${(pct - 30).toFixed(1)}%`);
      }

      startTick();
    }

    function onLeave() {
      tRX = 0; tRY = 0;
      active = false;
      visual.classList.remove('is-tracking');
      startTick();
    }

    // Track on the hero__right container for a wider hit zone
    const zone = visual.closest('.hero__right') || visual;
    zone.addEventListener('mousemove', onMove, { passive: true });
    zone.addEventListener('mouseleave', onLeave, { passive: true });
  })();

  /* ─────────────────────────────────────────────
     ABOUT IMAGE — independent tilt
  ───────────────────────────────────────────── */
  (function initAboutTilt() {
    if (isTouch) return;

    const wrap  = document.querySelector('.about__image-wrap[data-tilt]');
    const frame = wrap ? wrap.querySelector('.about__image-frame') : null;
    if (!wrap || !frame) return;

    const MAX   = 10;
    const LF    = 0.11;
    let tRX = 0, tRY = 0, cRX = 0, cRY = 0;
    let rafId = null;

    function tick() {
      cRX = lerp(cRX, tRX, LF);
      cRY = lerp(cRY, tRY, LF);

      const dist  = Math.sqrt(cRX * cRX + cRY * cRY);
      const scale = 1 + dist * 0.004;

      frame.style.transform =
        `perspective(900px) rotateX(${cRX.toFixed(3)}deg) rotateY(${cRY.toFixed(3)}deg) scale(${scale.toFixed(4)})`;

      const sx = (cRY / MAX) * 18;
      const sy = -(cRX / MAX) * 18;
      frame.style.boxShadow =
        `0 0 0 1px rgba(255,45,85,${(0.18 + dist * 0.02).toFixed(3)}),` +
        `0 0 0 3px rgba(255,45,85,${(0.06 + dist * 0.01).toFixed(3)}),` +
        `${sx.toFixed(1)}px ${(sy + 20).toFixed(1)}px 60px rgba(0,0,0,0.6),` +
        `0 0 ${(40 + dist * 4).toFixed(1)}px rgba(255,45,85,${(0.12 + dist * 0.025).toFixed(3)})`;

      const settled =
        Math.abs(cRX - tRX) < 0.005 && Math.abs(cRY - tRY) < 0.005;

      if (!settled) {
        rafId = requestAnimationFrame(tick);
      } else {
        cRX = tRX; cRY = tRY;
        rafId = null;
      }
    }

    wrap.addEventListener('mousemove', (e) => {
      if (isMobile()) return;
      const rect = wrap.getBoundingClientRect();
      const dx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      tRY =  dx * MAX;
      tRX = -dy * MAX;
      frame.classList.add('is-tilting');
      wrap.classList.add('is-tilting');
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });

    wrap.addEventListener('mouseleave', () => {
      tRX = 0; tRY = 0;
      frame.classList.remove('is-tilting');
      wrap.classList.remove('is-tilting');
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });
  })();

})();
