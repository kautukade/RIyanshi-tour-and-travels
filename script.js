const loader = document.getElementById('pageLoader');
window.addEventListener('load', () => setTimeout(() => loader?.classList.add('hide'), 350));

document.getElementById('year').textContent = new Date().getFullYear();

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const toggleMenu = () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
};
menuToggle.addEventListener('click', toggleMenu);
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  if (mobileMenu.classList.contains('open')) toggleMenu();
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal, .reveal-up').forEach(el => revealObserver.observe(el));
setTimeout(() => document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('show')), 500);

const glow = document.getElementById('cursorGlow');
if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', e => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }, { passive: true });
} else if (glow) glow.style.display = 'none';

const card = document.getElementById('tiltCard');
if (card && window.matchMedia('(pointer:fine)').matches) {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `rotateY(${x * 14}deg) rotateX(${y * -10}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = 'rotateY(-7deg) rotateX(2deg)');
}

// Gentle cinematic parallax without harming mobile performance.
const cinematicBg = document.querySelector('.cinematic-bg');
const finalBg = document.querySelector('.final-bg');
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (cinematicBg && window.innerWidth > 680) cinematicBg.style.transform = `translateY(${(y - cinematicBg.parentElement.offsetTop) * .05}px) scale(1.06)`;
    if (finalBg) finalBg.style.transform = `translateY(${(y - finalBg.parentElement.offsetTop) * .04}px) scale(1.04)`;
  }, { passive: true });
}

function initThree(canvasId, mode = 'hero') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = mode === 'hero' ? 6 : 7;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));

  const group = new THREE.Group();
  scene.add(group);

  const count = mode === 'hero' ? 90 : 55;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - .5) * 12;
    positions[i * 3 + 1] = (Math.random() - .5) * 8;
    positions[i * 3 + 2] = (Math.random() - .5) * 4;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xe7c77f, size: mode === 'hero' ? .025 : .035, transparent: true, opacity: .75 });
  group.add(new THREE.Points(geometry, material));

  if (mode === 'hero') {
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xd9b56d, wireframe: true, transparent: true, opacity: .09 });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2.5, .015, 8, 160), ringMaterial);
    torus.rotation.x = 1.05;
    torus.position.x = 3.3;
    group.add(torus);
    const torus2 = new THREE.Mesh(new THREE.TorusGeometry(1.55, .01, 8, 120), ringMaterial.clone());
    torus2.rotation.y = .9;
    torus2.position.set(3.2, .1, -.2);
    group.add(torus2);
  }

  let mx = 0, my = 0;
  window.addEventListener('pointermove', e => {
    mx = (e.clientX / window.innerWidth - .5) * .25;
    my = (e.clientY / window.innerHeight - .5) * .14;
  }, { passive: true });

  function resize() {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let frame;
  function animate() {
    frame = requestAnimationFrame(animate);
    group.rotation.y += mode === 'hero' ? .0008 : .0004;
    group.rotation.x += (my - group.rotation.x) * .012;
    group.rotation.y += (mx - group.rotation.y) * .004;
    renderer.render(scene, camera);
  }
  animate();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) cancelAnimationFrame(frame);
    else animate();
  });
}

initThree('heroCanvas', 'hero');
initThree('ctaCanvas', 'cta');

// Add a subtle magnetic feel to primary CTAs on desktop.
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.btn-gold').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${x * .05}px, ${y * .08}px)`;
    });
    btn.addEventListener('pointerleave', () => btn.style.transform = '');
  });
}
