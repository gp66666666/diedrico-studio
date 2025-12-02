// AI Assistant Types

export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    steps?: AIStep[];
}

export interface AIStep {
    id: string;
    stepNumber: number;
    description: string;
    action: AIAction;
    params: any;
    color: string;
    status: 'pending' | 'executing' | 'completed' | 'error';
    error?: string;
}

export type AIAction =
    | 'add_point'
    | 'add_line_by_points'
    | 'add_line_by_direction'
    | 'add_plane_by_normal'
    | 'add_plane_by_traces'
    | 'add_plane_by_points'
    | 'add_perpendicular_plane'
    | 'calculate_intersection'
    | 'calculate_distance'
    | 'set_view_mode'
    | 'toggle_visibility'
    | 'clear_canvas'
    | 'delete_element'
    | 'add_line_by_coords'
    | 'add_perpendicular_line'
    | 'add_parallel_line';

export interface AddPointParams {
    name: string;
    x: number;
    y: number;
    z: number;
    color: string;
}

export interface AddLineByPointsParams {
    name: string;
    point1Name: string;
    point2Name: string;
    color: string;
}

export interface AddPlaneByNormalParams {
    name: string;
    normalX: number;
    normalY: number;
    normalZ: number;
    constant: number;
    color: string;
}

export interface GeminiResponse {
    explanation: string;
    steps: AIStep[];
}

export interface AIConversation {
    messages: AIMessage[];
    isProcessing: boolean;
    currentStep: number | null;
    error: string | null;
}
