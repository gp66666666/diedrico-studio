#!/usr/bin/env node
/**
 * SEO en el build: escribe un HTML por ruta y el sitemap.
 *
 * Por qué: esto es una SPA. Sin este paso, TODAS las URLs devuelven el mismo
 * HTML (el título y la descripción de la portada), y quien comparte un
 * ejercicio por WhatsApp o lo abre Google sin ejecutar JavaScript ve la
 * portada. Aquí se genera, para cada ruta:
 *
 *   - título, descripción, canonical, Open Graph y Twitter propios
 *   - datos estructurados (LearningResource en los ejercicios)
 *   - contenido legible dentro de #root (React lo sustituye al arrancar)
 *   - un enlace modulepreload al chunk de la página, para que el cambio sea
 *     inmediato y no se vea un parpadeo
 *
 * Además genera dist/sitemap.xml (para que no se quede desfasado) y
 * dist/404.html (404 de verdad, no un 200 con la app dentro).
 *
 * Uso: node scripts/seo.mjs   (lo llama `npm run build`)
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EXERCISES } from '../src/data/exercises.ts';
import { CONTACT_EMAIL, PAGE_META, SITE_URL, SITE_NAME, exerciseDescription, exercisePageTitle } from '../src/data/site.ts';

const DIST = path.resolve('dist');
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const abs = (route) => `${SITE_URL}${route}`;

/** Sustituye una etiqueta y falla si la plantilla cambió (mejor romper el build que publicar metadatos viejos). */
function replaceOnce(html, pattern, replacement, label) {
    const found = typeof pattern === 'string' ? html.includes(pattern) : pattern.test(html);
    if (!found) throw new Error(`[seo] no encuentro ${label} en dist/index.html`);
    return html.replace(pattern, replacement);
}

const STYLE = `
html{background:#070d18}
#seo-fallback{box-sizing:border-box;max-width:760px;margin:0 auto;padding:36px 20px 56px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#cbd5e1;background:#070d18;min-height:100vh;line-height:1.65}
#seo-fallback *{box-sizing:border-box}
#seo-fallback h1{color:#fff;font-size:clamp(1.7rem,4vw,2.3rem);line-height:1.2;margin:0 0 .7rem}
#seo-fallback h2{color:#fff;font-size:1.12rem;margin:1.7rem 0 .5rem}
#seo-fallback h3{color:#e2e8f0;font-size:.98rem;margin:1.1rem 0 .3rem}
#seo-fallback p{margin:.7rem 0}
#seo-fallback a{color:#60a5fa;text-decoration:none}
#seo-fallback a:hover{text-decoration:underline}
#seo-fallback .crumbs{font-size:.8rem;color:#94a3b8;margin-bottom:1.2rem}
#seo-fallback .tag{display:inline-block;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;border:1px solid #1e3a5f;border-radius:999px;padding:.12rem .55rem;margin:0 .4rem .4rem 0;color:#93c5fd}
#seo-fallback ol,#seo-fallback ul{padding-left:1.4rem;margin:.6rem 0}
#seo-fallback ol{list-style:decimal}
#seo-fallback ul{list-style:disc}
#seo-fallback li{margin:.45rem 0}
#seo-fallback .note{border-left:3px solid #2563eb;background:#0b1626;border-radius:8px;padding:.7rem 1rem;margin:1rem 0}
#seo-fallback .ok{border-left-color:#10b981;background:#08211a}
#seo-fallback .warn{border-left-color:#f59e0b;background:#221703}
#seo-fallback .cta{display:inline-block;margin:1.2rem .6rem 0 0;background:#2563eb;color:#fff;padding:.7rem 1.1rem;border-radius:10px;font-weight:600}
#seo-fallback .ghost{display:inline-block;margin:1.2rem .6rem 0 0;border:1px solid #1e3a5f;color:#cbd5e1;padding:.7rem 1.1rem;border-radius:10px;font-weight:600}
#seo-fallback.splash{display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
@media (min-width:640px){#seo-fallback.splash{min-height:100vh;padding-top:0;padding-bottom:0}}
`;

/** Busca el chunk de una página para precargarlo (`assets/ExercisesPage-xxxx.js`). */
async function findChunk(componentName) {
    const files = await readdir(path.join(DIST, 'assets'));
    const found = files.find((f) => f.startsWith(`${componentName}-`) && f.endsWith('.js'));
    return found ? `/assets/${found}` : null;
}

