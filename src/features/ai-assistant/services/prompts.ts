// System Prompts and Function Definitions for Groq AI
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
5.  **ÁNGULOS**: El ángulo de una recta con los planos de proyección se halla mediante su abatimiento sobre ellos. El ángulo entre dos planos es el ángulo entre sus rectas de máxima pendiente.
6.  **PERTENENCIA**: Un punto pertenece a una recta si sus proyecciones están en las de la recta. Una recta pertenece a un plano si sus trazas están en las del plano.

📐 CONVENCIÓN DE COORDENADAS (FUNDAMENTAL):
*   **X** = Posición horizontal a lo largo de la Línea de Tierra (LT).
*   **Y** = ALEJAMIENTO (profundidad/distancia al Plano Vertical). Y positivo = punto situado debajo de la LT en la vista 2D (proyección horizontal, planta).
*   **Z** = COTA (altura). Z positivo = punto situado arriba de la LT en la vista 2D (proyección vertical, alzado).
*   Ejemplo: Punto A(3, 2, 4) → X=3 (posición en LT), alejamiento=2 (debajo de LT), cota=4 (arriba de LT).

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

export const EXERCISE_GENERATOR_PROMPT = `Eres un experto en Dibujo Técnico y Sistema Diédrico.
Tu tarea es GENERAR enunciados de ejercicios técnicos basados en la petición del usuario.

REGLAS DE GENERACIÓN:
- **CREATIVIDAD TÉCNICA**: Genera un enunciado claro, preciso y profesional.
- **DIBUJO DIÉDRICO**: El enunciado debe ser sobre puntos, rectas, planos, intersecciones, distancias, etc. en sistema diédrico.
- **TÍTULO OPCIONAL**: El enunciado puede empezar con un título corto (ej. "Ejercicio 1: Intersección"), seguido de UN SALTO DE LÍNEA (\\n) y luego el cuerpo del enunciado.
- **SOLO EL ENUNCIADO**: No intentes resolver el ejercicio ni dar coordenadas. Solo el texto del enunciado.
- **JSON ESTRICTO**: Devuelve siempre un objeto JSON.

FORMATO DE SALIDA:
{
  "statement": "Ejercicio 234\\nDada la recta r..."
}

Ejemplo:
User: "Uno de intersección de plano con recta"
AI: { "statement": "Ejercicio de Intersección\\n\\nDada la recta r que pasa por A(20, 30, 40) y B(50, 10, 10), halla su punto de intersección con el plano P definido por sus trazas x=10, y=20, z=30..." }`;


export const FUNCTION_DEFINITIONS = [
    ...AI_ADVANCED_TOOLS_DEFINITIONS,
    {
        name: "add_point",
        description: "Añade un punto en el espacio 3D con coordenadas (x, y, z). CONVENCIÓN: X = posición horizontal a lo largo de la Línea de Tierra, Y = alejamiento (profundidad, positivo = debajo de LT en 2D), Z = cota (altura, positivo = arriba de LT en 2D)",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Nombre del punto (ej: 'A', 'B1', 'P')"
                },
                x: {
                    type: "number",
                    description: "Coordenada X (posición horizontal a lo largo de la Línea de Tierra)"
                },
                y: {
                    type: "number",
                    description: "Coordenada Y (alejamiento en Sistema Diédrico: distancia al PV. Positivo = debajo de LT en vista 2D)"
                },
                z: {
                    type: "number",
                    description: "Coordenada Z (cota en Sistema Diédrico: altura. Positivo = arriba de LT en vista 2D)"
                },
                color: {
                    type: "string",
                    description: "Color en formato hexadecimal (ej: '#3b82f6')"
                },
                step_description: {
                    type: "string",
                    description: "Explicación breve de por qué se crea este punto"
                },
                label: {
                    type: "string",
                    description: "Etiqueta numérica o texto corto (ej: '1', '2') para indicar el orden"
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
                    description: "Corte con eje X (posición horizontal en LT)"
                },
                y_intercept: {
                    type: "number",
                    description: "Corte con eje Y (alejamiento)"
                },
                z_intercept: {
                    type: "number",
                    description: "Corte con eje Z (cota/altura)"
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
    },
    {
        name: "draw_arc",
        description: "Dibuja un arco de compás (útil para mostrar procedimientos de giro o transporte de distancias)",
        parameters: {
            type: "object",
            properties: {
                center_x: { type: "number", description: "X del centro del arco (posición horizontal en LT)" },
                center_y: { type: "number", description: "Y del centro (alejamiento en Planta)" },
                center_z: { type: "number", description: "Z del centro (cota/altura en Alzado)" },
                radius: { type: "number", description: "Radio del arco en mm" },
                start_angle: { type: "number", description: "Ángulo inicial en radianes" },
                end_angle: { type: "number", description: "Ángulo final en radianes" },
                label: { type: "string", description: "Etiqueta opcional (ej: '1')" },
                step_description: { type: "string", description: "Descripción del paso" }
            },
            required: ["center_x", "center_y", "center_z", "radius", "start_angle", "end_angle", "step_description"]
        }
    }
];

/**
 * Revisión de un ejercicio ya dibujado.
 * Se le pasa el enunciado y un resumen con las coordenadas exactas de lo que
 * hay en el lienzo, para que pueda comprobar la construcción en vez de resolverla.
 */
export const REVIEW_PROMPT = `Eres un profesor de Dibujo Técnico y Sistema Diédrico corrigiendo el ejercicio de un alumno.

Recibirás:
1. El enunciado del ejercicio.
2. Un resumen de los elementos que el alumno ha dibujado, con sus coordenadas exactas.

Tu tarea es COMPROBAR la construcción, no resolverla desde cero.

Responde en español, en texto normal (nada de JSON), con este orden:
- Veredicto en una línea: "Está bien", "Está casi" o "Hay un error".
- Qué está correcto (1-2 frases).
- Si hay un error: cuál es, en qué elemento, y cómo corregirlo (coordenadas o pasos concretos).
- Si falta algo del enunciado, dilo.

Reglas:
- Usa las coordenadas del resumen; si un punto no pertenece a una recta o a un plano, dilo con el cálculo.
- No inventes elementos que no estén en el resumen.
- Máximo 180 palabras. Sin listas largas ni código.
`;
