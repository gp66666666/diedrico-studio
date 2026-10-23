import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Book, Pencil, Box, RotateCw, Ruler, MousePointer2, Palette } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';

interface HelpGuideProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
}

export default function HelpGuide({ isOpen, onClose, isDark }: HelpGuideProps) {
    const [activeTab, setActiveTab] = useState<'intro' | 'sketch' | 'diedrico'>('intro');
    const panelRef = useModalA11y(isOpen, onClose);

    if (!isOpen) return null;

    const bgClass = isDark ? 'bg-gray-900 text-slate-100 border-gray-700' : 'bg-white text-gray-800 border-gray-200';
    const headerClass = isDark ? 'border-gray-700' : 'border-gray-200';
    const itemClass = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
    const tabClass = (active: boolean) => `px-4 py-2 font-medium transition-colors ${active
        ? 'text-blue-500 border-b-2 border-blue-500'
        : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`
        }`;

    const sketchTools = [
        { name: "Seleccionar / Mover", desc: "Selecciona objetos con clic. Arrastra para mover puntos o figuras." },
        { name: "Punto / Segmento", desc: "Crea puntos básicos y líneas finitas." },
        { name: "Recta Infinita", desc: "Define una línea que atraviesa todo el espacio." },
        { name: "Perpendicular / Paralela", desc: "Crea relaciones geométricas automáticas 2D." },
        { name: "Mediatriz / Bisectriz", desc: "Construcciones clásicas de dibujo técnico." },
        { name: "Tangentes", desc: "Halla tangentes a circunferencias desde puntos o entre circunferencias." },
    ];

    const diedricoTools = [
        {
            category: "Creación 3D",
            items: [
                { name: "Punto 3D", desc: "Introduce coordenadas X, Y, Z para situar puntos en el espacio." },
                { name: "Recta / Plano", desc: "Define elementos mediante puntos o ecuaciones." },
                { name: "Plano con 3 clics", desc: "Dibuja un plano directamente sobre el papel: dos clics debajo de la LT (traza horizontal) y uno encima (traza vertical)." },
                { name: "Poliedro libre (vértices)", desc: "Para cuerpos no regulares: escribes solo sus vértices (o haces clic en los puntos del dibujo) y el programa calcula caras y aristas. Antes de crear verás cuántos vértices, aristas, caras y volumen sale." },
                { name: "Sección plana", desc: "Corta un sólido con un plano: la sección se dibuja en planta y alzado y verás su verdadera magnitud, área y perímetro." },
                { name: "Intersección de dos sólidos", desc: "Calcula la parte común de dos cuerpos y marca la línea de intersección en planta y alzado." },
                { name: "Recta y sólido", desc: "Marca los puntos de entrada y salida de una recta en un sólido, con la cuerda entre ellos." },
                { name: "Plano tangente", desc: "Tangente a la esfera, al cono o al cilindro: en un punto de la superficie, por una recta exterior o paralelo a un plano." },
                { name: "Sombras sobre los planos", desc: "Sombra de sólidos, puntos y segmentos sobre el horizontal y el vertical, con foco propio o impropio." },
                { name: "Sombra arrojada", desc: "Sombra sobre un plano inclinado o sobre otro cuerpo, recortada al receptor." },
                { name: "Desarrollo del sólido", desc: "Despliega el sólido en el plano a escala (laterales y bases), también octaedro, dodecaedro e icosaedro. Se descarga en SVG." },
                { name: "Cuerpo truncado", desc: "Tras una sección, el panel muestra el desarrollo del cuerpo cortado: caras recortadas, base y tapa en verdadera magnitud." }
            ]
        },
        {
            category: "Intersecciones",
            items: [
                { name: "Recta - Recta", desc: "Halla el punto de corte (si existe) entre dos rectas." },
                { name: "Recta - Plano", desc: "Encuentra donde una recta perfora un plano." },
                { name: "Plano - Plano", desc: "Genera la recta de intersección entre dos planos." },
                { name: "Intersecciones Avanzadas", desc: "Halla intersecciones de 3 planos (punto común) o combinaciones complejas." }
            ]
        },
        {
            category: "Distancias y Ángulos",
            items: [
                { name: "Distancias", desc: "Mide distancias entre cualquier entidad: Punto, Recta y Plano (incluyendo Recta-Recta cruce y Plano-Plano paralelo)." },
                { name: "Ángulo Recta-Recta", desc: "Calcula el ángulo entre dos vectores dirección." },
                { name: "Ángulo Plano-Plano", desc: "Mide el ángulo diiedro entre dos planos." }
            ]
        },
        {
            category: "Transformaciones y Relaciones",
            items: [
                { name: "Perpendicularidad", desc: "Traza Rectas perpendiculares a Planos o Planos perpendiculares a Rectas pasando por un punto." },
                { name: "Giro (Eje Cualquiera)", desc: "Gira Puntos, Rectas o Planos alrededor de un Eje arbitrario." },
                { name: "Giro (Paralelo a LT)", desc: "Calcula el giro necesario para, dado un eje, poner una recta horizontal o frontal." },
                { name: "Abatimientos", desc: "Abate un plano sobre el Horizontal o Vertical para trabajar en verdadera magnitud." }
            ]
        }
    ];

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all duration-300">
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Manual de usuario"
                tabIndex={-1}
                className={`w-full max-w-3xl h-[80vh] flex flex-col rounded-2xl shadow-2xl border ${bgClass} ring-1 ring-white/10 help-guide-modal outline-none`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${headerClass}`}>
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <Book size={24} className="text-blue-500" />
                        Manual de Usuario
                    </h2>
                    <button onClick={onClose} className={`p-2 rounded-lg hover:bg-gray-500/20 transition-colors ${isDark ? 'text-white' : 'text-gray-600'}`}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex gap-2 px-4 border-b ${headerClass}`}>
                    <button onClick={() => setActiveTab('intro')} className={tabClass(activeTab === 'intro')}>
                        Inicio
                    </button>
                    <button onClick={() => setActiveTab('sketch')} className={tabClass(activeTab === 'sketch')}>
                        <span className="flex items-center gap-2"><Pencil size={16} /> Boceto 2D</span>
                    </button>
                    <button onClick={() => setActiveTab('diedrico')} className={tabClass(activeTab === 'diedrico')}>
                        <span className="flex items-center gap-2"><Box size={16} /> Diédrico 3D</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'intro' && (
                        <div className="space-y-6">
                            <div className="text-center space-y-4 py-8">
                                <h1 className={`text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent block ${isDark ? 'drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]' : ''}`}>
                                    Diédrico Studio v2
                                </h1>
                                <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-slate-300' : 'opacity-80'}`}>
                                    Tu suite profesional para Geometría Descriptiva y Dibujo Técnico. Combine la potencia del 3D con la precisión del 2D.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-lg border ${headerClass} space-y-2`}>
                                    <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        <MousePointer2 size={18} /> Navegación
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'opacity-70'}`}>
                                        • <b>Click Izquierdo:</b> Seleccionar.<br />
                                        • <b>Arrastrar:</b> orbitar en 3D o mover la vista en 2D (botón izquierdo).<br />
                                        • <b>Rueda:</b> Zoom.
                                    </p>
                                </div>
                                <div className={`p-4 rounded-lg border ${headerClass} space-y-2`}>
                                    <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-green-600'}`}>
                                        <Box size={18} /> Modos
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'opacity-70'}`}>
                                        • <b>Boceto:</b> Dibuja libremente en 2D.<br />
                                        • <b>Diédrico:</b> Construye en el espacio 3D con proyección automática.
                                    </p>
                                </div>
                                <div className={`p-4 rounded-lg border md:col-span-2 ${headerClass} space-y-2`}>
                                    <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                        <Palette size={18} /> Colores por proyección
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'opacity-70'}`}>
                                        En <b>Diédrico</b>, la fila <i>Colores por proyección</i> de
                                        <b> Controles de Vista</b> (barra lateral) pinta la
                                        planta (<b>a'</b>) en <span className={isDark ? 'text-yellow-400 font-bold' : 'text-amber-700 font-bold'}>amarillo</span> y
                                        el alzado (<b>a''</b>) en <span className={isDark ? 'text-cyan-400 font-bold' : 'text-cyan-700 font-bold'}>cian</span>.
                                        Donde se pisan una planta y un alzado, el trazo se ve <span className="text-green-500 font-bold">verde</span>:
                                        ahí hay de las dos. Las etiquetas también cogen el color de su proyección.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sketch' && (
                        <div className="space-y-4">
                            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Herramientas de Boceto</h3>
                            <div className="grid gap-3">
                                {sketchTools.map((tool, idx) => (
                                    <div key={idx} className={`p-3 rounded-lg border ${headerClass} ${itemClass}`}>
                                        <div className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{tool.name}</div>
                                        <div className={`text-sm ${isDark ? 'text-slate-300' : 'opacity-80'}`}>{tool.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'diedrico' && (
                        <div className="space-y-8">
                            <p className={`italic border-l-4 border-blue-500 pl-4 py-1 ${isDark ? 'text-gray-300' : 'opacity-80'}`}>
                                En el modo Diédrico, usa el panel "Herramientas Avanzadas" para realizar operaciones complejas sin necesidad de dibujar trazo a trazo.
                            </p>

                            {diedricoTools.map((section, idx) => (
                                <div key={idx} className="space-y-3">
                                    <h3 className={`text-lg font-bold flex items-center gap-2 border-b pb-2 ${isDark ? 'text-white border-gray-700/50' : 'text-gray-800 border-gray-200'}`}>
                                        {idx === 0 && <Box size={18} />}
                                        {idx === 1 && <RotateCw size={18} />}
                                        {idx === 2 && <Ruler size={18} />}
                                        {section.category}
                                    </h3>
                                    <div className="grid gap-3 pl-2">
                                        {section.items.map((item, i) => (
                                            <div key={i} className={`p-3 rounded-lg border ${headerClass} ${itemClass}`}>
                                                <div className={`font-bold ${isDark ? 'text-blue-400' : 'text-purple-600'}`}>{item.name}</div>
                                                <div className={`text-sm ${isDark ? 'text-slate-300' : 'opacity-80'}`}>{item.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex flex-col items-center gap-2 ${headerClass}`}>
                    <a
                        href="/guia"
                        className="text-sm font-semibold text-blue-500 hover:text-blue-400 underline underline-offset-4"
                    >
                        Ver la guía completa, con imágenes de cada herramienta
                    </a>
                    <span className="text-xs opacity-40">© 2025 Eloi García - Diédrico Studio</span>
                </div>
            </div>
        </div>,
        document.body
    );
}
