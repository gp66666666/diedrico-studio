# AGENTS.md — Diédrico Studio

Contexto operativo para agentes/IA que trabajen en este repo. **Sin secretos** (los secretos
están en `.env` y en `~/.config/opencode/env`; ver `ACCESOS_Y_DEPLOY.md`, que no está en git).

## Qué es

App web educativa de geometría 3D y sistema diédrico: visor 3D (Three.js / react-three-fiber),
vista 2D diédrica, herramientas de medida/exportación (jsPDF, JSZip), asistente IA (DeepSeek),
auth y guardado en la nube (Supabase). Producción: **https://diedricostudio.com** (Cloudflare Pages).
El antiguo `diedrico-studio.vercel.app` redirige con 301 al dominio nuevo.

## Stack y comandos

```bash
npm install
npm run dev      # Vite en http://localhost:5173
npm run build    # tsc -b && vite build -> dist/   (debe pasar antes de push)
npm run preview
npm test         # vitest: geometría de sólidos, rotaciones y selección por herramienta
```

- Vite 5 · React 18 · TypeScript 5.5 · Tailwind 3 · Zustand · three 0.163
- Deploy: **Cloudflare Pages**, proyecto `diedrico-studio` (rama `main`).
  - MCP de OpenCode: `cloudflare-pages` (herramientas `cf_deploy`, `cf_add_domain`...).
    Credenciales en `~/.config/opencode/mcp/cloudflare-pages/credentials.env` (600).
  - También se puede desplegar con `npx wrangler pages deploy dist --project-name diedrico-studio`.
  - Vercel sigue vivo solo para el **301** al dominio nuevo (`vercel.json`).
- Node 20+ en Pages.

