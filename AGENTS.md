# AGENTS.md — Diédrico Studio

Contexto operativo para agentes/IA que trabajen en este repo. **Sin secretos** (los secretos
están en `.env` y en `~/.config/opencode/env`; ver `ACCESOS_Y_DEPLOY.md`, que no está en git).

## Qué es

App web educativa de geometría 3D y sistema diédrico: visor 3D (Three.js / react-three-fiber),
vista 2D diédrica, herramientas de medida/exportación (jsPDF, JSZip), asistente IA (Groq),
auth y guardado en la nube (Supabase). Producción: https://diedrico-studio.vercel.app

## Stack y comandos

```bash
npm install
npm run dev      # Vite en http://localhost:5173
npm run build    # tsc -b && vite build -> dist/   (debe pasar antes de push)
npm run preview
npm test         # vitest: geometría de sólidos, rotaciones y selección por herramienta
```

- Vite 5 · React 18 · TypeScript 5.5 · Tailwind 3 · Zustand · three 0.163
- Deploy: **push a `main` → Vercel automático** (proyecto `diedrico-studio`).
- Node 24.x en Vercel.

## Variables de entorno (solo nombres)

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AI_PROVIDER` (default `groq`),
`VITE_ENABLE_AI`. `VITE_GEMINI_API_KEY` está sin uso (legacy).

⚠️ Todo `VITE_*` acaba en el bundle público: **nunca** metas una `service_role`/`sb_secret_`
ni una API key de IA.

⚠️ La clave de Groq **no** está en el cliente: vive como secreto `GROQ_API_KEY` de la Edge
Function `supabase/functions/ai-proxy`. El navegador llama a `/functions/v1/ai-proxy`.

## Estructura

```
src/
├── App.tsx / MainApp.tsx        raíz de rutas y layout
├── pages/                      Academy, Guide, About, Contact, Privacy, Terms
├── components/                 Sidebar, Scene (3D), DiedricoView (2D), ChatInterface...
│   ├── 2D/  3D/  tools/        renderizado y herramientas geométricas
├── features/ai-assistant/      servicios del asistente + store + prompts (aiProxy.ts → Edge Function)
├── lib/solidGeometry.ts        malla única de sólidos (la usan 3D y 2D: no duplicar)
├── store/geometryStore.ts      elementos 3D + CRUD de proyectos en Supabase
├── store/userStore.ts          sesión, perfil, progreso (temas/ejercicios)
├── lib/supabase.ts             cliente Supabase
├── lib/database.types.ts       tipos generados desde la DB (no editar a mano)
├── config/features.ts          feature flags y proveedor IA
├── config/premium.ts           qué es premium + enlace Ko-fi (único sitio a tocar)
└── utils/                      matemáticas, distancias, etiquetas

scripts/premium.sh              activar/quitar premium a mano (service_role)
scripts/kofi-token.sh           guardar el Verification Token de Ko-fi en Supabase

