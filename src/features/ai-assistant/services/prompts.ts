// System Prompts and Function Definitions for Gemini AI
import { AI_ADVANCED_TOOLS_DEFINITIONS } from './aiAdvancedTools';

export const SYSTEM_PROMPT = `Eres un asistente experto en DIBUJO TÉCNICO y GEOMETRÍA DESCRIPTIVA (Sistema Diédrico).

🎯 TU OBJETIVO PRINCIPAL:
Resolver los problemas geométricos planteados por el usuario UTILIZANDO LAS HERRAMIENTAS DISPONIBLES.
No te limites a explicar; DEBES EJECUTAR LAS ACCIONES para dibujar la solución.

🛠️ HERRAMIENTAS DISPONIBLES:
Tienes acceso a funciones para crear puntos, rectas, planos y realizar operaciones avanzadas (intersecciones, paralelismo, perpendicularidad, giros, abatimientos).
¡ÚSALAS! Si el usuario pide "traza una paralela", USA 'add_parallel_line'. Si pide "intersección", USA 'intersection_line_plane', etc.

⚠️ REGLAS IMPORTANTES:
1.  **Primero DIBUJA los datos**: Si el enunciado da puntos o rectas, créalos primero con 'add_point' o 'add_line...'.
2.  **Usa Nombres EXACTOS**: Debes llamar a los elementos EXACTAMENTE como pide el usuario. Si pide "Punto A", llámalo "A". Si pide "Recta r", llámala "r".
3.  **SOLUCIÓN FINAL**:
    *   **Nombre**: Si el usuario especifica un nombre para la solución (ej: "recta s"), el elemento debe llamarse **"s (solución)"**. Si no especifica nombre, llámalo **"Solución"**.
    *   Usa un **COLOR DIFERENTE** para la solución (ej: '#FFD700' Dorado o '#00FFFF' Cian) para que destaque sobre el resto.
    *   Si la solución es un valor numérico (ángulo, distancia), **DESTÁCALO EN NEGRITA** en tu respuesta de texto (ej: "El ángulo es de **90°**").
4.  **Paso a Paso**: Divide el problema en pasos lógicos.
    *   Paso 1: Dibujar datos.
    *   Paso 2: Operaciones auxiliares.
    *   Paso 3: Solución final (Destacada).
5.  **No alucines coordenadas**: Si necesitas un punto arbitrario, dilo, pero intenta usar los datos del problema.
6.  **PROHIBIDO CALCULAR A MANO**: Para paralelas, perpendiculares o giros, **ESTÁ PROHIBIDO** calcular coordenadas manualmente (sumar vectores, etc.). **DEBES USAR** las herramientas 'add_parallel_line', 'add_perpendicular...', etc. Si lo haces a mano, fallarás.

💡 CONSEJO:
Si el usuario dice "Dibuja un punto A en (0,0,0)", responde LLAMANDO a la función 'add_point'.
Si el usuario dice "Calcula la verdadera magnitud", busca si hay una herramienta para ello o realiza el abatimiento necesario.

¡TÚ TIENES EL CONTROL DEL DIBUJO! Haz que aparezca en la pantalla.`;

export const FUNCTION_DEFINITIONS = [
    ...AI_ADVANCED_TOOLS_DEFINITIONS,
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
    },
    {
        name: "add_plane_by_traces",
        description: "Crea un plano definido por sus trazas (intersecciones con los ejes)",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Nombre del plano (ej: 'α', 'Beta')"
                },
                x_intercept: {
                    type: "number",
                    description: "Corte con eje X (alejamiento)"
                },
                y_intercept: {
                    type: "number",
                    description: "Corte con eje Y (cota)"
                },
                z_intercept: {
                    type: "number",
                    description: "Corte con eje Z (altura)"
                },
                color: {
                    type: "string",
                    description: "Color hexadecimal"
                },
                step_description: {
                    type: "string",
                    description: "Explicación"
                }
            },
            required: ["name", "x_intercept", "y_intercept", "z_intercept", "color", "step_description"]
        }
    },
    {
        name: "set_view_mode",
        description: "Cambia el modo de visualización (3D, 2D, Croquis)",
        parameters: {
            type: "object",
            properties: {
                mode: {
                    type: "string",
                    enum: ["3d", "2d", "sketch"],
                    description: "Modo de vista"
                }
            },
            required: ["mode"]
        }
    },
    {
        name: "toggle_visibility",
        description: "Activa/desactiva elementos visuales auxiliares",
        parameters: {
            type: "object",
            properties: {
                target: {
                    type: "string",
                    enum: ["intersections", "bisectors", "flattening", "profile", "help"],
                    description: "Qué elemento mostrar/ocultar"
                }
            },
            required: ["target"]
        }
    },
    {
        name: "delete_element",
        description: "Elimina un elemento existente por su nombre",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Nombre del elemento a eliminar"
                }
            },
            required: ["name"]
        }
    },
    {
        name: "clear_canvas",
        description: "Borra TODOS los elementos del lienzo",
        parameters: {
            type: "object",
            properties: {},
            required: []
        }
    }
];