## Variables de entorno (solo nombres)

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AI_PROVIDER` (default `groq`),
`VITE_ENABLE_AI`. `VITE_GEMINI_API_KEY` está sin uso (legacy).

⚠️ Todo `VITE_*` acaba en el bundle público: **nunca** metas una `service_role`/`sb_secret_`
ni una API key de IA.

⚠️ Las claves de IA **no** están en el cliente: viven como secretos `DEEPSEEK_API_KEY` (principal)
y `GROQ_API_KEY` (respaldo) de la Edge Function `supabase/functions/ai-proxy`. El navegador llama a
`/functions/v1/ai-proxy`. Si DeepSeek devuelve 5xx/429, el proxy reintenta con `gpt-oss-120b`.

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
├── config/support.ts           enlace de donativos + consultas gratis al día (único sitio a tocar)
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

## Precio (2026-10): nada

- **No se vende nada y no hay pasarela de pago.** Todo es gratis: 3D, 2D, láminas,
  Academia (20 temas) y ejercicios. No hay "Premium", ni planes, ni créditos en venta.
- Lo único limitado es el **asistente IA: 3 consultas cada 24 h por cuenta**
  (`FREE_REQUESTS` en `ai-proxy`), porque es lo único que cuesta dinero de verdad
  (~0,1 céntimo por consulta). Al agotarlas: 429 `daily_limit` con un mensaje claro;
  no se abre nada de pago porque no hay nada que comprar.
- **Tope global diario** (`GLOBAL_DAILY_REQUESTS = 2000`): si el asistente se hace
  viral, se cierra solo antes de que la factura se descontrole. Es el seguro.
- `profiles.credits` y sus funciones siguen en la base de datos, dormidas: sirven para
  regalar consultas a un profesor o a un colaborador (`add_credits`), sin cobrar nada.
- Ko-fi queda **solo para donativos** (`config/support.ts`), sin contraprestación: un
  donativo no es una venta (no lleva IVA y no obliga a alta censal). Ya no hay
  suscripción de Ko-fi ni webhook que la active en el flujo normal.
- **Precios decididos** (2026-10): gratis 3 consultas/día (1 sin cuenta); packs 100 → 4,99 €
  y 300 → 11,99 €; plan mensual 14,99 € «ilimitado» con tope de **1.500/mes**
  (`PREMIUM_MONTHLY_LIMIT`, unas 50 al día); Pack Profesor 24,99 €/semestre (40 alumnos ×
  150) y 39,99 €/curso (40 × 300). Los packs de profesor dan **códigos de clase**, no un bote
  compartido: cada alumno canjea una vez y recibe las consultas en su cuenta.
- **Tienda: Paddle** (elegido 2026-10; `lemonsqueezy-webhook` queda en el repo como
  histórico y se puede borrar cuando Paddle esté en live). Paddle es el vendedor: cobra el
  IVA europeo y emite la factura; nosotros solo acreditamos consultas.
  - Catálogo: `node scripts/paddle-catalog.mjs` (idempotente por `custom_data.catalog_key`;
    `PADDLE_ENV=live` para producción). Deja los IDs en `scripts/paddle-catalog-<env>.json`.
  - `supabase/functions/paddle-webhook` (`--no-verify-jwt`): verifica
    `Paddle-Signature: ts=...;h1=...` (HMAC-SHA256 de `ts:cuerpo`, rechaza `ts` de más de
    5 min), atiende `transaction.completed`, `adjustment.created` (devoluciones) y
    `subscription.*`, identifica la cuenta por `custom_data.user_id` → `paddle_customer_id`
    → email, y es idempotente (`add_credits` con `ref=paddle:<txn>`, `class_codes.order_ref`,
    `refund_credits` con `ref=paddle-refund:<adj>`). Guarda cada aviso en `paddle_events`.
  - `supabase/functions/paddle-checkout`: crea la transacción **en el servidor** con el
    `price_id` del catálogo y `custom_data.user_id` sacado del JWT. El navegador solo manda
    la clave del pack; nunca el precio. Devuelve `checkoutUrl` (pago alojado por Paddle).
  - Configuración: secreto `PADDLE_CATALOG` (mapa pack → `price_id` + créditos o `class`),
    `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_ENV=sandbox|live`, y en el frontend
    `VITE_PAYMENTS_ENABLED=true` y `VITE_PADDLE_CLIENT_TOKEN` (público, `test_…` en
    sandbox). Sin ambas la tienda **no aparece**. La URL que devuelve Paddle
    (`?_ptxn=txn_…`) no cobra sola: la abre Paddle.js (`lib/paddlejs.ts`) en
    overlay; `MainApp` también atiende esos enlaces al cargar.
  - Prueba: `node scripts/check-paddle-webhook.mjs` (firma, firma caducada, reintento, pack
    de profesor, suscripción y devolución). Comprobado en sandbox el 2026-10-23.
  - **Asistente en pausa (2026-10-23)**: hasta que Paddle live esté verificado, el chat se
  queda cerrado para no regalar consultas. Doble interruptor: `VITE_AI_ENABLED=false` en
  Vercel (panel con aviso, sin campo de texto) y el secreto `AI_ENABLED=false` en Supabase
  (`ai-proxy` devuelve 503 `assistant_paused` aunque se llame por API). Para reactivarlo hay
  que quitar los dos (Vercel + `supabase secrets set AI_ENABLED=true`).
- **Estado (2026-10-23)**: probado en sandbox de punta a punta con pagos de prueba
    (pack 100/300, mensual, Pack Profesor y devolución total, todo con tarjeta 4242).
    En live ya está creado el catálogo (5 precios activos, IVA incluido), el webhook con su
    secreto y las funciones apuntando a live (`PADDLE_ENV=live`). La tienda está **apagada**
    en producción: `node scripts/paddle-shop.mjs off|on|status` (bandera
    `VITE_PAYMENTS_ENABLED` en Vercel + redespliegue).
  - **Bloqueo actual**: Paddle live responde `Checkouts aren't enabled for this account` →
    falta terminar el *onboarding* en el panel live (datos de empresa/fiscales, verificación,
    payout y aprobación del dominio). Hasta eso, no se puede comprobar un cobro real; por eso
    la bandera sigue en `false`. El sandbox queda inactivo mientras los secretos sean de live.
- **Tienda antigua (histórica)**: Lemon Squeezy.
  `supabase/functions/lemonsqueezy-webhook` verifica `X-Signature` (HMAC-SHA256), atiende
  `order_created`, identifica la cuenta por `meta.custom_data.user_id` y, si no llega, por
  email, y llama a `add_credits` con `ref = ls:<order_id>` (idempotente: un reintento no
  duplica). Secretos: `LEMON_SQUEEZY_SIGNING_SECRET` y `LEMON_VARIANT_CREDITS`
  (`{"<variant_id>": 100}`). **Ahora hay valores de prueba**: hay que sustituirlos por los
  de la tienda real antes de vender.
  En el frontend, `src/config/credits.ts` lee `VITE_LEMON_CHECKOUT_100` / `_300`; si están
  vacías, el modal y el botón de compra **no existen** (nada de prometer lo que no se puede
  cobrar). Packs: 100 consultas 4,99 € y 300 consultas 11,99 €.
  Prueba sin tienda real: `scripts/check-lemon-webhook.mjs` (firma, acreditación única, firma
  falsa y variante desconocida).
