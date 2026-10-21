import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { PolygonElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';

/**
 * Polígono 3D: se usa para la sección de un sólido por un plano.
 * Se rellena en translúcido y se dibuja el contorno cerrado.
 */
export default function PolygonObject({ element }: { element: PolygonElement }) {
    const { selectedElementId, selectElement, activeTool, selectForDistance } = useGeometryStore();
    const isSelected = selectedElementId === element.id;

    const geometry = useMemo(() => {
        if (element.points.length < 3) return null;

        const positions: number[] = [];
        const toThree = (p: { x: number; y: number; z: number }) => [p.x, p.z, p.y];
        const first = toThree(element.points[0]);

        for (let i = 1; i < element.points.length - 1; i++) {
            const b = toThree(element.points[i]);
            const c = toThree(element.points[i + 1]);
            positions.push(...first, ...b, ...c);
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.computeVertexNormals();
        return geom;
    }, [element.points]);

    const outline = useMemo(
        () => element.points.map((p) => [p.x, p.z, p.y] as [number, number, number]),
        [element.points]
    );

    if (outline.length < 3) return null;

    return (
        <group
            onClick={(e) => {
                e.stopPropagation();
                if (activeTool && activeTool !== 'none') selectForDistance(element.id);
                else selectElement(element.id);
            }}
        >
            {geometry && (
                <mesh geometry={geometry}>
                    <meshBasicMaterial
                        color={element.color}
                        transparent
                        opacity={element.opacity ?? 0.45}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            )}
            <Line
                points={[...outline, outline[0]]}
                color={isSelected ? '#3b82f6' : element.color}
                lineWidth={isSelected ? 3 : 2}
            />
        </group>
    );
}
