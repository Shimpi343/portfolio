const body = document.body;
const loader = document.getElementById('loader');
const themeToggle = document.getElementById('theme-toggle');
const musicToggle = document.getElementById('music-toggle');
const menuToggle = document.getElementById('menu-toggle');
const mobileDrawer = document.getElementById('mobile-drawer');
const progressBar = document.getElementById('progress-bar');
const backTop = document.getElementById('back-top');
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');
const typewriter = document.getElementById('typewriter');
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const testimonialTrack = document.getElementById('testimonial-track');
const testimonialDots = Array.from(document.querySelectorAll('[data-testimonial]'));
const projectFilters = Array.from(document.querySelectorAll('[data-project-filter]'));
const skillTabs = Array.from(document.querySelectorAll('[data-filter]'));
const revealEls = Array.from(document.querySelectorAll('.reveal'));
const counters = Array.from(document.querySelectorAll('[data-counter]'));
const skillMeters = Array.from(document.querySelectorAll('.skill-meter'));
const projectCards = Array.from(document.querySelectorAll('[data-project]'));
const navLinks = Array.from(document.querySelectorAll('.nav a, .mobile-drawer a'));
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  musicOn: false,
  testimonialIndex: 0,
  testimonialTimer: null,
  audio: null,
  theme: localStorage.getItem('portfolio-theme') || 'dark',
};

const roles = [
  'Full Stack Developer',
  'Frontend Engineer',
  'UI/UX Designer',
  'Problem Solver',
];

const snippets = [
  'Building interfaces that feel premium, fast, and easy to trust.',
  'Turning product goals into polished, human-centered experiences.',
  'Shipping scalable front ends with motion, clarity, and speed.',
];

function setTheme(theme) {
  state.theme = theme;
  body.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  localStorage.setItem('portfolio-theme', theme);
  if (themeToggle) {
    themeToggle.textContent = theme === 'light' ? '◑' : '◐';
  }
}

function toggleDrawer(forceClose = false) {
  if (!mobileDrawer || !menuToggle) return;
  const open = forceClose ? false : !mobileDrawer.classList.contains('is-open');
  mobileDrawer.classList.toggle('is-open', open);
  mobileDrawer.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
}

function smoothScrollTo(targetId) {
  const el = document.querySelector(targetId);
  if (!el) return;
  if (window.lenis && typeof window.lenis.scrollTo === 'function') {
    window.lenis.scrollTo(el);
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function typeLoop(target, items, textIndex = 0, charIndex = 0, deleting = false) {
  if (!target || !items.length || prefersReduced) {
    if (target) target.textContent = items[0] || '';
    return;
  }

  const current = items[textIndex];
  const nextText = deleting ? current.slice(0, charIndex - 1) : current.slice(0, charIndex + 1);
  target.textContent = nextText;

  let nextDeleting = deleting;
  let nextTextIndex = textIndex;
  let nextCharIndex = deleting ? charIndex - 1 : charIndex + 1;
  let delay = deleting ? 34 : 58;

  if (!deleting && nextCharIndex === current.length) {
    nextDeleting = true;
    delay = 1200;
  } else if (deleting && nextCharIndex === 0) {
    nextDeleting = false;
    nextTextIndex = (textIndex + 1) % items.length;
    delay = 220;
  }

  window.setTimeout(() => typeLoop(target, items, nextTextIndex, nextCharIndex, nextDeleting), delay);
}

function initCursor() {
  if (prefersReduced || !cursor || !cursorTrail) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let trailX = mouseX;
  let trailY = mouseY;

  const move = (x, y) => {
    mouseX = x;
    mouseY = y;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  };

  window.addEventListener('pointermove', (event) => {
    move(event.clientX, event.clientY);
  }, { passive: true });

  window.addEventListener('pointerdown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.65)';
    cursorTrail.style.transform = 'translate(-50%, -50%) scale(0.85)';
  });

  window.addEventListener('pointerup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorTrail.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  const loop = () => {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    cursorTrail.style.left = `${trailX}px`;
    cursorTrail.style.top = `${trailY}px`;
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
}

function initLenis() {
  if (prefersReduced || typeof Lenis === 'undefined') return;
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 1 });
  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

function initGSAP() {
  if (typeof gsap === 'undefined') return;

  const revealTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
  revealTimeline.from('.site-header', { y: -24, opacity: 0, duration: 0.8 });
  revealTimeline.from('.hero .reveal', { y: 28, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=0.3');

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.section-shell').forEach((section) => {
      gsap.fromTo(section.querySelectorAll('.reveal'),
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
          },
        });
    });

    gsap.to('.hero__glow--one', {
      y: 40,
      x: 20,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    });

    gsap.to('.hero__glow--two', {
      y: -30,
      x: -20,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    });
  }
}

