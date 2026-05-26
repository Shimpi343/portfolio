// Minimal site script: theme toggle and smooth scrolling
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const stored = localStorage.getItem('theme');

function applyTheme(theme) {
  if (theme === 'light') document.body.setAttribute('data-theme', 'light');
  else document.body.removeAttribute('data-theme');
}

// Initialize theme
if (stored) applyTheme(stored);
else applyTheme(prefersDark ? 'dark' : 'light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next === 'light' ? 'light' : null);
    if (next === 'light') localStorage.setItem('theme', 'light');
    else localStorage.removeItem('theme');
  });
}

// Smooth scroll for internal links
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

const state = {
  width: 0,
  height: 0,
  pixels: window.devicePixelRatio || 1,
  stars: [],
};

function resizeCanvas() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * state.pixels);
  canvas.height = Math.floor(state.height * state.pixels);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  context.setTransform(state.pixels, 0, 0, state.pixels, 0, 0);
  createStars();
}

function createStars() {
  const starCount = Math.min(180, Math.floor((state.width * state.height) / 12000));
  state.stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    radius: Math.random() * 1.8 + 0.3,
    alpha: Math.random() * 0.7 + 0.2,
    speed: Math.random() * 0.18 + 0.04,
    drift: Math.random() * 0.6 - 0.3,
  }));
}

function drawBackground(time) {
  context.clearRect(0, 0, state.width, state.height);

  const pulse = 0.5 + Math.sin(time * 0.0004) * 0.18;
  const gradient = context.createRadialGradient(
    state.width * 0.5,
    state.height * 0.12,
    0,
    state.width * 0.5,
    state.height * 0.12,
    Math.max(state.width, state.height) * 0.8,
  );
  gradient.addColorStop(0, `rgba(118, 169, 255, ${0.12 * pulse})`);
  gradient.addColorStop(0.4, `rgba(114, 241, 184, ${0.08 * pulse})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, state.width, state.height);

  state.stars.forEach((star) => {
    star.y += star.speed;
    star.x += star.drift * 0.25;

    if (star.y > state.height + 10) {
      star.y = -10;
      star.x = Math.random() * state.width;
    }

    if (star.x > state.width + 10) star.x = -10;
    if (star.x < -10) star.x = state.width + 10;

    context.beginPath();
    context.fillStyle = `rgba(235, 242, 255, ${star.alpha})`;
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  });

  const lineAlpha = 0.06 + pulse * 0.04;
  context.strokeStyle = `rgba(118, 169, 255, ${lineAlpha})`;
  context.lineWidth = 1;

  for (let i = 0; i < state.stars.length; i += 1) {
    const a = state.stars[i];
    for (let j = i + 1; j < state.stars.length; j += 1) {
      const b = state.stars[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 110) {
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
  }

  requestAnimationFrame(drawBackground);
}

// visual background animation disabled to simplify page design
// window.addEventListener('resize', resizeCanvas);
// resizeCanvas();
// requestAnimationFrame(drawBackground);

document.addEventListener('DOMContentLoaded', () => {
  const expandableCards = document.querySelectorAll('[data-expandable]');
  const codeOutput = document.querySelector('.code-content[data-id="code"]');

  expandableCards.forEach((card) => {
    const toggle = card.querySelector('[data-card-toggle]');

    const setOpen = (nextState) => {
      card.classList.toggle('is-open', nextState);
      if (toggle) {
        toggle.setAttribute('aria-expanded', String(nextState));
      }
    };

    const handleToggle = (event) => {
      event.stopPropagation();
      setOpen(!card.classList.contains('is-open'));
    };

    if (toggle) {
      toggle.addEventListener('click', handleToggle);
    }

    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      setOpen(!card.classList.contains('is-open'));
    });
  });

  // Slide-in reveal on scroll using IntersectionObserver
  const revealElements = Array.from(document.querySelectorAll('.reveal'));
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          // slight stagger based on position in list
          const idx = revealElements.indexOf(el);
          el.style.transitionDelay = `${(idx % 6) * 80}ms`;
          el.classList.add('in');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach((el) => {
      // choose slide direction for variety (alternate left/right)
      const idx = revealElements.indexOf(el);
      if (idx % 2 === 1) el.classList.add('right');
      observer.observe(el);
    });
  }

  // entrance animations for topbar and subtle brand/button motion
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const topbar = document.querySelector('.topbar');
    if (topbar) setTimeout(() => topbar.classList.add('show'), 120);

    const brandMark = document.querySelector('.brand-mark');
    if (brandMark) {
      // initial pulse and occasional subtle pulses
      setTimeout(() => brandMark.classList.add('pulse'), 240);
      setTimeout(() => brandMark.classList.remove('pulse'), 1100);
      setInterval(() => {
        brandMark.classList.add('pulse');
        setTimeout(() => brandMark.classList.remove('pulse'), 900);
      }, 5200);
    }

    const primary = document.querySelector('.button-primary');
    if (primary) primary.classList.add('attention');

    // interactive parallax for the visual stage
    const visual = document.querySelector('.visual-stage');
    if (visual) {
      let rafId = null;
      const maxTilt = 8; // degrees
      const applyTilt = (rx, ry) => {
        visual.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };

      visual.addEventListener('mousemove', (e) => {
        const rect = visual.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotY = dx * maxTilt;
        const rotX = -dy * maxTilt;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => applyTilt(rotX, rotY));
      });

      visual.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        visual.style.transform = '';
      });
    }

    // coding animation removed — show static example code instead
    if (codeOutput) {
      codeOutput.textContent = [
        'const animate = () => {',
        '  requestAnimationFrame(animate);',
        '  stage.style.transform = `translateY(${offset}px)`;',
        '};',
      ].join('\n');
    }
  }
});

// Theme toggle: persist selection in localStorage
(() => {
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');

  const apply = (theme) => {
    if (theme === 'light') {
      body.setAttribute('data-theme', 'light');
      if (toggle) toggle.textContent = '☀️';
      if (toggle) toggle.setAttribute('aria-pressed', 'true');
    } else {
      body.removeAttribute('data-theme');
      if (toggle) toggle.textContent = '🌙';
      if (toggle) toggle.setAttribute('aria-pressed', 'false');
    }
  };

  // initialize
  if (stored === 'light') apply('light');

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      if (current === 'light') {
        localStorage.setItem('theme', 'light');
      } else {
        localStorage.removeItem('theme');
      }
      apply(current);
    });
  }
})();