- Decisión tomada por el dueño: no darse de alta como autónomo por un proyecto que aún
  no factura; cuando haya tracción se retomará el pago (mejor Lemon Squeezy/Paddle,
  que actúan como vendedor y se encargan del IVA). El hosting ya no es un problema: Cloudflare
  Pages permite uso comercial en el plan gratuito.

## Crear sólidos (2026)

- El panel de creación (`components/tools/SolidsTool.tsx`) da **tres caminos**:
  «1 · Crear y ajustar a mano» (origen, apoyado en el PH, medidas por defecto), «2 · Centro en un
  punto» (coordenadas escritas o clic en un punto del dibujo) y «3 · Por dos puntos (arista)».
  Además sigue el atajo de un clic en el suelo del 3D.
- El tercero vive en `src/lib/solidFromEdge.ts` (con tests): toma una **arista de referencia** de la
  malla local (la de la base, la más paralela a la LT y orientada hacia +X), escala el radio para
  que mida |PQ| y coloca el sólido resolviendo `posición + R·A = P`, `posición + R·B = Q`. El giro
  se saca de un marco con la vertical como pista y se normaliza a los ángulos más pequeños (nada de
  «180 / −180»). En esfera, cilindro y cono los dos puntos son un **diámetro**; el **tetraedro** se
  crea **regular** (altura √2 · radio), porque «tetraedro de arista AB» es el regular.
- Los **colores por proyección** (planta amarilla, alzado cian, solape verde) se encienden en
  *Controles de Vista* de la barra lateral; ya no hay botón flotante en la vista 2D.

## Planos con clics y secciones (2026)
- **Crear punto y recta con el ratón** (misma convención que el plano):
  - `point-click`: cada clic del papel crea un punto. Debajo de la LT → horizontal
    (alejamiento); encima → vertical (cota). Se reutiliza un punto si ya existe en
    esas coordenadas. Entrada: `Añadir → Punto → «O poner puntos en el lienzo»`.
  - `line-click`: dos clics definen la recta (`lineFromTwoClicks`, con tests: dos
    clics en planta dan dirección z = 0, uno en cada plano da recta oblicua). Crea
    los dos puntos extremos y reutiliza los que ya existan.
    Entrada: `Añadir → Recta → «O dibujar la recta con 2 clics»`.
  - Los tres modos cambian solos a la vista 2D si estabas en 3D.
- **Dos entradas para el plano, visibles en `Añadir → Plano`**:
  - **«3 Puntos»**: coordenadas escritas, puntos elegidos del dibujo en cada campo o
    botón **«Haz clic en 3 puntos del dibujo»** (herramienta `plane-3-points`, pide 3
    selecciones y crea el plano al tercero). Al tercer clic el plano se crea solo.
  - **«Dibujar en el lienzo (3 clics)»**: `plane-click`. Dos clics **debajo** de la LT
    definen la traza horizontal α₁; uno **encima** fija α₂ (pasa por el vértice). Lógica
    en `src/lib/planeFromClicks.ts` (con tests).
- ⚠️ `ParallelismTool` filtraba por prefijos `plane-`/`line-`; eso capturaba
  `plane-3-points` y `line-solid` y **reseteaba la herramienta al segundo clic** (el plano
  por 3 puntos nunca se creaba). Ahora la lista vive en `src/lib/parallelismTools.ts`
  (`isParallelismTool`) con test de regresión: si añades una herramienta nueva, **no**
  la metas por prefijo.
