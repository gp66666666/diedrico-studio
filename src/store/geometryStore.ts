import { create } from 'zustand';
import type { GeometryElement, SketchElement } from '../types';
import { supabase } from '../lib/supabase';
import { selectionCountForTool } from '../lib/selection';
import { startFlattenAnimation } from '../lib/flattenAnimation';

/** Estado que se guarda en cada paso de deshacer/rehacer. */
// Foto previa al gesto en curso (arrastre). Una sola para todo el gesto.
let pendingSnapshot: HistorySnapshot | null = null;

type HistorySnapshot = {
    elements: GeometryElement[];
    sketchElements: SketchElement[];
    measurements: Array<{
        id: string;
        type: 'length' | 'angle' | 'distance';
        value: number;
        label: string;
        elementIds: string[];
        visible?: boolean;
        visualLine?: { p1: { x: number; y: number; z: number }; p2: { x: number; y: number; z: number } };
    }>;
    auxSystems: import('../types').ProjectionSystem[];
};

const snapshotOf = (state: {
    elements: GeometryElement[];
    sketchElements: SketchElement[];
    measurements: HistorySnapshot['measurements'];
    auxSystems: HistorySnapshot['auxSystems'];
}): HistorySnapshot => ({
    elements: state.elements,
    sketchElements: state.sketchElements,
    measurements: state.measurements,
    auxSystems: state.auxSystems,
});

interface GeometryState {
    elements: GeometryElement[];
    sketchElements: SketchElement[];

    // History: incluye también medidas y sistemas auxiliares para que
    // deshacer no deje etiquetas de distancia huérfanas.
    history: {
        past: HistorySnapshot[];
        future: HistorySnapshot[];
    };
    undo: () => void;
    redo: () => void;

    // Actions
    addElement: (element: Omit<GeometryElement, 'id' | 'visible'>) => string;
    removeElement: (id: string) => void;
    updateElement: (id: string, updates: Partial<GeometryElement>) => void;
    /**
     * Arrastrar en vivo (mover con el ratón): actualiza sin apuntar nada en el
     * historial. Si no, cada píxel del arrastre sería un paso de Deshacer.
     */
    updateElementLive: (id: string, updates: Partial<GeometryElement>) => void;
    /** Abre un gesto (arrastre): guarda una foto del estado anterior. */
    startGesture: () => void;
    /** Cierra el gesto y deja UN solo paso de Deshacer. */
    endGesture: () => void;
    toggleVisibility: (id: string) => void;
    clearAll: () => void;

    // Sketch Actions
    addSketchElement: (element: SketchElement) => void;
    removeSketchElement: (id: string) => void;
    updateSketchElement: (id: string, updates: Partial<SketchElement>) => void;

    // Theme
    theme: 'dark' | 'light';
    toggleTheme: () => void;

    // Aspecto de los planos en 3D: relleno continuo (libro de texto) o malla.
    planeStyle: 'solid' | 'mesh';
    setPlaneStyle: (style: 'solid' | 'mesh') => void;

    // View Mode
    viewMode: '3d' | '2d' | 'caballera' | 'sketch' | 'laminas';
    setViewMode: (mode: '3d' | '2d' | 'caballera' | 'sketch' | 'laminas') => void;

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

    // Verdadera Magnitud (True Magnitude View)
    vmElements: string[]; // Element IDs to show in VM view
    vmPlaneId: string | null; // The plane used for reconstruction
    setVMElements: (ids: string[], planeId: string) => void;
    clearVM: () => void;
    showVMConstruction: boolean;
    toggleVMConstruction: () => void;
    createGroup: (name: string, elementIds: string[]) => void;

    // Academy
    activeExercise: { id: string; title: string; statement: string; solutionHint?: string } | null;
    setActiveExercise: (ex: { id: string; title: string; statement: string; solutionHint?: string } | null) => void;

    // Camera Persistence
    cameraStates: {
        '3d': { position: [number, number, number], target: [number, number, number] };
        '2d': { offset: { x: number, y: number }, zoom: number };
        'caballera': { offset: { x: number, y: number }, zoom: number };
        'sketch': { offset: { x: number, y: number }, zoom: number };
        'laminas': { offset: { x: number, y: number }, zoom: number };
        'mini-3d': { position: [number, number, number], target: [number, number, number] };
    };
    setCameraState: (mode: '3d' | '2d' | 'caballera' | 'sketch' | 'laminas' | 'mini-3d', state: any) => void;

