import { useState } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { useUserStore } from '../../store/userStore';
import { X, CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function ExerciseOverlay() {
    const { activeExercise, setActiveExercise } = useGeometryStore();
    const { profile, markExerciseComplete } = useUserStore(); // We need to add markExerciseComplete to store
    const [showHint, setShowHint] = useState(false);

    if (!activeExercise) return null;

    const isCompleted = profile?.completed_exercises?.includes(activeExercise.id);

    const handleComplete = () => {
        if (markExerciseComplete && !isCompleted) {
            markExerciseComplete(activeExercise.id);
        }
    };

    return createPortal(
        <div className="fixed top-20 right-4 z-[50] w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl overflow-hidden transition-all animate-fade-in">
            {/* Header */}
            <div className="bg-blue-600 p-3 flex items-center justify-between text-white">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <HelpCircle size={16} />
                    Ejercicio Activo
                </h3>
                <button
                    onClick={() => setActiveExercise(null)}
                    className="hover:bg-blue-700 p-1 rounded transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{activeExercise.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {activeExercise.statement}
                    </p>
                </div>

                {showHint && activeExercise.solutionHint && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
                        <strong className="block mb-1 flex items-center gap-1"><Lightbulb size={12} /> Pista:</strong>
                        {activeExercise.solutionHint}
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {activeExercise.solutionHint && (
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="flex-1 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                        >
                            {showHint ? 'Ocultar Pista' : 'Ver Pista'}
                        </button>
                    )}

                    <button
                        onClick={handleComplete}
                        disabled={!!isCompleted}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${isCompleted
                                ? 'bg-green-500/20 text-green-600 cursor-default'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {isCompleted ? (
                            <><CheckCircle2 size={14} /> Completado</>
                        ) : (
                            'Marcar Hecho'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
