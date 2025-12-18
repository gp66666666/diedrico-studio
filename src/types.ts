export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

// Alias for compatibility
export type Vec3 = Vector3;

export interface CloudProject {
    id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    data: {
        elements: GeometryElement[];
        sketchElements: SketchElement[];
    };
}

export interface BaseElement {
    id: string;
    type: 'point' | 'line' | 'plane' | 'solid';
    name: string;
    color: string;
    visible: boolean;
}

export interface PointElement extends BaseElement {
    type: 'point';
    coords: Vector3;
}

export interface LineElement extends BaseElement {
    type: 'line';
    point: Vector3;
    direction: Vector3;
    p2?: Vector3; // Optional second point if defined by 2 points
    dashed?: boolean;
    isInfinite?: boolean; // If true, drawn as infinite line
}

export interface PlaneElement extends BaseElement {
    type: 'plane';
    normal: Vector3;
    constant: number;
}

export interface SolidElement extends BaseElement {
    type: 'solid';
    position: Vector3;
    size: Vector3;
    opacity?: number;
}

export type GeometryElement = PointElement | LineElement | PlaneElement | SolidElement;

// Sketch Types
export type SketchTool =
    | 'select' | 'point' | 'segment' | 'ray' | 'line'
    | 'circle' | 'arc' | 'polygon' | 'ellipse' | 'parabola' | 'hyperbola'
    | 'text' | 'eraser' | 'rotate' | 'scale'
    | 'mediatriz' | 'bisectriz' | 'tangent' | 'measure';

export interface SketchElement {
    id: string;
    type: 'point' | 'segment' | 'ray' | 'line' | 'circle' | 'arc' | 'polygon' | 'text' | 'ellipse' | 'parabola' | 'hyperbola';
    p1: { x: number; y: number }; // Start / Center
    p2: { x: number; y: number }; // For text, p2 can be ignored or used for sizing
    p3?: { x: number; y: number }; // Arc end point / Polygon vertex / Ellipse minor axis point
    extra?: number; // sides for polygon
    color?: string;
    text?: string;
    rotation?: number; // in radians
}

// Academy Types
export interface AcademyExercise {
    id: string;
    title: string;
    level: 'Fácil' | 'Medio' | 'Difícil';
    statement: string;
    setup: Partial<GeometryElement>[];
    solutionHint?: string;
}

export interface AcademyTopic {
    id: string;
    title: string;
    description: string;
    category: string;
    theory: string; // ✅ añadida para que coincida con AcademyPage.tsx
    theoryContent?: string | React.ReactNode; // mantenida como opcional para compatibilidad
    exercises: AcademyExercise[];
}