// AI Assistant Store - Zustand state management
import { create } from 'zustand';
import type { AIMessage, AIStep, AIConversation } from '../types/ai.types';
import { aiService } from '../services/aiService';
import { aiExecutor } from '../services/executor';

interface AIStore extends AIConversation {
    addMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
    sendPrompt: (prompt: string) => Promise<void>;
    generateStatement: (prompt: string) => Promise<void>;
    executeSteps: () => Promise<void>;
    executeNextStep: () => Promise<void>;
    reset: () => void;
    setCurrentStep: (stepNumber: number | null) => void;
    generateExercise: (prompt: string) => Promise<string>;
}

/** Saca `{"statement": "..."}` de la respuesta del generador; si no hay JSON, usa el texto. */
function extractStatement(text: string): string {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');

    if (first !== -1 && last > first) {
        try {
            const parsed = JSON.parse(text.slice(first, last + 1));
            if (typeof parsed?.statement === 'string' && parsed.statement.trim()) {
                return parsed.statement.trim();
            }
        } catch {
            // no era JSON: se devuelve el texto tal cual
        }
    }

    return text.trim();
}

export const useAIStore = create<AIStore>((set, get) => ({
    messages: [],
    isProcessing: false,
    currentStep: null,
    error: null,

    addMessage: (message) => {
        const newMessage: AIMessage = {
            ...message,
            id: `msg-${Date.now()}`,
            timestamp: Date.now(),
        };

        set((state) => ({
            messages: [...state.messages, newMessage],
        }));
    },

    sendPrompt: async (prompt) => {
        const { addMessage } = get();

        try {
            set({ isProcessing: true, error: null });

            addMessage({
                role: 'user',
                content: prompt,
            });

            const response = await aiService.solveExercise(prompt);

            // Si el modelo solo devolvió JSON, el texto queda vacío: mejor un
            // resumen que una burbuja en blanco.
            const explanation = (response.explanation || '').trim();
            const fallback = response.steps?.length
                ? `He preparado ${response.steps.length} ${response.steps.length === 1 ? 'paso' : 'pasos'}. Pulsa «Ejecutar Todo» para dibujarlo.`
                : 'No he podido interpretar el ejercicio. Prueba a describirlo con más detalle.';

            addMessage({
                role: 'assistant',
                content: explanation || fallback,
                steps: response.steps,
            });

            set({ isProcessing: false });
        } catch (error: any) {
            set({
                isProcessing: false,
                error: error.message || 'Error desconocido',
            });

            addMessage({
                role: 'assistant',
                content: `❌ Error: ${error.message}`,
            });
        }
    },

    /**
     * Modo "crear ejercicio": el modelo inventa un enunciado (no lo resuelve).
     * Se guarda en el chat como mensaje `variant: 'statement'` para poder resolverlo después.
     */
    generateStatement: async (prompt) => {
        const { addMessage } = get();

        try {
            set({ isProcessing: true, error: null });
            addMessage({ role: 'user', content: prompt });

            const { EXERCISE_GENERATOR_PROMPT } = await import('../services/prompts');
            const response = await aiService.solveExercise(prompt, EXERCISE_GENERATOR_PROMPT);

            addMessage({
                role: 'assistant',
                content: extractStatement(response.explanation),
                variant: 'statement',
            });

            set({ isProcessing: false });
        } catch (error: any) {
            set({
                isProcessing: false,
                error: error.message || 'Error desconocido',
            });
            addMessage({
                role: 'assistant',
                content: `❌ Error: ${error.message}`,
            });
        }
    },

    executeSteps: async () => {
        const { messages } = get();
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage?.steps || lastMessage.role !== 'assistant') {
            return;
        }

        try {
            set({ isProcessing: true });

            for (let i = 0; i < lastMessage.steps.length; i++) {
                const step = lastMessage.steps[i];
                set({ currentStep: step.stepNumber });

                step.status = 'executing';
                await aiExecutor.executeStep(step);
                step.status = 'completed';

                await new Promise((resolve) => setTimeout(resolve, 800));
            }

            set({ isProcessing: false, currentStep: null });
        } catch (error: any) {
            set({
                isProcessing: false,
                currentStep: null,
                error: error.message,
            });
        }
    },

    executeNextStep: async () => {
        const { messages, currentStep } = get();
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage?.steps || lastMessage.role !== 'assistant') return;

        const nextStepNumber = currentStep === null ? 1 : currentStep + 1;
        const step = lastMessage.steps.find((s) => s.stepNumber === nextStepNumber);

        if (!step) return;

        try {
            set({ isProcessing: true, currentStep: nextStepNumber });

            step.status = 'executing';
            await aiExecutor.executeStep(step);
            step.status = 'completed';

            set({ isProcessing: false });
        } catch (error: any) {
            step.status = 'error';
            step.error = error.message;
            set({ isProcessing: false, error: error.message });
        }
    },

    setCurrentStep: (stepNumber) => {
        set({ currentStep: stepNumber });
    },

    reset: () => {
        set({
            messages: [],
            isProcessing: false,
            currentStep: null,
            error: null,
        });
    },

    generateExercise: async (prompt: string) => {
        const { addMessage } = get();
        try {
            set({ isProcessing: true, error: null });

            const { EXERCISE_GENERATOR_PROMPT } = await import('../services/prompts');
            const response = await aiService.solveExercise(prompt, EXERCISE_GENERATOR_PROMPT);

            set({ isProcessing: false });

            // The response.explanation SHOULD be a JSON string now
            try {
                // More robust extraction: find the first { and the last }
                const firstBrace = response.explanation.indexOf('{');
                const lastBrace = response.explanation.lastIndexOf('}');

                if (firstBrace === -1 || lastBrace === -1) {
                    throw new Error("No JSON object found in response");
                }

                const jsonStr = response.explanation.substring(firstBrace, lastBrace + 1);
                const parsed = JSON.parse(jsonStr);
                return JSON.stringify(parsed);
            } catch (e) {
                console.error("Failed to parse AI exercise JSON:", e);
                // Fallback for unexpected format
                return JSON.stringify({
                    statement: response.explanation,
                    steps: []
                });
            }
        } catch (error: any) {
            set({ isProcessing: false, error: error.message });
            return JSON.stringify({ error: error.message });
        }
    },
}));
