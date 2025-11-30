// AI Service Wrapper - Supports both Gemini and Groq
import { AI_CONFIG } from '../../../config/features';
import { GeminiService } from './gemini';
import { GroqService } from './groq';
import type { GeminiResponse } from '../types/ai.types';

class AIService {
    private service: GeminiService | GroqService;

    constructor() {
        if (AI_CONFIG.provider === 'groq') {
            this.service = new GroqService(AI_CONFIG.groqApiKey);
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
