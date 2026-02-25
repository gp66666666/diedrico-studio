import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, FileText, PenTool, Menu, X, Layers, Printer, Info, HelpCircle } from 'lucide-react';
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
    const [countdown, setCountdown] = useState(5);
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

    // Auto-hide educational footer after countdown
    useEffect(() => {
        if (countdown > 0 && footerVisible) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setFooterVisible(false);
        }
    }, [countdown, footerVisible]);

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
                */}
                <footer
                    className={`fixed bottom-0 left-0 w-full border-t border-blue-500/20 transition-all duration-1000 ease-in-out overflow-hidden z-[100] backdrop-blur-xl educational-footer`}
                    style={{
                        maxHeight: footerVisible ? '55px' : '0px',
                        opacity: footerVisible ? 1 : 0,
                        transform: footerVisible ? 'translateY(0)' : 'translateY(100%)',
                        pointerEvents: footerVisible ? 'auto' : 'none',
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)'
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-600 text-[9px] font-black uppercase tracking-tighter text-white">
                                EDU
                            </span>

                            <p className="text-[10px] leading-tight truncate hidden md:block">
                                <strong>Geometría Descriptiva:</strong> Estudio del Sistema Diédrico para representación 3D mediante planos de proyección (Alzado y Planta).
                                Herramienta para cálculo de trazas e intersecciones reales.
                            </p>
                            <p className="text-[10px] leading-tight md:hidden">
                                <strong>Geometría Descriptiva:</strong> Sistema Diédrico interactivo.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6 shrink-0">
                            <nav className="flex items-center gap-3 md:gap-4 text-[10px] font-bold">
                                <Link to="/about" className="hover:text-blue-500 transition-colors">Sobre nosotros</Link>
                                <Link to="/contact" className="hover:text-blue-500 transition-colors">Contacto</Link>
                                <Link to="/privacy" className="hover:text-blue-500 transition-colors hidden sm:block">Privacidad</Link>
                                <Link to="/terms" className="hover:text-blue-500 transition-colors hidden sm:block">Términos</Link>
                            </nav>

                            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                                {countdown > 0 && (
                                    <span className="text-[9px] font-mono opacity-50">
                                        {countdown}s
                                    </span>
                                )}

                                <button
                                    onClick={() => setFooterVisible(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Cerrar"
                                >
                                    <X size={14} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
