import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '../../../store/geometryStore';
import PointObject from '../../../components/3D/PointObject';
import LineObject from '../../../components/3D/LineObject';
import PlaneObject from '../../../components/3D/PlaneObject';
import SystemPlanes from '../../../components/3D/SystemPlanes';

function CavalierCamera({ angle, reduction }: { angle: number, reduction: number }) {
    const { camera } = useThree();

    useEffect(() => {
        if (camera instanceof THREE.OrthographicCamera) {
            // Cavalier Projection Matrix Transformation
            // Standard Cavalier: Alpha = 45deg, Reduction = 0.5
            // The Z axis (in our coordinate system, which is Z-up) 
            // is projected onto the 2D plane with an angle.
            // In Three.js, we usually work with Y-up, but Scene.tsx maps our Z to Y.

            // Mapping:
            // Geo X -> Three X (Horizontal)
            // Geo Z -> Three Y (Up)
            // Geo Y -> Three Z (Receding)

            const alpha = (angle * Math.PI) / 180;
            const k = reduction;

            const shearMatrix = new THREE.Matrix4();
            // We shear the Z axis (Geo Y) onto the XY plane (Frontal XZ)
            shearMatrix.set(
                1, 0, Math.cos(alpha) * k, 0,
                0, 1, Math.sin(alpha) * k, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );

            camera.projectionMatrix.copy(new THREE.Matrix4().makeOrthographic(
                camera.left, camera.right, camera.top, camera.bottom, camera.near, camera.far
            ));
            camera.projectionMatrix.multiply(shearMatrix);
            camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
        }
    }, [camera, angle, reduction]);

    return null;
}

function SolidObject({ element }: { element: any }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { position, size, color } = element;

    // Technical drawing typically uses constant size blocks in these exercises
    const s = size || { x: 1, y: 1, z: 1 };

    return (
        <group position={[position.x, position.z, position.y]}>
            <mesh ref={meshRef}>
                <boxGeometry args={[s.x, s.z, s.y]} />
                <meshStandardMaterial color={color} transparent opacity={0.6} depthWrite={true} />
            </mesh>

            {/* Outline - Visible Edges */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(s.x, s.z, s.y)]} />
                <lineBasicMaterial color={color} linewidth={2} depthTest={true} />
            </lineSegments>

            {/* Outline - Hidden Edges (Dashed) */}
            <lineSegments>
                <edgesGeometry
                    args={[new THREE.BoxGeometry(s.x, s.z, s.y)]}
                    onUpdate={(self) => self.computeLineDistances()}
                />
                <lineDashedMaterial
                    color={color}
                    dashSize={0.2}
                    gapSize={0.1}
                    opacity={0.3}
                    transparent
                    depthTest={true}
                    depthFunc={THREE.GreaterEqualDepth}
                />
            </lineSegments>
        </group>
    );
}

function ConstructionRayos() {
    const { caballeraState } = useGeometryStore();
    if (caballeraState.step === 'idle') return null;

    const { x, y, z } = caballeraState.previewCoords;
    const points = [
        new THREE.Vector3(x, 0, y), // Shadow in Planta
        new THREE.Vector3(x, z, y), // Shadow in Alzado (actually 3D point)
        new THREE.Vector3(0, z, y), // Shadow in Perfil
    ];

    return (
        <group>
            {/* Projection Lines from 3D to Planes */}
            <line>
                <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([new THREE.Vector3(x, z, y), new THREE.Vector3(x, 0, y)])} />
                <lineDashedMaterial color="#f97316" dashSize={0.2} gapSize={0.1} transparent opacity={0.5} />
            </line>
            <line>
                <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([new THREE.Vector3(x, z, y), new THREE.Vector3(0, z, y)])} />
                <lineDashedMaterial color="#f97316" dashSize={0.2} gapSize={0.1} transparent opacity={0.5} />
            </line>
            {/* Active Cursor Dot */}
            <mesh position={[x, z, y]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color="#f97316" />
            </mesh>
        </group>
    );
}

function AxesLabels() {
    return (
        <group>
            {/* X Axis */}
            <line>
                <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0)])} />
                <lineBasicMaterial attach="material" color="#ef4444" />
            </line>
            <Text position={[11, 0, 0]} fontSize={0.5} color="#ef4444">X</Text>

            {/* Z Axis (Vertical) */}
            <line>
                <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, 0)])} />
                <lineBasicMaterial attach="material" color="#10b981" />
            </line>
            <Text position={[0, 11, 0]} fontSize={0.5} color="#10b981">Z</Text>

            {/* Y Axis (Receding) */}
            <line>
                <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 10)])} />
                <lineBasicMaterial attach="material" color="#3b82f6" />
            </line>
            <Text position={[0, 0.5, 11]} fontSize={0.5} color="#3b82f6">Y</Text>
        </group>
    );
}

export default function Cavalier3DView({ angle, reduction }: { angle: number, reduction: number }) {
    const { elements, theme } = useGeometryStore();
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#0a0e1a' : '#f3f4f6';

    return (
        <div className="w-full h-full">
            <Canvas
                orthographic
                camera={{ zoom: 40, position: [0, 0, 40] }}
                gl={{ preserveDrawingBuffer: true }}
            >
                <color attach="background" args={[bgColor]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 15, 10]} intensity={1.2} />

                {/* No standard system planes, only manual axes labels */}
                <AxesLabels />

                {elements.map((element) => {
                    switch (element.type) {
                        case 'point':
                            return <PointObject key={element.id} element={element} />;
                        case 'line':
                            return <LineObject key={element.id} element={element} />;
                        case 'solid':
                            return <SolidObject key={element.id} element={element} />;
                        default:
                            return null;
                    }
                })}

                <ConstructionRayos />

                <CavalierCamera angle={angle} reduction={reduction} />

                <OrbitControls makeDefault enableRotate={false} />
            </Canvas>
        </div>
    );
}
