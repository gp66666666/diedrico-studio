// AI Assistant Store - Zustand state management
import { create } from 'zustand';
import type { AIMessage, AIStep, AIConversation } from '../types/ai.types';
import { aiService } from '../services/aiService';
import { aiExecutor } from '../services/executor';

interface AIStore extends AIConversation {
    addMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
    sendPrompt: (prompt: string) => Promise<void>;
    executeSteps: () => Promise<void>;
    executeNextStep: () => Promise<void>;
    reset: () => void;
    setCurrentStep: (stepNumber: number | null) => void;
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

            addMessage({
                role: 'assistant',
                content: response.explanation,
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
}));
