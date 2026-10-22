// AI Step Executor - Executes construction steps on the geometry store
import { useGeometryStore } from '../../../store/geometryStore';
import type { AIStep } from '../types/ai.types';
import { executeAdvancedTool } from './aiAdvancedTools';
import { toast } from '../../../lib/toast';

/**
 * Alias de nombres dentro de una misma ejecución.
 * Si el lienzo ya tiene un punto "A" distinto del que va a crear la IA, el
 * nuevo se llama "A2" y los pasos siguientes ("recta por A y B") se traducen
 * a ese nombre. Sin esto, la recta se enganchaba al A antiguo.
 */
const aliases = new Map<string, string>();

export function resetNameAliases(): void {
    aliases.clear();
}

const resolveName = (name: string): string => aliases.get(name) ?? name;

const uniqueName = (base: string, elements: any[]): string => {
    const taken = new Set(elements.map((el: any) => el.name));
    if (!taken.has(base)) return base;
    let i = 2;
    while (taken.has(`${base}${i}`)) i++;
    return `${base}${i}`;
};

export class AIExecutor {
    async executeStep(step: AIStep): Promise<void> {
        console.log('[AI Executor] 🚀 Starting step:', step.stepNumber, '-', step.action);
        console.log('[AI Executor] Parameters:', JSON.stringify(step.params, null, 2));

        const store = useGeometryStore.getState();

        try {
            switch (step.action) {
                case 'add_point':
                    console.log('[AI] Creating point...');
                    this.executeAddPoint(step, store);
                    console.log('[AI] ✓ Point created');
                    break;

                case 'add_line_by_points':
                    console.log('[AI] Creating line by points...');
                    this.executeAddLineByPoints(step, store);
                    console.log('[AI] ✓ Line created');
                    break;

                case 'add_plane_by_normal':
                    console.log('[AI] Creating plane by normal...');
                    this.executeAddPlaneByNormal(step, store);
                    console.log('[AI] ✓ Plane created');
                    break;

                case 'add_plane_by_traces':
                    console.log('[AI] Creating plane by traces...');
                    this.executeAddPlaneByTraces(step, store);
                    console.log('[AI] ✓ Plane created');
                    break;

                case 'set_view_mode':
                    this.executeSetViewMode(step, store);
                    break;

                case 'toggle_visibility':
                    this.executeToggleVisibility(step, store);
                    break;

                case 'clear_canvas':
                    store.clearAll();
                    break;

                case 'delete_element':
                    this.executeDeleteElement(step, store);
                    break;


                case 'add_line_by_coords':
                    console.log('[AI] Creating line by coords...');
                    this.executeAddLineByCoords(step, store);
                    console.log('[AI] ✓ Line by coords created');
                    break;

                case 'calculate_math':
                    this.executeCalculateMath(step);
                    break;

                default:
                    // Try to execute as an advanced tool
                    const advancedResult = executeAdvancedTool(step.action, step.params, store.elements, store.addElement);
                    if (advancedResult) {
                        console.log(`[AI] ✓ Advanced tool ${step.action} executed successfully`);
                    } else {
                        // Nunca en silencio: si el paso no se puede aplicar, el alumno
                        // tiene que verlo en vez de quedarse con un dibujo a medias.
                        throw new Error(
                            `La herramienta "${step.action}" no se pudo aplicar: faltan datos o los elementos a los que se refiere no existen.`,
                        );
                    }
            }
            console.log('[AI Executor] ✅ Step completed successfully');
        } catch (error: any) {
            console.error('[AI Executor] ❌ Error in step:', error);
            throw new Error(`Error executing step ${step.stepNumber}: ${error.message}`);
        }
    }

    private executeAddPoint(step: AIStep, store: any): void {
        const { name, x, y, z, color } = step.params;
        const wanted = name || `P${Date.now()}`;

        const existing = store.elements.find(
            (el: any) => el.type === 'point' && el.name === wanted
        );

        if (existing) {
            const same =
                Math.abs(existing.coords.x - x) < 1e-6 &&
                Math.abs(existing.coords.y - y) < 1e-6 &&
                Math.abs(existing.coords.z - z) < 1e-6;

            if (same) {
                // Ya está dibujado: se reutiliza
                aliases.set(wanted, existing.name);
                return;
            }

            const renamed = uniqueName(wanted, store.elements);
            aliases.set(wanted, renamed);
            store.addElement({
                type: 'point',
                coords: { x, y, z },
                color: color || step.color,
                name: renamed,
            });
            return;
        }

        // Un punto "nuevo" en el mismo sitio que otro no dibuja nada: es el mismo
        // punto con otra etiqueta y confunde al alumno. Se reutiliza (y se traduce
        // el nombre en los pasos siguientes).
        const twin = store.elements.find(
            (el: any) =>
                el.type === 'point' &&
                Math.abs(el.coords.x - x) < 1e-6 &&
                Math.abs(el.coords.y - y) < 1e-6 &&
                Math.abs(el.coords.z - z) < 1e-6,
        );
        if (twin) {
            aliases.set(wanted, twin.name);
            return;
        }

        store.addElement({
            type: 'point',
            coords: { x, y, z },
            color: color || step.color,
            name: wanted,
        });
    }

