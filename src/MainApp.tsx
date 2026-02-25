import { useState, useEffect, useRef } from 'react';
import { Box, FileText, PenTool, Menu, X, Layers, Printer } from 'lucide-react';
import Scene from './components/Scene';
import Sidebar from './components/Sidebar';
import DiedricoView from './components/DiedricoView';
import CaballeraView from './features/caballera/components/CaballeraView';
import SEO from './components/SEO';
import { useGeometryStore } from './store/geometryStore';
import { useUserStore } from './store/userStore';
import { FEATURES } from './config/features';
import { AIChatPanel } from './features/ai-assistant';
import { useAIStore } from './features/ai-assistant/store/aiStore';
import { useThemeSync, useThemeInitializer } from './hooks/useThemeSync';
import SolidsTool from './components/tools/SolidsTool';
// AdBanner import removed

export default function MainApp() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [footerVisible, setFooterVisible] = useState(true);
    const { theme, viewMode, setViewMode } = useGeometryStore();
    const { isPremium } = useUserStore();
    const { generateExercise } = useAIStore();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const isDark = theme === 'dark';

    // Inicializar y sincronizar el tema
    useThemeInitializer();
    useThemeSync();

    // Listen for messages from the Láminas iframe
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'GENERATE_EXERCISE') {
                const prompt = event.data.prompt;
                const result = await generateExercise(prompt);

                if (iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'EXERCISE_GENERATED',
                        content: result
                    }, '*');
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [generateExercise]);

    // Auto-hide educational footer after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => setFooterVisible(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Theme Classes
    const bgClass = isDark ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
    const tabBg = isDark ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-sm';
    const tabActive = isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-md';
    const tabInactive = isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
    const overlayBg = isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200 shadow-sm';
    const textMain = isDark ? 'text-white' : 'text-gray-900';
    const textSub = isDark ? 'text-white/80' : 'text-gray-600';

    return (
        <>
            <SEO />
            <div className={`grid h-[100dvh] w-screen overflow-hidden transition-colors duration-300 select-none ${bgClass}`} style={{ gridTemplateRows: '1fr auto' }}>
                {/* Main App Area (grows to fill available space) */}
                <div className="overflow-hidden flex min-h-0">
                    {/* Mobile Menu Button */}
                    {viewMode !== 'caballera' && viewMode !== 'laminas' && (
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`md:hidden absolute top-4 left-4 z-50 p-2 rounded-lg backdrop-blur-md border transition-colors ${tabBg} ${textMain}`}
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    )}

                    {/* Sidebar Wrapper */}
                    {viewMode !== 'caballera' && viewMode !== 'laminas' && (
                        <div className={`
                            fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl md:shadow-none
                            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        `}>
                            <Sidebar />
                        </div>
                    )}

                    {/* Mobile Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 relative flex flex-col w-full min-h-0">
                        {/* View Switcher Tabs */}
                        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 backdrop-blur-md p-1 rounded-xl border flex gap-1 transition-colors max-w-[90vw] overflow-x-auto no-scrollbar ${tabBg}`}>
                            <button
                                onClick={() => setViewMode('3d')}
                                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === '3d' ? tabActive : tabInactive}`}
                            >
                                <Box size={16} /> <span className="hidden sm:inline">Vista</span> 3D
                            </button>
                            <button
                                onClick={() => setViewMode('2d')}
                                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === '2d' ? tabActive : tabInactive}`}
                            >
                                <FileText size={16} /> <span className="hidden sm:inline">Diédrico</span> (2D)
                            </button>
                            <button
                                onClick={() => setViewMode('sketch')}
                                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'sketch' ? 'bg-purple-600 text-white shadow-lg' : tabInactive}`}
                            >
                                <PenTool size={16} /> Boceto
                            </button>
                            {/* {isPremium && (
                                <button
                                    onClick={() => setViewMode('caballera')}
                                    className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'caballera' ? 'bg-indigo-600 text-white shadow-lg' : tabInactive}`}
                                >
                                    <Layers size={16} /> Caballera
                                </button>
                            )} */}
                            <button
                                onClick={() => setViewMode('laminas')}
                                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${viewMode === 'laminas' ? 'bg-emerald-600 text-white shadow-lg' : tabInactive}`}
                            >
                                <Printer size={16} /> <span className="hidden sm:inline">Láminas</span>
                            </button>
                        </div>

                        {/* View Content */}
                        <div key={viewMode} className="flex-1 relative w-full h-full animate-fade-in">
                            {viewMode === '3d' ? (
                                <>
                                    <Scene />
                                    {/* Instructions overlay removed for aesthetics and mobile usability */}
                                </>
                            ) : viewMode === 'caballera' ? (
                                <CaballeraView />
                            ) : viewMode === 'laminas' ? (
                                <div className="w-full h-full bg-white overflow-hidden">
                                    <iframe
                                        ref={iframeRef}
                                        src="/Laminas_automaticas.html"
                                        className="w-full h-full border-none"
                                        title="Láminas Automáticas"
                                    />
                                </div>
                            ) : (
                                <DiedricoView mode={viewMode} isSidebarOpen={isSidebarOpen} />
                            )}
                        </div>
                        {/* Global Tools that render UI overlays */}
                        <SolidsTool />
                    </div>

                    {/* AI Assistant Panel - Premium Only - TEMPORARILY HIDDEN */}
                    {/* {FEATURES.AI_ASSISTANT && isPremium && viewMode !== 'caballera' && viewMode !== 'laminas' && <AIChatPanel isSidebarOpen={isSidebarOpen} />} */}

                    {/* Watermark */}
                    <div className={`absolute bottom-2 right-4 text-[10px] md:text-xs font-medium opacity-50 pointer-events-none z-50 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Hecho por Eloi García
                    </div>
                </div>

                {/* Ad Banner Removed for Policy Compliance */}

                {/* 
                  Educational Content Section - VISIBLE for AdSense compliance.
                  Google requires visible publisher content on pages where ads are served.
                  This section provides genuine educational value about descriptive geometry.
                */}
                <footer
                    className={`w-full border-t transition-all duration-700 ease-in-out overflow-hidden ${isDark ? 'border-white/10 bg-gray-900/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm`}
                    style={{
                        maxHeight: footerVisible ? '300px' : '0px',
                        opacity: footerVisible ? 1 : 0,
                        paddingTop: footerVisible ? undefined : 0,
                        paddingBottom: footerVisible ? undefined : 0,
                        borderTopWidth: footerVisible ? undefined : 0
                    }}
                >
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        {/* Main Educational Content */}
                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <article>
                                <h2 className={`text-sm font-bold mb-2 ${textMain}`}>¿Qué es el Sistema Diédrico?</h2>
                                <p className={`text-xs leading-relaxed ${textSub}`}>
                                    El Sistema Diédrico es un método de representación geométrica que permite
                                    representar objetos tridimensionales en un plano bidimensional mediante dos
                                    proyecciones ortogonales: el <strong>alzado</strong> (proyección vertical) y la <strong>planta</strong> (proyección horizontal),
                                    separadas por la <strong>Línea de Tierra (LT)</strong>. Es fundamental en ingeniería, arquitectura y dibujo técnico.
                                </p>
                            </article>
                            <article>
                                <h2 className={`text-sm font-bold mb-2 ${textMain}`}>Conceptos Fundamentales</h2>
                                <ul className={`text-xs space-y-1 ${textSub}`}>
                                    <li>• <strong>Cota (Z)</strong>: Altura del punto respecto al Plano Horizontal (PH). Se representa arriba de la LT.</li>
                                    <li>• <strong>Alejamiento (Y)</strong>: Distancia del punto al Plano Vertical (PV). Se representa debajo de la LT.</li>
                                    <li>• <strong>Proyecciones</strong>: Todo punto tiene una proyección vertical (P'') y una horizontal (P').</li>
                                    <li>• <strong>Trazas</strong>: Intersecciones de rectas y planos con PH y PV.</li>
                                </ul>
                            </article>
                            <article>
                                <h2 className={`text-sm font-bold mb-2 ${textMain}`}>Herramientas Disponibles</h2>
                                <ul className={`text-xs space-y-1 ${textSub}`}>
                                    <li>• Visualización 3D interactiva en tiempo real</li>
                                    <li>• Proyecciones diédricas automáticas (alzado y planta)</li>
                                    <li>• Cálculo de intersecciones, distancias y verdaderas magnitudes</li>
                                    <li>• Abatimientos, cambios de plano y giros</li>
                                    <li>• Generador automático de láminas de ejercicios</li>
                                    <li>• Modo boceto para dibujo libre con compás y regla</li>
                                </ul>
                            </article>
                        </div>

                        {/* Links and legal */}
                        <div className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                            <div className={`flex flex-wrap gap-4 text-xs ${textSub}`}>
                                <a href="/about" className="hover:underline">Quiénes Somos</a>
                                <a href="/contact" className="hover:underline">Contacto</a>
                                <a href="/privacy" className="hover:underline">Privacidad</a>
                                <a href="/terms" className="hover:underline">Términos</a>
                            </div>
                            <p className={`text-xs ${textSub}`}>
                                © {new Date().getFullYear()} Diédrico Studio — Herramienta educativa gratuita de geometría descriptiva. Creado por Eloi García.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
