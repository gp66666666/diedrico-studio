import { create } from 'zustand';
import type { GeometryElement, SketchElement } from '../types';
import { supabase } from '../lib/supabase';

interface GeometryState {
    elements: GeometryElement[];
    sketchElements: SketchElement[];

    // History
    history: {
        past: { elements: GeometryElement[], sketchElements: SketchElement[] }[];
        future: { elements: GeometryElement[], sketchElements: SketchElement[] }[];
    };
    undo: () => void;
    redo: () => void;

    // Actions
    addElement: (element: Omit<GeometryElement, 'id' | 'visible'>) => void;
    removeElement: (id: string) => void;
    updateElement: (id: string, updates: Partial<GeometryElement>) => void;
    toggleVisibility: (id: string) => void;
    clearAll: () => void;

    // Sketch Actions
    addSketchElement: (element: SketchElement) => void;
    removeSketchElement: (id: string) => void;
    updateSketchElement: (id: string, updates: Partial<SketchElement>) => void;

    // Theme
    theme: 'dark' | 'light';
    toggleTheme: () => void;

    // View Mode
    viewMode: '3d' | '2d' | 'sketch';
    setViewMode: (mode: '3d' | '2d' | 'sketch') => void;

    // Intersections
    showIntersections: boolean;
    toggleIntersections: () => void;

    // System Planes (Bisectors)
    showBisectors: boolean;
    toggleBisectors: () => void;

    // Flattening Animation (Abatimiento)
    isFlattened: boolean;
    toggleFlattening: () => void;

    // Selection
    selectedElementId: string | null;
    selectElement: (id: string | null) => void;
    // Help
    showHelp: boolean;
    toggleHelp: () => void;

    // Profile View
    showProfile: boolean;
    toggleProfile: () => void;

    // Distance Tools
    activeTool: 'none' | 'distance-point-point' | 'distance-point-line' | 'distance-point-plane' | 'abatir-ph' | 'abatir-pv' | 'desabatir' | 'intersection-line-line' | 'intersection-line-plane' | 'intersection-plane-plane' | 'true-length' | 'angle-line-line' | 'angle-line-plane' | 'parallel-line-line' | 'parallel-line-plane' | 'perp-line-line' | 'perp-line-plane' | 'perp-plane-line' | 'rotation-point-axis' | 'plane-parallel-plane' | 'plane-perp-2-planes' | 'line-parallel-2-planes' | 'plane-parallel-2-lines';
    setActiveTool: (tool: GeometryState['activeTool']) => void;
    selectedForDistance: string[];  // IDs of selected elements
    distanceResult: {
        value: number;
        auxiliaryPoints?: { x: number; y: number; z: number }[];
        showTriangle?: boolean;
    } | null;
    selectForDistance: (id: string) => void;
    clearDistanceTool: () => void;

    // Measurements (True Magnitude)
    measurements: Array<{
        id: string;
        type: 'length' | 'angle' | 'distance';
        value: number;
        label: string;
        elementIds: string[];
    }>;
    addMeasurement: (measurement: Omit<GeometryState['measurements'][0], 'id'>) => void;
    removeMeasurement: (id: string) => void;
    clearAllMeasurements: () => void;

    // Cloud Save/Load (Premium)
    saveProject: (title: string, description?: string) => Promise<string>;
    loadProject: (projectId: string) => Promise<void>;
    getUserProjects: () => Promise<any[]>;
    deleteProject: (projectId: string) => Promise<void>;
    renameProject: (projectId: string, title: string, description?: string) => Promise<void>;
}

