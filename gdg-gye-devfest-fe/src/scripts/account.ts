/* /cuenta — sign-in with an email code, registration, and the attendee's dashboard.
   The page ships every view hidden ([data-view]); this script shows the one that fits the session.
   Every write goes through the SQL functions in ../../../supabase/migrations, which check the caller
   and record consent; row-level security limits every read to the caller's own rows.
   Runs from init() on `astro:page-load`, like site.ts; the root element is marked once set up. */
import { AuthApiError, type User } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { supabase } from '../supabase/client';
import { ACCOUNT_CHANGE_EVENT } from '../supabase/session';

interface Copy {
  errors: {
    genericText: string;
    invalidEmail: string;
    invalidCode: string;
    rateLimitedText: string;
    requiredText: string;
  };
  savedText: string;
  deletedText: string;
}

type View = 'loading' | 'email' | 'code' | 'register' | 'reconsent' | 'dashboard' | 'deleted';

const announceAccountChange = () => document.dispatchEvent(new Event(ACCOUNT_CHANGE_EVENT));

const dateFormat = new Intl.DateTimeFormat('es-EC', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setup(root: HTMLElement) {
  const sb = supabase();
  const copy: Copy = JSON.parse(root.querySelector('[data-account-copy]')?.textContent ?? '{}');
  const policyVersion = root.dataset.policyVersion ?? '';
  const userAgent = navigator.userAgent;
  let email = '';

  const views = [...root.querySelectorAll<HTMLElement>('[data-view]')];
  const view = (name: View) => root.querySelector<HTMLElement>(`[data-view="${name}"]`)!;
  const field = (scope: ParentNode, name: string) =>
    scope.querySelector<HTMLElement>(`[data-field="${name}"]`);

  function show(name: View) {
    views.forEach((v) => (v.hidden = v.dataset.view !== name));
    const first = view(name).querySelector<HTMLElement>('input:not([type="checkbox"]), button');
    if (name !== 'loading' && name !== 'dashboard') first?.focus();
  }

  function setError(scope: Element, message = '') {
    const el = scope.querySelector<HTMLElement>('.form__error');
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
  }

  function messageFor(error: unknown) {
    if (error instanceof AuthApiError) {
      if (error.status === 429) return copy.errors.rateLimitedText;
      if (error.code === 'otp_expired' || error.status === 403) return copy.errors.invalidCode;
      if (error.code === 'validation_failed' || error.code === 'email_address_invalid')
        return copy.errors.invalidEmail;
    }
    // Raised by public.register when a required checkbox is missing (consent_required, age_required).
    if (
      error instanceof Object &&
      /_required$/.test(String((error as { message?: unknown }).message))
    )
      return copy.errors.requiredText;
    return copy.errors.genericText;
  }

  /** Runs a form action with the submit buttons disabled, showing its error in the form. */
  async function busy(scope: HTMLElement, action: () => Promise<void>) {
    const buttons = [...scope.querySelectorAll<HTMLButtonElement>('button')];
    buttons.forEach((b) => (b.disabled = true));
    setError(scope);
    try {
      await action();
    } catch (error) {
      console.error(error);
      setError(scope, messageFor(error));
    } finally {
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  /* Which view a signed-in person lands on */
  async function route(user: User) {
    show('loading');
    const { data: profile, error } = await sb.from('profiles').select('*').maybeSingle();
    if (error) throw error;
    if (!profile) {
      // Signed in with the code but not registered yet: nothing is stored but the email.
      const { data: purposes } = await sb.from('purposes').select('key').eq('active', true);
      const active = new Set((purposes ?? []).map((p) => p.key));
      root.querySelectorAll<HTMLElement>('[data-purpose-row]').forEach((row) => {
        row.hidden = !active.has(row.dataset.purposeRow!);
      });
      show('register');
      return;
    }
    const { data: consents } = await sb
      .from('current_consents')
      .select('purpose, granted, policy_version');
    const account = consents?.find((c) => c.purpose === 'account');
    if (!account?.granted || account.policy_version !== policyVersion) {
      show('reconsent');
      return;
    }
    await renderDashboard(user, profile, consents ?? []);
  }

  async function start() {
    show('loading');
    const { data } = await sb.auth.getSession();
    if (data.session) await route(data.session.user);
    else show('email');
  }

  /* Step 1: email */
  const emailForm = view('email') as HTMLFormElement;
  async function sendCode() {
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw error;
  }
  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = emailForm.elements.namedItem('email') as HTMLInputElement;
    if (!input.checkValidity()) return setError(emailForm, copy.errors.invalidEmail);
    busy(emailForm, async () => {
      email = input.value.trim().toLowerCase();
      await sendCode();
      field(view('code'), 'email')!.textContent = email;
      show('code');
    });
  });

  /* Step 2: code */
  const codeForm = view('code') as HTMLFormElement;
  codeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = codeForm.elements.namedItem('code') as HTMLInputElement;
    const token = input.value.replace(/\D/g, '');
    if (token.length !== 6) return setError(codeForm, copy.errors.invalidCode);
    busy(codeForm, async () => {
      const { data, error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      input.value = '';
      announceAccountChange();
      await route(data.user!);
    });
  });
  codeForm
    .querySelector('[data-action="resend"]')!
    .addEventListener('click', () => busy(codeForm, sendCode));
  codeForm.querySelector('[data-action="change-email"]')!.addEventListener('click', () => {
    setError(codeForm);
    show('email');
  });

  /* Step 3: registration */
  const registerForm = view('register') as HTMLFormElement;
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const visible = [...registerForm.querySelectorAll<HTMLInputElement>('input')].filter(
      (i) => !i.closest<HTMLElement>('[data-purpose-row]')?.hidden,
    );
    if (!visible.every((i) => i.checkValidity()))
      return setError(registerForm, copy.errors.requiredText);
    const value = (name: string) =>
      (registerForm.elements.namedItem(name) as HTMLInputElement).value.trim();
    const consents = Object.fromEntries(
      visible.filter((i) => i.name === 'purpose').map((i) => [i.value, i.checked]),
    );
    busy(registerForm, async () => {
      const { error } = await sb.rpc('register', {
        p_first_name: value('firstName'),
        p_last_name: value('lastName'),
        p_consents: consents,
        p_policy_version: policyVersion,
        p_age_confirmed: (registerForm.elements.namedItem('age') as HTMLInputElement).checked,
        p_user_agent: userAgent,
      });
      if (error) throw error;
      const { data } = await sb.auth.getUser();
      await route(data.user!);
    });
  });

  /* New privacy notice version */
  const reconsentView = view('reconsent');
  reconsentView.querySelector('[data-action="reconsent"]')!.addEventListener('click', () =>
    busy(reconsentView, async () => {
      const { error } = await sb.rpc('set_consent', {
        p_purpose: 'account',
        p_granted: true,
        p_policy_version: policyVersion,
        p_user_agent: userAgent,
      });
      if (error) throw error;
      const { data } = await sb.auth.getUser();
      await route(data.user!);
    }),
  );

  /* Dashboard */
  const dashboard = view('dashboard');
  const profileForm = dashboard.querySelector<HTMLFormElement>('[data-form="profile"]')!;
  const privacyCard = dashboard
    .querySelector<HTMLElement>('[data-action="export"]')!
    .closest('section')!;
  let userId = '';

  async function renderDashboard(
    user: User,
    profile: { first_name: string; last_name: string; checkin_code: string },
    consents: { purpose: string | null; granted: boolean | null }[],
  ) {
    userId = user.id;
    field(dashboard, 'firstName')!.textContent = profile.first_name;
    field(profileForm, 'email')!.textContent = user.email ?? '';
    (profileForm.elements.namedItem('firstName') as HTMLInputElement).value = profile.first_name;
    (profileForm.elements.namedItem('lastName') as HTMLInputElement).value = profile.last_name;

    field(dashboard, 'checkinCode')!.textContent = profile.checkin_code;
    (field(dashboard, 'qr') as HTMLImageElement).src = await QRCode.toDataURL(
      profile.checkin_code,
      {
        width: 480,
        margin: 1,
      },
    );

    const granted = new Map(consents.map((c) => [c.purpose, c.granted]));
    dashboard.querySelectorAll<HTMLInputElement>('[data-consent]').forEach((input) => {
      input.checked = granted.get(input.dataset.consent!) === true;
    });

    show('dashboard');
    void sb.rpc('touch_last_seen');
    void sb
      .from('staff')
      .select('role')
      .maybeSingle()
      .then(({ data }) => {
        dashboard.querySelector<HTMLElement>('[data-staff-only]')!.hidden = !data;
      });
    await renderCertificates();
  }

  async function renderCertificates() {
    const list = dashboard.querySelector<HTMLUListElement>('[data-certificates]')!;
    const empty = dashboard.querySelector<HTMLElement>('[data-certificates-empty]')!;
    const errorEl = dashboard.querySelector<HTMLElement>('[data-certificates-error]')!;
    const template = dashboard.querySelector<HTMLTemplateElement>('[data-template="certificate"]')!;
    const { data, error } = await sb
      .from('certificates')
      .select('id, code, issued_at, event:events(name, date)')
      .order('issued_at', { ascending: false });
    errorEl.hidden = !error;
    if (error) errorEl.textContent = copy.errors.genericText;
    list.replaceChildren(
      ...(data ?? []).map((cert) => {
        const item = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
        field(item, 'event')!.textContent = cert.event?.name ?? '';
        field(item, 'date')!.textContent = cert.event ? formatDate(cert.event.date) : '';
        field(item, 'code')!.textContent = cert.code;
        field(item, 'verify')!.setAttribute(
          'href',
          `/verificar?c=${encodeURIComponent(cert.code)}`,
        );
        const button = item.querySelector<HTMLButtonElement>('[data-action="download"]')!;
        button.addEventListener('click', async () => {
          button.disabled = true;
          errorEl.hidden = true;
          const { data: pdf, error: fnError } = await sb.functions.invoke<Blob>('certificate', {
            body: { id: cert.id },
          });
          button.disabled = false;
          if (fnError || !(pdf instanceof Blob)) {
            errorEl.textContent = copy.errors.genericText;
            errorEl.hidden = false;
            return;
          }
          download(pdf, `certificado-devfest-${cert.code}.pdf`);
        });
        return item;
      }),
    );
    empty.hidden = (data ?? []).length > 0;
  }

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = profileForm.querySelector<HTMLElement>('.form__status')!;
    status.textContent = '';
    const inputs = [...profileForm.querySelectorAll<HTMLInputElement>('input')];
    if (!inputs.every((i) => i.checkValidity() && i.value.trim()))
      return setError(profileForm, copy.errors.requiredText);
    busy(profileForm, async () => {
      const [first, last] = inputs.map((i) => i.value.trim());
      const { error } = await sb
        .from('profiles')
        .update({ first_name: first, last_name: last })
        .eq('id', userId);
      if (error) throw error;
      field(dashboard, 'firstName')!.textContent = first;
      status.textContent = copy.savedText;
    });
  });

  dashboard.querySelectorAll<HTMLInputElement>('[data-consent]').forEach((input) =>
    input.addEventListener('change', () =>
      busy(privacyCard, async () => {
        const { error } = await sb.rpc('set_consent', {
          p_purpose: input.dataset.consent!,
          p_granted: input.checked,
          p_policy_version: policyVersion,
          p_user_agent: userAgent,
        });
        if (error) {
          input.checked = !input.checked;
          throw error;
        }
      }),
    ),
  );

  privacyCard.querySelector('[data-action="export"]')!.addEventListener('click', () =>
    busy(privacyCard, async () => {
      const { data, error } = await sb.rpc('export_my_data');
      if (error) throw error;
      download(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
        'mis-datos-devfest-guayaquil.json',
      );
    }),
  );

  const deleteToggle = privacyCard.querySelector<HTMLButtonElement>('[data-action="delete"]')!;
  const deletePanel = privacyCard.querySelector<HTMLElement>('#delete-confirm')!;
  deleteToggle.addEventListener('click', () => {
    const open = deleteToggle.getAttribute('aria-expanded') !== 'true';
    deleteToggle.setAttribute('aria-expanded', String(open));
    deletePanel.hidden = !open;
  });
  privacyCard.querySelector('[data-action="delete-confirm"]')!.addEventListener('click', () =>
    busy(privacyCard, async () => {
      const { error } = await sb.rpc('delete_my_account');
      if (error) throw error;
      // The user no longer exists on the server; only the local session is left to clear.
      await sb.auth.signOut({ scope: 'local' });
      announceAccountChange();
      field(view('deleted'), 'deleted')!.textContent = copy.deletedText;
      show('deleted');
    }),
  );

  root.querySelectorAll('[data-action="sign-out"]').forEach((button) =>
    button.addEventListener('click', async () => {
      await sb.auth.signOut();
      announceAccountChange();
      show('email');
    }),
  );

  start().catch((error) => {
    console.error(error);
    show('email');
    setError(emailForm, copy.errors.genericText);
  });
}

function init() {
  const root = document.querySelector<HTMLElement>('[data-account]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  setup(root);
}

document.addEventListener('astro:page-load', init);
init();
