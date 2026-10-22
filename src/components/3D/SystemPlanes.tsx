import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGeometryStore } from '../../store/geometryStore';
import { flattenProgress } from '../../lib/flattenAnimation';

export default function SystemPlanes({ showBisectors }: { showBisectors: boolean }) {
    const { theme } = useGeometryStore();
    // El plano horizontal es una hoja: al abatir gira sobre la línea de tierra
    // hasta pegarse al plano vertical. Si se queda quieto mientras las
    // proyecciones suben, el alumno ve puntos que se despegan de la nada.
    const floorRef = useRef<THREE.Group>(null);
    const labelsRef = useRef<THREE.Group>(null);

    useFrame(() => {
        const p = flattenProgress();
        if (floorRef.current) floorRef.current.rotation.x = (p * Math.PI) / 2;
        // Los nombres de los cuadrantes son una ayuda del espacio 3D: al abatir
        // sobran y tapan el dibujo.
        if (labelsRef.current) labelsRef.current.visible = p < 0.02;
    });
    const isDark = theme === 'dark';

    const size = 40;
    // Dark Mode: White/Light gray planes
    // Light Mode: Purple planes
    // En claro, un plano violeta al 25% sobre fondo gris dejaba todo lavado.
    const opacity = isDark ? 0.15 : 0.10;
    const planeColor = isDark ? "#e5e7eb" : "#334155";
    const gridColor = isDark ? "white" : "#0f172a";
    const bisectorOpacity = 0.15;

    return (
        <group>
            {/* --- Projection Planes Extensions (Quadrants) --- */}

            {/* Horizontal Plane (XY) - Ground */}
            {/* Already partially covered by grid, but let's make it explicit for negative quadrants */}
            {/* Horizontal Plane (XY) - Ground */}
            {/* Offset slightly to avoid Z-fighting with the grid */}
            <group ref={floorRef}>
                <Plane args={[size, size]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                    <meshBasicMaterial color={planeColor} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
                </Plane>
            </group>

            {/* Vertical Plane (XZ) - Wall */}
            {/* We need to visualize the negative part (below ground) too */}
            {/* Vertical Plane (XZ) - Wall */}
            {/* Offset slightly to avoid Z-fighting */}
            <Plane args={[size, size]} position={[0, 0, -0.02]}>
                <meshBasicMaterial color={planeColor} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
            </Plane>


            {/* --- Bisectors --- */}
            {showBisectors && (
                <>
                    {/* First Bisector (y = z) - Passes through 1st and 3rd Quadrants */}
                    {/* Rotated 45 degrees around X axis */}
                    <group rotation={[Math.PI / 4, 0, 0]}>
                        <Plane args={[size, size]}>
                            <meshBasicMaterial color="#f97316" transparent opacity={bisectorOpacity} side={THREE.DoubleSide} depthWrite={false} />
                        </Plane>
                        {/* Label */}
                        <Text position={[size / 2 - 2, 2, 0]} fontSize={0.8} color="#f97316" anchorX="right">
                            1er Bisector
                        </Text>
                    </group>

                    {/* Second Bisector (y = -z) - Passes through 2nd and 4th Quadrants */}
                    {/* Rotated -45 degrees around X axis */}
                    <group rotation={[-Math.PI / 4, 0, 0]}>
                        <Plane args={[size, size]}>
                            <meshBasicMaterial color="#10b981" transparent opacity={bisectorOpacity} side={THREE.DoubleSide} depthWrite={false} />
                        </Plane>
                        {/* Label */}
                        <Text position={[size / 2 - 2, 2, 0]} fontSize={0.8} color="#10b981" anchorX="right">
                            2do Bisector
                        </Text>
                    </group>
                </>
            )}

            {/* --- Quadrant Labels --- */}
            <group ref={labelsRef}>
            <Text position={[5, 5, 5]} fontSize={1} color={gridColor} fillOpacity={isDark ? 0.5 : 0.6}>I Cuadrante</Text>
            <Text position={[5, 5, -5]} fontSize={1} color={gridColor} fillOpacity={isDark ? 0.5 : 0.6}>II Cuadrante</Text>
            <Text position={[5, -5, -5]} fontSize={1} color={gridColor} fillOpacity={isDark ? 0.5 : 0.6}>III Cuadrante</Text>
            <Text position={[5, -5, 5]} fontSize={1} color={gridColor} fillOpacity={isDark ? 0.5 : 0.6}>IV Cuadrante</Text>
            </group>

        </group>
    );
}
