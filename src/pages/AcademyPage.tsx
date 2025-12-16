import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useGeometryStore } from '../store/geometryStore';
import { ACADEMY_CONTENT } from '../data/academyContent';
import type { AcademyTopic, AcademyExercise } from '../types';
import { Sun, Moon, ArrowLeft, BookOpen, CheckCircle2, Printer, Play } from 'lucide-react';
import PremiumModal from '../components/Auth/PremiumModal';

export default function AcademyPage() {
    const user = useUserStore();
    const geom = useGeometryStore();
    const nav = useNavigate();

    const { isPremium, markTopicComplete, profile } = user;

    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [lightboxContent, setLightboxContent] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<AcademyTopic | null>(ACADEMY_CONTENT[0]);

    const isDark = geom.theme === 'dark';

    // Sistema de colores optimizado para mejor contraste y estética
    const bgPrimary = isDark ? 'bg-slate-900' : 'bg-slate-50';
    const bgSecondary = isDark ? 'bg-slate-800/90' : 'bg-white';
    const bgSidebar = isDark ? 'bg-slate-800/95' : 'bg-white';
    const bgCard = isDark ? 'bg-slate-800/80' : 'bg-white';
    const bgHover = isDark ? 'bg-slate-700/80' : 'bg-slate-50';

    const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
    const textSecondary = isDark ? 'text-slate-300' : 'text-slate-600';
    const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
    const textSubtle = isDark ? 'text-slate-500' : 'text-slate-400';

    const borderPrimary = isDark ? 'border-slate-700/80' : 'border-slate-200';
    const borderSecondary = isDark ? 'border-slate-600/50' : 'border-slate-100';
    const borderHover = isDark ? 'border-slate-500' : 'border-slate-300';

    // Colores temáticos con mejor balance
    const blueBg = isDark ? 'bg-blue-900/20' : 'bg-blue-50/80';
    const blueBorder = isDark ? 'border-blue-700/40' : 'border-blue-100';
    const blueText = isDark ? 'text-blue-300' : 'text-blue-700';
    const blueTextDark = isDark ? 'text-blue-200' : 'text-blue-800';

    const greenBg = isDark ? 'bg-emerald-900/20' : 'bg-emerald-50/80';
    const greenBorder = isDark ? 'border-emerald-700/40' : 'border-emerald-200';
    const greenText = isDark ? 'text-emerald-300' : 'text-emerald-700';

    const amberBg = isDark ? 'bg-amber-900/20' : 'bg-amber-50/80';
    const amberBorder = isDark ? 'border-amber-700/40' : 'border-amber-200';
    const amberText = isDark ? 'text-amber-300' : 'text-amber-700';

    const redBg = isDark ? 'bg-red-900/20' : 'bg-red-50/80';
    const redBorder = isDark ? 'border-red-700/40' : 'border-red-200';
    const redText = isDark ? 'text-red-300' : 'text-red-700';

    const buttonHover = isDark ? 'hover:bg-slate-700/60 active:bg-slate-700' : 'hover:bg-slate-100/80 hover:shadow-sm active:bg-slate-200';

    // Header específico
    const headerBorder = isDark ? 'border-slate-700/50' : 'border-slate-200/50';

    const handleTheoryClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest('svg') || target.closest('img');

        if (clickable) {
            const content = clickable.outerHTML
                .replace(/width=".*?"/, 'width="100%"')
                .replace(/height=".*?"/, 'height="100%"');
            setLightboxContent(content);
        }
    };

    useEffect(() => {
        if (!isPremium) {
            setShowPremiumModal(true);
        }
    }, [isPremium]);

    if (!isPremium) {
        return (
            <>
                {showPremiumModal && (
                    <PremiumModal
                        isOpen={true}
                        onClose={() => nav('/')}
                    />
                )}
            </>
        );
    }

    // PDF Download
    const handleDownloadPDF = () => {
        window.print();
    };

    // Load Exercise
    const loadExercise = (exercise: AcademyExercise) => {
        console.log('[loadExercise] Starting with exercise:', exercise);
        console.log('[loadExercise] Setup data:', exercise.setup);

        if (confirm('Esto borrará tu espacio de trabajo actual para cargar el ejercicio. ¿Continuar?')) {
            geom.clearAll();
            console.log('[loadExercise] Cleared all elements');

            geom.setActiveExercise({
                id: exercise.id,
                title: exercise.title,
                statement: exercise.statement,
                solutionHint: exercise.solutionHint
            });
            console.log('[loadExercise] Set active exercise');

            exercise.setup.forEach((el, index) => {
                console.log(`[loadExercise] Adding element ${index}:`, el);
                try {
                    geom.addElement({ ...el } as any);
                    console.log(`[loadExercise] Added element ${index} successfully`);
                } catch (error) {
                    console.error(`[loadExercise] Error adding element ${index}:`, error);
                }
            });

            console.log('[loadExercise] Navigating to /');
            nav('/');
        }
    };

    // Obtener el contenido teórico (usa theoryContent si existe, sino theory)
    const getTheoryContent = (topic: AcademyTopic) => {
        // Primero intenta con theoryContent (que puede ser string o ReactNode)
        if (topic.theoryContent) {
            return topic.theoryContent;
        }
        // Si no, usa theory (que siempre es string según tu tipo)
        return topic.theory;
    };

    return (
        <div className={`min-h-screen ${bgPrimary} ${textPrimary} flex flex-col md:flex-row print:bg-white print:text-black transition-colors duration-300`}>
            {/* Sidebar Topics - Mejorado */}
            <div className={`w-full md:w-80 border-r ${borderPrimary} ${bgSidebar} p-6 flex flex-col print:hidden shadow-sm z-10 transition-colors duration-300 backdrop-blur-sm`}>
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => nav('/')}
                        className={`p-2 rounded-lg ${textSecondary} transition-all ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100'}`}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className={isDark ? "text-blue-400" : "text-blue-600"} />
                        <span>Academia</span>
                    </h1>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                    {ACADEMY_CONTENT.map(topic => {
                        const isTopicComplete = profile?.completed_topics?.includes(topic.id);
                        const isSelected = selectedTopic?.id === topic.id;

                        return (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic)}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 relative group ${isSelected
                                    ? `${isDark ? 'bg-blue-900/30 border-blue-600/50 text-blue-100 shadow-md' : 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm'}`
                                    : `${bgCard} border ${borderSecondary} hover:border ${borderHover} ${textSecondary} hover:${bgHover} hover:shadow-sm`
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold mb-2 ${isSelected
                                        ? (isDark ? 'text-blue-100' : 'text-blue-800')
                                        : (isDark ? 'text-slate-200 group-hover:text-slate-100' : 'text-slate-800 group-hover:text-slate-900')}`}>
                                        {topic.title}
                                    </h3>
                                    {isTopicComplete && (
                                        <CheckCircle2 size={16} className={`shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                    )}
                                </div>
                                <p className={`text-sm line-clamp-2 pr-4 ${isSelected
                                    ? (isDark ? 'text-blue-300/90' : 'text-blue-600/90')
                                    : (isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-600')}`}>
                                    {topic.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content - Rediseñado */}
            <div className={`flex-1 ${bgPrimary} flex flex-col overflow-hidden print:overflow-visible print:block print:bg-white print:h-auto transition-colors duration-300`}>
                {selectedTopic && (
                    <div className="h-full overflow-y-auto p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full custom-scrollbar print:custom-none print:p-0 print:overflow-visible print:h-auto print:block">
                        {/* Header elegante */}
                        <div className={`flex items-center justify-between mb-8 pb-4 border-b ${headerBorder} print:hidden`}>
                            <div>
                                <h2 className="text-2xl font-bold">Academia</h2>
                                <p className={`text-sm mt-1 ${textSubtle}`}>Aprende geometría descriptiva paso a paso</p>
                            </div>
                            <button
                                onClick={geom.toggleTheme}
                                className={`p-2.5 rounded-xl transition-all ${buttonHover} border ${borderSecondary}`}
                                title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                                aria-label="Cambiar tema"
                            >
                                {isDark ? (
                                    <Sun size={20} className="text-amber-300" />
                                ) : (
                                    <Moon size={20} className="text-slate-600" />
                                )}
                            </button>
                        </div>

                        {/* Encabezado del tema */}
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-3 mb-6">
                                <span className={`${blueTextDark} font-semibold tracking-wider text-xs uppercase ${blueBg} px-3 py-1.5 rounded-full border ${blueBorder} backdrop-blur-sm`}>
                                    Tema Teórico
                                </span>
                                <span className={`text-xs ${textSubtle}`}>• {selectedTopic.category}</span>
                            </div>
                            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 print:text-black ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                                {selectedTopic.title}
                            </h1>
                            <p className={`text-lg md:text-xl ${textSecondary} leading-relaxed max-w-3xl print:text-gray-600 font-light`}>
                                {selectedTopic.description}
                            </p>
                        </div>

                        {/* Botón PDF flotante */}
                        <div className="sticky top-4 z-10 flex justify-end mb-6 print:hidden">
                            <button
                                onClick={handleDownloadPDF}
                                className={`flex items-center gap-2 px-5 py-2.5 ${bgSecondary} border ${borderPrimary} ${textSecondary} rounded-xl transition-all ${buttonHover} shadow-sm backdrop-blur-sm`}
                                title="Descargar PDF"
                            >
                                <Printer size={18} />
                                <span className="font-medium">Imprimir / PDF</span>
                            </button>
                        </div>

                        {/* Theory Block - Mejorado */}
                        {(() => {
                            const theoryContent = getTheoryContent(selectedTopic);

                            if (typeof theoryContent === 'string') {
                                return (
                                    <div
                                        id="theory-content"
                                        className={`${bgCard} rounded-2xl p-6 md:p-8 lg:p-10 shadow-sm border ${borderSecondary} prose max-w-none mb-10 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 cursor-zoom-in font-serif transition-all duration-300 ${isDark
                                            ? 'prose-invert prose-headings:text-slate-100 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-blue-300'
                                            : 'prose-slate prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-blue-700'
                                            } academy-content`}
                                        onClick={handleTheoryClick}
                                        dangerouslySetInnerHTML={{ __html: theoryContent }}
                                    />
                                );
                            } else {
                                return (
                                    <div className={`${bgCard} rounded-2xl p-6 md:p-8 lg:p-10 shadow-sm border ${borderSecondary} prose max-w-none mb-10 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 font-serif transition-all duration-300 ${isDark
                                        ? 'prose-invert prose-headings:text-slate-100 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-blue-300'
                                        : 'prose-slate prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-blue-700'
                                        } academy-content`}>
                                        {theoryContent}
                                    </div>
                                );
                            }
                        })()}

                        {/* Marcar como completado - Rediseñado */}
                        <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 p-6 ${bgCard} border ${borderPrimary} rounded-2xl shadow-sm print:hidden transition-all duration-300 backdrop-blur-sm`}>
                            <div className="flex-1">
                                <h4 className={`font-semibold mb-2 ${textPrimary}`}>
                                    {profile?.completed_topics?.includes(selectedTopic.id)
                                        ? '🎉 ¡Lección Dominada!'
                                        : '📚 ¿Has entendido la teoría?'}
                                </h4>
                                <p className={`text-sm ${textMuted}`}>
                                    {profile?.completed_topics?.includes(selectedTopic.id)
                                        ? 'Has completado exitosamente este tema teórico.'
                                        : 'Marca como estudiado para seguir tu progreso.'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    const isComplete = profile?.completed_topics?.includes(selectedTopic.id);
                                    markTopicComplete(selectedTopic.id, !isComplete);
                                }}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${profile?.completed_topics?.includes(selectedTopic.id)
                                    ? `${greenBg} ${greenText} hover:${isDark ? 'bg-emerald-800/40' : 'bg-emerald-100'} border ${greenBorder} shadow-sm`
                                    : `${isDark ? 'bg-slate-700/50' : 'bg-slate-100'} ${textSecondary} hover:${isDark ? 'bg-slate-700' : 'bg-slate-200'} border ${borderPrimary}`
                                    }`}
                            >
                                {profile?.completed_topics?.includes(selectedTopic.id) ? (
                                    <>
                                        <CheckCircle2 size={20} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                                        <span>Completado</span>
                                    </>
                                ) : (
                                    <>
                                        <div className={`w-5 h-5 rounded-full border-2 ${isDark ? 'border-slate-400' : 'border-slate-400'}`} />
                                        <span>Marcar como Estudiado</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Lightbox Modal */}
                        {lightboxContent && (
                            <div
                                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-lg"
                                onClick={() => setLightboxContent(null)}
                            >
                                <div
                                    className="max-w-6xl max-h-[90vh] w-full bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 overflow-hidden flex items-center justify-center border border-slate-300 dark:border-slate-700 shadow-2xl relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div
                                        className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>img]:object-contain [&>img]:max-h-[85vh] bg-white dark:bg-slate-800 rounded-lg"
                                        dangerouslySetInnerHTML={{ __html: lightboxContent }}
                                    />
                                    <button
                                        onClick={() => setLightboxContent(null)}
                                        className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 p-2.5 rounded-full text-slate-800 dark:text-slate-200 transition-all shadow-lg border border-slate-200 dark:border-slate-700"
                                    >
                                        <ArrowLeft size={22} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Exercises Section - Mejorada */}
                        <div className={`border-t ${borderPrimary} pt-10 mt-8 print:hidden transition-colors duration-300`}>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className={`text-2xl font-serif font-bold mb-2 ${textPrimary}`}>
                                        Ejercicios Prácticos
                                    </h3>
                                    <p className={`text-sm ${textMuted}`}>
                                        Aplica lo aprendido con ejercicios interactivos
                                    </p>
                                </div>
                                <div className={`text-sm ${textSubtle}`}>
                                    {selectedTopic.exercises.length} ejercicio{selectedTopic.exercises.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {selectedTopic.exercises.map(ex => {
                                    const isCompleted = profile?.completed_exercises?.includes(ex.id);

                                    // Sistema de niveles mejorado
                                    const getLevelClasses = (level: string) => {
                                        if (level === 'Fácil') {
                                            return {
                                                bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
                                                text: isDark ? 'text-emerald-300' : 'text-emerald-700',
                                                border: isDark ? 'border-emerald-700/40' : 'border-emerald-200',
                                                icon: isDark ? '🌱' : '🌱'
                                            };
                                        } else if (level === 'Medio') {
                                            return {
                                                bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50',
                                                text: isDark ? 'text-amber-300' : 'text-amber-700',
                                                border: isDark ? 'border-amber-700/40' : 'border-amber-200',
                                                icon: isDark ? '⚡' : '⚡'
                                            };
                                        } else {
                                            return {
                                                bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
                                                text: isDark ? 'text-red-300' : 'text-red-700',
                                                border: isDark ? 'border-red-700/40' : 'border-red-200',
                                                icon: isDark ? '🔥' : '🔥'
                                            };
                                        }
                                    };

                                    const level = getLevelClasses(ex.level);

                                    return (
                                        <div
                                            key={ex.id}
                                            className={`${bgCard} border ${borderPrimary} transition-all p-6 rounded-2xl flex flex-col hover:shadow-lg hover:border ${borderHover} group ${isCompleted
                                                ? (isDark ? 'border-emerald-700/50' : 'border-emerald-200')
                                                : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${level.bg} ${level.text} ${level.border}`}>
                                                        <span className="mr-1.5">{level.icon}</span>
                                                        {ex.level}
                                                    </span>
                                                    {isCompleted && (
                                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                                                            <CheckCircle2 size={12} /> Completado
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => loadExercise(ex)}
                                                    className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 text-white transform hover:scale-105"
                                                    title={isCompleted ? 'Repetir Ejercicio' : 'Resolver en 3D'}
                                                >
                                                    <Play size={20} className="ml-1" />
                                                </button>
                                            </div>
                                            <h4 className={`text-lg font-bold mb-3 ${textPrimary} font-serif`}>
                                                {ex.title}
                                            </h4>
                                            <p className={`${textSecondary} text-sm flex-1 mb-5 leading-relaxed`}>
                                                {ex.statement}
                                            </p>

                                            {ex.solutionHint && (
                                                <div className={`mt-auto pt-4 border-t ${borderSecondary}`}>
                                                    <div className={`${isDark ? 'bg-blue-900/20' : 'bg-blue-50/80'} p-3.5 rounded-xl border ${isDark ? 'border-blue-800/40' : 'border-blue-100'}`}>
                                                        <p className={`text-sm flex items-start gap-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                                            <span className={`text-base ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>💡</span>
                                                            <span><b className="font-semibold">Pista:</b> {ex.solutionHint}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mensaje cuando no hay ejercicios */}
                            {selectedTopic.exercises.length === 0 && (
                                <div className={`text-center py-12 ${textMuted} border ${borderPrimary} rounded-2xl ${bgCard}`}>
                                    <div className="text-4xl mb-3">📚</div>
                                    <p className="text-lg">Próximamente más ejercicios para este tema</p>
                                    <p className="text-sm mt-2">Sigue practicando con los temas disponibles</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}