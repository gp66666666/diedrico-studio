// System Prompts and Function Definitions for Gemini AI

export const SYSTEM_PROMPT = `Eres un profesor experto en Sistema Diédrico y Geometría Descriptiva.

Tu tarea es resolver ejercicios paso a paso usando las herramientas disponibles mediante function calling.

REGLAS IMPORTANTES:
1. Divide la solución en pasos claros y pequeños
2. Para cada paso, usa la función correspondiente
3. Usa colores diferentes para cada paso
4. Explica la teoría geométrica detrás de cada construcción
5. Verifica que cada construcción sea matemáticamente correcta
6. SIEMPRE usa coordenadas exactas, no aproximaciones

COLORES POR PASOS (rota automáticamente):
- Paso 1: Azul (#3b82f6)
- Paso 2: Verde (#10b981)
- Paso 3: Amarillo (#f59e0b)
- Paso 4: Rojo (#ef4444)
- Paso 5: Morado (#8b5cf6)
- Y así sucesivamente...

PROCESO DE RESOLUCIÓN:
1. Analiza el enunciado cuidadosamente
2. Identifica los elementos dados
3. Plantea la estrategia de construcción
4. Ejecuta cada paso con su función correspondiente
5. Verifica la solución final

FUNDAMENTOS TEÓRICOS A MENCIONAR:
- Proyecciones: P' (horizontal), P'' (vertical)
- Trazas: h' (horizontal), v'' (vertical)
- Perpendicularidad: vector normal compartido
- Paralelismo: misma dirección
- Intersecciones: resolución de sistemas

Responde SIEMPRE en español con explicaciones claras y pedagógicas.`;

export const FEW_SHOT_EXAMPLES = [
    {
        user: "Por el punto A(2,3,4) trazar una recta r perpendicular al plano P con normal (1,0,1)",
        assistant: `Voy a resolver este ejercicio paso a paso.

**Análisis**: Tenemos el punto A( 2, 3, 4) y necesitamos trazar una recta perpendicular al plano P. 

**Fundamento teórico**: Una recta perpendicular a un plano tiene la misma dirección que el vector normal del plano.

**Paso 1**: Crear el punto A dado.

**Paso 2**: La recta r será perpendicular a P, por lo que su vector director será el mismo que el normal de P: d = (1, 0, 1). Calculamos un segundo punto B = A + d = (2+1, 3+0, 4+1) = (3, 3, 5).

**Paso 3**: Crear la recta r que pasa por A y B.

La recta r ya está trazada y es perpendicular al plano P. ✓`
    }
];

export const FUNCTION_DEFINITIONS = [
    {
        name: "add_point",
        description: "Añade un punto en el espacio 3D con coordenadas (x, y, z)",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Nombre del punto (ej: 'A', 'B1', 'P')"
                },
                x: {
                    type: "number",
                    description: "Coordenada X (alejamiento en Sistema Diédrico)"
                },
                y: {
                    type: "number",
                    description: "Coordenada Y (cota en Sistema Diédrico)"
                },
                z: {
                    type: "number",
                    description: "Coordenada Z (altura en Sistema Diédrico)"
                },
                color: {
                    type: "string",
                    description: "Color en formato hexadecimal (ej: '#3b82f6')"
                },
                step_description: {
                    type: "string",
                    description: "Explicación breve de por qué se crea este punto"
                }
            },
            required: ["name", "x", "y", "z", "color", "step_description"]
        }
    },
    {
        name: "add_line_by_points",
        description: "Crea una línea que pasa por dos puntos existentes",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Nombre de la recta (ej: 'r', 's1')"
                },
                point1_name: {
                    type: "string",
                    description: "Nombre del primer punto"
                },
                point2_name: {
                    type: "string",
                    description: "Nombre del segundo punto"
                },
                color: {
                    type: "string",
                    description: "Color en formato hexadecimal"
                },
                step_description: {
                    type: "string",
                    description: "Explicación de la construcción de esta recta"
                }
            },
            required: ["name", "point1_name", "point2_name", "color", "step_description"]
        }
    },
    {
        name: "add_plane_by_normal",
        description: "Crea un plano definido por su vector normal y constante",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Nombre del plano (ej: 'α', 'P', 'Q')"
                },
                normal_x: {
                    type: "number",
                    description: "Componente X del vector normal"
                },
                normal_y: {
                    type: "number",
                    description: "Componente Y del vector normal"
                },
                normal_z: {
                    type: "number",
                    description: "Componente Z del vector normal"
                },
                constant: {
                    type: "number",
                    description: "Constante D de la ecuación Ax + By + Cz + D = 0"
                },
                color: {
                    type: "string",
                    description: "Color en formato hexadecimal"
                },
                step_description: {
                    type: "string",
                    description: "Explicación de cómo se obtiene este plano"
                }
            },
            required: ["name", "normal_x", "normal_y", "normal_z", "constant", "color", "step_description"]
        }
    }
];
