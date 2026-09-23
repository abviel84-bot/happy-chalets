# Happy Chalets · Sitio web + panel de administración

Landing page de **Happy Chalets Beach House** (Guánica, PR) con reservas por WhatsApp y un panel de administración oculto.

- **Frontend:** React 18 + Vite, Tailwind CSS 4, Framer Motion, Lucide Icons y react-day-picker.
- **Backend:** Supabase. La base de datos guarda el contenido, la galería, las fechas ocupadas y las solicitudes. Supabase Auth maneja el login del admin y Supabase Storage guarda las fotos y los videos.
- **Sin precios:** la página no muestra precios. El huésped envía su solicitud y el dueño le contesta el precio por WhatsApp.

---

## 1. Correr el proyecto en tu computadora

```bash
npm install
cp .env.example .env      # llena los datos de Supabase (paso 2)
npm run dev               # http://localhost:5173
```

Si todavía no llenas `.env`, el sitio funciona en **modo demo**, con los datos de `src/lib/defaultContent.js`. El panel admin también abre en ese modo, pero los cambios se pierden al recargar la página.

## 2. Configurar Supabase (una sola vez)

1. Crea un proyecto en <https://supabase.com>.
2. Ve a **SQL Editor → New query**, pega todo el archivo [`supabase/schema.sql`](supabase/schema.sql) y presiona **Run**. Esto crea:
   - Las tablas `site_content`, `media`, `blocked_dates`, `booking_requests` y `admin_users`.
   - Las reglas de seguridad (RLS): el público solo **lee**, y el admin **edita**.
   - El bucket público `media` para fotos y videos.
3. Crea el usuario administrador en **Authentication → Users → Add user**. Usa el correo y la contraseña del dueño y marca *Auto Confirm User*.
4. Autoriza ese correo como admin. El script ya agrega `happychaletsbh@gmail.com`. Si usas otro correo, corre esto:
   ```sql
   insert into public.admin_users (email) values ('otro@correo.com');
   ```
5. En **Authentication → Sign In / Providers**, desactiva *Allow new users to sign up*. Así nadie más puede crear una cuenta.
6. Copia la **Project URL** y la **anon public key** (Project Settings → API) a `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

### Videos de más de 50 MB

Los archivos se suben con *resumable upload* (protocolo TUS). Se envían en partes de 6 MB y, si se corta el internet, la subida continúa donde se quedó.

El tamaño máximo por archivo lo decide el **plan de Supabase**:

| Plan | Máximo por archivo |
|------|--------------------|
| Free | 50 MB |
| Pro  | Hasta 500 GB. Súbelo en **Storage → Settings → Upload file size limit** |

Para subir videos de más de 50 MB necesitas el plan **Pro**. El bucket `media` ya está configurado para aceptar hasta 5 GB por archivo. Si más adelante quieres más, cambia `file_size_limit` en el SQL.

Recomendación para el video de portada: MP4 (H.264), 1080p, de 20 a 40 segundos y sin audio. Se reproduce en silencio y en bucle, y usa una foto de "póster" mientras carga.

> **¿Y Firebase?** Firebase Storage también sube archivos grandes, pero desde 2024 los proyectos nuevos necesitan el plan Blaze (pago por uso). Además habría que usar otro sistema para la base de datos y el login. Por eso el proyecto usa solamente Supabase.

## 3. Modo administrador (secreto)

1. En la página, haz **5 clics seguidos en el nombre / logo "HAPPY CHALETS"** del menú de arriba (en menos de 3 segundos).
2. Entra con el correo y la contraseña del admin.
3. En el panel puedes:

| Sección | Qué hace |
|---|---|
| **Solicitudes** | Copia de cada solicitud enviada por WhatsApp, con estado (nueva, contestada, confirmada, descartada). |
| **Fechas ocupadas** | Bloquea o libera fechas por chalet. Los huéspedes las ven tachadas en el calendario. |
| **Mensaje de WhatsApp** | Edita el mensaje automático (español e inglés) con variables como `{nombre}`, `{chalet}`, `{llegada}`, `{salida}`, `{noches}` y `{huespedes}`. Tiene vista previa y botón para probarlo. Las líneas con un dato vacío no se envían. |
| **Portada** | Cambia entre foto o video de fondo (subir archivo o pegar enlace) y edita los textos. |
| **Galería** | Sube varias fotos o videos a la vez con barra de progreso. También puedes cambiar la categoría, poner descripciones, ordenar y borrar. |
| **Chalets** | Nombre, capacidad, habitaciones, baños, foto, descripción y características. Puedes agregar o quitar chalets. |
| **Textos y listas** | Títulos de cada sección, barra de confianza, amenidades, lugares de Guánica, preguntas frecuentes y reseñas reales. |
| **Contacto y reglas** | WhatsApp, teléfono, email, dirección, redes, mínimo de noches y si se aceptan mascotas. |

Los cambios de contenido se aplican con el botón **Guardar cambios**. La galería y las fechas ocupadas se guardan al instante.

## 4. Publicar en GitHub Pages (lo más fácil)

La carpeta **`docs/`** ya trae el sitio construido y conectado a Supabase.

1. Sube **todo** el proyecto a un repositorio de GitHub (rama `main`).
2. **Settings → Pages → Source: Deploy from a branch → `main` → carpeta `/docs` → Save.**
3. En 1–2 minutos aparece el enlace.

Cuando cambies el código: `npm run build` (vuelve a generar `docs/`) y sube los cambios.

> Alternativa automática: en Settings → Pages elige **GitHub Actions**; el archivo `.github/workflows/deploy.yml` construye y publica solo. Necesita los secrets `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## 5. Publicar en Vercel o Netlify (opcional)

1. Sube el proyecto a GitHub.
2. En Vercel o Netlify: **New project** → elige el repositorio. Build command: `npm run build`. Output: `docs`.
3. Agrega las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en la configuración del proyecto.
4. Conecta el dominio y actualiza `https://happychalets.com` en `index.html` (canonical, og:image y schema.org).
5. En Supabase → **Authentication → URL Configuration**, pon el dominio en *Site URL*. Esto hace falta para que funcione "Olvidé mi contraseña".

## 6. Estructura

```
src/
  lib/defaultContent.js   contenido por defecto (también sirve de respaldo)
  lib/whatsapp.js         plantilla del mensaje y variables
  lib/api.js              lectura y escritura en Supabase (o memoria en modo demo)
  lib/upload.js           subida por partes (videos grandes)
  components/             secciones de la página
  booking/BookingModal    flujo de reserva de 5 pasos
  admin/                  login y panel (se carga solo cuando se abre)
supabase/schema.sql       tablas, seguridad y bucket
docs/                     sitio ya construido (lo que publica GitHub Pages)
```

## Notas

- El contenido **no** se guarda en `localStorage`. Todo sale de Supabase, así se ve igual en cualquier dispositivo.
- Cada huésped tiene su propia solicitud: el mensaje sale del WhatsApp de la persona hacia el número configurado.
- Las solicitudes quedan registradas aunque la persona no llegue a enviar el mensaje en WhatsApp.
- Los datos marcados como `[Por confirmar]` en las preguntas frecuentes se editan desde el panel.