function initRevealObserver() {
  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el) => observer.observe(el));
}

function animateCounters() {
  const run = (el) => {
    const end = Number(el.dataset.counter || 0);
    if (prefersReduced) {
      el.textContent = String(end);
      return;
    }

    let current = 0;
    const duration = 1500;
    const step = Math.max(1, Math.ceil(end / (duration / 16)));
    const tick = () => {
      current = Math.min(end, current + step);
      el.textContent = String(current);
      if (current < end) requestAnimationFrame(tick);
    };
    tick();
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        run(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach((counter) => observer.observe(counter));
}

function animateSkillMeters() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const meter = entry.target.querySelector('.skill-meter span');
      const level = entry.target.querySelector('.skill-meter')?.dataset.level || '0';
      if (meter) {
        meter.style.width = `${level}%`;
      }
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  skillMeters.forEach((meter) => {
    const card = meter.closest('.skill-card');
    if (card) observer.observe(card);
  });
}

function filterProjects(filter) {
  projectCards.forEach((card) => {
    const show = filter === 'all' || card.dataset.project === filter;
    card.classList.toggle('is-hidden', !show);
  });
}

function filterSkills(filter) {
  document.querySelectorAll('.skill-card').forEach((card) => {
    const categories = card.dataset.category || '';
    const show = filter === 'all' || categories.includes(filter);
    card.classList.toggle('is-hidden', !show);
  });
}

function setActiveButton(buttons, activeButton) {
  buttons.forEach((button) => button.classList.toggle('is-active', button === activeButton));
}

function initTestimonialSlider() {
  if (!testimonialTrack || !testimonialDots.length) return;

  const slides = Array.from(testimonialTrack.children);

  const show = (index) => {
    state.testimonialIndex = index;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    testimonialDots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  testimonialDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.testimonial || 0));
      restartAutoPlay();
    });
  });

  const restartAutoPlay = () => {
    if (state.testimonialTimer) clearInterval(state.testimonialTimer);
    state.testimonialTimer = setInterval(() => {
      show((state.testimonialIndex + 1) % slides.length);
    }, 4200);
  };

  restartAutoPlay();
  show(0);
}

function initForm() {
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (!name || !email || !subject || !message) {
      if (formStatus) formStatus.textContent = 'Please complete every field before sending.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (formStatus) formStatus.textContent = 'Please enter a valid email address.';
      return;
    }

    if (formStatus) formStatus.textContent = `Thanks, ${name}. Your message is ready to be sent.`;
    form.reset();
  });
}

function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      smoothScrollTo(href);
      toggleDrawer(true);
    });
  });

  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', active);
      });
    });
  }, { threshold: 0.35 });

  sections.forEach((section) => navObserver.observe(section));
}

function initProgress() {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initBackTop() {
  if (!backTop) return;
  backTop.addEventListener('click', () => smoothScrollTo('#hero'));
}

function initMagneticButtons() {
  if (prefersReduced) return;

  document.querySelectorAll('.magnetic').forEach((button) => {
    let frame = null;
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        button.style.transform = `translate(${x * 0.16}px, ${y * 0.18}px)`;
      });
    });
    button.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      button.style.transform = '';
    });
  });
}

function initProjectTilt() {
  if (prefersReduced) return;

  document.querySelectorAll('.project-card, .skill-card, .service-card').forEach((card) => {
    let rect = null;
    const onMove = (event) => {
      rect = rect || card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 12;
      const rotateX = (0.5 - py) * 10;
      card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    };
    const reset = () => {
      card.style.transform = '';
      rect = null;
    };
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
  });
}