- `solid-section`: sólido + plano → polígono `polygon` en el dibujo y panel con la VM (abatimiento), área y perímetro. La sección es válida para **todos** los sólidos (son convexos): `src/lib/section.ts`, tests en `__tests__/section.test.ts` (los 10 subtipos + esfera + cono).
- `solid-development`: desarrollo (red) del sólido completo: cubo, prisma hexagonal, pirámide, tetraedro, cilindro, cono, y octaedro/dodecaedro/icosaedro. Los tres regulares se despliegan abatiendo la malla cara a cara en `src/lib/unfold.ts` (BFS desde una cara, cada vecina se abate al otro lado de la arista; se prueba cada cara como raíz hasta dar con una red sin solapes, comprobado con SAT). `src/lib/development.ts` + `components/tools/DevelopmentTool.tsx`. La esfera no es desarrollable (se avisa en el panel).
- `line-solid`: puntos de entrada/salida de una recta o segmento en un sólido convexo. `src/lib/lineSolid.ts` recorta el intervalo de parámetro con los semiplanos de las caras; si el extremo cae en el borde del segmento no cuenta como penetración (un segmento que acaba dentro solo tiene entrada). Tests: cubo ±1.5, tangente por vértice (1 punto), recta contenida en una arista, esfera 2r, cilindro.
- `sphere-tangent`: planos tangentes en `src/lib/tangency.ts` para **esfera, cono y cilindro**: en un punto de la superficie (en el cono el plano contiene la generatriz; en el cilindro, la generatriz perpendicular al radio), por una recta exterior (esfera: hasta 2 con |n·(C−P)_⊥| = r; cilindro: el plano debe contener una generatriz; cono: el plano pasa por el vértice y la condición es |n_z| = tanα·|n_xy|) y los dos de apoyo paralelos a un plano (función soporte del sólido). Todo se calcula en el sistema local del sólido y se lleva al store con `inverseRotateStorePoint`, así que el giro del sólido se respeta.
- `cast-shadow`: sombra arrojada sobre un plano cualquiera o sobre otro sólido, en `src/lib/castShadow.ts`. Sobre un plano: se proyectan los vértices que quedan del lado de la luz y, si el plano corta al cuerpo, los puntos en que sus aristas lo atraviesan (esos puntos son su propia sombra) → contorno convexo. Sobre otro sólido: se proyecta A sobre el plano de cada cara de B que mira a la luz y se recorta con la cara (Sutherland–Hodgman); la unión se guarda como elemento `mesh` con el contorno en `seam` (aristas que aparecen una sola vez) para que en 2D salga solo la silueta.
- `shadows`: sombras de sólidos, puntos y segmentos en `src/lib/shadows.ts`. Foco propio = elemento `point` (se exige t ≥ 1: el objeto entre la luz y el plano); foco impropio = recta/segmento, dirección hacia abajo. La sombra de un sólido convexo es el **contorno convexo** de las sombras de sus vértices (proyección de un convexo es convexa), recortado al semiplano del plano (y ≥ 0 en el PH, z ≥ 0 en el PV). Los elementos llevan `role: 'shadow-h' | 'shadow-v'` y los renders 2D (Polygon2D/Segment2D/Point2D) dibujan solo la proyección que toca.
- Desarrollo del **cuerpo truncado**: en el panel de sección, `buildTruncatedDevelopment` despliega las caras recortadas + base + tapa (VM). Prismas/cubo/cilindro por alturas de arista; pirámide/tetraedro/cono por baricéntricas de cada cara. Tests con áreas exactas (tronco de pirámide a media altura = 28 u²).
- `solid-intersection`: A ∩ B en `src/lib/solidIntersection.ts` (recorte de A por cada plano de B, tapando cada corte; caras etiquetadas `a`/`b`). La línea de intersección son las aristas entre una cara `a` y una `b`. Elemento `mesh` (vértices + caras + seam), render en `3D/MeshObject` y `2D/Mesh2D`. Tests: volúmenes exactos (3, 9, 27, cilindro), malla cerrada y vértices dentro de ambos sólidos.
- La cobertura del temario PAU/EBAU está en la guía (`GuidePage`, sección 16).
- `solid-section`: sólido + plano. Corta la malla por el plano (`src/lib/section.ts`, con tests), añade un elemento `polygon` (render en `2D/Polygon2D.tsx` y `3D/PolygonObject.tsx`) y muestra la **verdadera magnitud** de la sección con área y perímetro (`SectionTool.tsx`).
- El elemento `polygon` entra en `GeometryElement`; si añades un tipo nuevo, recuerda los switches de `Scene.tsx` y `DiedricoView.tsx`.
- `isPremium` del `userStore` es derivado: `is_premium && (!premium_until || premium_until > now)`.
- **No existe vista caballera.** Hubo un prototipo (`features/caballera`) que nunca se conectó a
  la interfaz; se eliminó. Si se retoma, hay que crearlo de verdad (proyección caballera +
  herramientas), no reactivar la pestaña.