Analítica: @vercel/analytics (sin cookies). Eventos en `src/lib/analytics.ts`
(premium_modal_open, premium_kofi_click, ai_gate, ai_message, academy_view, guide_view...).
Hay que activar Web Analytics en el panel de Vercel.
```

## Base de datos (Supabase)

Proyecto `zrfmltqfunizhudkekdc` (`eu-west-1`, Postgres 17). Tablas en `public`:

- `projects(id, user_id, title, description, thumbnail_url, data jsonb, created_at, updated_at)`
  — `data = { elements, sketchElements }`. RLS por `auth.uid() = user_id`.
  **Guardar actualiza** si hay `currentProjectId` en el store; si no, inserta.
- `laminas_docs(user_id PK, data jsonb, updated_at)` — un documento de láminas por usuario.
  RLS por `auth.uid() = user_id`. Se sincroniza desde `LaminasCloudSync` escuchando el
  `localStorage` del iframe (mismo origen).
- `kofi_events(...)` — pagos del webhook de Ko-fi (auditoría + idempotencia). Sin políticas RLS:
  solo `service_role`.
- `ai_rate_limits(key, window_start, count)` — contadores de rate limit (IP, usuario y prueba).
- `analytics_events(id, name, props, path, user_id, created_at)` — embudo de producto. Solo INSERT
  desde la web (anon/authenticated); leer requiere service_role. Es el sustituto de los eventos
  personalizados de Vercel, que son de pago.
- `profiles(id, email, full_name, avatar_url, is_premium, premium_until, role, completed_topics text[],
  completed_exercises text[], created_at)` — RLS por `auth.uid() = id`; un trigger protege
  `is_premium`/`premium_until`/`role`/`email` para que el cliente no pueda escalar privilegios.

## Plan premium

- Config única: `src/config/premium.ts` (features, enlace de Ko-fi, texto de precio).
- Premium = **Academia** + **Asistente IA**. La nube (guardar proyectos) es gratis.
- `isPremium` del `userStore` es derivado: `is_premium && (!premium_until || premium_until > now)`.
- El panel de IA lo ve todo el mundo. Sin premium tiene **3 mensajes de prueba** por cuenta y
  mes (los cuenta el proxy, no el cliente). Al agotarlos, 402 y se abre el modal de Premium.
- El proxy exige JWT de una cuenta válida y comprueba el plan: 401 sin sesión, 402 sin Premium
  ni prueba. Además: 60/h por IP, 300/día por cuenta.
- Activación automática: `supabase/functions/kofi-webhook` recibe los pagos de Ko-fi y suma 1 mes
  a `premium_until` por pago (idempotente por `message_id`). Requiere el secret
  `KOFI_VERIFICATION_TOKEN` con el token de Ko-fi.
- Activación manual (respaldo): `./scripts/premium.sh correo on [meses]`.

## Coherencia 3D ↔ 2D

- Los sólidos se construyen en `src/lib/solidGeometry.ts`. 3D (`SolidObject`) y 2D (`Solid2D`) usan
  la MISMA malla. Prohibido duplicar geometría en un componente: si algo no coincide, el fallo está
  en la rotación (convención `Rx·Rz·Ry`, igual que Three con `rotation=[rx,rz,ry]`) o en las unidades.
- Cada herramienta declara cuántos elementos consume en `selectionCountForTool` (geometryStore).
  Si añades una herramienta nueva, añádela ahí o se quedará esperando selección para siempre.

Cambios de esquema SIEMPRE como migración:

```bash
supabase migration new nombre_del_cambio
# editar supabase/migrations/<ts>_nombre_del_cambio.sql
supabase db push
supabase gen types typescript --linked > src/lib/database.types.ts
```

Conexión: el host `db.<ref>.supabase.co` es solo IPv6; usar el pooler
`aws-1-eu-west-1.pooler.supabase.com` (usuario `postgres.<ref>`, puertos 5432/6543).
`supabase/schema_baseline_2026-10-20.sql` es el dump del esquema original (referencia).

## Convenciones

- TypeScript estricto; el build falla si hay errores de tipos (`tsc -b`).
- `npm test` debe pasar. Los tests de `solidGeometry` comparan la rotación con la matriz real de
  Three: si tocas ejes o signos, te avisan (ya pillaron un desfase de signo).
- Avisos al usuario con `toast()` (`src/lib/toast.ts`), **no** `alert()`.
- Modales con `useModalA11y` (Escape, foco atrapado, `role="dialog"`).
- Rutas secundarias en `lazy()`; el motor 3D (`Scene`, `DiedricoView`) también, para que la
  interfaz pinte antes. Los `console.log` se eliminan en producción (`esbuild.pure`).
- Estado global con Zustand; no introducir otra librería de estado.
- Los errores de Supabase deben comprobarse (`if (error)`) — hay `try/catch` heredados que se
  comen fallos en silencio (p. ej. en `userStore`); no añadir más.
- Textos de UI y comentarios en español; nombres de código en inglés.
- Commit style del repo: `feat:`, `fix:`, `chore:`, `docs:`.

## Hechos conocidos

- La IA va por `supabase/functions/ai-proxy` (secreto `GROQ_API_KEY`, rate limit por IP en
  `public.ai_rate_limits`). Modelo activo: `openai/gpt-oss-120b`; los Llama 3.x de Groq
  fueron retirados y la app estuvo devolviendo `model_not_found` hasta el cambio.
- El parser de la IA exigía `params` pero el prompt enseña `parameters`: el modelo devolvía
  `parameters` y no se ejecutaba **ningún** paso. Ya acepta ambos (y `args`), y quita el JSON
  crudo de la respuesta.
- Las **láminas** (`public/Laminas_automaticas.html`) guardan su estado en `localStorage`
  (`diedricoProject`) y `LaminasCloudSync` lo replica en `laminas_docs`. Una hoja vacía nunca
  se sube encima de un documento con contenido.
- El **borrador** del lienzo se guarda en `localStorage['diedricoDraft']` y se restaura al abrir
  si el lienzo está vacío (`useDraftAutosave`).
- No hay modelo de visión en la cuenta: `scanImage()` lanza un error explicativo.
- El chat de IA (`AIChatPanel`) es visible: botón flotante. Tiene dos modos (resolver y crear
  ejercicio) y un botón «Revisar mi dibujo» que manda el enunciado + las coordenadas del lienzo
  (`describeScene`) y devuelve una corrección. El generador de las láminas también exige Premium.
- `solveExercise` acepta `{ includeFunctions, includeContext, maxTokens }`. El esquema de
  funciones ocupa miles de tokens: en generar/corregir se omite (antes se tocaba el límite TPM
  del plan gratuito con dos llamadas seguidas).
- Compartir: `src/lib/shareScene.ts` comprime el dibujo (deflate + base64url) en `?e=`. No usa
  base de datos ni cuentas. La biblioteca `/ejercicios` reutiliza el mismo formato para abrir
  cada ejercicio en el editor.
- El modo invitado guarda progreso en `localStorage`; el usuario logueado en `profiles`.
- Auth: Google OAuth + email/contraseña (registro desactivado en el dashboard).
- `site_url` de Auth debe ser la URL de producción; las URLs locales (`localhost:5173`) están
  permitidas en la allow list.
- La clave de Groq **ya no se puede extraer del bundle**: se movió a un secreto de la Edge
  Function `ai-proxy` (ver `AGENTS.md`).
