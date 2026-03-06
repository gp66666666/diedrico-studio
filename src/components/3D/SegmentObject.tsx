import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Billboard, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { SegmentElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';

interface Props {
    element: SegmentElement;
}

export default function SegmentObject({ element }: Props) {
    const { selectedElementId, selectElement, isFlattened, activeTool, selectForDistance } = useGeometryStore();
    const isSelected = selectedElementId === element.id;

    const groupHRef = useRef<THREE.Group>(null);
    const object3DRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        const targetRot = isFlattened ? Math.PI / 2 : 0;
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

    const { p1, p2, color, name } = element;

    const point1 = new THREE.Vector3(p1.x, p1.z, p1.y);
    const point2 = new THREE.Vector3(p2.x, p2.z, p2.y);
    const center = point1.clone().add(point2).multiplyScalar(0.5);

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
            {/* --- 3D Segment --- */}
            <group ref={object3DRef}>
                <Line
                    points={[point1, point2]}
                    color={isSelected ? '#ffff00' : color}
                    lineWidth={isSelected ? 4 : 3}
                />
                {/* Endpoints */}
                <Sphere position={point1} args={[0.1]}><meshStandardMaterial color={color} /></Sphere>
                <Sphere position={point2} args={[0.1]}><meshStandardMaterial color={color} /></Sphere>

                <Billboard position={[center.x, center.y + 0.5, center.z]}>
                    <Text
                        fontSize={0.5}
                        color={isSelected ? '#ffff00' : 'white'}
                        outlineWidth={0.05}
                        outlineColor="#000000"
                    >
                        {name}
                    </Text>
                </Billboard>
            </group>

            {/* --- Vertical Projection (s'') --- */}
            <group>
                <Line
                    points={[
                        [point1.x, point1.y, 0],
                        [point2.x, point2.y, 0]
                    ]}
                    color={color}
                    lineWidth={2}
                    opacity={0.6}
                    transparent
                />
                <Billboard position={[center.x, center.y + 0.3, 0]}>
                    <Text fontSize={0.35} color={color} outlineWidth={0.02} outlineColor="#000000" fillOpacity={0.8}>
                        {name}''
                    </Text>
                </Billboard>
            </group>

            {/* --- Horizontal Projection (s') --- */}
            <group ref={groupHRef}>
                <Line
                    points={[
                        [point1.x, 0, point1.z],
                        [point2.x, 0, point2.z]
                    ]}
                    color={color}
                    lineWidth={2}
                    opacity={0.6}
                    transparent
                />
                <Billboard position={[center.x, 0, center.z + 0.3]}>
                    <Text fontSize={0.35} color={color} outlineWidth={0.02} outlineColor="#000000" fillOpacity={0.8}>
                        {name}'
                    </Text>
                </Billboard>
            </group>
        </group>
    );
}
