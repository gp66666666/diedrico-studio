import { useMemo } from 'react';
import * as THREE from 'three';
import type { MeshElement } from '../../types';
import { useGeometryStore } from '../../store/geometryStore';

/**
 * Malla de la intersección de dos sólidos.
 *
 * Se rellena en translúcido y se remarca la línea de intersección (las aristas
 * que separan una cara de un sólido de una cara del otro).
 */
export default function MeshObject({ element }: { element: MeshElement }) {
    const { selectedElementId, selectElement, activeTool, selectForDistance } = useGeometryStore();
    const isSelected = selectedElementId === element.id;

    const geometry = useMemo(() => {
        if (element.faces.length === 0) return null;
        const positions: number[] = [];
        element.faces.forEach((face) => {
            const a = element.vertices[face[0]];
            for (let i = 1; i < face.length - 1; i++) {
                const b = element.vertices[face[i]];
                const c = element.vertices[face[i + 1]];
                // Three usa Y como vertical: (x, y, z) del store → (x, z, y)
                positions.push(a.x, a.z, a.y, b.x, b.z, b.y, c.x, c.z, c.y);
            }
        });
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.computeVertexNormals();
        return geom;
    }, [element.faces, element.vertices]);

    const edges = useMemo(() => {
        // Si no hay cruce de superficies (un sólido dentro de otro), se dibuja
        // el contorno completo de la malla.
        const list = element.seam.length
            ? element.seam
            : element.faces.flatMap((face) =>
                  face.map((v, i) => [v, face[(i + 1) % face.length]] as [number, number])
              );

        const positions: number[] = [];
        list.forEach(([i, j]) => {
            const a = element.vertices[i];
            const b = element.vertices[j];
            if (!a || !b) return;
            positions.push(a.x, a.z, a.y, b.x, b.z, b.y);
        });

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return geom;
    }, [element.seam, element.faces, element.vertices]);

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
                        opacity={element.opacity ?? 0.3}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            )}
            <lineSegments geometry={edges}>
                <lineBasicMaterial color={isSelected ? '#3b82f6' : element.color} linewidth={2} />
            </lineSegments>
        </group>
    );
}
