import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useGeometryStore } from '../store/geometryStore';
import { ACADEMY_CONTENT, AcademyTopic, AcademyExercise } from '../data/academyContent';
import { BookOpen, Lock, Play, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import PremiumModal from '../components/Auth/PremiumModal';

export default function AcademyPage() {
    const { isPremium } = useUserStore();
    const { addElement, clearAll } = useGeometryStore();
    const navigate = useNavigate();

    // Premium Modal State (if user tries to access restricted content) -- 
    // Actually we block the whole page if not premium, or just show blur.
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState<AcademyTopic | null>(ACADEMY_CONTENT[0]);

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
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar Topics */}
            <div className="w-80 border-r border-gray-800 bg-gray-900 p-6 flex flex-col">
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
                    {ACADEMY_CONTENT.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTopic?.id === topic.id
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                                    : 'bg-gray-800 border-transparent hover:bg-gray-800/80 text-gray-400'
                                }`}
                        >
                            <h3 className="font-bold mb-1">{topic.title}</h3>
                            <p className="text-xs opacity-70 line-clamp-2">{topic.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-950 flex flex-col overflow-hidden">
                {selectedTopic && (
                    <div className="h-full overflow-y-auto p-12 max-w-5xl mx-auto w-full custom-scrollbar">
                        <div className="mb-8">
                            <span className="text-blue-500 font-bold tracking-wider text-sm uppercase">Tema Teórico</span>
                            <h2 className="text-4xl font-bold mt-2 mb-4">{selectedTopic.title}</h2>
                            <p className="text-xl text-gray-400 leading-relaxed">{selectedTopic.description}</p>
                        </div>

                        {/* Theory Block */}
                        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 prose prose-invert max-w-none mb-12">
                            <div dangerouslySetInnerHTML={{ __html: selectedTopic.theoryContent }} />
                        </div>

                        {/* Exercises */}
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" />
                            Ejercicios Prácticos
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedTopic.exercises.map(ex => (
                                <div key={ex.id} className="bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-colors p-6 rounded-2xl flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ex.level === 'Fácil' ? 'bg-green-500/20 text-green-400' :
                                                ex.level === 'Medio' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {ex.level}
                                        </span>
                                        <button
                                            onClick={() => loadExercise(ex)}
                                            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                                            title="Resolver en 3D"
                                        >
                                            <Play size={20} fill="white" className="ml-1" />
                                        </button>
                                    </div>
                                    <h4 className="text-lg font-bold mb-2">{ex.title}</h4>
                                    <p className="text-gray-400 text-sm flex-1 mb-4">{ex.statement}</p>

                                    {ex.solutionHint && (
                                        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
                                            <p className="text-xs text-blue-300">💡 <b>Pista:</b> {ex.solutionHint}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
