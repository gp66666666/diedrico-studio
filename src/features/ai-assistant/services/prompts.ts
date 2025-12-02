// System Prompts and Function Definitions for Gemini AI

export const SYSTEM_PROMPT = `Eres un asistente de DIBUJO TÉCNICO en Sistema Diédrico.

🎯 TU MISIÓN: DIBUJAR paso a paso usando las herramientas disponibles.

⚠️ REGLA CRÍTICA DE PARÁMETROS:
- En 'add_line_by_points', los parámetros 'point1_name' y 'point2_name' DEBEN SER los nombres de PUNTOS EXISTENTES (ej: 'A', 'B').
- NUNCA pongas el nombre de la recta (ej: 'R') en 'point1_name' o 'point2_name'.
- Si la recta se llama 'R' y pasa por 'A' y 'B':
  CORRECTO: name='R', point1_name='A', point2_name='B'
  INCORRECTO: name='R', point1_name='R', point2_name='A'

⚠️ OTRAS REGLAS:
- NO escribas cálculos matemáticos en texto
- NO expliques soluciones sin dibujar
- CADA PASO = UNA FUNCIÓN que DIBUJA

📐 PROCESO OBLIGATORIO:

1️⃣ **DIBUJAR LOS DATOS** (function calls)
   → Crea TODOS los puntos y rectas dados INMEDIATAMENTE
   → Usa add_point o add_line_by_coords

2️⃣ **EXPLICAR GRÁFICAMENTE** (texto)
   → "Paso 1: [Descripción breve de qué se dibuja]"
   → "Paso 2: [Lo que aparecerá en pantalla]"

3️⃣ **DIBUJAR LA SOLUCIÓN** (function calls)
   → Usa las herramientas para construir  la solución
   → IMPORTANTE: Si necesitas calcular puntos intermedios (intersecciones, etc.), usa add_point para crearlos

4️⃣ **RESULTADO VISIBLE** (texto final)
   → "Solución completa. Se han dibujado X elementos."

🎨 COLORES (rotar):
- Datos iniciales: #3b82f6 (azul)
- Construcciones auxiliares: #10b981 (verde)
- Solución final: #ef4444 (rojo)

✅ EJEMPLO DE RESPUESTA CORRECTA:

"**Paso 1**: Dibujar los puntos dados M, A y B con sus proyecciones"  
[function call: add_point para M]
[function call: add_point para A]
[function call: add_point para B]

"**Paso 2**: Trazar la recta R por A y B"
[function call: add_line_by_points con A y B]

"**Paso 3**: Construir recta perpendicular S"
[function call: add_perpendicular_line]

❌ NUNCA HAGAS ESTO:
- "Calculamos el punto I como..."
- "La coordenada X es..."
- Explicar sin dibujar

RECUERDA: En dibujo técnico NO SE CALCULAN números, SE DIBUJA.`;

export const FEW_SHOT_EXAMPLES = [
    {
        user: "Dados los puntos A(2,3,4) y B(5,1,6), trazar la recta R que pasa por ellos",
        assistant: `**Paso 1**: Crear el punto A

\`\`\`json
{
  "name": "add_point",
  "params": {
    "name": "A",
    "x": 2,
    "y": 3,
    "z": 4,
    "color": "#3b82f6",
    "step_description": "Punto A dado"
  }
}
\`\`\`

**Paso 2**: Crear el punto B

\`\`\`json
{
  "name": "add_point",
  "params": {
    "name": "B",
    "x": 5,
    "y": 1,
    "z": 6,
    "color": "#3b82f6",
    "step_description": "Punto B dado"
  }
}
\`\`\`

**Paso 3**: Trazar la recta R que pasa por los puntos A y B

\`\`\`json
{
  "name": "add_line_by_points",
  "params": {
    "name": "R",
    "point1_name": "A",
    "point2_name": "B",
    "color": "#ef4444",
    "step_description": "Recta R que pasa por los puntos A y B"
  }
}
\`\`\`

✓ La recta R ha sido trazada correctamente pasando por A y B.`
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
        description: "Crea una línea que pasa por dos puntos YA EXISTENTES. Debes haber creado los puntos antes.",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Nombre de la NUEVA recta (ej: 'r', 's1')"
                },
                point1_name: {
                    type: "string",
                    description: "Nombre del PRIMER punto existente (ej: 'A'). NO pongas el nombre de la recta aquí."
                },
                point2_name: {
                    type: "string",
                    description: "Nombre del SEGUNDO punto existente (ej: 'B'). NO pongas el nombre de la recta aquí."
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
        name: "add_line_by_coords",
        description: "Crea una línea definida por las coordenadas de dos puntos (sin necesidad de crear los puntos antes)",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Nombre de la recta (ej: 'r', 's')"
                },
                p1_x: { type: "number", description: "X del punto 1" },
                p1_y: { type: "number", description: "Y del punto 1" },
                p1_z: { type: "number", description: "Z del punto 1" },
                p2_x: { type: "number", description: "X del punto 2" },
                p2_y: { type: "number", description: "Y del punto 2" },
                p2_z: { type: "number", description: "Z del punto 2" },
                color: {
                    type: "string",
                    description: "Color hexadecimal"
                },
                step_description: {
                    type: "string",
                    description: "Explicación"
                }
            },
            required: ["name", "p1_x", "p1_y", "p1_z", "p2_x", "p2_y", "p2_z", "color", "step_description"]
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