    private executeAddLineByPoints(step: AIStep, store: any): void {
        const { name, color } = step.params;
        // El esquema pide point1_name/point2_name, pero los modelos a veces
        // mandan point1/point2: se aceptan las dos formas en vez de fallar.
        const point1_name = step.params.point1_name ?? step.params.point1;
        const point2_name = step.params.point2_name ?? step.params.point2;
        const p1Name = resolveName(point1_name);
        const p2Name = resolveName(point2_name);
        console.log('[AI] 🔍 Finding points:', p1Name, 'and', p2Name);

        // Get all available points
        const points = store.elements.filter((el: any) => el.type === 'point');
        console.log('[AI] 📍 Available points:', points.map((p: any) => p.name));

        // Helper to find point by name with priority: Exact match > Case-insensitive match > Contains match
        const findPoint = (searchName: string) => {
            if (!searchName) return null;

            // 1. Exact match (e.g. "A" === "A")
            const target = resolveName(searchName);
            let found = points.find((el: any) => el.name === target);
            if (found) {
                console.log('[AI] ✓ Found exact match:', found.name);
                return found;
            }

            // 2. Case-insensitive match (e.g. "a" === "A")
            found = points.find((el: any) => el.name.toLowerCase() === searchName.toLowerCase());
            if (found) {
                console.log('[AI] ✓ Found case-insensitive match:', found.name);
                return found;
            }

            // 3. "Punto X" match (e.g. search "A", find "Punto A")
            found = points.find((el: any) => el.name.toLowerCase() === `punto ${searchName.toLowerCase()}`);
            if (found) {
                console.log('[AI] ✓ Found "Punto X" match:', found.name);
                return found;
            }

            // 4. Contains match (fallback)
            found = points.find((el: any) => el.name.toLowerCase().includes(searchName.toLowerCase()));
            if (found) {
                console.log('[AI] ✓ Found contains match:', found.name);
                return found;
            }

            return null;
        };

        const p1 = findPoint(point1_name);
        const p2 = findPoint(point2_name);

        if (!p1 || !p2) {
            const error = `❌ Puntos "${point1_name}" o "${point2_name}" no encontrados. Asegúrate de crearlos primero.`;
            console.error('[AI]', error);
            throw new Error(error);
        }

        console.log('[AI] ✓ Points found:', p1.name, 'and', p2.name);
        console.log('[AI DEBUG] P1:', JSON.stringify(p1));
        console.log('[AI DEBUG] P2:', JSON.stringify(p2));
        console.log('[AI] 📐 Calculating direction vector...');

        // Calculate direction vector (same as LineCreator)
        const direction = {
            x: p2.coords.x - p1.coords.x,
            y: p2.coords.y - p1.coords.y,
            z: p2.coords.z - p1.coords.z,
        };

        // Normalize
        const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
        }
        console.log('[AI] ✓ Direction vector:', direction);

        console.log('[AI] 📝 Creating line element...');

        // Use same structure as LineCreator - this is proven to work!
        // Misma recta ya dibujada (por los mismos dos puntos): se reutiliza.
        const twin = store.elements.find((el: any) => {
            if (el.type !== 'line' || !el.direction || !el.point) return false;
            const cross = {
                x: el.direction.y * direction.z - el.direction.z * direction.y,
                y: el.direction.z * direction.x - el.direction.x * direction.z,
                z: el.direction.x * direction.y - el.direction.y * direction.x,
            };
            if (Math.hypot(cross.x, cross.y, cross.z) > 1e-6) return false;
            const v = {
                x: p1.coords.x - el.point.x,
                y: p1.coords.y - el.point.y,
                z: p1.coords.z - el.point.z,
            };
            const c2 = {
                x: v.y * el.direction.z - v.z * el.direction.y,
                y: v.z * el.direction.x - v.x * el.direction.z,
                z: v.x * el.direction.y - v.y * el.direction.x,
            };
            return Math.hypot(c2.x, c2.y, c2.z) < 1e-6;
        });
        if (twin) {
            aliases.set(name, twin.name);
            return;
        }

        const lineElement: any = {
            type: 'line',
            name: name || `L${Date.now()}`,
            color: color || step.color || '#ef4444',
            point: p1.coords,
            direction,
            p2: p2.coords
        };

