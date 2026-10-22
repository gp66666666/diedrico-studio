import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { flattenProgress } from '../../lib/flattenAnimation';

interface Props {
    x: number; // Posición en X (Línea de Tierra)
    radius: number; // Radio del arco (Alejamiento 'y')
    color: string;
}

const SEGMENTS = 24;

/**
 * Arco del abatimiento: el camino que recorre la proyección horizontal al girar
 * sobre la línea de tierra, con un punto que va marcando por dónde pasa.
 *
 * Antes el arco aparecía de golpe y se quedaba quieto; el alumno veía un dibujo
 * terminado sin ver el movimiento. Ahora acompaña al giro: se dibuja, el punto
 * viaja pegado a la proyección y al final queda la flecha marcando dónde cae.
 */
export default function AbatimientoArrow({ x, radius, color }: Props) {
    const groupRef = useRef<THREE.Group>(null);
    const arcRef = useRef<any>(null);
    const markerRef = useRef<THREE.Mesh>(null);

    // Arco de 90°: del suelo (alejamiento = radius) al plano vertical (cota = -radius).
    const points = useMemo(() => {
        const pts: THREE.Vector3[] = [];
        if (Math.abs(radius) < 0.1) return pts;
        for (let i = 0; i <= SEGMENTS; i++) {
            const theta = (i / SEGMENTS) * (Math.PI / 2);
            pts.push(new THREE.Vector3(x, -radius * Math.sin(theta), radius * Math.cos(theta)));
        }
        return pts;
    }, [x, radius]);

    useFrame(() => {
        if (Math.abs(radius) < 0.1) return;
        const p = flattenProgress();

        if (groupRef.current) groupRef.current.visible = p > 0.002;
        if (p <= 0.002) return;

        // El arco se va dibujando conforme avanza el giro.
        const material = arcRef.current?.material;
        if (material) material.opacity = 0.12 + 0.28 * Math.min(1, p * 4);

        if (markerRef.current) {
            const theta = (p * Math.PI) / 2;
            markerRef.current.position.set(x, -radius * Math.sin(theta), radius * Math.cos(theta));
            markerRef.current.visible = p > 0.01 && p < 0.985;
        }
    });

    if (Math.abs(radius) < 0.1) return null;

    return (
        <group ref={groupRef} visible={false}>
            <Line
                ref={arcRef}
                points={points}
                color={color}
                opacity={0.3}
                transparent
                lineWidth={1}
                dashed
                dashScale={0.5}
                gapSize={0.5}
            />
            {/* Punto que viaja sobre el arco: marca el giro en cada instante */}
            <mesh ref={markerRef}>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshBasicMaterial color={color} transparent opacity={0.9} />
            </mesh>
            {/* Flecha final, tangente al arco: indica dónde cae la proyección */}
            <mesh position={[x, -radius, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.07, 0.22, 8]} />
                <meshBasicMaterial color={color} opacity={0.5} transparent />
            </mesh>
        </group>
    );
}
