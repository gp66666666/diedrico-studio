import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useGeometryStore } from '../store/geometryStore';
import { ACADEMY_CONTENT } from '../data/academyContent';
import type { AcademyTopic, AcademyExercise } from '../types';
import { BookOpen, Lock, Play, ChevronRight, CheckCircle2, ArrowLeft, Printer } from 'lucide-react';
import PremiumModal from '../components/Auth/PremiumModal';

export default function AcademyPage() {
    const { isPremium, profile, markTopicComplete } = useUserStore();
    const { addElement, clearAll, setActiveExercise } = useGeometryStore();
    const navigate = useNavigate();

    // Premium Modal State
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // Lightbox State for zooming images/diagrams
    const [lightboxContent, setLightboxContent] = useState<string | null>(null);

    const [selectedTopic, setSelectedTopic] = useState<AcademyTopic | null>(ACADEMY_CONTENT[0]);

    // Handle clicks inside theory content to detect images/svgs
    const handleTheoryClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest('svg') || target.closest('img');

        if (clickable) {
            // Clone the node to render in modal
            // For SVGs, we might need to adjust width/height for full screen
            const content = clickable.outerHTML.replace(/width=".*?"/, 'width="100%"').replace(/height=".*?"/, 'height="100%"');
            setLightboxContent(content);
        }
    };

    // Educational content is now available to all users
    // Premium gate removed for testing


    // PDF Download - Using browser print with PDF styling
    const handleDownloadPDF = () => {
        window.print();
    };



    const loadExercise = (exercise: AcademyExercise) => {
        console.log('[loadExercise] Starting with exercise:', exercise);
        console.log('[loadExercise] Setup data:', exercise.setup);

        if (confirm('Esto borrará tu espacio de trabajo actual para cargar el ejercicio. ¿Continuar?')) {
            clearAll();
            console.log('[loadExercise] Cleared all elements');

            setActiveExercise({
                id: exercise.id,
                title: exercise.title,
                statement: exercise.statement,
                solutionHint: exercise.solutionHint
            });
            console.log('[loadExercise] Set active exercise');

            exercise.setup.forEach((el, index) => {
                console.log(`[loadExercise] Adding element ${index}:`, el);
                try {
                    addElement({ ...el } as any);
                    console.log(`[loadExercise] Added element ${index} successfully`);
                } catch (error) {
                    console.error(`[loadExercise] Error adding element ${index}:`, error);
                }
            });

            console.log('[loadExercise] Navigating to /');
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row print:bg-white print:text-black">
            {/* Sidebar Topics */}
            <div className="w-full md:w-80 border-r border-slate-200 bg-white p-6 flex flex-col print:hidden shadow-sm z-10">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <BookOpen className="text-blue-600" />
                        Academia
                    </h1>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                    {ACADEMY_CONTENT.map(topic => {
                        const isTopicComplete = profile?.completed_topics?.includes(topic.id);
                        return (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic)}
                                className={`w-full text-left p-4 rounded-xl border transition-all relative group ${selectedTopic?.id === topic.id
                                    ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 text-slate-600'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold mb-1 ${selectedTopic?.id === topic.id ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'}`}>{topic.title}</h3>
                                    {isTopicComplete && <CheckCircle2 size={16} className="text-green-600 shrink-0" />}
                                </div>
                                <p className={`text-xs line-clamp-2 pr-4 ${selectedTopic?.id === topic.id ? 'text-blue-600/80' : 'text-slate-400 group-hover:text-slate-500'}`}>{topic.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden print:overflow-visible print:block print:bg-white print:h-auto">
                {selectedTopic && (
                    <div className="h-full overflow-y-auto p-4 md:p-12 max-w-5xl mx-auto w-full custom-scrollbar print:custom-none print:p-0 print:overflow-visible print:h-auto print:block">
                        <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4 print:block">
                            <div className="print:w-full print:mb-4">
                                <span className="text-blue-600 font-bold tracking-wider text-sm uppercase print:text-black bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Tema Teórico</span>
                                <h2 className="text-3xl md:text-4xl font-serif font-bold mt-4 mb-4 text-slate-900 print:text-black">{selectedTopic.title}</h2>
                                <p className="text-lg md:text-xl text-slate-600 leading-relaxed print:text-gray-600 font-light">{selectedTopic.description}</p>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all shadow-sm hover:shadow print:hidden whitespace-nowrap"
                                title="Descargar PDF"
                            >
                                <Printer size={20} />
                                <span className="font-medium">Imprimir / PDF</span>
                            </button>
                        </div>

                        {/* Theory Block - Clickable for Zoom */}
                        {typeof selectedTopic.theoryContent === 'string' ? (
                            <div
                                id="theory-content"
                                className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 prose prose-slate max-w-none mb-8 print:bg-white print:text-black print:border-none print:shadow-none print:prose-black print:p-0 cursor-zoom-in font-serif"
                                onClick={handleTheoryClick}
                                dangerouslySetInnerHTML={{ __html: selectedTopic.theoryContent }}
                            />
                        ) : (
                            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 prose prose-slate max-w-none mb-8 print:bg-white print:text-black print:border-none print:shadow-none print:prose-black print:p-0 font-serif">
                                {selectedTopic.theoryContent}
                            </div>
                        )}

                        {/* Mark Topic as Completed */}
                        <div className="flex items-center gap-4 mb-12 p-6 bg-white border border-slate-200 rounded-xl shadow-sm print:hidden">
                            <button
                                onClick={() => {
                                    const isComplete = profile?.completed_topics?.includes(selectedTopic.id);
                                    markTopicComplete(selectedTopic.id, !isComplete);
                                }}
                                className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-medium ${profile?.completed_topics?.includes(selectedTopic.id)
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                    }`}
                            >
                                {profile?.completed_topics?.includes(selectedTopic.id) ? (
                                    <>
                                        <CheckCircle2 size={24} />
                                        <span>Lección Estudiada</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-400" />
                                        <span>Marcar como Estudiada</span>
                                    </>
                                )}
                            </button>
                            <p className="text-sm text-slate-500">
                                {profile?.completed_topics?.includes(selectedTopic.id)
                                    ? '¡Genial! Has completado la teoría de este tema.'
                                    : 'Marca esta casilla cuando hayas entendido la teoría para seguir tu progreso.'}
                            </p>
                        </div>

                        {/* Lightbox Modal */}
                        {lightboxContent && (
                            <div
                                className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm"
                                onClick={() => setLightboxContent(null)}
                            >
                                <div
                                    className="max-w-6xl max-h-[90vh] w-full bg-white rounded-xl p-2 md:p-4 overflow-hidden flex items-center justify-center border border-slate-200 shadow-2xl relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>img]:object-contain [&>img]:max-h-[85vh] bg-white rounded-lg" dangerouslySetInnerHTML={{ __html: lightboxContent }} />
                                    <button
                                        onClick={() => setLightboxContent(null)}
                                        className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full text-slate-800 transition-all shadow-md border border-slate-200"
                                    >
                                        <ArrowLeft size={24} /> {/* Using Arrow as Close/Back */}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Exercises */}
                        <div className="border-t border-slate-200 pt-8 mt-8 print:hidden">
                            <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3 text-slate-800">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <CheckCircle2 size={24} />
                                </div>
                                Ejercicios Prácticos
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedTopic.exercises.map(ex => {
                                    const isCompleted = profile?.completed_exercises?.includes(ex.id);
                                    return (
                                        <div key={ex.id} className={`bg-white border transition-all p-6 rounded-xl flex flex-col hover:shadow-md ${isCompleted ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-blue-300'
                                            }`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${ex.level === 'Fácil' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        ex.level === 'Medio' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                        {ex.level}
                                                    </span>
                                                    {isCompleted && (
                                                        <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                                            <CheckCircle2 size={12} /> Completado
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => loadExercise(ex)}
                                                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-white"
                                                    title={isCompleted ? "Repetir Ejercicio" : "Resolver en 3D"}
                                                >
                                                    <Play size={20} className="ml-1" />
                                                </button>
                                            </div>
                                            <h4 className="text-lg font-bold mb-2 text-slate-800 flex items-center gap-2 font-serif">
                                                {ex.title}
                                            </h4>
                                            <p className="text-slate-600 text-sm flex-1 mb-4 leading-relaxed">{ex.statement}</p>

                                            {ex.solutionHint && (
                                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                    <p className="text-xs text-blue-700">💡 <b>Pista:</b> {ex.solutionHint}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