        store.addElement(lineElement);
        console.log('[AI] ✅ Line created successfully:', lineElement.name);
    }

    private executeAddPlaneByNormal(step: AIStep, store: any): void {
        const { name, normal_x, normal_y, normal_z, constant, color } = step.params;

        if (!normal_x && !normal_y && !normal_z) {
            throw new Error('El plano no tiene vector normal: no se puede dibujar.');
        }

        store.addElement({
            type: 'plane',
            normal: { x: normal_x, y: normal_y, z: normal_z },
            constant: constant || 0,
            color: color || step.color,
            name: name || `α${Date.now()}`
        });
    }

    private executeAddPlaneByTraces(step: AIStep, store: any): void {
        const { name, x_intercept, y_intercept, z_intercept, color } = step.params;

        if (x_intercept === undefined || y_intercept === undefined || z_intercept === undefined) {
            throw new Error('Faltan las trazas (x, y, z) para crear el plano');
        }

        // Tres cortes en cero no definen un plano: saldría una normal nula (basura
        // en pantalla). Un plano que pasa por el origen se define por su normal.
        if (x_intercept === 0 && y_intercept === 0 && z_intercept === 0) {
            throw new Error(
                'Un plano no puede tener las tres trazas en cero. Defínelo con add_plane_by_normal.',
            );
        }

        // Note: 0 is a valid trace value (plane parallel to an axis)
        // Handle division by zero for planes parallel to axes
        const nx = x_intercept !== 0 ? 1 / x_intercept : 0;
        const ny = y_intercept !== 0 ? 1 / y_intercept : 0;
        const nz = z_intercept !== 0 ? 1 / z_intercept : 0;

        store.addElement({
            type: 'plane',
            normal: { x: nx, y: ny, z: nz },
            constant: -1,
            color: color || step.color,
            name: name || `α${Date.now()}`
        });
    }

    private executeSetViewMode(step: AIStep, store: any): void {
        const { mode } = step.params;
        if (mode === '3d' || mode === '2d' || mode === 'sketch') {
            store.setViewMode(mode);
        } else {
            throw new Error(`Modo de vista desconocido: ${mode}`);
        }
    }

    private executeToggleVisibility(step: AIStep, store: any): void {
        const { target } = step.params;

        switch (target) {
            case 'intersections':
                store.toggleIntersections();
                break;
            case 'bisectors':
                store.toggleBisectors();
                break;
            case 'flattening':
            case 'abatimiento':
                store.toggleFlattening();
                break;
            case 'profile':
                store.toggleProfile();
                break;
            case 'help':
                store.toggleHelp();
                break;
            default:
                throw new Error(`Objetivo de visibilidad desconocido: ${target}`);
        }
    }

    private executeDeleteElement(step: AIStep, store: any): void {
        const { name } = step.params;

        // Find element by name (case insensitive)
        const element = store.elements.find((el: any) =>
            el.name.toLowerCase() === name.toLowerCase() ||
            el.name.toLowerCase() === `punto ${name.toLowerCase()}` ||
            el.name.toLowerCase() === `recta ${name.toLowerCase()}` ||
            el.name.toLowerCase() === `plano ${name.toLowerCase()}`
        );

        if (element) {
            store.removeElement(element.id);
        } else {
            throw new Error(`Elemento "${name}" no encontrado para eliminar.`);
        }
    }

    private executeAddLineByCoords(step: AIStep, store: any): void {
        const { name, p1_x, p1_y, p1_z, p2_x, p2_y, p2_z, color } = step.params;

        // Calculate direction
        const dx = p2_x - p1_x;
        const dy = p2_y - p1_y;
        const dz = p2_z - p1_z;
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const direction = {
            x: length > 0 ? dx / length : 0,
            y: length > 0 ? dy / length : 0,
            z: length > 0 ? dz / length : 1
        };

        store.addElement({
            type: 'line',
            name: name || `L${Date.now()}`,
            color: color || step.color || '#ef4444',
            point: { x: p1_x, y: p1_y, z: p1_z },
            direction: direction,
            p2: { x: p2_x, y: p2_y, z: p2_z }
        });
    }

    private async executeCalculateMath(step: AIStep): Promise<void> {
        const { expression } = step.params;
        try {
            // mathjs solo se descarga si el asistente tiene que calcular algo
            const { evaluate } = await import('mathjs');
            const result = evaluate(expression);
            console.log(`[AI Math] ${expression} = ${result}`);
            toast(`🧮 Cálculo IA: ${expression} = ${result}`);
        } catch (error) {
            console.error('[AI Math] Error calculating:', error);
            toast(`❌ Error de cálculo: ${expression}`);
        }
    }
}

export const aiExecutor = new AIExecutor();
