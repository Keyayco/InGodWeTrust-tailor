/* =========================================================
   IN GOD WE TRUST TAILOR — Vanilla JS
   Modular, Intersection Observer based reveals + UI logic
   ========================================================= */
(() => {
  'use strict';

  /* ---------- 1. Loader ---------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('hidden'), 1200);
  });

  /* ---------- 2. Year ---------- */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- 3. Scroll progress + nav state + floating CTA ---------- */
  const progress = document.getElementById('scrollProgress');
  const nav = document.getElementById('nav');
  const floatCta = document.querySelector('.float-cta');

  const onScroll = () => {
    const h = document.documentElement;
    const pct = (h.scrollTop || document.body.scrollTop) / (h.scrollHeight - h.clientHeight);
    if (progress) progress.style.transform = `scaleX(${pct})`;
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    if (floatCta) floatCta.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Cursor glow ---------- */
  const cursor = document.getElementById('cursorGlow');
  if (cursor && matchMedia('(hover:hover)').matches) {
    window.addEventListener('mousemove', e => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  }

  /* ---------- 5. Mobile drawer ---------- */
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  if (burger && drawer) {
    const toggle = () => {
      const open = drawer.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', toggle);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', toggle));
  }

  /* ---------- 6. Hero word reveals ---------- */
  document.querySelectorAll('.reveal-word').forEach(el => {
    const d = parseInt(el.dataset.delay || 0, 10);
    setTimeout(() => el.classList.add('in'), 1300 + d);
  });
  document.querySelectorAll('.hero .reveal').forEach(el => {
    const d = parseInt(el.dataset.delay || 0, 10);
    setTimeout(() => el.classList.add('in'), 1300 + d);
  });

  /* ---------- 7. Hero particles ---------- */
  const particles = document.getElementById('particles');
  if (particles) {
    const N = 22;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.bottom = '-10px';
      s.style.animationDelay = (Math.random() * 12) + 's';
      s.style.animationDuration = (8 + Math.random() * 10) + 's';
      s.style.opacity = (.15 + Math.random() * .35).toFixed(2);
      s.style.width = s.style.height = (2 + Math.random() * 4) + 'px';
      particles.appendChild(s);
    }
  }

  /* ---------- 8. Intersection-based reveals ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        // stagger children
        const items = e.target.querySelectorAll('.reveal-up');
        items.forEach((c, i) => {
          if (!c.classList.contains('in')) {
            setTimeout(() => c.classList.add('in'), i * 80);
          }
        });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => io.observe(el));

  /* ---------- 9. Counter stats ---------- */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const decimal = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
      let cur = 0;
      const dur = 1800;
      const start = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - start) / dur);
        cur = Math.floor(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = decimal ? (cur / 10).toFixed(1) : cur.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = decimal ? (target / 10).toFixed(1) : target.toLocaleString();
      };
      requestAnimationFrame(step);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat__num').forEach(el => counterIO.observe(el));

  /* ---------- 10. Gallery filter ---------- */
  const filters = document.querySelectorAll('.filter');
  const tiles = document.querySelectorAll('.tile');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      tiles.forEach(t => {
        const show = f === 'all' || t.dataset.cat === f;
        t.classList.toggle('hide', !show);
      });
    });
  });

  /* ---------- 11. Lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  tiles.forEach(t => {
    t.addEventListener('click', () => {
      const img = t.querySelector('img');
      if (!img) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lb) lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* ---------- 12. Testimonials slider ---------- */
  const track = document.getElementById('sliderTrack');
  const dotsWrap = document.getElementById('dots');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  if (track && dotsWrap) {
    const slides = track.children.length;
    let idx = 0;
    let auto;
    for (let i = 0; i < slides; i++) {
      const d = document.createElement('button');
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => go(i, true));
      dotsWrap.appendChild(d);
    }
    const dots = dotsWrap.children;
    const go = (i, manual) => {
      idx = (i + slides) % slides;
      track.style.transform = `translateX(-${idx * 100}%)`;
      Array.from(dots).forEach((d, k) => d.classList.toggle('active', k === idx));
      if (manual) restart();
    };
    const start = () => { auto = setInterval(() => go(idx + 1), 6000); };
    const restart = () => { clearInterval(auto); start(); };
    prev && prev.addEventListener('click', () => go(idx - 1, true));
    next && next.addEventListener('click', () => go(idx + 1, true));
    go(0);
    start();

    // touch swipe
    let sx = 0, dx = 0;
    track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; dx = 0; }, { passive: true });
    track.addEventListener('touchmove', e => { dx = e.touches[0].clientX - sx; }, { passive: true });
    track.addEventListener('touchend', () => {
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1), true);
    });
  }

  /* ---------- 13. Smooth in-page anchors offset for sticky nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        const top = document.querySelector(id).getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- 14. Subtle parallax on hero image ---------- */
  const heroImg = document.querySelector('.hero__bg img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const y = Math.min(window.scrollY, 800);
      heroImg.style.transform = `scale(${1 + y * 0.0004}) translateY(${y * 0.08}px)`;
    }, { passive: true });
  }

})();
