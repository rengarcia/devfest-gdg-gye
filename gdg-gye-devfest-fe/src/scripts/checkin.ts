/* /cuenta/checkin — organizers record attendance by QR, by email, or by pasting a list after the event.
   The page is public but useless to anyone else: public.check_in* and import_attendance refuse callers
   who are not in public.staff. Runs from init() on `astro:page-load`, like site.ts. */
import QrScanner from 'qr-scanner';
import { supabase } from '../supabase/client';

interface Copy {
  checkedInText: string;
  alreadyText: string;
  notFoundText: string;
  importResultText: string;
  genericText: string;
}

interface CheckInResult {
  status: 'checked_in' | 'already' | 'not_found';
  first_name?: string;
  last_name?: string;
}

interface ImportResult {
  checked_in: number;
  already: number;
  unmatched: string[];
}

/** A code read again within this window is ignored, so holding a QR in front of the camera counts once. */
const RESCAN_MS = 4000;

let scanner: QrScanner | undefined;

function setup(root: HTMLElement) {
  const sb = supabase();
  const copy: Copy = JSON.parse(root.querySelector('[data-checkin-copy]')?.textContent ?? '{}');
  const event = root.dataset.event ?? '';
  const show = (name: string) =>
    root
      .querySelectorAll<HTMLElement>('[data-view]')
      .forEach((v) => (v.hidden = v.dataset.view !== name));
  const result = root.querySelector<HTMLElement>('[data-result]')!;

  function report(r: CheckInResult | null) {
    result.dataset.status = r?.status ?? 'error';
    if (!r) result.textContent = copy.genericText;
    else if (r.status === 'not_found') result.textContent = copy.notFoundText;
    else
      result.textContent = `${r.status === 'checked_in' ? copy.checkedInText : copy.alreadyText} ${r.first_name} ${r.last_name}`;
  }

  /* Camera */
  const video = root.querySelector<HTMLVideoElement>('[data-video]')!;
  const scan = root.querySelector<HTMLButtonElement>('[data-action="scan"]')!;
  const stop = root.querySelector<HTMLButtonElement>('[data-action="stop"]')!;
  let last = { code: '', at: 0 };

  async function onCode(code: string) {
    const now = Date.now();
    if (code === last.code && now - last.at < RESCAN_MS) return;
    last = { code, at: now };
    const { data, error } = await sb.rpc('check_in', { p_code: code, p_event: event });
    report(error ? null : (data as unknown as CheckInResult));
  }

  scan.addEventListener('click', async () => {
    scanner ??= new QrScanner(video, (r) => void onCode(r.data), {
      returnDetailedScanResult: true,
      highlightScanRegion: true,
    });
    try {
      await scanner.start();
      video.hidden = false;
      scan.hidden = true;
      stop.hidden = false;
    } catch (error) {
      console.error(error);
      report(null);
    }
  });
  stop.addEventListener('click', () => {
    scanner?.stop();
    video.hidden = true;
    scan.hidden = false;
    stop.hidden = true;
  });

  /* By email */
  const emailForm = root.querySelector<HTMLFormElement>('[data-form="email"]')!;
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = emailForm.elements.namedItem('email') as HTMLInputElement;
    if (!input.checkValidity()) return;
    const { data, error } = await sb.rpc('check_in_by_email', {
      p_email: input.value,
      p_event: event,
    });
    report(error ? null : (data as unknown as CheckInResult));
    if (!error) input.value = '';
  });

  /* Import after the event */
  const importForm = root.querySelector<HTMLFormElement>('[data-form="import"]')!;
  importForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = (importForm.elements.namedItem('emails') as HTMLTextAreaElement).value;
    const emails = text.split(/[\s,;]+/).filter((s) => s.includes('@'));
    if (!emails.length) return;
    const out = importForm.querySelector<HTMLElement>('[data-import-result]')!;
    const { data, error } = await sb.rpc('import_attendance', { p_event: event, p_emails: emails });
    if (error) {
      out.textContent = copy.genericText;
      return;
    }
    const r = data as unknown as ImportResult;
    out.textContent = `${copy.importResultText} ${r.checked_in} · ${r.already} · ${r.unmatched.length}`;
    const unmatched = importForm.querySelector<HTMLElement>('[data-unmatched]')!;
    unmatched.hidden = r.unmatched.length === 0;
    importForm
      .querySelector('[data-unmatched-list]')!
      .replaceChildren(
        ...r.unmatched.map((email) =>
          Object.assign(document.createElement('li'), { textContent: email }),
        ),
      );
  });

  (async () => {
    const { data } = await sb.auth.getSession();
    if (!data.session) return show('forbidden');
    const { data: staff } = await sb.from('staff').select('role').maybeSingle();
    show(staff ? 'tools' : 'forbidden');
  })().catch(() => show('forbidden'));
}

function init() {
  const root = document.querySelector<HTMLElement>('[data-checkin]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  setup(root);
}

/* Leaving the page must release the camera. */
document.addEventListener('astro:before-swap', () => {
  scanner?.destroy();
  scanner = undefined;
});
document.addEventListener('astro:page-load', init);
init();