function jsonLd(data) {
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function crumb(items) {
    return jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: abs(item.route),
        })),
    });
}

function crumbsHtml(items) {
    return `<p class="crumbs">${items
        .map((item) => `<a href="${esc(item.route)}">${esc(item.name)}</a>`)
        .join(' › ')}</p>`;
}

/* ------------------------------------------------------------------ */
/* Contenido estático de cada ruta                                     */
/* ------------------------------------------------------------------ */

function homeContent() {
    return `<div id="seo-fallback" class="splash">
<h1>Diédrico Studio</h1>
<p>Sistema diédrico interactivo: dibuja en 3D y mira el alzado y la planta al instante.</p>
<p><a href="/ejercicios">Ejercicios resueltos</a> · <a href="/guia">Guía de la herramienta</a> · <a href="/academy">Academia</a></p>
</div>`;
}

function exercisesListContent() {
    const items = EXERCISES.map(
        (e) => `<li><a href="/ejercicios/${esc(e.slug)}"><b>${esc(e.title)}</b></a> — ${esc(e.topic)} · ${esc(e.level)}<br><span>${esc(e.statement)}</span></li>`
    ).join('\n');

    return `<div id="seo-fallback">
${crumbsHtml([{ name: 'Inicio', route: '/' }, { name: 'Ejercicios resueltos', route: '/ejercicios' }])}
<h1>Ejercicios resueltos de sistema diédrico</h1>
<p>Ejercicios del temario de Dibujo Técnico (Bachillerato y PAU/EBAU) con los pasos y el dibujo ya montado. Cada uno se abre en el editor 3D para girarlo, medirlo y comprobar la solución.</p>
<h2>Lista de ejercicios</h2>
<ul>
${items}
</ul>
<p><a class="cta" href="/">Abrir Diédrico Studio</a><a class="ghost" href="/guia">Ver la guía</a></p>
</div>`;
}

function exerciseContent(exercise) {
    const related = EXERCISES.filter((e) => e.topic === exercise.topic && e.slug !== exercise.slug).slice(0, 4);
    const relatedHtml = related.length
        ? `<h2>Más ejercicios de ${esc(exercise.topic.toLowerCase())}</h2><ul>${related
              .map((e) => `<li><a href="/ejercicios/${esc(e.slug)}">${esc(e.title)}</a> (${esc(e.level)})</li>`)
              .join('')}</ul>`
        : '';

    return `<div id="seo-fallback">
${crumbsHtml([
        { name: 'Inicio', route: '/' },
        { name: 'Ejercicios resueltos', route: '/ejercicios' },
        { name: exercise.title, route: `/ejercicios/${exercise.slug}` },
    ])}
<p><span class="tag">${esc(exercise.level)}</span><span class="tag">${esc(exercise.topic)}</span></p>
<h1>${esc(exercise.title)}</h1>
<p class="note"><b>Enunciado.</b> ${esc(exercise.statement)}</p>
<h2>Resolución paso a paso</h2>
<ol>${exercise.steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
${exercise.result ? `<h2>Resultado</h2><p class="note ok">${esc(exercise.result)}</p>` : ''}
${exercise.tip ? `<h2>Consejo</h2><p class="note warn">${esc(exercise.tip)}</p>` : ''}
<p><a class="cta" href="/">Abrir Diédrico Studio</a><a class="ghost" href="/ejercicios">Todos los ejercicios</a></p>
${relatedHtml}
</div>`;
}

function guideContent(sections) {
    return `<div id="seo-fallback">
${crumbsHtml([{ name: 'Inicio', route: '/' }, { name: 'Guía', route: '/guia' }])}
<h1>Guía de Diédrico Studio</h1>
<p>Todo lo que puedes hacer en la aplicación, explicado por partes: crear puntos, rectas, planos y sólidos, leer el alzado y la planta, medir distancias, abatir, girar, exportar e imprimir láminas.</p>
<h2>Índice</h2>
<ol>${sections
        .map((s) => `<li><a href="/guia#${esc(s.id)}">${esc(s.number)}. ${esc(s.title)}</a></li>`)
        .join('')}</ol>
<h2>Contenido</h2>
<p class="note">La guía completa, con capturas reales de cada herramienta, se ve dentro de la aplicación.</p>
${sections.map((s) => `<h3 id="${esc(s.id)}">${esc(s.number)}. ${esc(s.title)}</h3>`).join('\n')}
<p><a class="cta" href="/">Abrir Diédrico Studio</a></p>
</div>`;
}

