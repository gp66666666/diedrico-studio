import { GeometryElement, LineElement, PlaneElement, PointElement } from '../../../types';

// ==========================================
// DEFINICIONES DE HERRAMIENTAS AVANZADAS
// ==========================================

export const AI_ADVANCED_TOOLS_DEFINITIONS = [
    {
        name: "add_parallel_line",
        description: "¡USA ESTA HERRAMIENTA para crear paralelas! Crea una recta paralela a otra existente por un punto. NO calcules coordenadas manualmente.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre de la solución (ej: 's (solución)')" },
                reference_line_name: { type: "string", description: "Nombre de la recta de referencia existente" },
                point_name: { type: "string", description: "Nombre del punto existente por donde pasa" },
                color: { type: "string", description: "Usa '#FFD700' (Dorado) o '#00FFFF' (Cian) para la solución" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "reference_line_name", "point_name", "color", "step_description"]
        }
    },
    {
        name: "add_perpendicular_line_to_plane",
        description: "Crea una recta perpendicular a un plano existente, pasando por un punto existente.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre de la nueva recta" },
                plane_name: { type: "string", description: "Nombre del plano existente" },
                point_name: { type: "string", description: "Nombre del punto existente" },
                color: { type: "string", description: "Color hexadecimal (ej: '#FF00FF')" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "plane_name", "point_name", "color", "step_description"]
        }
    },
    {
        name: "add_perpendicular_plane_to_line",
        description: "Crea un plano perpendicular a una recta existente, pasando por un punto existente.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre del nuevo plano" },
                line_name: { type: "string", description: "Nombre de la recta existente" },
                point_name: { type: "string", description: "Nombre del punto existente" },
                color: { type: "string", description: "Color hexadecimal" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "line_name", "point_name", "color", "step_description"]
        }
    },
    {
        name: "rotate_point_around_axis",
        description: "Gira un punto alrededor de un eje (recta) un ángulo determinado.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre del nuevo punto girado (ej: A')" },
                point_name: { type: "string", description: "Nombre del punto a girar" },
                axis_name: { type: "string", description: "Nombre de la recta eje" },
                angle: { type: "number", description: "Ángulo en grados (positivo = antihorario)" },
                color: { type: "string", description: "Color hexadecimal" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "point_name", "axis_name", "angle", "color", "step_description"]
        }
    },
    {
        name: "add_plane_perp_to_2_planes",
        description: "Crea un plano perpendicular a otros dos planos existentes, pasando por un punto.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre del nuevo plano" },
                plane1_name: { type: "string", description: "Nombre del primer plano" },
                plane2_name: { type: "string", description: "Nombre del segundo plano" },
                point_name: { type: "string", description: "Nombre del punto de paso" },
                color: { type: "string", description: "Color hexadecimal" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "plane1_name", "plane2_name", "point_name", "color", "step_description"]
        }
    },
    {
        name: "add_line_parallel_to_2_planes",
        description: "Crea una recta paralela a otros dos planos (paralela a su intersección), pasando por un punto.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre de la nueva recta" },
                plane1_name: { type: "string", description: "Nombre del primer plano" },
                plane2_name: { type: "string", description: "Nombre del segundo plano" },
                point_name: { type: "string", description: "Nombre del punto de paso" },
                color: { type: "string", description: "Color hexadecimal" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "plane1_name", "plane2_name", "point_name", "color", "step_description"]
        }
    },
    {
        name: "add_plane_parallel_to_plane",
        description: "Crea un plano paralelo a otro plano existente, pasando por un punto.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre del nuevo plano" },
                plane_name: { type: "string", description: "Nombre del plano de referencia" },
                point_name: { type: "string", description: "Nombre del punto de paso" },
                color: { type: "string", description: "Color hexadecimal" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "plane_name", "point_name", "color", "step_description"]
        }
    },
    {
        name: "add_plane_parallel_to_2_lines",
        description: "Crea un plano paralelo a dos rectas existentes, pasando por un punto.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre del nuevo plano" },
                line1_name: { type: "string", description: "Nombre de la primera recta" },
                line2_name: { type: "string", description: "Nombre de la segunda recta" },
                point_name: { type: "string", description: "Nombre del punto de paso" },
                color: { type: "string", description: "Color hexadecimal" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "line1_name", "line2_name", "point_name", "color", "step_description"]
        }
    },
    {
        name: "intersection_line_plane",
        description: "Encuentra el punto de intersección entre una recta y un plano.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre del punto solución" },
                line_name: { type: "string", description: "Nombre de la recta" },
                plane_name: { type: "string", description: "Nombre del plano" },
                color: { type: "string", description: "Color de la solución" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "line_name", "plane_name", "color", "step_description"]
        }
    },
    {
        name: "intersection_plane_plane",
        description: "Encuentra la recta intersección entre dos planos.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre de la recta solución" },
                plane1_name: { type: "string", description: "Nombre del primer plano" },
                plane2_name: { type: "string", description: "Nombre del segundo plano" },
                color: { type: "string", description: "Color de la solución" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "plane1_name", "plane2_name", "color", "step_description"]
        }
    },
    {
        name: "intersection_line_line",
        description: "Encuentra el punto de intersección entre dos rectas (si se cortan).",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nombre del punto solución" },
                line1_name: { type: "string", description: "Nombre de la primera recta" },
                line2_name: { type: "string", description: "Nombre de la segunda recta" },
                color: { type: "string", description: "Color de la solución" },
                step_description: { type: "string", description: "Explicación" }
            },
            required: ["name", "line1_name", "line2_name", "color", "step_description"]
        }
    }
];

