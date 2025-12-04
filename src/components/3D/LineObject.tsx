import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Billboard, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { LineElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';
import { calculateLineTraces } from '../../utils/mathUtils';
import AbatimientoArrow from './AbatimientoArrow';

interface Props {
    element: LineElement;
}

export default function LineObject({ element }: Props) {
    const { selectedElementId, selectElement, isFlattened, activeTool, selectForDistance } = useGeometryStore();
    const isSelected = selectedElementId === element.id;

    const groupHRef = useRef<THREE.Group>(null);
    const object3DRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        const targetRot = isFlattened ? -Math.PI / 2 : 0;
        const targetScale = isFlattened ? 0 : 1;

        if (groupHRef.current) {
            groupHRef.current.rotation.x = THREE.MathUtils.lerp(groupHRef.current.rotation.x, targetRot, delta * 4);
        }
        if (object3DRef.current) {
            const currentScale = object3DRef.current.scale.x; // Uniform scale assumed
            const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 4);
            object3DRef.current.scale.setScalar(newScale);
        }
    });

    if (!element.visible) return null;

    const { point, direction, color, name } = element;

    let p1: THREE.Vector3;
    let p2: THREE.Vector3;
    let lineDirection: THREE.Vector3;
    let lineCenter: THREE.Vector3;

    if (element.p2) {
        // Line defined by two points
        p1 = new THREE.Vector3(point.x, point.y, point.z);
        p2 = new THREE.Vector3(element.p2.x, element.p2.y, element.p2.z);
        lineDirection = p2.clone().sub(p1).normalize();
        lineCenter = p1.clone().add(p2).multiplyScalar(0.5);
    } else {
        // Line defined by a point and a direction (infinite line representation)
        const length = 20; // Arbitrary length for visualization
        p1 = new THREE.Vector3(point.x - direction.x * length, point.y - direction.y * length, point.z - direction.z * length);
        p2 = new THREE.Vector3(point.x + direction.x * length, point.y + direction.y * length, point.z + direction.z * length);
        lineDirection = new THREE.Vector3(direction.x, direction.y, direction.z);
        lineCenter = new THREE.Vector3(point.x, point.y, point.z);
    }

    const traces = calculateLineTraces(lineCenter, lineDirection);

    return (
        <group
            onClick={(e) => {
                e.stopPropagation();
                if (activeTool !== 'none') {
                    selectForDistance(element.id);
                } else {
                    selectElement(element.id);
                }
            }}
        >
            {/* --- Defining Points (if created by 2 points) --- */}
            {element.p2 && (
                <>
                    <DefiningPoint coords={point} color={color} />
                    <DefiningPoint coords={element.p2} color={color} />
                </>
            )}

            {/* --- 3D Line --- */}
            <group ref={object3DRef}>
                <Line
                    points={[p1, p2]}
                    color={isSelected ? '#ffff00' : color}
                    lineWidth={isSelected ? 3 : 2}
                    dashed={element.dashed}
                    dashScale={2}
                    gapSize={1}
                />
                <Billboard position={[point.x, point.y + 0.5, point.z]}>
                    {!name.startsWith('proc_') && (
                        <Text
                            fontSize={isSelected ? 0.8 : 0.5}
                            color={isSelected ? '#ffff00' : 'white'}
                            anchorX="center"
                            anchorY="middle"
                            outlineWidth={0.05}
                            outlineColor="#000000"
                        >
                            {name}
                        </Text>
                    )}
                </Billboard>

                {/* Traces Markers in 3D */}
                {traces.hTrace && (
                    <Sphere position={[traces.hTrace.x, traces.hTrace.y, traces.hTrace.z]} args={[0.15]}>
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                    </Sphere>
                )}
                {traces.vTrace && (
                    <Sphere position={[traces.vTrace.x, traces.vTrace.y, traces.vTrace.z]} args={[0.15]}>
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                    </Sphere>
                )}
            </group>

            {/* --- Vertical Projection (r'') - Static --- */}
            <group>
                <Line
                    points={[
                        [p1.x, 0, p1.z],
                        [p2.x, 0, p2.z]
                    ]}
                    color={color}
                    lineWidth={1.5}
                    dashed
                    dashScale={2}
                    gapSize={1}
                    opacity={0.6}
                    transparent
                />
                <Billboard position={[point.x, 0.5, point.z]}>
                    <Text fontSize={0.4} color={color} outlineWidth={0.02} outlineColor="#000000" fillOpacity={0.8}>
                        {name}''
                    </Text>
                </Billboard>

                {/* Vertical Trace Projection (v'') on Wall */}
                {traces.vTrace && (
                    <group position={[traces.vTrace.x, 0, traces.vTrace.z]}>
                        <Sphere args={[0.1]}><meshBasicMaterial color={color} opacity={0.7} transparent /></Sphere>
                        <Billboard position={[0, 0.3, 0]}><Text fontSize={0.4} color={color}>V''</Text></Billboard>
                    </group>
                )}
                {/* Horizontal Trace Projection (h'') on LT */}
                {traces.hTrace && (
                    <group position={[traces.hTrace.x, 0, 0]}>
                        <Sphere args={[0.08]}><meshBasicMaterial color={color} opacity={0.7} transparent /></Sphere>
                        <Billboard position={[0, -0.3, 0]}><Text fontSize={0.3} color={color}>h''</Text></Billboard>
                    </group>
                )}
            </group>

            {/* --- Horizontal Projection (r') - Rotates --- */}
            <group ref={groupHRef}>
                <Line
                    points={[
                        [p1.x, p1.y, 0],
                        [p2.x, p2.y, 0]
                    ]}
                    color={color}
                    lineWidth={1.5}
                    dashed
                    dashScale={2}
                    gapSize={1}
                    opacity={0.6}
                    transparent
                />
                <Billboard position={[point.x, point.y, 0.3]}>
                    <Text fontSize={0.4} color={color} outlineWidth={0.02} outlineColor="#000000" fillOpacity={0.8}>
                        {name}'
                    </Text>
                </Billboard>

                {/* Horizontal Trace Projection (h') on Floor */}
                {traces.hTrace && (
                    <group position={[traces.hTrace.x, traces.hTrace.y, 0]}>
                        <Sphere args={[0.1]}><meshBasicMaterial color={color} opacity={0.7} transparent /></Sphere>
                        <Billboard position={[0, 0, 0.3]}><Text fontSize={0.4} color={color}>H'</Text></Billboard>
                    </group>
                )}
                {/* Vertical Trace Projection (v') on LT */}
                {traces.vTrace && (
                    <group position={[traces.vTrace.x, 0, 0]}>
                        <Sphere args={[0.08]}><meshBasicMaterial color={color} opacity={0.7} transparent /></Sphere>
                        <Billboard position={[0, 0, 0.3]}><Text fontSize={0.3} color={color}>v'</Text></Billboard>
                    </group>
                )}
            </group>

            {/* --- Flattening Arrows --- */}
            {/* Show arrow at the reference point */}
            <AbatimientoArrow x={point.x} radius={point.y} color={color} />

            {/* Show arrow at traces if they exist */}
            {traces.hTrace && <AbatimientoArrow x={traces.hTrace.x} radius={traces.hTrace.y} color={color} />}
        </group>
    );
}

