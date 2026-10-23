import { useEffect, useMemo, useRef } from 'react';
import type { SolidElement } from '../../types';
import * as THREE from 'three';
import { useThree, type ThreeEvent } from '@react-three/fiber';
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
 *
 * Se puede arrastrar con el ratón: el puntero se proyecta sobre un plano
 * horizontal a la altura del centro, así que el sólido se desliza manteniendo
 * la cota (si estaba apoyado en el PH, sigue apoyado).
 */
export default function SolidObject({ element }: SolidObjectProps) {
    const { selectElement, selectedElementId, updateElementLive, startGesture, endGesture } = useGeometryStore();
    const { id, subtype, position, size, color, opacity = 0.5 } = element;
    const isSelected = selectedElementId === id;

    const { camera, gl, controls } = useThree();

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

    /** Punto del plano horizontal (three Y = cota) bajo el puntero. */
    const hitOnHeight = (clientX: number, clientY: number, plane: THREE.Plane) => {
        const rect = gl.domElement.getBoundingClientRect();
        const ndc = new THREE.Vector2(
            ((clientX - rect.left) / rect.width) * 2 - 1,
            -((clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(ndc, camera);
        const hit = new THREE.Vector3();
        return raycaster.ray.intersectPlane(plane, hit) ? hit : null;
    };

    const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        selectElement(id);

        // Plano a la altura del centro del sólido (three Y = cota del store)
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -position.z);
        const start = hitOnHeight(event.nativeEvent.clientX, event.nativeEvent.clientY, plane);
        if (!start) return;

        // Distancia entre el punto agarrado y el centro: el sólido no salta
        const offsetX = position.x - start.x;
        const offsetY = position.y - start.z;
        const cota = position.z;
        const canvas = gl.domElement;
        const pointerId = event.pointerId;

        let moved = false;
        if (controls) (controls as any).enabled = false;
        canvas.style.cursor = 'grabbing';
        try {
            canvas.setPointerCapture(pointerId);
        } catch {
            // sin captura el arrastre sigue funcionando mientras el puntero siga encima
        }

        const onMove = (e: PointerEvent) => {
            const hit = hitOnHeight(e.clientX, e.clientY, plane);
            if (!hit) return;
            // La foto para Deshacer se toma en el primer movimiento real
            if (!moved) {
                moved = true;
                startGesture();
            }
            updateElementLive(id, {
                position: { x: hit.x + offsetX, y: hit.z + offsetY, z: cota },
            });
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            // Solo apunta un paso de Deshacer si de verdad se ha movido
            if (moved) endGesture();
            if (controls) (controls as any).enabled = true;
            canvas.style.cursor = '';
            try {
                canvas.releasePointerCapture(pointerId);
            } catch {
                // nada que liberar
            }
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    return (
        <group position={pos} rotation={rot}>
            <mesh
                geometry={geometry}
                onPointerDown={handlePointerDown}
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