// ==========================================
// LÓGICA DE EJECUCIÓN
// ==========================================

export const executeAdvancedTool = (
    toolName: string,
    params: any,
    elements: GeometryElement[],
    addElement: (el: GeometryElement) => void
): boolean => {
    try {
        switch (toolName) {
            case 'add_parallel_line':
                return createParallelLine(params, elements, addElement);
            case 'add_perpendicular_line_to_plane':
                return createPerpLineToPlane(params, elements, addElement);
            case 'add_perpendicular_plane_to_line':
                return createPerpPlaneToLine(params, elements, addElement);
            case 'rotate_point_around_axis':
                return rotatePointAroundAxis(params, elements, addElement);
            case 'add_plane_perp_to_2_planes':
                return createPlanePerpTo2Planes(params, elements, addElement);
            case 'add_line_parallel_to_2_planes':
                return createLineParallelTo2Planes(params, elements, addElement);
            case 'add_plane_parallel_to_plane':
                return createPlaneParallelToPlane(params, elements, addElement);
            case 'add_plane_parallel_to_2_lines':
                return createPlaneParallelTo2Lines(params, elements, addElement);
            case 'intersection_line_plane':
                return createIntersectionLinePlane(params, elements, addElement);
            case 'intersection_plane_plane':
                return createIntersectionPlanePlane(params, elements, addElement);
            case 'intersection_line_line':
                return createIntersectionLineLine(params, elements, addElement);
            default:
                return false;
        }
    } catch (error) {
        console.error(`Error executing advanced tool ${toolName}:`, error);
        return false;
    }
};

// --- IMPLEMENTACIONES ---

const createParallelLine = (params: any, elements: GeometryElement[], addElement: (el: GeometryElement) => void): boolean => {
    const refLine = elements.find(e => e.name === params.reference_line_name && e.type === 'line') as LineElement;
    const point = elements.find(e => e.name === params.point_name && e.type === 'point') as PointElement;

    if (!refLine || !point) return false;

    const pointCoords = point.coords || (point as any).coords; // Fallback just in case
    const direction = refLine.direction;

    // Create p2 for visualization (10 units away)
    const p2 = {
        x: pointCoords.x + direction.x * 10,
        y: pointCoords.y + direction.y * 10,
        z: pointCoords.z + direction.z * 10
    };

    addElement({
        id: Math.random().toString(36).substr(2, 9),
        type: 'line',
        name: params.name,
        point: pointCoords,
        p2: p2,
        direction: direction,
        color: params.color || '#00FF00',
        visible: true
    } as LineElement);

    return true;
};