function DefiningPoint({ coords, color }: { coords: { x: number, y: number, z: number }, color: string }) {
    const { isFlattened } = useGeometryStore();
    const groupHRef = useRef<THREE.Group>(null);
    const object3DRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        const targetRot = isFlattened ? -Math.PI / 2 : 0;
        const targetScale = isFlattened ? 0 : 1;

        if (groupHRef.current) {
            groupHRef.current.rotation.x = THREE.MathUtils.lerp(groupHRef.current.rotation.x, targetRot, delta * 4);
        }
        if (object3DRef.current) {
            const currentScale = object3DRef.current.scale.x;
            const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 4);
            object3DRef.current.scale.setScalar(newScale);
        }
    });

    return (
        <group>
            {/* 3D Sphere */}
            <group ref={object3DRef} position={[coords.x, coords.y, coords.z]}>
                <Sphere args={[0.12]}>
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
                </Sphere>
            </group>

            {/* Vertical Proj */}
            <group position={[coords.x, 0, coords.z]}>
                <Sphere args={[0.06]}>
                    <meshBasicMaterial color={color} opacity={0.8} transparent />
                </Sphere>
            </group>

            {/* Horizontal Proj */}
            <group ref={groupHRef}>
                <group position={[coords.x, coords.y, 0]}>
                    <Sphere args={[0.06]}>
                        <meshBasicMaterial color={color} opacity={0.8} transparent />
                    </Sphere>
                </group>
            </group>
        </group>
    );
}
