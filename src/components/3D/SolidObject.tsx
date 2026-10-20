import { useEffect, useMemo } from 'react';
import type { SolidElement } from '../../types';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { useGeometryStore } from '../../store/geometryStore';
import { buildSolidMesh } from '../../lib/solidGeometry';

interface SolidObjectProps {
    element: SolidElement;
}

/**
 * Sólido en 3D.
 *
 * La malla viene de `lib/solidGeometry`, la MISMA que usa la vista diédrica.
 * Así el 3D y el 2D no pueden representar formas distintas.
 *
 * Ejes: el store usa z como altura; Three usa Y como altura.
 * Por eso posición (x, y, z) → (x, z, y) y la rotación (rx, ry, rz) → [rx, rz, ry].
 */
export default function SolidObject({ element }: SolidObjectProps) {
    const { selectElement, selectedElementId } = useGeometryStore();
    const { id, subtype, position, size, color, opacity = 0.5 } = element;
    const isSelected = selectedElementId === id;

    const pos: [number, number, number] = [position.x, position.z, position.y];

    const rot: [number, number, number] = element.rotation
        ? [element.rotation.x, element.rotation.z, element.rotation.y]
        : [0, 0, 0];

    // Malla compartida con la vista 2D (coordenadas locales del store)
    const geometry = useMemo(() => {
        const mesh = buildSolidMesh(subtype, size);
        const positions: number[] = [];

        mesh.faces.forEach((face) => {
            // Abanico desde el primer vértice (las caras son convexas)
            for (let i = 1; i < face.length - 1; i++) {
                [face[0], face[i], face[i + 1]].forEach((index) => {
                    const v = mesh.vertices[index];
                    // store (x, y, z) → three (x, z, y)
                    positions.push(v.x, v.z, v.y);
                });
            }
        });

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.computeVertexNormals();
        return geo;
    }, [subtype, size.x, size.y, size.z]);

    // Liberar la geometría anterior al cambiar de forma o desmontar
    useEffect(() => () => geometry.dispose(), [geometry]);

    return (
        <group position={pos} rotation={rot}>
            <mesh
                geometry={geometry}
                onClick={(e) => {
                    e.stopPropagation();
                    selectElement(id);
                }}
            >
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                    roughness={0.1}
                    metalness={0.1}
                />
                <Edges color="white" threshold={15} />
            </mesh>
        </group>
    );
}
