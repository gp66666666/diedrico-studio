import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Box, Layers, PencilRuler, Sparkles, BookOpen,
    MousePointerClick, Ruler, RotateCw, Maximize2, Download, Cloud,
    Brain, GraduationCap, Printer, Eye, Grid3x3, Triangle, Move3d
} from 'lucide-react';
import SEO from '../components/SEO';
import { PREMIUM } from '../config/premium';
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
    { id: 'cuenta', label: 'Cuenta y plan' },
    { id: 'trucos', label: 'Trucos y atajos' },
    { id: 'faq', label: 'Preguntas frecuentes' },
];

export default function GuidePage() {
    useEffect(() => {
        trackEvent('guide_view');
    }, []);

    return (
        <>
            <SEO
                title="Guía completa - Diédrico Studio"
                description="Tutorial con imágenes de todas las herramientas de Diédrico Studio: crear puntos, rectas y planos, sólidos, vista diédrica, giros, distancias, láminas y asistente IA."
                keywords="guía sistema diédrico, tutorial geometría descriptiva, diédrico studio, cómo usar, sólidos, proyecciones"
                canonicalUrl="https://diedrico-studio.vercel.app/guia"
            />

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
                            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Índice</p>
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
                                <li><b className="text-white">Punto</b>: introduces <b>X</b> (paralela a la línea de tierra), <b>Y</b> (alejamiento) y <b>Z</b> (cota). El nombre es opcional; si lo dejas vacío se numera solo.</li>
                                <li><b className="text-white">Recta</b>: por <b>2 puntos</b> o por <b>punto + dirección</b>. Si dejas un punto vacío, la recta es infinita.</li>
                                <li><b className="text-white">Segmento</b>: elige dos puntos ya existentes en el lienzo.</li>
                                <li><b className="text-white">Plano</b>: por <b>trazas</b> o por <b>punto y normal</b>. También puedes construirlo con 3 puntos desde <i>Herramientas → Planos</i>.</li>
                                <li><b className="text-white">Sólido</b>: se coloca sobre un punto (ver el apartado siguiente).</li>
                            </ul>
                            <p className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm">
                                <b className="text-blue-300">Truco</b>: haz clic en cualquier elemento del lienzo o de la lista para seleccionarlo;
                                con el elemento seleccionado puedes cambiar su color, editarlo o borrarlo.
                            </p>
                        </Section>

                        {/* 3 */}
                        <Section id="solidos" number="03" title="Sólidos: la misma geometría en 3D y en 2D" icon={<Box size={20} />}>
                            <p>
                                Crear un sólido: <i>Herramientas → Sólidos</i>, elige la figura y haz clic sobre un punto del lienzo.
                                El sólido queda centrado en ese punto.
                            </p>
                            <Figure
                                src={IMG('12-solidos-3d.jpg')}
                                alt="Cubo, dodecaedro, pirámide y segmento en la vista 3D"
                                caption="Cubo, pirámide, dodecaedro y un segmento en la vista 3D."
                            />

                            <p className="text-sm">
                                Al seleccionar un sólido aparece su panel con dos deslizadores: <b className="text-white">tamaño</b> y <b className="text-white">rotación</b> en
                                los ejes X, Y y Z. La rotación se mide en grados.
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
                                    <p className="font-semibold text-white">Planos → Plano por 3 puntos (3 puntos)</p>
                                    <p>Construye el plano que contiene a los tres puntos.</p>
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
                                <li><b className="text-white">Generador de ejercicios (IA)</b>: escribe un tema y crea un enunciado nuevo. Es una función Premium.</li>
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
                            </ol>
                            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
                                El asistente es la función Premium principal. Sin plan Premium verás el panel y el botón de mejora de plan,
                                pero no se gasta ninguna petición.
                                {PREMIUM.priceLabel ? ` Precio: ${PREMIUM.priceLabel}.` : ''}
                            </p>
                        </Section>

                        {/* 12 */}
                        <Section id="cuenta" number="12" title="Cuenta y plan" icon={<GraduationCap size={20} />}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                    <p className="font-semibold text-white">Gratis</p>
                                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-300">
                                        <li>Todo el motor de dibujo 3D y diédrico</li>
                                        <li>Todas las herramientas de geometría</li>
                                        <li>Sólidos, boceto y láminas</li>
                                        <li>Guardar proyectos en la nube</li>
                                        <li>Exportar imágenes</li>
                                    </ul>
                                </div>
                                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                                    <p className="font-semibold text-purple-200">Premium</p>
                                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-300">
                                        <li>Asistente IA: resolver y crear ejercicios</li>
                                        <li>Generador de ejercicios en Láminas</li>
                                        <li>Academia con teoría y ejercicios</li>
                                        <li>Sin banner de anuncios</li>
                                    </ul>
                                </div>
                            </div>
                            <p className="text-sm">
                                El plan se activa desde la cuenta, con el botón <b className="text-white">Hacerse Premium</b>.
                                Cuando caduca, vuelve al plan gratuito automáticamente y tus proyectos siguen intactos.
                            </p>
                        </Section>

                        {/* 13 */}
                        <Section id="trucos" number="13" title="Trucos y atajos" icon={<Move3d size={20} />}>
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

                        {/* 14 */}
                        <Section id="faq" number="14" title="Preguntas frecuentes" icon={<Sparkles size={20} />}>
                            <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
                                {[
                                    {
                                        q: 'He girado un sólido y en 2D no coincide con el 3D. ¿Es un fallo?',
                                        a: 'No debería: las dos vistas usan la misma malla. Si ves algo raro, mándame una captura con el nombre del sólido y los valores de rotación.',
                                    },
                                    {
                                        q: '¿Por qué el asistente me pide Premium?',
                                        a: 'El asistente consume API de un modelo de lenguaje. El resto de la aplicación es gratis y no tiene límite de uso.',
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

                        <div className="mt-10 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
                            <p className="text-lg font-semibold text-white">¿Listo para practicar?</p>
                            <p className="mt-1 text-sm text-slate-300">Abre la aplicación y prueba a crear tres puntos y girar un cubo.</p>
                            <Link
                                to="/"
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                            >
                                <Box size={18} /> Abrir Diédrico Studio
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
