// Groq AI Service - Alternative to Gemini
import { colorManager } from './colorManager';
import { rateLimiter } from './rateLimiter';
import type { AIStep, GeminiResponse, AIAction } from '../types/ai.types';
import { SYSTEM_PROMPT, FUNCTION_DEFINITIONS } from './prompts';
import { useGeometryStore } from '../../../store/geometryStore';

export class GroqService {
    private apiKey: string;
    private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async solveExercise(userPrompt: string): Promise<GeminiResponse> {
        await rateLimiter.checkLimit();
        colorManager.reset();

        // 1. Get Current Context (The "Vision" of the AI)
        const elements = useGeometryStore.getState().elements;
        const contextDescription = elements.length > 0
            ? "ELEMENTOS EN EL LIENZO:\n" + elements.map(el => {
                if (el.type === 'point') return `- Punto ${el.name} (${(el as any).coords.x}, ${(el as any).coords.y}, ${(el as any).coords.z})`;
                if (el.type === 'line') return `- Recta ${el.name} (Pasa por ${(el as any).point.x},${(el as any).point.y},${(el as any).point.z})`;
                if (el.type === 'plane') return `- Plano ${el.name}`;
                return `- ${el.type} ${el.name}`;
            }).join('\n')
            : "Lienzo vacío.";

        const fullSystemPrompt = SYSTEM_PROMPT +
            "\n\nCONTEXTO ACTUAL (LO QUE YA EXISTE):\n" + contextDescription +
            "\n\nDEFINICIONES DE FUNCIONES DISPONIBLES (ÚSALAS):\n" + JSON.stringify(FUNCTION_DEFINITIONS);

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: fullSystemPrompt
                        },
                        {
                            role: 'user',
                            content: userPrompt
                        }
                    ],
                    // ... remainder of file unchanged
                    temperature: 0.1,
                    max_tokens: 2000,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error calling Groq API');
            }

            const data = await response.json();
            const text = data.choices[0].message.content;

            console.log('Groq Response:', text);

            const steps = this.parseResponseToSteps(text);

            // Clean text for display: Remove JSON blocks
            const cleanText = text.replace(/```json\s*[\s\S]*?```/g, '').trim();

            console.log('Parsed Steps:', steps);

            return {
                explanation: cleanText || "¡Hecho! Aquí tienes la construcción.", // Fallback if text is empty
                steps,
            };
        } catch (error: any) {
            console.error('Groq API Error:', error);

            if (error.message?.includes('quota') || error.message?.includes('rate')) {
                throw new Error('Límite de API alcanzado. Espera unos segundos.');
            }

            if (error.message?.includes('auth') || error.message?.includes('401')) {
                throw new Error('API key inválida. Verifica tu configuración.');
            }

            throw new Error(`Error de IA: ${error.message || 'Desconocido'}`);
        }
    }

    private parseResponseToSteps(text: string): AIStep[] {
        const steps: AIStep[] = [];

        // 1. Try to parse JSON blocks first (Robust method)
        const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
        let jsonMatch;
        let stepCount = 0;

        while ((jsonMatch = jsonBlockRegex.exec(text)) !== null) {
            try {
                const jsonContent = jsonMatch[1].trim();
                const stepData = JSON.parse(jsonContent);

                if (stepData.name && stepData.params) {
                    stepCount++;
                    steps.push({
                        id: `step-${stepCount}`,
                        stepNumber: stepCount,
                        description: stepData.params.step_description || `Paso ${stepCount}`,
                        action: stepData.name,
                        params: {
                            ...stepData.params,
                            color: colorManager.getColorForStep(stepCount),
                        },
                        color: colorManager.getColorForStep(stepCount),
                        status: 'pending',
                    });
                }
            } catch (e) {
                console.error('Error parsing JSON step:', e);
            }
        }

        // If JSON blocks found, return them
        if (steps.length > 0) {
            return steps;
        }

        // 1.5 Try to find raw JSON object in text (if model forgot code blocks)
        try {
            // Find first '{' and last '}'
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                const potentialJson = text.substring(firstBrace, lastBrace + 1);
                const data = JSON.parse(potentialJson);

                // Handle different JSON formats the model might return
                let stepData = data;

                // Case A: Model returns OpenAI function calling format (as seen in screenshot)
                if (data.type === 'function' && data.name && data.parameters) {
                    // Normalize parameters: recursively extract 'value' if present
                    const normalizeParams = (params: any) => {
                        const newParams: any = {};
                        for (const key in params) {
                            if (params[key] && typeof params[key] === 'object' && 'value' in params[key]) {
                                newParams[key] = params[key].value;
                            } else {
                                newParams[key] = params[key];
                            }
                        }
                        return newParams;
                    };

                    stepData = {
                        name: data.name,
                        params: normalizeParams(data.parameters)
                    };
                }

                if (stepData.name && stepData.params) {
                    steps.push({
                        id: `step-1`,
                        stepNumber: 1,
                        description: stepData.params.step_description || "Paso generado por IA",
                        action: stepData.name,
                        params: {
                            ...stepData.params,
                            color: colorManager.getColorForStep(1),
                        },
                        color: colorManager.getColorForStep(1),
                        status: 'pending',
                    });
                    return steps;
                }
            }
        } catch (e) {
            console.warn('Failed to parse raw JSON fallback', e);
        }

        // 2. Fallback to legacy text parsing (Fragile method)
        console.warn('No JSON blocks found, falling back to text parsing');
        const stepRegex = /\*\*Paso (\d+)\*\*:(.+?)(?=\*\*Paso \d+\*\*|$)/gs;
        let stepMatch;

        while ((stepMatch = stepRegex.exec(text)) !== null) {
            const stepNumber = parseInt(stepMatch[1]);
            const description = stepMatch[2].trim();

            const action = this.identifyAction(description);
            if (!action) continue;

            const params = this.extractParams(description, action);

            if (params) {
                steps.push({
                    id: `step-${stepNumber}`,
                    stepNumber,
                    description,
                    action: action as AIAction, // Cast to AIAction since it's already validated above
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

    private identifyAction(description: string): string | null {
        const lowerDesc = description.toLowerCase();

        // Control Actions
        if (lowerDesc.includes('vista') || lowerDesc.includes('cambiar a')) return 'set_view_mode';
        if (lowerDesc.includes('activar') || lowerDesc.includes('desactivar') || lowerDesc.includes('mostrar') || lowerDesc.includes('ocultar')) return 'toggle_visibility';
        if (lowerDesc.includes('borrar todo') || lowerDesc.includes('limpiar')) return 'clear_canvas';
        if (lowerDesc.includes('borrar') || lowerDesc.includes('eliminar')) return 'delete_element';

        // Creation Actions
        if (lowerDesc.includes('crear punto') || lowerDesc.includes('punto')) return 'add_point';
        if (lowerDesc.includes('recta') || lowerDesc.includes('línea')) return 'add_line_by_points';
        if (lowerDesc.includes('plano')) {
            if (lowerDesc.includes('trazas') || lowerDesc.includes('cortes') || lowerDesc.includes('ejes')) {
                return 'add_plane_by_traces';
            }
            if (lowerDesc.includes('paralelo')) return 'add_plane_parallel_to_plane';
            return 'add_plane_by_normal';
        }

        // Advanced Tools
        if (lowerDesc.includes('add_parallel_line') || (lowerDesc.includes('paralela') && lowerDesc.includes('recta'))) return 'add_parallel_line';
        if (lowerDesc.includes('add_perpendicular_line') || (lowerDesc.includes('perpendicular') && lowerDesc.includes('recta'))) return 'add_perpendicular_line_to_plane';
        if (lowerDesc.includes('rotate') || lowerDesc.includes('girar')) return 'rotate_point_around_axis';

        return null;
    }

    private extractParams(description: string, action: string): any {
        const lowerDesc = description.toLowerCase();
        const coordRegex = /\(([^)]+)\)/g;
        const coords = [];
        let match;

        while ((match = coordRegex.exec(description)) !== null) {
            const parts = match[1].split(',').map(v => v.trim());
            if (parts.length === 3) {
                const values = parts.map(part => {
                    const upper = part.toUpperCase();
                    if (upper === 'X' || upper === 'Y' || upper === 'Z') {
                        return 0;
                    }
                    return parseFloat(part);
                });
                if (values.every(v => !isNaN(v))) {
                    coords.push(values);
                }
            }
        }

        const nameMatch = description.match(/([A-Z])\s*\(/);
        let name = nameMatch ? nameMatch[1] : 'X';

        if (action === 'add_plane_by_traces' || action === 'add_plane_by_normal' || action === 'add_plane_parallel_to_plane') {
            const planeNameMatch = description.match(/plano\s+([A-Za-zα-ωΑ-Ω]+)/i);
            if (planeNameMatch) {
                name = planeNameMatch[1];
            }
        }

        switch (action) {
            case 'set_view_mode':
                if (lowerDesc.includes('3d') || lowerDesc.includes('espacial')) return { mode: '3d' };
                if (lowerDesc.includes('2d') || lowerDesc.includes('diédrica')) return { mode: '2d' };
                if (lowerDesc.includes('boceto') || lowerDesc.includes('sketch')) return { mode: 'sketch' };
                break;

            case 'toggle_visibility':
                if (lowerDesc.includes('intersecciones')) return { target: 'intersections' };
                if (lowerDesc.includes('bisectores')) return { target: 'bisectors' };
                if (lowerDesc.includes('abatimiento')) return { target: 'flattening' };
                if (lowerDesc.includes('perfil')) return { target: 'profile' };
                if (lowerDesc.includes('ayuda')) return { target: 'help' };
                break;

            case 'clear_canvas':
                return {};

            case 'delete_element':
                const deleteNameMatch = description.match(/borrar\s+(?:el\s+)?(?:punto|recta|plano)?\s*([a-zA-Z0-9]+)/i);
                if (deleteNameMatch) return { name: deleteNameMatch[1] };
                break;

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

            case 'add_plane_by_traces':
                if (coords.length > 0) {
                    return {
                        name,
                        x_intercept: coords[0][0],
                        y_intercept: coords[0][1],
                        z_intercept: coords[0][2],
                        step_description: description,
                    };
                }
                break;

            case 'add_plane_parallel_to_plane':
                const targetPlaneMatch = description.match(/paralelo\s+al\s+plano\s+([A-Za-zα-ωΑ-Ω]+)/i);
                if (targetPlaneMatch) {
                    return {
                        name,
                        target_plane_name: targetPlaneMatch[1],
                        step_description: description,
                    };
                }
                break;

            case 'add_line_by_points':
                const lineNameMatch = description.match(/recta\s+([a-zA-Z0-9]+)/i);
                const lineName = lineNameMatch ? lineNameMatch[1] : 'r';
                let potentialPoints: string[] = description.match(/\b[A-Z]\b/g) || [];
                if (lineNameMatch) {
                    potentialPoints = potentialPoints.filter(p => p !== lineName);
                }
                if (potentialPoints.length >= 2) {
                    return {
                        name: lineName,
                        point1_name: potentialPoints[0],
                        point2_name: potentialPoints[1],
                        step_description: description
                    };
                }
                break;

            case 'add_parallel_line':
                const parallelLineNameMatch = description.match(/recta\s+([a-zA-Z0-9]+)\s+paralela/i);
                const parallelLineName = parallelLineNameMatch ? parallelLineNameMatch[1] : 'r_parallel';
                const throughPointMatch = description.match(/por\s+el\s+punto\s+([A-Z])/i);
                const parallelToLineMatch = description.match(/a\s+la\s+recta\s+([a-zA-Z0-9]+)/i);

                if (throughPointMatch && parallelToLineMatch) {
                    return {
                        name: parallelLineName,
                        through_point_name: throughPointMatch[1],
                        parallel_to_line_name: parallelToLineMatch[1],
                        step_description: description,
                    };
                }
                break;

            case 'add_perpendicular_line_to_plane':
                const perpLineNameMatch = description.match(/recta\s+([a-zA-Z0-9]+)\s+perpendicular/i);
                const perpLineName = perpLineNameMatch ? perpLineNameMatch[1] : 'r_perp';
                const perpThroughPointMatch = description.match(/por\s+el\s+punto\s+([A-Z])/i);
                const perpToPlaneMatch = description.match(/al\s+plano\s+([A-Za-zα-ωΑ-Ω]+)/i);

                if (perpThroughPointMatch && perpToPlaneMatch) {
                    return {
                        name: perpLineName,
                        through_point_name: perpThroughPointMatch[1],
                        perpendicular_to_plane_name: perpToPlaneMatch[1],
                        step_description: description,
                    };
                }
                break;

            case 'rotate_point_around_axis':
                const pointToRotateMatch = description.match(/punto\s+([A-Z])\s+alrededor/i);
                const axisPoint1Match = description.match(/eje\s+que\s+pasa\s+por\s+([A-Z])\s+y\s+([A-Z])/i);
                const angleMatch = description.match(/(\d+)\s*grados/i);

                if (pointToRotateMatch && axisPoint1Match && angleMatch) {
                    return {
                        point_name: pointToRotateMatch[1],
                        axis_point1_name: axisPoint1Match[1],
                        axis_point2_name: axisPoint1Match[2],
                        angle_degrees: parseFloat(angleMatch[1]),
                        step_description: description,
                    };
                }
                break;
        }

        return null;
    }
}