function academyContent() {
    return `<div id="seo-fallback">
${crumbsHtml([{ name: 'Inicio', route: '/' }, { name: 'Academia', route: '/academy' }])}
<h1>Academia de dibujo técnico</h1>
<p>Teoría de sistema diédrico ordenada por temas, con ejercicios guiados paso a paso. Puedes leerla entera y, cuando quieras, abrir el ejercicio en el editor 3D para girarlo y comprobar la solución.</p>
<p><a class="cta" href="/">Abrir Diédrico Studio</a><a class="ghost" href="/ejercicios">Ejercicios resueltos</a></p>
</div>`;
}


function aboutContent() {
    return `<div id="seo-fallback">
${crumbsHtml([{ name: 'Inicio', route: '/' }, { name: 'Quiénes somos', route: '/about' }])}
<h1>Quiénes somos</h1>
<p>Diédrico Studio es una herramienta educativa para aprender sistema diédrico: se dibuja en 3D y las proyecciones (alzado, planta y perfil) se actualizan al instante. La idea es que los conceptos espaciales se vean, no que se memoricen.</p>
<p>La herramienta incluye sólidos y secciones, abatimientos, giros, cambios de plano, ejercicios resueltos, láminas para imprimir y una Academia con la teoría del temario de Dibujo Técnico.</p>
<h2>Para quién es</h2>
<ul>
<li>Estudiantes de Bachillerato que preparan la PAU/EBAU.</li>
<li>Estudiantes de ingeniería y arquitectura.</li>
<li>Profesores que quieren explicar el diédrico con un modelo que se pueda girar en clase.</li>
</ul>
<p><a class="cta" href="/">Abrir Diédrico Studio</a><a class="ghost" href="/guia">Ver la guía</a></p>
</div>`;
}

function contactContent() {
    return `<div id="seo-fallback">
${crumbsHtml([{ name: 'Inicio', route: '/' }, { name: 'Contacto', route: '/contact' }])}
<h1>Contacto</h1>
<p>Para dudas, sugerencias o problemas con la herramienta hay un formulario en la aplicación. Respondemos al correo que dejes ahí.</p>
<p>También puedes escribir directamente a <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
<p><a class="cta" href="/contact">Ir al formulario</a><a class="ghost" href="/guia">Ver la guía</a></p>
</div>`;
}

function privacyContent() {
    return `<div id="seo-fallback">
${crumbsHtml([{ name: 'Inicio', route: '/' }, { name: 'Privacidad', route: '/privacy' }])}
<h1>Política de privacidad</h1>
<p>Diédrico Studio solo guarda lo necesario para que la herramienta funcione: el correo de tu cuenta, los dibujos que decides guardar en la nube y el registro de las consultas que consumes. No se venden datos a terceros.</p>
<h2>Qué se explica en la política</h2>
<ul>
<li>Qué datos se recogen y para qué se usan.</li>
<li>Qué se envía al asistente de IA cuando lo usas.</li>
<li>Cómo funcionan los pagos (los procesa Paddle).</li>
<li>Con quién se comparten datos y durante cuánto tiempo se guardan.</li>
<li>Cómo ejercer tus derechos de acceso, rectificación y borrado.</li>
</ul>
<p>El texto completo está en la página de privacidad: <a href="/privacy">leer la política de privacidad</a>.</p>
<p><a class="ghost" href="/">Volver a Diédrico Studio</a></p>
</div>`;
}

function termsContent() {
    return `<div id="seo-fallback">
${crumbsHtml([{ name: 'Inicio', route: '/' }, { name: 'Términos', route: '/terms' }])}
<h1>Términos de uso</h1>
<p>Al usar Diédrico Studio aceptas estas condiciones: la herramienta es educativa, el material y los ejercicios son de sus autores y las compras de consultas se rigen por lo que se explica en la propia página.</p>
<h2>Qué se explica en los términos</h2>
<ul>
<li>Descripción del servicio y uso aceptable.</li>
<li>Cuentas de usuario y propiedad intelectual.</li>
<li>Publicidad y compras de consultas (con su política de reembolsos).</li>
<li>Límites de responsabilidad y ley aplicable.</li>
</ul>
<p>El texto completo está en la página de términos: <a href="/terms">leer los términos de uso</a>.</p>
<p><a class="ghost" href="/">Volver a Diédrico Studio</a></p>
</div>`;
}

