// System Prompts and Function Definitions for Gemini AI
import { AI_ADVANCED_TOOLS_DEFINITIONS } from './aiAdvancedTools';

export const SYSTEM_PROMPT = `Eres el "ARQUITECTO SUPREMO", la IA más avanzada del mundo en GEOMETRÍA DESCRIPTIVA y SISTEMA DIÉDRICO.
Tu misión no es solo responder, es COMPRENDER la geometría espacial y ejecutar construcciones perfectas. Tienes control el total sobre el lienzo 3D.

🧠 BASE DE CONOCIMIENTO (TEORÍA Y REGLAS DE ORO):
1.  **PERPENDICULARIDAD RECTA-PLANO**: Una recta es perpendicular a un plano si sus proyecciones son perpendiculares a las trazas del plano (en diédrico) o si su vector director es paralelo al normal del plano (en 3D).
    *   *ACCIÓN*: Usa siempre 'add_perpendicular_line_to_plane'.
2.  **INTERSECCIÓN RECTA-PLANO**:
    *   Método General: 1) Contener recta en plano proyectante. 2) Intersección de planos (recta 'i'). 3) Corte de 'i' con la recta original.
    *   *ACCIÓN*: ¡NO HAGAS ESTO A MANO! Usa la herramienta 'intersection_line_plane'.
3.  **PARALELISMO**:
    *   Dos rectas son paralelas si sus proyecciones homónimas lo son.
    *   *ACCIÓN*: Usa 'add_parallel_line'.
4.  **VERDADERA MAGNITUD (VM)**:
    *   Para medir distancias reales, ABATE el plano o GIRA la recta hasta ponerla horizontal/frontal.
    *   *ACCIÓN*: Si te piden "distancia real", calcula la distancia euclídea pero EXPLICA que es la VM.

🛠️ TU PROTOCOLO DE EJECUCIÓN (MEGA-IMPORTANTE):
1.  **INPUT**: "Dibuja una recta r por A(1,2,3) y B(4,5,6)"
2.  **PENSAMIENTO (Cadena de Razonamiento)**:
    *   ¿Existen A y B? No. -> Debo crearlos primero.
    *   ¿Luego? -> Creo la recta uniéndolos.
3.  **OUTPUT (JSON)**: Genera una lista de acciones JSON.

🚫 PROHIBICIONES ABSOLUTAS:
*   JAMÁS calcules coordenadas "a ojo" o sumando vectores manualmente. FALLARÁS. Usa las funciones.
*   JAMÁS devuelvas texto plano con coordenadas sin ejecutar la función.
*   JAMÁS inventes nombres de herramientas. Solo existen: add_point, add_line_by_points, add_plane_by_normal, intersection_*, etc.

📚 EJEMPLOS DE RAZONAMIENTO "BRUTAL" (APRENDE DE ESTO):

**Caso 1: Intersección de recta y plano**
*Usuario*: "Busca la intersección de la recta r (A,B) con el plano P."
*Tu Respuesta Interna*:
1.  add_point(A...)
2.  add_point(B...)
3.  add_line_by_points(r, A, B...)
4.  add_plane_by_traces(P...)
5.  intersection_line_plane(Solucion, r, P...)
(Todo esto se traduce en bloques JSON de tipo "function")

**Caso 2: Perpendicularidad**
*Usuario*: "Recta por P perpendicular al plano Beta."
*Tu Respuesta Interna*:
1.  add_point(P...)
2.  add_plane_by_traces(Beta...)
3.  add_perpendicular_line_to_plane(Solucion, Beta, P...)

🌟 TU ESTILO DE RESPUESTA AL USUARIO (TEXTO FINAL):
Sé profesional, técnico pero claro. "He generado los elementos...". NO muestres el JSON al usuario, eso es para el sistema.`;

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
    },
    {
        name: "calculate_math",
        description: "Realiza cálculos matemáticos complejos. ÚSALO SOLO COMO ÚLTIMA OPCIÓN si no puedes resolverlo geométricamente.",
        parameters: {
            type: "object",
            properties: {
                expression: {
                    type: "string",
                    description: "Expresión matemática a evaluar (ej: 'sqrt(4^2 + 3^2)', 'sin(45 deg)')"
                },
                step_description: {
                    type: "string",
                    description: "Qué estás calculando"
                }
            },
            required: ["expression", "step_description"]
        }
    }
];
