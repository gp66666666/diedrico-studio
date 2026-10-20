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
        reviewScene,
    } = useAIStore();

    return {
        messages,
        isProcessing,
        currentStep,
        error,
        sendPrompt,
        generateStatement,
        reviewScene,
        executeSteps,
        executeNextStep,
        reset,
        setCurrentStep,
    };
}
