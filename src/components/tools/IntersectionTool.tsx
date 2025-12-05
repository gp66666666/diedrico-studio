import { useEffect, useRef } from 'react';
import { useGeometryStore } from '../../store/geometryStore';
import { LineElement, PlaneElement, PointElement } from '../../types';

export default function IntersectionTool() {
    const { activeTool, elements, addElement, setActiveTool, selectElement, selectedElementId } = useGeometryStore();
    const selectedElements = useRef<string[]>([]);

    useEffect(() => {
        // Reset when tool becomes inactive
        if (!activeTool || !activeTool.startsWith('intersection')) {
            selectedElements.current = [];
            return;
        }
    }, [activeTool]);

    useEffect(() => {
        // Handle element selection
        if (!selectedElementId || !activeTool?.startsWith('intersection')) return;

        const el = elements.find(e => e.id === selectedElementId);
        if (!el) return;

        // Check if already selected
        if (selectedElements.current.includes(selectedElementId)) return;

        // Add to selected
        selectedElements.current.push(selectedElementId);

        // Check if we have enough elements
        const requiredCount = 2; // All intersection types need 2 elements
        if (selectedElements.current.length === requiredCount) {
            calculateIntersection();
            selectedElements.current = [];
            selectElement(null);
        }
    }, [selectedElementId]);

    const calculateIntersection = () => {
        const [id1, id2] = selectedElements.current;
        const el1 = elements.find(e => e.id === id1);
        const el2 = elements.find(e => e.id === id2);

        if (!el1 || !el2) return;

        try {
            switch (activeTool) {
                case 'intersection-line-line':
                    if (el1.type === 'line' && el2.type === 'line') {
                        intersectLines(el1 as LineElement, el2 as LineElement);
                    } else {
                        alert('Selecciona dos rectas.');
                    }
                    break;
                case 'intersection-line-plane':
                    if (el1.type === 'line' && el2.type === 'plane') {
                        intersectLinePlane(el1 as LineElement, el2 as PlaneElement);
                    } else if (el1.type === 'plane' && el2.type === 'line') {
                        intersectLinePlane(el2 as LineElement, el1 as PlaneElement);
                    } else {
                        alert('Selecciona una recta y un plano.');
                    }
                    break;
                case 'intersection-plane-plane':
                    if (el1.type === 'plane' && el2.type === 'plane') {
                        intersectPlanes(el1 as PlaneElement, el2 as PlaneElement);
                    } else {
                        alert('Selecciona dos planos.');
                    }
                    break;
            }
        } catch (error) {
            console.error('Intersection error:', error);
            alert('Error al calcular la intersección.');
        }

        setActiveTool('none');
    };

    const intersectLines = (line1: LineElement, line2: LineElement) => {
        // Get line parameters
        const P1 = line1.point;
        const d1 = line1.direction;
        const P2 = line2.point;
        const d2 = line2.direction;

        // Cross product to check if parallel
        const cross = {
            x: d1.y * d2.z - d1.z * d2.y,
            y: d1.z * d2.x - d1.x * d2.z,
            z: d1.x * d2.y - d1.y * d2.x
        };

        const crossMag = Math.sqrt(cross.x ** 2 + cross.y ** 2 + cross.z ** 2);

        if (crossMag < 1e-6) {
            alert('Las rectas son paralelas o coincidentes.');
            return;
        }

        // Check if lines are coplanar (intersect)
        const P12 = { x: P2.x - P1.x, y: P2.y - P1.y, z: P2.z - P1.z };
        const scalarTriple = P12.x * cross.x + P12.y * cross.y + P12.z * cross.z;

        if (Math.abs(scalarTriple) > 1e-6) {
            alert('Las rectas se cruzan (skew lines). No hay intersección.');
            return;
        }

        // Solve for parameter t where lines intersect
        let t = 0;
        if (Math.abs(d1.x) > Math.abs(d1.y) && Math.abs(d1.x) > Math.abs(d1.z)) {
            const denom = d1.x * d2.y - d1.y * d2.x;
            if (Math.abs(denom) > 1e-6) {
                t = ((P2.x - P1.x) * d2.y - (P2.y - P1.y) * d2.x) / denom;
            } else {
                const denom2 = d1.x * d2.z - d1.z * d2.x;
                t = ((P2.x - P1.x) * d2.z - (P2.z - P1.z) * d2.x) / denom2;
            }
        } else {
            const denom = d1.y * d2.z - d1.z * d2.y;
            if (Math.abs(denom) > 1e-6) {
                t = ((P2.y - P1.y) * d2.z - (P2.z - P1.z) * d2.y) / denom;
            } else {
                const denom2 = d1.x * d2.y - d1.y * d2.x;
                t = ((P2.x - P1.x) * d2.y - (P2.y - P1.y) * d2.x) / denom2;
            }
        }

        // Calculate intersection point
        const intersection = {
            x: P1.x + t * d1.x,
            y: P1.y + t * d1.y,
            z: P1.z + t * d1.z
        };

        // Add intersection point with proper naming using ∩ symbol
        const newElem: PointElement = {
            type: 'point',
            id: Math.random().toString(36).substr(2, 9),
            name: `${line1.name}∩${line2.name}`,
            coords: intersection,
            color: '#ff0000', // Red for intersections
            visible: true
        };

        addElement(newElem);
        console.log('Line-Line Intersection:', intersection);
    };

    const intersectLinePlane = (line: LineElement, plane: PlaneElement) => {
        const P = line.point;
        const d = line.direction;
        const n = plane.normal;
        const D = plane.constant;

        // Check if line is parallel to plane
        const dotND = n.x * d.x + n.y * d.y + n.z * d.z;

        if (Math.abs(dotND) < 1e-6) {
            // Line is parallel to plane
            const distToPlane = n.x * P.x + n.y * P.y + n.z * P.z - D;
            if (Math.abs(distToPlane) < 1e-6) {
                alert('La recta está contenida en el plano.');
            } else {
                alert('La recta es paralela al plano.');
            }
            return;
        }

        // Calculate parameter t - Fixed formula
        const t = (D - (n.x * P.x + n.y * P.y + n.z * P.z)) / dotND;

        // Calculate intersection point
        const intersection = {
            x: P.x + t * d.x,
            y: P.y + t * d.y,
            z: P.z + t * d.z
        };

        // Add intersection point with proper naming using ∩ symbol
        const newElem: PointElement = {
            type: 'point',
            id: Math.random().toString(36).substr(2, 9),
            name: `${line.name}∩${plane.name}`,
            coords: intersection,
            color: '#ff0000',
            visible: true
        };

        addElement(newElem);
        console.log('Line-Plane Intersection:', intersection);
    };

    const intersectPlanes = (plane1: PlaneElement, plane2: PlaneElement) => {
        const n1 = plane1.normal;
        const D1 = plane1.constant;
        const n2 = plane2.normal;
        const D2 = plane2.constant;

        // Check if planes are parallel
        const cross = {
            x: n1.y * n2.z - n1.z * n2.y,
            y: n1.z * n2.x - n1.x * n2.z,
            z: n1.x * n2.y - n1.y * n2.x
        };

        const crossMag = Math.sqrt(cross.x ** 2 + cross.y ** 2 + cross.z ** 2);

        if (crossMag < 1e-6) {
            alert('Los planos son paralelos o coincidentes.');
            return;
        }

        // Direction of intersection line is cross product of normals
        const direction = cross;

        // Find a point on the intersection line
        let point: { x: number; y: number; z: number } | undefined;

        if (Math.abs(cross.z) > 1e-6) {
            // Set z = 0, solve for x and y
            // n1.x*x + n1.y*y = D1
            // n2.x*x + n2.y*y = D2
            const denom = n1.x * n2.y - n1.y * n2.x;
            if (Math.abs(denom) > 1e-6) {
                const x = (D1 * n2.y - D2 * n1.y) / denom;
                const y = (D2 * n1.x - D1 * n2.x) / denom;
                point = { x, y, z: 0 };
            }
        }

        if (!point && Math.abs(cross.y) > 1e-6) {
            // Set y = 0, solve for x and z
            const denom = n1.x * n2.z - n1.z * n2.x;
            if (Math.abs(denom) > 1e-6) {
                const x = (D1 * n2.z - D2 * n1.z) / denom;
                const z = (D2 * n1.x - D1 * n2.x) / denom;
                point = { x, y: 0, z };
            }
        }

        if (!point && Math.abs(cross.x) > 1e-6) {
            // Set x = 0, solve for y and z
            const denom = n1.y * n2.z - n1.z * n2.y;
            if (Math.abs(denom) > 1e-6) {
                const y = (D1 * n2.z - D2 * n1.z) / denom;
                const z = (D2 * n1.y - D1 * n2.y) / denom;
                point = { x: 0, y, z };
            }
        }

        if (!point) {
            alert('Error calculando la intersección de planos.');
            return;
        }

        // Calculate p2 for the line (required by LineElement)
        const p2 = {
            x: point.x + direction.x,
            y: point.y + direction.y,
            z: point.z + direction.z
        };

        // Add intersection line with proper naming using ∩ symbol
        const newElem: LineElement = {
            type: 'line',
            id: Math.random().toString(36).substr(2, 9),
            name: `${plane1.name}∩${plane2.name}`,
            color: '#9b59b6', // Purple for plane intersections
            point: point,
            p2: p2,
            direction: direction,
            visible: true
        };

        addElement(newElem);
        console.log('Plane-Plane Intersection Line:', { point, direction });
    };

    return null;
}
