# Cuentas de asistentes (Supabase)

Base de datos, autenticación y certificados de las cuentas de DevFest Guayaquil. El sitio sigue
siendo estático: el navegador habla directo con Supabase usando la clave publicable, y la seguridad
la ponen las políticas de RLS y las funciones SQL de `migrations/`.

- Proyecto: `devfest-gye` (`leizlplvmnqkenmwijfx`), región `sa-east-1` (São Paulo).
- Organización: _Renan Andres Garcia's projects_ (integración de Vercel).

## Qué hay aquí

```
config.toml                 Ajustes del proyecto para la CLI (auth por código, plantillas)
templates/otp.html          Correo con el código de 6 dígitos
migrations/                 Esquema: perfiles, consentimientos, eventos, staff, asistencia, certificados
functions/certificate/      Edge Function que genera el PDF del certificado (no guarda nada)
```

### Modelo

| Tabla          | Para qué                                                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`     | Nombre y apellido (para el certificado), código del QR, declaración de 15+ años, último uso.                                                    |
| `purposes`     | Finalidades del tratamiento. `account` es obligatoria; `public_verification` opcional; `giveaways` y `game` existen inactivas para el futuro.   |
| `consents`     | Registro **solo de inserción** de cada aceptación o retiro, con versión del aviso y navegador. La vista `current_consents` da el estado actual. |
| `events`       | Una fila por edición (`slug` = año). `certificates_open` habilita la descarga.                                                                  |
| `staff`        | Organizadores que pueden registrar asistencia. Se asigna por SQL, nunca desde la app.                                                           |
| `attendances`  | Asistencia por QR, correo o importación; guarda quién la registró.                                                                              |
| `certificates` | Se crea solo al registrar una asistencia. Código corto para `/verificar`.                                                                       |

Funciones que llama la app: `register`, `set_consent`, `touch_last_seen`, `export_my_data`,
`delete_my_account` (personas registradas); `check_in`, `check_in_by_email`, `import_attendance`
(staff); `verify_certificate` (cualquiera; muestra el nombre solo con consentimiento).

Un job de `pg_cron` (`purge-accounts`, diario) borra los correos que pidieron código y no se
registraron en 7 días y las cuentas sin uso en 3 años, tal como dice el aviso de privacidad.

### Extender: sorteos, juego

1. Activa la finalidad: `update public.purposes set active = true where key = 'giveaways';`
2. Añade su texto en el Studio (Mi cuenta → Finalidades) y, si cambia lo que la gente aceptó, sube
   la versión del Aviso de privacidad: se pedirá aceptar de nuevo.
3. Crea las tablas del módulo con RLS y filtra a quienes tengan la finalidad concedida en
   `current_consents`. Nunca uses los datos de alguien sin ese consentimiento.

## Configuración de Auth y correo

- **SMTP (Resend)** se configura solo en el dashboard
  ([Authentication → Emails → SMTP](https://supabase.com/dashboard/project/leizlplvmnqkenmwijfx/auth/smtp)):
  `smtp.resend.com`, puerto `465`, usuario `resend`, contraseña = API key de Resend con permiso
  _Sending access_ para `gdggye.org`, remitente `DevFest Guayaquil <devfest@gdggye.org>`. La clave
  no va en `config.toml`, y por eso ese archivo no declara `[auth.email.smtp]`.
- **Dominio en Resend**: `gdggye.org`, región São Paulo. Registros en Namecheap: TXT
  `resend._domainkey` (DKIM), CNAME `rsend` y `send` (envío), TXT `_dmarc` (`v=DMARC1; p=none;`).
- **El resto de Auth** (código de 6 dígitos, vencimiento de 10 minutos, plantillas en español, site
  URL y redirects) está en `config.toml`. Para cambiarlo: `supabase config diff` y luego
  `supabase config push`, con la cuenta dueña del proyecto.
- Dos ajustes que `config push` no aplica y van en el dashboard:
  [Rate limits](https://supabase.com/dashboard/project/leizlplvmnqkenmwijfx/auth/rate-limits)
  (correos por hora; el plan gratuito de Resend da 100 al día) y desactivar el proveedor de SMS en
  [Providers → Phone](https://supabase.com/dashboard/project/leizlplvmnqkenmwijfx/auth/providers)
  (no se usa).
- **Edge Functions → Secrets**: `SITE_URL` = `https://devfest-gdg-gye.vercel.app` (ya está puesto).

6. Marca a los organizadores como staff (SQL Editor), después de que creen su cuenta:

   ```sql
   insert into public.staff (user_id)
   select id from auth.users where email in ('persona@ejemplo.com');
   ```

7. **Vercel → Settings → Environment Variables**: `PUBLIC_SUPABASE_URL` y
   `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (los valores de `.env.example`) antes del primer deploy con
   estas páginas. Sin ellas el resto del sitio funciona, pero `/cuenta` no.
8. **Plan del proyecto**: los proyectos gratuitos se pausan tras un periodo sin actividad y, en
   pausa, no hay registro, check-in ni certificados. Pasa el proyecto a un plan de pago (o asegura
   uso continuo) antes de abrir el registro y hasta que se hayan descargado los certificados.
9. **Abrir el registro** (después de desplegar estas rutas): en el Studio,
   `npm run seed:pages` pone el _Enlace de registro_ en `/cuenta` y añade "Aviso de privacidad" al
   pie de página si faltan. También puede hacerse a mano en Configuración del sitio.

## Operación del evento

- Día del evento: organizadores entran a `/cuenta/checkin` y escanean el QR de cada asistente
  (o lo buscan por correo).
- Después: importan la lista de asistencia que tengan (los correos sin cuenta se muestran y no se
  guardan) y abren los certificados:

  ```sql
  update public.events set certificates_open = true where slug = '2026';
  ```

## Cambios de esquema

Escribe una migración nueva en `migrations/` (no edites las aplicadas), aplícala y regenera los
tipos del sitio en `gdg-gye-devfest-fe/src/supabase/database.types.ts`:

```
supabase link --project-ref leizlplvmnqkenmwijfx
supabase db push
supabase gen types typescript --linked > ../gdg-gye-devfest-fe/src/supabase/database.types.ts
supabase functions deploy certificate
```

Después revisa los avisos de seguridad (Advisors). Los avisos "SECURITY DEFINER function
executable" de las funciones de arriba son intencionales: cada una comprueba `auth.uid()` o
pertenencia a `staff` antes de hacer nada.

## LOPDP: lo que el código no resuelve

- Revisión legal del texto de `/privacidad` (Studio → Aviso de privacidad) antes de abrir el registro.
- Inscribir el tratamiento y las transferencias internacionales en el Registro Nacional de
  Protección de Datos Personales de la SPDP, y confirmar si hace falta un delegado de protección
  de datos.
- Procedimiento de respuesta a vulneraciones (a quién se avisa y en qué plazo).
- Acuerdos de tratamiento (DPA) con Supabase y con el proveedor de SMTP.
- La norma de la SPDP sobre transferencias internacionales se ha reemplazado varias veces;
  confirma en spdp.gob.ec cuál está vigente.
