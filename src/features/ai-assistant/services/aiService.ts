// AI Service Wrapper - Supports both Gemini and Groq
import { AI_CONFIG } from '../../../config/features';
import { GeminiService } from './gemini';
import { GroqService } from './groq';
import type { GeminiResponse } from '../types/ai.types';

class AIService {
    private service: GeminiService | GroqService;

    constructor() {
        if (AI_CONFIG.provider === 'groq') {
            // Ensure API key exists, otherwise warn and use empty string (service handles it)
            const apiKey = AI_CONFIG.groqApiKey || '';
            if (!apiKey) {
                console.warn('Groq API Key is missing. AI features will not work.');
            }
            this.service = new GroqService(apiKey);
        } else {
            this.service = new GeminiService();
        }
    }

    async solveExercise(prompt: string): Promise<GeminiResponse> {
        return this.service.solveExercise(prompt);
    }
}

export const aiService = new AIService();
export { aiService as geminiService }; // Backward compatibility
