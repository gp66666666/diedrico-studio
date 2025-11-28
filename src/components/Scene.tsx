import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useGeometryStore } from '../store/geometryStore';
import PointObject from './3D/PointObject';
import LineObject from './3D/LineObject';
import PlaneObject from './3D/PlaneObject';
import IntersectionsRenderer from './3D/IntersectionsRenderer';
import SystemPlanes from './3D/SystemPlanes';

export default function Scene() {
    const { elements, selectElement, showSystemPlanes, theme } = useGeometryStore();

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#0a0e1a' : '#f3f4f6';
    const gridSectionColor = isDark ? '#4b5563' : '#d1d5db';
    const gridCellColor = isDark ? '#1f2937' : '#e5e7eb';

    return (
        <div className="w-full h-full">
            <Canvas
                camera={{ position: [12, 10, 12], fov: 50 }}
                shadows
                onPointerMissed={() => selectElement(null)}
            >
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

                {/* Axes */}
                <axesHelper args={[8]} />

                {/* System Planes (Quadrants/Bisectors) */}
                {showSystemPlanes && <SystemPlanes />}

                {/* Render all geometry elements */}
                {elements.map((element) => {
                    switch (element.type) {
                        case 'point':
                            return <PointObject key={element.id} element={element} />;
                        case 'line':
                            return <LineObject key={element.id} element={element} />;
                        case 'plane':
                            return <PlaneObject key={element.id} element={element} />;
                        default:
                            return null;
                    }
                })}

                {/* Render Intersections */}
                <IntersectionsRenderer />

                {/* Camera controls */}
                <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

                {/* Gizmo for orientation */}
                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                    <GizmoViewport
                        axisColors={['#ef4444', '#10b981', '#3b82f6']}
                        labelColor="white"
                    />
                </GizmoHelper>
            </Canvas>
        </div>
    );
}
