/* DevFest Guayaquil 2026 — client behaviour.
   Astro bundles this module once per site and, with <ClientRouter />, keeps it alive across client-side
   navigations. Anything that touches page content runs from init() on `astro:page-load` (which also fires
   on the first load); document-level listeners are registered once at module scope. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Load intro — plays once per full page load, not on client-side navigations (skipped with reduced motion) */
if (!reduced) {
  document.body.classList.add('page--loading');
  const el = document.createElement('div');
  el.className = 'intro';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Cargando DevFest Guayaquil');
  el.innerHTML =
    '<div class="intro__lockup" aria-hidden="true"><img class="intro__brace" src="/assets/glyphs/brace-left.png" alt=""><b class="intro__name">DevFest</b><img class="intro__brace" src="/assets/glyphs/brace-right.png" alt=""><span class="intro__city">Guayaquil</span></div><div class="intro__dots" aria-hidden="true"><span class="intro__dot"></span><span class="intro__dot"></span><span class="intro__dot"></span></div>';
  document.body.prepend(el);
  const finish = () => {
    el.classList.add('intro--done');
    document.body.classList.remove('page--loading');
    setTimeout(() => el.remove(), 400);
  };
  const ready = () => setTimeout(finish, 900);
  if (document.readyState === 'complete') ready();
  else addEventListener('load', ready, { once: true });
  setTimeout(finish, 2600);
}

/* Placeholder links (href="#") do nothing. Without this the router would treat them as a navigation to the
   current page and re-render it. Capture phase so it runs before the router's own click handler. */
document.addEventListener(
  'click',
  (e) => {
    const a = (e.target as Element).closest('a[href]');
    if (a?.getAttribute('href') === '#') e.preventDefault();
  },
  true,
);

/* Mobile nav — the header is re-rendered on every navigation, so elements are looked up per event.
   aria-current on the active link is rendered server-side by SiteHeader.astro. */
const navEl = () => document.querySelector<HTMLElement>('.nav');
const toggleEl = () => document.querySelector<HTMLButtonElement>('.site-header__toggle');
const navOpen = () => navEl()?.classList.contains('nav--open') ?? false;
const setNav = (open: boolean) => {
  const nav = navEl();
  const toggle = toggleEl();
  if (!nav || !toggle) return;
  nav.classList.toggle('nav--open', open);
  toggle.setAttribute('aria-expanded', String(open));
  const icon = toggle.querySelector('.site-header__toggle-icon');
  if (icon) icon.textContent = open ? 'close' : 'menu';
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
};
document.addEventListener('click', (e) => {
  const target = e.target as Element;
  if (target.closest('.site-header__toggle')) {
    setNav(!navOpen());
    return;
  }
  if (navOpen() && (target.closest('.nav a') || !target.closest('.site-header'))) setNav(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navOpen()) {
    setNav(false);
    toggleEl()?.focus();
  }
});
matchMedia('(min-width: 1141px)').addEventListener('change', (e) => {
  if (e.matches) setNav(false);
});

/* Per-page setup */
let observers: IntersectionObserver[] = [];

function init() {
  observers.forEach((o) => o.disconnect());
  observers = [];

  /* Scroll reveals. Once revealed, the stagger delay is dropped so hover transitions on the same element
     (hover-lift) respond immediately. */
  const els = document.querySelectorAll<HTMLElement>('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('reveal--in'));
  } else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const el = en.target as HTMLElement;
            el.classList.add('reveal--in');
            el.addEventListener('transitionend', () => el.style.removeProperty('--d'), {
              once: true,
            });
            io.unobserve(el);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    observers.push(io);
  }

  /* Stagger children marked data-stagger */
  document
    .querySelectorAll<HTMLElement>('[data-stagger]')
    .forEach((g) =>
      [...g.children].forEach((c, i) => (c as HTMLElement).style.setProperty('--d', `${i * 70}ms`)),
    );

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
      if (tab.dataset.family)
        list.closest<HTMLElement>('[data-family]')?.setAttribute('data-family', tab.dataset.family);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => activate(t, false));
      t.addEventListener('keydown', (e) => {
        const map: Record<string, number> = {
          ArrowRight: 1,
          ArrowLeft: -1,
          Home: -i,
          End: tabs.length - 1 - i,
        };
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
    observers.push(io2);
  }
}

document.addEventListener('astro:page-load', init);
