function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.side-nav a'));
  if (!links.length) return;
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  let rafId = null;
  const sync = () => {
    rafId = null;
    const marker = window.scrollY + window.innerHeight * 0.35;
    let currentId = null;
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) currentId = section.id;
    });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) currentId = 'contact';
    links.forEach(link => {
      const on = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };
  const queue = () => {
    if (!rafId) rafId = window.requestAnimationFrame(sync);
  };
  sync();
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
}

document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
  initScrollSpy();
});