    // Mini 3D View
    showMiniScene: boolean;
    toggleMiniScene: () => void;
    miniSceneSize: number;
    setMiniSceneSize: (size: number) => void;
    activeTool: 'none' | 'distance-point-point' | 'distance-point-line' | 'distance-point-plane' | 'distance-line-line' | 'distance-line-plane' | 'distance-plane-plane' | 'abatir-ph' | 'abatir-pv' | 'abatir-traza' | 'desabatir' | 'intersection-line-line' | 'intersection-line-plane' | 'intersection-plane-plane' | 'advanced-intersection-3-planes' | 'advanced-intersection-3-lines' | 'advanced-intersection-2planes-1line' | 'advanced-intersection-2lines-1plane' | 'true-length' | 'angle-line-line' | 'angle-line-plane' | 'angle-plane-plane' | 'parallel-line-line' | 'parallel-line-plane' | 'plane-parallel-line' | 'perp-line-line' | 'perp-line-plane' | 'perp-plane-line' | 'rotation-point-axis' | 'rotation-any' | 'rotation-parallel-lt' | 'plane-parallel-plane' | 'plane-perp-2-planes' | 'line-parallel-2-planes' | 'plane-parallel-2-lines' | 'cambio-plano-h' | 'cambio-plano-v' | 'desabatir-p-ph' | 'desabatir-p-pv' | 'plane-3-points' | 'solid-move' | 'poliedro-tetraedro' | 'poliedro-cubo' | 'poliedro-octaedro' | 'poliedro-dodecaedro' | 'poliedro-icosaedro' | 'solid-prisma' | 'solid-piramide' | 'revolucion-cilindro' | 'revolucion-cono' | 'revolucion-esfera' | 'solid-section' | 'solid-intersection' | 'solid-development' | 'create-group' | 'segment-2-points' | 'reconstruct-vm' | 'plane-click' | 'line-solid' | 'sphere-tangent' | 'shadows' | 'cast-shadow';
    setActiveTool: (tool: GeometryState['activeTool']) => void;
    selectedForDistance: string[];  // IDs of selected elements
    distanceResult: {
        value: number;
        auxiliaryPoints?: { x: number; y: number; z: number }[];
        showTriangle?: boolean;
    } | null;
    selectForDistance: (id: string) => void;
    clearDistanceTool: () => void;
    clearDistanceSelection: () => void;

    // Measurements (with Visual Lines for D, d', d'')
    measurements: Array<{
        id: string;
        type: 'length' | 'angle' | 'distance';
        value: number;
        label: string;
        elementIds: string[];
        visible?: boolean; // New visibility toggle
        // Visual line data for distance rendering
        visualLine?: {
            // 3D points (for the actual distance D)
            p1: { x: number; y: number; z: number };
            p2: { x: number; y: number; z: number };
        };
    }>;
    addMeasurement: (measurement: Omit<GeometryState['measurements'][0], 'id'>) => void;
    removeMeasurement: (id: string) => void;
    toggleMeasurementVisibility: (id: string) => void;
    clearAllMeasurements: () => void;

    // Caballero / Axonometric Construction
    caballeraState: {
        step: 'idle' | 'waiting-alzado' | 'waiting-planta';
        previewCoords: { x: number; y: number; z: number };
    };
    setCaballeraStep: (step: GeometryState['caballeraState']['step']) => void;
    updateCaballeraPreview: (coords: Partial<GeometryState['caballeraState']['previewCoords']>) => void;

    // Cloud Save/Load (Premium)
    /** Proyecto abierto/guardado en esta sesión (para actualizar en vez de duplicar). */
    currentProjectId: string | null;
    currentProjectTitle: string | null;
    saveProject: (title: string, description?: string, thumbnail?: string | null) => Promise<string>;
    loadProject: (projectId: string) => Promise<void>;
    getUserProjects: () => Promise<any[]>;
    deleteProject: (projectId: string) => Promise<void>;
    renameProject: (projectId: string, title: string, description?: string) => Promise<void>;

    // Auxiliary Projection Systems (Cambios de Plano)
    auxSystems: import('../types').ProjectionSystem[];
    addAuxSystem: (system: Omit<import('../types').ProjectionSystem, 'id'>) => void;
    removeAuxSystem: (id: string) => void;
}

