import { Helmet } from 'react-helmet-async';
import { OG_IMAGE, PAGE_META, SITE_NAME, SITE_URL, pageSeo } from '../data/site';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    canonicalUrl?: string;
    type?: 'website' | 'article';
    /** Páginas privadas o de error: no deben indexarse. */
    noindex?: boolean;
}

const HOME = pageSeo(PAGE_META.home);

/**
 * Metadatos de la página activa.
 *
 * Ojo: los buscadores y las redes sociales leen el HTML del servidor, y ahí
 * manda lo que genera `scripts/seo.mjs` en el build (título, descripción,
 * canonical, Open Graph y datos estructurados ya escritos). Este componente
 * mantiene todo coherente cuando se navega dentro de la app sin recargar.
 */
export default function SEO({
    title = HOME.title,
    description = HOME.description,
    keywords = HOME.keywords,
    ogImage = OG_IMAGE,
    canonicalUrl = SITE_URL + '/',
    type = 'website',
    noindex = false,
}: SEOProps) {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />
            {noindex && <meta name="robots" content="noindex, follow" />}

            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="es_ES" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
        </Helmet>
    );
}
