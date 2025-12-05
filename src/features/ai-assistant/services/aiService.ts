// AI Service Wrapper - Supports both Gemini and Groq
import { GroqService } from './groq';
import { GeminiService } from './gemini';
import { useUserStore } from '../../../store/userStore';
import type { AIResponse } from '../types/ai.types';

const AI_CONFIG = {
    groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '', // Legacy
};

export class AIService {
    private service: GeminiService | GroqService;

    constructor() {
        // Default to Groq
        if (AI_CONFIG.groqApiKey) {
            this.service = new GroqService(AI_CONFIG.groqApiKey);
        } else {
            console.warn('Groq API key not found, falling back to Gemini/Legacy');
            this.service = new GeminiService();
        }
    }

    async solveExercise(prompt: string): Promise<AIResponse> {
        return this.service.solveExercise(prompt);
    }
}

export const aiService = new AIService();
