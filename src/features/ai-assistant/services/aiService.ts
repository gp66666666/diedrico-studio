// AI Service Wrapper
// No hay claves de IA en el cliente: Groq se llama a través de la Edge Function
// `ai-proxy` (supabase/functions/ai-proxy), que guarda la key como secreto.
import { GroqService } from './groq';
import type { AIResponse } from '../types/ai.types';

export class AIService {
    private service: GroqService;

    constructor() {
        this.service = new GroqService();
    }

    async solveExercise(prompt: string, systemPromptOverride?: string): Promise<AIResponse> {
        return this.service.solveExercise(prompt, systemPromptOverride);
    }

    async scanImage(imageData: string): Promise<AIResponse> {
        return this.service.scanImage(imageData);
    }
}

export const aiService = new AIService();