const createPerpLineToPlane = (params: any, elements: GeometryElement[], addElement: (el: GeometryElement) => void): boolean => {
    const plane = elements.find(e => e.name === params.plane_name && e.type === 'plane') as PlaneElement;
    const point = elements.find(e => e.name === params.point_name && e.type === 'point') as PointElement;

    if (!plane || !point) return false;

    const pointCoords = point.coords;
    const direction = plane.normal;

    const p2 = {
        x: pointCoords.x + direction.x * 10,
        y: pointCoords.y + direction.y * 10,
        z: pointCoords.z + direction.z * 10
    };

    addElement({
        id: Math.random().toString(36).substr(2, 9),
        type: 'line',
        name: params.name,
        point: pointCoords,
        p2: p2,
        direction: direction,
        color: params.color || '#FF00FF',
        visible: true
    } as LineElement);

    return true;
};

const createPerpPlaneToLine = (params: any, elements: GeometryElement[], addElement: (el: GeometryElement) => void): boolean => {
    const line = elements.find(e => e.name === params.line_name && e.type === 'line') as LineElement;
    const point = elements.find(e => e.name === params.point_name && e.type === 'point') as PointElement;

    if (!line || !point) return false;

    const pointCoords = point.coords;
    const normal = line.direction;
    const constant = normal.x * pointCoords.x + normal.y * pointCoords.y + normal.z * pointCoords.z;

    addElement({
        id: Math.random().toString(36).substr(2, 9),
        type: 'plane',
        name: params.name,
        normal: normal,
        constant: constant,
        color: params.color || '#FF00FF',
        visible: true
    } as PlaneElement);

    return true;
};

const rotatePointAroundAxis = (params: any, elements: GeometryElement[], addElement: (el: GeometryElement) => void): boolean => {
    const point = elements.find(e => e.name === params.point_name && e.type === 'point') as PointElement;
    const axis = elements.find(e => e.name === params.axis_name && e.type === 'line') as LineElement;

    if (!point || !axis) return false;

    const angleDeg = params.angle;
    const angleRad = (angleDeg * Math.PI) / 180;
    const P = point.coords;
    const A0 = axis.point;
    const u = axis.direction;

    // Normalize u
    const uMag = Math.sqrt(u.x ** 2 + u.y ** 2 + u.z ** 2);
    const ux = u.x / uMag;
    const uy = u.y / uMag;
    const uz = u.z / uMag;

    const v = { x: P.x - A0.x, y: P.y - A0.y, z: P.z - A0.z };

    const dotUV = ux * v.x + uy * v.y + uz * v.z;

    const crossUV = {
        x: uy * v.z - uz * v.y,
        y: uz * v.x - ux * v.z,
        z: ux * v.y - uy * v.x
    };

    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const oneMinusCos = 1 - cos;

    const vRot = {
        x: v.x * cos + crossUV.x * sin + ux * dotUV * oneMinusCos,
        y: v.y * cos + crossUV.y * sin + uy * dotUV * oneMinusCos,
        z: v.z * cos + crossUV.z * sin + uz * dotUV * oneMinusCos
    };

    const P_new = {
        x: A0.x + vRot.x,
        y: A0.y + vRot.y,
        z: A0.z + vRot.z
    };

    addElement({
        id: Math.random().toString(36).substr(2, 9),
        type: 'point',
        name: params.name,
        coords: P_new,
        color: params.color || '#FFA500',
        visible: true
    } as PointElement);

    return true;
};

