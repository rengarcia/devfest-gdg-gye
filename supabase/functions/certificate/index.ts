// Renders a participation certificate as PDF, on demand; nothing is stored.
//
// Called from /cuenta with the attendee's session (supabase.functions.invoke('certificate',
// { body: { id } })). The query runs with the caller's JWT, so row-level security decides what
// they can download: only their own certificates, and only once the event's certificates are open.
// Every value printed (name, event, date, code) comes from the database, never from the request.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors';
import { PDFDocument, type PDFFont, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1';

/** Public site (SITE_URL secret). Without it the PDF uses a text heading and the caller's origin for the link. */
const SITE_URL = Deno.env.get('SITE_URL')?.replace(/\/$/, '');
const siteUrl = (req: Request) => SITE_URL ?? req.headers.get('origin')?.replace(/\/$/, '') ?? '';

const INK = rgb(0x1e / 255, 0x1e / 255, 0x1e / 255);
const MUTED = rgb(0x6f / 255, 0x6f / 255, 0x6f / 255);
const BRAND = [
  rgb(0x42 / 255, 0x85 / 255, 0xf4 / 255),
  rgb(0xea / 255, 0x43 / 255, 0x35 / 255),
  rgb(0xf9 / 255, 0xab / 255, 0x00 / 255),
  rgb(0x34 / 255, 0xa8 / 255, 0x53 / 255),
];

function publishableKey() {
  const keys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  return keys ? JSON.parse(keys).default : Deno.env.get('SUPABASE_ANON_KEY')!;
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

/** The standard fonts only cover WinAnsi; anything else falls back to its unaccented letter or "?". */
function encodable(font: PDFFont, text: string) {
  return [...text]
    .map((ch) => {
      for (const candidate of [ch, ch.normalize('NFD').replace(/\p{M}/gu, '')]) {
        try {
          font.encodeText(candidate);
          return candidate;
        } catch {
          // try the next candidate
        }
      }
      return '?';
    })
    .join('');
}

const longDate = (iso: string) =>
  new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));

// Only fetched from the configured site, never from a URL the caller controls.
async function lockup(pdf: PDFDocument) {
  if (!SITE_URL) return null;
  try {
    const res = await fetch(`${SITE_URL}/assets/devfest-lockup-location.png`);
    if (!res.ok) return null;
    return await pdf.embedPng(new Uint8Array(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

interface Certificate {
  code: string;
  issued_at: string;
  event: { name: string; date: string };
  profile: { first_name: string; last_name: string };
}

async function render(cert: Certificate, site: string) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Certificado ${cert.event.name}`);
  pdf.setAuthor('GDG Guayaquil');
  const page = pdf.addPage([841.89, 595.28]); // A4 landscape
  const { width, height } = page.getSize();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 56;

  // Frame and the four brand dots (no gradients, no shadows).
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: INK,
    borderWidth: 2,
  });
  BRAND.forEach((color, i) =>
    page.drawCircle({ x: width - margin - 10 - i * 26, y: height - margin - 10, size: 9, color }),
  );

  const logo = await lockup(pdf);
  if (logo) {
    const h = 44;
    page.drawImage(logo, {
      x: margin,
      y: height - margin - h,
      width: (logo.width / logo.height) * h,
      height: h,
    });
  } else {
    page.drawText(encodable(bold, cert.event.name), {
      x: margin,
      y: height - margin - 20,
      size: 20,
      font: bold,
      color: INK,
    });
  }

  const text = (value: string, y: number, size: number, font: PDFFont, color = INK) =>
    page.drawText(encodable(font, value), {
      x: margin,
      y,
      size,
      font,
      color,
      maxWidth: width - 2 * margin,
    });

  text('Certificado de participación', height - 190, 36, bold);
  text('Se certifica que', height - 240, 16, regular, MUTED);
  const name = `${cert.profile.first_name} ${cert.profile.last_name}`;
  const nameSize = Math.min(44, ((width - 2 * margin) / bold.widthOfTextAtSize(name, 44)) * 44);
  text(name, height - 300, nameSize, bold);
  text(
    `participó en ${cert.event.name}, realizado el ${longDate(cert.event.date)} en Guayaquil, Ecuador.`,
    height - 340,
    16,
    regular,
  );

  text('Organizado por GDG Guayaquil', margin + 52, 13, bold);
  text(`Emitido el ${longDate(cert.issued_at)}`, margin + 32, 11, regular, MUTED);
  const verify = site ? `  ·  ${site}/verificar?c=${cert.code}` : '';
  text(`Código de verificación ${cert.code}${verify}`, margin + 12, 11, regular, MUTED);

  return pdf.save();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const { id } = await req.json().catch(() => ({ id: null }));
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id))
    return json({ error: 'invalid_id' }, 400);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, publishableKey(), {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false },
  });

  const { data: cert, error } = await supabase
    .from('certificates')
    .select('code, issued_at, user_id, event:events!inner(name, date)')
    .eq('id', id)
    .maybeSingle();
  if (error) return json({ error: 'query_failed' }, 500);
  if (!cert) return json({ error: 'not_found' }, 404);

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', cert.user_id)
    .maybeSingle();
  if (!profile) return json({ error: 'not_found' }, 404);

  const bytes = await render(
    {
      code: cert.code,
      issued_at: cert.issued_at,
      event: cert.event as unknown as Certificate['event'],
      profile,
    },
    siteUrl(req),
  );
  return new Response(bytes, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-devfest-${cert.code}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
});
