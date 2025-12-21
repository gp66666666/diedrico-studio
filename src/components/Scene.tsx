import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Loader, Line } from '@react-three/drei';
import { useGeometryStore } from '../store/geometryStore';
import PointObject from './3D/PointObject';
import LineObject from './3D/LineObject';
import PlaneObject from './3D/PlaneObject';
import SolidObject from './3D/SolidObject';
import IntersectionsRenderer from './3D/IntersectionsRenderer';
import SystemPlanes from './3D/SystemPlanes';
import { useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';

function CameraHandler() {
    const { cameraStates, setCameraState } = useGeometryStore();
    const { camera, controls } = useThree();
    const savedState = cameraStates['3d'];
    const initialLoad = useRef(true);

    // Restore camera on mount
    useEffect(() => {
        if (initialLoad.current) {
            camera.position.set(...savedState.position);
            if (controls) {
                // @ts-ignore
                controls.target.set(...savedState.target);
                // @ts-ignore
                controls.update();
            }
            initialLoad.current = false;
        }
    }, [camera, controls]); // Run once when controls are available

    // Save on unmount
    useEffect(() => {
        const saveState = () => {
            if (controls) {
                // @ts-ignore
                const target = controls.target.toArray() as [number, number, number];
                const position = camera.position.toArray() as [number, number, number];
                setCameraState('3d', { position, target });
            }
        };

        return () => {
            saveState();
        };
    }, [camera, controls, setCameraState]);

    return null;
}

export default function Scene() {
    const { elements, selectElement, showBisectors, theme, measurements } = useGeometryStore();

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#0a0e1a' : '#f3f4f6';
    const gridSectionColor = isDark ? '#4b5563' : '#d1d5db';
    const gridCellColor = isDark ? '#1f2937' : '#e5e7eb';

    // Filter measurements with visualLine for 3D rendering
    const distanceMeasurements = measurements.filter(m => m.visualLine);

    return (
        <div className="w-full h-full relative">
            <Canvas
                camera={{ position: [-30, 25, 30], fov: 50 }}
                shadows
                onPointerMissed={() => selectElement(null)}
                gl={{ preserveDrawingBuffer: true }}
            >
                <Suspense fallback={null}>
                    {/* Background */}
                    <color attach="background" args={[bgColor]} />

                    {/* Improved lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
                    <pointLight position={[-8, 5, -8]} intensity={0.4} color="#818cf8" />
                    <pointLight position={[8, 5, 8]} intensity={0.4} color="#a78bfa" />

                    {/* Grid */}
                    <Grid
                        infiniteGrid
                        fadeDistance={80}
                        sectionColor={gridSectionColor}
                        cellColor={gridCellColor}
                        sectionThickness={1.2}
                        cellThickness={0.6}
                    />

                    {/* System Planes (Quadrants always visible, Bisectors toggleable) */}
                    <SystemPlanes showBisectors={showBisectors} />

                    {/* Render all geometry elements */}
                    {elements.map((element) => {
                        switch (element.type) {
                            case 'point':
                                return <PointObject key={element.id} element={element} />;
                            case 'line':
                                return <LineObject key={element.id} element={element} />;
                            case 'plane':
                                return <PlaneObject key={element.id} element={element} />;
                            case 'solid':
                                return <SolidObject key={element.id} element={element} />;
                            default:
                                return null;
                        }
                    })}

                    {/* Render Intersections */}
                    <IntersectionsRenderer />

                    {/* Render Distance Measurement Lines (D) */}
                    {distanceMeasurements.filter(m => m.visible !== false).map(m => {
                        const { p1, p2 } = m.visualLine!;
                        const point1: [number, number, number] = [p1.x, p1.z, p1.y]; // THREE.js Y is up
                        const point2: [number, number, number] = [p2.x, p2.z, p2.y];

                        return (
                            <group key={`dist3d-${m.id}`}>
                                {/* Distance Line D */}
                                <Line
                                    points={[point1, point2]}
                                    color="#10b981"
                                    lineWidth={3}
                                    dashed
                                    dashSize={0.3}
                                    gapSize={0.15}
                                />
                                {/* Endpoint spheres */}
                                <mesh position={point1}>
                                    <sphereGeometry args={[0.15, 16, 16]} />
                                    <meshStandardMaterial color="#10b981" />
                                </mesh>
                                <mesh position={point2}>
                                    <sphereGeometry args={[0.15, 16, 16]} />
                                    <meshStandardMaterial color="#10b981" />
                                </mesh>
                            </group>
                        );
                    })}

                    {/* Camera controls */}
                    <CameraHandler />
                    <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

                    {/* Gizmo for orientation */}
                    <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                        <GizmoViewport
                            axisColors={['#ef4444', '#10b981', '#3b82f6']}
                            labelColor="white"
                        />
                    </GizmoHelper>
                </Suspense>
            </Canvas>
            <Loader />
        </div>
    );
}