const createPlanePerpTo2Planes = (params: any, elements: GeometryElement[], addElement: (el: GeometryElement) => void): boolean => {
    const p1 = elements.find(e => e.name === params.plane1_name && e.type === 'plane') as PlaneElement;
    const p2 = elements.find(e => e.name === params.plane2_name && e.type === 'plane') as PlaneElement;
    const point = elements.find(e => e.name === params.point_name && e.type === 'point') as PointElement;

    if (!p1 || !p2 || !point) return false;

    const n1 = p1.normal;
    const n2 = p2.normal;

    // Cross product
    const n3 = {
        x: n1.y * n2.z - n1.z * n2.y,
        y: n1.z * n2.x - n1.x * n2.z,
        z: n1.x * n2.y - n1.y * n2.x
    };

    const P = point.coords;
    const constant = -(n3.x * P.x + n3.y * P.y + n3.z * P.z);

    addElement({
        id: Math.random().toString(36).substr(2, 9),
        type: 'plane',
        name: params.name,
        normal: n3,
        constant: constant,
        color: params.color || '#FF00FF',
        visible: true
    } as PlaneElement);

    return true;
};

const createLineParallelTo2Planes = (params: any, elements: GeometryElement[], addElement: (el: GeometryElement) => void): boolean => {
    const p1 = elements.find(e => e.name === params.plane1_name && e.type === 'plane') as PlaneElement;
    const p2 = elements.find(e => e.name === params.plane2_name && e.type === 'plane') as PlaneElement;
    const point = elements.find(e => e.name === params.point_name && e.type === 'point') as PointElement;

    if (!p1 || !p2 || !point) return false;

    const n1 = p1.normal;
    const n2 = p2.normal;

    // Direction is cross product
    const dir = {
        x: n1.y * n2.z - n1.z * n2.y,
        y: n1.z * n2.x - n1.x * n2.z,
        z: n1.x * n2.y - n1.y * n2.x
    };

    const P = point.coords;
    const p2_vis = {
        x: P.x + dir.x * 10,
        y: P.y + dir.y * 10,
        z: P.z + dir.z * 10
    };

    addElement({
        id: Math.random().toString(36).substr(2, 9),
        type: 'line',
        name: params.name,
        point: P,
        p2: p2_vis,
        direction: dir,
        color: params.color || '#00FF00',
        visible: true
    } as LineElement);

    return true;
};

const createPlaneParallelToPlane = (params: any, elements: GeometryElement[], addElement: (el: GeometryElement) => void): boolean => {
    const plane = elements.find(e => e.name === params.plane_name && e.type === 'plane') as PlaneElement;
    const point = elements.find(e => e.name === params.point_name && e.type === 'point') as PointElement;

    if (!plane || !point) return false;

    const normal = plane.normal;
    const P = point.coords;
    const constant = -(normal.x * P.x + normal.y * P.y + normal.z * P.z);

    addElement({
        id: Math.random().toString(36).substr(2, 9),
        type: 'plane',
        name: params.name,
        normal: normal,
        constant: constant,
        color: params.color || '#00FF00',
        visible: true
    } as PlaneElement);

    return true;
};

const createPlaneParallelTo2Lines = (params: any, elements: GeometryElement[], addElement: (el: GeometryElement) => void): boolean => {
    const l1 = elements.find(e => e.name === params.line1_name && e.type === 'line') as LineElement;
    const l2 = elements.find(e => e.name === params.line2_name && e.type === 'line') as LineElement;
    const point = elements.find(e => e.name === params.point_name && e.type === 'point') as PointElement;

    if (!l1 || !l2 || !point) return false;

    const d1 = l1.direction;
    const d2 = l2.direction;

    // Normal is cross product
    const normal = {
        x: d1.y * d2.z - d1.z * d2.y,
        y: d1.z * d2.x - d1.x * d2.z,
        z: d1.x * d2.y - d1.y * d2.x
    };

    const P = point.coords;
    const constant = -(normal.x * P.x + normal.y * P.y + normal.z * P.z);

    addElement({
        id: Math.random().toString(36).substr(2, 9),
        type: 'plane',
        name: params.name,
        normal: normal,
        constant: constant,
        color: params.color || '#00FF00',
        visible: true
    } as PlaneElement);

    return true;
};