/* ------------------------------------------------------------------ */
/* Páginas                                                             */
/* ------------------------------------------------------------------ */

/** Lee el índice de la guía del propio fuente, para que no se desfase nunca. */
async function guideSections() {
    const source = await readFile(path.resolve('src/pages/GuidePage.tsx'), 'utf8');
    return [...source.matchAll(/id="([a-z0-9-]+)"\s+number="([0-9]+)"\s+title="([^"]+)"/g)].map((m) => ({
        id: m[1],
        number: m[2],
        title: m[3],
    }));
}

const PAGES = [
    {
        route: '/',
        meta: PAGE_META.home,
        content: homeContent,
        chunk: null,
        extra: '',
    },
    {
        route: '/ejercicios',
        meta: PAGE_META.exercises,
        content: exercisesListContent,
        chunk: 'ExercisesPage',
        extra: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Ejercicios resueltos de sistema diédrico',
            numberOfItems: EXERCISES.length,
            itemListElement: EXERCISES.map((e, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: e.title,
                url: abs(`/ejercicios/${e.slug}`),
            })),
        }),
    },
    {
        route: '/guia',
        meta: PAGE_META.guide,
        content: async () => guideContent(await guideSections()),
        chunk: 'GuidePage',
        extra: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: PAGE_META.guide.title,
            description: PAGE_META.guide.description,
            url: abs('/guia'),
            inLanguage: 'es',
            isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
        }),
    },
    {
        route: '/academy',
        meta: PAGE_META.academy,
        content: academyContent,
        chunk: 'AcademyPage',
        extra: '',
    },
    {
        route: '/about',
        meta: PAGE_META.about,
        content: aboutContent,
        chunk: 'AboutPage',
        extra: '',
    },
    {
        route: '/contact',
        meta: PAGE_META.contact,
        content: contactContent,
        chunk: 'ContactPage',
        extra: '',
    },
    {
        route: '/privacy',
        meta: PAGE_META.privacy,
        content: privacyContent,
        chunk: 'PrivacyPage',
        extra: '',
    },
    {
        route: '/terms',
        meta: PAGE_META.terms,
        content: termsContent,
        chunk: 'TermsPage',
        extra: '',
    },
    {
        route: '/clase',
        meta: PAGE_META.classroom,
        content: null,
        chunk: 'ClassPage',
        extra: '',
    },
];

for (const exercise of EXERCISES) {
    PAGES.push({
        route: `/ejercicios/${exercise.slug}`,
        meta: {
            path: `/ejercicios/${exercise.slug}`,
            title: exercisePageTitle(exercise.title),
            description: exerciseDescription(exercise.statement),
            keywords: `${exercise.title}, ${exercise.topic}, sistema diédrico, ejercicio resuelto, dibujo técnico`,
        },
        content: () => exerciseContent(exercise),
        chunk: 'ExerciseDetailPage',
        type: 'article',
        extra:
            jsonLd({
                '@context': 'https://schema.org',
                '@type': 'LearningResource',
                name: exercise.title,
                description: exercise.statement,
                url: abs(`/ejercicios/${exercise.slug}`),
                inLanguage: 'es',
                learningResourceType: 'Ejercicio resuelto',
                educationalLevel: exercise.level,
                about: exercise.topic,
                isPartOf: {
                    '@type': 'CollectionPage',
                    name: 'Ejercicios resueltos de sistema diédrico',
                    url: abs('/ejercicios'),
                },
                author: { '@type': 'Person', name: 'Eloi García' },
                publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
            }) +
            crumb([
                { name: 'Inicio', route: '/' },
                { name: 'Ejercicios resueltos', route: '/ejercicios' },
                { name: exercise.title, route: `/ejercicios/${exercise.slug}` },
            ]),
    });
}

/* ------------------------------------------------------------------ */
/* Generación                                                          */
/* ------------------------------------------------------------------ */

