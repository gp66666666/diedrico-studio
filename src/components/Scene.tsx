import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Loader, Line } from '@react-three/drei';
import { useGeometryStore } from '../store/geometryStore';
import PointObject from './3D/PointObject';
import LineObject from './3D/LineObject';
import PlaneObject from './3D/PlaneObject';
import SolidObject from './3D/SolidObject';
import PolygonObject from './3D/PolygonObject';
import MeshObject from './3D/MeshObject';
import SegmentObject from './3D/SegmentObject';
import IntersectionsRenderer from './3D/IntersectionsRenderer';
import SystemPlanes from './3D/SystemPlanes';
import { useEffect, useRef, Suspense } from 'react';
import { flattenProgress } from '../lib/flattenAnimation';
import { makeSolid, isSolidCreationTool } from '../lib/solidFactory';
import { restOnHorizontalPlane } from '../lib/solidPlacement';
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


/**
 * El suelo (la cuadrícula) es la hoja del sistema: al abatir gira sobre la línea
 * de tierra hasta pegarse al plano vertical. Es lo que explica por qué en el
 * papel las proyecciones horizontales quedan por DEBAJO de la línea de tierra.
 */
function FoldingGrid({ sectionColor, cellColor }: { sectionColor: string; cellColor: string }) {
    const ref = useRef<THREE.Group>(null);
    useFrame(() => {
        if (ref.current) ref.current.rotation.x = (flattenProgress() * Math.PI) / 2;
    });
    return (
        <group ref={ref}>
            <Grid
                infiniteGrid
                fadeDistance={80}
                sectionColor={sectionColor}
                cellColor={cellColor}
                sectionThickness={1.2}
                cellThickness={0.6}
            />
        </group>
    );
}

/** Sonda de desarrollo: deja la escena de three.js accesible desde la consola. */
function SceneProbe() {
    const { scene, camera, gl } = useThree();
    useEffect(() => {
        (window as any).__threeScene = scene;
        // Proyecta una coordenada del store (x, y, z) a píxeles de pantalla.
        // Sirve para comprobar clics y arrastres desde los tests sin adivinar.
        (window as any).__project = (p: { x: number; y: number; z: number }) => {
            const v = new THREE.Vector3(p.x, p.z, p.y).project(camera);
            const rect = gl.domElement.getBoundingClientRect();
            return {
                x: rect.left + ((v.x + 1) / 2) * rect.width,
                y: rect.top + ((1 - v.y) / 2) * rect.height,
            };
        };
    }, [scene, camera, gl]);
    return null;
}

/** La línea de tierra se enciende durante el giro: es la bisagra del abatimiento. */
function HingeLine() {
    const groupRef = useRef<THREE.Group>(null);
    const matRef = useRef<any>(null);
    useFrame(() => {
        const p = flattenProgress();
        if (groupRef.current) groupRef.current.visible = p > 0.002;
        if (matRef.current) matRef.current.opacity = 0.2 + 0.55 * Math.min(1, p * 3);
    });
    return (
        <group ref={groupRef} visible={false}>
            <Line
                ref={matRef}
                points={[[-24, 0, 0], [24, 0, 0]]}
                color="#fbbf24"
                lineWidth={2}
                transparent
                opacity={0.2}
            />
        </group>
    );
}

export default function Scene() {
    const { elements, selectElement, showBisectors, theme, measurements } = useGeometryStore();

    // Estado de three.js (cámara, canvas) para poder lanzar un rayo desde un clic
    const r3f = useRef<any>(null);
    const pointerDown = useRef<{ x: number; y: number } | null>(null);

    /**
     * Clic en zona vacía del 3D.
     *
     * Si hay una herramienta de sólido activa, el clic se proyecta sobre el
     * plano horizontal (cota 0) y el sólido aparece APOYADO ahí: ni flotando ni
     * medio enterrado. Sin herramienta, solo se quita la selección.
     */
    const handlePointerMissed = (event: MouseEvent) => {
        const state = useGeometryStore.getState();
        const moving = state.activeTool === 'solid-move';

        if (!isSolidCreationTool(state.activeTool) && !moving) {
            selectElement(null);
            return;
        }

        // Un arrastre para girar la cámara no es un clic: no coloca nada
        const start = pointerDown.current;
        if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;

        const three = r3f.current;
        if (!three) return;

        const rect = three.gl.domElement.getBoundingClientRect();
        const ndc = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(ndc, three.camera);

        const hit = new THREE.Vector3();
        const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        if (!raycaster.ray.intersectPlane(floor, hit)) return;

        // three (X, Y arriba, Z) → store (x, y alejamiento, z cota)
        const onFloor = { x: hit.x, y: hit.z, z: 0 };
        if (Math.abs(onFloor.x) > 60 || Math.abs(onFloor.y) > 60) return;

        // Mover el sólido seleccionado: conserva su cota, solo cambia x e y
        if (moving) {
            const current = state.elements.find((e) => e.id === state.selectedElementId);
            if (current?.type === 'solid') {
                state.updateElement(current.id, {
                    position: { ...current.position, x: onFloor.x, y: onFloor.y },
                });
                state.setActiveTool('none');
            }
            return;
        }

        const count = state.elements.filter((e) => e.type === 'solid').length;
        const solid = makeSolid(state.activeTool!, onFloor, count);
        if (!solid) return;

        solid.position = restOnHorizontalPlane(
            solid.subtype,
            solid.size,
            solid.rotation,
            onFloor,
            solid.custom
        );

        const newId = state.addElement(solid);
        state.selectElement(newId);
        state.setActiveTool('none');
    };

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#0a0e1a' : '#f3f4f6';
    const gridSectionColor = isDark ? '#4b5563' : '#94a3b8';
    const gridCellColor = isDark ? '#1f2937' : '#cbd5e1';

    // Filter measurements with visualLine for 3D rendering
    const distanceMeasurements = measurements.filter(m => m.visualLine);

    return (
        <div
            className="w-full h-full relative"
            onPointerDownCapture={(e) => {
                pointerDown.current = { x: e.clientX, y: e.clientY };
            }}
        >
            <Canvas
                camera={{ position: [-30, 25, 30], fov: 50 }}
                shadows
                onCreated={(three) => {
                    r3f.current = three;
                }}
                onPointerMissed={handlePointerMissed}
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

                    {/* Grid (gira con el abatimiento) */}
                    <FoldingGrid sectionColor={gridSectionColor} cellColor={gridCellColor} />

                    {/* System Planes (Quadrants always visible, Bisectors toggleable) */}
                    <SystemPlanes showBisectors={showBisectors} />
                    <HingeLine />
                    {import.meta.env.DEV && <SceneProbe />}

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
                            case 'segment':
                                return <SegmentObject key={element.id} element={element as any} />;
                            case 'polygon':
                                return <PolygonObject key={element.id} element={element as any} />;
                            case 'mesh':
                                return <MeshObject key={element.id} element={element as any} />;
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
                            // @ts-ignore
                            labels={['X', 'Z', 'Y']}
                        />
                    </GizmoHelper>
                </Suspense>
            </Canvas>
            <Loader />
        </div>
    );
}
