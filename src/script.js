function initBlogLink() {
  if (typeof window.BLOG_META !== 'undefined' && window.BLOG_META.postCount > 0) {
    document.getElementById('blog-link-wrapper')?.classList.add('blog-visible');
    document.getElementById('blog-link-wrapper-mobile')?.classList.add('blog-visible');
  }
}

function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  let rafId = null;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : '0%';
    rafId = null;
  };
  const queueUpdate = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);
}

function initFooterYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

function initMobileMenu() {
  const btn = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  if (!btn || !sidebar) return;

  const close = () => {
    sidebar.classList.remove('mobile-open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (overlay) overlay.classList.remove('open');
  };

  btn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('mobile-open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
    if (overlay) overlay.classList.toggle('open', isOpen);
  });

  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) close();
    });
  });

  if (overlay) {
    overlay.addEventListener('click', close);
  }

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
}

function initProfileGlow() {
  const img = document.querySelector('.profile-glow img');
  const glow = document.querySelector('.profile-glow');
  if (!img || !glow) return;
  if (img.complete) {
    glow.classList.add('loaded');
  } else {
    img.addEventListener('load', () => glow.classList.add('loaded'));
  }
}

function initSkillBars() {
  const fills = document.querySelectorAll('.skill-bar-fill');
  if (!fills.length) return;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fills.forEach(fill => {
      const w = fill.getAttribute('data-width');
      if (w) fill.style.width = w;
    });
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const w = fill.getAttribute('data-width');
        if (w) fill.style.width = w;
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(fill => observer.observe(fill));
}

function initSectionReveal() {
  const sections = document.querySelectorAll('.section-reveal, .stagger-children');
  if (!sections.length) return;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach(s => s.classList.add('revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  sections.forEach(s => observer.observe(s));
}

function initScrollSpy() {
  const links = document.querySelectorAll('nav .nav-link');
  if (!links.length) return;

  const sections = [];
  links.forEach(link => {
    const id = link.getAttribute('href');
    if (id && id.startsWith('#')) {
      const el = document.getElementById(id.slice(1));
      if (el) sections.push({ link, el });
    }
  });
  if (!sections.length) return;

  const compute = () => {
    const totalH = document.documentElement.scrollHeight;
    sections.forEach((s, i) => {
      const nextTop = i < sections.length - 1 ? sections[i + 1].el.offsetTop : totalH + 1;
      s.mid = (s.el.offsetTop + nextTop) / 2;
    });
  };

  let lastRun = 0, debounceId = null;
  const update = () => {
    const totalH = document.documentElement.scrollHeight;
    const h = totalH - window.innerHeight;
    const pct = h > 0 ? window.scrollY / h : 0;
    const pos = window.scrollY + pct * window.innerHeight;
    sections.forEach(s => {
      const dist = Math.abs(pos - s.mid);
      const centered = Math.max(0, 1 - dist / (window.innerHeight * 0.5));
      s.link.classList.toggle('active', centered > 0);
      s.link.classList.toggle('text-white', centered > 0);
      s.link.classList.toggle('font-semibold', centered > 0);
      if (centered > 0) {
        s.link.style.setProperty('--bar-width', `${centered * 100}%`);
      } else {
        s.link.style.removeProperty('--bar-width');
      }
    });
  };
  window.addEventListener('scroll', () => {
    const now = performance.now();
    if (now - lastRun >= 30) { lastRun = now; update(); }
    if (debounceId) clearTimeout(debounceId);
    debounceId = setTimeout(() => { update(); debounceId = null; }, 80);
  }, { passive: true });
  window.addEventListener('resize', () => { compute(); update(); });
  compute();
  update();
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || anchor.hasAttribute('download')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  const syncVisibility = () => {
    btn.classList.toggle('hidden', window.scrollY < 400);
  };
  syncVisibility();
  window.addEventListener('scroll', syncVisibility, { passive: true });
  btn.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initBlogLink();
  initScrollProgress();
  initFooterYear();
  initMobileMenu();
  initProfileGlow();
  initSkillBars();
  initSectionReveal();
  initScrollSpy();
  initSmoothScroll();
  initBackToTop();
});