async function renderPage(template, page, chunkUrl) {
    const url = abs(page.route);
    const { title, description, keywords, noindex = false } = page.meta;

    let html = template;

    html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`, 'el <title>');
    html = replaceOnce(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`, 'la description');
    html = replaceOnce(html, /<meta name="keywords" content="[^"]*" \/>/, `<meta name="keywords" content="${esc(keywords)}" />`, 'las keywords');
    html = replaceOnce(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`, 'el canonical');
    html = replaceOnce(
        html,
        /<meta name="robots" content="[^"]*" \/>/,
        `<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}" />`,
        'el robots'
    );
    html = replaceOnce(html, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${page.type ?? 'website'}" />`, 'og:type');
    html = replaceOnce(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`, 'og:url');
    html = replaceOnce(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`, 'og:title');
    html = replaceOnce(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(description)}" />`, 'og:description');
    html = replaceOnce(html, /<meta name="twitter:url" content="[^"]*" \/>/, `<meta name="twitter:url" content="${url}" />`, 'twitter:url');
    html = replaceOnce(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(title)}" />`, 'twitter:title');
    html = replaceOnce(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`, 'twitter:description');

    const preload = chunkUrl ? `<link rel="modulepreload" href="${chunkUrl}" />` : '';
    html = replaceOnce(html, '<!--seo:extra-->', `${preload}\n<style>${STYLE}</style>\n${page.extra ?? ''}`, 'el hueco <!--seo:extra-->');

    if (page.content) {
        const body = await page.content();
        html = replaceOnce(html, '<div id="root"></div>', `<div id="root">${body}</div>`, 'el div #root');
    }

    return html;
}

async function main() {
    const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
    const chunks = new Map();
    for (const name of new Set(PAGES.map((p) => p.chunk).filter(Boolean))) {
        chunks.set(name, await findChunk(name));
    }

    let home = null;
    for (const page of PAGES) {
        const chunkUrl = page.chunk ? chunks.get(page.chunk) : null;
        const html = await renderPage(template, page, chunkUrl);

        if (page.route === '/') {
            home = html;
            continue;
        }

        const dir = path.join(DIST, page.route.slice(1));
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, 'index.html'), html, 'utf8');
    }
    await writeFile(path.join(DIST, 'index.html'), home, 'utf8');

    // 404 propio: Vercel lo sirve con estado 404 (no un 200 con la app dentro).
    const notFound = await renderPage(
        template,
        {
            route: '/404',
            meta: {
                path: '/404',
                title: 'Página no encontrada · Diédrico Studio',
                description: 'La página que buscas no existe. Vuelve a Diédrico Studio para seguir practicando sistema diédrico.',
                keywords: PAGE_META.home.keywords,
                noindex: true,
            },
            content: () =>
                `<div id="seo-fallback"><h1>Esta página no existe</h1>
<p>Puede que el enlace esté mal escrito o que la página haya cambiado de sitio.</p>
<p><a class="cta" href="/">Volver a Diédrico Studio</a><a class="ghost" href="/ejercicios">Ver los ejercicios</a></p></div>`,
            extra: '',
        },
        null
    );
    // El canonical del 404 apunta a la portada (es lo que Google recomienda).
    await writeFile(path.join(DIST, '404.html'), notFound.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${SITE_URL}/" />`), 'utf8');

    // Sitemap: las mismas rutas que se acaban de generar, sin las privadas.
    const routes = [
        { route: '/', priority: '1.0', changefreq: 'weekly' },
        { route: '/ejercicios', priority: '0.9', changefreq: 'weekly' },
        { route: '/guia', priority: '0.8', changefreq: 'monthly' },
        { route: '/academy', priority: '0.7', changefreq: 'monthly' },
        { route: '/about', priority: '0.5', changefreq: 'yearly' },
        { route: '/contact', priority: '0.4', changefreq: 'yearly' },
        { route: '/privacy', priority: '0.2', changefreq: 'yearly' },
        { route: '/terms', priority: '0.2', changefreq: 'yearly' },
        ...EXERCISES.map((e) => ({ route: `/ejercicios/${e.slug}`, priority: '0.7', changefreq: 'monthly' })),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
        .map(
            (r) => `  <url>
    <loc>${abs(r.route)}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
        )
        .join('\n')}
</urlset>
`;
    await writeFile(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');

    console.log(`[seo] ${PAGES.length} páginas + 404 + sitemap (${routes.length} URLs) · ${TODAY}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
