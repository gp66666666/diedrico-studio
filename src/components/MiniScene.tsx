import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Line } from '@react-three/drei';
import { useGeometryStore } from '../store/geometryStore';
import PointObject from './3D/PointObject';
import LineObject from './3D/LineObject';
import PlaneObject from './3D/PlaneObject';
import SolidObject from './3D/SolidObject';
import SegmentObject from './3D/SegmentObject';
import IntersectionsRenderer from './3D/IntersectionsRenderer';
import SystemPlanes from './3D/SystemPlanes';
import { useEffect, useRef, Suspense } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

function CameraHandler() {
    const { cameraStates, setCameraState } = useGeometryStore();
    const { camera, controls } = useThree();
    const savedState = cameraStates['mini-3d'] || cameraStates['3d'];
    const initialLoad = useRef(true);

    // Restore camera on mount
    useEffect(() => {
        if (initialLoad.current && savedState) {
            camera.position.set(...savedState.position);
            if (controls) {
                // @ts-ignore
                controls.target.set(...savedState.target);
                // @ts-ignore
                controls.update();
            }
            initialLoad.current = false;
        }
    }, [camera, controls]);

    // Save on unmount
    useEffect(() => {
        return () => {
            if (controls) {
                // @ts-ignore
                const target = controls.target.toArray() as [number, number, number];
                const position = camera.position.toArray() as [number, number, number];
                setCameraState('mini-3d', { position, target });
            }
        };
    }, [camera, controls, setCameraState]);

    return null;
}

function MiniOrbitControls() {
    const { gl } = useThree();
    return (
        <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            domElement={gl.domElement}
            rotateSpeed={1.0}
            screenSpacePanning={true}
        />
    );
}

export default function MiniScene() {
    const {
        elements, selectElement, showBisectors, theme, measurements,
        showMiniScene, toggleMiniScene, miniSceneSize, setMiniSceneSize
    } = useGeometryStore();

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#0a0e1a' : '#ffffff';
    const gridSectionColor = isDark ? '#4b5563' : '#d1d5db';
    const gridCellColor = isDark ? '#1f2937' : '#e5e7eb';

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    useEffect(() => {
        // If on mobile and size is at default, make it smaller
        if (isMobile && miniSceneSize === 250) {
            setMiniSceneSize(120);
        }
    }, [isMobile, setMiniSceneSize, miniSceneSize]);

    if (!showMiniScene) return null;

    const distanceMeasurements = measurements.filter(m => m.visualLine);

    return (
        <div
            className={`fixed top-32 md:top-6 right-4 z-[100] rounded-xl overflow-hidden shadow-2xl border transition-all duration-300 ${isDark ? 'border-white/20 bg-gray-900/90 backdrop-blur-md' : 'border-gray-200 bg-white/90 backdrop-blur-md'} select-none pointer-events-auto`}
            style={{
                width: isMobile ? `min(${miniSceneSize}px, 50vw)` : `${miniSceneSize}px`,
                height: isMobile ? `min(${miniSceneSize}px, 50vw)` : `${miniSceneSize}px`,
                minWidth: isMobile ? '120px' : '150px',
                minHeight: isMobile ? '120px' : '150px',
                maxWidth: 'calc(100vw - 32px)',
                maxHeight: 'calc(100vh - 200px)',
                aspectRatio: '1/1',
                touchAction: 'none'
            }}
            // Only stop 'down' and 'wheel' to prevent background drag/zoom.
            // Letting 'move' events flow fixes the "click-then-move" rotation issue.
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Header / Controls */}
            <div className={`absolute top-0 left-0 right-0 z-10 p-1 flex justify-between items-center pointer-events-none`}>
                <div className="flex gap-1 pointer-events-auto">
                    <button
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setMiniSceneSize(Math.max(120, miniSceneSize - 30));
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg backdrop-blur-md shadow-sm transition-all active:scale-95 ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-white/80 hover:bg-white text-gray-700 border border-gray-200'}`}
                        title="Reducir tamaño"
                    >
                        <Minimize2 size={16} />
                    </button>
                    <button
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setMiniSceneSize(Math.min(600, miniSceneSize + 30));
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg backdrop-blur-md shadow-sm transition-all active:scale-95 ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-white/80 hover:bg-white text-gray-700 border border-gray-200'}`}
                        title="Aumentar tamaño"
                    >
                        <Maximize2 size={16} />
                    </button>
                </div>
                <button
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        toggleMiniScene();
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg backdrop-blur-md shadow-sm pointer-events-auto transition-all active:scale-95 ${isDark ? 'bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/20' : 'bg-red-50/80 hover:bg-red-100 text-red-500 border border-red-100'}`}
                >
                    <X size={18} />
                </button>
            </div>

            <Canvas
                shadows
                camera={{ position: [-30, 25, 30], fov: 50 }}
                gl={{ preserveDrawingBuffer: true, antialias: true }}
                onPointerMissed={() => selectElement(null)}
                className="w-full h-full"
                style={{ touchAction: 'none' }}
            >
                <Suspense fallback={null}>
                    <color attach="background" args={[bgColor]} />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />

                    <Grid
                        infiniteGrid
                        fadeDistance={50}
                        sectionColor={gridSectionColor}
                        cellColor={gridCellColor}
                        sectionThickness={1}
                        cellThickness={0.5}
                    />

                    <SystemPlanes showBisectors={showBisectors} />

                    {elements.map((element) => {
                        switch (element.type) {
                            case 'point': return <PointObject key={element.id} element={element} />;
                            case 'line': return <LineObject key={element.id} element={element} />;
                            case 'plane': return <PlaneObject key={element.id} element={element} />;
                            case 'solid': return <SolidObject key={element.id} element={element} />;
                            case 'segment': return <SegmentObject key={element.id} element={element as any} />;
                            default: return null;
                        }
                    })}

                    <IntersectionsRenderer />

                    {distanceMeasurements.filter(m => m.visible !== false).map(m => {
                        const { p1, p2 } = m.visualLine!;
                        const point1: [number, number, number] = [p1.x, p1.z, p1.y];
                        const point2: [number, number, number] = [p2.x, p2.z, p2.y];
                        return (
                            <group key={`distmini-${m.id}`}>
                                <Line points={[point1, point2]} color="#10b981" lineWidth={2} dashed dashSize={0.2} gapSize={0.1} />
                                <mesh position={point1}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#10b981" /></mesh>
                                <mesh position={point2}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#10b981" /></mesh>
                            </group>
                        );
                    })}

                    <CameraHandler />
                    <MiniOrbitControls />

                </Suspense>
            </Canvas>
        </div>
    );
}
