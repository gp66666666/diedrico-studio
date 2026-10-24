/**
 * Metadatos de las páginas: una sola lista para el navegador y para el
 * generador de HTML estático (`scripts/seo.mjs`).
 *
 * Si cambias un título o una descripción aquí, cambia en los dos sitios a la
 * vez. Los ejercicios no están en esta lista: su SEO se genera a partir de
 * `src/data/exercises.ts`.
 */

export const SITE_URL = 'https://diedrico-studio.vercel.app';
export const SITE_NAME = 'Diédrico Studio';
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const CONTACT_EMAIL = 'diedrico.studio25@gmail.com';

export interface PageMeta {
    /** Ruta pública, siempre con barra inicial. */
    path: string;
    /** <title> de la página (sin el sufijo de marca: ya va incluido). */
    title: string;
    /** Meta description, entre 120 y 158 caracteres. */
    description: string;
    keywords: string;
    /** true = no debe aparecer en Google (páginas privadas o de error). */
    noindex?: boolean;
}

export const PAGE_META: Record<string, PageMeta> = {
    home: {
        path: '/',
        title: 'Diédrico Studio · sistema diédrico interactivo en 3D',
        description:
            'Dibuja puntos, rectas, planos y sólidos en diédrico con vista 3D en tiempo real. Proyecciones, abatimientos, giros, ejercicios resueltos y láminas.',
        keywords:
            'sistema diédrico, geometría descriptiva, dibujo técnico, ejercicios resueltos, PAU, bachillerato, visualización 3D',
    },
    exercises: {
        path: '/ejercicios',
        title: 'Ejercicios resueltos de sistema diédrico',
        description:
            'Ejercicios de sistema diédrico resueltos paso a paso: trazas, intersecciones, distancias, paralelismo, abatimientos, giros y ángulos. Con dibujo en 3D.',
        keywords:
            'ejercicios sistema diédrico resueltos, geometría descriptiva, dibujo técnico, PAU, bachillerato, intersecciones, abatimientos',
    },
    guide: {
        path: '/guia',
        title: 'Guía de sistema diédrico: todas las herramientas',
        description:
            'Cómo crear puntos, rectas, planos y sólidos, ver las proyecciones, medir distancias, abatir, girar y generar láminas. Guía con imágenes de cada herramienta.',
        keywords:
            'guía sistema diédrico, tutorial geometría descriptiva, diédrico studio, cómo usar, sólidos, proyecciones',
    },
    academy: {
        path: '/academy',
        title: 'Academia de dibujo técnico: teoría y ejercicios',
        description:
            'Teoría de sistema diédrico explicada por temas, con ejercicios guiados paso a paso y la opción de resolverlos en el editor 3D.',
        keywords:
            'academia dibujo técnico, teoría sistema diédrico, apuntes, ejercicios guiados, bachillerato',
    },
    about: {
        path: '/about',
        title: 'Quién está detrás de Diédrico Studio',
        description:
            'Diédrico Studio es una herramienta educativa gratuita de sistema diédrico creada por Eloi García para estudiantes y profesores de dibujo técnico.',
        keywords:
            'sobre Diédrico Studio, Eloi García, proyecto educativo, geometría descriptiva online, herramienta educativa',
    },
    contact: {
        path: '/contact',
        title: 'Contacto · Diédrico Studio',
        description:
            'Escríbenos para dudas, sugerencias o problemas con la herramienta. Respondemos al correo que dejes en el formulario de contacto.',
        keywords: 'contacto Diédrico Studio, soporte, sugerencias, dudas dibujo técnico',
    },
    privacy: {
        path: '/privacy',
        title: 'Política de privacidad · Diédrico Studio',
        description:
            'Qué datos guarda Diédrico Studio, para qué se usan y cómo puedes borrarlos. Sin publicidad ni venta de datos a terceros.',
        keywords: 'privacidad Diédrico Studio, datos personales, cookies, RGPD',
    },
    terms: {
        path: '/terms',
        title: 'Términos de uso · Diédrico Studio',
        description:
            'Condiciones de uso de Diédrico Studio: qué puedes hacer con la herramienta, límites del servicio y responsabilidad sobre los dibujos.',
        keywords: 'términos de uso, condiciones, Diédrico Studio',
    },
    classroom: {
        path: '/clase',
        title: 'Mi clase · Diédrico Studio',
        description:
            'Panel del profesor: crea un código de clase y comparte consultas con tus alumnos desde un solo sitio.',
        keywords: 'código de clase, profesor, Diédrico Studio',
        noindex: true,
    },
};

/** Props listas para `<SEO {...pageSeo(PAGE_META.about)} />`. */
export function pageSeo(page: PageMeta) {
    return {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        canonicalUrl: `${SITE_URL}${page.path}`,
        noindex: page.noindex,
    };
}

/**
 * Título de la pestaña para un ejercicio. Google corta sobre los 60 caracteres,
 * así que los títulos largos se quedan con un sufijo corto.
 */
export function exercisePageTitle(title: string): string {
    const full = ' · ejercicio resuelto de diédrico';
    const mid = ' · ejercicio resuelto';
    if (title.length + full.length <= 65) return `${title}${full}`;
    if (title.length + mid.length <= 65) return `${title}${mid}`;
    return `${title} · diédrico`;
}

/** Descripción de un ejercicio, recortada por palabras para no cortar a mitad. */
export function exerciseDescription(statement: string, max = 155): string {
    const clean = statement.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    return `${cut.slice(0, lastSpace > 90 ? lastSpace : max).replace(/[.,;:]$/, '')}…`;
}
