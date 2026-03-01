import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '../../store/geometryStore';

interface Props {
    x: number; // Posición en X (Línea de Tierra)
    radius: number; // Radio del arco (Alejamiento 'y')
    color: string;
}

export default function AbatimientoArrow({ x, radius, color }: Props) {
    const { isFlattened } = useGeometryStore();

    // Crear puntos para el arco de 90 grados
    const points = useMemo(() => {
        const pts = [];
        const segments = 20;
        // Si el radio es casi cero, no generamos puntos
        if (Math.abs(radius) < 0.1) return [];

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * (Math.PI / 2); // 0 a 90 grados
            // In our new mapping: 
            // - Diedrico Z (Cota) is THREE Y
            // - Diedrico Y (Alejamiento) is THREE Z
            // Abatimiento rotates from Floor (Z=radius, Y=0) to Wall (Z=0, Y=-radius)
            // y = -radius * sin(theta)
            // z = radius * cos(theta)
            pts.push(new THREE.Vector3(x, -radius * Math.sin(theta), radius * Math.cos(theta)));
        }
        return pts;
    }, [x, radius]);

    if (!isFlattened || Math.abs(radius) < 0.1) return null;

    return (
        <group>
            <Line
                points={points}
                color={color}
                opacity={0.3}
                transparent
                lineWidth={1}
                dashed
                dashScale={0.5}
                gapSize={0.5}
            />
            {/* Punta de flecha al final del arco */}
            <mesh
                position={[x, -radius, 0]}
                rotation={[0, 0, radius > 0 ? 0 : Math.PI]}
            >
                <coneGeometry args={[0.08, 0.2, 8]} />
                <meshBasicMaterial color={color} opacity={0.5} transparent />
            </mesh>
        </group>
    );
}
