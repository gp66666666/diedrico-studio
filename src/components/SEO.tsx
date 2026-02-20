import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    canonicalUrl?: string;
    type?: 'website' | 'article';
}

export default function SEO({
    title = 'Diédrico Studio - Herramienta Educativa de Sistema Diédrico',
    description = 'Aprende sistema diédrico de forma interactiva con visualización 3D en tiempo real. Herramientas de geometría descriptiva, proyecciones diédricas automáticas y asistente AI. Gratis y educativo.',
    keywords = 'sistema diédrico, geometría descriptiva, dibujo técnico, visualización 3D, educación, ingeniería, arquitectura, proyecciones diédricas, alzado, planta, perfil',
    ogImage = 'https://diedrico-studio.vercel.app/og-image.png',
    canonicalUrl = 'https://diedrico-studio.vercel.app/',
    type = 'website'
}: SEOProps) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Diédrico Studio",
        "description": description,
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "creator": {
            "@type": "Person",
            "name": "Eloi García",
            "email": "eloigperezz@gmail.com",
            "url": "https://github.com/gp66666666"
        },
        "inLanguage": "es",
        "url": canonicalUrl,
        "screenshot": ogImage,
        "featureList": [
            "Visualización 3D interactiva",
            "Proyecciones diédricas automáticas",
            "Herramientas de geometría descriptiva",
            "Asistente AI",
            "Gratuito"
        ]
    };

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="Diédrico Studio" />
            <meta property="og:locale" content="es_ES" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
