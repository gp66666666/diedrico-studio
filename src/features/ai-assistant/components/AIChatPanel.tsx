// AI Chat Panel - Main UI Component
import { useState } from 'react';
import { Sparkles, Send, PlayCircle, StepForward, RotateCcw, X } from 'lucide-react';
import { useAIAssistant } from '../hooks/useAIAssistant';
import AIMessageBubble from './AIMessageBubble';
import AIStepsList from './AIStepsList';

interface AIChatPanelProps {
    isSidebarOpen?: boolean;
}

export default function AIChatPanel({ isSidebarOpen = false }: AIChatPanelProps) {
    const [input, setInput] = useState('');
    const [isMinimized, setIsMinimized] = useState(true); // Inicia minimizado

    const {
        messages,
        isProcessing,
        currentStep,
        error,
        sendPrompt,
        executeSteps,
        executeNextStep,
        reset,
    } = useAIAssistant();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isProcessing) return;

        await sendPrompt(input);
        setInput('');
    };

    const lastMessage = messages[messages.length - 1];
    const hasSteps = lastMessage?.steps && lastMessage.steps.length > 0;

    if (isMinimized) {
        return (
            <div className={`fixed bottom-24 left-4 md:right-4 md:left-auto z-[60] transition-opacity ${isSidebarOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
                <button
                    onClick={() => setIsMinimized(false)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                    <Sparkles size={24} />
                </button>
            </div>
        );
    }

    return (
        <div className={`fixed bottom-24 left-4 md:right-4 md:left-auto z-50 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-opacity ${isSidebarOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-white" />
                    <h3 className="font-semibold text-white">Asistente IA</h3>
                </div>
                <div className="flex gap-2">
                    {messages.length > 0 && (
                        <button
                            onClick={reset}
                            className="text-white/80 hover:text-white transition-colors"
                            title="Reiniciar conversación"
                        >
                            <RotateCcw size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-white/80 hover:text-white transition-colors"
                        title="Minimizar"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-sm">
                            Escribe un ejercicio de geometría descriptiva
                            <br />
                            y lo resolveré paso a paso
                        </p>
                        <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                            <p>Ejemplo:</p>
                            <p className="italic mt-1">
                                "Por el punto A(-1.4, 6.5, 7.2) hacer pasar un plano perpendicular a P(6.3, 2.8, 8.6)"
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <AIMessageBubble key={message.id} message={message} />
                    ))
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {isProcessing && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                        <span>Pensando...</span>
                    </div>
                )}
            </div>

            {/* Steps Control */}
            {hasSteps && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                    <AIStepsList steps={lastMessage.steps!} currentStep={currentStep} />
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={executeSteps}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <PlayCircle size={18} />
                            <span className="text-sm font-medium">Ejecutar Todo</span>
                        </button>
                        <button
                            onClick={executeNextStep}
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Siguiente paso"
                        >
                            <StepForward size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe un ejercicio..."
                        disabled={isProcessing}
                        className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-gray-900 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isProcessing}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}