- El panel de IA lo ve todo el mundo. Sin cuenta: **1 consulta de prueba por IP** (`ANON_*`).
  Con cuenta gratis: **3 consultas cada 24 h**
  (las cuenta el proxy, no el cliente) y al agotarlas responde 429 `daily_limit`; no se abre
  ningún modal de compra porque no hay nada que comprar. Se cierra el asistente con
  `FREE_REQUESTS = 0` (constantes al principio de `ai-proxy`).
- **Créditos prepago** (`profiles.credits` + `credit_movements`): hoy están dormidos (no se
  venden); sirven para regalar consultas. El orden es gratis → saldo (se gasta primero lo gratis).
  `spend_credit` es atómico (`update ... where credits > 0`) y el trigger
  `protect_profile_privileges` restaura `credits` si el cliente intenta cambiarlo. Si el
  proveedor falla, el proxy devuelve el crédito y la consulta de prueba.
- **Techo de gasto por mensaje** (lo que hace segura la prueba gratuita): la consulta no puede
  pasar de 24.000 caracteres (413) y la respuesta se corta a 1.000 tokens sin Premium y 2.500
  con Premium. Con `deepseek-flash` en hora punta y sin caché, el mensaje más caro posible
  cuesta ~0,0033 $, así que los 3 de prueba nunca llegan a 1 céntimo.
- El proxy exige JWT de una cuenta válida y comprueba el plan: 401 sin sesión, 402 sin Premium,
  sin prueba ni saldo. Además: 60/h por IP, 120/día por cuenta. Devuelve `X-AI-Credits` y
  `X-AI-Trial-Left` (CORS los expone) y el panel sincroniza el saldo con esa cabecera.
- Activación automática: `supabase/functions/kofi-webhook` recibe los pagos de Ko-fi y suma 1 mes
  a `premium_until` por pago (idempotente por `message_id`). Requiere el secret
  `KOFI_VERIFICATION_TOKEN` con el token de Ko-fi.
- Activación manual (respaldo): `./scripts/premium.sh correo on [meses]`.

## Coherencia 3D ↔ 2D

- Los sólidos se construyen en `src/lib/solidGeometry.ts`. 3D (`SolidObject`) y 2D (`Solid2D`) usan
  la MISMA malla. Prohibido duplicar geometría en un componente: si algo no coincide, el fallo está
  en la rotación (convención `Rx·Rz·Ry`, igual que Three con `rotation=[rx,rz,ry]`) o en las unidades.
- Si un paso de la IA crea un punto con un nombre que ya existe y otras coordenadas, el executor
  lo renombra (A2) y traduce los pasos siguientes (`resetNameAliases`). Sin eso, una recta nueva
  se enganchaba a un punto antiguo del mismo nombre.
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

## Contraste (2026-10)

Todo texto visible debe llegar a **4.5:1** (3:1 si es grande o está deshabilitado). Nada de
reglas `!important` que pinten "todo de un color": rompen los botones y esconden el texto.

- `src/academy-dark-theme.css` es el **único** sitio donde se traduce la paleta clara del
  contenido de teoría (`bg-white`, `text-slate-900`...) al modo oscuro. `index.css` no toca
  colores de la Academia.
- En las páginas de fondo fijo (`/ejercicios`, `/guia`, `/temario`, `/para-profesores`...) el
  mínimo para texto secundario es `text-slate-400`. `text-slate-500` sobre `#070d18` da 4.09:1
  y no vale.
- En la Academia (que sí cambia de tema), los grises secundarios son `text-slate-300` en oscuro
  y `text-slate-600` en claro.
- Auditoría reproducible (Playwright, mide el color renderizado contra el fondo efectivo,
  incluidos fondos translúcidos y degradados): `python3 /tmp/opencode/contrast_audit.py` con
  `npm run build` servido en `http://localhost:4190`. Debe terminar en **0 fallos**, igual que
  `contrast_audit_app.py` (paneles, herramientas y chat).

## SEO (2026-10)

Es una SPA, así que sin un paso extra **todas las URLs devuelven el mismo HTML**: el título y la
descripción de la portada. Eso rompe los enlaces compartidos (WhatsApp, Telegram, LinkedIn) y lo
que ven los rastreadores que no ejecutan JavaScript (los de IA, por ejemplo).

