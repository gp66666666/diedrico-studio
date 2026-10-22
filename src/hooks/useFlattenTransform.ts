import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { flattenProgress, smoothstep } from '../lib/flattenAnimation';

/**
 * Giro de abatimiento compartido por todos los objetos de la escena.
 *
 * - `groupHRef` es el grupo que contiene la proyección horizontal: gira sobre la
 *   línea de tierra (el eje X que pasa por y = 0, z = 0) hasta quedarse en el
 *   plano vertical. Es la bisagra de verdad, no un truco de opacidad.
 * - `object3DRef` es el objeto en el espacio. Se retira en la segunda mitad del
 *   giro, cuando la proyección ya está cayendo: si desaparece al principio, el
 *   alumno pierde la referencia y no entiende de dónde sale el dibujo.
 */
export function useFlattenTransform(
    groupHRef: { current: THREE.Group | null },
    object3DRef: { current: THREE.Group | null },
) {
    useFrame(() => {
        const p = flattenProgress();

        if (groupHRef.current) {
            groupHRef.current.rotation.x = (p * Math.PI) / 2;
        }

        if (object3DRef.current) {
            const scale = 1 - smoothstep(0.35, 1, p);
            object3DRef.current.scale.setScalar(Math.max(scale, 0.0001));
            object3DRef.current.visible = scale > 0.01;
        }
    });
}
