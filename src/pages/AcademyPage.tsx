import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useGeometryStore } from '../store/geometryStore';
import { ACADEMY_CONTENT, AcademyTopic, AcademyExercise } from '../data/academyContent';
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

    if (!isPremium) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                        <Lock size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">Academia Premium</h1>
                    <p className="text-gray-400">
                        Accede a cursos completos de Geometría Descriptiva, temario teórico, y ejercicios interactivos listos para resolver en 3D.
                    </p>
                    <button
                        onClick={() => setShowPremiumModal(true)}
                        className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg font-bold text-lg hover:scale-105 transition-transform"
                    >
                        Desbloquear Acceso
                    </button>
                    <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-white underline">
                        Volver al Editor
                    </button>
                </div>
                <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
            </div>
        );
    }

    const loadExercise = (exercise: AcademyExercise) => {
        if (confirm('Esto borrará tu espacio de trabajo actual para cargar el ejercicio. ¿Continuar?')) {
            clearAll();
            setActiveExercise({
                id: exercise.id,
                title: exercise.title,
                statement: exercise.statement,
                solutionHint: exercise.solutionHint
            });
            exercise.setup.forEach(el => {
                // Generate unique ID just in case, though adding without ID usually works if store handles it.
                // Assuming store adds ID. If store replaces IDs, we are good.
                // We clone to avoid mutating the static data
                addElement({ ...el } as any);
            });
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex print:bg-white print:text-black">
            {/* Sidebar Topics */}
            <div className="w-80 border-r border-gray-800 bg-gray-900 p-6 flex flex-col print:hidden">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-800 rounded-lg">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className="text-blue-500" />
                        Academia
                    </h1>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1">
                    {ACADEMY_CONTENT.map(topic => {
                        const isTopicComplete = profile?.completed_topics?.includes(topic.id);
                        return (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic)}
                                className={`w-full text-left p-4 rounded-xl border transition-all relative ${selectedTopic?.id === topic.id
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                                    : 'bg-gray-800 border-transparent hover:bg-gray-800/80 text-gray-400'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold mb-1">{topic.title}</h3>
                                    {isTopicComplete && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                                </div>
                                <p className="text-xs opacity-70 line-clamp-2 pr-4">{topic.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-950 flex flex-col overflow-hidden">
                {selectedTopic && (
                    <div className="h-full overflow-y-auto p-12 max-w-5xl mx-auto w-full custom-scrollbar print:custom-none print:p-0 print:overflow-visible">
                        <div className="mb-8 flex justify-between items-start">
                            <div className="print:w-full">
                                <span className="text-blue-500 font-bold tracking-wider text-sm uppercase print:text-black">Tema Teórico</span>
                                <h2 className="text-4xl font-bold mt-2 mb-4 print:text-black">{selectedTopic.title}</h2>
                                <p className="text-xl text-gray-400 leading-relaxed print:text-gray-600">{selectedTopic.description}</p>
                            </div>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors print:hidden"
                                title="Descargar PDF"
                            >
                                <Printer size={20} />
                                <span className="font-medium">PDF</span>
                            </button>
                        </div>

                        {/* Theory Block - Clickable for Zoom */}
                        <div
                            className="bg-gray-900 rounded-2xl p-8 border border-gray-800 prose prose-invert max-w-none mb-8 print:bg-white print:text-black print:border-none print:prose-black print:p-0 cursor-zoom-in"
                            onClick={handleTheoryClick}
                            dangerouslySetInnerHTML={{ __html: selectedTopic.theoryContent }}
                        />

                        {/* Mark Topic as Completed */}
                        <div className="flex items-center gap-4 mb-12 p-4 bg-gray-900 border border-gray-700 rounded-xl print:hidden">
                            <button
                                onClick={() => {
                                    const isComplete = profile?.completed_topics?.includes(selectedTopic.id);
                                    markTopicComplete(selectedTopic.id, !isComplete);
                                }}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${profile?.completed_topics?.includes(selectedTopic.id)
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {profile?.completed_topics?.includes(selectedTopic.id) ? (
                                    <>
                                        <CheckCircle2 size={24} />
                                        <span className="font-bold">Lección Estudiada</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-500" />
                                        <span>Marcar como Estudiada</span>
                                    </>
                                )}
                            </button>
                            <p className="text-sm text-gray-500">
                                {profile?.completed_topics?.includes(selectedTopic.id)
                                    ? '¡Genial! Has completado la teoría de este tema.'
                                    : 'Marca esta casilla cuando hayas entendido la teoría.'}
                            </p>
                        </div>

                        {/* Lightbox Modal */}
                        {lightboxContent && (
                            <div
                                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 backdrop-blur-md"
                                onClick={() => setLightboxContent(null)}
                            >
                                <div
                                    className="max-w-5xl max-h-[90vh] w-full bg-white/5 rounded-xl p-4 overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl"
                                    onClick={(e) => e.stopPropagation()} // Prevent close on content click? No, let's allow close everywhere except mostly content, but svg clicks might prop. Actually better to just close on outside.
                                >
                                    <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>img]:object-contain [&>img]:max-h-[80vh]" dangerouslySetInnerHTML={{ __html: lightboxContent }} />
                                    <button
                                        onClick={() => setLightboxContent(null)}
                                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
                                    >
                                        <ArrowLeft size={24} /> {/* Using Arrow as Close/Back */}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Exercises */}
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" />
                            Ejercicios Prácticos
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedTopic.exercises.map(ex => {
                                const isCompleted = profile?.completed_exercises?.includes(ex.id);
                                return (
                                    <div key={ex.id} className={`bg-gray-900 border transition-all p-6 rounded-2xl flex flex-col print:bg-white print:border-gray-300 print:text-black hover:border-blue-500/50 ${isCompleted ? 'border-green-500/30 bg-green-900/10' : 'border-gray-800'
                                        }`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${ex.level === 'Fácil' ? 'bg-green-500/20 text-green-400 print:bg-gray-100 print:text-black' :
                                                    ex.level === 'Medio' ? 'bg-yellow-500/20 text-yellow-400 print:bg-gray-100 print:text-black' :
                                                        'bg-red-500/20 text-red-400 print:bg-gray-100 print:text-black'
                                                    }`}>
                                                    {ex.level}
                                                </span>
                                                {isCompleted && (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-500 print:hidden">
                                                        <CheckCircle2 size={12} /> Completado
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => loadExercise(ex)}
                                                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 print:hidden"
                                                title={isCompleted ? "Repetir Ejercicio" : "Resolver en 3D"}
                                            >
                                                <Play size={20} fill="white" className="ml-1" />
                                            </button>
                                        </div>
                                        <h4 className="text-lg font-bold mb-2 print:text-black flex items-center gap-2">
                                            {ex.title}
                                        </h4>
                                        <p className="text-gray-400 text-sm flex-1 mb-4 print:text-gray-700">{ex.statement}</p>

                                        {ex.solutionHint && (
                                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30 print:bg-gray-100 print:border-gray-200">
                                                <p className="text-xs text-blue-300 print:text-black">💡 <b>Pista:</b> {ex.solutionHint}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