function initThreeScene() {
  const host = document.getElementById('three-scene');
  if (!host || typeof THREE === 'undefined') return;

  const width = host.clientWidth;
  const height = host.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 6.2;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  host.appendChild(renderer.domElement);

  const geo = new THREE.IcosahedronGeometry(1.6, 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x00f5ff,
    emissive: 0x112244,
    metalness: 0.82,
    roughness: 0.15,
    wireframe: false,
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  const ring = new THREE.Mesh(
    new THREE.TorusKnotGeometry(2.05, 0.26, 180, 20),
    new THREE.MeshStandardMaterial({
      color: 0x8a2be2,
      emissive: 0x1a0830,
      metalness: 0.9,
      roughness: 0.22,
    })
  );
  ring.rotation.x = Math.PI / 2.6;
  scene.add(ring);

  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 420;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const radius = 4.6 + Math.random() * 4.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.75 })
  );
  scene.add(particles);

  const ambient = new THREE.AmbientLight(0x9bbcff, 1.8);
  scene.add(ambient);

  const point = new THREE.PointLight(0x00f5ff, 14, 20);
  point.position.set(4, 3, 6);
  scene.add(point);

  const pointTwo = new THREE.PointLight(0xff00ff, 10, 20);
  pointTwo.position.set(-3, -2, 5);
  scene.add(pointTwo);

  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  const resize = () => {
    const nextWidth = host.clientWidth;
    const nextHeight = host.clientHeight;
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight);
  };
  window.addEventListener('resize', resize);

  const animate = () => {
    sphere.rotation.x += 0.003;
    sphere.rotation.y += 0.005;
    ring.rotation.z += 0.002;
    ring.rotation.y += 0.003;
    sphere.position.x += (pointer.x * 0.6 - sphere.position.x) * 0.03;
    sphere.position.y += (pointer.y * 0.45 - sphere.position.y) * 0.03;
    ring.position.x += (pointer.x * -0.4 - ring.position.x) * 0.03;
    ring.position.y += (pointer.y * -0.25 - ring.position.y) * 0.03;
    particles.rotation.y += 0.0008;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}

function initAmbientMusic() {
  if (!musicToggle) return;

  const getContext = () => {
    if (state.audio) return state.audio;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.03;
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 110;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    osc.connect(filter);
    filter.connect(gain);
    osc.start();

    state.audio = { ctx, gain, osc, filter };
    return state.audio;
  };

  musicToggle.addEventListener('click', async () => {
    const audio = getContext();
    if (!audio) return;
    if (audio.ctx.state === 'suspended') await audio.ctx.resume();
    state.musicOn = !state.musicOn;
    audio.gain.gain.linearRampToValueAtTime(state.musicOn ? 0.05 : 0.0, audio.ctx.currentTime + 0.1);
    musicToggle.textContent = state.musicOn ? '♫' : '♪';
  });
}

function initActiveSectionGlow() {
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = Number(entry.target.dataset.sectionIndex || 0);
      document.documentElement.style.setProperty('--active-section-index', String(index));
    });
  }, { threshold: 0.4 });

  sections.forEach((section, index) => {
    section.dataset.sectionIndex = String(index + 1);
    observer.observe(section);
  });
}

function initScaffold() {
  setTheme(state.theme);
  initLenis();
  initGSAP();
  initRevealObserver();
  initCursor();
  initNavigation();
  initProgress();
  initBackTop();
  initMagneticButtons();
  initProjectTilt();
  initTestimonialSlider();
  initForm();
  initThreeScene();
  initAmbientMusic();
  initActiveSectionGlow();
  animateCounters();
  animateSkillMeters();
  typeLoop(typewriter, roles);
}

function wireControls() {
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(state.theme === 'light' ? 'dark' : 'light');
    });
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => toggleDrawer());
  }

  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleDrawer(true));
    });
  }

  projectFilters.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveButton(projectFilters, button);
      filterProjects(button.dataset.projectFilter || 'all');
    });
  });

  skillTabs.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveButton(skillTabs, button);
      filterSkills(button.dataset.filter || 'all');
    });
  });
}

function hideLoader() {
  if (!loader) return;
  window.setTimeout(() => loader.classList.add('is-hidden'), 900);
}

window.addEventListener('load', () => {
  wireControls();
  initScaffold();
  hideLoader();
});// Polished site script: theme toggle, smooth scroll, reveal-on-scroll
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const storedTheme = localStorage.getItem('theme');

function applyTheme(name) {
  if (name === 'light') document.body.setAttribute('data-theme', 'light');
  else document.body.removeAttribute('data-theme');
  if (themeToggle) themeToggle.textContent = document.body.getAttribute('data-theme') === 'light' ? '☀️' : '🌙';
}

// init theme
applyTheme(storedTheme || (prefersDark ? 'dark' : 'dark'));
if (!storedTheme) localStorage.removeItem('theme');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const next = isLight ? null : 'light';
    applyTheme(next);
    if (next === 'light') localStorage.setItem('theme', 'light');
    else localStorage.removeItem('theme');
  });
}

// smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href.length > 1) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// reveal on scroll
const reveal = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-animate]').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 6) * 80}ms`;
  reveal.observe(el);
});

// role rotator (type + delete loop)
(() => {
  const roles = ['Front-end Developer', 'Data Analyst', 'UI Designer'];
  const el = document.getElementById('role-rotator');
  if (!el || !roles.length) return;
  let ri = 0; let ci = 0; let deleting = false;
  const speed = 90; const pause = 1400;
  const tick = () => {
    const txt = roles[ri];
    if (!deleting) {
      ci++;
      el.textContent = txt.slice(0, ci);
      if (ci === txt.length) { deleting = true; setTimeout(tick, pause); return }
    } else {
      ci--;
      el.textContent = txt.slice(0, ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length }
    }
    setTimeout(tick, deleting ? speed / 1.5 : speed);
  };
  tick();
})();

// small accessibility: focus outlines for keyboard users
document.body.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') document.documentElement.classList.add('show-focus');
});

// Responsive panel toggle
const panelToggle = document.querySelector('.panel-toggle');
const heroPanel = document.querySelector('.hero-panel');
if (panelToggle && heroPanel) {
  panelToggle.addEventListener('click', (e) => {
    const isOpen = heroPanel.classList.toggle('open');
    panelToggle.setAttribute('aria-expanded', String(isOpen));
    // allow clicking outside to close
    if (isOpen) {
      document.body.classList.add('panel-open');
      setTimeout(() => {
        const outsideClose = (ev) => {
          if (!heroPanel.contains(ev.target) && !panelToggle.contains(ev.target)) {
            heroPanel.classList.remove('open');
            panelToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('panel-open');
            document.removeEventListener('pointerdown', outsideClose);
          }
        };
        document.addEventListener('pointerdown', outsideClose);
      }, 0);
    } else {
      document.body.classList.remove('panel-open');
    }
  });
}

// Parallax background orbs and 3D tilt for project cards
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced) {
  const orbLarge = document.querySelector('.orb-large');
  const orbSmall = document.querySelector('.orb-small');
  const bgLayers = Array.from(document.querySelectorAll('.bg-layer'));

  const handlePointer = (e) => {
    const x = e.clientX ?? (e.touches && e.touches[0].clientX) ?? window.innerWidth / 2;
    const y = e.clientY ?? (e.touches && e.touches[0].clientY) ?? window.innerHeight / 2;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (x - cx) / cx; // -1 .. 1
    const dy = (y - cy) / cy;

    if (orbLarge) orbLarge.style.transform = `translate3d(${dx * 28}px, ${dy * -20}px, 0) scale(1.06)`;
    if (orbSmall) orbSmall.style.transform = `translate3d(${dx * -18}px, ${dy * 14}px, 0) scale(1.03)`;
    if (bgLayers && bgLayers.length) {
      bgLayers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth) || 0.12;
        const lx = dx * depth * 60; // horizontal parallax
        const ly = dy * depth * -40; // vertical parallax
        layer.style.transform = `translate3d(${lx}px, ${ly}px, 0) translateZ(0)`;
      });
    }
  };

  window.addEventListener('pointermove', handlePointer, { passive: true });

  // scroll-based parallax: adjust layer vertical offset on scroll
  let lastScroll = window.scrollY;
  const onScroll = () => {
    const s = window.scrollY || window.pageYOffset;
    const delta = s - lastScroll;
    lastScroll = s;
    if (bgLayers && bgLayers.length) {
      bgLayers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth) || 0.12;
        // translateY slightly based on scroll position for depth illusion
        const sy = (s * depth * -0.12);
        layer.style.transform = layer.style.transform ? `${layer.style.transform} translateY(${sy}px)` : `translateY(${sy}px)`;
      });
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // subtle 3D tilt for project cards
  document.querySelectorAll('.project').forEach((card) => {
    let rect = null;
    const onMove = (e) => {
      rect = rect || card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 10; // degrees
      const rotateX = (0.5 - py) * 6;
      const translateZ = 6;
      card.style.transform = `perspective(900px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.boxShadow = '0 26px 56px rgba(3,8,20,0.58)';
    };

    const onLeave = () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      rect = null;
    };

    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    card.addEventListener('pointercancel', onLeave);
  });
}
