// useAIAssistant - Main hook for AI assistant functionality
import { useAIStore } from '../store/aiStore';

export function useAIAssistant() {
    const {
        messages,
        isProcessing,
        currentStep,
        error,
        sendPrompt,
        executeSteps,
        executeNextStep,
        reset,
        setCurrentStep,
        generateStatement,
    } = useAIStore();

    return {
        messages,
        isProcessing,
        currentStep,
        error,
        sendPrompt,
        generateStatement,
        executeSteps,
        executeNextStep,
        reset,
        setCurrentStep,
    };
}
