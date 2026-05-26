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

// small accessibility: focus outlines for keyboard users
document.body.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') document.documentElement.classList.add('show-focus');
});
