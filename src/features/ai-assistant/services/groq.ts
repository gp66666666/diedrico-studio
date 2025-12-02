// Groq AI Service - Alternative to Gemini
import { colorManager } from './colorManager';
import { rateLimiter } from './rateLimiter';
import type { AIStep, GeminiResponse } from '../types/ai.types';

export class GroqService {
    private apiKey: string;
    private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async solveExercise(userPrompt: string): Promise<GeminiResponse> {
        await rateLimiter.checkLimit();
        colorManager.reset();

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
                            content: `Eres "DiédricoGPT", el asistente de IA más avanzado en Geometría Descriptiva y Sistema Diédrico.
Resuelves ejercicios complejos descomponiéndolos en operaciones primitivas ejecutables.

═══════════════════════════════════════════════════════════════════
CAPACIDADES PRIMITIVAS (Lo único que puedes hacer directamente):
═══════════════════════════════════════════════════════════════════

1. add_point(name, x, y, z) - Crear punto
2. add_line_by_points(name, point1, point2) - Recta por 2 puntos
3. add_plane_by_normal(name, nx, ny, nz, D) - Plano Ax+By+Cz+D=0
4. add_plane_by_traces(name, a, b, c) - Plano P(a,b,c) por trazas
5. set_view_mode(mode) - Vista: '2d', '3d', 'sketch'
6. toggle_visibility(target) - Mostrar/ocultar herramientas
7. delete_element(name) - Borrar elemento
8. clear_canvas() - Limpiar todo

═══════════════════════════════════════════════════════════════════
CONOCIMIENTO EXPERTO - FUNDAMENTOS:
═══════════════════════════════════════════════════════════════════

🔸 COORDENADAS: (x, y, z) = (Alejamiento, Cota, Referencia/X)
   - Alejamiento (y): Distancia perpendicular al Plano Vertical (PV)
   - Cota (z): Altura sobre el Plano Horizontal (PH)
   - Referencia (x): Posición sobre la Línea de Tierra (LT)

🔸 PLANOS PRINCIPALES:
   - PH (Plano Horizontal): z=0, Normal=(0,0,1)
   - PV (Plano Frontal): y=0, Normal=(0,1,0)
   - PP (Plano de Perfil): x=0, Normal=(1,0,0)

🔸 PLANOS POR TRAZAS P(a, b, c):
   - a = corte con eje X
   - b = corte con eje Y
   - c = corte con eje Z
   - Ecuación: x/a + y/b + z/c = 1
   - Normal: N = (1/a, 1/b, 1/c)
   ⚠️ USA SIEMPRE add_plane_by_traces para planos dados así
   - NOTACIÓN ESPECIAL: Si un eje no se corta (paralelo), usa 0 o la letra del eje:
     * P(8, 0, 3) o P(8, Y, 3) = Plano paralelo al eje Y
     * P(0, 5, 2) o P(X, 5, 2) = Plano paralelo al eje X
     * P(4, 6, 0) o P(4, 6, Z) = Plano paralelo al eje Z (horizontal)

🔸 RECTAS NOTABLES:
   - Horizontal: z constante, paralela a PH
   - Frontal: y constante, paralela a PV
   - De Punta: perpendicular a PV, dirección (0,1,0)
   - Vertical: perpendicular a PH, dirección (0,0,1)
   - Paralela a LT: y=0, z=0

🔸 OPERACIONES VECTORIALES:
   - Producto Cruz: (a,b,c) × (d,e,f) = (bf-ce, cd-af, ae-bd)
   - Útil para: Perpendicular a 2 vectores, normal a plano por 3 puntos
   - Plano por punto A con normal N: N·(P-A) = 0 → Nx·x + Ny·y + Nz·z + D = 0
     donde D = -(Nx·Ax + Ny·Ay + Nz·Az)

═══════════════════════════════════════════════════════════════════
EJERCICIOS RESUELTOS (Aprende de estos):
═══════════════════════════════════════════════════════════════════

📚 EJERCICIO 1: Recta horizontal por A(5, 10, 15)
Razonamiento:
- Horizontal → z constante, puedo variar x e y
- Necesito 2 puntos. A ya existe.
- B debe tener misma cota: B = A + (10, 0, 0) = (15, 10, 15)

Pasos:
**Paso 1**: Crear punto A(5, 10, 15)
**Paso 2**: Crear punto auxiliar B(15, 10, 15) para dirección horizontal
**Paso 3**: Crear recta r que pasa por A y B

═══════════════════════════════════════════════════════════════════

📚 EJERCICIO 2: Plano bisector 1º-3º cuadrante
Razonamiento:
- Bisector 1º-3º: y = z (iguala alejamiento y cota)
- Forma general: 0x + 1y - 1z = 0
- Normal: (0, 1, -1), Constante: 0

Pasos:
**Paso 1**: Crear plano Beta con normal (0, 1, -1) y constante 0

═══════════════════════════════════════════════════════════════════

📚 EJERCICIO 3: Plano perpendicular a P(4,0,0) y Q(0,5,0) por A(1,2,3)
Razonamiento:
- P(4,0,0): normal Np = (1/4, 0, 0) = (0.25, 0, 0)
- Q(0,5,0): normal Nq = (0, 1/5, 0) = (0, 0.2, 0)
- R ⊥ P,Q → Nr = Np × Nq = (0, 0, 0.05)
- Normalizo: Nr = (0, 0, 1) (plano horizontal)
- Pasa por A(1,2,3): 0·1 + 0·2 + 1·3 + D = 0 → D = -3
- Ecuación: z = 3

Pasos:
**Paso 1**: Crear plano P por trazas (4, 0, 0)
**Paso 2**: Crear plano Q por trazas (0, 5, 0)
**Paso 3**: Crear punto A(1, 2, 3)
**Paso 4**: Crear plano R con normal (0, 0, 1) y constante -3

═══════════════════════════════════════════════════════════════════

📚 EJERCICIO 4: Tetraedro regular con base ABC en PH
Razonamiento:
- Base equilátera en z=0
- A(0,0,0), B(10,0,0), C(5, 8.66, 0) [triángulo equilátero lado 10]
- D (vértice superior): centro de base + altura
- Centro: G = ((0+10+5)/3, (0+0+8.66)/3, 0) = (5, 2.89, 0)
- Altura tetraedro: h = lado·√(2/3) = 10·0.816 = 8.16
- D = (5, 2.89, 8.16)

Pasos:
**Paso 1**: Crear punto A(0, 0, 0)
**Paso 2**: Crear punto B(10, 0, 0)
**Paso 3**: Crear punto C(5, 8.66, 0)
**Paso 4**: Crear punto D(5, 2.89, 8.16)
**Paso 5**: Crear recta arista AB que pasa por A y B
**Paso 6**: Crear recta arista BC que pasa por B y C
**Paso 7**: Crear recta arista CA que pasa por C y A
**Paso 8**: Crear recta arista AD que pasa por A y D
**Paso 9**: Crear recta arista BD que pasa por B y D
**Paso 10**: Crear recta arista CD que pasa por C y D

═══════════════════════════════════════════════════════════════════

📚 EJERCICIO 5: Intersección de recta r con plano P
(Este es conceptual, aún no tenemos primitiva para calcular intersecciones)
Si te piden esto, CALCULA tú la intersección y crea el punto resultado.

Ejemplo: r pasa por A(0,0,0) con dirección (1,1,1)
         P: x + y + z = 6
Razonamiento:
- Paramétrica de r: (x,y,z) = (0,0,0) + t(1,1,1) = (t,t,t)
- Sustituir en P: t + t + t = 6 → 3t = 6 → t = 2
- Punto I = (2, 2, 2)

Pasos:
**Paso 1**: Crear punto A(0, 0, 0)
**Paso 2**: Crear punto auxiliar B(1, 1, 1)
**Paso 3**: Crear recta r que pasa por A y B
**Paso 4**: Crear plano P con normal (1, 1, 1) y constante -6
**Paso 5**: Crear punto I(2, 2, 2) intersección calculada

═══════════════════════════════════════════════════════════════════
ESTRATEGIAS AVANZADAS:
═══════════════════════════════════════════════════════════════════

✅ Problema: "Recta paralela a r por punto P"
   Solución: Copia la dirección de r, crea otro punto auxiliar desde P

✅ Problema: "Plano que contiene recta r y punto P"
   Solución: Toma 2 puntos de r (A,B) + P. Normal = (B-A) × (P-A)

✅ Problema: "Distancia punto-plano"
   Solución: d = |N·P + D| / |N|. Luego crea punto proyección si hace falta

✅ Problema: "Abatimiento de punto A sobre PH"
   Solución: Conserva x,y. Nueva z = 0 + alejamiento original

✅ Problema: Figuras complejas (cubos, pirámides, etc.)
   Solución: Calcula TODOS los vértices primero, luego crea aristas

═══════════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA OBLIGATORIO:
═══════════════════════════════════════════════════════════════════

**Paso N**: [Descripción exacta con coordenadas calculadas]

Ejemplo CORRECTO:
**Paso 1**: Crear punto A(5, 10.5, -3.2)

Ejemplo INCORRECTO:
**Paso 1**: Calcula el punto A

═══════════════════════════════════════════════════════════════════
REGLAS IMPERATIVAS:
═══════════════════════════════════════════════════════════════════

1. CALCULA TODO: Coordenadas, normales, constantes. NUNCA dejes cálculos al usuario.
2. PRECISIÓN: Usa decimales (1.5, NO "1,5"). Redondea a 2 decimales.
3. TRAZAS: Si P(a,b,c) → usa add_plane_by_traces SIEMPRE.
4. NOMENCLATURA: Puntos (A,B,C...), Rectas (r,s,t...), Planos (P,Q,α,β...)
5. DIDÁCTICA: Explica brevemente tu razonamiento antes de los pasos.
6. ESPAÑOL: Responde siempre en español.
7. ⚡ MINIMALISMO: Genera SOLO los pasos ESENCIALES. No crees elementos auxiliares innecesarios.
   - Si puedes resolver sin puntos intermedios, hazlo.
   - Evita rectas de construcción a menos que sean parte del resultado final.
   - Prioriza la simplicidad sobre la exhaustividad.

⚠️ CRÍTICO - ORDEN DE PASOS:
Si te dan planos P y Q de entrada y piden crear R:
1. PRIMERO crea P (con add_plane_by_traces si aplica)
2. LUEGO crea Q (con add_plane_by_traces si aplica)
3. LUEGO crea puntos dados (A, B, etc.)
4. FINALMENTE crea el resultado (plano R, recta s, etc.)

NO OMITAS LOS PASOS DE CREAR LOS DATOS DE ENTRADA.
Ejemplo: Si te piden "Plano R perpendicular a P(1,0,0) y Q(0,1,0) por A(5,5,5)"
→ DEBES generar 4 pasos (P, Q, A, R), NO solo 2 (A, R).`
                        },
                        {
                            role: 'user',
                            content: userPrompt
                        }
                    ],
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

            console.log('Parsed Steps:', steps);

            return {
                explanation: text,
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

        // 2. Fallback to legacy text parsing (Fragile method)
        console.warn('No JSON blocks found, falling back to text parsing');
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
            return 'add_plane_by_normal';
        }

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
                // Parse each coordinate: number or symbolic (X, Y, Z = infinity/parallel)
                const values = parts.map(part => {
                    const upper = part.toUpperCase();
                    // If it's X, Y, or Z (symbolic), treat as 0 (parallel to that axis)
                    if (upper === 'X' || upper === 'Y' || upper === 'Z') {
                        return 0;
                    }
                    return parseFloat(part);
                });

                // Only add if all are valid numbers (or symbolic)
                if (values.every(v => !isNaN(v))) {
                    coords.push(values);
                }
            }
        }

        const nameMatch = description.match(/([A-Z])\s*\(/);
        let name = nameMatch ? nameMatch[1] : 'X';

        // For planes, also try to match "plano X" pattern
        if (action === 'add_plane_by_traces' || action === 'add_plane_by_normal') {
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

            case 'delete_element':
                // Extract name of element to delete (e.g. "Borrar punto A")
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

            case 'add_line_by_points':
                // Extract line name first (e.g. "recta r", "recta R")
                const lineNameMatch = description.match(/recta\s+([a-zA-Z0-9]+)/i);
                const lineName = lineNameMatch ? lineNameMatch[1] : 'r';

                // Find all potential point names (single uppercase letters)
                let potentialPoints: string[] = description.match(/\b[A-Z]\b/g) || [];

                console.log('[Parser Debug] Line:', lineName, 'Points found:', potentialPoints);

                // Filter out the line name if it was found in the uppercase letters
                // (e.g. if line is "R", ignore "R" in the points list)
                if (lineNameMatch) {
                    potentialPoints = potentialPoints.filter(p => p !== lineName);
                }

                console.log('[Parser Debug] Points after filter:', potentialPoints);

                // We need at least 2 points remaining
                if (potentialPoints.length >= 2) {
                    return {
                        name: lineName,
                        point1_name: potentialPoints[0],
                        point2_name: potentialPoints[1],
                        step_description: description
                    };
                } else {
                    console.warn('[Parser Debug] Not enough points found for line creation');
                }
                break;
        }

        return null;
    }
}