export const useGeometryStore = create<GeometryState>((set, get) => ({
    elements: [],
    sketchElements: [],

    history: {
        past: [],
        future: []
    },

    undo: () => {
        const { history, elements, sketchElements } = get();
        if (history.past.length === 0) return;

        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, -1);

        set({
            elements: previous.elements,
            sketchElements: previous.sketchElements,
            history: {
                past: newPast,
                future: [{ elements, sketchElements }, ...history.future]
            }
        });
    },

    redo: () => {
        const { history, elements, sketchElements } = get();
        if (history.future.length === 0) return;

        const next = history.future[0];
        const newFuture = history.future.slice(1);

        set({
            elements: next.elements,
            sketchElements: next.sketchElements,
            history: {
                past: [...history.past, { elements, sketchElements }],
                future: newFuture
            }
        });
    },

    addElement: (element) => set((state) => {
        const newElement = { ...element, id: Math.random().toString(36).substr(2, 9), visible: true } as GeometryElement;
        return {
            elements: [...state.elements, newElement],
            history: {
                past: [...state.history.past, { elements: state.elements, sketchElements: state.sketchElements }],
                future: []
            }
        };
    }),

    removeElement: (id) => set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        history: {
            past: [...state.history.past, { elements: state.elements, sketchElements: state.sketchElements }],
            future: []
        }
    })),

    updateElement: (id, updates) => set((state) => ({
        elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } as GeometryElement : el
        ),
        history: {
            past: [...state.history.past, { elements: state.elements, sketchElements: state.sketchElements }],
            future: []
        }
    })),

    toggleVisibility: (id) => set((state) => ({
        elements: state.elements.map((el) =>
            el.id === id ? { ...el, visible: !el.visible } : el
        ),
        history: {
            past: [...state.history.past, { elements: state.elements, sketchElements: state.sketchElements }],
            future: []
        }
    })),

    clearAll: () => set((state) => ({
        elements: [],
        sketchElements: [],
        history: {
            past: [...state.history.past, { elements: state.elements, sketchElements: state.sketchElements }],
            future: []
        }
    })),

    // Sketch Actions
    addSketchElement: (element) => set((state) => ({
        sketchElements: [...state.sketchElements, element],
        history: {
            past: [...state.history.past, { elements: state.elements, sketchElements: state.sketchElements }],
            future: []
        }
    })),

    removeSketchElement: (id) => set((state) => ({
        sketchElements: state.sketchElements.filter((el) => el.id !== id),
        history: {
            past: [...state.history.past, { elements: state.elements, sketchElements: state.sketchElements }],
            future: []
        }
    })),

    updateSketchElement: (id, updates) => set((state) => ({
        sketchElements: state.sketchElements.map(el => el.id === id ? { ...el, ...updates } : el),
    })),


    theme: 'dark',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

    viewMode: '3d',
    setViewMode: (mode) => set({ viewMode: mode }),

    showIntersections: false,
    toggleIntersections: () => set((state) => ({ showIntersections: !state.showIntersections })),

    showBisectors: false,
    toggleBisectors: () => set((state) => ({ showBisectors: !state.showBisectors })),

    isFlattened: false,
    toggleFlattening: () => set((state) => ({ isFlattened: !state.isFlattened })),

    selectedElementId: null,
    selectElement: (id) => set({ selectedElementId: id }),

    showHelp: false,
    toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),

    showProfile: false,
    toggleProfile: () => set((state) => ({ showProfile: !state.showProfile })),

    // Distance Tools
    activeTool: 'none',
    setActiveTool: (tool) => {
        set({ activeTool: tool, selectedForDistance: [], distanceResult: null });
    },
    selectedForDistance: [],
    distanceResult: null,
    selectForDistance: (id) => {
        const { selectedForDistance, activeTool, elements } = get();

        // Determine how many elements we need
        let maxSelection = 0;
        if (activeTool === 'distance-point-point') maxSelection = 2;
        else if (activeTool === 'distance-point-line') maxSelection = 2;
        else if (activeTool === 'distance-point-plane') maxSelection = 2;
        else if (activeTool === 'parallel-line-line') maxSelection = 2;
        else if (activeTool === 'perp-line-plane') maxSelection = 2;
        else if (activeTool === 'perp-plane-line') maxSelection = 2;
        else if (activeTool === 'perp-line-line') maxSelection = 2;
        else if (activeTool === 'plane-parallel-plane') maxSelection = 2;
        else if (activeTool === 'plane-perp-2-planes') maxSelection = 3;
        else if (activeTool === 'line-parallel-2-planes') maxSelection = 3;
        else if (activeTool === 'plane-parallel-2-lines') maxSelection = 3;
        else if (activeTool === 'rotation-point-axis') maxSelection = 2;
        else if (activeTool === 'angle-line-line') maxSelection = 2;
        else if (activeTool === 'angle-line-plane') maxSelection = 2;
        else if (activeTool === 'true-length') maxSelection = 1;

        console.log(`[Store] selectForDistance: id=${id}, activeTool=${activeTool}, maxSelection=${maxSelection}`);

        // Add element if not already selected
        if (!selectedForDistance.includes(id)) {
            const newSelection = [...selectedForDistance, id].slice(-maxSelection);
            console.log(`[Store] New selection:`, newSelection);
            set({ selectedForDistance: newSelection });

            // Calculate distance if we have enough elements
            if (newSelection.length === maxSelection) {
                const el1 = elements.find(e => e.id === newSelection[0]);
                const el2 = elements.find(e => e.id === newSelection[1]);

                if (el1 && el2 && activeTool === 'distance-point-point') {
                    if (el1.type === 'point' && el2.type === 'point') {
                        const p1 = (el1 as any).coords;
                        const p2 = (el2 as any).coords;
                        const dx = p2.x - p1.x;
                        const dy = p2.y - p1.y;
                        const dz = p2.z - p1.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                        set({
                            distanceResult: {
                                value: distance,
                                auxiliaryPoints: [p1, p2],
                                showTriangle: true
                            }
                        });
                    }
                }
            }
        }
    },
    clearDistanceTool: () => {
        set({ activeTool: 'none', selectedForDistance: [], distanceResult: null });
    },

    // Measurements (True Magnitude)
    measurements: [],
    addMeasurement: (measurement) => set((state) => ({
        measurements: [...state.measurements, { ...measurement, id: Math.random().toString(36).substr(2, 9) }]
    })),
    removeMeasurement: (id) => set((state) => ({
        measurements: state.measurements.filter(m => m.id !== id)
    })),
    clearAllMeasurements: () => set({ measurements: [] }),

    // Cloud Save/Load (Premium)
    saveProject: async (title: string, description?: string) => {
        const { elements, sketchElements } = get();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Must be logged in to save projects');

        const projectData = {
            user_id: user.id,
            title,
            description: description || '',
            data: { elements, sketchElements }
        };

        const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();

        if (error) throw error;
        return data.id;
    },

    loadProject: async (projectId: string) => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) throw error;

        const { elements, sketchElements } = data.data;
        set({
            elements,
            sketchElements,
            history: { past: [], future: [] }
        });
    },

    getUserProjects: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
            .from('projects')
            .select('id, title, description, created_at, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    deleteProject: async (projectId: string) => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;
    },

    renameProject: async (projectId: string, title: string, description?: string) => {
        const { error } = await supabase
            .from('projects')
            .update({ title, description: description || '' })
            .eq('id', projectId);

        if (error) throw error;
    },
}));