- `scripts/seo.mjs` corre al final de `npm run build` y escribe en `dist/` un `index.html` por
  ruta: metadatos propios, canonical, Open Graph, JSON-LD (LearningResource + BreadcrumbList en
  los ejercicios, ItemList en la lista) y contenido legible dentro de `#root`. React lo sustituye
  al arrancar; si el JS no llega, queda una página decente.
- **Fuente única de metadatos**: `src/data/site.ts` (`PAGE_META`). Las páginas hacen
  `<SEO {...pageSeo(PAGE_META.about)} />`; el generador lee lo mismo. Si cambias un título, cambia
  en los dos sitios a la vez (hay tests de longitud y de rutas en `src/data/__tests__/site.test.ts`).
- Los ejercicios no se listan a mano: salen de `src/data/exercises.ts`. **Añadir un ejercicio =
  añadirlo al array**; el HTML, el sitemap y los enlaces relacionados se generan solos.
- Cada bloque del temario tiene su página en `/temario/<slug>` (`src/data/topics.ts`). Un test
  obliga a que haya exactamente una por cada `topic` de los ejercicios: si añades un tema nuevo,
  añade su página o el test falla.
- `dist/sitemap.xml` se genera desde la misma lista (ya no hay `public/sitemap.xml`).
- **La Academia tiene una URL por tema** (`/academia/<slug>`, 20 páginas). El HTML estático
  sale de `src/data/academyPages.json`, que se regenera con
  `python3 scripts/academy-pages.py` (con `dist` servido en `localhost:4190`) cuando cambie
  la teoría. El mapa id→slug vive en `src/data/academySlugs.ts` y no se toca a la ligera:
  cambiar un slug rompe enlaces ya indexados.
- `scripts/indexnow.mjs` avisa a Bing (IndexNow) de las 50 URLs después de cada despliegue;
  el workflow lo ejecuta. La clave está en `public/<clave>.txt`.
- **Tarjetas Open Graph**: una por ejercicio y por página principal en `public/og/`
  (1200×630 PNG), asignadas en `ogImageForPath()` (`src/data/site.ts`). Se regeneran con
  `python3 scripts/og-images.py` (Playwright) cuando cambie un título; los PNG se commitean y
  el build no los toca. Un test comprueba que no falte ninguna.
- `vercel.json` usa `rewrites` explícitos: cada ruta conocida sirve su HTML y lo desconocido da
  **404 de verdad** (`dist/404.html`, con `noindex`), no un 200 con la app dentro.
- **Cloudflare Pages**: si solo existe `<ruta>/index.html`, Pages redirige `/ruta` a `/ruta/` con
  un 308. Para conservar las URLs sin barra del sitemap, `scripts/seo.mjs` escribe además
  `<ruta>.html`. No quitar esa línea.
- El dominio (`diedricostudio.com`) está en Cloudflare; el apex y `www` son CNAME al proyecto
  Pages. El canonical siempre es el apex.
- `/clase` y el 404 llevan `noindex`. El resto, `index, follow`.
- El service worker no precachea los HTML por ruta (`globIgnores` en `vite.config.ts`): son para
  los rastreadores y para la primera visita; el usuario que vuelve navega con el shell cacheado.

Comprobar tras desplegar:

```bash
curl -s https://diedricostudio.com/academia/abatimientos | grep '<title>'
curl -s -o /dev/null -w '%{http_code}\n' https://diedricostudio.com/ejercicios/no-existe   # 404
```

## Hechos conocidos

- La IA va por `supabase/functions/ai-proxy` (secretos `DEEPSEEK_API_KEY` y `GROQ_API_KEY`,
  rate limit por IP en `public.ai_rate_limits`). Modelo activo: **`deepseek-flash`**
  (`AI_PROXY_MODEL` en `aiProxy.ts`); `MODELS` en el proxy decide qué proveedor sirve cada
  modelo. El razonamiento de DeepSeek va **apagado** (`thinking: {type:"disabled"}`): se factura
  como salida y se comía `max_tokens` (la respuesta llegaba vacía).
- **Contrato de herramientas** (`__tests__/tools.test.ts`): toda herramienta que menciona el
  prompt existe en `FUNCTION_DEFINITIONS` y toda herramienta declarada está implementada en
  `executor.ts` o `aiAdvancedTools.ts`. Esto pilló tres bugs reales: `add_line_by_direction` y
  `add_plane_by_points` (inventadas), `calculate_distance` (no existe: es `calculate_math`) y
  `draw_arc` (declarada sin implementación).
