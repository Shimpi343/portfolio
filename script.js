const canvas = document.getElementById('space');
const context = canvas.getContext('2d');

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

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawBackground);

// Topbar preview controls
document.addEventListener('DOMContentLoaded', () => {
  const controls = document.getElementById('topbar-controls');
  if (!controls) return;
  const buttons = controls.querySelectorAll('button[data-variant]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-variant');
      document.body.setAttribute('data-topbar', v);
    });
  });

  // Add hamburger button for variant C
  const header = document.querySelector('.topbar');
  if (header) {
    const ham = document.createElement('button');
    ham.className = 'hamburger';
    ham.setAttribute('aria-label', 'menu');
    ham.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
    const right = header.querySelector('div') || header;
    header.appendChild(ham);
    ham.addEventListener('click', () => {
      const nav = document.querySelector('.nav');
      if (!nav) return;
      if (nav.style.display === 'flex') {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '56px';
        nav.style.right = '18px';
        nav.style.background = 'linear-gradient(180deg, rgba(8,12,22,0.9), rgba(8,12,22,0.96))';
        nav.style.padding = '12px';
        nav.style.borderRadius = '10px';
      }
    });
  }
});