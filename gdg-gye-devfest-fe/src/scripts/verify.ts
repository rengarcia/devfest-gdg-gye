/* /verificar — checks a certificate code against public.verify_certificate, which anyone may call.
   A plain fetch to the REST endpoint, so this page does not download supabase-js. The code can come
   from the link printed on the certificate (?c=CODE). */

interface Verification {
  code: string;
  event: string;
  date: string;
  issued_at: string;
  /** Only set while the holder allows showing their name. */
  holder: string | null;
}

const dateFormat = new Intl.DateTimeFormat('es-EC', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));

async function verify(code: string): Promise<Verification | null> {
  const res = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/rest/v1/rpc/verify_certificate`, {
    method: 'POST',
    headers: {
      apikey: import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_code: code }),
  });
  if (!res.ok) throw new Error(`verify_certificate: ${res.status}`);
  return res.json();
}

function setup(root: HTMLElement) {
  const form = root.querySelector('form')!;
  const input = form.elements.namedItem('code') as HTMLInputElement;
  const valid = root.querySelector<HTMLElement>('[data-result="valid"]')!;
  const invalid = root.querySelector<HTMLElement>('[data-result="invalid"]')!;
  const field = (name: string) => valid.querySelector<HTMLElement>(`[data-field="${name}"]`)!;

  async function check(code: string) {
    valid.hidden = invalid.hidden = true;
    const button = form.querySelector('button')!;
    button.disabled = true;
    try {
      const r = await verify(code);
      if (!r) {
        invalid.hidden = false;
        return;
      }
      field('holder').textContent = r.holder ?? '';
      field('holder').hidden = !r.holder;
      field('hidden-holder').hidden = Boolean(r.holder);
      field('event').textContent = `${r.event} · ${formatDate(r.date)}`;
      field('issued').textContent = formatDate(r.issued_at);
      valid.hidden = false;
      history.replaceState(history.state, '', `?c=${encodeURIComponent(r.code)}`);
    } catch (error) {
      console.error(error);
      invalid.hidden = false;
    } finally {
      button.disabled = false;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = input.value.trim().toUpperCase();
    if (code) void check(code);
  });

  const fromLink = new URLSearchParams(location.search).get('c');
  if (fromLink) {
    input.value = fromLink.toUpperCase();
    void check(input.value);
  }
}

function init() {
  const root = document.querySelector<HTMLElement>('[data-verify]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  setup(root);
}

document.addEventListener('astro:page-load', init);
init();
