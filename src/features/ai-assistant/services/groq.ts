// Groq AI Service - Alternative to Gemini
import { colorManager } from './colorManager';
import { rateLimiter } from './rateLimiter';
import type { AIStep, AIResponse, AIAction } from '../types/ai.types';
import { SYSTEM_PROMPT, FUNCTION_DEFINITIONS } from './prompts';
import { useGeometryStore } from '../../../store/geometryStore';
import { useUserStore } from '../../../store/userStore';
import { callAIProxy, AI_PROXY_MODEL } from './aiProxy';
import { extractStepsFromText, normalizeStepItem } from './parseSteps';

export class GroqService {
    constructor() {}

    async solveExercise(
        userPrompt: string,
        systemPromptOverride?: string,
        options: { includeFunctions?: boolean; includeContext?: boolean; maxTokens?: number } = {},
    ): Promise<AIResponse> {
        const { includeFunctions = true, includeContext = true, maxTokens = 2000 } = options;
        await rateLimiter.checkLimit();
        colorManager.reset();

        const elements: any[] = useGeometryStore.getState().elements;
        const contextDescription = elements.length > 0
            ? "ELEMENTOS EN EL LIENZO:\n" + elements.map(el => {
                if (el.type === 'point') return `- Punto ${el.name} (${(el as any).coords.x}, ${(el as any).coords.y}, ${(el as any).coords.z})`;
                if (el.type === 'line') return `- Recta ${el.name} (Pasa por ${(el as any).point.x},${(el as any).point.y},${(el as any).point.z})`;
                if (el.type === 'plane') return `- Plano ${el.name}`;
                return `- ${el.type} ${el.name}`;
            }).join('\n')
            : "Lienzo vacío.";

        // El esquema de funciones ocupa miles de tokens: solo se manda cuando el
        // modelo tiene que dibujar. Para generar un enunciado o corregir, sobra
        // (era la causa de tocar el límite de tokens por minuto del plan gratuito).
        let fullSystemPrompt = systemPromptOverride || SYSTEM_PROMPT;
        if (includeContext) {
            fullSystemPrompt += "\n\nCONTEXTO ACTUAL (LO QUE YA EXISTE):\n" + contextDescription;
        }
        if (includeFunctions) {
            fullSystemPrompt += "\n\nDEFINICIONES DE FUNCIONES DISPONIBLES (ÚSALAS):\n" + JSON.stringify(FUNCTION_DEFINITIONS);
        }

        try {
            const request = () => callAIProxy({
                model: AI_PROXY_MODEL,
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
                temperature: 0.1,
                max_tokens: maxTokens,
            });

            let response = await request();

            // Límite de tokens por minuto del plan gratuito: un reintento tras 5 s
            if (response.status === 429) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                response = await request();
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error calling AI proxy');
            }

            // El proxy devuelve el saldo restante: así el panel no miente.
            const creditsHeader = response.headers.get('x-ai-credits');
            if (creditsHeader !== null) {
                const left = Number(creditsHeader);
                if (Number.isFinite(left)) useUserStore.getState().setCredits(left);
            }
            const trialHeader = response.headers.get('x-ai-trial-left');
            if (trialHeader !== null) {
                const left = Number(trialHeader);
                if (Number.isFinite(left)) useUserStore.getState().setTrialLeft(left);
            }

            const data = await response.json();
            const text = data.choices[0].message.content;
            const steps = this.parseResponseToSteps(text);
            const cleanText = this.cleanResponseText(text, steps.length > 0);

            return {
                explanation: cleanText || "¡Hecho! Aquí tienes la construcción.",
                steps,
            };
        } catch (error: any) {
            console.error('Groq API Error:', error);
            throw error;
        }
    }

    async scanImage(_imageData: string): Promise<AIResponse> {
        await rateLimiter.checkLimit();
        colorManager.reset();

        // La cuenta de Groq ya no ofrece modelos de visión (los Llama 3.2 vision fueron
        // retirados). Antes de esto la llamada fallaba con "model_not_found" y el error
        // se perdía en consola; ahora se explica al usuario.
        throw new Error(
            'El escaneo de imágenes no está disponible con el proveedor de IA actual. ' +
            'Puedes escribir el enunciado en el chat.'
        );
    }

    private parseResponseToSteps(text: string): AIStep[] {
        // 1. JSON del prompt (parseSteps.ts, probado con respuestas reales)
        const raw = extractStepsFromText(text);
        if (raw.length > 0) {
            return raw.map((item, i) => this.createStepObject(i + 1, item));
        }

        // 2. Plan B: texto con "**Paso N**" (modelos que ignoran el formato)
        const steps: AIStep[] = [];
        let stepCount = 0;

        console.warn('No JSON blocks found, falling back to text parsing');
        const stepRegex = /(?:\*\*Paso (\d+)\*\*|\d+\.\s+\*\*(.+?)\*\*):?\s*(.+?)(?=(?:\*\*Paso \d+\*\*|\d+\.\s+\*\*|$))/gs;
        let stepMatch;

        while ((stepMatch = stepRegex.exec(text)) !== null) {
            const stepNumber = parseInt(stepMatch[1] || '0');
            const description = stepMatch[2] ? stepMatch[2].trim() : `Paso ${stepNumber}`;
            const content = stepMatch[3] ? stepMatch[3].trim() : '';

            const action = this.identifyAction(description) || this.identifyAction(content);
            if (!action || !content) continue;

            const params = this.extractParams(content, action);

            if (params) {
                stepCount++;
                steps.push({
                    id: `step-${stepCount}`,
                    stepNumber: stepCount,
                    description: description,
                    action: action as AIAction,
                    params: {
                        ...params,
                        color: colorManager.getColorForStep(stepCount),
                    },
                    color: colorManager.getColorForStep(stepCount),
                    status: 'pending',
                });
            }
        }

        return steps;
    }

    // Helper to clean text ONLY if steps were successfully found
    public cleanResponseText(text: string, stepsFound: boolean): string {
        if (!stepsFound) {
            // Si no hubo pasos pero venía un bloque de código, es un error de formato: avisar.
            const hasCodeBlocks = /```/.test(text);
            return hasCodeBlocks
                ? text + "\n\n⚠️ **Alerta:** No se detectaron pasos ejecutables. Si ves código arriba, hubo un error de formato."
                : text.trim();
        }

        // Con pasos: fuera bloques de código y, si el modelo se olvidó de las vallas,
        // fuera también el JSON suelto (antes se le enseñaba al usuario en crudo).
        return this.stripJsonPayloads(text);
    }

    /** Quita del texto los bloques ``` y los JSON sueltos que sean payloads de pasos. */
    private stripJsonPayloads(text: string): string {
        let out = text.replace(/```(?:json|JSON)?[\s\S]*?```/g, ' ');

        const start = out.search(/[[{]/);
        if (start !== -1) {
            for (let end = out.length; end > start; end--) {
                try {
                    const parsed = JSON.parse(out.slice(start, end));
                    if (this.looksLikeSteps(parsed)) {
                        out = out.slice(0, start) + out.slice(end);
                        break;
                    }
                } catch {
                    // seguimos recortando
                }
            }
        }

        return out.replace(/[ \t]{2,}/g, ' ').trim();
    }

    private looksLikeSteps(parsed: any): boolean {
        // Un único objeto también es un paso: {"function": "...", "arguments": {...}}
        if (normalizeStepItem(parsed)) return true;

        const items = Array.isArray(parsed) ? parsed : (parsed?.steps ?? parsed?.actions);
        return Array.isArray(items) && items.some((i: any) => !!normalizeStepItem(i));
    }

    private createStepObject(stepCount: number, data: { name: string; params: any }): AIStep {
        return {
            id: `step-${stepCount}`,
            stepNumber: stepCount,
            description: data.params?.step_description || `Paso ${stepCount}`,
            action: data.name as AIAction,
            params: {
                ...data.params,
                color: colorManager.getColorForStep(stepCount),
            },
            color: colorManager.getColorForStep(stepCount),
            status: 'pending',
        };
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
