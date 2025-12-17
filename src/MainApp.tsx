import { useState } from 'react';
import { Box, FileText, PenTool, Menu, X } from 'lucide-react';
import Scene from './components/Scene';
import Sidebar from './components/Sidebar';
import DiedricoView from './components/DiedricoView';
import SEO from './components/SEO';
import { useGeometryStore } from './store/geometryStore';
import { useUserStore } from './store/userStore';
import { FEATURES } from './config/features';
import { AIChatPanel } from './features/ai-assistant';
import { useThemeSync, useThemeInitializer } from './hooks/useThemeSync';
// AdBanner import removed

export default function MainApp() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, viewMode, setViewMode } = useGeometryStore();
    const { isPremium } = useUserStore();
    const isDark = theme === 'dark';
    
    // Inicializar y sincronizar el tema
    useThemeInitializer();
    useThemeSync();

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
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`md:hidden absolute top-4 left-4 z-50 p-2 rounded-lg backdrop-blur-md border transition-colors ${tabBg} ${textMain}`}
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Sidebar Wrapper */}
                    <div className={`
                    fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl md:shadow-none
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                        <Sidebar />
                    </div>

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
                        </div>

                        {/* View Content */}
                        <div key={viewMode} className="flex-1 relative w-full h-full animate-fade-in">
                            {viewMode === '3d' ? (
                                <>
                                    <Scene />
                                    {/* Instructions overlay (only for 3D) */}
                                    <div className={`absolute top-16 left-4 md:top-4 md:left-4 backdrop-blur-md p-3 rounded-xl border max-w-xs pointer-events-none transition-colors ${overlayBg}`}>
                                        <h3 className={`font-bold text-sm mb-1 ${textMain}`}>📐 Diédrico Studio</h3>


                                    </div>
                                </>
                            ) : (
                                <DiedricoView mode={viewMode} isSidebarOpen={isSidebarOpen} />
                            )}
                        </div>
                    </div>

                    {/* AI Assistant Panel - Premium Only */}
                    {FEATURES.AI_ASSISTANT && isPremium && <AIChatPanel isSidebarOpen={isSidebarOpen} />}

                    {/* Watermark */}
                    <div className={`absolute bottom-2 right-4 text-[10px] md:text-xs font-medium opacity-50 pointer-events-none z-50 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Hecho por Eloi García
                    </div>
                </div>

                {/* Ad Banner Removed for Policy Compliance */}
            </div>
        </>
    );
}
