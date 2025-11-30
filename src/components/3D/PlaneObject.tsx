import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Text, Billboard, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { PlaneElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';
import { calculatePlaneTraces } from '../../utils/mathUtils';
import AbatimientoArrow from './AbatimientoArrow';

interface Props {
    element: PlaneElement;
}

export default function PlaneObject({ element }: Props) {
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
            const currentScale = object3DRef.current.scale.x;
            const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 4);
            object3DRef.current.scale.setScalar(newScale);
        }
    });

    if (!element.visible) return null;

    const { normal, constant, color, name } = element;
    const { x: A, y: B, z: C } = normal;
    const D = constant;

    // Calculate rotation to align plane with normal
    const quaternion = new THREE.Quaternion();
    const defaultNormal = new THREE.Vector3(0, 0, 1);
    const targetNormal = new THREE.Vector3(A, B, C).normalize();
    quaternion.setFromUnitVectors(defaultNormal, targetNormal);

    // Calculate position (closest point to origin)
    const dist = -D / Math.sqrt(A * A + B * B + C * C);
    const position = targetNormal.clone().multiplyScalar(dist);

    const traces = calculatePlaneTraces(normal, constant);
    const traceLength = 20;

    // Calculate Arrow Position for Animation
    let arrowX = 0;
    let arrowY = 0;
    if (traces.hTrace) {
        if (Math.abs(B) > 1e-6) {
            // Try x=0
            arrowY = -D / B;
            // If too far, clamp x
            if (Math.abs(arrowY) > 8) {
                arrowX = 5;
                arrowY = (-D - 5 * A) / B;
            }
        } else {
            // Parallel to Y
            arrowX = -D / A;
            arrowY = 5;
        }
    }

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
            {/* --- 3D Plane (Wireframe) --- */}
            <group ref={object3DRef}>
                <Plane
                    args={[20, 20, 10, 10]} // 10x10 segments for wireframe
                    position={[position.x, position.y, position.z]}
                    quaternion={quaternion}
                >
                    <meshBasicMaterial
                        color={isSelected ? '#ffff00' : color}
                        wireframe={true}
                        transparent
                        opacity={0.3} // More subtle
                    />
                </Plane>
                {/* Invisible Hit Plane */}
                <Plane
                    args={[20, 20]}
                    position={[position.x, position.y, position.z]}
                    quaternion={quaternion}
                >
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.05}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </Plane>
                <Billboard position={[position.x, position.y + 2, position.z]}>
                    <Text
                        fontSize={isSelected ? 1 : 0.8}
                        color={isSelected ? '#ffff00' : 'white'}
                        outlineWidth={0.05}
                        outlineColor="#000000"
                    >
                        {name}
                    </Text>
                </Billboard>
            </group>

            {/* --- Vertical Trace (alpha'') - Static --- */}
            {traces.vTrace && (
                <group>
                    {/* If vertical trace is a line in XZ plane */}
                    {/* We need two points to draw it. 
                        Intersection with Z axis (x=0) and X axis (z=0)? 
                        Or just use the trace vector direction.
                        Equation: Ax + Cz + D = 0 (y=0)
                    */}
                    {Math.abs(C) > 1e-6 ? (
                        // z = (-D - Ax) / C
                        <Line
                            points={[
                                [-traceLength, 0, (-D - A * -traceLength) / C],
                                [traceLength, 0, (-D - A * traceLength) / C]
                            ]}
                            color={color}
                            lineWidth={1}
                            opacity={0.25}
                        />
                    ) : (
                        // Vertical line (x = -D/A)
                        <Line
                            points={[
                                [-D / A, 0, -traceLength],
                                [-D / A, 0, traceLength]
                            ]}
                            color={color}
                            lineWidth={1}
                            opacity={0.25}
                        />
                    )}

                    {/* Label Position */}
                    {Math.abs(C) > 1e-6 ? (
                        <Billboard position={[traceLength / 2, 0, (-D - A * traceLength / 2) / C + 1]}>
                            <Text fontSize={0.6} color={color} outlineWidth={0.05} outlineColor="#000000">{name}''</Text>
                        </Billboard>
                    ) : (
                        <Billboard position={[-D / A, 0, traceLength - 2]}>
                            <Text fontSize={0.6} color={color} outlineWidth={0.05} outlineColor="#000000">{name}''</Text>
                        </Billboard>
                    )}
                </group>
            )}

            {/* --- Horizontal Trace (alpha') - Rotates --- */}
            <group ref={groupHRef}>
                {traces.hTrace && (
                    <group>
                        {/* Equation: Ax + By + D = 0 (z=0) */}
                        {Math.abs(B) > 1e-6 ? (
                            // y = (-D - Ax) / B
                            <Line
                                points={[
                                    [-traceLength, (-D - A * -traceLength) / B, 0],
                                    [traceLength, (-D - A * traceLength) / B, 0]
                                ]}
                                color={color}
                                lineWidth={1}
                                opacity={0.25}
                            />
                        ) : (
                            // Line x = -D/A (Perpendicular to LT)
                            <Line
                                points={[
                                    [-D / A, -traceLength, 0],
                                    [-D / A, traceLength, 0]
                                ]}
                                color={color}
                                lineWidth={1}
                                opacity={0.25}
                            />
                        )}

                        {/* Label Position */}
                        {Math.abs(B) > 1e-6 ? (
                            <Billboard position={[traceLength / 2, (-D - A * traceLength / 2) / B, 0.5]}>
                                <Text fontSize={0.6} color={color} outlineWidth={0.05} outlineColor="#000000">{name}'</Text>
                            </Billboard>
                        ) : (
                            <Billboard position={[-D / A, traceLength - 2, 0.5]}>
                                <Text fontSize={0.6} color={color} outlineWidth={0.05} outlineColor="#000000">{name}'</Text>
                            </Billboard>
                        )}
                    </group>
                )}
            </group>

            {/* --- Flattening Arrow --- */}
            {traces.hTrace && <AbatimientoArrow x={arrowX} radius={arrowY} color={color} />}
        </group>
    );
}
