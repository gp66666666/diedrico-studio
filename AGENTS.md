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
```

- Vite 5 · React 18 · TypeScript 5.5 · Tailwind 3 · Zustand · three 0.163
- Deploy: **push a `main` → Vercel automático** (proyecto `diedrico-studio`).
- Node 24.x en Vercel.

## Variables de entorno (solo nombres)

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GROQ_API_KEY`,
`VITE_AI_PROVIDER` (default `groq`), `VITE_ENABLE_AI`, `VITE_GEMINI_API_KEY` (sin uso).

⚠️ Todo `VITE_*` acaba en el bundle público: **nunca** metas una `service_role`/`sb_secret_`.

## Estructura

```
src/
├── App.tsx / MainApp.tsx        raíz de rutas y layout
├── pages/                      Academy, About, Contact, Privacy, Terms
├── components/                 Sidebar, Scene (3D), DiedricoView (2D), ChatInterface...
│   ├── 2D/  3D/  tools/        renderizado y herramientas geométricas
├── features/ai-assistant/      servicios Groq/Gemini + store + prompts
├── store/geometryStore.ts      elementos 3D + CRUD de proyectos en Supabase
├── store/userStore.ts          sesión, perfil, progreso (temas/ejercicios)
├── lib/supabase.ts             cliente Supabase
├── lib/database.types.ts       tipos generados desde la DB (no editar a mano)
├── config/features.ts          feature flags y claves IA
└── utils/                      matemáticas, distancias, etiquetas
```

## Base de datos (Supabase)

Proyecto `zrfmltqfunizhudkekdc` (`eu-west-1`, Postgres 17). Solo dos tablas en `public`:

- `projects(id, user_id, title, description, thumbnail_url, data jsonb, created_at, updated_at)`
  — `data = { elements, sketchElements }`. RLS por `auth.uid() = user_id`.
- `profiles(id, email, full_name, avatar_url, is_premium, role, completed_topics text[],
  completed_exercises text[], created_at)` — RLS por `auth.uid() = id`; un trigger protege
  `is_premium`/`role`/`email` para que el cliente no pueda escalar privilegios.

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
- Estado global con Zustand; no introducir otra librería de estado.
- Los errores de Supabase deben comprobarse (`if (error)`) — hay `try/catch` heredados que se
  comen fallos en silencio (p. ej. en `userStore`); no añadir más.
- Textos de UI y comentarios en español; nombres de código en inglés.
- Commit style del repo: `feat:`, `fix:`, `chore:`, `docs:`.

## Hechos conocidos

- El modo invitado guarda progreso en `localStorage`; el usuario logueado en `profiles`.
- Auth: Google OAuth + email/contraseña (registro desactivado en el dashboard).
- `site_url` de Auth debe ser la URL de producción; las URLs locales (`localhost:5173`) están
  permitidas en la allow list.
- La clave de Groq es pública por diseño (se extrae del bundle); no es un incidente abierto.
