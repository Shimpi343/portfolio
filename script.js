// Polished site script: theme toggle, smooth scroll, reveal-on-scroll
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