export const useGeometryStore = create<GeometryState>((set, get) => ({
    elements: [],
    sketchElements: [],
    currentProjectId: null,
    currentProjectTitle: null,

    // Camera Persistence
    cameraStates: {
        '3d': { position: [-30, 25, 30], target: [0, 0, 0] },
        '2d': { offset: { x: 400, y: 300 }, zoom: 1 },
        'caballera': { offset: { x: 400, y: 300 }, zoom: 1 },
        'sketch': { offset: { x: 400, y: 300 }, zoom: 1 },
        'laminas': { offset: { x: 400, y: 300 }, zoom: 1 },
        'mini-3d': { position: [-30, 25, 30], target: [0, 0, 0] }
    },
    setCameraState: (mode, state) => set((prev) => ({
        cameraStates: {
            ...prev.cameraStates,
            [mode]: { ...prev.cameraStates[mode], ...state }
        }
    })),

    showMiniScene: false,
    toggleMiniScene: () => set((state) => ({ showMiniScene: !state.showMiniScene })),
    miniSceneSize: 250,
    setMiniSceneSize: (size) => set({ miniSceneSize: size }),

    // Caballero / Axonometric Construction
    caballeraState: {
        step: 'idle',
        previewCoords: { x: 0, y: 0, z: 0 }
    },
    setCaballeraStep: (step) => set((state) => ({
        caballeraState: { ...state.caballeraState, step }
    })),
    updateCaballeraPreview: (coords) => set((state) => ({
        caballeraState: {
            ...state.caballeraState,
            previewCoords: { ...state.caballeraState.previewCoords, ...coords }
        }
    })),

    history: {
        past: [],
        future: []
    },

    undo: () => {
        const state = get();
        const { history } = state;
        if (history.past.length === 0) return;

        const previous = history.past[history.past.length - 1];

        set({
            elements: previous.elements,
            sketchElements: previous.sketchElements,
            measurements: previous.measurements,
            auxSystems: previous.auxSystems,
            history: {
                past: history.past.slice(0, -1),
                future: [snapshotOf(state), ...history.future]
            }
        });
    },

    redo: () => {
        const state = get();
        const { history } = state;
        if (history.future.length === 0) return;

        const next = history.future[0];

        set({
            elements: next.elements,
            sketchElements: next.sketchElements,
            measurements: next.measurements,
            auxSystems: next.auxSystems,
            history: {
                past: [...history.past, snapshotOf(state)],
                future: history.future.slice(1)
            }
        });
    },

    // Devuelve el id real: la escena necesita seleccionar lo que acaba de crear
    // (antes se generaba dentro y quien llamaba se quedaba con un id inventado).
    addElement: (element) => {
        const newElement = { ...element, id: Math.random().toString(36).substr(2, 9), visible: true } as GeometryElement;
        set((state) => ({
            elements: [...state.elements, newElement],
            history: {
                past: [...state.history.past, snapshotOf(state)],
                future: []
            }
        }));
        return newElement.id;
    },

    removeElement: (id) => set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        // Las medidas que usaban ese elemento dejan de tener sentido
        measurements: state.measurements.filter((m) => !m.elementIds?.includes(id)),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        history: {
            past: [...state.history.past, snapshotOf(state)],
            future: []
        }
    })),

    updateElement: (id, updates) => set((state) => ({
        elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } as GeometryElement : el
        ),
        history: {
            past: [...state.history.past, snapshotOf(state)],
            future: []
        }
    })),

    updateElementLive: (id, updates) => set((state) => ({
        elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } as GeometryElement : el
        )
    })),

    startGesture: () => {
        pendingSnapshot = snapshotOf(get());
    },

    endGesture: () => {
        const snapshot = pendingSnapshot;
        pendingSnapshot = null;
        if (!snapshot) return;
        set((state) => ({
            history: {
                past: [...state.history.past, snapshot],
                future: []
            }
        }));
    },

    toggleVisibility: (id) => set((state) => ({
        elements: state.elements.map((el) =>
            el.id === id ? { ...el, visible: !el.visible } : el
        ),
        history: {
            past: [...state.history.past, snapshotOf(state)],
            future: []
        }
    })),

    clearAll: () => set((state) => ({
        elements: [],
        sketchElements: [],
        // Sin esto quedaban distancias/ángulos y cambios de plano "fantasma"
        measurements: [],
        auxSystems: [],
        selectedElementId: null,
        selectedForDistance: [],
        distanceResult: null,
        currentProjectId: null,
        currentProjectTitle: null,
        history: {
            past: [...state.history.past, snapshotOf(state)],
            future: []
        }
    })),

    // Sketch Actions
    addSketchElement: (element) => set((state) => ({
        sketchElements: [...state.sketchElements, element],
        history: {
            past: [...state.history.past, snapshotOf(state)],
            future: []
        }
    })),

    removeSketchElement: (id) => set((state) => ({
        sketchElements: state.sketchElements.filter((el) => el.id !== id),
        history: {
            past: [...state.history.past, snapshotOf(state)],
            future: []
        }
    })),

    updateSketchElement: (id, updates) => set((state) => ({
        sketchElements: state.sketchElements.map(el => el.id === id ? { ...el, ...updates } : el),
    })),


    theme: 'dark',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

    // Los planos se dibujan como una superficie traslúcida continua; la malla
    // ayuda a ver la profundidad, pero a un alumno le parece un enrejado.
    planeStyle: (typeof localStorage !== 'undefined' && localStorage.getItem('planeStyle') === 'mesh' ? 'mesh' : 'solid'),
    setPlaneStyle: (style) => {
        if (typeof localStorage !== 'undefined') localStorage.setItem('planeStyle', style);
        set({ planeStyle: style });
    },

    viewMode: '3d',
    setViewMode: (mode) => set({ viewMode: mode }),

    showIntersections: false,
    toggleIntersections: () => set((state) => ({ showIntersections: !state.showIntersections })),

    showBisectors: false,
    toggleBisectors: () => set((state) => ({ showBisectors: !state.showBisectors })),

    isFlattened: false,
    toggleFlattening: () => set((state) => {
        const next = !state.isFlattened;
        // El giro lo dibuja cada objeto con el reloj compartido; aquí solo se
        // avisa de hacia dónde va.
        startFlattenAnimation(next);
        return { isFlattened: next };
    }),

    selectedElementId: null,
    selectElement: (id) => set({ selectedElementId: id }),

    showHelp: false,
    toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),

    showProfile: false,
    toggleProfile: () => set((state) => ({ showProfile: !state.showProfile })),

    vmElements: [],
    vmPlaneId: null,
    setVMElements: (ids, planeId) => set({ vmElements: ids, vmPlaneId: planeId }),
    clearVM: () => set({ vmElements: [], vmPlaneId: null }),
    showVMConstruction: true,
    toggleVMConstruction: () => set((state) => ({ showVMConstruction: !state.showVMConstruction })),

    createGroup: (name, elementIds) => set((state) => {
        const newGroup = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'group',
            name,
            elements: elementIds,
            color: '#3b82f6',
            visible: true
        } as any;
        return {
            elements: [...state.elements, newGroup],
            history: {
                past: [...state.history.past, snapshotOf(state)],
                future: []
            }
        };
    }),

    activeExercise: null,
    setActiveExercise: (ex) => set({ activeExercise: ex }),

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
        const maxSelection = selectionCountForTool(activeTool ?? 'none');

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
    clearDistanceSelection: () => {
        set({ selectedForDistance: [], distanceResult: null });
    },

    // Measurements (True Magnitude)
    measurements: [],
    addMeasurement: (measurement) => set((state) => ({
        measurements: [...state.measurements, { ...measurement, id: Math.random().toString(36).substr(2, 9), visible: true }],
        history: { past: [...state.history.past, snapshotOf(state)], future: [] }
    })),
    removeMeasurement: (id) => set((state) => ({
        measurements: state.measurements.filter(m => m.id !== id),
        history: { past: [...state.history.past, snapshotOf(state)], future: [] }
    })),
    toggleMeasurementVisibility: (id) => set((state) => ({
        measurements: state.measurements.map(m => m.id === id ? { ...m, visible: !m.visible } : m)
    })),
    clearAllMeasurements: () => set((state) => ({
        measurements: [],
        history: { past: [...state.history.past, snapshotOf(state)], future: [] }
    })),

    // Cloud Save/Load (Premium)
    saveProject: async (title: string, description?: string, thumbnail?: string | null) => {
        const { elements, sketchElements, currentProjectId } = get();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('Guarda en la nube necesita una cuenta: entra con Google y vuelve a intentarlo.');

        const projectData = {
            user_id: user.id,
            title,
            description: description || '',
            data: { elements, sketchElements },
            thumbnail_url: thumbnail ?? null,
            updated_at: new Date().toISOString(),
        };

        // Si hay un proyecto abierto se actualiza: antes cada "Guardar" creaba
        // una copia nueva y el usuario acababa con cinco versiones iguales.
        if (currentProjectId) {
            const { data, error } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', currentProjectId)
                .select()
                .single();

            if (error) throw error;
            set({ currentProjectTitle: title });
            return data.id;
        }

        const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();

        if (error) throw error;
        set({ currentProjectId: data.id, currentProjectTitle: title });
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
            // Sin esto se quedaban las medidas y los cambios de plano del
            // proyecto anterior flotando sobre el nuevo.
            measurements: [],
            auxSystems: [],
            selectedElementId: null,
            selectedForDistance: [],
            distanceResult: null,
            activeTool: 'none',
            currentProjectId: data.id,
            currentProjectTitle: data.title,
            history: { past: [], future: [] }
        });
    },

    getUserProjects: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
            .from('projects')
            .select('id, title, description, thumbnail_url, created_at, updated_at')
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

    // Auxiliary Systems
    auxSystems: [],
    addAuxSystem: (system) => set((state) => ({
        auxSystems: [...state.auxSystems, { ...system, id: Math.random().toString(36).substr(2, 9) }],
        history: { past: [...state.history.past, snapshotOf(state)], future: [] }
    })),
    removeAuxSystem: (id) => set((state) => ({
        auxSystems: state.auxSystems.filter(s => s.id !== id),
        history: { past: [...state.history.past, snapshotOf(state)], future: [] }
    })),
}));
