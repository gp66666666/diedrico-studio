// AI Step Executor - Executes construction steps on the geometry store
import { useGeometryStore } from '../../../store/geometryStore';
import type { AIStep } from '../types/ai.types';

export class AIExecutor {
    async executeStep(step: AIStep): Promise<void> {
        const store = useGeometryStore.getState();

        try {
            switch (step.action) {
                case 'add_point':
                    this.executeAddPoint(step, store);
                    break;

                case 'add_line_by_points':
                    this.executeAddLineByPoints(step, store);
                    break;

                case 'add_plane_by_normal':
                    this.executeAddPlaneByNormal(step, store);
                    break;

                case 'add_plane_by_traces':
                    this.executeAddPlaneByTraces(step, store);
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

                default:
                    throw new Error(`Unknown action: ${step.action}`);
            }
        } catch (error: any) {
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

        // Helper to find point by name with priority: Exact match > Case-insensitive match > Contains match
        const findPoint = (searchName: string) => {
            if (!searchName) return null;
            const elements = store.elements.filter((el: any) => el.type === 'point');

            // 1. Exact match (e.g. "A" === "A")
            let found = elements.find((el: any) => el.name === searchName);
            if (found) return found;

            // 2. Case-insensitive match (e.g. "a" === "A")
            found = elements.find((el: any) => el.name.toLowerCase() === searchName.toLowerCase());
            if (found) return found;

            // 3. "Punto X" match (e.g. search "A", find "Punto A")
            found = elements.find((el: any) => el.name.toLowerCase() === `punto ${searchName.toLowerCase()}`);
            if (found) return found;

            // 4. Contains match (fallback)
            return elements.find((el: any) => el.name.toLowerCase().includes(searchName.toLowerCase()));
        };

        const p1 = findPoint(point1_name);
        const p2 = findPoint(point2_name);

        if (!p1 || !p2) {
            throw new Error(`Puntos "${point1_name}" o "${point2_name}" no encontrados. Asegúrate de crearlos primero.`);
        }

        // Calculate direction vector
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

        store.addElement({
            type: 'line',
            point: p1.coords,
            direction,
            color: color || step.color,
            name: name || `r${Date.now()}`,
            p2: p2.coords,
            lineType: 'generic'
        });
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
}

export const aiExecutor = new AIExecutor();
