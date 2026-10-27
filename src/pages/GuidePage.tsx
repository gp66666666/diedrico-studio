import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Box, Layers, PencilRuler, Sparkles, BookOpen,
    MousePointerClick, Ruler, RotateCw, Maximize2, Download, Cloud,
    Brain, GraduationCap, Printer, Eye, Grid3x3, Triangle, Move3d
} from 'lucide-react';
import SEO from '../components/SEO';
import { PAGE_META, pageSeo } from '../data/site';
import { trackEvent } from '../lib/analytics';

/* ------------------------------------------------------------------ */

const IMG = (name: string) => `/guia/${name}`;

function Figure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
    return (
        <figure className="my-6">
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className="w-full rounded-xl border border-white/10 shadow-2xl shadow-black/40"
            />
            <figcaption className="mt-2 text-xs text-slate-400">{caption}</figcaption>
        </figure>
    );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
    return (
        <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300">
                {n}
            </span>
            <div>
                <p className="font-semibold text-slate-100">{title}</p>
                <p className="text-sm leading-relaxed text-slate-300">{children}</p>
            </div>
        </li>
    );
}

function Section({
    id, number, title, icon, children,
}: {
    id: string; number: string; title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24 border-t border-white/10 py-10 first:border-t-0 first:pt-0">
            <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                    {icon}
                </span>
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400/80">Paso {number}</p>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>
            </div>
            <div className="space-y-4 text-slate-300">{children}</div>
        </section>
    );
}

/* ------------------------------------------------------------------ */

const TOC = [
    { id: 'interfaz', label: 'La interfaz' },
    { id: 'crear', label: 'Crear elementos' },
    { id: 'solidos', label: 'Sólidos y coherencia 3D/2D' },
    { id: 'diedrico', label: 'La vista diédrica' },
    { id: 'herramientas', label: 'Herramientas' },
    { id: 'lista', label: 'Lista y visibilidad' },
    { id: 'exportar', label: 'Exportar' },
    { id: 'proyectos', label: 'Proyectos en la nube' },
    { id: 'boceto', label: 'Boceto' },
    { id: 'laminas', label: 'Láminas y PDF' },
    { id: 'ia', label: 'Asistente IA' },
    { id: 'academia', label: 'La Academia' },
    { id: 'cuenta', label: 'Cuenta y plan' },
    { id: 'trucos', label: 'Trucos y atajos' },
    { id: 'faq', label: 'Preguntas frecuentes' },
    { id: 'temario', label: 'Cobertura PAU/EBAU' },
];

