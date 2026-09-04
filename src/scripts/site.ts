/* DevFest Guayaquil 2026 — client behaviour (bundled by Astro, runs on every page). */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Load intro — plays on every page load (skipped when the user prefers reduced motion) */
if (!reduced) {
  document.body.classList.add('intro-wait');
  const el = document.createElement('div');
  el.className = 'intro';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Cargando DevFest Guayaquil');
  el.innerHTML =
    '<div class="intro-lockup" aria-hidden="true"><img src="/assets/glyphs/brace-left.png" alt=""><b>DevFest</b><img src="/assets/glyphs/brace-right.png" alt=""><span class="loc">Guayaquil</span></div><div class="intro-dots" aria-hidden="true"><span></span><span></span><span></span></div>';
  document.body.prepend(el);
  const finish = () => {
    el.classList.add('done');
    document.body.classList.remove('intro-wait');
    setTimeout(() => el.remove(), 400);
  };
  const ready = () => setTimeout(finish, 900);
  if (document.readyState === 'complete') ready();
  else addEventListener('load', ready, { once: true });
  setTimeout(finish, 2600);
}

/* Mobile nav (aria-current on the active link is rendered server-side by SiteHeader.astro) */
const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
const navWrap = document.querySelector<HTMLElement>('.nav-wrap');
if (toggle && navWrap) {
  const icon = toggle.querySelector('span');
  const set = (open: boolean) => {
    navWrap.toggleAttribute('data-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (icon) icon.textContent = open ? 'close' : 'menu';
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  toggle.addEventListener('click', () => set(!navWrap.hasAttribute('data-open')));
  navWrap.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) set(false);
  });
  matchMedia('(min-width: 1141px)').addEventListener('change', (e) => {
    if (e.matches) set(false);
  });
  document.addEventListener('click', (e) => {
    if (navWrap.hasAttribute('data-open') && !(e.target as Element).closest('.site-header')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navWrap.hasAttribute('data-open')) {
      set(false);
      toggle.focus();
    }
  });
}

/* Scroll reveals */
const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduced || !('IntersectionObserver' in window)) {
  els.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      }),
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

/* Stagger children marked data-stagger */
document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((g) =>
  [...g.children].forEach((c, i) => (c as HTMLElement).style.setProperty('--d', `${i * 70}ms`)),
);

/* Page transition fallback (browsers without cross-document view transitions) */
if (!('CSSViewTransitionRule' in window) && !reduced) {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!a || a.target || a.hasAttribute('download') || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    document.documentElement.classList.add('leaving');
    setTimeout(() => {
      location.href = a.href;
    }, 200);
  });
}

/* Tabs (WAI-ARIA tabs pattern) */
document.querySelectorAll<HTMLElement>('[role="tablist"]').forEach((list) => {
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const activate = (tab: HTMLButtonElement, focus = true) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const id = t.getAttribute('aria-controls');
      const p = id ? document.getElementById(id) : null;
      if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
    if (tab.dataset.family) list.closest<HTMLElement>('[data-family]')?.setAttribute('data-family', tab.dataset.family);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(t, false));
    t.addEventListener('keydown', (e) => {
      const map: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i };
      if (!(e.key in map)) return;
      e.preventDefault();
      activate(tabs[(i + map[e.key] + tabs.length) % tabs.length]);
    });
  });
});

/* Count-up stats */
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
if (counters.length) {
  const run = (el: HTMLElement) => {
    const end = Number(el.dataset.count);
    const suf = el.dataset.suffix || '';
    if (reduced) {
      el.textContent = end + suf;
      return;
    }
    const t0 = performance.now();
    const dur = 900;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io2 = new IntersectionObserver(
    (es) =>
      es.forEach((en) => {
        if (en.isIntersecting) {
          run(en.target as HTMLElement);
          io2.unobserve(en.target);
        }
      }),
    { threshold: 0.4 },
  );
  counters.forEach((c) => io2.observe(c));
}
