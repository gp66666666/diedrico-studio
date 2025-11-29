export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

// Alias for compatibility
export type Vec3 = Vector3;

export interface BaseElement {
    id: string;
    type: 'point' | 'line' | 'plane';
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
}

export interface PlaneElement extends BaseElement {
    type: 'plane';
    normal: Vector3;
    constant: number;
}

export type GeometryElement = PointElement | LineElement | PlaneElement;

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
