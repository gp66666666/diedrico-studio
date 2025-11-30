import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Billboard, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { PointElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';
import AbatimientoArrow from './AbatimientoArrow';

interface Props {
    element: PointElement;
}

export default function PointObject({ element }: Props) {
    const { selectedElementId, selectElement, isFlattened, activeTool, selectForDistance } = useGeometryStore();
    const isSelected = selectedElementId === element.id;

    const groupHRef = useRef<THREE.Group>(null);
    const object3DRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
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

    const { coords, color, name } = element;

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
            {/* --- 3D Element (Sphere) --- */}
            <group ref={object3DRef}>
                <Sphere position={[coords.x, coords.y, coords.z]} args={[isSelected ? 0.3 : 0.2]}>
                    <meshStandardMaterial
                        color={isSelected ? '#ffff00' : color}
                        emissive={isSelected ? '#ffff00' : '#000000'}
                        emissiveIntensity={isSelected ? 0.5 : 0}
                    />
                </Sphere>
                <Billboard position={[coords.x, coords.y + 0.5, coords.z]}>
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
                </Billboard>

                {/* Projection Lines (3D) - Dashed and subtle */}
                <Line
                    points={[[coords.x, coords.y, coords.z], [coords.x, 0, coords.z]]}
                    color={color}
                    opacity={0.3}
                    transparent
                    dashed
                    dashScale={2}
                    gapSize={1}
                />
                <Line
                    points={[[coords.x, coords.y, coords.z], [coords.x, coords.y, 0]]}
                    color={color}
                    opacity={0.3}
                    transparent
                    dashed
                    dashScale={2}
                    gapSize={1}
                />
            </group>

            {/* --- Vertical Projection (P'') - Static --- */}
            <group position={[coords.x, 0, coords.z]}>
                <Sphere args={[0.08]}>
                    <meshBasicMaterial color={color} opacity={0.7} transparent />
                </Sphere>
                <Billboard position={[0, 0.3, 0]}>
                    <Text fontSize={0.35} color={color} outlineWidth={0.02} outlineColor="#000000" fillOpacity={0.8}>
                        {name}''
                    </Text>
                </Billboard>
                {/* Line to LT */}
                <Line
                    points={[[0, 0, 0], [0, 0, -coords.z]]} // Relative to group position
                    color={color}
                    opacity={0.2}
                    transparent
                    dashed
                />
            </group>

            {/* --- Horizontal Projection (P') - Rotates --- */}
            <group ref={groupHRef}>
                <group position={[coords.x, coords.y, 0]}>
                    <Sphere args={[0.08]}>
                        <meshBasicMaterial color={color} opacity={0.7} transparent />
                    </Sphere>
                    <Billboard position={[0, 0, 0.3]}>
                        <Text fontSize={0.35} color={color} outlineWidth={0.02} outlineColor="#000000" fillOpacity={0.8}>
                            {name}'
                        </Text>
                    </Billboard>
                    {/* Line to LT */}
                    <Line
                        points={[[0, 0, 0], [0, -coords.y, 0]]} // Relative to group position
                        color={color}
                        opacity={0.2}
                        transparent
                        dashed
                    />
                </group>
            </group>

            {/* --- Flattening Arrow --- */}
            <AbatimientoArrow x={coords.x} radius={coords.y} color={color} />
        </group>
    );
}