- **Un paso que no se puede aplicar ya no se salta en silencio**: el executor lanza error y el
  panel marca el paso en rojo (antes solo había un `console.warn` y el alumno veía un dibujo a
  medias). Además, un punto o una recta idénticos a uno existente se reutilizan (alias) en vez
  de duplicarse: un "punto nuevo" en el mismo sitio con otra etiqueta engaña.
- **Codificación de planos en el prompt**: `add_plane_by_traces` admite cortes 0 (plano paralelo
  a un eje) pero nunca inventados; un plano por ecuación se crea con `add_plane_by_normal`
  (`ax+by+cz+d=0` → normal `(a,b,c)`, constante `d`). Los planos de proyección no existen como
  elemento: si el ejercicio los necesita, se crean antes.
- **Límites conocidos del dibujo de la IA** (probados con los 11 ejercicios de la biblioteca):
  no hay herramienta de cambio de plano ni de arcos; el abatimiento se dibuja poniendo el punto
  abatido (`add_point`), no girando. En "ángulo entre planos" y en la traza horizontal de un
  plano oblicuo el método intermedio puede quedar impreciso aunque el resultado sea correcto;
  el prompt prohíbe afirmar medidas que no estén dibujadas.
- El parser de la IA exigía `params` pero el prompt enseña `parameters`: el modelo devolvía
  `parameters` y no se ejecutaba **ningún** paso. Ya acepta ambos (y `args`), y quita el JSON
  crudo de la respuesta.
- Las **láminas** (`public/Laminas_automaticas.html`) guardan su estado en `localStorage`
  (`diedricoProject`) y `LaminasCloudSync` lo replica en `laminas_docs`. Una hoja vacía nunca
  se sube encima de un documento con contenido.
- El **borrador** del lienzo se guarda en `localStorage['diedricoDraft']` y se restaura al abrir
  si el lienzo está vacío (`useDraftAutosave`).
- **Abatimiento** (Control de Vista «Abatir Plano Horizontal»): un único reloj en
  `src/lib/flattenAnimation.ts` (1150 ms, `easeInOutCubic`) mueve todos los objetos a la vez;
  antes cada uno hacía `lerp(..., delta*4)` por su cuenta y nunca coincidían. Giran el plano
  horizontal y la cuadrícula con la línea de tierra como bisagra, las proyecciones viajan por
  un arco con punto guía y la LT se ilumina. Los objetos 3D se retiran en la segunda mitad
  (`smoothstep(0.35,1,p)`), no al principio. Al terminar, P′ queda **por debajo de la LT**:
  es la explicación de por qué el dibujo en papel se hace así. En dev, `window.__flattenDuration`
  ralentiza la animación para revisarla.
- **Códigos de clase** (`class_codes` + `class_code_uses` + RPC `redeem_class_code`): el webhook
  los crea al comprar el pack del profesor (idempotente por `order_ref`), el alumno los canjea en
  `/clase` y el profesor ve sus códigos, usos y caducidad ahí mismo. Nadie escribe en las tablas
  desde el navegador. Prueba: `scripts/check-class-codes.mjs`.
- **`add_credits` se pone a sí misma en contexto `service_role`** mientras toca el saldo: si la
  llama una función ejecutada por un alumno (`redeem_class_code`), el trigger
  `protect_profile_privileges` revertía el saldo y la RPC decía «ok» sin acreditar nada. Lo pilló
  `check-class-codes.mjs` (saldo 0 tras un canje correcto).
- Los **planos en 3D** se pintan por defecto como superficie traslúcida continua (`planeStyle:
  'solid'` en el store, persistido en `localStorage['planeStyle']`); la fila "Planos: Relleno /
  Malla" dentro de Controles de Vista alterna a malla (`'mesh'`). Surgió de un comentario de un profesor: la malla
  "parece un enrejado" y la superficie continua es lo que se ve en el libro.
- No hay modelo de visión en la cuenta: `scanImage()` lanza un error explicativo.
- El prompt del asistente (`SYSTEM_PROMPT`) exige **método de Dibujo Técnico**: proyecciones,
  trazas, plano proyectante auxiliar, abatimiento/giro. Prohibido resolver con ecuaciones,
  vectores o `calculate_math`. Los `step_description` se escriben como en un libro de clase.
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
- Las claves de IA **no se pueden extraer del bundle**: están en los secretos de la Edge
  Function `ai-proxy` (ver `AGENTS.md`).
