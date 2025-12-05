// Gemini AI Service - Legacy Support
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useGeometryStore } from '../../../store/geometryStore';
import type { AIStep, AIResponse } from '../types/ai.types';
import { SYSTEM_PROMPT, FUNCTION_DEFINITIONS } from './prompts';
import { rateLimiter } from './rateLimiter';
import { colorManager } from './colorManager';

const AI_CONFIG = {
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    geminiModel: 'gemini-pro',
};

export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor() {
        if (!AI_CONFIG.geminiApiKey) {
            console.warn('Gemini API key not configured. Legacy features will not work.');
            return;
        }
        this.genAI = new GoogleGenerativeAI(AI_CONFIG.geminiApiKey);
        this.model = this.genAI.getGenerativeModel({
            model: AI_CONFIG.geminiModel,
        });
    }

    async solveExercise(userPrompt: string): Promise<AIResponse> {
        if (!this.model) {
            throw new Error('Gemini API key not configured');
        }
        await rateLimiter.checkLimit();
        colorManager.reset();

        try {
            const chat = this.model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: SYSTEM_PROMPT }],
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Entendido. Estoy listo para resolver ejercicios de Sistema Diédrico paso a paso.' }],
                    },
                ],
                generationConfig: {
                    temperature: 0.1,
                },
            });

            const result = await chat.sendMessage([
                {
                    text: `Resuelve este ejercicio paso a paso:\n\n${userPrompt}\n\nRECUERDA: Usa las funciones disponibles para cada paso de construcción geométrica. Asigna colores automáticamente a cada paso.`
                }
            ]);

            const response = result.response;
            const text = response.text();
            const steps = this.parseResponseToSteps(text);

            return {
                explanation: text,
                steps,
            };
        } catch (error: any) {
            console.error('Gemini API Error:', error);

            if (error.message?.includes('quota') || error.message?.includes('RATE_LIMIT') || error.message?.includes('429')) {
                throw new Error('Has alcanzado el límite de uso de la API. Espera unos minutos e intenta de nuevo.');
            }

            if (error.message?.includes('API key') || error.message?.includes('401')) {
                throw new Error('Problema con la configuración de la API. Verifica que la API key sea válida.');
            }

            throw new Error(`Error al comunicarse con la IA: ${error.message || 'Error desconocido'}. Intenta de nuevo en unos segundos.`);
        }
    }

    private parseResponseToSteps(text: string): AIStep[] {
        const steps: AIStep[] = [];
        const stepRegex = /\*\*Paso (\d+)\*\*:(.+?)(?=\*\*Paso \d+\*\*|$)/gs;
        let stepMatch;

        while ((stepMatch = stepRegex.exec(text)) !== null) {
            const stepNumber = parseInt(stepMatch[1]);
            const description = stepMatch[2].trim();
            const action = this.identifyAction(description);
            const params = this.extractParams(description, action);

            if (action && params) {
                steps.push({
                    id: `step-${stepNumber}`,
                    stepNumber,
                    description,
                    action,
                    params: {
                        ...params,
                        color: colorManager.getColorForStep(stepNumber),
                    },
                    color: colorManager.getColorForStep(stepNumber),
                    status: 'pending',
                });
            }
        }

        return steps;
    }

    private identifyAction(description: string): any {
        const lowerDesc = description.toLowerCase();

        if (lowerDesc.includes('crear punto') || (lowerDesc.includes('punto') && lowerDesc.includes('dado'))) {
            return 'add_point';
        }
        if (lowerDesc.includes('recta') || lowerDesc.includes('línea')) {
            return 'add_line_by_points';
        }
        if (lowerDesc.includes('plano')) {
            return 'add_plane_by_normal';
        }

        return null;
    }

    private extractParams(description: string, action: string): any {
        const coordRegex = /\(([^)]+)\)/g;
        const coords = [];
        let match;

        while ((match = coordRegex.exec(description)) !== null) {
            const values = match[1].split(',').map(v => parseFloat(v.trim()));
            if (values.length === 3 && values.every(v => !isNaN(v))) {
                coords.push(values);
            }
        }

        const nameMatch = description.match(/([A-Z])\s*\(/);
        const name = nameMatch ? nameMatch[1] : 'X';

        switch (action) {
            case 'add_point':
                if (coords.length > 0) {
                    return {
                        name,
                        x: coords[0][0],
                        y: coords[0][1],
                        z: coords[0][2],
                        step_description: description,
                    };
                }
                break;

            case 'add_plane_by_normal':
                if (coords.length > 0) {
                    return {
                        name,
                        normal_x: coords[0][0],
                        normal_y: coords[0][1],
                        normal_z: coords[0][2],
                        constant: 0,
                        step_description: description,
                    };
                }
                break;
        }

        return null;
    }
}


