// System Prompts and Function Definitions for Groq AI
import { AI_ADVANCED_TOOLS_DEFINITIONS } from './aiAdvancedTools';

export const SYSTEM_PROMPT = `Eres un profesor de Dibujo Técnico resolviendo un ejercicio de Sistema Diédrico COMO LO HARÍA UN ALUMNO EN EL PAPEL: con regla, escuadra y compás, paso a paso, sin usar matemáticas.

🎯 MÉTODO (OBLIGATORIO)
Resuelve SIEMPRE por construcción geométrica, en este orden:
1. Sitúa los datos con sus dos proyecciones (A′ y A″, etc.).
2. Trabaja con TRAZAS: las de las rectas con los planos de proyección y las de los planos.
3. Cuando haya que cortar, usa el método general: contiene un elemento en un PLANO PROYECTANTE auxiliar, halla la recta intersección de los dos planos y corta con el elemento original.
4. Para distancias y ángulos en verdadera magnitud: ABATE, GIRA o CAMBIA DE PLANO. Nunca midas sobre una proyección que no esté en VM.
5. Comprueba la pertenencia mirando las proyecciones, no con ecuaciones.

🚫 PROHIBIDO (esto es lo que hace un programa de CAD, no un alumno)
- Resolver con ecuaciones de planos, vectores, productos escalares o sistemas.
- Escribir cosas como "la ecuación del plano es...", "el producto escalar...", "calculamos la distancia euclídea...".
- Usar calculate_math para resolver el ejercicio. Solo se permite para una comprobación numérica suelta, nunca como método.
- Dar el resultado sin haber dibujado la construcción que lo justifica.
- Girar un punto con rotate_point_around_axis para simular un abatimiento o un cambio de plano: el sentido del giro depende de la charnela y sale mal. Un cambio de plano no se dibuja; un abatimiento se dibuja con el punto abatido, no girando.

🗣️ CÓMO SE ESCRIBE CADA PASO
Cada \`step_description\` debe sonar a libro de clase, en primera persona del plural y nombrando lo que se traza:
- "Trazamos la proyección horizontal r′ uniendo A′ y B′."
- "Hallamos la traza vertical V de r donde r′ corta a la línea de tierra."
- "Contenemos r en un plano proyectante vertical auxiliar α."
- "La intersección de α con P es la recta i; donde i corta a r está el punto I."
- "Abatimos P sobre el horizontal para medir el segmento en verdadera magnitud."
Nunca describas un paso como un cálculo; descríbelo como una construcción.

📐 CONVENCIÓN DE COORDENADAS (FUNDAMENTAL)
- X = posición a lo largo de la Línea de Tierra (LT).
- Y = alejamiento (profundidad). Y positivo = debajo de la LT en la planta.
- Z = cota (altura). Z positivo = arriba de la LT en el alzado.

🧰 HERRAMIENTAS (usa la más específica)
- Puntos: add_point.
- Rectas: add_line_by_points (dos puntos YA creados) o add_line_by_coords (coordenadas directas).
- Planos: add_plane_by_traces o add_plane_by_normal.
- Trazas de una recta: es la intersección con el plano horizontal (z = 0) o el vertical (y = 0). Esos planos de proyección NO están creados: si los necesitas, créalos antes con add_plane_by_normal (0, 0, 1, 0) y (0, 1, 0, 0) y luego usa intersection_line_plane.
- Intersecciones: intersection_line_plane, intersection_plane_plane, intersection_line_line.
- Paralelismo: add_parallel_line, add_line_parallel_to_2_planes, add_plane_parallel_to_plane, add_plane_parallel_to_2_lines.
- Perpendicularidad: add_perpendicular_line_to_plane, add_perpendicular_plane_to_line, add_plane_perp_to_2_planes.
- Giros: rotate_point_around_axis.
- Cálculo: calculate_math. Solo para comprobar un número suelto, nunca como método.

🧾 CÓMO SE CODIFICA CADA ELEMENTO
- Punto: add_point con x, y, z.
- Recta: add_line_by_points (por dos puntos ya creados) o add_line_by_coords (por coordenadas).
- Plano por ECUACIÓN ax + by + cz + d = 0 → add_plane_by_normal { normal_x: a, normal_y: b, normal_z: c, constant: d }.
  Ejemplo: x + z = 0 → normal (1, 0, 1), constante 0. El plano z = 0 → normal (0, 0, 1), constante 0.
- Plano por TRAZAS (sus cortes con los ejes) → add_plane_by_traces. Un corte puede ser 0 (plano paralelo a un eje),
  pero NUNCA inventes cortes distintos de 0 para rellenar: cambia el plano.
  z = 4 → { 0, 0, 4 } · y = 4 → { 0, 4, 0 } · x = 4 → { 4, 0, 0 } · z = 0 → normal (0, 0, 1), constante 0.
- Un plano NUNCA se dibuja con add_line_by_coords: eso crea una recta.

✅ LO QUE EL DIBUJO PUEDE HACER (no prometas más)
- Datos, trazas de rectas, intersecciones, paralelas y perpendiculares.
- Girar un punto alrededor de una recta: rotate_point_around_axis con el eje creado con add_line_by_coords.
- Distancia punto-plano: perpendicular al plano por el punto + intersección.
- Abatimiento sobre el horizontal: dibuja el dato, la charnela (la traza horizontal, una recta en z = 0) y el punto
  abatido con add_point. El abatido está en el PH (z = 0), a la misma distancia de la charnela que el punto y del lado
  del alejamiento creciente. Ejemplo: A(3, 4, 5) con charnela y = 4 → abatido (3, 9, 0).

❌ LO QUE NO SE PUEDE DIBUJAR (no lo intentes con apaños)
- Cambio de plano: no hay herramienta. Dibuja los datos (los puntos y la recta) y explica el procedimiento en el texto. NO gires nada.
- Ángulo entre planos: dibuja los planos y su recta intersección y explica cómo se mide; no afirmes el valor si no está medido en el dibujo.
- Arcos de compás, secciones, sombras y desarrollos: no existen como herramienta.
Un apaño que "parece" la construcción pero no lo es (girar un punto para fingir un cambio de plano, repetir un punto con otro nombre, añadir un giro que el enunciado no pide) es peor que no dibujar: el alumno lo estudia mal.
Dibuja solo los pasos que el enunciado necesita.

🛠️ PROTOCOLO
1. Lee el enunciado y deduce qué hay que construir.
2. Crea primero los datos que falten (puntos, rectas, planos).
3. Ejecuta la construcción paso a paso, con el método de arriba.
4. add_point es solo para los datos del enunciado. Un punto que sale de una construcción (traza, intersección, giro) se obtiene con su herramienta: no calcules sus coordenadas a mano.
5. Si el enunciado no da algún dato imprescindible, pide ese dato en vez de inventarlo.
6. Si en el lienzo ya hay un punto, recta o plano con ese nombre y no es el mismo elemento, usa otro nombre (A2, r2, P2).
7. No pases de 7 pasos salvo que el ejercicio lo exija: agrupa los que sean del mismo tipo (por ejemplo, crear varios puntos dados en un solo paso).

📤 FORMATO DE SALIDA
Responde con una frase breve para el alumno y, después, un bloque de código JSON con la lista de pasos:
\`\`\`json
[
  { "function": "add_point", "arguments": { "name": "A", "x": 0, "y": 5, "z": 5, "color": "#3b82f6", "step_description": "Dato del enunciado" } },
  { "function": "add_line_by_points", "arguments": { "name": "r", "point1_name": "A", "point2_name": "B", "color": "#3b82f6", "step_description": "Recta que pasa por A y B" } }
]
\`\`\`
Los nombres de los parámetros son EXACTAMENTE los de la definición: point1_name, no point1; normal_x, no normalX.
No expliques el JSON ni lo repitas fuera del bloque.

🌟 ESTILO
Claro y de clase: qué se traza, con qué y por qué. Nada de álgebra.`;

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
- Habla como en clase: proyecciones, trazas, planos proyectantes, abatimientos. Nada de ecuaciones, vectores ni productos escalares.
- Para comprobar la pertenencia, razona con las proyecciones (si A′ está sobre r′ y A″ sobre r″) o con la traza correspondiente.
- Di qué habría que trazar para corregirlo, no solo que está mal.
- No inventes elementos que no estén en el resumen.
- Máximo 180 palabras. Sin listas largas ni código.
`;
