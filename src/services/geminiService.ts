import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeometryElement } from '../types';

// Initialize Gemini - user will add API key via .env
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface AIResponse {
    elements: Omit<GeometryElement, 'id' | 'visible'>[];
    explanation: string;
    error?: string;
}

export async function solveGeometryProblem(userPrompt: string): Promise<AIResponse> {
    if (!genAI || !API_KEY) {
        return {
            elements: [],
            explanation: '',
            error: 'Por favor, añade tu API key de Gemini en el archivo .env:\nVITE_GEMINI_API_KEY=tu_clave_aqui\n\nConsigue una gratis en: https://ai.google.dev/'
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemPrompt = `Eres un asistente experto en geometría analítica 3D y sistema diédrico.

Dado un problema de geometría, debes:
1. Resolver el problema matemáticamente
2. Devolver los elementos geométricos (puntos, rectas, planos) necesarios en formato JSON
3. Explicar la solución paso a paso

FORMATO DE RESPUESTA (responde SOLO con JSON válido):
{
  "elements": [
    {"type": "point", "name": "A", "coords": {"x": 0, "y": 0, "z": 0}},
    {"type": "line", "name": "r", "point": {"x": 0, "y": 0, "z": 0}, "direction": {"x": 1, "y": 1, "z": 1}},
    {"type": "plane", "name": "P", "normal": {"x": 0, "y": 0, "z": 1}, "constant": -5}
  ],
  "explanation": "Explicación paso a paso aquí"
}

REGLAS:
- Para planos simples como "z=5", usa: normal {x:0,y:0,z:1}, constant: -5
- Para planos "x=3", usa: normal {x:1,y:0,z:0}, constant: -3
- Para planos "y=2", usa: normal {x:0,y:1,z:0}, constant: -2
- Normaliza todos los vectores dirección y normales
- Usa nombres cortos (A, B, r, s, π, P, etc.)
- La explicación debe ser clara para estudiantes`;

        const result = await model.generateContent([systemPrompt, userPrompt]);
        const responseText = result.response.text();

        // Extract JSON from markdown code blocks if present
        let jsonText = responseText.trim();
        const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (codeBlockMatch) {
            jsonText = codeBlockMatch[1];
        }

        const parsed = JSON.parse(jsonText);

        const elementsWithColors = parsed.elements.map((el: any) => ({
            ...el,
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
        }));

        return {
            elements: elementsWithColors,
            explanation: parsed.explanation || 'Solución generada',
            error: undefined
        };

    } catch (error) {
        console.error('Error al procesar con Gemini:', error);
        return {
            elements: [],
            explanation: '',
            error: error instanceof Error ? error.message : 'Error desconocido al procesar el problema'
        };
    }
}