export default function GuidePage() {
    // Enlaces del tipo /guia#solidos (los usa el índice estático y se pueden
    // compartir): al montar, bajar hasta la sección.
    useEffect(() => {
        const id = window.location.hash.slice(1);
        if (!id) return;
        const timer = window.setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        trackEvent('guide_view');
    }, []);

    return (
        <>
            <SEO {...pageSeo(PAGE_META.guide)} />

            <div className="min-h-screen bg-[#070d18] text-slate-200">
                {/* Cabecera */}
                <header className="border-b border-white/10 bg-gradient-to-br from-blue-950/60 via-[#070d18] to-indigo-950/40">
                    <div className="mx-auto max-w-6xl px-5 py-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                            <ArrowLeft size={18} /> Volver a la aplicación
                        </Link>

                        <div className="mt-6 flex items-start gap-4">
                            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300 sm:flex">
                                <BookOpen size={28} />
                            </span>
                            <div>
                                <h1 className="text-3xl font-bold text-white sm:text-4xl">Guía de Diédrico Studio</h1>
                                <p className="mt-2 max-w-2xl text-slate-300">
                                    Todo lo que puedes hacer en la aplicación, con imágenes reales de cada herramienta.
                                    Si algo no se comporta como se explica aquí, es un fallo: avísame.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">12 minutos de lectura</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Nivel: desde cero</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                Atajo: Ctrl + P para guardarlo en PDF
                            </span>
                        </div>
                    </div>
                </header>

                {/* Cuerpo */}
                <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
                    {/* Índice */}
                    <nav className="hidden lg:block">
                        <div className="sticky top-8">
                            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Índice</p>
                            <ul className="space-y-1 text-sm">
                                {TOC.map((item) => (
                                    <li key={item.id}>
                                        <a
                                            href={`#${item.id}`}
                                            className="block rounded-md px-2 py-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>

                    <main className="min-w-0">
                        {/* 1 */}
                        <Section id="interfaz" number="01" title="La interfaz de un vistazo" icon={<Grid3x3 size={20} />}>
                            <Figure
                                src={IMG('01-interfaz-3d.jpg')}
                                alt="Vista 3D con tres puntos A, B y C y la barra lateral"
                                caption="La aplicación con tres puntos creados en el primer diedro."
                            />

                            <p>La pantalla se divide en cuatro zonas:</p>
                            <ul className="list-inside list-disc space-y-1.5 text-sm">
                                <li><b className="text-white">Barra superior central</b>: cambia entre <b>Vista 3D</b>, <b>Diédrico (2D)</b>, <b>Boceto</b> y <b>Láminas</b>.</li>
                                <li><b className="text-white">Columna izquierda</b>: tres pestañas, <b>Añadir</b> (crear elementos), <b>Herramientas</b> (distancias, giros…) y <b>Lista</b> (todo lo que hay en el dibujo).</li>
                                <li><b className="text-white">Zona central</b>: el lienzo. Arriba a la izquierda están Deshacer/Rehacer y los paneles <b>Controles de Vista</b>, <b>Proyectos</b> y <b>Exportar</b>.</li>
                                <li><b className="text-white">Abajo a la izquierda</b>: tu cuenta y tu plan. El botón morado flotante abre el <b>Asistente IA</b>.</li>
                            </ul>
                            <p className="text-sm">
                                Arriba a la derecha de la cabecera tienes el conmutador de tema (claro/oscuro) y el botón de <b>Ayuda</b>,
                                que abre esta misma guía.
                            </p>
                        </Section>

                        {/* 2 */}
                        <Section id="crear" number="02" title="Crear puntos, rectas, segmentos y planos" icon={<MousePointerClick size={20} />}>
                            <p>
                                Todo se crea desde <b className="text-white">Añadir</b>. Elige el tipo en las pestañas y pulsa el botón azul.
                            </p>
                            <Figure
                                src={IMG('02-crear-recta.jpg')}
                                alt="Formulario para crear una recta por dos puntos"
                                caption="Recta genérica definida por dos puntos. También puedes definirla por un punto y una dirección."
                            />
                            <ul className="space-y-3 text-sm">
                                <li><b className="text-white">Punto</b>: introduces la <b>coordenada X</b> (lateralidad: a lo largo de la línea de tierra), la <b>Y</b> (alejamiento) y la <b>Z</b> (cota). El nombre es opcional; si lo dejas vacío se numera solo.</li>
                                <li><b className="text-white">Recta</b>: por <b>2 puntos</b> o por <b>punto + dirección</b>. Si dejas un punto vacío, la recta es infinita.</li>
                                <li><b className="text-white">Segmento</b>: elige dos puntos ya existentes en el lienzo.</li>
                                <li><b className="text-white">Plano</b>: por <b>trazas</b> o por <b>punto y normal</b>. También puedes construirlo con 3 puntos, o <b>dibujarlo con el ratón</b> desde <i>Herramientas → Planos → Dibujar plano con 3 clics</i>.</li>
                                <li><b className="text-white">Sólido</b>: a mano (en el origen), con un punto como centro, con dos puntos como arista, por sus vértices (poliedro libre) o con un clic en el suelo de la vista 3D (ver el apartado siguiente).</li>
                            </ul>
                            <p className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm">
                                <b className="text-blue-300">Truco</b>: haz clic en cualquier elemento del lienzo o de la lista para seleccionarlo;
                                con el elemento seleccionado puedes cambiar su color, editarlo o borrarlo.
                            </p>
                        </Section>

                        {/* 3 */}
                        <Section id="solidos" number="03" title="Sólidos: la misma geometría en 3D y en 2D" icon={<Box size={20} />}>
                            <p>
                                Crear un sólido: <i>Herramientas → Sólidos</i> y elige la figura. El panel ofrece tres formas
                                de colocarlo:
                            </p>
                            <ul className="space-y-1 pl-5 text-sm">
                                <li>
                                    <b className="text-white">1 · Crear y ajustar a mano</b>: aparece en el origen
                                    (0, 0, 0), <b className="text-white">apoyado en el plano horizontal</b> y con sus medidas
                                    por defecto. Después lo cambias todo en su panel: posición, medidas y giro.
                                </li>
                                <li>
                                    <b className="text-white">2 · Centro en un punto</b>: escribes las coordenadas (o haces
                                    clic en un punto del dibujo) y el sólido queda <b className="text-white">centrado</b> ahí.
                                </li>
                                <li>
                                    <b className="text-white">3 · Por dos puntos (arista)</b>: escribes P y Q —o copias los
                                    de un punto que ya tengas— y esa arista cae <b className="text-white">exactamente de P a Q</b>.
                                    En la esfera, el cilindro y el cono los dos puntos son un <b className="text-white">diámetro</b>;
                                    el tetraedro se crea <b className="text-white">regular</b>.
                                </li>
                                <li>
                                    <b className="text-white">4 · Por sus vértices (poliedro libre)</b>: para cuerpos que no
                                    son regulares —un tetraedro irregular, un prisma oblicuo, un tronco—. Escribes
                                    <b className="text-white"> solo los vértices</b>, uno por línea («x y z» o el nombre de un
                                    punto del dibujo) y el programa calcula las caras y las aristas: une cada pareja de
                                    vértices que comparte una cara y no las demás. Un cubo son 8 vértices y de ahí salen
                                    sus <b className="text-white">12 aristas y 6 caras</b>; no hay que decir qué va con qué.
                                    Antes de crear verás el recuento (vértices · aristas · caras · volumen) y, si los puntos
                                    están en un mismo plano, el aviso de por qué no cierra el cuerpo.
                                </li>
                            </ul>
                            <p className="text-sm">
                                El atajo de siempre sigue: <b className="text-white">un clic en el suelo</b> de la vista 3D
                                y el sólido aparece apoyado en el PH en ese punto (su cara inferior toca el papel, no queda
                                medio enterrado ni flotando).
                            </p>
                            <Figure
                                src={IMG('12-solidos-3d.jpg')}
                                alt="Cubo, dodecaedro, pirámide y segmento en la vista 3D"
                                caption="Cubo, pirámide, dodecaedro y un segmento en la vista 3D."
                            />

                            <p className="text-sm">
                                Al seleccionar un sólido aparece su panel, donde puedes <b className="text-white">escribir los números a mano</b>:
                            </p>
                            <ul className="space-y-1.5 text-sm">
                                <li><b className="text-white">Posición</b>: coordenada X (lateralidad), Y (alejamiento) y Z (cota) del centro.</li>
                                <li><b className="text-white">Medidas</b>: tamaño (lado o radio) y altura en los cuerpos que la tienen.</li>
                                <li><b className="text-white">Giro</b>: los tres ángulos en grados, con atajos de +90°.</li>
                            </ul>
                            <p className="text-sm">
                                También puedes <b className="text-white">arrastrarlo con el ratón</b>. En la vista 3D se desliza
                                manteniendo su cota, así que si estaba apoyado en el PH sigue apoyado. En el diédrico, arrastra
                                su <b className="text-white">planta</b> para moverlo en X y alejamiento, o su{' '}
                                <b className="text-white">alzado</b> para moverlo en X y cota. Cada arrastre es un solo paso de
                                Deshacer.
                            </p>
                            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                                <b className="text-emerald-300">Apoyar en el PH</b> y <b className="text-emerald-300">Apoyar en el PV</b>:
                                colocan el sólido tocando el plano horizontal (cota 0) o el vertical (alejamiento 0), sin escribir
                                números. El panel te avisa en verde si está apoyado, y en rojo cuánto le falta (o cuánto se ha metido
                                detrás del plano). Al girar un sólido inclinado, vuelve a pulsarlo: ahora apoya en otra cara o arista.
                            </p>

                            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                                <b className="text-emerald-300">Apoyar en un plano</b>: elige el plano en la lista y el modo.
                                <b className="text-white"> Por cara</b> deja contenida en el plano la cara que mira hacia abajo.
                                <b className="text-white"> Por arista (en α₁)</b> hace lo mismo y además coloca una arista de esa cara sobre
                                la traza horizontal: es el caso del cubo apoyado en un plano oblicuo con dos vértices en el papel.
                                <b className="text-white"> Por vértice</b> solo baja el sólido hasta que el vértice más bajo toque el plano,
                                sin girarlo. Vale para cualquier sólido y para planos horizontales, verticales u oblicuos; si el plano es
                                horizontal y pides arista, te avisa de que no tiene α₁.
                            </p>

                            <div className="my-6 grid gap-4 sm:grid-cols-2">
                                <figure>
                                    <img src={IMG('13-solidos-2d.jpg')} alt="Proyecciones diédricas de los sólidos sin girar" loading="lazy"
                                        className="w-full rounded-xl border border-white/10" />
                                    <figcaption className="mt-2 text-xs text-slate-400">Sin girar: la planta del cubo es un cuadrado.</figcaption>
                                </figure>
                                <figure>
                                    <img src={IMG('14-solidos-girados.jpg')} alt="Los mismos sólidos girados 45 grados" loading="lazy"
                                        className="w-full rounded-xl border border-white/10" />
                                    <figcaption className="mt-2 text-xs text-slate-400">Girado 45° en Z: la planta pasa a ser un rombo y el alzado se ensancha.</figcaption>
                                </figure>
                            </div>

                            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                                <b className="text-emerald-300">Por qué coinciden</b>: las dos vistas construyen la malla desde el mismo módulo
                                (<code className="rounded bg-black/40 px-1">src/lib/solidGeometry.ts</code>). No hay dos dibujos parecidos:
                                hay un único conjunto de vértices y caras que se proyecta de dos maneras. Si giras el cubo en 3D, la planta
                                y el alzado cambian exactamente igual.
                            </p>

                            <p className="text-sm">
                                También puedes girar un sólido con un eje: <i>Herramientas → Giros → Girar recta, plano, segmento o sólido</i>.
                                Selecciona primero el sólido y después la recta que hace de eje. Se crea una copia girada con subíndice
                                (por ejemplo <b>Cubo 1₁</b>) para que puedas comparar la posición inicial y la final.
                            </p>

                            <p className="text-sm text-slate-400">
                                Las operaciones de sección, intersección y desarrollo de sólidos aparecen desactivadas en el panel:
                                todavía no están implementadas y no se muestran como si lo estuvieran.
                            </p>
                        </Section>

                        {/* 4 */}
                        <Section id="diedrico" number="04" title="La vista diédrica (2D)" icon={<Layers size={20} />}>
                            <Figure
                                src={IMG('07-vista-diedrica.jpg')}
                                alt="Vista diédrica con las proyecciones de tres puntos"
                                caption="Cada punto aparece dos veces: A'' (alzado) y A' (planta), unidas por una vertical."
                            />
                            <ul className="space-y-2 text-sm">
                                <li><b className="text-white">LT</b>: la línea de tierra. Separa el alzado (arriba) de la planta (abajo).</li>
                                <li><b className="text-white">Cota</b>: distancia al plano horizontal; se dibuja hacia arriba en el alzado.</li>
                                <li><b className="text-white">Alejamiento</b>: distancia al plano vertical; se dibuja hacia abajo en la planta.</li>
                                <li><b className="text-white">Zoom</b>: rueda del ratón. <b className="text-white">Mover</b>: arrastra con el botón derecho o con la herramienta de mano.</li>
                            </ul>
                            <p className="text-sm">
                                Abajo a la izquierda tienes <b>Vista de Perfil</b> (tercera proyección) y <b>Ver Mini 3D</b>, que abre una
                                ventana con el modelo girando a la vez que trabajas en 2D. Es la forma más rápida de comprobar que lo que
                                has dibujado tiene sentido en el espacio.
                            </p>
                        </Section>

                        {/* 5 */}
                        <Section id="herramientas" number="05" title="Herramientas: qué hace cada una" icon={<Ruler size={20} />}>
                            <p>
                                Todas viven en <b className="text-white">Herramientas</b>. Cada una te dice cuántos elementos necesita:
                                selecciónalos en el lienzo (o en la lista) y se ejecuta sola. Si te equivocas, vuelve a pulsar la
                                herramienta para desactivarla.
                            </p>
                            <Figure
                                src={IMG('03-herramientas-distancias.jpg')}
                                alt="Panel de distancias desplegado"
                                caption="Distancias: seis combinaciones entre punto, recta y plano."
                            />
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="font-semibold text-white">Distancias (2 elementos)</p>
                                    <p>Punto-Punto, Punto-Recta, Punto-Plano, Recta-Recta (incluye rectas que se cruzan), Recta-Plano y Plano-Plano. El resultado se dibuja en 3D y en 2D con su medida.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Intersecciones (2 elementos)</p>
                                    <p>Recta-Recta, Recta-Plano y Plano-Plano. En el grupo avanzado, intersección de 3 planos o combinaciones de 2 planos y 1 recta (3 elementos).</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Verdadera magnitud</p>
                                    <p>Mide un segmento o una recta tal como es en el espacio, no como se ve proyectado.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Paralelismo / Perpendicularidad</p>
                                    <p>Crea rectas y planos paralelos o perpendiculares a partir de un elemento de referencia y un punto por el que pasar.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Giros (2 elementos: objeto + eje)</p>
                                    <p>Girar un punto, o girar recta/plano/segmento/sólido alrededor de una recta-eje. También incluye poner una recta paralela a la LT. El resultado es una copia con subíndice.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Cambios de plano (2 puntos)</p>
                                    <p>Elige dos puntos que definan la nueva línea de tierra y la herramienta añade el sistema auxiliar, con su nueva LT dibujada.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Planos → Dibujar plano con 3 clics</p>
                                    <p>
                                        Sin escribir coordenadas: <b className="text-white">dos clics debajo de la línea de tierra</b> marcan
                                        la traza horizontal α₁ y <b className="text-white">un tercer clic encima</b> fija la traza vertical α₂,
                                        que pasa por el vértice. Mientras dibujas ves la traza y el vértice en verde; al tercer clic el plano
                                        queda creado con sus dos trazas.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Planos → Plano por 3 puntos existentes (3 puntos)</p>
                                    <p>Construye el plano que contiene a tres puntos que ya tengas en el dibujo.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Sólidos → Sección plana (1 sólido + 1 plano)</p>
                                    <p>
                                        Corta el sólido con el plano que elijas: la sección se añade al dibujo como un polígono
                                        (en planta y alzado). En el panel verás su <b className="text-white">verdadera magnitud</b>
                                        (el contorno abatido sobre el plano de corte), con el área y el perímetro. Puedes ocultar el
                                        sólido para ver el corte limpio.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Sólidos → Intersección de dos sólidos</p>
                                    <p>
                                        Elige los dos sólidos y la herramienta calcula su parte común. La{' '}
                                        <b className="text-white">línea de intersección</b> (las aristas donde se cruzan las
                                        superficies) queda marcada en planta y en alzado, y en 3D se ve la malla del cuerpo
                                        común en translúcido. Puedes ocultar los sólidos para verla limpia.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Sólidos → Recta y sólido (penetración)</p>
                                    <p>
                                        Elige una recta (o un segmento) y un sólido: la herramienta marca los{' '}
                                        <b className="text-white">puntos de entrada y salida</b> de la recta en la superficie, con
                                        sus coordenadas y la cuerda entre ellos. Si la recta es tangente, deja un solo punto. Si no
                                        lo corta, te lo dice.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Sólidos → Plano tangente (esfera, cono, cilindro)</p>
                                    <p>
                                        Tres casos con cualquiera de los tres cuerpos: un <b className="text-white">punto de la
                                        superficie</b> (plano tangente en él: en el cono contiene la generatriz, en el cilindro la
                                        generatriz perpendicular al radio), una <b className="text-white">recta exterior</b> (los
                                        planos tangentes que la contienen: dos en la esfera, uno como mucho en el cono y en el
                                        cilindro) o un <b className="text-white">plano</b> (los dos tangentes paralelos a él). Los
                                        planos se añaden al dibujo con su punto de tangencia.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Sólidos → Sombras (foco propio e impropio)</p>
                                    <p>
                                        Elige el objeto (sólido, punto o segmento) y la luz: un <b className="text-white">punto</b> es
                                        foco propio y una <b className="text-white">recta</b> marca la dirección de la luz (foco
                                        impropio, se toma hacia abajo). La sombra se calcula sobre el horizontal y sobre el vertical,
                                        cada una en su proyección, y se recorta en la línea de tierra.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Sólidos → Sombra arrojada (plano o cuerpo)</p>
                                    <p>
                                        Para cuando la sombra no cae en el suelo ni en el vertical: elige el{' '}
                                        <b className="text-white">objeto</b>, la <b className="text-white">luz</b> y el{' '}
                                        <b className="text-white">receptor</b> (un plano inclinado o otro sólido). Sobre un plano
                                        se dibuja el contorno exacto de la sombra; sobre otro cuerpo se recorta cara a cara y se
                                        marca solo la silueta, con la superficie en sombra.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Sólidos → Desarrollo del sólido (1 sólido)</p>
                                    <p>
                                        Despliega el sólido en el plano a escala: la tira de caras laterales y las bases donde
                                        corresponda, con la superficie total. Cubre cubo, prisma, pirámide, tetraedro, cilindro,
                                        cono, <b className="text-white">octaedro, dodecaedro e icosaedro</b> (estos tres abatiendo la
                                        malla cara a cara, con una red sin solapes). Se puede descargar en SVG para imprimirla o
                                        pegarla en la lámina. La esfera no tiene desarrollo porque no es desarrollable.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Desarrollo del cuerpo truncado</p>
                                    <p>
                                        Después de hacer una sección, el panel ofrece el desarrollo del cuerpo que queda:
                                        cada cara lateral recortada por el plano, la base y la tapa (la sección en verdadera
                                        magnitud). Disponible en prismas, cubos, cilindros, pirámides, tetraedros y conos.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Abatir plano horizontal</p>
                                    <p>Está en <i>Controles de Vista</i>: selecciona un plano y un punto que pertenezca a él. El punto abatido aparece como <b>(A)</b>.</p>
                                </div>
                            </div>
                            <Figure
                                src={IMG('15-giros.jpg')}
                                alt="Sección de giros abierta en el panel de herramientas"
                                caption="Giros y cambios de plano, con la indicación de qué hay que seleccionar."
                            />
                        </Section>

                        {/* 6 */}
                        <Section id="lista" number="06" title="Lista, visibilidad y edición" icon={<Eye size={20} />}>
                            <Figure
                                src={IMG('04-lista.jpg')}
                                alt="Lista de elementos con sus coordenadas y botones"
                                caption="Cada elemento con sus coordenadas, el ojo para ocultarlo, la rueda para editarlo y la papelera para borrarlo."
                            />
                            <p className="text-sm">
                                Ocultar un elemento no lo borra: sirve para trabajar con construcciones auxiliares. Al borrar un elemento
                                desaparecen también las medidas que dependían de él.
                            </p>
                        </Section>

                        {/* 7 */}
                        <Section id="exportar" number="07" title="Exportar el dibujo" icon={<Download size={20} />}>
                            <Figure
                                src={IMG('05-exportar.jpg')}
                                alt="Panel de exportación con las opciones Vista Actual y Todas las Vistas"
                                caption="Exportar → Vista Actual o Todas las Vistas."
                            />
                            <ul className="list-inside list-disc space-y-1.5 text-sm">
                                <li><b className="text-white">Vista Actual</b>: descarga lo que estás viendo. En 3D es un PNG; en 2D y boceto, una imagen JPG de la lámina.</li>
                                <li><b className="text-white">Todas las Vistas</b>: genera un ZIP con las tres vistas a la vez. Ideal para entregar un ejercicio.</li>
                            </ul>
                        </Section>

                        {/* 8 */}
                        <Section id="proyectos" number="08" title="Proyectos en la nube" icon={<Cloud size={20} />}>
                            <Figure
                                src={IMG('06-proyectos.jpg')}
                                alt="Panel de proyectos con guardar y cargar"
                                caption="Guardar y cargar proyectos asociados a tu cuenta."
                            />
                            <p className="text-sm">
                                Con la sesión iniciada puedes guardar el proyecto con un nombre y recuperarlo más tarde desde cualquier
                                dispositivo. Cada usuario solo ve sus proyectos. El progreso de la academia también se guarda en tu cuenta.
                            </p>
                        </Section>

                        {/* 9 */}
                        <Section id="boceto" number="09" title="Boceto: dibujo libre en 2D" icon={<PencilRuler size={20} />}>
                            <Figure
                                src={IMG('08-boceto.jpg')}
                                alt="Vista de boceto con la barra de herramientas de dibujo"
                                caption="Barra de herramientas del boceto y línea de tierra."
                            />
                            <p className="text-sm">
                                El boceto es un papel: puntos, segmentos, rectas infinitas, circunferencias, perpendiculares, paralelas,
                                mediatrices, bisectrices y tangentes. Tiene su propia línea de tierra y un imán para engancharse a los
                                elementos. No se proyecta al 3D: es para plantear a mano.
                            </p>
                        </Section>

                        {/* 10 */}
                        <Section id="laminas" number="10" title="Láminas: hojas de ejercicios y PDF" icon={<Printer size={20} />}>
                            <Figure
                                src={IMG('09-laminas.jpg')}
                                alt="Editor de láminas con varias hojas y exportación a PDF"
                                caption="Editor de láminas: varias hojas, generador de ejercicios y exportación a PDF."
                            />
                            <ul className="list-inside list-disc space-y-1.5 text-sm">
                                <li>Añade tantas hojas como quieras y escribe el enunciado de cada una.</li>
                                <li><b className="text-white">Analizar</b>: interpreta el enunciado y dibuja los datos sobre la lámina.</li>
                                <li><b className="text-white">Cargar en Escena Principal</b>: lleva el ejercicio a la vista 3D para resolverlo con las herramientas.</li>
                                <li><b className="text-white">Generador de ejercicios (IA)</b>: escribe un tema y crea un enunciado nuevo. Entra en las consultas gratuitas del día.</li>
                                <li><b className="text-white">Exportar PDF</b>: saca las hojas listas para imprimir.</li>
                            </ul>
                            <p className="text-sm">
                                Las láminas se guardan solas en tu cuenta: el indicador de abajo a la derecha
                                muestra "Láminas guardadas". Al entrar desde otro equipo se cargan las que tenías
                                en la nube. Sin sesión se guardan solo en este navegador.
                            </p>
                        </Section>

                        {/* 11 */}
                        <Section id="ia" number="11" title="Asistente IA: resolver o crear ejercicios" icon={<Brain size={20} />}>
                            <p>
                                El botón morado abre el chat. Tiene dos modos que se cambian con las pestañas de abajo:
                                <b className="text-white"> Resolver enunciado</b> y <b className="text-white"> Crear ejercicio</b>.
                            </p>
                            <p className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm">
                                <b className="text-blue-300">Resuelve como en el papel</b>: trabaja con proyecciones, trazas,
                                planos proyectantes auxiliares y abatimientos, no con ecuaciones ni vectores. Así los pasos
                                te sirven para el examen.
                            </p>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <figure>
                                    <img src={IMG('10-ia-enunciado.jpg')} alt="El asistente genera un enunciado de ejercicio" loading="lazy"
                                        className="w-full rounded-xl border border-white/10" />
                                    <figcaption className="mt-2 text-xs text-slate-400">Modo «Crear ejercicio»: inventa un enunciado y ofrece resolverlo.</figcaption>
                                </figure>
                                <figure>
                                    <img src={IMG('11-ia-pasos.jpg')} alt="El asistente propone los pasos de resolución" loading="lazy"
                                        className="w-full rounded-xl border border-white/10" />
                                    <figcaption className="mt-2 text-xs text-slate-400">Modo «Resolver»: propone los pasos y los dibuja en el lienzo.</figcaption>
                                </figure>
                            </div>

                            <ol className="space-y-3 text-sm">
                                <Step n={1} title="Elige el modo">
                                    Si quieres que te ponga deberes, usa «Crear ejercicio» y dime el tema. Si ya tienes un enunciado, usa «Resolver enunciado» y pégalo.
                                </Step>
                                <Step n={2} title="Lee los pasos">
                                    La respuesta trae una lista de pasos con lo que va a hacer en cada uno.
                                </Step>
                                <Step n={3} title="Ejecútalos">
                                    Con «Ejecutar Todo» se dibujan de golpe; con «Siguiente paso» los ves uno a uno, que es lo mejor para aprender.
                                </Step>
                                <Step n={4} title="Comprueba en 3D y en 2D">
                                    Lo que dibuja el asistente son elementos normales: aparecen en las dos vistas y puedes seguir trabajando con ellos.
                                </Step>
                                <Step n={5} title="Pídele que corrija tu dibujo">
                                    Con algo dibujado aparece el botón «Revisar mi dibujo». Envía el enunciado y lo que has
                                    construido, y te dice si está bien o dónde está el error (por ejemplo, si un punto no
                                    pertenece a una recta).
                                </Step>
                            </ol>
                            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                                El asistente es gratis: <b>3 consultas al día</b> por cuenta (y 1 de prueba sin cuenta). Es lo único que
                                cuesta dinero de verdad (cada consulta se paga a un proveedor), así que tiene
                                ese límite. El resto de la aplicación —3D, 2D, láminas y academia— no tiene
                                ningún límite.
                            </p>
                        </Section>

                        {/* 12 */}
                        <Section id="academia" number="12" title="La Academia" icon={<GraduationCap size={20} />}>
                            <p>
                                La Academia es el curso completo de diédrico dentro de la aplicación. Tiene
                                <b className="text-white"> 20 temas</b>: desde el punto hasta la esfera, pasando por
                                abatimientos, giros, cambios de plano, secciones y desarrollos.
                            </p>

                            <ul className="space-y-2 text-sm">
                                <li><b className="text-white">Teoría con pasos interactivos</b>: cada construcción se ve paso a paso, con el dibujo acumulado sobre la línea de tierra (botones Anterior / Siguiente / Repetir).</li>
                                <li><b className="text-white">Ejercicios con los datos montados</b>: al pulsar ▶ el ejercicio se carga en el lienzo con sus puntos, rectas y planos, y una pista. Tú lo resuelves.</li>
                                <li><b className="text-white">Progreso guardado</b>: puedes marcar temas como estudiados y ejercicios como completados; se guarda en tu cuenta.</li>
                                <li><b className="text-white">Mapa del temario</b>: el tema 20 resume qué entra, en qué orden estudiarlo y qué queda fuera de la app.</li>
                                <li><b className="text-white">Imprimir / PDF</b>: cualquier tema se puede imprimir para llevarlo en papel.</li>
                            </ul>

                            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                                <b className="text-emerald-300">La Academia está entera abierta.</b> Sin cuenta, sin plan
                                y sin límite: los 20 temas, los ejercicios resueltos y el PDF.
                            </p>
                        </Section>

                        {/* 13 */}
                        <Section id="cuenta" number="13" title="Cuenta y plan" icon={<GraduationCap size={20} />}>
                            <p className="text-sm">
                                <b className="text-white">No hay planes.</b> Todo lo que hace la aplicación es gratis
                                y se puede usar sin crear cuenta.
                            </p>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <p className="font-semibold text-white">Gratis, sin límite</p>
                                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-300">
                                    <li>Motor 3D y vista diédrica completos</li>
                                    <li>Todas las herramientas de geometría</li>
                                    <li>Sólidos, boceto y láminas</li>
                                    <li>Academia completa (20 temas y ejercicios)</li>
                                    <li>Guardar proyectos y láminas en la nube</li>
                                    <li>Exportar imágenes y PDF</li>
                                    <li>Compartir ejercicios por enlace</li>
                                    <li>Biblioteca de ejercicios resueltos</li>
                                    <li>Funciona sin conexión (PWA)</li>
                                </ul>
                            </div>
                            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                                <b className="text-emerald-300">La única excepción es el asistente de IA:</b> cada
                                consulta se paga a un proveedor, así que hay <b>3 al día</b> por cuenta y 1 sin cuenta. No hay nada
                                que comprar: mañana tienes 5 más.
                            </p>
                            <p className="text-sm">
                                Si quieres ayudar a pagar esa factura, en el pie hay un enlace a
                                <b className="text-white"> Ko-fi</b> para invitar a un café. Es un donativo: no
                                desbloquea nada, porque no hay nada bloqueado.
                            </p>
                        </Section>

                        {/* 14 */}
                        <Section id="trucos" number="14" title="Trucos y atajos" icon={<Move3d size={20} />}>
                            <ul className="space-y-2 text-sm">
                                <li><b className="text-white">Ctrl + Z / Ctrl + Y</b>: deshacer y rehacer (también en Mac con ⌘).</li>
                                <li><b className="text-white">Supr</b>: borra el elemento seleccionado. <b className="text-white">Escape</b>: cancela la herramienta activa.</li>
                                <li><b className="text-white">Rueda del ratón</b>: zoom. En 3D, arrastra con el botón izquierdo para orbitar y con el derecho para desplazar la vista.</li>
                                <li><b className="text-white">Mini 3D</b>: comprueba en el espacio lo que estás dibujando en 2D.</li>
                                <li><b className="text-white">Nombra los puntos</b>: A, B, C… hace que el asistente y los enunciados se entiendan mucho mejor.</li>
                                <li><b className="text-white">Trabaja por capas</b>: oculta las construcciones auxiliares con el ojo de la lista.</li>
                                <li><b className="text-white">Antes de exportar</b>, coloca la vista como quieras: se exporta exactamente lo que ves.</li>
                            </ul>
                        </Section>

                        {/* 15 */}
                        <Section id="faq" number="15" title="Preguntas frecuentes" icon={<Sparkles size={20} />}>
                            <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
                                {[
                                    {
                                        q: 'He girado un sólido y en 2D no coincide con el 3D. ¿Es un fallo?',
                                        a: 'No debería: las dos vistas usan la misma malla. Si ves algo raro, mándame una captura con el nombre del sólido y los valores de rotación.',
                                    },
                                    {
                                        q: '¿Por qué el asistente tiene un límite y el resto no?',
                                        a: 'Porque es lo único que cuesta dinero de verdad: cada consulta se paga a un proveedor. Tiene 3 al día por cuenta (1 de prueba sin cuenta); el resto de la aplicación es gratis y sin límite.',
                                    },
                                    {
                                        q: '¿Se pierden mis proyectos si no entro?',
                                        a: 'Los proyectos de la nube necesitan cuenta. Si trabajas como invitado, el progreso de la academia se guarda en este navegador.',
                                    },
                                    {
                                        q: '¿Puedo imprimir esta guía?',
                                        a: 'Sí: Ctrl + P y guárdala como PDF. Está pensada para eso.',
                                    },
                                    {
                                        q: '¿Las láminas se guardan en la nube?',
                                        a: 'Sí, si has iniciado sesión: se sincronizan solas en tu cuenta y las recuperas en cualquier equipo. Como invitado se quedan en este navegador.',
                                    },
                                ].map((item) => (
                                    <details key={item.q} className="group p-4">
                                        <summary className="cursor-pointer list-none font-medium text-white marker:hidden">
                                            <span className="mr-2 text-blue-400 group-open:rotate-90 inline-block transition-transform">›</span>
                                            {item.q}
                                        </summary>
                                        <p className="mt-2 pl-5 text-sm text-slate-300">{item.a}</p>
                                    </details>
                                ))}
                            </div>
                        </Section>


                        {/* 16 */}
                        <Section id="temario" number="16" title="Qué puedes resolver: temario PAU/EBAU" icon={<GraduationCap size={20} />}>
                            <p>
                                Todo el bloque de diédrico de <b className="text-white">Dibujo Técnico II</b> se puede dibujar
                                y comprobar aquí. Esta es la correspondencia entre cada punto del temario y la herramienta que
                                lo resuelve, para que sepas dónde está cada cosa.
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    {
                                        t: 'Punto, recta y plano',
                                        d: 'Proyecciones, trazas, pertenencia y posiciones particulares: rectas de perfil, paralelas o perpendiculares a los planos de proyección, planos de canto y paralelos a la LT.',
                                        h: 'Añadir · Punto / Recta / Plano, y Plano por 3 puntos',
                                    },
                                    {
                                        t: 'Intersecciones',
                                        d: 'Recta-recta (incluye rectas que se cruzan), recta-plano, plano-plano, tres planos y combinaciones de dos planos con una recta.',
                                        h: 'Herramientas › Intersecciones',
                                    },
                                    {
                                        t: 'Paralelismo y perpendicularidad',
                                        d: 'Recta paralela o perpendicular a plano, plano paralelo o perpendicular a recta o a otro plano, recta perpendicular a recta.',
                                        h: 'Herramientas › Paralelismo / Perpendicularidad',
                                    },
                                    {
                                        t: 'Distancias',
                                        d: 'Las seis del temario: punto-punto, punto-recta, punto-plano, recta-recta (también cruzadas), recta-plano y plano-plano.',
                                        h: 'Herramientas › Distancias',
                                    },
                                    {
                                        t: 'Ángulos',
                                        d: 'Entre dos rectas, entre recta y plano y entre dos planos, con su medida en grados.',
                                        h: 'Herramientas › Verdadera magnitud › Ángulos',
                                    },
                                    {
                                        t: 'Giros y cambios de plano',
                                        d: 'Girar puntos, rectas, segmentos, planos y sólidos alrededor de un eje; poner una recta paralela a la LT; crear un sistema auxiliar con una nueva LT.',
                                        h: 'Herramientas › Giros y Cambios de plano',
                                    },
                                    {
                                        t: 'Abatimientos y verdaderas magnitudes',
                                        d: 'Abatir un punto sobre el plano horizontal y medir cualquier segmento o recta en verdadera magnitud. La sección se abate sobre su plano de corte.',
                                        h: 'Controles de Vista › Abatir, y Herramientas › Verdadera magnitud',
                                    },
                                    {
                                        t: 'Sólidos',
                                        d: 'Poliedros regulares (tetraedro, cubo, octaedro, dodecaedro, icosaedro), prisma, pirámide, cilindro, cono y esfera, con rotación y traslación.',
                                        h: 'Añadir › Sólido',
                                    },
                                    {
                                        t: 'Secciones planas de cualquier cuerpo',
                                        d: 'Con un plano proyectante, oblicuo, paralelo a una cara, que pase por una arista o por tres puntos (o dibujado con tres clics). Se dibuja en planta y alzado, con su verdadera magnitud, área y perímetro. Funciona en todos los sólidos, esfera incluida.',
                                        h: 'Herramientas › Sólidos › Sección plana',
                                    },
                                    {
                                        t: 'Intersección de dos sólidos',
                                        d: 'Parte común de dos cuerpos y línea de intersección entre sus superficies, con el volumen del cuerpo común. Sirve para las penetraciones entre prisma, pirámide, cilindro, cono y esfera.',
                                        h: 'Herramientas › Sólidos › Intersección de dos sólidos',
                                    },
                                    {
                                        t: 'Puntos de penetración de una recta en un sólido',
                                        d: 'Entrada y salida de la recta por la superficie, con sus coordenadas y la cuerda entre ellos. También detecta el caso tangente y el de recta exterior.',
                                        h: 'Herramientas › Sólidos › Recta y sólido',
                                    },
                                    {
                                        t: 'Planos tangentes: esfera, cono y cilindro',
                                        d: 'Tangente en un punto de la superficie, tangentes que contienen una recta exterior y tangentes paralelos a un plano dado. En el cono el plano contiene la generatriz; en el cilindro, la generatriz perpendicular al radio.',
                                        h: 'Herramientas › Sólidos › Plano tangente',
                                    },
                                    {
                                        t: 'Sombras',
                                        d: 'Sombra de sólidos, puntos y segmentos sobre el horizontal y el vertical, con foco propio (un punto de luz) o impropio (una dirección). Se dibuja en planta y alzado y se recorta en la línea de tierra.',
                                        h: 'Herramientas › Sólidos › Sombras sobre los planos',
                                    },
                                    {
                                        t: 'Sombra arrojada sobre un plano inclinado o sobre otro cuerpo',
                                        d: 'Sombra recortada sobre el receptor: contorno exacto sobre un plano cualquiera y silueta sobre otro sólido, con la superficie en sombra.',
                                        h: 'Herramientas › Sólidos › Sombra arrojada',
                                    },
                                    {
                                        t: 'Desarrollos',
                                        d: 'Red del sólido completo a escala (lateral y bases) de los diez sólidos: cubo, prisma, pirámide, tetraedro, cilindro, cono, octaedro, dodecaedro e icosaedro. Y desarrollo del cuerpo truncado por un plano: caras cortadas, base y tapa en verdadera magnitud. Se descarga en SVG.',
                                        h: 'Herramientas › Sólidos › Desarrollo del sólido, y panel de Sección',
                                    },
                                ].map((item) => (
                                    <div key={item.t} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-sm font-semibold text-white">{item.t}</p>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.d}</p>
                                        <p className="mt-2 text-[11px] font-medium text-blue-300">{item.h}</p>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-slate-400">
                                <b className="text-slate-200">Lo que no incluye:</b> la perspectiva axonométrica, que es otro
                                bloque del temario y no forma parte del sistema diédrico.
                            </p>
                        </Section>

                        <div className="mt-10 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
                            <p className="text-lg font-semibold text-white">¿Listo para practicar?</p>
                            <p className="mt-1 text-sm text-slate-300">Abre la aplicación y prueba a crear tres puntos y girar un cubo.</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                                >
                                    <Box size={18} /> Abrir Diédrico Studio
                                </Link>
                                <Link
                                    to="/ejercicios"
                                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                                >
                                    Ejercicios resueltos
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
