// AI Step Executor - Executes construction steps on the geometry store
import { useGeometryStore } from '../../../store/geometryStore';
import type { AIStep } from '../types/ai.types';
import { executeAdvancedTool } from './aiAdvancedTools';
import { evaluate } from 'mathjs';

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
                        console.warn(`[AI Executor] Unknown action: ${step.action}`);
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

        store.addElement({
            type: 'point',
            coords: { x, y, z },
            color: color || step.color,
            name: name || `P${Date.now()}`
        });
    }

    private executeAddLineByPoints(step: AIStep, store: any): void {
        const { name, point1_name, point2_name, color } = step.params;
        console.log('[AI] 🔍 Finding points:', point1_name, 'and', point2_name);

        // Get all available points
        const points = store.elements.filter((el: any) => el.type === 'point');
        console.log('[AI] 📍 Available points:', points.map((p: any) => p.name));

        // Helper to find point by name with priority: Exact match > Case-insensitive match > Contains match
        const findPoint = (searchName: string) => {
            if (!searchName) return null;

            // 1. Exact match (e.g. "A" === "A")
            let found = points.find((el: any) => el.name === searchName);
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

    private executeCalculateMath(step: AIStep): void {
        const { expression } = step.params;
        try {
            const result = evaluate(expression);
            console.log(`[AI Math] ${expression} = ${result}`);
            window.alert(`🧮 Cálculo IA: ${expression} = ${result}`);
        } catch (error) {
            console.error('[AI Math] Error calculating:', error);
            window.alert(`❌ Error de cálculo: ${expression}`);
        }
    }
}

export const aiExecutor = new AIExecutor();
